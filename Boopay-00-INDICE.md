# Documentação do MVP Boopay

Versão: 1.0  
Data-base: 22 de agosto de 2026  
Horizonte de entrega: dezembro de 2026

## Objetivo

Este conjunto de documentos registra as decisões de escopo, arquitetura, cronograma, critérios de aceite, backlog e vocabulário técnico do MVP do Boopay.

O MVP será completo para uma loja demonstrativa. Isso significa que todas as capacidades acordadas funcionarão de ponta a ponta em ambiente controlado, sem exigir inicialmente escala enterprise, operação multilojas ou publicação nas superfícies oficiais de terceiros.

## Documentos

1. [Visão consolidada original](./Boopay.md)
2. [Escopo e trade-offs do MVP](./Boopay-01-ESCOPO-MVP.md)
3. [Arquitetura e fluxos](./Boopay-02-ARQUITETURA-E-FLUXOS.md)
4. [Roadmap e critérios de aceite](./Boopay-03-ROADMAP-E-ACEITE.md)
5. [Backlog pós-MVP](./Boopay-04-BACKLOG.md)
6. [Dicionário técnico](./Boopay-05-DICIONARIO-TECNICO.md)
7. [Briefing da primeira reunião com Rogério](./Boopay-06-BRIEFING-REUNIAO-ROGERIO-2026-08-24.md)
8. [PDF de apoio para a reunião](./Boopay-Apoio-Reuniao-Rogerio-2026-08-24.pdf)

## Decisões centrais

- As integrações com WooCommerce, Shopify e VTEX entram no MVP.
- O SDK inicial captura view, add_to_cart e exit_intent.
- Um CDP completo e o rastreamento avançado ficam no backlog.
- PostgreSQL, Firestore e BigQuery entram com responsabilidades distintas.
- GPT-4o e Gemini entram como provedores funcionais por meio de uma camada comum.
- ACP e UCP serão implementados e testados em ambiente controlado.
- A publicação nas superfícies oficiais de OpenAI e Google fica no backlog por depender de aprovação externa.
- Stripe Connect e Google Pay serão usados inicialmente em sandbox.
- A entrada em produção dos pagamentos é condicional à homologação e aos testes.
- A recuperação de carrinho por WhatsApp entra em escopo controlado.
- Dashboard e perfil 360° entram completos para a loja demonstrativa.
- O produto começa com uma loja e nasce com tenant_id para permitir a evolução posterior.
- Multilojas, planos e cobrança SaaS ficam para depois do MVP.

## Regra para alterações

Qualquer mudança de escopo deve registrar:

1. qual decisão está sendo alterada;
2. por que a alteração é necessária;
3. impacto no prazo até dezembro;
4. impacto técnico;
5. item que será removido, simplificado ou movido para o backlog como compensação.
