# Cartão sandbox e operações financeiras no painel

Implementação em 10/09/2026, dentro do Checkout e do detalhe de Pedidos da composição B aprovada. Receita continua sendo a entrada do painel. Código: `web/src/Payments.tsx`, `StripeCard.tsx`, `Checkout.tsx`, `Management.tsx` e `payments.css`.

## Jornada do comprador

1. A loja conectada continua usando transferência bancária por padrão. **Cartão Stripe · sandbox** aparece somente quando a configuração autenticada inclui a integração ativa.
2. A escolha participa dos dados comerciais enviados à cotação. A confirmação do resumo identifica o método; concluir essa etapa cria o pedido pendente no WooCommerce.
3. **Preparar cartão de teste** prepara a tentativa ligada ao pedido. Depois de conferir loja e valor, o comprador aceita a autorização integral. Somente então o formulário hospedado é carregado.
4. Stripe Payment Element valida e tokeniza o cartão. Boopay recebe apenas `pm_...`, aceite, versão dos termos e hash da vinculação; valor, moeda, conta e pedido vêm da tentativa canônica no servidor. A reserva comercial é verificada antes da autorização.
5. Se o provedor exigir autenticação, **Continuar autenticação** recupera a ação privada do próprio comprador e chama `handleNextAction`. O resultado do SDK não altera receita: uma consulta do servidor e a conciliação WooCommerce determinam os estados financeiros.
6. Recarregar a página recupera o mesmo checkout e a tentativa existente. A interface impede iniciar outra compra enquanto este pagamento não estiver capturado ou cancelado. O acompanhamento da loja continua necessário após o resultado do provedor.

Uma recusa verificada permite outro cartão na mesma tentativa, após novo aceite. Resultado incerto continua bloqueado até conciliação/repetição explícita. Depois do cancelamento comprovado, **Retomar compra** confirma a intenção, confere pedido/estoque e abre uma nova cotação sem aceite. A sessão reservada é recuperada após perda de resposta. Não existe recriação automática de PaymentIntent. [Contrato e evidências](PAYMENT-RENEWAL.md).

## Operação do lojista

O detalhe do pedido apresenta **Conciliação do pagamento** quando existe tentativa PSP. Estado do provedor, valor capturado e recibo da loja aparecem separados. Autorização não é receita paga. Captura e estorno integral abrem confirmação inline com o valor; sair da confirmação não envia comando. Cancelamento também exige confirmação.

Uma resposta HTTP bem-sucedida pode transportar operação incerta. A interface lê `operations` e mostra acompanhamento/repetição explícita, com a janela e a lease retornadas pelo servidor em `retryAfter`/`retryUntil`. Não cria novas chaves no navegador e não repete POST financeiro automaticamente. O servidor continua validando prazo, estado, permissão e payload original. Operações comerciais idempotentes não dependem da janela PSP.

O polling a cada dez segundos consulta apenas a persistência Boopay, pausa com documento oculto e não disputa comandos do usuário. Uma resposta de consulta iniciada antes de um comando não substitui seu resultado. **Conferir no provedor** consulta Stripe explicitamente; o worker independente realiza a projeção comercial. Falhas preservam referências e oferecem acompanhamento. Consulta, cancelamento e estorno continuam disponíveis após revogação da conexão; novas autorizações/capturas exigem conexão ativa no servidor.

## SDK e segurança

- Loader oficial `@stripe/stripe-js` **9.15.0**, fixo no lockfile, importado por `/pure` sob demanda; carrega `https://js.stripe.com/dahlia/stripe.js`. A release corresponde ao contrato servidor `2026-08-26.dahlia`. A tag `latest` consultada inicialmente devolveu 7.10.0/Basil; foi substituída pela release 9.15.0 verificada no registro oficial e no repositório Stripe.
- Elements usa moeda e valor canônicos, `mode: payment`, `captureMethod: manual`, `paymentMethodTypes: [card]` e `paymentMethodCreation: manual`. O cartão é tokenizado antes da confirmação no servidor, preservando o gate da loja.
- A política CSP autoriza os hosts Stripe de script, conexão e frame apenas com runtime sandbox configurado; continua sem `unsafe-inline`/`unsafe-eval`. O modo desabilitado permanece restrito à própria origem.
- Cartão e client secret não são gravados em localStorage/sessionStorage. A referência do checkout permanece no sessionStorage para recuperação. O segredo da ação circula apenas no caminho autenticado do comprador e na memória do SDK.
- Erro de carregamento tem mensagem em português e permite reabrir o formulário ou cancelar o pagamento. A fonte Arial no iframe é fallback local do provedor; não altera a tipografia Archivo da aplicação. O iframe deve ser inspecionado com uma conta real de teste antes da homologação.

Referências oficiais consultadas: [confirmação no servidor](https://docs.stripe.com/payments/finalize-payments-on-the-server), [tokenização com Elements](https://docs.stripe.com/js/payment_methods/create_payment_method_elements), [CSP Stripe.js](https://docs.stripe.com/security/guide), [versionamento](https://docs.stripe.com/sdks/stripejs-versioning) e [release 9.15.0](https://github.com/stripe/stripe-js/releases/tag/v9.15.0). A documentação atual recomenda ConfirmationTokens para novas integrações; este cliente usa o contrato PaymentMethod ainda suportado, já validado pelo gate e ledger existentes.

## Evidência e limites

Os cinco cenários `e2e/payments.spec.ts` verificam contrato da UI em 1440/390 px, consentimento, campos incompletos, tokenização, autenticação, recarga, separação comprador/lojista, captura/estorno com confirmação, resposta incerta, falha do SDK, cancelamento e seleção explícita antes da cotação. `e2e/payment-fixture.ts` intercepta HTTP e Stripe.js; os campos identificam **fixture**, e os valores são ilustrativos. Isso não é evidência de aprovação pela Stripe nem de aparência do iframe real.

`npm run test:e2e` executa operações, pagamentos e IA/perfil em servidores e bases efêmeros separados: 11 + 12 + 4 cenários, incluindo sete de carteira descritos em [GOOGLE-PAY.md](GOOGLE-PAY.md). A separação evita compartilhar a quota de 15 logins por minuto; a proteção real não foi relaxada. O núcleo mantém 121 testes, dos quais cinco requerem PostgreSQL; CSP condicional e metadados públicos de repetição foram acrescentados aos testes de runtime existentes. A jornada HTTP/worker/WooCommerce nativa continua sendo uma prova separada, com Stripe sintético.

A [CI 34440003064](https://github.com/ThiagoVenturaV/boopay-platform/actions/runs/34440003064) aprovou os cinco jobs no commit `43a6a85e59aeaa2025e4a5e5654144438103ba0e`: Linux, Windows, PostgreSQL, navegador e WooCommerce nativo. PostgreSQL: 121 aprovados, zero falhas e zero omissões. Navegador: 11 + 5 + 4 aprovados. O ensaio nativo confirmou novamente HTTP/consentimento, captura/estorno explícitos, webhook/inbox e worker com estoque 3 → 2 → 3 e receita líquida zero; Stripe permaneceu sintético. Ambiente observado: WordPress 7.0.4, WooCommerce 11.0.1, PHP 8.3.33 e MySQL 8.0.46.

Pendências: credenciais Connect de teste, domínio/HTTPS e webhook externo, iframe/3DS reais, homologação Google Pay TEST e recuperação assistida de divergências financeiras. A retomada local está descrita em [PAYMENT-RENEWAL.md](PAYMENT-RENEWAL.md). Nenhuma conta ou chave foi configurada e produção não foi ativada.
