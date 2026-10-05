# Confirmação e conciliação — versão 0.3.0

O cliente comercial e a suíte de integração estão no repositório privado [boopay-platform](https://github.com/ThiagoVenturaV/boopay-platform). O Checkout Core da plataforma privada consome esta proteção na jornada WooCommerce, exercitada em ambiente nativo de teste. O estado de validação externa está em [ESTADO-ATUAL](../../../boopay-platform/docs/ESTADO-ATUAL.md).

## Contrato de confirmação

`GET /wp-json/boopay/v1/commerce/capabilities` informa `guardVersion: boopay-checkout-v2`, `operationVersion: boopay-operation-v1`, disponibilidade, moeda e casas decimais. O cliente v1 exige o plugin histórico 0.2.1; o cliente v2 exige 0.3.0. Não existe downgrade silencioso.

O backend envia no POST `/wp-json/wc/store/v1/checkout`:

- `X-Boopay-Checkout`: JSON exato com `version`, `checkoutRef`, `quoteHash`, `cartTokenHash`, `expectedTotal`, `currency`, `issuedAt`, `expiresAt`, `items`, `shippingHash`, `billingHash` e `paymentMethod`.
- `X-Boopay-Checkout-Signature`: Base64 do HMAC-SHA256 de `boopay-checkout-v2\n` seguido dos bytes do JSON, usando o segredo da integração. `\n` representa uma quebra de linha real.
- `Cart-Token`: sessão nativa da Store API, vinculada por SHA-256 no comprovante.

Os campos de endereço são selecionados, ordenados por chave e serializados em JSON UTF-8 sem escapar barras ou Unicode antes do SHA-256. São vinculados nome, sobrenome, logradouro, complemento, cidade, estado, CEP e país; a cobrança inclui e-mail e telefone. O método suportado nesta etapa é `bacs`, com `payment_data` vazio. Os hashes vinculam os endereços enviados; normalizações internas do WooCommerce continuam sob autoridade da loja.

O comprovante vale até cinco minutos. Antes da execução, o plugin verifica assinatura, prazo, carrinho, endereços e método. Depois do cálculo, confere itens, moeda e total em centavos; repete a verificação imediatamente antes do gateway. O WordPress aplica magic quotes aos headers em `$_SERVER`; `wp_unslash` restaura os bytes assinados. Sem header Boopay, o checkout nativo mantém seu comportamento.

## Tentativa única e falhas

A tabela própria `{prefix}boopay_operations` mantém uma chave primária derivada da integração e da referência. O `INSERT IGNORE` registra a tentativa antes de executar o checkout. Uma repetição equivalente retorna `boopay_operation_exists`; reutilizar a referência com outro conteúdo retorna `boopay_operation_conflict`. Renovar apenas o prazo não cria outra operação.

Cada registro começa em `dispatching`. A tentativa vincula exclusivamente um pedido WooCommerce e seu proprietário atravessa uma única transição atômica para `committing`, antes do gateway. O resultado HTTP marca `finished` ou `failed`. Esses estados descrevem a requisição; nenhum deles é, por si só, prova de pagamento. Todos os pedidos usam CRUD WooCommerce, sem SQL direto em tabelas de pedidos.

O plugin não reenvia uma compra automaticamente. Se o processo cair, o registro pode continuar em `dispatching` ou `committing`. Uma falha entre vincular o ID e gravar os metadados pode exigir conciliação manual. Não há desbloqueio por tempo, cancelamento automático, estorno automático ou garantia de execução distribuída exatamente uma vez. A proteção impede nova entrada no gateway para a mesma tentativa enquanto o registro existe.

## Consulta autenticada

`POST /wp-json/boopay/v1/commerce/operations/lookup` recebe `{"checkoutRef":"referencia_confirmada"}` e:

- `X-Boopay-Operation-Timestamp`: instante Unix em segundos, com tolerância de cinco minutos.
- `X-Boopay-Operation-Signature`: Base64 HMAC-SHA256 de `boopay-operation-v1\nlookup\n{timestamp}\n{JSON exato}`.

O endpoint exige conexão ativa e seu segredo. Pesquisa somente o namespace da integração atual. Retorna `found`, referência, hash da cotação, estado e código seguro de erro. Quando o pedido e seus metadados correspondem à operação, retorna ID, status, total em centavos, moeda e `isPaid`. Nunca retorna nome, endereço, e-mail, token, segredo ou chave do pedido.

Resposta perdida após o pedido ser criado deve ser recuperada por esta consulta. `found: false`, pedido ausente ou consulta indisponível não autorizam uma nova compra. O backend ainda precisa persistir a intenção, vincular a confirmação do comprador, validar referência/hash/total e reconciliar seu estado local.

`payment_result: success` com pedido `on-hold` continua sendo pendência financeira. A transferência bancária de teste não produz receita paga nem valida Stripe/Google Pay.

## Retenção e validação

Registros mínimos de operação e metadados do pedido são preservados na desinstalação para manter rastreabilidade e evitar apagar tentativas não conciliadas. Não contêm endereços brutos ou credenciais. Uma nova conexão não acessa os registros da integração anterior. A política final de retenção e eliminação do produto permanece pendente.

O relatório da versão em `marketplace/VALIDATION-0.3.0.md` registra as verificações efetivamente executadas. A aprovação no Marketplace, a matriz mínima de versões e pagamentos com PSP são etapas separadas.

Referências: [Checkout WooCommerce 11.0.1](https://github.com/woocommerce/woocommerce/blob/11.0.1/plugins/woocommerce/src/StoreApi/Routes/V1/Checkout.php), [CheckoutSchema](https://github.com/woocommerce/woocommerce/blob/11.0.1/plugins/woocommerce/src/StoreApi/Schemas/V1/CheckoutSchema.php). Essa versão adia a criação do pedido até o POST e não implementa o `expected_total` mostrado na documentação mais recente; a proteção verifica o pedido autoritativo antes do pagamento.
