# boopay-platform — documentação atual

[Resumo completo do projeto](../README.md) · [Índice geral](../INDICE-CENTRAL.md)

Comece pelo [estado validado](docs/ESTADO-ATUAL.md), pelos [critérios de conclusão](docs/CRITERIOS-DE-ACEITE.md) e pelo [guia da plataforma](README.md).

## Visão geral

- [Design System: Boopay Platform](DESIGN.md)
- [Boopay Platform](README.md)

## docs

- [ADR 001 — Núcleo transacional e ambientes](docs/ADR-001-transactional-core.md)
- [IA, Audiência e privacidade no painel](docs/AI-PROFILE-UI.md)
- [Conversa e provedores de IA](docs/AI.md)
- [API inicial](docs/API.md)
- [Backup e restauração isolada](docs/BACKUP-RESTORE.md)
- [Feed de produtos e prontidão](docs/CATALOG-FEED.md)
- [Checkout Core com loja conectada](docs/CHECKOUT-COMMERCE.md)
- [Critérios atuais para concluir o MVP](docs/CRITERIOS-DE-ACEITE.md)
- [Painel de receita e compra de teste](docs/DASHBOARD.md)
- [Painel analítico e conciliação](docs/DATA-DASHBOARD.md)
- [Projeções Firestore e BigQuery](docs/DATA-PROJECTIONS.md)
- [Da recomendação ao pedido](docs/DISCOVERY.md)
- [Estado atual da implementação](docs/ESTADO-ATUAL.md)
- [GEO e prontidão do catálogo](docs/GEO.md)
- [Google Pay TEST](docs/GOOGLE-PAY.md)
- [Operação local e staging](docs/OPERATIONS.md)
- [Entrega de eventos](docs/OUTBOX.md)
- [Retomar um pagamento ou uma compra de teste](docs/PAYMENT-RENEWAL.md)
- [Runtime HTTP e worker de pagamentos sandbox](docs/PAYMENT-RUNTIME.md)
- [Cartão sandbox e operações financeiras no painel](docs/PAYMENT-UI.md)
- [Pagamentos sandbox: provedor, operações e notificações](docs/PAYMENTS.md)
- [Vínculo entre loja e perfil — base de API](docs/PROFILE-STOREFRONT.md)
- [Perfil 360° e governança dos dados](docs/PROFILE.md)
- [Cadastro e autorização de clientes ACP/UCP](docs/PROTOCOL-ACCESS.md)
- [ACP/UCP com WooCommerce, Shopify e VTEX](docs/PROTOCOL-COMMERCE.md)
- [Pedidos e notificações ACP/UCP](docs/PROTOCOL-ORDERS.md)
- [Revisão e confirmação de compra por protocolo](docs/PROTOCOLO-CONFIRMACAO.md)
- [Contratos de protocolo usados pela implementação](docs/PROTOCOLOS-FONTES.md)
- [ACP/UCP — fundação REST de teste](docs/PROTOCOLS.md)
- [Privacidade na recuperação de backups](docs/RECOVERY-PRIVACY.md)
- [Funil, atribuição por origem e continuidade da compra](docs/REPORTING-ORIGINS.md)
- [Garantia da confirmação na Shopify](docs/SHOPIFY-CONFIRMATION.md)
- [Shopify — ciclo de vida dos rascunhos](docs/SHOPIFY-DRAFTS.md)
- [Shopify: catálogo e pedidos pendentes de desenvolvimento](docs/SHOPIFY.md)
- [Conectar o perfil à sessão da loja](docs/STORE-PROFILE-UI.md)
- [Coletores Shopify e VTEX — SDK 0.2.0](docs/STOREFRONT-PIXELS.md)
- [SDK e coleta storefront](docs/STOREFRONT-TRACKING.md)
- [Limites de baggage no Core da ponte VTEX](docs/VTEX-BAGGAGE.md)
- [Correções de dependências da ponte VTEX](docs/VTEX-BRIDGE-DEPENDENCIES.md)
- [Ponte VTEX: runtime e auditoria pendente](docs/VTEX-BRIDGE-RUNTIME.md)
- [Cancelamento VTEX no checkout e nos pedidos](docs/VTEX-CANCELLATION-UI.md)
- [VTEX — solicitação de cancelamento de pedidos pendentes](docs/VTEX-CANCELLATION.md)
- [Acompanhamento da fila de catálogo VTEX](docs/VTEX-CATALOG-UI.md)
- [Atualização incremental do catálogo VTEX](docs/VTEX-CATALOG-UPDATES.md)
- [VTEX: checkout com promissória de teste](docs/VTEX-CHECKOUT.md)
- [Propagação Jaeger corrigida na ponte VTEX](docs/VTEX-JAEGER.md)
- [Correção local do parser multipart da ponte VTEX](docs/VTEX-MULTIPART.md)
- [Acompanhamento automático VTEX](docs/VTEX-OBSERVATION.md)
- [Correção HTTP do exportador Prometheus da ponte VTEX](docs/VTEX-PROMETHEUS.md)
- [UUID corrigido com compatibilidade para o SDK VTEX](docs/VTEX-UUID.md)
- [VTEX: inspeção e checkout de teste](docs/VTEX.md)
- [Aceite do perfil na sessão nativa WooCommerce](docs/WOO-PROFILE.md)
- [Integração WooCommerce](docs/WOOCOMMERCE.md)

## infra/google-data

- [Provisionamento Google Data — não executado em cloud](infra/google-data/README.md)

## tools/vtex-catalog

- [Boopay Catalog Bridge — candidato VTEX IO](tools/vtex-catalog/README.md)

## tools/vtex-catalog/node/vendor/otel-core

- [Boopay maintained OpenTelemetry Core](tools/vtex-catalog/node/vendor/otel-core/BOOPAY-MAINTENANCE.md)
