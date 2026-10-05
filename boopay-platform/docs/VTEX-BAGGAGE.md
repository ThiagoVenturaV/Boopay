# Limites de baggage no Core da ponte VTEX

O candidato **0.2.6** incorpora **`@opentelemetry/core@1.30.1-boopay.1`**, com a correção oficial de extração W3C Baggage preservando a API 1.x exigida pelo diagnóstico IO. É um pacote mantido pelo Boopay; a instalação em loja e a homologação do SDK/runtime permanecem pendentes.

## Origem e compatibilidade

O [aviso oficial GHSA-8988-4f7v-96qf](https://github.com/advisories/GHSA-8988-4f7v-96qf) identifica a falta de limites na extração de baggage e a correção a partir de Core 2.8.0. O limite HTTP do Node reduz a exposição habitual, mas não substitui a validação no propagador, usado também por outros transportes. O pacote 2.9.0 já empregado pelo Jaeger inclui essa correção.

A API pública 2.9.0 não exporta funções como `getEnvWithoutDefaults` e `RandomIdGenerator`, presentes em 1.30.1. O SDK Node e o SDK de traces 1.x ainda importam essas funções. Assim, a troca isolada de todo o Core não é uma migração completa da pilha. O backport mantém os exports originais e usa os dois fontes oficiais 2.9.0 de baggage, sem modificações nesses arquivos.

O Core do SDK, recursos, métricas, logs e exportador Prometheus resolve a versão local 1.30.1-boopay.1. Uma exceção explícita mantém **Core 2.9.0 oficial no Jaeger 2.9.0**, tanto no npm quanto no Yarn. Não há remoção de telemetria. SDK Node 0.57.2, diagnóstico IO 0.1.8-io, métricas/resources 1.30.1, UUID corrigido e os patches anteriores permanecem.

## Fonte e reprodução

Os **51 fontes TypeScript** foram recuperados dos mapas do pacote npm oficial 1.30.1. **48 mantêm o hash original**; `baggage/utils.ts` e `baggage/propagation/W3CBaggagePropagator.ts` usam os fontes oficiais 2.9.0, e `version.ts` identifica a manutenção local. A proveniência registra integridades dos dois pacotes, exports e hashes de cada fonte. A licença Apache-2.0 e o README original foram preservados.

`npm run vtex:catalog:pack-core` verifica os fontes e compila CommonJS, ESM e ESNext com TypeScript 5.5.3. O resultado contém **518 arquivos permitidos**, incluindo fontes, mapas, declarações, configurações e licença. O SHA-256 do arquivo `vendor/opentelemetry-core-1.30.1-boopay.1.tgz` é **`585056cfd394c761597002914f19e1433da1d902060ac2a7663e7bcd8956bf82`**; o empacotamento repetido produziu o mesmo hash. O gerador da ponte copia apenas a lista de arquivos derivada dos fontes registrados, com caminhos validados. A CI recompila os três formatos e compara os resultados com o commit.

## Provas

Três testes novos completam **21 testes distintos** da ponte:

1. Resolução compartilhada pelos consumidores 1.x, preservação dos exports e do Core 2.x do Jaeger; igualdade dos 518 arquivos instalados com os mantidos, hashes dos 51 fontes e conteúdo dos mapas nos três formatos.
2. Extração limita 10 mil pares a 180 entradas; strings e arrays respeitam os limites de 4.096 por entrada e 8.192 no conjunto. Percentuais malformados são ignorados sem exceção, enquanto valores UTF-8 codificados, metadados e último valor de uma chave duplicada são preservados. Contexto anterior sem entrada válida e supressão de injeção são verificados. A interpretação de entradas vazias segue a versão oficial 2.9.0.
3. A fábrica nativa `NodeSDK` seleciona `tracecontext,baggage`, instrumenta HTTP real e exporta para memória. Seis requisições confirmam o pai remoto, limites de contagem/tamanho, duas entradas malformadas e uma consulta posterior com 200. Os seis spans de servidor chegam ao exportador após flush no shutdown. Não há propagador substituto no ensaio.

O Node junta cabeçalhos repetidos com vírgula e espaço; o ensaio HTTP contabiliza esse espaço no limite total. Seu servidor usa um limite HTTP maior apenas para permitir que a entrada alcance o propagador. Não muda a configuração do aplicativo. A prova anterior com Core 1.30.1 aceitou mil entradas, aceitou uma entrada de 4.097 caracteres e lançou URIError para uma codificação malformada.

Os 21 testes passaram localmente em Node **24.18.0**, por npm e repetidos por Yarn **1.22.22**, em pacote novo com lockfile congelado. O ensaio ponte → HTTP → Core manteve 202/200 após perda de resposta, SKU de 2.431 centavos, zero pedidos e pacote 0.2.6. O código `3307d55b8dde525ab3bcd0888caf8ba692da85da` passou nos **sete jobs** da [CI 34628418872](https://github.com/ThiagoVenturaV/boopay-platform/actions/runs/34628418872). Em **Node 20.20.2**, a recompilação reproduziu os três formatos e os **21 testes por npm e os mesmos 21 por Yarn** passaram. O lockfile Yarn preservou o SHA-256 `ff23344e31927ccb7ad2ad2b7a09dbc98b3a0de6e45bc7efc1f0fe3e3a9b9533`. Regressões: **390 cenários distintos de backend, 53 percursos do painel e quatro dos pixels**, Woo nativo com Stripe sintético e demos Linux/Windows. [Evidência oficial](https://github.com/ThiagoVenturaV/boopay-platform/blob/3ab824e3375d6d5d2956e0ca61aa90100f93a0d7/docs/evidence/vtex-baggage-ci-2026-09-11.json).

Auditoria npm: **3 pacotes afetados, 3 altos**; Yarn: **3 avisos moderados e 1 alto**. As contagens não certificam backports; as etapas de auditoria toleram falha. O npm reportou SDK Node, SDK VTEX e diagnóstico IO; deixou de listar o Core após a mudança para a versão local. Essa ausência não certifica o backport. O registro conserva os avisos recebidos, inclusive o mapeamento UUID do Yarn documentado na revisão anterior. A queda ou permanência de uma contagem não é prova de segurança do código local.

## Limites

Os formatos ESM/ESNext são recompilados e conferidos; a integração de execução testada é Node/CommonJS. Não há prova de bundler/browser, worker/proxy VTEX ou de todos os exportadores. Os limites são exercitados com cabeçalhos ASCII e UTF-8 codificado por percentuais; não constituem medição de memória ou benchmark sob carga.

A manutenção local e seus testes não equivalem a aprovação do OpenTelemetry ou da VTEX. Auditorias por versão podem continuar apontando a família original e não certificam o backport. O SDK Node ainda pertence à faixa do aviso Prometheus. Suporte do runtime gerenciado, composição sustentada e testes em workspace autorizado seguem necessários. A meta integral do MVP permanece aberta.
