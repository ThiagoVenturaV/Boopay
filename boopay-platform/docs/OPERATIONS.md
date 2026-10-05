# Operação local e staging

O worker de [catálogo incremental VTEX](VTEX-CATALOG-UPDATES.md) requer opt-in independente e publicação manual atual. A inicialização não faz chamadas de rede; o worker agenda SKUs notificados, respeita cotas persistidas e encerra aguardando o trabalho em curso. Estado disponível na API administrativa e em Configurações → VTEX → Atualização do catálogo. A [consulta da fila](VTEX-CATALOG-UI.md) mostra espera, execução, falhas, cotas e próxima tentativa elegível; não dispara chamadas na loja ou altera a configuração. A ponte nativa depende de resolver a auditoria do SDK e homologar a conta de teste antes da instalação.

Projeções externas são opt-in: `BOOPAY_DATA_ENABLED=false` por padrão. Configuração de tenants/destinos, fila, backfill, relatório financeiro, exclusão e ensaio Firestore estão em [DATA-PROJECTIONS.md](DATA-PROJECTIONS.md). Desativar o runtime não apaga cópias remotas existentes. O dashboard permanece na base canônica; nenhuma conta Google Cloud foi ativada nesta etapa.

## Local

1. Instalar Node.js 24+ e executar `npm ci`.
2. `npm run check` compila e testa.
3. `npm run demo` executa uma compra isolada em memória e encerra.
4. `npm run build` compila API e interface; `npm start` serve ambos em http://127.0.0.1:9510, em loopback.
5. A primeira execução gera quatro produtos fictícios e segredos aleatórios em `data/local-secrets.json`, fora do Git. A credencial do administrador deve ser lida localmente por seu operador, nunca incluída em documentação, screenshots, logs ou commits.

Tenant: `tenant-demo`. Slug: `demo`. Os dados locais ficam em SQLite. Não abrir o servidor local para a rede.

## Teste da interface

Execute `npm run test:e2e` após o build. A suíte sobe uma API isolada em memória na porta 9511, autentica pelo formulário, compra, recarrega, exporta, estorna e verifica a receita. Também cobre celular, recusa, cancelamento e foco do detalhe em uma lista longa. A credencial fixa presente no código da suíte é exclusivamente desse servidor efêmero; não é usada por `src/main.ts`. O encerramento explícito no teardown evita processos órfãos no Windows.

`node scripts/capture-ui.mjs --responsive` usa o app local da porta 9510 e injeta uma projeção ilustrativa exclusivamente nas requests daquele navegador de captura. Esses quatro pedidos nunca são inseridos na base do aplicativo. As imagens servem para comparar composição e responsividade. As capturas E2E do checkout são geradas pelo backend de teste, em memória.

## Staging

Configurar PostgreSQL, HTTPS no proxy, `BOOPAY_ENV=staging`, `BOOPAY_DATABASE=postgres`, `DATABASE_URL`, `BOOPAY_PUBLIC_ORIGIN`, `BOOPAY_ENCRYPTION_KEY` (32 bytes hex aleatórios) e `BOOPAY_ADMIN_SECRET`. O processo recusa staging sem PostgreSQL/HTTPS configurados. O proxy deve preservar Host e não registrar cookies, Authorization ou corpos de login/pagamento. Ainda é necessária validação integrada antes de publicar staging.

Manter a chave de criptografia com backup seguro separado do banco: sua perda impede recuperar segredos das integrações. Rotação da chave requer migração de dados criptografados; não trocar o valor e reiniciar esperando que conexões antigas funcionem.

## Limites atuais

O bootstrap possui um segredo administrativo por ambiente, adequado à demonstração controlada; contas individuais, RBAC e cobrança SaaS são evolução. Proteção de tenant é aplicada em todas as queries do repositório; não há alegação de RLS PostgreSQL configurado. O armazenamento inicial usa documentos JSONB versionados por tenant; a projeção analítica e índices adicionais serão acrescentados conforme o modelo estabilizar.

Nenhuma credencial de produção é necessária para testar o núcleo local. Pagamentos externos, lojas e serviços de dados exigem suas próprias contas e testes.

`npm run payment:demo`, após o build, executa a [fundação PSP](PAYMENTS.md) em memória com transporte Stripe e reserva comercial sintéticos. A API normal nunca carrega essa fixture. O [runtime PSP](PAYMENT-RUNTIME.md) exige `BOOPAY_PAYMENTS_SANDBOX=true`, contas explicitamente vinculadas a tenant/integração e chaves TEST; o padrão é desabilitado. O worker inicia depois do HTTP e encerra antes do banco. Configurar uma chave isoladamente não habilita o runtime. A [interface financeira](PAYMENT-UI.md), Stripe.js e [Google Pay TEST](GOOGLE-PAY.md) usam esse runtime; os ensaios de SDK/PSP são sintéticos e a homologação externa continua pendente.

A suíte em `tools/woocommerce`, com `WOO_NATIVE_TEST=1`, usa o ZIP 0.5.0 verificado por SHA-256, PHP 8.3 e MySQL 8 isolados. O harness configura `BOOPAY_PSP_TEST_ENABLED=true` e a conta fictícia `acct_BoopayFixture` apenas no WordPress de teste. `payment-smoke.mjs` percorre a cotação/consentimento/pedido, gate Woo real, Stripe HTTP sintético, perda de resposta da confirmação, repetição e receita. Depois executa o helper compilado de `scripts/woocommerce-compensation.ts`: refund pendente, webhook, interrupção PHP após escrita de estoque, rollback, resposta perdida após commit, duplicatas, cancelamento e mudança de endereço após captura. Os saltos de relógio exercitam leases; o cenário independente de nova autorização recomeça no relógio real do PHP para preservar a validade da nova reserva. A conta da fixture nunca deve ser usada para credenciais externas. O modo Playground/SQLite não valida o lock MySQL nem a compensação transacional e não é evidência de liquidação nativa.

A IA é habilitada explicitamente por `BOOPAY_AI_PROVIDERS`; configuração, limites, criptografia e comandos estão em [AI.md](AI.md). A demo padrão não usa serviços externos. O probe `--live` usa crédito do provedor e termina sem confirmar a compra. [Perfil e privacidade](PROFILE.md) descreve consentimento, contexto, exclusão e retenção. A API limpa dados vencidos ao iniciar e a cada 60 segundos; o comando administrativo permite conferir contagens. O shutdown aguarda o ciclo ativo. [Backup cifrado e restauração isolada](BACKUP-RESTORE.md) estão implementados; agendamento, retenção física, reaplicação de exclusões posteriores e liberação operacional da base recuperada permanecem pendentes, assim como eliminação nos provedores externos.

## Lojas de teste conectadas

Depois de conectar e sincronizar o plugin 0.3.0, configure a origem da loja em `BOOPAY_COMMERCE_ALLOWED_ORIGINS` e reinicie a API. A seleção fica disponível no checkout. Pedidos por transferência bancária são criados na loja e podem alterar estoque; use uma instalação de teste com e-mails e expedição configurados para esse fim. A suíte nativa cria esse ambiente isolado automaticamente.

A chave de criptografia também protege endereços e tokens de carrinho. Não descarte a base, a chave ou os registros de operação enquanto houver uma tentativa incerta. Consulte a mesma sessão para reconciliar; não crie uma compra substituta para contornar uma resposta perdida. O mecanismo e seus limites estão em [Checkout com loja conectada](CHECKOUT-COMMERCE.md).

ACP/UCP usam cópias temporárias cifradas de rascunho/resposta por até 48 horas. O acesso é bloqueado no vencimento e a limpeza roda na inicialização e no ciclo de privacidade de um minuto. O administrador pode executar `POST /v1/admin/protocol-retention` com `{}`; a resposta informa `grants`, `sessionPayloads`, `responsePayloads` e a política, sem conteúdo privado. Uma resposta 410 do protocolo não autoriza apagar a reserva de idempotência ou repetir a compra: use o pedido/checkout operacional para consultar e conciliar. O GET de uma sessão em conciliação observa a tentativa original no Woo; não reenvia o pedido. Veja [retenção e limites](PROTOCOLS.md#retenção-dos-dados-temporários).

Webhooks de pedidos ACP/UCP ficam desligados com `BOOPAY_PROTOCOL_WEBHOOK_URLS` vazio. A ativação exige URL exata no servidor, perfil/destino cadastrados pelo lojista e `orderUpdates:true` na autorização emitida pelo comprador. Configuração, consulta sanitizada da fila, execução de lote e cancelamento estão em [PROTOCOL-ORDERS.md](PROTOCOL-ORDERS.md). A entrega usa assinatura, lease de 30 segundos, até oito tentativas e expurgo do corpo no estado terminal ou em 48h. Eventos terminais não são reativados pelo comando de lote.
