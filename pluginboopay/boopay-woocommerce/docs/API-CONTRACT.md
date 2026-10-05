# Contrato Plugin WooCommerce - API Boopay v1

Este contrato elimina as divergências apontadas no PRD v1.0. Todos os nomes JSON usam `camelCase` e toda data usa ISO-8601 em UTC.

## 1. Conectar uma loja

`POST /v1/auth/validate-license`

Requisição sem HMAC, sempre por HTTPS:

```json
{
  "licenseKey": "codigo-temporario",
  "storeUrl": "https://loja.example/",
  "storeName": "Loja",
  "storeLocale": "pt_BR",
  "currency": "BRL",
  "wordpressVersion": "6.x",
  "woocommerceVersion": "10.x",
  "pluginVersion": "0.2.0"
}
```

Resposta `200`:

```json
{
  "data": {
    "valid": true,
    "integrationId": "int_uuid",
    "tenantId": "tenant_uuid",
    "accessToken": "token_opaco",
    "signingSecret": "segredo_hmac_aleatorio",
    "tokenExpiresAt": "2026-12-31T23:59:59Z"
  }
}
```

O código temporário deve ser de uso único e expirar rapidamente. O backend armazena somente seu hash. O plugin apaga o código depois da tentativa de troca.

## 2. Ingestão de catálogo

`POST /v1/catalog/ingest`

Aceita os eventos:

- `catalog.products.upserted`;
- `catalog.product.deleted`.

O upsert ocorre pela chave única `(tenantId, platform, externalId)`. SKU não pode ser usado sozinho porque pode estar vazio ou mudar.

## 3. Ingestão de eventos

`POST /v1/events/ingest`

Aceita:

- `storefront.view`;
- `storefront.add_to_cart`;
- `storefront.exit_intent`.

O backend deduplica globalmente por `eventId` dentro do tenant.

## 4. Teste da integração

`POST /v1/integrations/woocommerce/status`

Recebe um envelope `integration.health.requested` assinado e retorna qualquer resposta JSON `2xx` quando token, integração, tenant e assinatura forem válidos.

## 5. Envelope comum

```json
{
  "schemaVersion": "1.0",
  "eventId": "uuid-v4",
  "eventType": "catalog.products.upserted",
  "occurredAt": "2026-08-28T12:00:00Z",
  "tenantId": "tenant_uuid",
  "integrationId": "int_uuid",
  "source": {
    "platform": "woocommerce",
    "storeUrl": "https://loja.example/",
    "wordpressVersion": "6.x",
    "woocommerceVersion": "10.x",
    "pluginVersion": "0.2.0"
  },
  "data": {}
}
```

O backend deriva o tenant da credencial e exige que ele corresponda ao `tenantId` declarado. Nunca autoriza um recurso confiando somente no corpo.

## 6. Autenticação e HMAC

Cabeçalhos assinados:

```text
Authorization: Bearer <accessToken>
X-Boopay-Integration-Id: <integrationId>
X-Boopay-Tenant-Id: <tenantId>
X-Boopay-Timestamp: <unix-seconds>
X-Boopay-Signature-Version: v1
X-Boopay-Signature: <base64-hmac>
X-Boopay-Idempotency-Key: <eventId>
```

Algoritmo v1:

```text
signature = base64(HMAC-SHA-256(rawRequestBodyBytes, signingSecret))
```

O backend precisa:

1. preservar o corpo bruto antes do parse JSON;
2. comparar a assinatura em tempo constante;
3. rejeitar timestamps fora da janela configurada;
4. rejeitar token expirado ou integração revogada;
5. validar `tenantId` e `integrationId` contra o token;
6. deduplicar por `eventId`/`X-Boopay-Idempotency-Key`.

## 7. Respostas e retentativa

- Qualquer `2xx`: entrega aceita.
- `400` ou `422`: payload inválido; deve retornar campos inválidos sem segredos.
- `401` ou `403`: credencial, autorização ou assinatura inválida; exige reconexão.
- `409`: idempotência já processada; o backend pode retornar `2xx` para simplificar o cliente.
- `429` ou `5xx`: falha temporária; o plugin tenta novamente em aproximadamente 1, 5, 15 e 60 minutos.

Respostas e logs nunca devem incluir `accessToken`, `signingSecret`, código temporário ou payload pessoal completo.
