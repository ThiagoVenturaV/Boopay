# VTEX: checkout com promissória de teste

Extensão implementada em 10/09/2026 sobre a [inspeção de catálogo](VTEX.md). O Checkout Core cria uma sessão VTEX, calcula o resumo, exige confirmação do comprador e acompanha transaction → SendPayments → gatewayCallback. O resultado suportado é um pedido nativo **pendente**, com promissória. Não há prova de captura de PSP nem receita paga por esse método. Código, HTTP da aplicação e bancos são reais; respostas VTEX dos testes são sintéticas. Homologação em conta externa continua pendente e o MVP integral permanece em construção.

## Ativação explícita

`BOOPAY_VTEX_CHECKOUT_CONNECTIONS=[]` mantém o checkout desligado. A inspeção pública existente continua independente. Cada descritor privado deve apontar para uma conexão de `BOOPAY_VTEX_CONNECTIONS` com o mesmo tenant. Exemplo sem valores secretos:

```json
[{"connectionId":"vtex-test","tenantId":"tenant-demo","revision":1,"mode":"test_promissory","paymentSystem":201,"appKeyEnv":"BOOPAY_VTEX_TEST_APP_KEY","appTokenEnv":"BOOPAY_VTEX_TEST_APP_TOKEN"}]
```

O operador precisa autorizar uma conta dedicada a teste, configurar uma condição nativa no grupo `promissoryPaymentGroup` e habilitar a proteção `CheckoutOrderFormOwnership` na VTEX. O número 201 é apenas exemplo: a condição deve existir na conta e ser confirmada pela resposta nativa. `mode:test_promissory` declara a escolha do operador; **não é uma prova obtida da VTEX de que a conta é sandbox**. Não se deve ativar esse descritor numa operação comercial de produção.

As variáveis privadas são lidas somente pelo processo. AppKey/AppToken ficam cifrados em `vtex_checkout_credentials`, vinculados ao tenant e à conexão, e não são retornados por rotas administrativas. A chave precisa das permissões de leitura das APIs OMS e Payments Gateway; não é enviada às rotas públicas de carrinho ou Vault. Mudanças exigem revisão maior. Uma execução com a revisão anterior fica bloqueada. Rotação somente de credenciais preserva o vínculo comercial necessário para consultar tentativas anteriores; trocar método/conta/canal/vendedor exige tratar contextos incompatíveis.

As três origens exatas devem constar de `BOOPAY_COMMERCE_ALLOWED_ORIGINS`:

- `https://{account}.vtexcommercestable.com.br`: carrinho, transação, callback e leitura OMS.
- `https://{account}.vtexvault.com`: envio da promissória.
- `https://{account}.vtexpayments.com.br`: leitura privada da transação.

HTTPS, ausência de redirecionamento, timeout de 15 segundos e limite de resposta de 2 MB são obrigatórios. Nenhuma URL recebida num payload da VTEX é seguida. Cookies pertencem exclusivamente à primeira origem. O transporte não usa o cookie jar do navegador ou credenciais ambientes.

## Publicar ofertas e comprar

Em Configurações, **Consultar catálogo VTEX** grava a observação administrativa. **Publicar catálogo para teste** é uma ação separada, disponível com o checkout explicitamente configurado. Ela exige snapshot da revisão atual com até 15 minutos e confirma BRL, duas casas decimais, Brasil, canal e promissória nas preferências de um carrinho vazio nativo. Antes da gravação, revalida configuração, revogação e que o snapshot não mudou. A transação publica os produtos no catálogo canônico com o vínculo VTEX.

Somente produtos simples `un`, multiplicador 1, sem kits, ficam ativos para compra. `IsAvailable` não vira quantidade física; `available` permanece desconhecido. Ofertas ausentes na próxima publicação ficam inativas, mas são preservadas: a ausência num índice Search não é evidência de exclusão. A [sincronização incremental](VTEX-CATALOG-UPDATES.md) tem fila/releitura opt-in implementadas; a [interface da fila](VTEX-CATALOG-UI.md) acompanha estados e limites. Instalação da ponte, sua auditoria e comprovação de remoção continuam pendentes.

No Checkout, o comprador informa contato, CPF de teste com onze dígitos, rua, número, bairro, complemento e CEP. O formato do CPF é validado; não há validação de existência ou titularidade. Entrega e cobrança usam o mesmo endereço nessa modalidade. A VTEX recebe identidade apenas no fluxo da compra, com `optinNewsLetter:false`; a criação da transação envia `savePersonalData:false`. O servidor exige a identidade retornada sem mascaramento e o cookie de propriedade. Uma conta que exige autenticação nativa adicional para alterar o perfil conhecido não está homologada por esses testes.

O backend cria um carrinho vazio no canal configurado, adiciona itens, preferências, referência única de tentativa, contato, entrega e pagamento. Consulta novamente o carrinho para calcular o resumo do Core. O `utmSource` tem marcador `boopay-UUID`, usado na recuperação; promoções condicionadas a UTM podem alterar o valor, por isso ele é aplicado antes da cotação. Itens, quantidades, vendedor, contato, endereço, cupom, frete, forma de pagamento, totalizadores e validade são conferidos. Kits, retirada, agendamento, presente, pagamentos combinados e múltiplos comerciantes são recusados.

Valores vêm da resposta nativa, em centavos. O subtotal dos itens, descontos, frete e impostos precisam fechar com o total; o arredondamento de `priceDefinition` precisa fechar com a quantidade. A opção selecionada de entrega deve cobrir todos os itens. O Core versiona a cotação; uma alteração exige nova revisão e confirmação. Antes do envio, o adaptador consulta novamente o carrinho e exige o mesmo resumo confirmado. Ainda existe uma janela entre a consulta e o processamento remoto: não se afirma garantia atômica da VTEX contra mudanças concorrentes. Divergências observadas no pedido bloqueiam sua aceitação canônica.

O método é `vtex_promissory_test` nos detalhes e `vtex:vtex_promissory_test` na conclusão. WooCommerce continua limitado aos próprios métodos; a inclusão desse enum não autoriza executar promissória em outro adaptador. A interface preserva a modalidade ao iniciar outra compra, limpa os dados pessoais e exige novo consentimento.

## Registro durável e resultado incerto

Antes de cada POST não idempotente, `VtexOperations` registra a etapa em `vtex_operation`, na mesma transação que valida autorização e lease. O registro vincula referência do Core, orderForm, marcador, hash do resumo, configuração comercial, total e prazo da confirmação. Cookies e IDs privados da transação/grupo são cifrados com contexto tenant/conexão/referência. O lease dura dois minutos; uma execução atrasada não pode avançar etapas de um novo proprietário.

| Etapa | Requisição | Evidência necessária para avançar |
|---|---|---|
| Transação | `POST /api/checkout/pub/orderForm/{id}/transaction` | Mesmo carrinho, canal, total, comerciante e método; IDs nativos de transação/grupo |
| Pagamento | `POST https://{account}.vtexvault.com/api/payments/transactions/{id}/payments?orderId={group}` | HTTP 201 da promissória; não significa captura |
| Processamento | `POST /api/checkout/pub/gatewayCallback/{group}` | Leitura posterior do OMS e transição correspondente do gateway; HTTP 200 sozinho é insuficiente |

O código persiste `*_dispatched` antes do HTTP e `*_received` depois do recebimento válido. Uma etapa enviada sem resposta não é repetida. Se a transação já criou um grupo, o backend procura o `utmSource` entre pedidos completos e incompletos e lê os pedidos individualmente. A busca é limitada e exige paginação completa; não usa o campo `q` como se ele aceitasse orderForm. Recuperar IDs não é suficiente para reenviar um pagamento já despachado.

Pedidos são vinculados ao orderForm, marcador, canal, vendedor, identidade, endereço, modalidade/prazo de entrega, itens, quantidades, valores, método e transação. São aceitos até vinte pedidos de um mesmo grupo e uma única transação do comerciante configurado; o Core usa `group:{id}` como referência agregada. Grupos/vendedores ou transações divergentes exigem conciliação.

Perda da resposta de transação com cookies recuperáveis pode permitir enviar apenas as próximas etapas ainda não despachadas, dentro do prazo. Perda completa dos cookies pode impedir a continuação. Perda da confirmação de SendPayments não permite saber que o pagamento foi recebido: a etapa fica incerta até uma transição posterior vinculada no gateway. A leitura usa uma lista explícita de estados já em processamento; estado desconhecido ou `Started` não confirma processamento. A confirmação local nunca é renovada automaticamente. Após expiração, etapas comerciais novas são bloqueadas, mas a leitura da tentativa original continua possível.

Pedido pendente não alimenta receita paga. Aprovação manual, `Finished`, reembolso parcial ou alteração de status de promissória não são prova de captura de PSP: ficam em conciliação quando não correspondem ao estado suportado. Cancelamento integral só é observado como tal quando OMS e gateway concordam. Desde 11/09/2026, a [solicitação de cancelamento pendente](VTEX-CANCELLATION.md) é opt-in, exige novo aceite autenticado e registra cada envio; não implementa estorno PSP ou cancelamento automático pelo worker.

## Operação, acesso e retenção

| Rota adicional | Contrato |
|---|---|
| `GET /v1/admin/vtex/checkout/status` | Estado privado sanitizado e capacidades dessa modalidade |
| `POST /v1/admin/vtex/:id/publish` com `{}` | Publicar snapshot recente após confirmar preferências nativas |
| `POST /v1/admin/vtex/:id/reconcile` com `{ "after": "cursor-opcional" }` | Consultar até 100 tentativas do Core, com `nextCursor` e contagem restante |
| `GET /v1/buyer/commerce-stores` | Inclui conexões VTEX privadas ativas configuradas neste processo |
| Rotas comuns de checkout | Criar, revisar, confirmar, concluir e consultar a própria tentativa |

As rotas administrativas exigem sessão do tenant; POST também exige a origem exata do Boopay. O comprador não publica catálogo ou consulta tentativas alheias. A reconciliação percorre apenas compras originadas no Core, sem importar toda a carteira de pedidos da loja. O painel permite consultar o próximo lote. Desde 11/09/2026, o [acompanhamento automático](VTEX-OBSERVATION.md) consulta as tentativas existentes somente por GET, em lotes de cinco, com orçamento diário, lease e backoff persistidos; não retoma etapas comerciais. Webhooks de pedidos VTEX continuam pendentes.

Revogar a conexão remove snapshot e credenciais cifradas locais, inativa produtos e bloqueia novas operações. Reinício ou rotação não desfaz revogação. Uma operação já aceita pela VTEX pode continuar lá; revogar o Boopay não cancela pedidos remotos. A autorização é conferida antes de cada chamada e em cada gravação do journal/publicação.

Os cookies do journal expiram em até 48 horas e os do contexto privado do Core são removidos após 48 horas da criação do checkout. O processo executa a limpeza no início e no ciclo de retenção de um minuto, inclusive para identidades VTEX removidas da configuração atual. A limpeza não faz chamadas externas. Identidade/endereço cifrados e referências mínimas continuam para acompanhamento; política final de retenção de PII e expurgo remoto de carrinhos/perfis ainda precisam de implementação. Não se promete apagamento na VTEX por cancelar a sessão local.

## Evidências reproduzíveis e pendências

`npm run build` seguido de `npm run vtex:checkout:demo` exercita HTTP/Core/SQLite com dois pedidos sintéticos de R$ 26,01: um fluxo normal e uma perda de confirmação no Vault. O ciclo automático resolve a segunda tentativa após transição sintética nativa, sem reenviar SendPayments. A saída registra o estado do acompanhamento, dois pedidos pendentes, dois envios de transação, dois de pagamento, um callback e receita paga zero. Não lê `.env` nem chama conta externa.

Permanecem necessários: homologação em conta autorizada, confirmação da matriz de campos/cookies e perfis, pagamento PSP sandbox integrado à VTEX, garantia de consistência sob concorrência remota, homologação da sincronização incremental e remoções, auditoria da ponte Broadcaster, homologação do cancelamento pendente com interface implementada, pós-compra de pedidos pagos/estorno, múltiplos comerciantes e retenção final/expurgo remoto. A modalidade agora passa pelos contratos [ACP/UCP](PROTOCOL-COMMERCE.md), com coleta de CPF/número/bairro na revisão do comprador antes de calcular e confirmar. Essa extensão não cria um handler PSP delegado. Esta etapa não conclui o adaptador VTEX integral nem a meta completa.

## Contratos consultados

Schemas oficiais da revisão `347a911aee100ca55b3fc83651acddd28ad68b7e`: [Checkout](https://github.com/vtex/openapi-schemas/blob/347a911aee100ca55b3fc83651acddd28ad68b7e/VTEX%20-%20Checkout%20API.json), [Orders](https://github.com/vtex/openapi-schemas/blob/347a911aee100ca55b3fc83651acddd28ad68b7e/VTEX%20-%20Orders%20API.json), [Payments Gateway](https://github.com/vtex/openapi-schemas/blob/347a911aee100ca55b3fc83651acddd28ad68b7e/VTEX%20-%20Payments%20Gateway%20API.json).

Há divergências entre exemplos antigos e o contrato operacional: a [nota oficial de 15/05/2026](https://developers.vtex.com/updates/release-notes/2026-05-15-updated-vtexvaultcom-route-for-send-payments-request) tornou obrigatória em 01/09/2026 a origem `{account}.vtexvault.com`. O cliente não tenta os hosts antigos como fallback. A forma real da resposta de transaction foi conferida no [guia de pedido a partir do carrinho](https://developers.vtex.com/docs/guides/creating-a-regular-order-from-an-existing-cart); o schema que remete genericamente a orderForm não é tomado como prova da transação. A proteção de propriedade e as particularidades de identidade vêm do [guia headless](https://developers.vtex.com/docs/guides/headless-cart-and-checkout). Exemplos e fixtures não comprovam comportamento de uma conta real.
