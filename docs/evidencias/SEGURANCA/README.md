# Relatório e Evidências de Segurança, Autorização e Isolamento Multitenant (RB-068)

Este documento consolida as auditorias e testes de segurança automatizados do Boopay cobrindo autenticação, integridade, autorização multitenant, expiração, mitigação de replay e sanitização de logs.

## 1. Escopo Auditado

1. **Isolamento Multitenant de Operadores e Credenciais**:
   - Operadores vinculados a uma loja/tenant específico são estritamente impedidos de acessar inventário, catálogo, métricas de integridade ou códigos de pareamento de outros tenants (respostas 403 Forbidden e 400 Bad Request).
   - Tentativa de consulta de lojas forçando parâmetro `tenant_id` de outro tenant resulta em 400 Bad Request.

2. **Assinatura HMAC SHA-256 e Proteção contra Tampering**:
   - Requisições externas à API do Core Boopay são assinadas com HMAC SHA-256 (`v1\nMETHOD\nPATH\nTIMESTAMP\nNONCE\nSHA256(BODY)`).
   - Qualquer adulteração em payload ou cabeçalhos invalida a assinatura (`401 invalid_signature`).
   - Timestamps com desvio superior a 300 segundos são imediatamente descartados (`401 expired_signature`).

3. **Proteção contra Replay Attack**:
   - Nonces criptográficos de uso único são armazenados na tabela `replayNonce` e deduplicados com chave composta `hashToken(integration.id + ':' + nonce)`.
   - Tentativas de reutilizar o mesmo nonce geram rejeição imediata com código `409 Conflict` (`replayed_request`).

4. **Revogação de Credenciais e Invalidamento de Códigos de Conexão**:
   - Credenciais revogadas (`revokedAt`) são imediatamente bloqueadas (`401 invalid_credentials`).
   - Códigos de emparelhamento `connectionCode` possuem validade estrita de 5 minutos e expiram automaticamente após o primeiro uso (`usedAt`).

5. **Sanitização de Logs e Zero Vazamento de PII/Segredos**:
   - O logger do Fastify/Pino e os interceptores de log foram inspecionados para garantir que `signing_secret`, `BOOPAY_CREDENTIAL_KEY`, tokens brutos e chaves de criptografia AES-256-GCM nunca sejam gravados em stdout ou arquivos de log.

## 2. Execução Automatizada

A suíte automatizada está implementada em `tests/authorization-audit.test.ts`.

Comando para execução:
```bash
node --import tsx --test tests/authorization-audit.test.ts
```

Resultado observado:
- 5/5 testes aprovados (100% de sucesso).
- Exit code: 0.
