# Coletores Shopify e VTEX — SDK 0.2.0

Implementação de 11/09/2026. Complementa o [coletor Woo 0.6.0](STOREFRONT-TRACKING.md) com adaptadores para Shopify Customer Events e VTEX Pixel Manager. Os scripts gerados percorreram navegador, CORS, HTTP, SQLite, evento/outbox e métricas do Core. As APIs das plataformas nesses ensaios são fixtures sintéticas: nenhuma loja Shopify/VTEX foi instalada ou homologada.

## Contrato e fronteira de confiança

`POST /v1/storefront/collectors/:id/events` recebe `eventId`, `occurredAt`, `sessionId` UUID, `eventType` (`view`, `add_to_cart`, `exit_intent`), `pageUrl`, IDs nativos de produto/variante, quantidade positiva e `consent:analytics_allowed`. Há suporte no receptor a um snapshot opcional de até cem linhas; os novos SDKs não inventam um snapshot completo a partir de adições isoladas.

Tenant, plataforma e integração vêm da configuração do servidor. O ID público do coletor serve para roteamento e pode ser visto no JavaScript. A requisição não recebe bearer, cookie do Boopay, segredo de app nem credenciais da loja. Origem exata e cotas limitam a coleta, mas não autenticam um visitante ou impedem que um cliente não-browser forje dados. Todos os eventos são `browser_reported`, inclusive `add_to_cart`. Sem uma autorização específica, não criam perfil. Mesmo vinculados, não criam comprador autenticado nativo, checkout, abandono canônico, pedido, pagamento ou receita.

O receptor remove propriedades extras, query/fragmento, contato, preço e identidade. `canonicalProductId` só aparece quando o SKU e o produto pai correspondem a registros da mesma integração. Falta de catálogo ou relação divergente preserva o evento sem esse vínculo. O preço de um pixel nunca atualiza o catálogo.

Evento, recibo idempotente, quota e outbox são gravados na mesma transação do tenant. Repetição igual retorna 200; primeiro aceite retorna 202; mesmo ID com conteúdo minimizado diferente retorna 409. Limite diário configurável de 1 a 100.000 aceites, padrão 10.000, por coletor/dia UTC. Duplicatas aceitas não gastam nova quota. Corpo máximo de 16 KiB e limite HTTP por IP se somam a essa cota; não representam proteção completa contra abuso público ou prova de capacidade de produção.

Eventos podem ter até 24 horas de idade ou cinco minutos à frente. Recibos guardam hash/ID/expiração por 48 horas e são removidos em lotes de até 500 durante novos aceites. Sem tráfego, a remoção física não ocorre automaticamente. Eventos/outbox são o histórico analítico existente, com retenção de produção ainda a definir. Revogação não declara esses dados apagados.

## Configuração do receptor

Uma [base de autorização por API](PROFILE-STOREFRONT.md) permite anexar `profileGrant` para vincular eventos futuros a um perfil já consentido, sem expor essa capacidade no evento analítico. Os SDKs 0.2.0 enviam esse campo somente após o [aceite visual e a entrega direta da autorização](STORE-PROFILE-UI.md). A transferência pelo plugin Woo e a instalação nas lojas reais continuam pendentes.

`BOOPAY_STOREFRONT_COLLECTORS=[]` por padrão. É necessário primeiro configurar/inicializar a conexão Shopify ou VTEX correspondente. Exemplo com identificadores a substituir e domínio exato da loja autorizada:

```json
[{"id":"pixel-demo","tenantId":"TENANT_ID","integrationId":"INTEGRATION_ID","platform":"shopify","origins":["https://sua-loja.myshopify.com"],"revision":1,"expiresAt":"2027-01-01T00:00:00.000Z","dailyLimit":10000}]
```

O tenant/conexão de um coletor são imutáveis. Alterar origens, cota ou validade exige revisão maior; processos com a revisão anterior param de aceitar. Há até quarenta coletores e cinco origens por coletor, com um descritor por integração no processo. Não instalar cópias adicionais do pixel para a mesma integração. HTTP é permitido somente em loopback e modo local. Não há wildcard de origem, `Origin:null`, CORS com credenciais ou permissão global para as rotas administrativas.

`GET /v1/admin/storefront/status` mostra configurações locais, quota e último aceite. `configured` descreve o coletor, não homologa a loja ou garante sua conexão ativa. `POST /v1/admin/storefront/:id/revoke` com `{}` revoga definitivamente aquele coletor e precisa da sessão/origem administrativa do Boopay. Revogação e aceites são serializados na transação do tenant; reiniciar não reativa o registro. Remover o descritor desliga o coletor naquele processo.

A conexão nativa também é revalidada no recebimento. VTEX é checada dentro da transação do tenant; Shopify tem seu registro de autenticação no namespace de sistema e é checada antes dessa transação. Um evento Shopify já em curso pode terminar durante a revogação da conexão. Para interromper o coletor com a barreira transacional de aceites, use sua revogação própria. Nenhuma dessas operações despacha ações comerciais.

## Gerar os pacotes

Execute após escolher a URL HTTPS do Boopay e a conta de teste autorizada. O comando cria um diretório novo, recusa sobrescrita e grava hashes SHA-256 dos arquivos. A URL é pública; não colocar tokens nela.

```powershell
npm run storefront:package -- --platform shopify --endpoint https://SEU_BOOPAY/v1/storefront/collectors/pixel-demo/events --output output/shopify-pixel-0.2.0
npm run storefront:package -- --platform vtex --endpoint https://SEU_BOOPAY/v1/storefront/collectors/pixel-vtex/events --output output/vtex-pixel-0.2.0 --vendor SUA_CONTA_VTEX
```

Os endereços/conta acima são marcadores. `boopay-package.json` contém versão, endpoint, arquivos e hashes; `externalInstallationVerified:false` é intencional. Os módulos fonte ficam em `storefront/sdk`; o empacotador não baixa bibliotecas nem cria contas.

## Shopify

O pacote contém `boopay-custom-pixel.js` para o mecanismo oficial **Custom Pixel** em Customer Events e um app embed do tema com `boopay-exit.js`. A escolha é uma instalação controlada pelo lojista; OAuth de instalação, app pixel gerenciado e App Store não são fornecidos por este pacote.

Configure o Custom Pixel com analytics como permissão necessária e sem finalidades adicionais não utilizadas. O adaptador confere `init.customerPrivacy.analyticsProcessingAllowed` e acompanha `api.customerPrivacy.subscribe('visitorConsentCollected', ...)`. Usa `product_viewed`, `product_added_to_cart` e `cart_viewed`, IDs GID nativos, timestamp/ID de evento da Shopify e sessionStorage assíncrono. Não usa o `clientId` como identidade autenticada nem solicita PII.

No tema, adicione `assets/boopay-exit.js` e `blocks/boopay-exit.liquid` à extensão gerada para a app autorizada, preservando a identidade/configuração produzida pelo CLI. O TOML entregue é uma referência de estrutura, não registro de uma app. Ative o app embed na loja de teste. O script emite `boopay_exit_intent` uma vez por documento em `pagehide` ou saída do mouse, com versão/motivo, usando `Shopify.analytics.publish` e o gate da Customer Privacy API. O pixel recebe em `customData` e encaminha somente após atividade de carrinho observada. Sem a API de privacidade no tema, o sinal não é emitido. Sem o embed, view/add continuam funcionando, mas não há prova de saída.

## VTEX

O pacote contém `manifest.json` com vendor informado e `pixel/body.html`, usando o Pixel builder. Deve ser vinculado à workspace de desenvolvimento da conta autorizada; o domínio `{workspace}--{account}.myvtex.com` precisa constar nas origens do receptor. CLI, vinculação e instalação reais ainda não foram executados.

O script escuta `vtex:productView`, `vtex:addToCart`, `vtex:cartChanged`, `vtex:cartLoaded` e `vtex:pageView`, aceitando somente mensagens da própria janela/origem. Usa `product.productId`, `selectedSku.itemId` e `items[].productId/skuId/quantity`. Uma adição com várias linhas gera um evento por linha. Mensagens sem ID nativo recebem UUID próprio; duas mensagens distintas que representem a mesma ação não podem ser deduplicadas semanticamente apenas por terem conteúdo igual, pois duas adições iguais podem ser legítimas.

A coleta começa desligada. O mecanismo de consentimento da loja deve chamar `window.BoopayStorefront.setAnalyticsConsent(true)` quando a finalidade analítica estiver permitida e `false` quando negada/revogada. `stop()` também interrompe. Essa é uma interface explícita com o CMP; não se presume uma API de consentimento universal da VTEX, não se instala banner e não se lê cookie de autenticação/carrinho. A conexão com o CMP específico da loja ainda precisa ser validada. Saída usa mouse/pagehide após observar atividade de carrinho; não afirma que o carrinho permaneceu cheio ou abandonado.

## Reenvio, revogação e verificação

Os dois SDKs mantêm até cinquenta eventos pendentes por aba, 24 horas de validade e cinco tentativas, com intervalos de 1/5/15/60 segundos. Rede, 408, 429, 5xx ou recibo incorreto permitem repetir o mesmo corpo; `Retry-After` numérico tem teto de cinco minutos. Outros 4xx descartam o evento; 403/404 interrompem a fila. O recibo precisa conter o mesmo ID. A tentativa é persistida antes do envio. Falha de storage mantém a fila em memória. Fechar definitivamente a aba, esgotar tentativas ou bloquear scripts impede garantia de entrega.

Revogação apaga estado local e aborta novas tentativas, sem declarar apagado um evento já aceito. Depois de revogar uma fila ativa, nova autorização exige nova página; a fila anterior não ressuscita. Nenhum evento é armazenado antes do gate de consentimento. O estado informado pelo navegador continua um relato de permissão da loja, não uma certificação legal.

Validação local: `npm run check` aprovou 295 testes, com dezenove PostgreSQL e três Firestore reservados à CI, 317 cenários ao todo. `npm run storefront:smoke` aprovou Shopify e VTEX no Chromium com CORS/HTTP/Core reais e APIs nativas sintéticas. Abrange perda de resposta após aceite, mapeamento SKU/quantidade, minimização, revogação e ausência de efeitos em compras/perfil. Testes de backend cobrem quotas, identidade entre tenants, configuração/revogação persistentes, expiração, rollback e duas conexões PostgreSQL.

A [CI 34566857492](https://github.com/ThiagoVenturaV/boopay-platform/actions/runs/34566857492), no commit `ab85a48e3199d48c7934d3f04958d541e7d1f825`, aprovou os seis jobs: 314 testes no PostgreSQL e três no emulador Firestore, completando os 317 cenários distintos. Os 49 percursos do painel e os dois percursos controlados dos pixels passaram, assim como WooCommerce nativo, demos Linux/Windows e auditoria de dependências de execução. [Evidência oficial](https://github.com/ThiagoVenturaV/boopay-platform/blob/3ab824e3375d6d5d2956e0ca61aa90100f93a0d7/docs/evidence/storefront-pixels-ci-2026-09-11.json). A aprovação não altera o caráter sintético das APIs de loja dos ensaios dos pixels.

Instalação nas lojas, forma efetiva dos eventos, consentimento real, contextos de origem do sandbox Shopify, temas, bloqueadores, limites do Pixel builder e carga de produção permanecem sem homologação. O vínculo consentido com o perfil 360° também permanece pendente. A [meta completa](CRITERIOS-DE-ACEITE.md) não está encerrada por estes ensaios.

Referências primárias consultadas em 11/09/2026: [Shopify Pixel Privacy](https://shopify.dev/docs/api/web-pixels-api/pixel-privacy), [product_viewed](https://shopify.dev/docs/api/web-pixels-api/standard-events/product_viewed), [product_added_to_cart](https://shopify.dev/docs/api/web-pixels-api/standard-events/product_added_to_cart), [Browser API](https://shopify.dev/docs/api/web-pixels-api/standard-api/browser), [eventos customizados](https://shopify.dev/docs/api/web-pixels-api/emitting-data), [app embed de tema](https://shopify.dev/docs/apps/build/online-store/theme-app-extensions/configuration), [VTEX Pixel builder](https://developers.vtex.com/docs/guides/vtex-io-documentation-pixel-builder), [eventos de loja VTEX](https://developers.vtex.com/docs/guides/vtex-io-documentation-6-listeningtostoreevents) e [tipos publicados pelo app oficial Google Tag Manager](https://github.com/vtex-apps/google-tag-manager/blob/master/react/typings/events.d.ts). Os contratos de browser citados não têm a mesma negociação de versão da Admin GraphQL.
