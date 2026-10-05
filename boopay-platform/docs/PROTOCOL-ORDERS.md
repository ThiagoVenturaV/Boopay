# Pedidos e notificações ACP/UCP

Implementado em 10/09/2026. Esta entrega estende o [Checkout Core e os protocolos](PROTOCOLS.md) com consulta do pedido comercial e notificações de mudanças financeiras. A ativação de parceiros externos permanece pendente. O painel aprovado continua priorizando conciliação e receita; esta etapa não altera sua composição.

## Contratos e semântica

- **UCP 2026-08-25:** `GET /v1/protocols/ucp/orders/:id` segue `/orders/{id}` do REST vendorizado. A resposta e o corpo do webhook passam no esquema original `schemas/shopping/order.json`. A capacidade `dev.ucp.shopping.order` é anunciada na descoberta e negociada com o perfil do cliente.
- **ACP 2026-04-17:** o objeto usa `$defs.Order` do checkout original. O webhook tem `{type: "order_create" | "order_update", data: Order}`, conforme `webhook.openapi.yaml`. O campo `data.type` é `order`. **`GET /v1/protocols/acp/orders/:id` é uma extensão bilateral do boopay**: essa operação não consta do REST ACP fixado. Não é anunciada como um serviço oficial ACP adicional.
- Os arquivos originais, licenças, commits e SHA-256 continuam em `vendor/protocols/manifest.json`; não foram alterados para aceitar respostas do boopay.

As duas consultas exigem autorização delegada vigente e assinatura ES256. Tenant, comprador, cliente e protocolo precisam corresponder ao checkout que originou o pedido. Outro cliente do mesmo tenant não consegue consultá-lo, mesmo usando o mesmo domínio e chave pública. Não há busca por e-mail, ID externo ou token na URL. A consulta mostra a última observação persistida do Core; ela não cria pedido, movimenta dinheiro nem força uma consulta comercial remota.

O pedido usa preços e totais da cotação autoritativa preservada no Core. Pedido BACS pendente não vira receita paga. ACP usa `created` para pendente, `confirmed` para pagamento confirmado/estornado, `manual_review` para falha/conciliação e `canceled` para cancelamento. O estado financeiro específico aparece em `confirmation.order_notes`. UCP o informa em `messages`, sem inventar um status de pagamento no esquema Order.

Não há integração de rastreamento físico nesta entrega. ACP omite contagens de itens enviados e `fulfillments`. UCP exige `quantity.fulfilled`; o valor é zero eventos confirmados no boopay, com aviso explícito de que a integração ainda não informa envio, recebimento ou devolução física. `fulfillment` fica vazio. Pagamento confirmado nunca implica `shipped`, `fulfilled` ou `completed` físico. O estorno integral confirmado acrescenta `adjustments`, preserva o total original e não inventa retorno de mercadoria. ACP inclui `amount_refunded`; UCP usa ajuste de total negativo. Estornos parciais ainda dependem da modelagem comercial correspondente.

O vínculo mínimo entre pedido e cliente sobrevive ao expurgo do rascunho em 48 horas. Uma identidade autorizada e renovada pode consultar o pedido sem recuperar o payload apagado. O permalink usa a página existente de revisão, que permite ao comprador dono abrir o pedido concluído após o expurgo. A autenticação continua obrigatória: não há recuperação de identidade por URL e a sessão atual do comprador tem prazo próprio. Recuperação de identidade após expiração da sessão ainda precisa de um fluxo implementado e validado.

## Ativação explícita

O processo principal não envia notificações com `BOOPAY_PROTOCOL_WEBHOOK_URLS` vazio. Não foi configurado destinatário externo nesta entrega.

1. O operador configura URLs **exatas**, separadas por vírgula, nessa variável e reinicia o processo.
2. O lojista cadastra o cliente e seu perfil público/chaves. Para UCP, a capacidade `dev.ucp.shopping.order` da versão compatível deve conter `config.webhook_url`, validado pelo esquema original de configuração.
3. Com sessão administrativa, chama `PUT /v1/admin/protocol-clients/:id/webhooks/:protocol`, com `{url, enabled:true}`. ACP exige também um `secret` compartilhado exclusivo, com 32–256 caracteres. UCP usa a chave ES256 do comerciante e rejeita esse campo. O segredo ACP fica cifrado por tenant/cliente/protocolo e não retorna em consultas.
4. O comprador emite sua própria autorização com `POST /v1/buyer/protocol-grants`, incluindo `accepted:true`, os protocolos e **`orderUpdates:true`**. O padrão é falso. Essa preferência é vinculada aos novos checkouts criados com a autorização; o agente não pode ativá-la no corpo de checkout.

`orderUpdates` autoriza avisos pós-compra para os checkouts vinculados até cancelamento da preferência ou revogação do cliente. A expiração de 30 minutos do bearer impede novas requisições do agente; não cancela essa preferência persistida. Revogar apenas o bearer também não equivale a cancelar avisos de pedidos existentes. O contrato de consentimento da futura interface deve explicar essa distinção.

O comprador cancela a preferência de um checkout com `DELETE /v1/buyer/protocol-sessions/:id/order-updates`. O lojista desativa o destino com o mesmo PUT e `enabled:false`, ou revoga o cliente. Desativar o destino cancela os eventos pendentes na mesma transação; reativá-lo não ressuscita esses eventos. O endereço é imutável por cliente/protocolo; uma troca exige outro cadastro. Uma requisição que já saiu para o receptor não pode ser recolhida; o estado local é revalidado antes do envio e antes de aceitar o retorno.

## Transporte e assinaturas

URLs devem usar HTTPS, sem credenciais, query ou fragmento, na origem do perfil fixado e na lista exata do servidor. O transporte HTTPS exige TLS 1.3. Cada tentativa resolve DNS, recusa endereços privados/especiais e fixa o IP validado na conexão, mantendo hostname/SNI/certificado originais. Não segue redirecionamentos. DNS e requisição têm limites de dez segundos cada; a resposta tem limite de 64 KiB. IPs literais privados também são recusados. Apenas no ambiente `local`, `http://127.0.0.1` literal pode ser cadastrado explicitamente para um receptor de teste. Isso não comprova interoperabilidade HTTPS de produção.

- **ACP:** `Merchant-Signature: t=<unix>,v1=<hex>` usa HMAC-SHA256 de `timestamp + "." + bytes_do_corpo`. `Request-Id` e `Idempotency-Key` mantêm o UUID do evento. A assinatura é renovada por tentativa; o corpo permanece idêntico.
- **UCP:** ES256/RFC 9421 sobre método, autoridade, caminho, `UCP-Agent`, `Idempotency-Key`, `Webhook-Id`, `Webhook-Timestamp`, `Content-Digest` e `Content-Type`. O perfil indicado é o do comerciante. O digest usa os bytes enviados, conforme `signatures.md`, sem canonicalização JSON. `Webhook-Timestamp` mantém a ocorrência do evento; `created` da assinatura usa o envio. Não é enviado bearer do comprador.

ACP aceita confirmação HTTP 200. UCP exige HTTP 200 e envelope `ucp` com a versão negociada e status ausente/success. Timeout, redirecionamento, resposta inválida ou não confirmada gera nova tentativa; o corpo do erro externo nunca é persistido.

## Persistência, entrega e operação

`saveOrder` persiste o pedido e um marcador de notificação na mesma transação SQLite/PostgreSQL. Uma gravação idêntica não cria outro marcador. Sem preferência do comprador e destino habilitado, não há fila. Os marcadores contêm IDs, sequência e estado operacional, sem endereço, itens ou e-mail.

Antes da primeira tentativa, o worker lê o **estado atual completo** do pedido, valida o esquema e congela o corpo cifrado. Mudanças que ocorreram antes desse primeiro envio podem ser condensadas nesse estado: o marcador não é uma cópia histórica da situação no instante da mudança. Os reenvios reutilizam exatamente o corpo congelado. Eventos posteriores do mesmo pedido não ultrapassam o mais antigo ainda ativo. Depois de uma falha terminal, eventos futuros podem seguir; não existe replay automático de evento terminal antigo.

Cada tentativa usa uma reserva de 30 segundos, UUID estável e proprietário da reserva. O registro só é confirmado pelo proprietário atual. Há no máximo oito tentativas, com espera exponencial a partir de um segundo. Reservas abandonadas podem ser retomadas; uma resposta atrasada não sobrescreve confirmação mais nova. A entrega é **pelo menos uma vez**: o receptor precisa deduplicar o UUID/Idempotency-Key antes de efeitos próprios. Não há promessa de entrega exatamente uma vez.

O corpo cifrado é removido na confirmação, cancelamento, falha terminal ou limite de **48 horas desde a ocorrência do evento**. O sweep roda na inicialização e a cada minuto, mesmo se o envio estiver desativado; claim e ack também verificam expiração. Retornos atrasados não recriam o payload. O marcador mínimo continua retido para diagnóstico. Isso é expurgo lógico na base atual, não apagamento de backups/WAL, pedido comercial ou dados já recebidos pelo parceiro.

Rotas administrativas protegidas e limitadas ao tenant autenticado:

| Operação | Rota |
| --- | --- |
| Configurar destino | `PUT /v1/admin/protocol-clients/:id/webhooks/:protocol` |
| Consultar configuração sanitizada/fila | `GET /v1/admin/protocol-webhooks` |
| Executar lote de 1–100 eventos | `POST /v1/admin/protocol-webhooks/run`, corpo `{limit:20}` |

Com allowlist configurada, o processo executa lotes a cada dez segundos, sem sobreposição no mesmo processo, e aguarda o trabalho no encerramento. Estados `dead`, `expired` e `canceled` não são reenviados por `run`. Para conferir o estado atual, o cliente usa a consulta autenticada de pedidos. Não apague marcadores para tentar forçar nova entrega.

Uma falha de preparação ou persistência em um tenant não impede o processamento dos demais. O ciclo conclui as outras lojas e então sinaliza `webhook_cycle_incomplete`, sem dados do pedido no erro. A fila afetada é preservada para inspeção. O teste de regressão usa um pedido sem preço unitário representável no contrato UCP e confirma que o segundo tenant recebe sua notificação.

## Evidência e limites

Correção final de isolamento no commit `3b025550180bdeb726decbf6e6139bdb72d9007b`, aprovada nos cinco jobs da [CI 34450785103](https://github.com/ThiagoVenturaV/boopay-platform/actions/runs/34450785103): **154 testes de backend no job PostgreSQL, zero omissões**, e **29 cenários de navegador**. A regressão comprova que um pedido sem representação válida em uma loja não interrompe a entrega das demais; a fila afetada é preservada e o ciclo sinaliza falha sanitizada. Localmente: 146 aprovados e oito PostgreSQL também aprovados na CI. O ensaio nativo ACP/UCP e o preview atualizado mantiveram as evidências de pedidos pendentes, estoque e autorização.

Evidência da implementação anterior, preservada para rastreabilidade:

Código `e9b22fda9213218a9179eb7ea5d4b01706f0f9ea` aprovado nos cinco jobs da [CI 34449988239](https://github.com/ThiagoVenturaV/boopay-platform/actions/runs/34449988239): **153 testes de backend no job PostgreSQL, 153 aprovados, zero omissões**; **29 cenários de navegador**; Linux, Windows e WooCommerce nativo aprovados. Localmente, typecheck/build e 145 testes passaram; os oito testes PostgreSQL restantes foram executados e aprovados na CI. O preview foi atualizado: health/discovery 200, capacidade Orders presente e endpoints privados com 401 sem autorização.

`test/protocol-orders.test.ts` verifica consulta assinada, esquema original, isolamento de comprador/cliente/protocolo/tenant, estorno, expurgo, receptor HTTP local real, HMAC/ES256 verificados independentemente, reenvio de mesmos bytes/UUID, ordenação, cancelamento, limite de tentativas, rollback e concorrência de dois pools PostgreSQL. O ensaio `scripts/woocommerce-protocols.ts` também consulta o pedido BACS real do Woo através do endpoint assinado, conservando preço, estoque e ausência de receita paga/envio inventado.

A prova de notificações usa compras sandbox e receptor sintético local. A prova Woo usa PHP/MySQL/plugin nativos e cliente ACP/UCP sintético. Não foram enviados avisos a parceiros reais, validados certificados/domínios de produção ou habilitadas superfícies oficiais ChatGPT/Google. A [interface de cadastro/consentimento](PROTOCOL-ACCESS.md) agora inclui revogação do acesso e interrupção independente das notificações. Recuperação de identidade, rastreamento de entrega, estorno parcial e homologação externa continuam pendentes. O registro atualizado de execução está em [STATUS.md](ESTADO-ATUAL.md).
