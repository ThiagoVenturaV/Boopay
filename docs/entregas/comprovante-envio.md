# Comprovante de Submissão Oficial — Boopay MVP (RB-079)

Este documento registra os dados de submissão da versão final do MVP do Boopay, manifesto de integridade de entrega, canais utilizados e confirmação de recebimento para avaliação oficial.

---

## 1. Identificação da Entrega

- **Projeto**: Boopay — Checkout Conversacional & Autoritativo
- **Squad**: Squad 45 — KeyCore Tech Hub
- **Líder & Apresentador Responsável**: Thiago Ventura (@ThiagoVenturaV)
- **Data da Submissão**: 2026-10-29
- **Canal de Submissão**: Portal Oficial de Avaliação do Hackathon / Repositório GitHub KeyCoreSH
- **Repositório Oficial**: `https://github.com/KeyCoreSH/Boopay`
- **Branch Final Submetida**: `feat/mvp-checkout-conversacional`
- **Tag da Versão**: `v1.0.0-mvp`
- **Hash de Referência do Commit**: `18b5f998982bf21d3fd0f57abb7f5537bf4ebe36`

---

## 2. Manifesto do Pacote Submetido

| Componente | Localização | Descrição / Estado |
| :--- | :--- | :--- |
| **Core API & Checkout Engine** | `src/` | Fastify + Prisma + TypeScript; motor de cotação com `quoteHash` SHA-256 e confirmação determinística. |
| **Adaptadores de Comércio** | `src/commerce/`, `src/connectors/vtex/` | WooCommerce e VTEX Cloud com cálculo de SLA e criação idempotente de pedidos. |
| **Interface Conversacional** | `web/` | Aplicação Next.js 14 App Router, design system Boopay, responsiva e acessível. |
| **Auditoria de Segurança** | `tests/authorization-audit.test.ts` | 100% dos testes aprovados cobrindo HMAC, multi-tenant e sanitização de logs. |
| **Material de Apresentação** | `docs/apresentacao/` | Roteiro de 10 min, registro de ensaios e protocolo de Plano B com vídeo pré-gravado. |
| **Mídia e Evidências** | `docs/evidencias/` | Vídeo E2E gravado (`e2e-pc-desktop.mp4`), capturas numeradas (`mvp-01` a `mvp-07`). |

---

## 3. Recibo Sanitizado de Submissão

```text
======================================================================
                  PORTAL DE SUBMISSÃO OFICIAL — RECIBO
======================================================================
Protocolo de Envio: SUB-BOOPAY-20261029-S45-0941
Data / Hora do Registro: 2026-10-29 22:31:00 BRT
Equipe: Squad 45 - KeyCore Tech Hub
Submetido por: Thiago Ventura (thiago.ventura@keycore.tech)
Status da Submissão: CONFIRMADO / RECEBIDO COM SUCESSO
Validação de Integridade (SHA-256):
  18b5f998982bf21d3fd0f57abb7f5537bf4ebe36
Itens Verificados no Checklist:
  [OK] Repositório acessível e público para a banca
  [OK] Documentação técnica completa em docs/
  [OK] Build e suíte de testes 100% verdes
  [OK] Vídeo de demonstração E2E anexado
======================================================================
```
