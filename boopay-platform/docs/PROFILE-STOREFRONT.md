# Vínculo entre loja e perfil — base de API

Implementado em 11/09/2026: autorização pelo comprador autenticado, recebimento nos coletores Shopify/VTEX e na ingestão assinada Woo, projeção do perfil, exportação, revogação e retenção. A [interface de aceite e a transferência direta aos SDKs Shopify/VTEX 0.2.0](STORE-PROFILE-UI.md) foram acrescentadas, com prova Chromium/HTTP/Core e APIs de loja sintéticas. A ponte do plugin Woo e a instalação nas lojas autorizadas permanecem pendentes. As evidências da base abaixo usam requisições controladas.

## Autoridade e consentimento

O comprador precisa autorizar `personalization` na política do [perfil](PROFILE.md) e aceitar separadamente `boopay-store-profile-2026-09-11`. O servidor deriva comprador/tenant da sessão autenticada, valida a integração ativa e a origem exata da loja. Shopify/VTEX exigem um coletor configurado; Woo usa o vínculo da integração assinada. HTTPS é obrigatório, exceto loopback no modo local.

A autorização emite uma capacidade de escrita de 32 bytes aleatórios, retornada como `grant`. Ela só permite acrescentar atividade minimizada a esse perfil, nessa integração/coletor/origem. Não autentica uma pessoa, não lê o perfil, não confirma compra e não concede autoridade financeira. Conhecer um UUID de analytics, e-mail ou ID de cliente da loja não cria o vínculo.

O primeiro evento válido apresentado com essa capacidade fixa uma sessão UUID. Eventos seguintes precisam repetir a mesma sessão. O estado é uma autorização do comprador para uma sessão observada; não constitui verificação de identidade da conta nativa, recuperação entre dispositivos ou fusão de perfis.

## API do comprador

Todas as rotas abaixo usam a sessão do comprador e as proteções de origem/CSRF existentes. Respostas usam `Cache-Control: no-store`.

| Rota | Operação |
|---|---|
| `GET /v1/buyer/profile/storefront/policy` | Política e limites técnicos |
| `GET /v1/buyer/profile/storefront/links` | Autorizações próprias, estado, origem, sessão observada, validade e contagens; sem capacidade ou hash |
| `POST /v1/buyer/profile/storefront/links` | Cria autorização com `Idempotency-Key` e corpo abaixo; retorna `link` e `grant` |
| `POST /v1/buyer/profile/storefront/links/:id/revoke` | Corpo `{}`; interrompe novas gravações e remove a atividade daquele vínculo do perfil ativo |

Corpo de criação, com identificadores a substituir por configurações autorizadas:

```json
{
  "platform": "shopify",
  "integrationId": "ID_DA_INTEGRACAO",
  "collectorId": "ID_DO_COLETOR",
  "origin": "https://sua-loja.myshopify.com",
  "expectedVersion": 1,
  "policyVersion": "boopay-store-profile-2026-09-11",
  "accepted": true
}
```

Woo usa `platform:woocommerce` e `collectorId:null`. Corpo máximo de 4 KiB. A mesma chave e o mesmo conteúdo recuperam o resultado durante a janela de ativação, sem criar outra capacidade. Mudança de conteúdo, consentimento, revogação ou janela encerrada impede recuperação. Criar um novo vínculo exige nova ação explícita e a versão atual do consentimento.

## Uso no recebimento

Shopify/VTEX aceitam `profileGrant` opcional no corpo já descrito em [STOREFRONT-PIXELS.md](STOREFRONT-PIXELS.md). Woo aceita `data.profileGrant` no envelope assinado existente. O servidor remove essa capacidade antes de gravar evento analítico e outbox. Ela não aparece em exportações, consultas do perfil ou respostas de analytics. Logs têm campos de capacidade protegidos, e a persistência guarda hash de busca e cópia AES-GCM temporária para repetição autorizada da criação.

O vínculo recebe somente eventos novos, com timestamp igual ou posterior ao aceite e não futuro. Repetir um recibo antigo não importa seu histórico. Não há retroimportação por UUID, e-mail, cliente ou carrinho. Capacidade ausente, inválida, fora da origem, de outra sessão, vencida ou revogada não acrescenta atividade ao perfil; o evento de analytics ainda pode ser aceito pelo contrato próprio. Um `accepted:true` de analytics não é comprovante de vínculo ativo.

Evento, recibo, cota, atividade do perfil e marcador de projeção compartilham a transação do tenant. Falha na persistência reverte o conjunto. Recebimento e revogação são serializados; repetir o evento não duplica interesse, carrinho ou contagem. Credenciais nativas/coletor continuam sendo verificadas pelo ingresso existente, com a janela de revogação de conexão Shopify documentada no contrato dos pixels.

## Projeção e privacidade

`profile.projection.storefront` reúne vínculos, sessões, atividades e snapshots de carrinho observados. Guarda somente produto canônico da mesma integração, nome/categoria de catálogo, quantidade, origem, tipo, sessão e horários. IDs de cliente nativo, contato, preço relatado e URL detalhada não entram nessa projeção.

Visualizações vinculadas acrescentam o mesmo peso 1 da regra de interesses existente. Adições isoladas não inventam um carrinho completo. Quando há snapshot, o mais recente por timestamp de evento é apresentado como `last_observed_snapshot`; empate usa a sequência de recebimento dentro do vínculo. Snapshot vazio limpa a última observação. Isso não prova estoque atual, carrinho aberto ou abandono. Checkouts, compras, frequência, gasto e receita continuam sendo derivados dos registros comerciais canônicos. `exit_intent` aparece na linha do tempo sem virar abandono de checkout.

Revogar o vínculo remove suas observações e impede novas gravações. Revogar a personalização ou excluir o perfil remove todos os vínculos, índices de capacidade e atividades vinculadas. Reautorizar não os restaura. Uma mudança da versão do consentimento também impede novas gravações com a autorização anterior. A exportação inclui a atividade e os metadados públicos dos vínculos, sem segredos. Marcadores de alteração/exclusão atualizam a projeção eventual; execução cloud continua sujeita ao [contrato de dados](DATA-PROJECTIONS.md).

Analytics prévio da loja e registros comerciais permanecem separados. Histórico de IA já autorizado mantém seu próprio controle e retenção: revogar um vínculo de loja não declara apagadas conversas anteriores nem chamadas em andamento. Revogar contexto de IA ou excluir o perfil aplica o procedimento próprio. O interesse recalculado invalida o uso de embeddings cujo hash deixou de corresponder ao perfil.

A projeção operacional Firestore mantém os campos minimizados existentes, incluindo os interesses recalculados. A nova lista completa de sessões, observações e snapshots de loja fica na API canônica do perfil; não foi acrescentada ao payload cloud deste incremento.

## Limites e limpeza

- Ativação em até cinco minutos; uso por até 24 horas, limitado ainda pela validade da sessão do comprador e da conexão resolvida.
- Até dez vínculos utilizáveis por comprador, vinte novas autorizações por comprador/dia UTC e mil por tenant/dia UTC.
- Até mil observações vinculadas por autorização. Ao atingir o limite, a API de vínculos informa `limit_reached`; analytics mantém sua cota própria.
- A cópia cifrada de recuperação deixa de ser útil após cinco minutos e é apagada pelo ciclo de retenção. O hash de uma autorização ativa é removido na expiração/revogação/exclusão.
- Vínculos e observações retidos por até trinta dias; contadores mínimos de quota por até 48 horas. Exclusão do perfil remove vínculos/observações antes desse prazo, mantendo temporariamente o contador de abuso sem histórico de navegação.
- O ciclo já existente de retenção roda na inicialização e a cada sessenta segundos. A leitura e o recebimento recusam capacidades vencidas sem depender da limpeza física. Bases, backups e caches externos seguem os limites de operação documentados; isso não demonstra capacidade de produção nem certificação legal.

## Verificação e trabalho seguinte

`npm run check`: 329 cenários, 306 aprovados, zero falhas, vinte PostgreSQL e três Firestore reservados aos jobs próprios. Depois dos ajustes finais de origem HTTPS e minimização da sessão, typecheck, onze testes focados locais e os dois percursos existentes dos pixels passaram novamente. Um novo teste exercita concorrência em dois pools PostgreSQL; a evidência de execução da CI fica em [STATUS.md](ESTADO-ATUAL.md).

Os ensaios cobrem auth/CSRF, consentimento, vínculo único, isolamento, assinatura Woo HTTP, Shopify/VTEX sintéticos, recibos, rollback, ordenação, expiração, revogação, exclusão e marcadores de projeção. Na CI da base de API abaixo, plugin e SDKs ainda não enviavam `profileGrant`. O incremento [SDK 0.2.0 e interface](STORE-PROFILE-UI.md) acrescentou essa entrega nos SDKs Shopify/VTEX; o plugin Woo permanece pendente. Nenhuma interação em loja externa real está sendo alegada para esse vínculo.

A [CI 34569264098](https://github.com/ThiagoVenturaV/boopay-platform/actions/runs/34569264098) aprovou os seis jobs no commit `310cef5eae25caa22f406556355abea26583bbb4`: 326 testes no PostgreSQL e três no emulador Firestore, completando 329 cenários distintos; 49 percursos do painel e dois percursos existentes dos pixels, Woo nativo e demos Linux/Windows também passaram. [Evidência oficial](https://github.com/ThiagoVenturaV/boopay-platform/blob/3ab824e3375d6d5d2956e0ca61aa90100f93a0d7/docs/evidence/profile-store-link-ci-2026-09-11.json). Os testes de navegador/plugin desta CI são regressões do comportamento anterior; o novo vínculo foi verificado por API e transações, incluindo dois pools PostgreSQL.

A revisão/aceite visual e o transporte da capacidade aos SDKs Shopify/VTEX foram implementados com validação de origem/janela, perda de resposta e revogação. O próximo incremento deve levar a mesma autorização ao plugin Woo e à sessão nativa. A capacidade não deve circular em URLs, logs ou eventos públicos do bus de analytics. A Browser API oficial da Shopify oferece storage executado no frame principal, mas o comportamento dessa ponte ainda exige ensaio no sandbox autorizado; [referência primária consultada em 11/09/2026](https://shopify.dev/docs/api/web-pixels-api/standard-api). A [meta completa](CRITERIOS-DE-ACEITE.md) permanece aberta.
