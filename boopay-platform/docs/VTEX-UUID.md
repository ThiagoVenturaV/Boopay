# UUID corrigido com compatibilidade para o SDK VTEX

**Atualização posterior:** a [ponte 0.2.6 limita W3C baggage no Core compatível](VTEX-BAGGAGE.md). As contagens e a referência 0.2.5 abaixo preservam a evidência desta revisão UUID.

O candidato **0.2.5** usa os algoritmos oficiais de **`uuid@11.1.1`**, sem alteração, por meio de **`@boopay/uuid-compat@0.1.0`**. A camada do Boopay preserva as entradas antigas utilizadas pelo SDK. Instalação e homologação da ponte continuam pendentes.

## Origem e contrato

O [aviso GHSA-w5hq-g745-h8pq](https://github.com/advisories/GHSA-w5hq-g745-h8pq) descreve a validação insuficiente dos limites do buffer de saída e identifica 11.1.1 como uma versão corrigida. A [release oficial 11.1.1](https://github.com/uuidjs/uuid/releases/tag/v11.1.1) documenta essa correção. A árvore anterior continha UUID 3.4.0 no SDK/GraphQL tools, 8.3.2 no Jaeger e 11.1.1 no diagnóstico IO. No ensaio com 3.4.0, v3/v5 escreveram parcialmente em um buffer de oito bytes com offset quatro sem lançar erro.

Uma troca direta quebra `uuid/v4`, chamado por `@vtex/api/lib/service/worker/runtime/utils/context.js` ao criar um ID de operação ausente. O Jaeger usa `.v4()` na criação de seu identificador de processo. A camada preserva a raiz CommonJS chamável, exportações nomeadas modernas, importação ESM e subcaminhos `v1`, `v3`, `v4`, `v5`, inclusive suas grafias `.js`. A opção antiga `v4("binary")` continua retornando um array. Declarações TypeScript distintas atendem CommonJS e ESM.

O pacote próprio é instalado sob a chave `uuid`; sua única dependência, `uuid-modern: npm:uuid@11.1.1`, é o pacote oficial corrigido. `overrides` npm e `resolutions` Yarn conduzem todos os consumidores do SDK à mesma camada. A camada não implementa algoritmos UUID nem geração de bytes aleatórios. Caminhos privados antigos, a interface de linha de comando anterior e empacotamento de navegador ficam fora deste contrato Node.

## Fonte e pacote

Os 15 arquivos mantidos estão em `tools/vtex-catalog/node/vendor/uuid-compat`. A proveniência registra a versão, integridade e hashes de quatro arquivos do runtime oficial: implementação comum v3/v5, v6, v4 e fonte de aleatoriedade. A dependência conserva a licença MIT original; a camada é um pacote privado do Boopay, sem aprovação da VTEX ou dos mantenedores UUID.

`npm run vtex:catalog:pack-uuid` empacota somente esses 15 arquivos. O arquivo `vendor/boopay-uuid-compat-0.1.0.tgz` tem SHA-256 **`cdb3b69f6512fa1fbc1d074939b5d6f776f03ba1e0bc2568b730afd069b0b4bc`**. Ambos os lockfiles fixam a integridade da camada e do runtime oficial. O empacotador da ponte copia os arquivos por lista explícita e não depende de scripts de instalação.

## Provas e alcance

Três testes novos completam **18 testes distintos** da ponte:

1. Resolução compartilhada por SDK, diagnóstico IO, Jaeger e GraphQL tools; versão oficial e hashes do runtime; igualdade de todos os arquivos da camada instalada com os mantidos; entradas CommonJS/ESM e compilação estrita dos dois formatos com TypeScript 5.5.3.
2. Vetores válidos de v3/v5, escrita com offset sem tocar os bytes externos ao resultado, chamadas v4 legadas e recusa de buffers insuficientes ou offsets negativos em v3/v5/v6/v4 antes de qualquer escrita.
3. `prepareHandlerCtx` real cria um UUID v4 e preserva o ID fornecido. O `Tracer` real do Jaeger cria seu UUID/tag, registra um span em memória e fecha. GraphQL tools executa uma consulta válida. Nenhum coletor remoto é iniciado.

Os 18 testes passaram localmente em Node **24.18.0**, por npm e repetidos em pacote novo por Yarn **1.22.22** com lockfile congelado. O ensaio ponte → HTTP → Core confirmou resposta perdida com 202/200, SKU de 2.431 centavos, zero pedidos e pacote 0.2.5. O código `614d0edbcfe376a467f00fb3a84c7aa6ece213eb` passou nos **sete jobs** da [CI 34626470934](https://github.com/ThiagoVenturaV/boopay-platform/actions/runs/34626470934). Em **Node 20.20.2**, passaram **18 testes por npm e os mesmos 18 por Yarn**, incluindo as declarações CommonJS/ESM. O lockfile Yarn preservou o SHA-256 `aa1ac8d91854fbd6e63dff67d3963fb22d8edca9186467d935cc570079d9278e`. A recompilação do Prometheus foi preservada. Regressões: **390 cenários distintos de backend, 53 percursos do painel e quatro dos pixels**, Woo nativo com Stripe sintético e demos Linux/Windows. [Evidência oficial](https://github.com/ThiagoVenturaV/boopay-platform/blob/3ab824e3375d6d5d2956e0ca61aa90100f93a0d7/docs/evidence/vtex-uuid-ci-2026-09-11.json).

A auditoria npm reporta **29 pacotes afetados: 27 moderados e dois altos**. O Yarn reporta **12 avisos moderados e um alto**, incluindo o aviso UUID aplicado à chave de dependência `uuid`, versão **0.1.0** da camada própria. As duas instalações verificaram que essa entrada carrega `@boopay/uuid-compat` e delega ao pacote oficial 11.1.1. As contagens foram preservadas: não são equivalentes, não certificam a camada e as etapas de auditoria da CI toleram falha.

Os testes não demonstram execução de todos os ramos do diagnóstico, exportadores ou worker/proxy VTEX. A identidade do pacote foi mudada para descrever a camada própria; uma ausência de avisos por nome/versão não certifica essa camada. As provas de versão, integridade, código oficial e comportamento são complementares à auditoria.

Persistem a composição sustentada do SDK/runtime, achados de Core/W3C Baggage, SDK Node original na faixa do aviso Prometheus e homologação em workspace autorizado. O [backport HTTP Prometheus](VTEX-PROMETHEUS.md), o [Jaeger oficial corrigido](VTEX-JAEGER.md) e o [parser multipart local](VTEX-MULTIPART.md) permanecem. A meta integral do MVP continua aberta.
