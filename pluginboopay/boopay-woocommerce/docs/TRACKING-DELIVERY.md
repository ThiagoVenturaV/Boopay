# Coleta e reenvio de eventos — 0.6.0

O SDK first-party coleta `view` e `exit_intent`; `add_to_cart` vem do hook nativo após a adição ao carrinho. O plugin mantém as credenciais e a assinatura HMAC no servidor. `exit_intent` é um sinal de saída, não prova de abandono ou receita.

## Navegador → WordPress

O SDK cria `eventId` UUID v4 e `occurredAt` UTC antes do primeiro envio. A fila por aba usa sessionStorage, no máximo 50 eventos e retenção de até 24 horas; falha de storage usa somente memória. O cookie de sessão existente mantém duração de até 30 dias. O recibo só é reconhecido com `accepted:true` e `clientEventId` igual ao enviado. `sendBeacon` não é usado como confirmação de entrega.

Há no máximo cinco tentativas por evento, com intervalos de 1, 5, 15 e 60 segundos entre elas. Erro de rede, resposta inválida, 408, 429 ou 5xx preserva o mesmo corpo para reenvio. `Retry-After` numérico é respeitado até cinco minutos. Outros 4xx encerram aquele evento; 403 interrompe a coleta e remove fila/cookie local. O limite também vale depois de recarregar a página. Um envio iniciado consome a tentativa mesmo que o documento seja fechado. Não há promessa de entrega se o visitante fechar a aba definitivamente, esgotar as tentativas ou permanecer offline além da retenção.

Visualização é deduplicada por produto/caminho na sessão da aba durante até 24 horas. A fila registra o evento antes de marcar essa visualização. Saída por mouse ou `pagehide` com carrinho conhecido gera no máximo um sinal por documento. Adição AJAX comunicada pelo evento Woo `added_to_cart` habilita esse sinal. Navegação por toque usa `pagehide`; trocar apenas de aba não gera saída. Só origem e caminho da página são enviados, sem query/fragmento, contato, endereço ou dados de pagamento.

O script expõe `window.boopayWooTracker.flush()`, `stop()` e `status()` (contagens/estado, sem identificadores). `stop()` é útil para o mecanismo de consentimento da loja. Uma nova autorização depois de `stop` requer nova página; não ressuscita a fila anterior.

## WordPress → Boopay

`POST /wp-json/boopay/v1/events` exige origem HTTP exata (esquema/host/porta), conexão vigente e tracking habilitado. Aceita corpo de até 16 KiB, UUIDs válidos, produto Woo existente para view e data de até 24 horas atrás ou cinco minutos à frente. O ID da conexão enviado pelo SDK precisa ser o atual. O limite existente é de trinta recebimentos/minuto por sessão; não é proteção completa contra visitantes maliciosos que inventem sessões.

`boopay_browser_events` possui chave primária derivada de conexão/eventId e hash do pedido minimizado. Retém o **primeiro** envelope, com timestamp, pseudônimo de cliente e snapshot de carrinho. Reenvio não recolhe um carrinho posterior nem troca a identidade após logout. Conteúdo diferente no mesmo ID dá 409. Campo extra descartado não modifica a semântica do evento. O ID canônico é `browser:` seguido da chave de 64 caracteres; o UUID do navegador retorna como `clientEventId`.

Na rota REST, o snapshot restaura a sessão/carrinho pela API nativa `wc_load_cart()` depois da validação do recebimento. O WooCommerce não inicializa automaticamente o carrinho de frontend em uma rota REST personalizada. Produtos e quantidades vêm da sessão da loja, não do corpo enviado pelo navegador.

O recebimento responde 202/200 somente depois que Action Scheduler ou WP-Cron aceita a entrega. Se a fila falhar, responde 503; o próximo pedido reutiliza o envelope persistido. Interrupção entre agendamento e gravação do recibo pode produzir duas entregas do **mesmo** envelope; a chave idempotente do Core impede duas métricas. A fila de servidor conserva o limite próprio de cinco tentativas. Desabilitar tracking, desconectar/reconectar a loja ou ultrapassar 24 horas bloqueia o envio de envelopes do navegador nesta versão.

Recibos expiram 24 horas após o evento. São removidos em lotes de até 1.000 no recebimento e por tarefa horária WP-Cron. O cron depende de execução/visitas na instalação; não se promete prazo físico se estiver parado. Desativação cancela o cron, preservando dados; desinstalação remove a tabela de recibos. Históricos do Action Scheduler seguem a retenção dele e eventos já recebidos pelo Boopay seguem a política da plataforma.

## Consentimento e limites

Tracking continua desligado em instalações novas. Quando a WP Consent API está disponível, o plugin e o navegador verificam a categoria oficial `statistics`, com listener de mudança de consentimento. Sem ela, continua valendo o opt-in do lojista e o filtro `boopay_woocommerce_tracking_allowed`; a loja deve integrar seu mecanismo de consentimento. Esta alteração não certifica conformidade nem instala um banner.

Revogar no navegador interrompe novas tentativas e apaga fila/cookie local. Uma requisição já aceita e enfileirada pelo servidor pode concluir; esse comando não promete apagar eventos ou recibos externos. O vínculo `customerId` é calculado a partir do usuário WordPress autenticado, não aceito do corpo do navegador. A sessão browser continua um identificador não verificado para análise, sem poder de autenticação ou compra.

O Core aceita campos nulos do plugin, preserva quantidade/variação/carrinho com até cem linhas, associa somente SKUs existentes da mesma integração e descarta propriedades arbitrárias. Não transforma esse sinal em checkout abandonado, pagamento ou pedido. O coletor Woo não constitui SDK instalado de Shopify/VTEX.

Referências primárias consultadas em 11/09/2026: [WP Consent API — categorias e mudanças](https://github.com/WordPress/wp-consent-level-api/blob/master/readme.txt), [Action Scheduler — confirmação de agendamento](https://actionscheduler.org/api/). Validação executada é registrada no repositório privado da plataforma e no relatório da versão; não confundir fixtures com lojas externas homologadas.
