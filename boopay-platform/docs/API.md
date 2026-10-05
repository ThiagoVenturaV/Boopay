# API inicial

GEO e catálogo: [contratos, configuração e estados](GEO.md) das rotas administrativas `/v1/admin/geo/*` e `/v1/admin/catalog/readiness`.

Base local: `http://127.0.0.1:9510`. Payloads JSON estritos. Valores monetários em centavos. Datas UTC ISO-8601. Erros retornam `{error:{code,message,fields?}}` sem repetir dados sensíveis.

## Autenticação

Operador: `POST /v1/admin/login` com `secret` e `tenantId`. O navegador deve enviar Origin correspondente à origem pública configurada; recebe cookie HttpOnly/SameSite=Strict. Em staging o cookie é Secure. Cliente de API pode usar Bearer; não se autoriza acesso somente por tenant informado no corpo. O bootstrap é administrativo e não é um sistema de contas SaaS multiloja.

Comprador: `POST /v1/storefront/demo/session` cria sessão anônima para a loja demonstrativa. O token/cookie é limitado ao tenant e ao comprador. O navegador nunca recebe segredo HMAC ou credenciais de PSP.

Integração WooCommerce: administrador emite código em `POST /v1/admin/connection-codes`; plugin troca em `POST /v1/auth/validate-license`. Token opaco armazenado como hash; segredo HMAC criptografado com AES-GCM e contexto de tenant/integração. Os cabeçalhos v1 mantêm compatibilidade com o plugin atual. v2 assina `timestamp + '.' + rawBody`. Integrações podem ser revogadas.

## Operação

| Método | Caminho | Função |
|---|---|---|
| GET | `/v1/admin/me` | Sessão do operador e metadados da loja |
| GET | `/v1/admin/summary?from=&to=&evidence=` | Receita, pedidos e funil por período/evidência |
| GET | `/v1/admin/reports/orders.csv?from=&to=&evidence=` | CSV com todos os pedidos do filtro, valores inteiros e moeda |
| GET | `/v1/admin/catalog?q=` | Catálogo do tenant |
| GET | `/v1/admin/checkouts` | Sessões recentes |
| GET | `/v1/admin/orders` | Pedidos recentes |
| POST | `/v1/admin/orders/:id/refund` | Estorno explícito do simulador |
| GET | `/v1/admin/integrations` | Conexões, situação da credencial e vencimento, sem segredos |
| DELETE | `/v1/admin/integrations/:id` | Revogar conexão |

## Jornada do comprador

1. Consultar `/v1/buyer/catalog?q=`.
2. Criar `/v1/buyer/checkouts`: `{cart:[{productId,quantity}],destination:{country:'BR',postalCode:'50000000'},origin:{surface:'boopay-simulator',evidence:'simulated'}}`.
3. Atualizar carrinho/destino com `PATCH /v1/buyer/checkouts/:id` quando necessário.
4. Exibir o resumo retornado pelo servidor; confirmar por `POST .../:id/confirm`, enviando `quoteId`, `quoteHash`, `accepted:true` e `termsVersion` retornado por `/v1/buyer/me`.
5. Concluir por `POST .../:id/complete`, cabeçalho `Idempotency-Key`, `{paymentMethod:'sandbox:success'}` ou `'sandbox:declined'` somente para teste.
6. Inspecionar o estado retornado: se preço/estoque/prazo mudou, a compra volta para revisão. Um HTTP 200 não implica pagamento concluído; verificar `checkout.status` e `order`.

Leitura: `GET /v1/buyer/checkouts/:id`. Cancelamento: `POST .../:id/cancel`. Um comprador não acessa a sessão de outro. O simulador não cobra dinheiro nem representa Stripe ou Google Pay.

Produtos WooCommerce usam a mesma jornada com `commerce` (endereços, cupom e entrega), `checkout.commerce.termsVersion` na confirmação e `paymentMethod: woocommerce:bacs` no envio. `completed` pode conter um pedido com pagamento pendente. As rotas de detalhes privados e conciliação estão em [Checkout com loja conectada](CHECKOUT-COMMERCE.md).

## Ingestão

`POST /v1/catalog/ingest`, `/v1/events/ingest` e `/v1/integrations/woocommerce/status` preservam o contrato do plugin. Um eventId com payload diferente recebe 409. Eventos fora de ordem não sobrescrevem uma atualização de catálogo posterior. Parâmetros de URL e propriedades arbitrárias de eventos são descartados.

## Métricas

A receita usa o conjunto de pedidos criados no período e seu estado atual de estorno. `netGross` inclui frete e impostos e desconta estornos; `netMerchandise` exclui frete/impostos. Não somar moedas. Abandono de checkout considera cancelamento/expiração; `exit_intent` de vitrine não prova abandono. Resultados de IA oficiais e simulados não são intercambiáveis.

Pedidos pendentes, recusados, cancelados ou em conciliação não entram nos valores de receita paga, inclusive no CSV. `counts.pendingOrders` e `counts.reconciliationRequired` permitem acompanhá-los separadamente. As taxas da loja aparecem em `fees`; sessões com envio incerto não são classificadas como abandonadas apenas por tempo decorrido.

`dailyRevenue` agrupa por dia no fuso `America/Fortaleza` e por moeda. `counts.open` exclui sessões concluídas, canceladas e expiradas. As taxas são `null` sem sessões. Cada moeda inclui contagens próprias de pedidos e estornos. Os limites temporais são inclusivos e comparados como instantes, aceitando datas ISO com ou sem milissegundos.

Os endpoints HTTP de catálogo retornam arrays de produtos diretamente (`id`, `platform`, `unitAmount`, etc.), sem o envelope interno de armazenamento. O catálogo administrativo inclui produtos inativos; o catálogo do comprador lista somente produtos ativos.
