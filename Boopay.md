# Boopay — visão consolidada

> **Status:** este arquivo preserva a visão inicial do desafio. O escopo vigente do MVP está documentado no [índice da documentação](./Boopay-00-INDICE.md) e nos arquivos vinculados a ele.

## Resumo

O **Boopay** é uma proposta de plataforma SaaS de *Agentic Commerce*: uma camada intermediária entre lojas virtuais, dados de clientes, agentes de IA e meios de pagamento. A intenção é permitir que GPT-4o e Gemini entendam o consumidor, recomendem produtos e conduzam a compra dentro de uma conversa, reduzindo abandono de carrinho e aumentando conversão.

## Fluxo principal

1. Um SDK JavaScript e plugins para WooCommerce, VTEX e Shopify capturam eventos como `view`, `add_to_cart` e `exit_intent`.
2. BigQuery e Firestore processam os eventos e atualizam um perfil 360° do consumidor, apoiado por embeddings.
3. Agentes de IA consultam perfil, catálogo, preço e estoque para recomendar produtos e aplicar somente condições comerciais autorizadas.
4. ACP e UCP conectam a experiência aos ecossistemas OpenAI e Google.
5. Stripe Connect e Google Pay processam o pagamento após confirmação do cliente.
6. Carrinhos abandonados podem ser recuperados pelo WhatsApp, com consentimento e controle de frequência.
7. Um dashboard apresenta exposição, interação, conversão, receita influenciada e carrinhos recuperados.

## Componentes esperados

- SDK de rastreamento e plugins de e-commerce;
- middleware e APIs para normalização e enriquecimento de dados;
- integrações com GPT-4o, Gemini, ACP e UCP;
- checkout com Stripe Connect e Google Pay;
- recuperação de carrinho pelo WhatsApp;
- dashboard administrativo e perfil 360°;
- documentação de arquitetura, APIs, protocolos e evolução do produto.

Stack sugerida: React/Next.js, Node.js, Python, REST, PostgreSQL, BigQuery, Firestore e Docker.

## Relação provável com o AdCore

**AdCore não é um termo técnico genérico**, mas um nome comercial. O produto público mais alinhado ao desafio é o AdCore Turbo brasileiro, que centraliza catálogos, enriquece dados de produto com IA, distribui feeds para canais como Google, Meta e marketplaces e acompanha métricas por SKU.

Não foi encontrada confirmação pública ligando Boopay, AdCore e KeyCore. Pela sobreposição funcional, a hipótese mais provável é que o **Boopay seja uma evolução, nova marca ou camada de commerce conversacional sobre a base do AdCore**:

| AdCore | Boopay |
|---|---|
| Organiza catálogo e feeds | Usa o catálogo em conversas de venda |
| Distribui produtos para canais | Disponibiliza produtos a agentes de IA |
| Mede cliques e compras | Personaliza, negocia e conduz o checkout |
| Apoia publicidade | Realiza commerce conversacional |

Fontes públicas consultadas: [AdCore Turbo](https://www.adcore.com.br/), [migração Big.AdCore → Turbo](https://www.adcore.com.br/migracao) e [KeyCore Tech Hub](https://keycore.com.br/).

## Escopo realista do protótipo

Como o desafio reúne 13 entregas amplas, o protótipo deve priorizar uma **fatia vertical demonstrável**: uma loja integrada, eventos chegando à nuvem, perfil atualizado, recomendação por IA, checkout em sandbox, recuperação controlada pelo WhatsApp e dashboard do funil. Os demais conectores podem ser adaptadores ou provas de conceito.

## Pontos a esclarecer

- se Boopay é renomeação, extensão ou integração do AdCore;
- versões e acessos disponíveis para ACP, UCP e Modo IA do Google;
- prioridade e profundidade dos três plugins;
- regras de negociação e confirmação de pagamento;
- critérios de tempo real, atribuição de conversão, segurança e LGPD;
- divisão de responsabilidades entre BigQuery, Firestore e PostgreSQL.
