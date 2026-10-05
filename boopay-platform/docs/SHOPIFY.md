# Shopify: catálogo e pedidos pendentes de desenvolvimento

Implementação de 10/09/2026. O adaptador usa o mesmo Checkout Core, catálogo, pedidos, outbox e painel do WooCommerce. Está **desativado por padrão** e exige uma loja cujo `ShopPlan.partnerDevelopment` seja verdadeiro. A versão Admin GraphQL é fixada em **2026-07**; uma resposta com outra versão é recusada, inclusive fallback automático da Shopify.

Esta entrega é uma etapa do MVP completo: catálogo → cotação Shopify → revisão → confirmação do comprador → pedido pendente → consulta do pedido original. Os testes usam transporte Shopify sintético e não comprovam aceitação das queries por uma loja real. Pagamento nativo Shopify, homologação externa e as limitações abaixo continuam pendentes. [ACP/UCP](PROTOCOL-COMMERCE.md) passam pelo mesmo Core e método de pedido pendente; a evolução VTEX está documentada separadamente em [VTEX-CHECKOUT.md](VTEX-CHECKOUT.md).

## Operações e limites comerciais

| Operação | Implementação |
|---|---|
| Catálogo | Paginação de variantes, preço em centavos, moeda, SKU, produto pai, opções, disponibilidade e imagem. Máximo 5.000 variantes / 100 páginas; leitura limitada a três minutos mais a chamada em curso. Falha, cursor repetido, IDs duplicados ou dados inválidos recusam toda a aplicação. |
| Sincronização | Leitura completa antes da transação, atualização apenas de registros alterados, desativação dos ausentes da própria conexão. Não remove dados de outra integração. Leases de dez minutos e identidade da execução impedem que resposta atrasada substitua o resultado de outro worker. A paginação não é um snapshot transacional Shopify; alterações durante a leitura exigem nova sincronização. |
| Cálculo | `draftOrderCalculate`, fretes retornados pela loja e `draftOrderCreate` com IDs de variantes e quantidades, sem sobrescrever preços. Cupom solicitado precisa constar entre os códigos aplicados. Avisos, bundles, linhas personalizadas, divergências monetárias e tributos incluídos nos preços são recusados. |
| Revisão | Contexto, contato e endereços cifrados; resumo com hash e validade de cinco minutos; reserva solicitada até trinta minutos. `refresh` consulta o rascunho original, confere itens, contato, endereço, frete, códigos e reserva, e não altera o rascunho no servidor. O preço do rascunho é a autoridade; não se promete recálculo do preço do catálogo a cada GET. |
| Conclusão | O Core exige confirmação persistida e reserva uma tentativa antes do envio. `draftOrderComplete(paymentPending: true)` é emitido uma vez; perda de resposta leva à consulta do mesmo DraftOrder ID, sem repetir a conclusão automaticamente. Confirmação e reserva são checadas novamente imediatamente antes do envio. |
| Financeiro | `PENDING`/`AUTHORIZED` sem cancelamento e sem divergência permanecem pendentes. Cancelamento compatível pode ser observado. `PAID`, `REFUNDED`, pagamento parcial, estorno parcial, alterações de total ou estados desconhecidos exigem conciliação. Um `PAID` manual não cria `payment.succeeded`, receita paga nem prova de captura. |
| Atualizações | Webhook assinado apenas agenda consulta autoritativa. O worker reconcilia compras Boopay que já possuem tentativa; não importa pedidos arbitrários da loja, clientes, endereços ou totais do corpo do webhook. |
| Interface | Configurações permite sincronizar e consultar o estado. Checkout identifica Shopify, usa `shopify_pending`, mostra o aceite para pedido pendente e não oferece Stripe, BACS ou cobrança nativa nesse fluxo. Pedidos mantém a consulta à loja. Composição B e entrada por receita preservadas. |

### Limites que impedem considerar a Shopify concluída

1. A Shopify não recebe nesta mutation um hash/versão esperada que torne a conferência do resumo atômica com a conclusão. A consulta anterior e a posterior detectam divergência, mas uma alteração concorrente pode criar **um pedido pendente divergente** antes de o Boopay registrá-lo como incerto. Nenhuma cobrança é enviada. Esse risco foi injetado no teste; falta uma solução validada para a garantia comercial forte e não se recomenda ativação de produção. A [análise de validação nativa](SHOPIFY-CONFIRMATION.md) identifica Shopify Functions como hipótese dependente das capacidades da loja e define a prova exigida; não representa uma correção implementada.
2. A [limpeza de rascunhos novos](SHOPIFY-DRAFTS.md) foi implementada em 11/09/2026: registro durável anterior à criação, localização de resposta perdida, exclusão opt-in após uma hora e proteção de tentativas de conclusão. A reserva continua limitada a trinta minutos. Rascunhos históricos sem registro, tentativas protegidas, ambiguidades, atividade externa e retenção completa de PII **na Shopify** ainda exigem tratamento e homologação. Exclusão local do perfil não elimina essas cópias externas. A exclusão remota permanece desligada até configurar `draftCleanupEnabled: true` e validar o contrato operacional.
3. Tributos inclusos, descontos de frete com alocação incompatível com a equação canônica, bundles, assinaturas, múltiplas moedas de presentment e carrinhos personalizados exigem normalização/validação própria. Há recusa explícita quando o contrato não fecha; não se inventa alocação tributária ou frete grátis. Endereços são brasileiros e telefone exige DDD.
4. Não há captura, tokenização, liquidação, cancelamento financeiro ou estorno emitido pela Shopify. Também não há Storefront Checkout, publicação na App Store, OAuth de instalação, registro automático de webhooks, tratamento de `app/uninstalled`, fulfillment/rastreamento físico ou cadastro de cliente. O checkout via ACP/UCP aceita somente o método pendente e preserva confirmação isolada e conciliação; não é homologação de pagamento delegado.
5. A leitura completa usa preço de loja e `sellableOnlineQuantity`; não garante publicação em um canal/market ou estoque por local. A reserva e permissões efetivas precisam de homologação. `ProductVariant.image` e `paymentPending` estão deprecated, mas presentes na versão fixada; a migração exige nova evidência.
6. O worker depende das entregas e da reconciliação manual. Não há backfill automático de catálogo/pedidos ao iniciar, agendamento periódico de reparação, recuperação de webhook removido, nem comprovação de SLA. Um pedido cuja leitura falha mantém o lote pendente, visível no estado operacional. A fila não é tratada como entregue por tempo decorrido.

## Configurar uma loja de desenvolvimento

O tenant precisa existir antes da inicialização. O descritor abaixo contém somente nomes de variáveis, sem os valores privados:

```dotenv
BOOPAY_SHOPIFY_CONNECTIONS=[{"id":"shopify-dev","tenantId":"tenant-demo","shop":"sua-loja-dev.myshopify.com","revision":1,"expiresAt":"2027-01-01T00:00:00.000Z","accessTokenEnv":"BOOPAY_SHOPIFY_DEV_TOKEN","webhookSecretEnv":"BOOPAY_SHOPIFY_DEV_SECRET"}]
BOOPAY_COMMERCE_ALLOWED_ORIGINS=https://sua-loja-dev.myshopify.com
```

Configure as duas variáveis privadas no ambiente ou secret manager. O token é da app autorizada para essa loja; o segredo de webhook é o client secret da app. Não colar valores no chat, documentação ou Git. A configuração aceita até vinte conexões; IDs e lojas são únicos. Tenant, loja e identidade de conexão não podem ser trocados. Incrementar `revision` para mudar credenciais ou validade; servidor com revisão antiga para de operar. Reiniciar não reativa uma conexão revogada. Remover o descritor desabilita o adaptador naquele processo, mesmo que dados cifrados ainda existam no banco.

Revise os escopos mínimos para as operações usadas: leitura de produtos e inventário, escrita/leitura de draft orders e leitura de pedidos. Dados protegidos de clientes e permissões de criar/concluir rascunhos precisam ser concedidos conforme a app e a loja. Os escopos efetivos e campos protegidos devem ser testados na loja; não foram concedidos nem consultados nesta entrega. Não é necessário configurar captura ou marcar pedido como pago para esse teste.

Cadastre HTTPS com versão 2026-07 para `/v1/integrations/shopify/{id}/webhook`. Tópicos aceitos: `products/create`, `products/update`, `products/delete`, `inventory_levels/update`, `orders/create`, `orders/updated`, `orders/paid`, `orders/cancelled`, `refunds/create`. Outros tópicos são recusados. Os cabeçalhos de tópico/domínio não fazem parte do HMAC; por isso só selecionam a consulta da conexão fixada e nunca autorizam mutação financeira ou importação dos dados do corpo.

O recebimento valida HMAC SHA-256/base64 sobre o corpo bruto antes do JSON, domínio, versão e ID de entrega. Salva hash do corpo e metadados mínimos, sem PII ou mensagens remotas. Deduplicação sobrevive a reinício; o mesmo ID com corpo/tópico diferente resulta em conflito. Recibos concluídos são retidos por sete dias e podados ao receber nova entrega/solicitação; limite de 5.000 recibos por tenant. Na rotação de client secret, esta versão aceita apenas o segredo atual; entregas ainda assinadas pelo anterior falham e dependem de retry/reconciliação. Sobreposição de segredos ainda é pendente.

## Operação

| Rota | Acesso e efeito |
|---|---|
| `GET /v1/admin/shopify/status` | Admin; configuração sem credenciais, fila, últimas consultas e códigos de erro. `configured_unverified` não significa homologado. |
| `POST /v1/admin/shopify/{id}/sync` `{}` | Admin; agenda reparação de catálogo e consultas das tentativas já existentes. A solicitação identifica o ator por hash. |
| `POST /v1/admin/shopify/{id}/run` `{}` | Admin; executa um passo da fila. Até cem entregas por lote e dez compras por passo, com cursor persistido. Falhas mantêm o progresso e repetem com backoff de 10–300 segundos. |
| `POST /v1/admin/shopify/{id}/drafts/cleanup` `{}` | Admin; até dez registros elegíveis, somente com a limpeza habilitada no descritor. Estado em `connections[].draftCleanup`; [política e limites](SHOPIFY-DRAFTS.md). |
| `POST /v1/integrations/shopify/{id}/webhook` | HMAC; apenas recebimento durável. Sem chamada Shopify no caminho de confirmação HTTP. |
| Checkout/pedidos | APIs existentes, autenticação do comprador/admin, confirmação do mesmo hash e conciliação da tentativa original. |

No processo principal, o worker roda a cada trinta segundos quando há conexões explícitas. **Configurações → Sincronizar Shopify agora** agenda e tenta executar um passo; lotes maiores continuam no worker. **Atualizar estado Shopify** apenas consulta o estado persistido. Credenciais, corpos de webhook e conteúdo dos erros externos não aparecem no painel. Nenhuma loja real foi configurada nesta implementação.

## Evidências

Resultados executados e hashes de publicação são registrados em [STATUS.md](ESTADO-ATUAL.md). Não há prova externa de GraphQL, reserva de estoque, pagamento ou conciliação Shopify.

## Fontes primárias verificadas em 10/09/2026

- [DraftOrderCalculate](https://shopify.dev/docs/api/admin-graphql/latest/mutations/draftordercalculate): cálculo sem criar pedido, versão apresentada 2026-07.
- [DraftOrder](https://shopify.dev/docs/api/admin-graphql/latest/objects/draftorder) e [CalculatedDraftOrderLineItem](https://shopify.dev/docs/api/admin-graphql/latest/objects/calculateddraftorderlineitem): campos de dinheiro, reserva, readiness, itens e códigos aplicados.
- [DraftOrderComplete](https://shopify.dev/docs/api/admin-graphql/latest/mutations/draftordercomplete): conclusão com `paymentPending` ainda presente e deprecated em 2026-07.
- [ShopPlan](https://shopify.dev/docs/api/admin-graphql/latest/objects/shopplan), [ProductVariant](https://shopify.dev/docs/api/admin-graphql/latest/objects/productvariant), [ShippingRate](https://shopify.dev/docs/api/admin-graphql/latest/objects/shippingrate) e [DraftOrderInput](https://shopify.dev/docs/api/admin-graphql/latest/input-objects/draftorderinput): contratos do adaptador.
- [Verificação de webhooks](https://shopify.dev/docs/apps/build/webhooks/verify-deliveries): corpo bruto, HMAC, duplicatas e necessidade de reconciliação.

Os links `latest` podem mudar; o cliente fixa 2026-07 e recusa outra versão. A leitura da documentação não substitui executar essas operações na loja de desenvolvimento.
