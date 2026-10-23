# Entrega MVP — Checkout Conversacional & Prontidão Agêntica (GEO)

## 1. Visão Geral

O MVP do **Boopay** integra as duas frentes estratégicas do produto em uma experiência unificada de **Comércio Conversacional**:

1. **Catálogo Pronto para IA (GEO / UCP / ACP)**:
   - Sincronização de catálogo com plugin WooCommerce assinado via HMAC (`src/http/plugin-routes.ts`) e conector `CommerceAdapter` (`src/commerce/adapter.ts`) preparado para **Demo Store**, **WooCommerce REST v3**, **Shopify** e **VTEX**.
   - Cálculo de **GEO Score (0–100)** por produto e auditoria em tempo real dos sinais estruturados (`JSON-LD Schema.org`, `GTIN/EAN`, marca, categoria normalizada e estoque ao vivo).
2. **Checkout Invisível Conversacional**:
   - Interface em **Next.js** (`web/`) inspirada na arquitetura de 3 colunas do fluxo conversacional de referência, vestida integralmente com a identidade visual oficial do Boopay (`#032541` Navy, `#85FA2E` Lime, `#00DAFA` Cyan) e SVGs vetoriais extraídos de forma idêntica ao manual da marca.
   - Assistente conversacional em streaming SSE (`POST /api/chat/stream`) capaz de consultar produtos, compor combos com desconto real, atualizar a sacola de forma idempotente, iniciar o checkout invisível em 3 etapas (Entrega c/ ViaCEP, Pagamento Pix/Cartão/Google Pay e Revisão Autoritativa) e acompanhar o pedido pós-venda em 4 estágios.
   - **Guarda-rails determinísticos**: preços, descontos e frete são calculados exclusivamente pelo backend (`src/checkout/checkout-service.ts`), assinados por `quoteHash` (SHA-256) e exigem confirmação humana explícita (`explicitConfirmation: true`) antes de confirmar o pedido.

## 2. Como Executar Localmente

### Pré-requisitos
- Node.js 20+
- Banco SQLite local gerenciado via Prisma

### Configuração da IA (Groq + Qwen 3.8 27B)
No arquivo `.env` na raiz do projeto, configure sua chave da Groq:

```env
BOOPAY_AI_PROVIDER=groq
GROQ_API_KEY=gsk_sua_chave_aqui
GROQ_MODEL=qwen/qwen3.8-27b
```

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

## 3. Validação Automatizada e Testes End-to-End (Playwright)

```bash
# Executar typecheck, validação JS/PHP/Docs e suíte completa de testes de integração
npm run check

# Executar typecheck e build de produção do frontend Next.js
npm run check:web
npm run build:web

# Executar suíte E2E Playwright (Desktop 1440x900 + Mobile 390x844) com gravação de vídeos
npm run test:e2e
```

## 4. Evidências Visuais e Vídeos E2E (PC Desktop & Mobile)

- **Vídeo E2E Desktop (`1440x900`)**:
  - [MP4 Desktop](../evidencias/e2e-pc-desktop.mp4) · [WebM Desktop](../evidencias/e2e-pc-desktop.webm) · [GIF Preview Desktop](../evidencias/e2e-pc-desktop.gif)
- **Vídeo E2E Mobile (`390x844`)**:
  - [MP4 Mobile](../evidencias/e2e-mobile.mp4) · [WebM Mobile](../evidencias/e2e-mobile.webm) · [GIF Preview Mobile](../evidencias/e2e-mobile.gif)
- **Capturas de Tela E2E**:
  - [1. Boas-vindas e Identidade Boopay Desktop](../evidencias/mvp-01-welcome-desktop.png)
  - [2. Descoberta Conversacional, Kit IA e Sacola Autoritativa](../evidencias/mvp-02-discovery-and-kit.png)
  - [3. Checkout Invisível em 3 Etapas + Confirmação Humana Explícita](../evidencias/mvp-03-invisible-checkout-review.png)
  - [4. Pedido Confirmado e Rastreio Pós-Venda em Tempo Real](../evidencias/mvp-04-order-confirmed-tracking.png)
  - [5. Responsividade Mobile (390x844)](../evidencias/mvp-05-mobile-responsive.png)
