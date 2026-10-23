import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { PrismaClient } from '@prisma/client';
import { buildApp } from '../src/app';

test('MVP Checkout Conversacional: busca SSE, kit IA, fila de sacola idempotente, confirmação humana obrigatória e rastreio pós-venda', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'boopay-mvp-chat-'));
  const url = 'file:' + join(dir, 'test.db').replace(/\\/g, '/');
  writeFileSync(join(dir, 'test.db'), '');
  execFileSync(process.execPath, [resolve('node_modules/prisma/build/index.js'), 'migrate', 'deploy'], {
    env: { ...process.env, DATABASE_URL: url },
    stdio: 'pipe'
  });

  const db = new PrismaClient({ datasources: { db: { url } } });
  const { app } = buildApp({ db, credentialKey: '1'.repeat(64), adminToken: 'a'.repeat(40) });

  try {
    // 1. Session creation
    const sessRes = await app.inject({ method: 'GET', url: '/api/session' });
    assert.equal(sessRes.statusCode, 200);
    const sessData = sessRes.json();
    assert.ok(sessData.conversationId);
    const convId = sessData.conversationId as string;

    // 2. SSE Chat Stream: product search + idempotent replay on same requestId
    const streamRes1 = await app.inject({
      method: 'POST',
      url: '/api/chat/stream',
      payload: {
        conversationId: convId,
        requestId: 'req-turn-001',
        message: 'Quero um tênis de corrida leve'
      }
    });
    assert.equal(streamRes1.statusCode, 200);
    assert.ok(streamRes1.body.includes('event: ui'));
    assert.ok(streamRes1.body.includes('product_list'));
    assert.ok(streamRes1.body.includes('event: done'));

    const streamReplay = await app.inject({
      method: 'POST',
      url: '/api/chat/stream',
      payload: {
        conversationId: convId,
        requestId: 'req-turn-001',
        message: 'Quero um tênis de corrida leve'
      }
    });
    assert.ok(streamReplay.body.includes('"replayed":true'));

    // 3. Kit recommendation (`montarKitRecomendado`) via SSE
    const kitStream = await app.inject({
      method: 'POST',
      url: '/api/chat/stream',
      payload: {
        conversationId: convId,
        requestId: 'req-turn-002',
        message: 'Monte um combo para viagem de bordo'
      }
    });
    assert.equal(kitStream.statusCode, 200);
    assert.ok(kitStream.body.includes('kit_card'));

    // 4. Sequential Cart Mutation Idempotency (`cartQueue`)
    const mut1 = await app.inject({
      method: 'POST',
      url: '/api/cart',
      payload: {
        conversationId: convId,
        requestId: 'mut-001',
        action: 'add_bundle',
        bundleId: 'kit-viagem-smart'
      }
    });
    assert.equal(mut1.statusCode, 200);
    assert.equal(mut1.json().itemCount, 4);

    // Repeating same requestId must not duplicate items
    const mut1Dup = await app.inject({
      method: 'POST',
      url: '/api/cart',
      payload: {
        conversationId: convId,
        requestId: 'mut-001',
        action: 'add_bundle',
        bundleId: 'kit-viagem-smart'
      }
    });
    assert.equal(mut1Dup.json().itemCount, 4);

    // 5. Checkout Session 3 Steps + Mandatory Explicit Human Confirmation
    const openChk = await app.inject({
      method: 'POST',
      url: '/api/checkout/sessions',
      payload: { conversationId: convId, protocol: 'ucp', surface: 'boopay_sandbox' }
    });
    assert.equal(openChk.statusCode, 200);
    const checkoutSession = openChk.json();
    assert.equal(checkoutSession.status, 'ready_for_confirmation');

    // Step 1: Delivery update
    const delivRes = await app.inject({
      method: 'PUT',
      url: `/api/checkout/sessions/${checkoutSession.id}/delivery`,
      payload: {
        deliveryType: 'express',
        cep: '50030-230',
        address: {
          cep: '50030-230',
          logradouro: 'Rua do Apolo, 235',
          bairro: 'Recife',
          cidade: 'Recife',
          estado: 'PE'
        }
      }
    });
    assert.equal(delivRes.statusCode, 200);

    // Step 2: Payment selection
    const payRes = await app.inject({
      method: 'PUT',
      url: `/api/checkout/sessions/${checkoutSession.id}/payment`,
      payload: { paymentMethod: 'pix_sandbox' }
    });
    assert.equal(payRes.statusCode, 200);
    const updatedSession = payRes.json();

    // Reject completion without explicit human confirmation
    const rejectComplete = await app.inject({
      method: 'POST',
      url: `/api/checkout/sessions/${checkoutSession.id}/complete`,
      payload: { explicitConfirmation: false }
    });
    assert.equal(rejectComplete.statusCode, 400);
    assert.equal(rejectComplete.json().error, 'explicit_human_confirmation_required');

    // Accept completion with explicitConfirmation: true and valid quoteHash
    const completeRes = await app.inject({
      method: 'POST',
      url: `/api/checkout/sessions/${checkoutSession.id}/complete`,
      payload: {
        explicitConfirmation: true,
        quoteHash: updatedSession.quoteHash,
        termsVersion: 'v1.0-sandbox-2026'
      }
    });
    assert.equal(completeRes.statusCode, 200);
    const completed = completeRes.json();
    assert.equal(completed.session.status, 'completed');
    assert.equal(completed.order.status, 'CONFIRMADO');
    assert.equal(completed.order.quoteHash, updatedSession.quoteHash);

    // 6. Post-sale order status evolution
    const adv1 = await app.inject({
      method: 'POST',
      url: `/api/orders/${completed.order.id}/advance`
    });
    assert.equal(adv1.json().status, 'EM_SEPARACAO');

    const adv2 = await app.inject({
      method: 'POST',
      url: `/api/orders/${completed.order.id}/advance`
    });
    assert.equal(adv2.json().status, 'ENVIADO');

    const adv3 = await app.inject({
      method: 'POST',
      url: `/api/orders/${completed.order.id}/advance`
    });
    assert.equal(adv3.json().status, 'ENTREGUE');
  } finally {
    await app.close();
    await db.$disconnect();
    rmSync(dir, { recursive: true, force: true });
  }
});
