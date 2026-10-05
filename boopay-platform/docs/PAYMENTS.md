# Pagamentos sandbox: provedor, operações e notificações

Atualizado em 10/09/2026. A integração Stripe inclui `WooPaymentGate`, confirmação, cancelamento e estorno do pedido através do plugin opt-in 0.5.0. O [runtime HTTP e worker](PAYMENT-RUNTIME.md) está ligado a `src/main.ts` mediante configuração sandbox explícita por loja; o padrão permanece desabilitado. A [interface financeira](PAYMENT-UI.md) conecta seleção de cartão, consentimento, Stripe.js/3DS, estado e confirmação de operações. **Nenhuma chave foi configurada; não houve homologação com credenciais externas ou Google Pay TEST.** O plugin possui endpoints internos assinados; a plataforma oferece rotas separadas para comprador, lojista e webhook autenticado.

## Cancelamento e estorno no WooCommerce — 0.5.0

`PaymentOperations.compensate` consulta o PSP e exige cancelamento terminal ou refund integral `succeeded`. Refund pending/failed e simples autorização não liberam estoque nem alteram a receita. `WooPaymentGate.compensate` preserva o vínculo original e chama o endpoint assinado da loja. O cancelamento fecha pedido não pago; o estorno cria `WC_Order_Refund` com linhas/frete/impostos e `refund_payment=false`, pois os fundos já foram devolvidos pelo PSP.

No plugin, resultado terminal, refund e estoque ficam na mesma transação MySQL/InnoDB, sob lock por pedido. No ensaio nativo, interromper o processo após a escrita de estoque e antes do commit desfez refund e estoque juntos; perder a resposta após commit permitiu recuperar a mesma referência. A tabela própria mantém unicidade de refund/intent/pedido. Recibos exigem estado, IDs e confirmação de estoque; dados divergentes ficam incertos. A recuperação comercial continua disponível após 24 horas e após limpeza dos payloads privados, sem novo POST financeiro.

Se a confirmação Woo permanecer incerta, o estorno PSP pode iniciar após a lease quando a captura é conhecida. A compensação terminal invalida a confirmação pendente para impedir que uma resposta tardia restaure estado pago. Após ajuste nativo, a conciliação canônica projeta o pedido, `order.refunded`, outbox e receita uma vez, preservando a data da primeira observação. A sincronização de catálogo lê o estoque autoritativo.

O fingerprint financeiro do gateway 0.5.0 permite compensação após mudança de endereço sem mudança de itens/valores. Mudança financeira, produto removido, estoque parcial ou refund manual anterior exige conciliação; não se estima estoque nem se altera total para forçar sucesso. Pedidos antigos sem esse fingerprint exigem o snapshot completo. A consulta Woo distingue valores reembolsados de captura/refund verificados; status manual sozinho não conta como resultado PSP.

A [CI 34437001687](https://github.com/ThiagoVenturaV/boopay-platform/actions/runs/34437001687), commit `70c579124caa10692f4472c2039d2164fec445cc`, aprovou os cinco jobs: Windows, Linux, PostgreSQL, navegador e WooCommerce nativo. A suíte no job PostgreSQL teve 114 testes aprovados, zero falhas/omissões; o navegador teve 11 operações + quatro cenários IA/perfil aprovados. Localmente: 110 aprovados e quatro PostgreSQL omitidos; plugin: 21 arquivos PHP válidos.

`scripts/woocommerce-compensation.ts`, compilado antes da execução, passou com WordPress 7.0.4, WooCommerce 11.0.1, PHP 8.3.33 e MySQL 8. Cobertura: refund pendente/perdido no transporte PSP, recuperação por webhook assinado, interrupção do processo após escrita de estoque, rollback, perda da resposta depois de commit, seis processos PHP repetindo o mesmo ajuste, cancelamento antes da autorização e mudança de endereço após captura. No estorno de R$ 86,91, o estoque voltou de duas para três unidades, um único refund Woo foi criado e a receita líquida ficou zero. Catálogo, pedido, data do primeiro estorno e evento `order.refunded` foram conciliados sem duplicação. A retenção/recuperação após 26 horas é coberta separadamente no teste do ledger.

ZIP plugin 0.5.0: fonte `6d03aa1bf7a816383b6c96ceb7c9a19bd38dbd3b`, SHA-256 `fb78ea721d0eccb1f89038c5e18d4e436956799c016db6b09a4b319e5a38c986`. Os ensaios intermediários exigiram correções nos IDs sintéticos de eventos, tenant do drain e relógio de um cenário independente; o teste passou preservando as verificações de assinatura e validade da reserva. Stripe HTTP permanece sintético; plugins com transações próprias, caches externos e efeitos de hooks fora do banco precisam de homologação específica. [Contrato do plugin](../../pluginboopay/boopay-woocommerce/docs/PAYMENT-COMPENSATION.md).

## O que está construído

`StripeSandboxProvider` usa somente `https://api.stripe.com/v1`, chaves `sk_test_` e contas Connect explicitamente permitidas. Todas as chamadas levam `Stripe-Account`; não há transferência de recursos para a plataforma nem taxa da aplicação. A escolha é coerente com cobranças diretas na conta conectada, que devem ser consultadas no escopo dessa conta. [Contrato Stripe de cobranças diretas](https://docs.stripe.com/connect/direct-charges).

O contrato está fixado em `2026-08-26.dahlia`, versão consultada na documentação em 10/09/2026. O identificador do adaptador é persistido com a tentativa; uma troca de contrato impede repetir a operação com uma tradução diferente. [Versionamento Stripe](https://docs.stripe.com/api/versioning).

O adaptador cria um PaymentIntent sem confirmar ou cobrar. Autorizar, capturar, consultar, cancelar e estornar são métodos distintos. A captura é manual e pelo total da compra. Uma autorização exposta como `authorized` ainda possui zero capturado; `requires_action` exige o fluxo do comprador no Stripe.js. Captura parcial, multicaptura, aumento de autorização e métodos com redirecionamento não são implementados. [Criação do PaymentIntent](https://docs.stripe.com/api/payment_intents/create), [autorização e captura separadas](https://docs.stripe.com/payments/place-a-hold-on-a-payment-method).

O núcleo recebe apenas `{ type: "stripe_payment_method", id: "pm_..." }`; não recebe PAN, CVC, cartão bruto, valores enviados pelo modelo, `return_url` arbitrária ou JSON de carteira. Nenhuma autenticação adicional é contornada. Stripe.js/3DS e a [superfície Google Pay TEST](GOOGLE-PAY.md) estão ligados à mesma tentativa no navegador. Tokenização usa a conta vinculada e só envia a referência ao servidor; homologação externa continua pendente. [Confirmação Stripe](https://docs.stripe.com/api/payment_intents/confirm), [tutorial Google Pay](https://developers.google.com/pay/api/web/guides/tutorial).

As respostas precisam corresponder a PaymentIntent, ambiente de teste, valor, moeda, método de captura, referência e hash do vínculo. O hash abrange tenant, conta Connect, checkout, pedido, cotação e total. Identificadores retornados não podem substituir um PaymentIntent já conhecido. Estornos são verificados contra a mesma compra; `pending`, `requires_action` e `failed` não viram sucesso. Corpos de erro não são retornados nem persistidos. Há timeout, recusa de redirects e limite de 256 KiB por resposta.

## Relação com Checkout Core e WooCommerce

`PaymentOperations.prepare` lê o pedido existente, o comprador e a confirmação canônica. Exige pedido conectado pendente e vínculo consistente entre pedido, checkout, cotação e confirmação. A conta vem da configuração da integração, não da solicitação do comprador. Há uma tentativa PSP por pedido nesta versão.

Antes de autorizar, o comprador deve aceitar `boopay-stripe-sandbox-2026-09-10` e o hash do vínculo financeiro. Para autorizar ou capturar, o pedido é novamente conferido. Alterações impedem uma nova cobrança, mas a referência financeira original continua disponível para consulta, cancelamento e estorno.

**Autorizar e capturar exigem `PaymentCommerceGate`.** `WooPaymentGate` resolve a loja pelo pedido persistido, confere a operação assinada e chama reserve/verify no plugin. O método `boopay_stripe_test` integra detalhes, política e hash da cotação; mudar o método invalida a confirmação. O plugin verifica valores, fingerprint comercial, conta configurada e estoque reduzido no pedido on-hold. Pedido BACS não é elegível. A demo `payment:demo` preserva gate e Stripe sintéticos; o teste nativo separado usa Woo/MySQL reais com Stripe HTTP sintético.

`PaymentOperations.settle` exige captura integral verificada e ausência de estorno pendente/concluído. Compartilha a posse da mutação com captura/estorno; resultado incerto bloqueia outra operação até recuperação. O plugin usa `WC_Order::payment_complete(intentId)` e reconhece repetição do mesmo intent sem baixar estoque novamente. Em seguida, `CheckoutService.reconcile` consulta Woo e projeta pedido pago/receita uma vez. Captura PSP, confirmação Woo e projeção local são evidências distintas. [Contrato do plugin](../../pluginboopay/boopay-woocommerce/docs/PAYMENT-GATE.md).

O teste `tools/woocommerce/payment-smoke.mjs` cobre consentimento/método, estoque, alteração de endereço sem mudança de total, conta/referência incorreta, HMAC/expiração/separação de ação, resposta perdida depois de payment_complete, repetição entre processos PHP e projeção de receita. Validação local: 111 testes, 107 aprovados e quatro PostgreSQL omitidos; parser do plugin: 20 PHP válidos.

A [CI 34435088338](https://github.com/ThiagoVenturaV/boopay-platform/actions/runs/34435088338) aprovou os cinco jobs do commit `61788b76e9bec211d69535ce3a4ab05238e760f9`. PostgreSQL: 111/111, sem omissões. Navegador: 11 + quatro cenários. WooCommerce 11.0.1 / WordPress 7.0.4 / PHP 8.3.33 / MySQL 8: pedido de R$ 86,91, estoque 3 → 2, captura HTTP sintética, confirmação Woo recuperada e receita uma vez. A recuperação do ledger após 25 horas também passou. O primeiro ensaio falhou apenas na comparação do objeto analítico com um número; a correção usa `paidGross` e as execuções posteriores passaram. ZIP plugin 0.4.0: fonte `3645643257521e0a884fb9858f5082f2d7766e9a`, SHA-256 `66c083b9de422439b4600e7581adca8f235d0016ef2d09ac79aae6208182b08c`.

A recuperação explícita `retry(..., "settle")` preserva pedido/referência/intent e pode ocorrer após 24 horas, inclusive depois da limpeza dos payloads privados. Essa confirmação usa unicidade durável no WooCommerce e não envia POST à Stripe. A lease, os vínculos e o estado financeiro continuam sendo verificados. As operações do PSP preservam o limite de 23 horas para repetição com a mesma chave.

Limites atuais: sem transação distribuída ou proteção contra todas as edições externas no intervalo entre verificação e captura. O gateway 0.5.0 permite cancelar ou estornar com devolução de estoque quando o vínculo financeiro permanece intacto. Uma divergência financeira, refund manual ou estoque parcialmente alterado interrompe a compensação automática e requer conciliação. Stripe.js/Google Pay TEST estão implementados com provas sintéticas; homologação operacional externa ainda precisa ser concluída. O lock MySQL serializa somente o protocolo do plugin; não é uma garantia sobre outros plugins ou operadores.

## Repetição, concorrência e recuperação

- Cada mutação grava intenção, chave, hash do pedido de execução e geração antes de qualquer rede. A transação do banco termina antes de consultar a loja ou Stripe.
- Chamadas concorrentes compartilham a mesma operação. Uma lease de 60 segundos impede retomada enquanto o executor anterior pode estar ativo.
- Repetição é explícita, com o mesmo contrato, payload e chave. Não existe fallback para uma nova chave ou conta. O limite local é 23 horas desde a primeira intenção da operação. A Stripe pode remover chaves após pelo menos 24 horas; por isso não se repete depois da janela. [Idempotência Stripe](https://docs.stripe.com/api/idempotent_requests).
- Uma resposta perdida fica `uncertain`. Consulta GET ou referência de webhook autenticado recupera o mesmo objeto. Passar da janela não prova que a operação falhou e não permite criar uma cobrança substituta.
- Erros HTTP de mutação são tratados conservadoramente como resultado incerto, exceto uma recusa 402 com PaymentIntent de teste integralmente validado e sem valores capturados/capturáveis. Uma consulta sem mudança de estado não prova que uma requisição anterior jamais será aplicada. O cancelamento é confirmado no PSP antes de ser considerado concluído. [Novo aceite e retomada após cancelamento](PAYMENT-RENEWAL.md).
- Resultados de consultas usam a revisão do registro para impedir que um GET antigo substitua uma observação mais recente. Pagamentos concluídos ou cancelados não voltam silenciosamente a estados anteriores.

Credencial tokenizada e `client_secret` ficam criptografados com contexto de tenant/tentativa. As respostas comuns e metadados operacionais não incluem esses valores. O payload de uma operação resolvida é removido; payloads de repetição são eliminados após 23 horas da operação, e segredos de ação do comprador após 23 horas da tentativa. O worker chama `prunePrivate`; uma consulta tardia não recria segredos expirados. Referências, valores, recibos, auditoria e estados financeiros são preservados para conciliação. A política operacional de retenção desses registros e backups externos continua pendente. O acesso HTTP e a ação SDK privada são descritos no [runtime](PAYMENT-RUNTIME.md).

## Webhooks

`verifyStripeWebhook` valida HMAC sobre os bytes originais antes de analisar o JSON, com tolerância de cinco minutos para o timestamp e suporte a até três segredos de rotação. Recusa eventos live. A conta autenticada é mapeada para um tenant configurado; campos do evento não escolhem o tenant. Eventos sem correspondência conhecida são ignorados.

`PaymentWebhooks` grava uma inbox mínima com referências, sem armazenar o corpo bruto. Eventos repetidos são deduplicados pelo ID; reutilização do ID com outras referências é recusada. O processamento consulta o PaymentIntent/Refund atual na conta correta e valida novamente o vínculo. Eventos atrasados não impõem o estado de seu snapshot. Falhas de leitura voltam à fila com espera progressiva; leases permitem retomada de workers. Eventos suportados: ciclo de `payment_intent` listado no verificador e `refund.created`, `refund.updated`, `refund.failed`. [Entrega, assinaturas e ordenação Stripe](https://docs.stripe.com/webhooks).

`POST /v1/payments/stripe/webhook` preserva o corpo bruto no Fastify, verifica a assinatura antes do JSON/fila e confirma a inbox antes de qualquer consulta externa. O worker possui encerramento controlado e concilia resultados confirmados; não repete POST financeiro automaticamente. Captura/estorno exigem sessão administrativa, enquanto autorização/ação SDK pertencem ao comprador. O cadastro e a entrega do endpoint TEST externo continuam pendentes. Consulte [configuração e rotas](PAYMENT-RUNTIME.md).

## Executar e verificar

```powershell
npm run check
npm run payment:demo
```

A demo usa uma base efêmera e percorre os serviços canônicos: cotação → confirmação → pedido pendente → criação PSP → autorização → captura com resposta perdida → webhook assinado/deduplicado → consulta → estorno. O transporte do PSP e a loja/reserva são fixtures explícitas em `scripts/payment-fixture.ts`, nunca importadas por `src/main.ts`. A saída declara `providerEvidence: simulated`, um único POST de captura e pedido comercial ainda pendente. Não comprova acesso à Stripe, Google Pay ou liquidação WooCommerce.

Na fundação anterior, TypeScript/build e 105 testes locais passaram; quatro testes PostgreSQL foram omitidos sem banco. Essa etapa introduziu 17 testes locais de contrato, consentimento, gate, criptografia, concorrência, reinício, repetição expirada, 3DS, cancelamento, estorno pendente, respostas perdidas e webhooks; um teste adicional usa duas conexões PostgreSQL independentes na CI. A demo também é executada nos jobs Windows e Linux.

A [CI 34433656693](https://github.com/ThiagoVenturaV/boopay-platform/actions/runs/34433656693) aprovou os cinco jobs do commit `e3858c2a62a1e62cac897ff68a037c1eadf5672f`: Windows, Linux, PostgreSQL, navegador e WooCommerce nativo. PostgreSQL: 109 testes aprovados, nenhuma falha ou omissão, incluindo criação/autorização/captura únicas em duas conexões independentes. Navegador: 11 operações e quatro cenários de IA/perfil aprovados. A demo sintética de pagamentos passou em Windows e Linux. A suíte WooCommerce valida a modalidade BACS existente; não comprova uma liquidação Stripe na loja.

## Trabalho restante para o fluxo completo

1. Homologar a recuperação de divergências financeiras, refunds manuais, estoque parcialmente alterado e efeitos de plugins/caches externos. A compensação automática assinada de cancelamento/estorno integral está implementada para pedidos com vínculo financeiro preservado; a modalidade BACS existente permanece separada.
2. Ligar as novas rotas à jornada visual do comprador e do lojista, mantendo método, cotação e aceite. Pedido, evento/outbox e receita já refletem o ajuste pelo worker e pela conciliação canônica; validar a jornada financeira no painel/perfil com PSP externo.
3. Homologar externamente a interface Stripe.js/3DS e Google Pay TEST já implementada: conta correta, total final, estados acessíveis e retorno ao mesmo checkout, sem cartões no Boopay.
4. Política operacional de retenção/auditoria e testes de rotação/configuração com contas externas. A [retomada após recusa/cancelamento](PAYMENT-RENEWAL.md) está implementada com aceite renovado, prova comercial e proteção contra duplicidade. Configuração por loja, webhook HTTP, worker, limpeza e trilha de ações já estão implementados no runtime opt-in.
5. Validação com credenciais Connect de teste, transação real no ambiente sandbox, entrega/reembolso completos, expiração e alertas operacionais. Nenhum teste desta entrega chama provedores externos.

ACP/UCP, Shopify/VTEX e projeções externas continuam no [plano completo](CRITERIOS-DE-ACEITE.md); esta fundação não encerra esses marcos.
