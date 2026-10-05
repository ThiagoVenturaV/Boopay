# Ponte VTEX: runtime e auditoria pendente

**Atualização 0.2.6:** o [Core com baggage limitado](VTEX-BAGGAGE.md) preserva a API 1.x e o Core 2.x separado do Jaeger. Mantém o [UUID oficial corrigido com entradas legadas](VTEX-UUID.md). Mantém a [correção HTTP local do Prometheus](VTEX-PROMETHEUS.md), o [Jaeger oficial corrigido](VTEX-JAEGER.md), as [correções transitivas](VTEX-BRIDGE-DEPENDENCIES.md) e o [parser multipart local](VTEX-MULTIPART.md). Instalação segue pendente. A descrição 0.2.0 abaixo preserva a evidência anterior às correções; suas contagens de auditoria são históricas.

Revisão de 11/09/2026. O candidato Broadcaster **0.2.0** declara Node builder **7.x**, TypeScript **5.5.3** e `@types/node` **20.0.0**, com versões iguais no pacote gerado e lockfile. O candidato anterior declarava builder 6.x, mas compilava localmente com tipos Node 24/TypeScript 5.9; essa combinação não comprovava compatibilidade com o builder.

A [tabela oficial da VTEX](https://developers.vtex.com/docs/guides/vtex-io-documentation-node-builder) associa builder 7.x a Node 20, tipos 20.0.0 e TypeScript 5.5.3; os [status de builders](https://developers.vtex.com/docs/guides/vtex-io-documentation-builder-version-statuses) classificam 6.x como deprecated. A alteração segue o [guia de migração](https://developers.vtex.com/docs/guides/node-builder-7x-migration-guide). Não houve `vtex link`, instalação, publicação ou mudança em conta externa.

## Evidência de compatibilidade

No Windows, a ponte compilou com Node **20.20.2** e TypeScript **5.5.3**. Os três testes próprios passaram. Dois cobrem assinatura/minimização e o handler; o terceiro carrega o `Service`, `IOClients`, `ExternalClient` e a serialização Axios reais do SDK. Com contexto/settings VTEX e adaptador final de rede sintéticos, ele confirma:

- desligamento por padrão e uso do ID atual do aplicativo ao consultar settings;
- corpo canônico e assinatura preservados depois da serialização do cliente;
- origem/caminho limitados, configuração de timeout de cinco segundos e ausência de retries/redirects automáticos;
- uma tentativa após ativação, rejeição de caminho alheio e perda de resposta apresentada como falha, sem segundo envio automático.

Este teste não chama `startApp`, não emula o proxy da VTEX e não prova remoção de headers pelo proxy, entrega do Broadcaster, isolamento de settings ou suporte operacional da plataforma. Os dois avisos locais sobre métricas de diagnóstico indisponíveis refletem esse contexto sintético. As restrições de redirect são verificadas na configuração encaminhada ao adaptador; não é ensaio de redirecionamento no proxy real.

O ensaio separado executou ponte compilada → HTTP loopback → Core/SQLite no Node 24, com respostas de loja sintéticas. Confirmou 202/200 após perda de resposta, atualização de SKU para 2.431 centavos, zero pedidos e pacote 0.2.0 com builder/compilador/tipos/lockfile coerentes. O Core continua exigindo Node 24 para `node:sqlite`.

Na CI, o job `vtex-catalog-candidate` alterna para Node 20 antes de instalar/compilar/testar a ponte e retorna ao Node 24 para o Core e o ensaio HTTP. A [evidência local](https://github.com/ThiagoVenturaV/boopay-platform/blob/3ab824e3375d6d5d2956e0ca61aa90100f93a0d7/docs/evidence/vtex-builder7-local-2026-09-11.json) registra os limites. O commit `81af99127407b7a3738d2ddcc6fcc149e6e7ed44` passou nos sete jobs da [CI 34595458033](https://github.com/ThiagoVenturaV/boopay-platform/actions/runs/34595458033): três testes da ponte em v20.20.2, ensaio HTTP em Node 24, 380 cenários distintos de backend, 53 percursos do painel, quatro dos pixels, WooCommerce nativo e demos Linux/Windows. A auditoria mantém 39 achados, tolerados pelo job de candidato. [Evidência oficial](https://github.com/ThiagoVenturaV/boopay-platform/blob/3ab824e3375d6d5d2956e0ca61aa90100f93a0d7/docs/evidence/vtex-builder7-ci-2026-09-11.json).

## Origem dos achados

O registro npm e as [releases oficiais do SDK](https://github.com/vtex/node-vtex-api/releases) ainda indicam **7.5.0** como versão mais recente na consulta desta revisão. Atualizar o compilador não altera as dependências de execução: `npm audit --omit=dev --json` continua retornando código 1, com **39 pacotes afetados: 11 altos, 27 moderados e um baixo**. Não são 39 caminhos exploráveis confirmados neste aplicativo.

| Cadeia observada                                                                      | Por que a atualização comum não fecha o achado                                                                                                               |
| ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `@vtex/api@7.5.0` → `@opentelemetry/host-metrics@0.35.5` → `systeminformation@5.23.8` | As duas versões transitivas são fixadas exatamente; o registro oferece systeminformation 5.33.10, mas instalá-lo exige substituir a escolha do fornecedor    |
| SDK → `@vtex/diagnostics-nodejs@0.1.8-io` → OpenTelemetry                             | O SDK fixa a variante IO; ela usa as famílias 1.x/0.x afetadas. A versão genérica 5.5.3 do pacote de diagnóstico não prova compatibilidade com essa variante |
| SDK → `graphql-upload@^13` → busboy/dicer                                             | A cadeia antiga permanece na instalação do SDK mesmo que a ponte não declare uma rota GraphQL                                                                |
| SDK → `cookie@^0.3.1`, `uuid@^3.3.3` e Jaeger/GraphQL tools                           | As faixas declaradas incluem versões afetadas; as versões corrigidas atravessam os intervalos aceitos pelo fornecedor                                        |

O manifesto de dependências do fornecedor foi conferido no registro e no [código oficial](https://github.com/vtex/node-vtex-api/blob/v7.5.0/package.json). Não foram introduzidos overrides de versões incompatíveis, retirada de telemetria ou um fork do SDK para obter auditoria verde sem prova do comportamento nativo. O inventário original de avisos permanece em [vtex-catalog-sdk-audit-2026-09-11.json](https://github.com/ThiagoVenturaV/boopay-platform/blob/3ab824e3375d6d5d2956e0ca61aa90100f93a0d7/docs/evidence/vtex-catalog-sdk-audit-2026-09-11.json); a evidência desta revisão vincula as contagens ao novo lockfile.

## Liberação ainda pendente

O builder 7.x é a combinação documentada pela VTEX, mas o próprio projeto Node.js classifica [Node 20 como EOL](https://nodejs.org/en/about/previous-releases). Isso exige confirmar com a VTEX a política de manutenção e segurança de seu runtime gerenciado; o teste de compatibilidade não responde a essa questão nem recomenda Node 20 para o Core.

A instalação continua sem liberação. São necessárias uma composição de SDK/runtime corrigida e sustentada pelo fornecedor, nova auditoria, testes do serviço/proxy/eventos em workspace autorizado e homologação do contrato de catálogo/remoções. Nenhum contato com suporte, ticket ou mensagem externa foi enviado. A migração encerra a incompatibilidade declarada de builder/compilador, mas não encerra a auditoria do SDK, as homologações nem a meta integral do Boopay.
