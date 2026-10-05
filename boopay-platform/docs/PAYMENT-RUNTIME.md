# Runtime HTTP e worker de pagamentos sandbox

10/09/2026. Implementação opt-in em `src/main.ts`, `src/services/payment-runtime.ts`, `src/payment-config.ts` e `src/http/payment-routes.ts`. A [interface de cartão e operações](PAYMENT-UI.md) conecta Stripe.js/3DS às rotas existentes; seus testes de navegador são sintéticos. A [carteira Google Pay TEST](GOOGLE-PAY.md) usa as mesmas rotas. Homologação com credenciais externas continua pendente. Nenhuma chave foi configurada nesta entrega.

## Configuração por ambiente

O padrão é `BOOPAY_PAYMENTS_SANDBOX=false`: não instancia provedor/worker e a rota autenticada de configuração informa `enabled:false`. Para um ambiente de homologação autorizado, o operador configura:

- `BOOPAY_PAYMENTS_SANDBOX=true`.
- `BOOPAY_PAYMENT_CONNECTIONS`: array JSON de `{tenantId,integrationId,accountId}`. IDs devem corresponder à loja já pareada; uma conta Connect não pode cruzar tenants. Uma integração tem uma conta. Até 100 integrações por processo.
- `BOOPAY_STRIPE_SECRET_KEY`: chave `sk_test_`; `BOOPAY_STRIPE_PUBLISHABLE_KEY`: chave `pk_test_`.
- `BOOPAY_STRIPE_WEBHOOK_SECRETS`: um a três segredos `whsec_` do mesmo endpoint, separados por vírgula, para rotação.
- `BOOPAY_COMMERCE_ALLOWED_ORIGINS`: origem exata de cada loja autorizada. O plugin deve ter o gateway TEST opt-in e a mesma conta em `BOOPAY_PSP_TEST_ACCOUNT`.

As chaves entram pelo ambiente ou gerenciador de segredos. O parser de startup não imprime conteúdo inválido. A API só divulga chave pública, conta e integração da loja autenticada; não recebe segredo Stripe. Configuração é imutável durante o processo e exige reinício. Preservar o mapeamento/adaptador original enquanto existirem operações a reconciliar; remover uma conta da configuração não encerra cobranças no PSP. Revogar Woo bloqueia nova autorização/captura e o SDK, mas consulta/cancelamento/estorno PSP permanecem disponíveis para recuperação; o ajuste na loja aguardará reconexão.

Cobranças diretas usam o contexto da conta Connect configurada. O comprador não escolhe conta, origem da loja, valor ou moeda no pedido de pagamento. [Contrato Stripe](https://docs.stripe.com/connect/direct-charges).

## Rotas

Todas as rotas de comprador/administrador exigem a credencial correspondente. Cookies exigem a origem exata nas mutações; clientes Bearer podem omitir Origin. Host é validado e respostas usam `Cache-Control:no-store`.

| Método e caminho | Permissão e efeito |
|---|---|
| `GET /v1/buyer/payments/configuration` | Configuração TEST da loja autenticada e integrações ativas/permitidas; também existe em `/v1/admin` |
| `POST /v1/buyer/orders/:id/payment` | Comprador do pedido, corpo `{}`; prepara o mesmo PaymentIntent sem cobrar. Exige confirmação canônica e método `woocommerce:boopay_stripe_test` |
| `GET /v1/buyer/orders/:id/payment` | Recupera a tentativa do pedido ou null; também existe em `/v1/admin` |
| `GET /v1/buyer/payments/:id` | Estado/recibos públicos, hash do vínculo, termos e conciliação; também existe em `/v1/admin` |
| `POST /v1/buyer/payments/:id/authorize` | Comprador aceita termos/hash e fornece `{type:stripe_payment_method,id:pm_...}` tokenizado. O gateway revalida a reserva antes do PSP |
| `GET /v1/buyer/payments/:id/action` | Somente o dono, conexão ativa e janela válida; retorna ação Stripe SDK com client secret quando exige autenticação. Não aparece nos relatórios nem nos estados comuns |
| `POST /v1/admin/payments/:id/capture` | Lojista, corpo `{}`; captura integral explícita após autorização e nova verificação da loja |
| `POST /v1/admin/payments/:id/refund` | Lojista, corpo `{}`; estorno integral explícito do mesmo pagamento |
| `POST /v1/buyer/payments/:id/cancel` | Dono, corpo `{}`; cancelamento permitido pelo estado PSP. Também disponível ao administrador |
| `POST /v1/buyer/payments/:id/reconcile` | Dono, corpo `{}`; consulta PSP sem criar mutação financeira. Também disponível ao administrador |
| `POST /v1/buyer/payments/:id/renew` | Dono, aceite/termos/hash; comprova cancelamento e estoque devolvido, reserva uma nova cotação sem pedido/aceite e recupera a mesma sessão em repetições |
| `POST /v1/buyer/payments/:id/retry` | `{action:create\|authorize\|cancel}`; mesma operação e payload persistido, dentro da janela e após lease |
| `POST /v1/admin/payments/:id/retry` | `{action:capture\|cancel\|refund\|settle\|compensate}`; não pode autorizar em nome do comprador |
| `GET /v1/admin/payments` | Até 100 tentativas recentes, estado de conciliação e até 100 entradas recentes da trilha de ações |
| `POST /v1/payments/stripe/webhook` | HMAC Stripe sobre bytes originais, antes de JSON; não usa cookie/Bearer para autenticação |

`authorize` exige `accepted:true`, `termsVersion` e `bindingHash` retornados pela tentativa, além da credencial tokenizada. Após recusa verificada, `authorizationSequence` identifica a nova autorização com novo aceite no mesmo intent; omitir equivale a zero. Campos extras, PAN/CVC e valores arbitrários são recusados. Não existe rota do comprador para captura/estorno, rota administrativa para autorizar ou endpoint que exponha o assinador Woo. [Retomada e concorrência](PAYMENT-RENEWAL.md).

## Inbox, conciliação e ciclo de vida

Webhook: limite de 256 KiB, assinatura/tempo/ambiente/conta verificados, roteamento de conta configurado, deduplicação durável. Responde 202 após gravar a inbox; duplicatas e eventos ignorados respondem 200. Nenhuma rede de PSP/Woo roda antes dessa confirmação HTTP. A rota possui um bucket de limite separado do navegador. Registrar o endpoint TEST em HTTPS no staging e selecionar eventos Connect compatíveis com `PAYMENTS.md`; o cadastro externo não foi feito. [Assinatura e entrega Stripe](https://docs.stripe.com/webhooks).

O worker inicia após a aplicação escutar e roda a cada dez segundos, sem sobrepor ciclos no mesmo processo. Por tenant: drena até 20 notificações, limpa payloads privados expirados e processa até 20 tentativas elegíveis. Usa leases persistentes de 60 segundos, gerações e ordenação por próxima tentativa. Falhas têm espera progressiva até cinco minutos; estados abertos são consultados em intervalos de pelo menos 30 segundos. O inventário ainda usa o armazenamento genérico e varredura por tenant; volume de produção requer índices/consultas específicas e medição.

Somente GETs ao PSP e confirmação/compensação idempotentes no Woo são automáticos. Captura e estorno exigem comando explícito do lojista; criação/autorização exigem comprador. POST financeiro incerto não é repetido automaticamente. Um webhook ou GET recupera a mesma referência; repetir um POST exige a rota autorizada, mesma chave/payload e janela financeira de 23 horas. A repetição comercial pode ultrapassar 24 horas por usar unicidade durável Woo.

Depois da captura confirmada, o worker confirma Woo e chama a conciliação canônica do checkout. Depois de cancelamento/refund terminal confirmado, ajusta Woo e concilia pedido/eventos/receita. Uma resposta comercial perdida permanece registrada e é recuperada após lease. Divergência financeira ou loja revogada fica pendente no relatório, sem inventar sucesso nem alterar total/estoque para contornar o conflito.

A trilha registra ator, papel, ação, referência, início, término e erro de domínio; nunca o corpo, token do cartão ou client secret. A conclusão do handler significa que a solicitação foi processada, não que uma mutação incerta virou sucesso: consultar `operations` e recibos da tentativa. O encerramento cancela o timer e aguarda a operação em andamento antes de fechar o banco. A política de retenção dos registros financeiros/auditoria e os backups externos ainda exigem definição operacional.

## Evidência desta revisão

A [CI 34438007166](https://github.com/ThiagoVenturaV/boopay-platform/actions/runs/34438007166), commit `d521f172748d34c1d8148246705ff1663f7ea2d8`, aprovou os cinco jobs: Windows, Linux, PostgreSQL, navegador e WooCommerce nativo. No job PostgreSQL: 121 testes aprovados, zero falhas/omissões; inclui dois pools concorrentes com uma lease/confirmação comercial e um evento pago. Navegador: 11 operações + quatro cenários IA/perfil aprovados. Os seis novos testes locais cobrem configuração segura, identidade/tenant/papéis, consentimento, CSRF, revogação, SDK privado, raw HMAC, inbox após reinício, limite de corpo, recuperação comercial, ausência de POST financeiro automático, encerramento e retenção.

`scripts/woocommerce-runtime.ts` passou com WordPress 7.0.4, WooCommerce 11.0.1, PHP 8.3.33 e MySQL 8: HTTP comprador → confirmação → pedido → autorização; comando administrativo de captura com resposta perdida → webhook assinado/deduplicado → worker → Woo pago; comando administrativo de estorno → worker → refund/estoque/projeção. Estoque 3 → 2 → 3, um POST de captura, um POST de estorno e receita líquida final zero. Stripe HTTP permaneceu sintético; o ZIP nativo 0.5.0 e seu SHA-256 são os já registrados em `PAYMENTS.md`.

A aplicação local foi reiniciada com o build atualizado: health OK, configuração sem sessão recusada com 401 e configuração autenticada com `enabled:false`, nenhuma conta e nenhuma chave pública. Nenhum valor de segredo foi exibido nem alterado durante a verificação. Os testes anteriores 0.5.0 permanecem em `PAYMENTS.md`.

Pendências: homologação Google Pay TEST, credenciais Connect reais de teste, validação do iframe/3DS e endpoint externo, matriz HPOS/cache/plugins e recuperação assistida de divergências financeiras. A retomada após recusa/cancelamento está implementada com provas locais em [PAYMENT-RENEWAL.md](PAYMENT-RENEWAL.md). Este runtime não constitui homologação externa. A interface de comprador/operador está documentada em [PAYMENT-UI.md](PAYMENT-UI.md).
