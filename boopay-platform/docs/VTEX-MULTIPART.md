# Correção local do parser multipart da ponte VTEX

O candidato **0.2.2** usa uma cópia mantida pelo Boopay de `dicer@0.3.0`, identificada como **0.3.0-boopay.1**. A alteração impede os erros reproduzidos no parser sem substituir o SDK VTEX, GraphQL Upload, Busboy ou a telemetria. **A instalação da ponte continua pendente.**

## Origem e alteração

O [aviso GHSA-wm7h-9275-46v2](https://github.com/advisories/GHSA-wm7h-9275-46v2) descreve uma falha de disponibilidade em dicer e não informa versão publicada corrigida. A [proposta b7fca2e](https://github.com/mscdex/dicer/commit/b7fca2e93e8e9d4439d8acc5c02f5e54a0112dac) foi examinada; a [PR 22](https://github.com/mscdex/dicer/pull/22) permanecia aberta e não integrada na consulta de 11/09/2026.

A reprodução isolada, com as bibliotecas instaladas, confirmou erro para continuação de cabeçalho sem campo anterior. A proposta consultada evitou esse caso, mas ainda falhou com nomes herdados do protótipo de objetos. Essa observação orientou a correção própria; não é uma homologação da proposta por seu mantenedor.

Somente `lib/HeaderParser.js` recebeu alterações de código:

- Uma linha de continuação sem campo anterior é ignorada, preservando a interpretação das continuações válidas.
- Os dicionários de cabeçalhos usam protótipo nulo na construção, no reset e após a emissão. Nomes como `constructor` passam a ser campos comuns, sem acessar propriedades herdadas.

`Dicer.js`, `PartStream.js`, a licença MIT e a suíte original foram preservados. A proveniência e os hashes do parser original/corrigido estão em `tools/vtex-catalog/node/vendor/dicer/BOOPAY-PROVENANCE.json`. Trata-se de uma manutenção local assumida pelo projeto, não de uma nova versão oficial nem de aprovação da VTEX.

## Distribuição reproduzível

O arquivo `vendor/dicer-0.3.0-boopay.1.tgz` contém somente sete arquivos: os três fontes, manifesto, licença, README original e proveniência. Seu SHA-256 é `699fd98ca5cb7812f36436d06aad1b0db5b2f86d2f6c9eabbecc46adfc30d354`.

A dependência direta local e a referência npm `overrides.dicer = "$dicer"` conduzem o Busboy ao mesmo pacote. O Yarn usa a resolução local equivalente. Ambos os lockfiles registram a integridade SHA-512 do arquivo. As demais versões fixadas foram preservadas; o lockfile Yarn foi limitado à substituição da entrada de dicer. A tentativa inicial com diretório vinculado não instalou corretamente a dependência `streamsearch`; foi substituída pelo arquivo empacotado antes da entrega.

`npm run vtex:catalog:pack-parser` reproduz o pacote a partir dos fontes e confere seu conteúdo permitido. Depois de uma futura alteração, atualizar proveniência, arquivo e ambos os lockfiles e repetir as provas. O empacotador da ponte copia explicitamente o arquivo local, os fontes, a licença e a proveniência; não inclui `node_modules`, configurações de loja ou segredos.

## Provas e limites

Três testes próprios foram acrescentados aos seis existentes:

1. Resolução pelo caminho SDK → GraphQL Upload → Busboy → dicer; igualdade dos arquivos instalados com os fontes mantidos; entradas malformadas, nomes de protótipo e continuação válida, inteiras e byte a byte, incluindo reset/reuso.
2. Suíte original de dicer, com seus casos de cabeçalho, multipart, limites, término e dados de teste originais. As quebras de linha desses dados são preservadas pelo Git.
3. Processo isolado com Koa e o middleware de upload oficial do SDK, por HTTP loopback: dois corpos malformados retornam 400, dois corpos com nomes de protótipo são processados, um arquivo válido é lido e a consulta de saúde posterior retorna 200.

Os nove testes passaram localmente em Node **24.18.0** e foram repetidos em pacote gerado novo, instalado por **Yarn 1.22.22**, com lockfile congelado. A [CI 34617946892](https://github.com/ThiagoVenturaV/boopay-platform/actions/runs/34617946892), do código `a87d0d34773e1e9bcb6ceafa38dc8f473976d429`, aprovou os mesmos nove testes por npm e Yarn em **Node 20.20.2**. São nove casos distintos, executados por dois gerenciadores. O ensaio ponte → Core confirmou 202/200 após resposta perdida, SKU de 2.431 centavos, zero pedidos e pacote 0.2.2.

Na conferência dos hashes, a primeira CI revelou que `npm ci` reescreve também `yarn.lock` a partir da árvore npm. A prova Yarn dessa execução preservou o arquivo reescrito (SHA-256 `8d560ceb75dd57b70f49583acdb35dd4cc430d1baab3a66b1dcfec10c1b31631`), não o arquivo versionado (`e49cafd2f007d9f155922d5d76efddf3e3e32329d5c1dd0e7d6f6c859c3d9397`). A reescrita foi reproduzida em pacote isolado: reorganiza seletores e origens a partir da árvore npm. O teste local com o arquivo versionado passou separadamente. A revisão `29b4880a0b7e8759ae497a986c56199e8ffb3222` restaura explicitamente o arquivo do próprio commit antes da instalação Yarn independente.

A [CI final 34619174898](https://github.com/ThiagoVenturaV/boopay-platform/actions/runs/34619174898) aprovou os **sete jobs**, incluindo os nove testes por npm e os mesmos nove por Yarn em Node **20.20.2**. A prova Yarn confirmou o hash versionado `e49cafd2…`, sem alteração durante a instalação congelada. As regressões aprovaram **390 cenários distintos de backend, 53 percursos do painel e quatro dos pixels**, além do ensaio Woo nativo com Stripe sintético. [Evidência consolidada](https://github.com/ThiagoVenturaV/boopay-platform/blob/3ab824e3375d6d5d2956e0ca61aa90100f93a0d7/docs/evidence/vtex-multipart-ci-2026-09-11.json).

As auditorias da CI final reportaram **33 pacotes afetados no npm (28 moderados e cinco altos)** e **11 avisos moderados e quatro altos no Yarn**. As contagens usam critérios diferentes. Dicer não aparece nesses resultados, pois o pacote tem versão local; isso não substitui a prova do comportamento corrigido. As etapas de auditoria do candidato usam `continue-on-error`, portanto o resultado verde da CI não significa ausência de achados.

A auditoria por nome/versão não certifica código mantido localmente: resultados npm/Yarn para o pacote local devem ser interpretados separadamente da prova comportamental e da revisão do patch. A ausência ou redução de avisos automáticos não equivale à eliminação de todas as vulnerabilidades. Os achados de OpenTelemetry e UUID, a manutenção do runtime gerenciado e a homologação da ponte continuam pendentes. O worker/proxy remoto e a entrega real de eventos não foram exercitados. A meta integral do MVP permanece aberta.
