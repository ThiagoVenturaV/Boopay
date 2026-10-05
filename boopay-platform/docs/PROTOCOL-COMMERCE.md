# ACP/UCP com WooCommerce, Shopify e VTEX

Extensão de 10/09/2026. Os dois protocolos usam os adaptadores do mesmo Checkout Core e preservam a confirmação pela sessão do comprador. O handler bilateral `br.com.boopay.pending_order` aceita somente os métodos abaixo. Ele não é um processador de cartão nem um meio de pagamento homologado por uma superfície externa.

O [cadastro e a autorização visual](PROTOCOL-ACCESS.md) estão em Configurações e `/protocol-access`. O comprador precisa usar a mesma sessão para conceder o acesso e revisar a compra; a credencial delegada não substitui sua confirmação.

| Plataforma | Método do Core | Evidência e resultado |
|---|---|---|
| WooCommerce | `woocommerce:bacs` | Jornada HTTP/PHP/MySQL nativa já verificada; pedido BACS pendente, sem receita paga. |
| Shopify | `shopify:shopify_pending` | Contrato Admin GraphQL sintético; rascunho calculado, confirmação explícita, pedido pendente na loja de desenvolvimento. |
| VTEX | `vtex:vtex_promissory_test` | Contrato Checkout/Vault/Gateway/OMS sintético; dados privados no navegador, cotação nativa, confirmação e promissória pendente. |

UCP exige que o cliente tenha negociado esse handler na versão fixada. O seletor público `boopay-pending-order` só determina a modalidade de teste; não concede autorização de compra. Stripe, carteiras e outros métodos continuam recusados por este handler. As versões ACP 2026-04-17 e UCP 2026-08-25 e seus contratos inventariados não foram alterados.

## Revisão e dados privados

Criação exige produtos de uma única conexão, endereço brasileiro e contato válidos. Os IDs de produto determinam a plataforma; preço enviado pelo agente nunca é autoridade. Na Shopify, o adaptador já calcula a cotação e o comprador precisa revisar e confirmar.

CPF, número e bairro específicos da VTEX não são campos deste perfil ACP/UCP. A sessão VTEX nasce em `requires_information`, sem cotação confirmável, sem confirmação e sem criar carrinho remoto. O registro privado cifra contato/endereço, mantém contexto remoto nulo e conserva os limites temporais da sessão. A resposta apresenta `requires_escalation`, `continue_url` sem token, mensagem de dados necessários e valores do catálogo rotulados como estimativa parcial. Não declara frete gratuito nem usa a política financeira do simulador. UCP exige uma entrada subtotal e uma total; enquanto não há cotação, ambas representam somente os produtos estimados, com rótulo e mensagem explícitos.

O comprador abre `/protocol-review?checkout=...` na mesma sessão que autorizou o cliente. O formulário existente recupera o contato e solicita os campos faltantes. Após preencher, o comprador calcula a cotação VTEX e confirma seu hash e versão. O token delegado não acessa `/confirm`. O agente pode então concluir; a conclusão não transforma pedido pendente em receita paga. Esse uso de transferência para o comprador segue a distinção entre informação faltante e revisão na [especificação UCP](https://ucp.dev/specification/shopping/checkout/) e o ciclo de intervenção do [ACP](https://www.agenticcommerce.dev/docs/reference/checkout), com validação pelos schemas locais fixados.

Uma atualização ACP/UCP invalida a confirmação anterior. Na VTEX também descarta os campos privados preenchidos na revisão e o contexto remoto: o comprador fornece novamente CPF/número/bairro, calcula e confirma. Isso evita reaproveitar silenciosamente dados privados após mudança de destinatário. PUT UCP continua substituindo os campos graváveis; atualização ACP não aceita os campos exclusivos de criação. Respostas aos agentes não incluem CPF, `vtex`, cookies nativos nem credenciais da loja. Os dados padronizados de contato/endereço permanecem visíveis ao cliente autorizado conforme o perfil existente.

## Repetição, recuperação e limites

Reserva de idempotência, tentativa do Core e journal do adaptador permanecem os mesmos. Resposta perdida retorna `complete_in_progress`, sem `order`. GET consulta a tentativa original; não envia outro pedido. Na VTEX, uma resposta perdida do Vault não autoriza reenvio: a recuperação depende da evidência nativa de processamento. Repetir POST com a mesma chave devolve a resposta original armazenada, mesmo depois da recuperação; GET informa o estado atual.

Esta extensão não implementa PSP delegado, AP2, cobrança de cartão Shopify/VTEX, rastreamento físico, expurgo remoto, recuperação assistida, cadastro/consentimento visual de clientes, nem homologação externa. Permanecem as limitações comerciais e de concorrência descritas em [Shopify](SHOPIFY.md), [VTEX](VTEX-CHECKOUT.md) e [Protocolos](PROTOCOLS.md). Sessões e respostas temporárias mantêm retenção de 48h; os dados operacionais privados do Core seguem a política separada já documentada.

## Reprodução e evidências

O código `e2ae09e03f32f8e361a14fc7b4c829a9dc887379` passou nos seis jobs da [CI 34548214542](https://github.com/ThiagoVenturaV/boopay-platform/actions/runs/34548214542): 253 cenários distintos de backend entre PostgreSQL e Firestore, 37 percursos de navegador, WooCommerce nativo, demos Linux/Windows e auditoria sem vulnerabilidades. Isso não altera o limite sintético das respostas nativas Shopify/VTEX.

Após `npm run build`:

```powershell
npm run protocols:commerce:demo
node --test dist/test/protocol-commerce.test.js
npx playwright test --project=protocol-commerce
```

A demo não lê `.env` nem acessa conta externa. Exercita quatro compras por HTTP injetado no servidor real: Shopify/VTEX × ACP/UCP, com identidades sintéticas, assinatura das respostas verificada, confirmação separada e repetição do mesmo pedido. Os valores de teste são R$ 25,00 Shopify e R$ 26,01 VTEX; receita paga zero.
