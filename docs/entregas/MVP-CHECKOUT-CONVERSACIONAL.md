# Entrega MVP — Checkout Conversacional & Prontidão Agêntica (GEO)

## 1. Visão Geral

O MVP do **Boopay** integra as duas frentes estratégicas do produto em uma experiência unificada de **Comércio Conversacional**:

1. **Catálogo Pronto para IA (GEO / UCP / ACP)**:
   - Sincronização de catálogo com plugin WooCommerce assinado via HMAC (`src/http/plugin-routes.ts`) e conector `CommerceAdapter` (`src/commerce/adapter.ts`) preparado para **Demo Store**, **WooCommerce REST v3**, **Shopify** e **VTEX**.
   - Cálculo de **GEO Score (0–100)** por produto e auditoria em tempo real dos sinais estruturados (`JSON-LD Schema.org`, `GTIN/EAN`, marca, categoria normalizada e estoque ao vivo).
2. **Checkout Invisível Conversacional**:
   - Interface em **Next.js** (`web/`) inspirada na arquitetura de 3 colunas do fluxo conversacional de referência, vestida integralmente com a identidade visual oficial do Boopay (`#032541` Navy, `#85FA2E` Lime, `#00DAFA` Cyan) e SVGs vetoriais extraídos de forma idêntica ao manual da marca.
   - Assistente conversacional em streaming SSE (`POST /api/chat/message`) capaz de consultar produtos, compor combos com desconto real, atualizar a sacola de forma idempotente, iniciar o checkout invisível em 3 etapas (Entrega c/ ViaCEP, Pagamento Pix/Cartão/Google Pay e Revisão Autoritativa) e acompanhar o pedido pós-venda em 4 estágios.
   - **Guarda-rails determinísticos**: preços, descontos e frete são calculados exclusivamente pelo backend (`src/checkout/checkout-service.ts`), assinados por `quoteHash` (SHA-256) e exigem confirmação humana explícita (`explicitConfirmation: true`) antes de confirmar o pedido.

## 2. Como Executar Localmente

### Pré-requisitos
- Node.js 20+
- Banco SQLite local gerenciado via Prisma

### Passo a passo

```bash
# 1. Aplicar migrations e gerar Prisma Client
npm run db:generate
npm run db:migrate

# 2. Iniciar o backend Fastify (porta 3333)
npm run dev

# 3. Em outro terminal, iniciar o frontend Next.js (porta 3000)
npm run dev:web
```

Acesse `http://localhost:3000` no navegador.

## 3. Validação Automatizada

```bash
# Executar typecheck, validação JS/PHP/Docs e suíte completa de testes
npm run check

# Executar typecheck e build de produção do frontend Next.js
npm run check:web
npm run build:web
```
