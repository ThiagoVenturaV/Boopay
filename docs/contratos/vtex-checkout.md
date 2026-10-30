# Contrato de Integração — VTEX Checkout Core (RB-038)

## 1. Visão Geral

Este documento define o contrato de integração entre o motor de Checkout do Boopay e a **VTEX Commerce Cloud**, cobrindo simulação autoritativa de carrinho, cálculo de frete logístico, geração de cotação assinada SHA-256 (`quoteHash`) e colocação de pedidos idempotente.

---

## 2. Endpoints e Mapeamento VTEX

### 2.1 Simulação de Carrinho e Frete
- **Método / Rota:** `POST /api/checkout/pub/orderForms/simulation`
- **Cabeçalhos:**
  - `Accept: application/json`
  - `Content-Type: application/json`
  - `X-VTEX-API-AppKey: {appKey}` (quando em modo autenticado)
  - `X-VTEX-API-AppToken: {appToken}` (quando em modo autenticado)

#### Payload de Envio (Boopay -> VTEX):
```json
{
  "items": [
    {
      "id": "prod-backpack",
      "quantity": 1,
      "seller": "1"
    }
  ],
  "postalCode": "01310-100",
  "country": "BRA"
}
```

#### Resposta Esperada (VTEX -> Boopay):
```json
{
  "items": [
    {
      "id": "prod-backpack",
      "requestIndex": 0,
      "price": 28990,
      "listPrice": 34990,
      "sellingPrice": 28990,
      "availability": "available"
    }
  ],
  "logisticsInfo": [
    {
      "itemIndex": 0,
      "slas": [
        {
          "id": "standard",
          "name": "PAC / Entrega Normal",
          "price": 1990,
          "shippingEstimate": "4bd"
        },
        {
          "id": "express",
          "name": "Sedex / Expressa",
          "price": 3490,
          "shippingEstimate": "1bd"
        }
      ],
      "selectedSla": "standard"
    }
  ],
  "totals": [
    { "id": "Items", "name": "Total dos Itens", "value": 34990 },
    { "id": "Discounts", "name": "Descontos", "value": -6000 },
    { "id": "Shipping", "name": "Frete", "value": 1990 },
    { "id": "Tax", "name": "Taxas", "value": 0 }
  ]
}
```

---

### 2.2 Criação e Fechamento de Pedido
- **Método / Rota:** `POST /api/checkout/pub/orders`
- **Idempotência:** A chave `orderId` gerada pelo Boopay (ex: `BOO-2026-XXXXXX`) é enviada no cabeçalho ou payload como identificador idempotente. Repetições de requisição com o mesmo `orderId` não geram pedidos duplicados; a VTEX reconcilia e retorna a referência da ordem original.

---

## 3. Cotação Autoritativa e Integridade (SHA-256)

Toda cotação originada do adaptador VTEX gera um `quoteHash` determinístico utilizando os seguintes parâmetros canônicos:
- `source`: `"vtex"`
- `lines`: array ordenado de `{ productRef, priceCents, qty }`
- `subtotalCents`: soma dos preços cheios (`listPrice`)
- `discountCents`: total de descontos autorizados
- `shippingCents`: custo do SLA selecionado
- `totalCents`: valor final
- `deliveryType`: `"express" | "standard" | "pickup"`
- `cep`: código postal normalizado

Qualquer alteração em preço, frete ou itens invalida a cotação e exige nova confirmação explícita do comprador antes do faturamento.
