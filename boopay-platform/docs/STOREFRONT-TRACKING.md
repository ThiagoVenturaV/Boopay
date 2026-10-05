# SDK e coleta storefront

Incremento de 11/09/2026, plugin Woo 0.6.0. A auditoria encontrou duas lacunas no fluxo real: `exit_intent` chegava com `productId/pageUrl:null`, recusados pelo backend; o SDK descartava erros de rede e o receptor criava outro ID/timestamp para cada recebimento.

O Core agora aceita os campos opcionais nulos, preserva quantidade, variação, identificador de carrinho e snapshot de até cem linhas. Faz referência a `canonicalProductId` somente quando o SKU existe na mesma integração. Produto ausente fica sem vínculo, sem fabricar correspondência. Endereço, preço informado pelo navegador, email, cartão e propriedades arbitrárias são descartados; URL fica em origem/caminho. A quantidade adicionada exige valor positivo, e payload de visualização exige produto.

O envelope conserva `eventId`, `tenantId`, `integrationId`, `occurredAt` e o `sessionId` em `data`. O Core salva evento/outbox e chave idempotente na mesma transação. `browser_reported` identifica view/saída; `store_reported` identifica adição confirmada no Woo. Essas observações não autenticam uma pessoa e não criam pedidos, pagamentos ou abandonos canônicos.

## Entrega no WooCommerce

O SDK empacotado usa UUID/timestamp imutáveis, no máximo cinquenta eventos por aba e cinco tentativas por evento, com retenção de até 24 horas. Reenvia rede/408/429/5xx ou resposta inválida, reconhecendo somente recibo com o mesmo ID. sessionStorage permite recuperar após reload; sem storage, funciona em memória enquanto o documento existir. Saída é persistida antes da tentativa com fetch keepalive. Uma aba fechada definitivamente não tem garantia de entrega.

O receptor WordPress verifica origem exata, validade e conexão. A tabela de recibos, com chave primária por integração/evento, conserva o primeiro envelope. Uma repetição depois de mudar carrinho ou login reutiliza esse snapshot; conteúdo diferente dá 409. Falha de agendamento responde 503 sem inventar aceite. Uma interrupção entre fila e recibo pode gerar duas entregas do mesmo envelope, deduplicadas pelo Core.

Consentimento segue a categoria `statistics` quando a WP Consent API existe, além da configuração/filtro do lojista. Revogação no navegador apaga fila/cookie e interrompe novas tentativas. Dados já aceitos pelo servidor não são declarados apagados. O plugin não instala CMP nem certifica conformidade. [Contrato completo e limites de retenção](../../pluginboopay/boopay-woocommerce/docs/TRACKING-DELIVERY.md).

## Verificação

A primeira execução nativa (CI 34563911346) reproduziu um carrinho vazio na rota REST, embora o navegador tivesse adicionado um produto. O plugin foi corrigido para inicializar a sessão/carrinho com `wc_load_cart()` nesse contexto. O ensaio manteve a exigência de uma linha com quantidade um e passou na [CI 34564170743](https://github.com/ThiagoVenturaV/boopay-platform/actions/runs/34564170743), commit `1d49e91eabc0ec93d4276cc5567d3dbf8e66dc92`.

- `npm run check`: 305 cenários, 284 aprovados localmente, zero falhas, dezoito PostgreSQL e três Firestore reservados à CI.
- O teste do SDK lê o JavaScript do ZIP instalável e verifica o SHA-256 do manifesto. Cobre perda de resposta/reload, igualdade de payload, recibo incorreto, orçamento de tentativas, 429, revogação, saída e expiração.
- Os testes do Core cobrem nulos, carrinho, SKU/variação, dados descartados, deduplicação/conflito e ausência de receita/abandono inventados.
- O ensaio `tools/woocommerce/tracking-smoke.mjs` passou com Chromium, WordPress 7.0.4/PHP 8.3.33, WooCommerce 11.0.1, Action Scheduler, MySQL e HTTP assinado reais. Os percursos comerciais existentes também passaram. A CI aprovou os seis jobs, 302 cenários PostgreSQL + três Firestore, 49 percursos do painel e demos Windows/Linux. [Resultado executado](https://github.com/ThiagoVenturaV/boopay-platform/blob/3ab824e3375d6d5d2956e0ca61aa90100f93a0d7/docs/evidence/tracking-native-2026-09-11.json), [CI oficial](https://github.com/ThiagoVenturaV/boopay-platform/blob/3ab824e3375d6d5d2956e0ca61aa90100f93a0d7/docs/evidence/tracking-ci-2026-09-11.json).

A publicação privada usa o ZIP 0.6.0 do plugin `1a086ca2474f68a2cbfab2a6995491c28ebf17e7`, SHA-256 `002dbe156b0bf199d40ef4a59aebebb8cf7a1016885b90f94b31b193ebffa5b4`, conforme o [manifesto](https://github.com/ThiagoVenturaV/boopay-platform/blob/3ab824e3375d6d5d2956e0ca61aa90100f93a0d7/tools/woocommerce/fixtures/manifest.json). A entrega foi comprovada em uma loja nativa isolada. Perda de resposta e falha de fila foram induzidas; isso não homologa lojas externas, CMPs ou carga de produção.

## Escopo ainda aberto

Esse incremento cobre o coletor Woo. A etapa seguinte implementou [SDKs Shopify/VTEX e receptor público de analytics](STOREFRONT-PIXELS.md), com pacotes e ensaios Chromium/Core usando APIs nativas sintéticas. A instalação e validação em lojas externas permanecem pendentes. O vínculo consentido entre a sessão da loja e o comprador autenticado do perfil 360° também permanece pendente: receber um pseudônimo no evento não prova esse vínculo nem atualiza sozinho o perfil. Resolução avançada entre dispositivos continua fora do MVP. Os itens 7.1/7.2 e o marco de navegação/perfil não devem ser declarados fechados por esta correção isolada. [Matriz de entrega](CRITERIOS-DE-ACEITE.md).

Referências primárias: [categorias e eventos da WP Consent API](https://github.com/WordPress/wp-consent-level-api/blob/master/readme.txt), [retorno de agendamento do Action Scheduler](https://actionscheduler.org/api/).
