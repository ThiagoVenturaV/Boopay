import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import { buildApp } from '../src/app';
import { CredentialService } from '../src/security/credentials';
import { signRequest } from '../src/security/signed-request';

const migrate = (url: string) => {
  const dbFile = url.slice(5);
  if (!existsSync(dbFile)) writeFileSync(dbFile, '');
  return execFileSync(
    process.execPath,
    [resolve('node_modules/prisma/build/index.js'), 'migrate', 'deploy'],
    { env: { ...process.env, DATABASE_URL: url }, stdio: 'pipe' }
  );
};

test('RB-068 Auditoria de Autorização, Isolamento Multitenant e Proteção de Dados', async (t) => {
  const dir = mkdtempSync(join(tmpdir(), 'boopay-audit-'));
  const dbPath = join(dir, 'audit.db').replace(/\\/g, '/');
  const url = `file:${dbPath}`;
  migrate(url);

  const db = new PrismaClient({ datasources: { db: { url } } });
  const adminToken = 'admintoken_'.padEnd(40, 'x');
  const credentialKey = 'a1'.repeat(32); // 64 hex chars = 32 bytes

  let capturedLogs = '';
  const logStream = {
    write(message: string) {
      capturedLogs += message;
    }
  };

  const { app, credentials } = buildApp({
    db,
    credentialKey,
    adminToken,
    logger: true,
    logStream
  });

  t.after(async () => {
    await app.close();
    await db.$disconnect();
    try {
      rmSync(dir, { recursive: true, force: true });
    } catch {
      // ignore
    }
  });

  // Setup: dois merchants em tenants distintos
  const merchantA = await db.merchant.create({
    data: {
      nome: 'Loja Alpha',
      razao_social: 'Alpha Comércio Ltda',
      email: 'contato@alpha.example',
      consumer_key: 'unused',
      consumer_secretHash: 'unused'
    }
  });

  const merchantB = await db.merchant.create({
    data: {
      nome: 'Loja Beta',
      razao_social: 'Beta Distribuidora Ltda',
      email: 'contato@beta.example',
      consumer_key: 'unused',
      consumer_secretHash: 'unused'
    }
  });

  // Emissão de código e troca de integração
  const codeA = await credentials.issueCode('tenant-alpha', merchantA.id, 'https://alpha.example');
  const integrationA = await credentials.exchange(codeA.code, 'https://alpha.example');

  const codeB = await credentials.issueCode('tenant-beta', merchantB.id, 'https://beta.example');
  const integrationB = await credentials.exchange(codeB.code, 'https://beta.example');

  // Operadores via Admin
  const adminApi = async (path: string, payload?: unknown) =>
    app.inject({
      method: payload === undefined ? 'GET' : 'POST',
      url: path,
      headers: { authorization: `Bearer ${adminToken}` },
      ...(payload === undefined ? {} : { payload })
    });

  const opAlpha = (
    await adminApi('/v1/admin/operators', {
      display_name: 'Operador Alpha',
      grants: [{ merchant_id: merchantA.id, role: 'writer' }]
    })
  ).json();

  const opBeta = (
    await adminApi('/v1/admin/operators', {
      display_name: 'Operador Beta',
      grants: [{ merchant_id: merchantB.id, role: 'reader' }]
    })
  ).json();

  await t.test('1. Isolamento Cross-Tenant de Operadores', async () => {
    // Operador Alpha não pode ler catálogo ou dados da Loja Beta
    const crossAccess = await app.inject({
      method: 'GET',
      url: `/v1/operator/stores/${merchantB.id}/catalog`,
      headers: { authorization: `Bearer ${opAlpha.token}` }
    });
    assert.equal(crossAccess.statusCode, 403, 'Acesso cruzado à loja B deve retornar 403');

    // Operador Beta não pode gerar códigos para Loja Alpha
    const crossCode = await app.inject({
      method: 'POST',
      url: `/v1/operator/stores/${merchantA.id}/connection-codes`,
      headers: { authorization: `Bearer ${opBeta.token}` },
      payload: { store_url: 'https://alpha.example' }
    });
    assert.equal(crossCode.statusCode, 403, 'Geração de código em outra loja deve ser proibida (403)');

    // Operador Alpha não pode forçar query parameter de outro tenant
    const crossTenantQuery = await app.inject({
      method: 'GET',
      url: `/v1/operator/stores?tenant_id=tenant-beta`,
      headers: { authorization: `Bearer ${opAlpha.token}` }
    });
    assert.equal(crossTenantQuery.statusCode, 400, 'Tentativa de consultar outro tenant deve falhar (400)');
  });

  await t.test('2. Proteção contra Tampering e Replay em Assinatura HMAC', async () => {
    const rawBody = Buffer.from(
      JSON.stringify({ version: 1, event_id: 'evt-001', merchant_id: merchantA.id, items: [] }),
      'utf8'
    );
    const nowSec = Math.floor(Date.now() / 1000);
    const nonce = randomBytes(16).toString('hex');
    const path = '/v1/admin/catalog/sync';

    const validSig = signRequest(
      integrationA.signing_secret,
      'POST',
      path,
      String(nowSec),
      nonce,
      rawBody
    );

    // Requisição válida de referência
    const validReq = await app.inject({
      method: 'POST',
      url: path,
      headers: {
        authorization: `Bearer ${integrationA.token}`,
        'x-boopay-timestamp': String(nowSec),
        'x-boopay-nonce': nonce,
        'x-boopay-signature': validSig,
        'x-boopay-tenant': integrationA.tenant_id,
        'x-boopay-integration': integrationA.integration_id,
        'content-type': 'application/json'
      },
      payload: rawBody
    });
    assert.equal(validReq.statusCode, 200, 'Requisição assinada legítima deve ser aceita');

    // 2.1 Replay attack com o mesmo nonce
    const replayReq = await app.inject({
      method: 'POST',
      url: path,
      headers: {
        authorization: `Bearer ${integrationA.token}`,
        'x-boopay-timestamp': String(nowSec),
        'x-boopay-nonce': nonce,
        'x-boopay-signature': validSig,
        'x-boopay-tenant': integrationA.tenant_id,
        'x-boopay-integration': integrationA.integration_id,
        'content-type': 'application/json'
      },
      payload: rawBody
    });
    assert.equal(replayReq.statusCode, 409, 'Replay de requisição deve retornar 409 Conflict');

    // 2.2 Tampering de payload (corpo adulterado com assinatura antiga)
    const tamperedBody = Buffer.from(
      JSON.stringify({ version: 1, event_id: 'evt-002', merchant_id: merchantB.id, items: [] }),
      'utf8'
    );
    const newNonce = randomBytes(16).toString('hex');
    const tamperedReq = await app.inject({
      method: 'POST',
      url: path,
      headers: {
        authorization: `Bearer ${integrationA.token}`,
        'x-boopay-timestamp': String(nowSec),
        'x-boopay-nonce': newNonce,
        'x-boopay-signature': validSig, // assinatura não confere com o novo body
        'x-boopay-tenant': integrationA.tenant_id,
        'x-boopay-integration': integrationA.integration_id,
        'content-type': 'application/json'
      },
      payload: tamperedBody
    });
    assert.equal(tamperedReq.statusCode, 401, 'Corpo adulterado deve retornar 401 invalid_signature');

    // 2.3 Timestamp expirado (> 300 segundos no passado)
    const expiredTimestamp = String(nowSec - 305);
    const expiredNonce = randomBytes(16).toString('hex');
    const expiredSig = signRequest(
      integrationA.signing_secret,
      'POST',
      path,
      expiredTimestamp,
      expiredNonce,
      rawBody
    );
    const expiredReq = await app.inject({
      method: 'POST',
      url: path,
      headers: {
        authorization: `Bearer ${integrationA.token}`,
        'x-boopay-timestamp': expiredTimestamp,
        'x-boopay-nonce': expiredNonce,
        'x-boopay-signature': expiredSig,
        'x-boopay-tenant': integrationA.tenant_id,
        'x-boopay-integration': integrationA.integration_id,
        'content-type': 'application/json'
      },
      payload: rawBody
    });
    assert.equal(expiredReq.statusCode, 401, 'Timestamp expirado (> 300s) deve retornar 401 expired_signature');

    // 2.4 Tenant Header mismatch (tentativa de impersonação de outro tenant com token de A)
    const mismatchNonce = randomBytes(16).toString('hex');
    const mismatchSig = signRequest(
      integrationA.signing_secret,
      'POST',
      path,
      String(nowSec),
      mismatchNonce,
      rawBody
    );
    const mismatchReq = await app.inject({
      method: 'POST',
      url: path,
      headers: {
        authorization: `Bearer ${integrationA.token}`,
        'x-boopay-timestamp': String(nowSec),
        'x-boopay-nonce': mismatchNonce,
        'x-boopay-signature': mismatchSig,
        'x-boopay-tenant': 'tenant-beta', // tenant forjado
        'x-boopay-integration': integrationA.integration_id,
        'content-type': 'application/json'
      },
      payload: rawBody
    });
    assert.equal(mismatchReq.statusCode, 403, 'Tenant header discrepante da credencial deve retornar 403 integration_mismatch');
  });

  await t.test('3. Revogação Imediata e Invalidamento de Código de Conexão', async () => {
    // Revoga a integração A
    await credentials.revoke(integrationA.token);

    // Qualquer nova requisição com o token revogado deve falhar
    await assert.rejects(
      credentials.authenticate(integrationA.token),
      { code: 'invalid_credentials' },
      'Token revogado não pode autenticar'
    );

    // Tentar reutilizar código de conexão já utilizado
    await assert.rejects(
      credentials.exchange(codeA.code, 'https://alpha.example'),
      { code: 'invalid_connection_code' },
      'Código de uso único já utilizado deve ser rejeitado'
    );
  });

  await t.test('4. Sanitização de Logs e Proteção contra Vazamento de Segredos', async () => {
    // Garante que o segredo de assinatura e as chaves privadas nunca foram emitidos nos logs
    assert.ok(
      !capturedLogs.includes(integrationA.signing_secret),
      'Log do servidor NÃO deve conter o signing_secret'
    );
    assert.ok(
      !capturedLogs.includes(integrationB.signing_secret),
      'Log do servidor NÃO deve conter o signing_secret de tenant B'
    );
    assert.ok(
      !capturedLogs.includes(credentialKey),
      'Log do servidor NÃO deve conter a chave mestra de criptografia'
    );
  });
});
