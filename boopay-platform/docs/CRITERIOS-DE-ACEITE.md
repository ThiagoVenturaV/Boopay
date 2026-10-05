# Critérios atuais para concluir o MVP

[Resumo do projeto](../../README.md) · [Estado validado](ESTADO-ATUAL.md)

O objetivo é provar a jornada completa para uma loja controlada, com confirmação humana, pagamento de teste, pedido autoritativo e receita conciliada. Os critérios detalhados permanecem no [escopo](../../Boopay/Boopay-01-ESCOPO-MVP.md) e no [roadmap de aceite](../../Boopay/Boopay-03-ROADMAP-E-ACEITE.md). Este documento consolida as obrigações atuais, sem reproduzir o histórico de execução.

## Jornada e autorização

- GEO nas três páginas definidas, com relatório qualificado e vínculo a URL/SKU/produto.
- Catálogo sincronizado e consultável; preço, estoque, moeda, variação e entrega derivados de autoridade comercial.
- Recomendação rastreável, seleção para o mesmo Checkout Core e resumo exato apresentado ao comprador.
- Aceite explícito, confirmação invalidada quando a cotação muda e ausência de compra autônoma irrestrita.
- Pagamento sandbox e pedido no e-commerce, com tentativa original recuperável após timeout/resposta perdida.
- Cancelamento/estorno conforme capacidade comprovada, sem reconhecer receita em pedido pendente.

## Coleta, perfil e dados

- SDK e conectores exercitados em lojas autorizadas, com consentimento e reentrega sem duplicação.
- Analytics e vínculo ao perfil tratados separadamente; somente atividade posterior ao aceite específico alimenta o perfil.
- Exportação/exclusão/revogação e minimização comprovadas, incluindo os destinos externos habilitados.
- PostgreSQL transacional, projeções Firestore/BigQuery e conciliação no projeto autorizado.
- Receita, funil, abandono, origem e moeda com regras explícitas e dados verificáveis; métricas sem denominador disponível permanecem ausentes.

## Integrações e operação

- WooCommerce, Shopify e VTEX compartilham modelos canônicos e preservam seus limites nativos.
- IA, GEO, Stripe/Google Pay e Google Cloud avaliados com configuração e contas de teste autorizadas.
- Segurança/runtime da ponte VTEX tratados antes da instalação; validação sintética não libera uso externo.
- Falhas, concorrência, idempotência, respostas tardias, leases/outbox, conciliação e retomada reproduzidos.
- Backup e restauração autenticados, destino isolado/quarentena, reaplicação de exclusões e revisão antes de retomar.
- Documentação, configuração sem segredos, evidências e responsáveis de operação disponíveis para o próximo participante.

## Evidência necessária

Código, teste local, emulador, transporte sintético, sandbox externo e homologação de loja/superfície são evidências diferentes. Cada aceite precisa declarar ambiente, dados e integração efetivamente exercitados. A demonstração local `discovery:demo` existe; a jornada equivalente com páginas e serviços autorizados ainda precisa ser comprovada.

A quantidade de testes não substitui as dependências externas. Homologação nas superfícies oficiais, Marketplace, pagamentos de produção, planos/multilojas e WebMCP não são pré-requisitos inventados para encerrar a meta local; pertencem a escopos próprios. [Backlog vigente](../../Boopay/Boopay-04-BACKLOG.md).
