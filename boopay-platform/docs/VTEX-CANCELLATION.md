# VTEX — solicitação de cancelamento de pedidos pendentes

Implementado em 11/09/2026 para a modalidade existente de promissória de teste. Comprador ou administrador podem solicitar o cancelamento do grupo de pedidos originado no Boopay, com confirmação explícita do resumo original. As etapas ficam registradas no mesmo journal comercial. Recebimento HTTP, aceitação da solicitação e cancelamento financeiro comprovado são estados distintos.

A implementação e os testes usam HTTP/Core/SQLite/PostgreSQL reais com transporte VTEX sintético. Nenhuma conta externa foi ativada e nenhum pedido real foi cancelado. A função não implementa captura ou estorno de PSP, e o adaptador completo continua aberto na [matriz de entrega](CRITERIOS-DE-ACEITE.md).

## Habilitação e acesso

O descritor privado de `BOOPAY_VTEX_CHECKOUT_CONNECTIONS` aceita `cancellationEnabled: true`. Omitido ou `false`, o cancelamento fica desabilitado. A configuração exige revisão maior quando alterada; a revisão anterior não pode continuar operando. Conta, canal, vendedor, condição de promissória, origens permitidas e credenciais continuam vinculados ao contexto comercial original. A chave VTEX precisa do recurso **Cancel order**, além das permissões de leitura existentes. Essa concessão não foi testada numa conta autorizada.

| Rota | Contrato |
|---|---|
| `POST /v1/buyer/vtex/orders/{orderId}/cancel` | Sessão do comprador proprietário do pedido, no tenant correto |
| `POST /v1/admin/vtex/orders/{orderId}/cancel` | Administrador do tenant; não permite cancelar pedidos de outra loja |
| `GET /v1/admin/vtex/checkout/status` | `capabilities.pendingOrderCancellation` informa disponibilidade configurada, sem atestar homologação |

As rotas POST recebem exclusivamente `{ "accepted": true, "quoteHash": "HASH_DO_RESUMO_ORIGINAL" }`. O ID é o pedido canônico Boopay, não um ID VTEX arbitrário. São verificados pedido, checkout, comprador, conexão, tentativa, referência externa e hash. Nenhuma aceitação é inferida de uma consulta. A proteção de origem e os limites HTTP existentes continuam válidos.

O servidor determina `requestedByUser` pela sessão autenticada: comprador → `true`; administrador → `false`. O corpo não aceita escolher esse campo, um destinatário, motivo livre ou dados pessoais. A solicitação externa usa texto fixo conforme o tipo de ator. O journal mantém hash do ator; não publica identidade, contato, CPF, cookies ou credenciais.

A [interface de cancelamento](VTEX-CANCELLATION-UI.md) oferece revisão e aceite inline no Checkout e no detalhe administrativo do pedido. A projeção GET autenticada preserva o acompanhamento após recarga e revogação, sem chamadas externas. O cancelamento de sessão dos contratos ACP/UCP permanece separado; consulta/atualização do pedido canônico usa o resultado conciliado compartilhado.

## Envio durável e recuperação

O fluxo adquire o lease existente da tentativa, confere o vínculo do grupo OMS e consulta o gateway. Quantidades, preço, totalizadores, moeda, perfil, endereço, entrega, canal, vendedor, método e transação precisam continuar compatíveis com o resumo confirmado. Aprovação final (`Finished`), estorno, faturamento, itens alterados ou erro de workflow recusam novas solicitações. O suporte se limita a pedidos ainda pendentes ou já cancelados de uma única transação e comerciante, em grupo de até vinte pedidos.

O registro cifrado em `vtex_operation` acrescenta o primeiro e último aceite, validade, quantidade de solicitações, hash do ator, origem comprador/administrador e estado por pedido: `planned`, `dispatched`, `received`. O registro comercial principal continua preservando a transação original; cancelar não cria uma compra ou novo pagamento.

Antes de cada POST, o adapter relê o grupo e o gateway. A transição para `dispatched` ocorre em transação local que confere autorização, proprietário do lease, validade do aceite de cinco minutos e margem de dezesseis segundos no lease de dois minutos. Só então envia `POST /api/oms/pvt/orders/{orderId}/cancel` na origem fixa, com AppKey/AppToken e sem cookies. Dados de autenticação não vão ao Vault ou a URLs recebidas em payloads. A resposta precisa conter o mesmo ID, data ISO e recibo compatível; isso registra `received`, sem provar o cancelamento final.

Uma etapa enviada não é repetida, inclusive depois de timeout, resposta inválida, reinício, perda do recibo ou troca do proprietário do lease. Uma nova solicitação explícita pode renovar o prazo **somente das etapas não enviadas**, preservando IDs, marcadores anteriores e a origem comprador/administrador. Um grupo parcialmente cancelado continua parcial até existir prova sobre todos os pedidos. Se o lease/prazo acabar antes de terminar o grupo, é necessária nova solicitação explícita para os itens ainda não enviados.

Não há POST de cancelamento no worker automático. O acompanhamento existente usa somente GET e pode reconciliar o resultado posteriormente. Não há reenvio de SendPayments ou gatewayCallback durante o cancelamento. Cookies podem ser removidos pela retenção de 48 horas sem apagar o marcador que impede replay.

## Resultado e limites operacionais

A resposta contém o checkout, pedido e `cancellation`:

- `requested`: a solicitação recebeu recibo ou o OMS já mostra os pedidos cancelados, mas a concordância financeira ainda não foi comprovada.
- `uncertain`: há envio ou consulta sem confirmação suficiente. Um retry não converte um envio sem recibo em recebimento presumido.
- `busy`: outro processo possui o lease da tentativa.
- `completed`: todos os pedidos vinculados estão `canceled`, o gateway está `Cancelled`, não há estorno registrado e os vínculos financeiros continuam íntegros.

Somente a última situação leva o pedido canônico a cancelado. A gravação canônica revalida a conexão dentro da transação; uma resposta posterior à revogação não a restaura. Se a consulta falhar, a resposta mantém o último estado local conhecido e um código de incerteza. Cancelamento não cria receita paga ou receita de estorno de uma promissória pendente.

O vendedor pode negar solicitações fora da janela de cancelamento, e os sistemas nativos podem demorar a concordar. Uma resposta 200 não substitui a observação. A API não fornece precondição atômica sobre status, valores e workflow para essa mutation; mudanças remotas depois da leitura ainda são um limite de homologação. O Boopay não emite comando de estorno PSP neste fluxo e não afirma que impede efeitos financeiros que a própria VTEX possa executar em paralelo.

Pedidos pagos/faturados, devoluções, estornos integrais/parciais, razões livres, novos comerciantes, recurso nativo de negar cancelamento, intervenção em etapas já enviadas e retenção definitiva dos registros/PII permanecem fora desta implementação. Um comando rejeitado ou de resultado desconhecido não é repetido automaticamente; resolução operacional e permissões reais precisam de homologação. A exclusão de perfil Boopay não apaga esses pedidos na VTEX.

## Reproduzir e verificar

Após o build, `npm run vtex:cancellation:demo` faz duas compras e solicitações via HTTP autenticado: uma recebe recibo e outra perde a resposta. As duas permanecem pendentes até uma transição nativa explicitamente sintética. Retries não acrescentam POSTs, o acompanhamento só faz GET, os dois pedidos chegam a cancelados e a receita paga permanece zero. A demo não lê `.env` nem usa conta externa; foi adicionada à CI Linux/Windows.

`test/vtex-cancellation.test.ts` acrescenta treze cenários, incluindo opt-in, aceite/hash, isolamento HTTP, estado financeiro incompatível, grupo parcial, resposta perdida/inválida, reinício, retenção dos cookies, revogação, expiração e dois pools PostgreSQL. `npm run check` passou localmente: **357 declarados, 332 aprovados, zero falhas, 25 PostgreSQL/Firestore reservados**. Doze dos novos cenários passaram localmente. Compilação e demonstração HTTP também passaram. [Evidência local](https://github.com/ThiagoVenturaV/boopay-platform/blob/3ab824e3375d6d5d2956e0ca61aa90100f93a0d7/docs/evidence/vtex-cancellation-local-2026-09-11.json).

A [CI 34581967024](https://github.com/ThiagoVenturaV/boopay-platform/actions/runs/34581967024), no commit `7ed81aba1c10e55ebdcc9d705b97da5874ca2377`, aprovou os seis jobs e **357 cenários distintos de backend**: 354 no PostgreSQL e três no emulador Firestore. Os treze novos cenários passaram, incluindo a prova de dois pools: um recibo atrasado não altera o registro do sucessor nem repete o envio. Linux/Windows aprovaram 332 testes cada e a demo de cancelamento com dois pedidos, dois POSTs e receita paga zero. A regressão de 49 percursos do painel, quatro dos pixels e WooCommerce nativo também passou. [Evidência oficial](https://github.com/ThiagoVenturaV/boopay-platform/blob/3ab824e3375d6d5d2956e0ca61aa90100f93a0d7/docs/evidence/vtex-cancellation-ci-2026-09-11.json). Esses resultados não substituem a homologação externa. A interface acrescentada posteriormente tem provas próprias em [VTEX-CANCELLATION-UI.md](VTEX-CANCELLATION-UI.md).

## Fonte do contrato

O [guia oficial de cancelamento VTEX](https://developers.vtex.com/docs/guides/order-canceling-improvements), consultado em 11/09/2026, descreve a permissão Cancel order, o endpoint OMS, `reason`, `requestedByUser`, o recibo e a possibilidade de recusa pelo vendedor. A [Orders API](https://developers.vtex.com/docs/api-reference/orders-api) mantém as rotas de leitura e cancelamento. Documentação e fixtures não comprovam o comportamento de uma conta real; os demais vínculos usam os contratos já registrados em [VTEX-CHECKOUT.md](VTEX-CHECKOUT.md).
