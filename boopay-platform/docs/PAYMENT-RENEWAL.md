# Retomar um pagamento ou uma compra de teste

10/09/2026. Implementação local/sandbox, opt-in, para o gateway WooCommerce Stripe TEST. A retomada mantém o aceite do comprador e o histórico financeiro. Nenhuma credencial externa foi configurada.

## Cartão recusado

A autorização pode terminar em `requires_payment_method`. O adaptador aceita a observação contida em um HTTP 402 apenas quando o envelope é `card_error` e o PaymentIntent de teste corresponde à referência, conta, moeda, valor e hash do pedido, sem valor capturado ou capturável. Outros campos do erro são descartados; erro inválido ou resposta perdida permanece incerto. A Stripe documenta o [PaymentIntent nos erros](https://docs.stripe.com/api/errors) e a [retomada após recusa](https://docs.stripe.com/payments/paymentintents/lifecycle).

Cada autorização possui uma sequência começando em zero. Ela só avança quando a autorização anterior foi observada e o pagamento aguarda outro método, com valores capturado/capturável iguais a zero. O GET sem mudança depois de um POST perdido não encerra a operação anterior. O retorno de uma autenticação já observada para `requires_payment_method` também permite novo aceite.

O comprador envia `accepted:true`, `termsVersion`, `bindingHash`, `authorizationSequence` e nova credencial tokenizada em `POST /v1/buyer/payments/:id/authorize`. A ausência da sequência equivale a zero para preservar chamadas antigas. Pular a sequência ou reutilizar a operação com outro payload é recusado. O formulário apaga o aceite anterior e só carrega novamente após o novo aceite.

Uma nova sequência ganha chave própria, no mesmo PaymentIntent e pedido. Repetir uma sequência preserva a chave e o payload originais. O histórico das autorizações permanece; payload privado resolvido é eliminado. A janela de autorização de 23 horas desde a criação da tentativa e a revalidação da reserva Woo continuam aplicáveis. O endpoint de autorização aceita sequências de 0 a 100. Não há repetição financeira automática.

## Compra cancelada

Um PaymentIntent cancelado é terminal e não pode ser reutilizado. [Ciclo Stripe](https://docs.stripe.com/payments/paymentintents/lifecycle). **Retomar compra** solicita confirmação inline e chama:

```http
POST /v1/buyer/payments/:id/renew
Content-Type: application/json

{"accepted":true,"termsVersion":"boopay-stripe-sandbox-2026-09-10","bindingHash":"<hash retornado pela tentativa>"}
```

A rota exige o comprador proprietário e conexão ativa para criar a cotação. Consulta o PSP, exige cancelamento sem captura/estorno e executa a compensação comercial idempotente. Só prossegue após recibo Woo de cancelamento com estoque devolvido e pedido canônico cancelado. Divergência ou resultado incerto mantém a retomada bloqueada.

Um registro durável `psp_renewal` reserva um único ID de checkout por tentativa cancelada, dentro da transação do tenant. A criação usa o ID reservado no Core, recalcula a cotação com a loja e reutiliza os itens e os dados comerciais privados ainda disponíveis. Falha de cotação preserva a reserva para recuperação. Concorrência ou perda da resposta não cria outra sessão; uma sessão já criada pode ser recuperada mesmo se a conexão for posteriormente revogada.

O retorno é um checkout sem confirmação, pedido ou pagamento. O comprador revisa o resumo e confirma novamente antes de criar o novo pedido e preparar um novo PaymentIntent. O pedido cancelado, a tentativa anterior e seus recibos permanecem preservados. `GET /v1/buyer/payments/:id` e a leitura administrativa incluem `renewal:{checkoutId,createdAt}` quando há reserva, sem copiar dados pessoais para esse vínculo.

## Evidências e limites

A [CI 34552051127](https://github.com/ThiagoVenturaV/boopay-platform/actions/runs/34552051127), commit `72a265f260b7beb0ee0eb524bd9ab8551eada348`, aprovou os seis jobs: 260 testes no PostgreSQL + 3/3 no Firestore, 43 percursos de navegador, demos Linux/Windows e Woo/PHP/MySQL nativo. A prova nativa confirmou a recusa e segunda autorização no mesmo intent; em seguida, cancelamento com estoque 3 → 2 → 3, cotação de retomada sem pedido/aceite e repetição da mesma sessão; após novo aceite, outro pedido/intent, captura/estorno e estoque novamente 3 → 2 → 3, receita líquida final zero. Três intents correspondem ao primeiro pedido estornado, ao pedido cancelado e ao novo pedido estornado; duas capturas e dois estornos explícitos, nenhum na cotação de retomada. Stripe HTTP permaneceu sintético.

A primeira execução parou no segundo checkout: o relógio de teste havia avançado 122s para exercitar o worker, e o plugin recusou corretamente uma assinatura emitida mais de 30s no futuro. O ensaio passou a iniciar o cenário independente com horário real e a verificar explicitamente o resultado de confirmação/conclusão. Não houve mudança nos limites de assinatura ou no código de produção para contornar a recusa.

Não cobre recuperação da identidade do comprador, dados privados já eliminados, refunds manuais divergentes, restauração parcial de estoque, lojas externas homologadas ou pagamentos delegados ACP/UCP. Stripe/Google Pay reais de teste, rotação de contas, política operacional de retenção e ambientes externos permanecem no [plano de entrega](CRITERIOS-DE-ACEITE.md).
