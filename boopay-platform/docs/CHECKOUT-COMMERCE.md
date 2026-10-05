# Checkout Core com loja conectada

O mesmo recurso `/v1/buyer/checkouts` atende o simulador local e produtos de uma conexão comercial. A autoridade é derivada do produto persistido, não de um campo enviado pelo comprador. O primeiro adaptador conectado é WooCommerce com o plugin 0.3.0 e transferência bancária (`bacs`), cujo resultado inicial é um pedido pendente. O runtime e a interface Stripe/Google Pay TEST são descritos em [PAYMENTS.md](PAYMENTS.md), com seus limites de homologação.

## Configuração

A Shopify usa a configuração e os limites próprios de [SHOPIFY.md](SHOPIFY.md), com o método explícito `shopify_pending` e conclusão `shopify:shopify_pending`. BACS/Stripe permanecem métodos WooCommerce. A integração Shopify ainda não fornece prova de liquidação nem garantia atômica entre a leitura do resumo e a conclusão remota.

A [VTEX](VTEX-CHECKOUT.md) acrescenta `CommerceAdapter` com promissória de teste: `vtex_promissory_test` nos detalhes e `vtex:vtex_promissory_test` na conclusão. Exige configuração privada, proteção de propriedade do carrinho e publicação explícita de ofertas após confirmar moeda/canal nativos. Registro durável precede cada etapa de transação, pagamento e callback; resultado incerto consulta a tentativa original. Pedido pendente não comprova captura. A inspeção pública isolada continua fora do catálogo comercial, com `checkoutAvailable:false` e `finalTotal:null`. A modalidade passa por [ACP/UCP](PROTOCOL-COMMERCE.md), com os campos privados coletados na revisão do comprador. Homologação externa permanece pendente.

O operador configura `BOOPAY_COMMERCE_ALLOWED_ORIGINS` com origens exatas das lojas de teste, separadas por vírgula. Exemplo local: `http://127.0.0.1:9400`. Não incluir caminho ou barra final. Lojas remotas exigem HTTPS e o transporte recusa redirecionamentos. Conectar o plugin não adiciona automaticamente sua URL à lista autorizada.

O catálogo registra `integrationId`. Registros legados ainda podem recuperar esse vínculo do watermark de sincronização. O carrinho deve conter produtos ativos de uma única conexão. Estoque e preço sincronizados ajudam na descoberta; os valores comerciais são calculados novamente pela loja. O backend não debita o estoque local de um pedido WooCommerce: ele recebe a atualização posterior pelo plugin.

## Dados, revisão e confirmação

A criação e a atualização recebem `commerce` com `shipping`, `billing`, `couponCode` opcional e `shippingSelection`. Endereços usam `firstName`, `lastName`, `addressLine1`, `addressLine2`, `city`, `region`, `postalCode` e `country: BR`. Cobrança inclui `email` e `phone`. A seleção de entrega contém `packageId` e `rateId`, obtidos nas opções da cotação.

Os detalhes e o token nativo do carrinho são armazenados em AES-256-GCM, com contexto de tenant e sessão. O resumo comum, listagens administrativas e eventos não contêm endereço bruto ou token. Somente o comprador autenticado dono da sessão pode recuperar seus detalhes pelo endpoint específico. O hash da cotação inclui o hash desses dados e a política comercial. Uma alteração de endereço ou cotação exige nova confirmação.

O cliente confirma `quoteId`, `quoteHash`, `accepted: true` e `checkout.commerce.termsVersion`. A declaração visível autoriza criar o pedido na loja, com pagamento por transferência pendente. A assinatura enviada ao plugin nunca ultrapassa a expiração da cotação confirmada.

## Envio e recuperação

Antes da chamada comercial, uma transação grava confirmação, referência da tentativa, chave de idempotência, estado `submitting` e evento de início. Chamadas de rede ocorrem fora de transações SQL. Submissões concorrentes retornam o estado da mesma compra e não criam outra tentativa.

Uma falha comprovadamente anterior ao POST permite revisar uma nova cotação. Quando o POST pode ter ocorrido, a operação fica em `reconciliation_required`. Esse estado sobrevive ao reinício e não vira cancelamento ou abandono apenas por expiração da sessão. Atualização e cancelamento não podem liberar outra compra enquanto o resultado estiver incerto.

A conciliação consulta a referência original no plugin, verificando hash, total, moeda e vínculo com o pedido. Um resultado ausente ou uma consulta indisponível mantém a pendência; não reenvia a compra. A interface permite consultar novamente. Registro local após falha entre o commit WooCommerce e a resposta HTTP usa o mesmo ID de pedido. Uma observação concorrente não sobrescreve uma revisão local mais recente da tentativa.

`checkout.status: completed` significa que o pedido autoritativo foi identificado. O status financeiro separado pode ser `pending`, `paid`, `failed`, `canceled` ou `reconciliation_required`. Só `paid` entra na receita paga. Ajustes remotos sem informação suficiente, como um status de estorno sem detalhe financeiro, ficam para conciliação. Estornos e cancelamentos remotos automáticos ainda não estão implementados.

## Rotas adicionais

| Método | Recurso | Acesso |
|---|---|---|
| GET | `/v1/buyer/commerce-stores` | Comprador; conexões ativas autorizadas pelo operador |
| GET | `/v1/buyer/checkouts/:id/commerce-details` | Somente o comprador dono da sessão |
| POST | `/v1/buyer/checkouts/:id/reconcile` | Somente o comprador dono da sessão |
| POST | `/v1/admin/orders/:id/reconcile` | Operador do tenant do pedido |

`POST .../complete` usa `{ "paymentMethod": "woocommerce:bacs" }` e `Idempotency-Key`. Reutilizar a chave após revisar outra cotação não autoriza uma nova tentativa. Uma chave usada em outro checkout ou corpo é recusada.

## Evidências e limites

Os testes locais cobrem consentimento antes do envio, oito chamadas concorrentes, privacidade, isolamento, preço autoritativo, receita pendente igual a zero, atualização posterior para pago, expiração, alteração de endereço, falha anterior ao envio e recuperação após fechar/reabrir SQLite. Os testes de navegador cobrem o contrato da interface em 1440 e 390 px, incluindo revisão, recarga e consulta da pendência; os dados comerciais desses dois testes são fixtures explícitas.

A suíte nativa em `tools/woocommerce` exercita a API HTTP real, WordPress, plugin e MySQL, descartando uma resposta após criar o pedido e interrompendo a primeira consulta. Passou na [CI 34423897973](https://github.com/ThiagoVenturaV/boopay-platform/actions/runs/34423897973), commit `45b1efe7bcbe71c2000878e041c53ea699fe8381`, junto com Linux, Windows, PostgreSQL e navegador. Ambiente: WordPress 7.0.4, WooCommerce 11.0.1, PHP 8.3.33 e MySQL 8.0.

O núcleo persistiu confirmação e tentativa antes do POST, manteve `reconciliation_required` após perder as respostas e recuperou o pedido por consulta. A mesma chave de repetição retornou o mesmo ID local. Houve um único envio comercial, pedido pendente de R$ 158,82, estoque reduzido de três para uma unidade e sincronização de volta ao catálogo. O resumo contabilizou um pedido pendente e nenhuma receita paga. O teste usa dados e loja efêmeros; não movimenta dinheiro real.

Esta etapa não valida hospedagem de produção, contas de PSP, fretes ou gateways de terceiros, matriz de versões antigas, Marketplace, protocolos oficiais ou receita incremental. Operação automática da conciliação, tratamento de ajustes/estornos remotos e retenção final de dados ainda exigem implementação.
