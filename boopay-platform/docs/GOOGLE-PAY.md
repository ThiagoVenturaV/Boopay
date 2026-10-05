# Google Pay TEST

Implementado em 10/09/2026 como extensão do pagamento existente. `StripeWallet.tsx` usa Express Checkout Element do loader oficial `@stripe/stripe-js` 9.15.0/Dahlia. A prova local é de contrato com SDK/HTTP sintéticos; não é homologação da carteira externa.

## Fluxo e autoridade

Depois de preparar a tentativa e aceitar valor/pedido, o cartão carrega a Stripe. Um grupo Elements separado monta a carteira, usando a mesma conta Connect, valor, moeda e captura manual. Essa separação evita que enviar a carteira valide campos vazios do formulário de cartão. O único botão de carteira permitido é Google Pay em disponibilidade `auto`; Apple Pay, Link, PayPal, Amazon Pay e Klarna ficam desabilitados. O botão é hospedado pela Stripe e só aparece após `ready.availablePaymentMethods.googlePay`; indisponibilidade, falha ou demora de carregamento preservam o cartão.

No clique, a UI congela consentimento e operações concorrentes e mostra o total canônico na carteira. Fechar antes da confirmação apenas libera o formulário e devolve o foco ao botão. A carteira coleta faturamento; não altera endereço de entrega, frete nem a cotação já confirmada. Confirmar executa `elements.submit()` e `stripe.createPaymentMethod({elements})`. Apenas `pm_…` segue para `/buyer/payments/:id/authorize`, com aceite, versão dos termos e hash da vinculação. O gate Woo continua reservando/verificando antes da confirmação pelo servidor; o navegador não chama `confirmPayment`, captura nem registra receita.

O formulário fica montado durante a solicitação. Antes de aplicar a resposta e desmontá-lo, o painel informa falha à carteira quando não há operação de autorização observada com estado compatível. Isso inclui HTTP 200 com operação incerta e resposta de rede perdida. A mensagem pede consulta da tentativa, sem afirmar que uma cobrança falhou. Não há repetição automática. `requires_action` usa o botão já existente **Continuar autenticação** e depois reconcilia pelo servidor. Captura e estorno continuam exigindo confirmação do lojista.

Polling persistido pausa enquanto a carteira está aberta e descarta leituras iniciadas antes da interação. Cancelamento recebido depois de começar a tokenização não é usado para deduzir resultado financeiro. Navegar para outra área desmonta o componente; se a autorização já foi enviada, a recuperação usa a mesma tentativa persistida.

## Configurar um ensaio externo

1. Seguir [PAYMENT-RUNTIME.md](PAYMENT-RUNTIME.md) com chaves de teste e vínculo tenant/integração/conta Connect. O processo rejeita configuração live; não incluir chaves nos repositórios ou capturas.
2. Servir o checkout por HTTPS e registrar o domínio de teste na conta Stripe que recebe a cobrança direta. Verificar suporte da conta, navegador e cartão da carteira. Não forçar `googlePay: always` para fabricar disponibilidade.
3. Confirmar na conta de teste o recebimento do PaymentMethod da carteira e a autorização com captura manual. Registrar ID da tentativa, evidência de modo test e estados, sem token de pagamento ou dados do cartão.
4. Concluir autenticação se solicitada; capturar explicitamente no pedido; conferir webhook assinado, worker, recibo Woo e receita. Estornar integralmente e conferir estoque/receita. Repetir com cancelamento da carteira, recusa e interrupção de rede.
5. Validar o iframe/botão real em desktop e celular, mensagens e foco. A CSP atual permite os hosts Stripe.js/API/hooks quando o runtime está configurado; a política não foi ampliada para scripts Google na página hospedeira. Verificar o comportamento real e eventuais violações antes de homologar.

Nenhuma conta, chave, domínio ou carteira real foi configurada nesta implementação. Abrir o app local por HTTP não constitui ensaio Google Pay. As dependências externas não impedem testar o contrato local, mas impedem declarar integração externa validada.

## Evidência local

O contrato permanece PaymentMethod, já utilizado pelo gate existente. A documentação atual da Stripe recomenda ConfirmationTokens em novas integrações; não foi introduzida uma segunda estratégia de confirmação neste incremento. A alteração Stripe.js PR 959 refere-se a **custom payment methods**, e não constitui evidência de uma nova API de `createPaymentMethod` para carteiras.

Referências oficiais consultadas em 10/09/2026: [Express Checkout e opções de coleta manual](https://docs.stripe.com/elements/express-checkout-element/accept-a-payment?payment-ui=elements), [evento confirm e paymentFailed](https://docs.stripe.com/js/elements_object/express_checkout_element_confirm_event), [tokenização com Elements](https://docs.stripe.com/js/payment_methods/create_payment_method_elements), [confirmação no servidor](https://docs.stripe.com/payments/finalize-payments-on-the-server), [CSP Stripe.js](https://docs.stripe.com/security/guide).

Aplicação local conferida após o build final: health OK, HTML e bundle index-DStkB0Ou.js com HTTP 200. A configuração autenticada permanece desabilitada, sem conexões nem chave pública; o ambiente padrão não carrega a carteira. Nenhuma configuração externa foi alterada.

## Publicação e CI

Código publicado em `c137049ba4c1fe878b092005e52d0c68fd4bd69b`. A [CI 34442060836](https://github.com/ThiagoVenturaV/boopay-platform/actions/runs/34442060836) aprovou os cinco jobs: Linux, Windows, PostgreSQL, navegador e WooCommerce nativo. Logs conferidos: PostgreSQL 121 testes aprovados, zero falhas e zero omissões; navegador 11 + 12 + 4 = 27 aprovados. O ensaio nativo confirmou HTTP/consentimento, captura/estorno explícitos, webhook/inbox, worker e conciliação Woo, estoque 3 → 2 → 3 e receita líquida zero. Stripe permaneceu sintético; esse resultado não demonstra Google Pay externo.

Repositórios da plataforma, plugin e landing verificados como privados. A documentação do plugin aponta para este incremento; fonte e ZIP Woo 0.5.0 não mudaram. SHA-256 reconferido: `fb78ea721d0eccb1f89038c5e18d4e436956799c016db6b09a4b319e5a38c986`. O objetivo do MVP completo continua ativo conforme [DELIVERY.md](CRITERIOS-DE-ACEITE.md).
