# Contratos de protocolo usados pela implementação

[ACP/UCP no Boopay](PROTOCOLS.md) · [Resumo do projeto](../../README.md)

O Core usa contratos de terceiros fixados para validação offline. Referências não fazem chamadas de rede, e as cópias oficiais não são corrigidas para acomodar o comportamento local. A implementação e os adaptadores declaram o subconjunto efetivamente atendido.

- **ACP:** contrato 2026-04-17, [fonte fixada](https://github.com/agentic-commerce-protocol/agentic-commerce-protocol/tree/7fdd78df677a94dce04c770644b0fbbb1401272b/spec/2026-04-17).
- **UCP:** tag v2026-08-25, [fonte fixada](https://github.com/Universal-Commerce-Protocol/ucp/tree/cd78fb38e819de77d9b527d110476eccb876f1bd).

Essas são as versões fixadas pelo código atual do projeto, e não uma alegação de que sejam as últimas versões externas disponíveis. Manifests, hashes, esquemas e licenças permanecem no [repositório de implementação](https://github.com/ThiagoVenturaV/boopay-platform/tree/3ab824e3375d6d5d2956e0ca61aa90100f93a0d7/vendor/protocols); a central não duplica documentação vendorizada de terceiros.

No ACP fixado, a entrada `Item` não oferece `quantity`; o adaptador aceita uma unidade por entrada e o Core soma IDs repetidos. O UCP admite quantidades explícitas. O adaptador UCP traduz descontos para valores negativos e preserva um subtotal e um total, conforme os esquemas fixados. Descoberta/feed por arquivo e operações de checkout são contratos separados.

As sessões, revisão, confirmação, autorização delegada, idempotência e pós-compra estão documentadas em [PROTOCOLS](PROTOCOLS.md), [confirmação do comprador](PROTOCOLO-CONFIRMACAO.md) e [pedidos/notificações](PROTOCOL-ORDERS.md). Implementação e conformidade com os esquemas não equivalem a ativação oficial em ChatGPT, Gemini ou outra superfície.
