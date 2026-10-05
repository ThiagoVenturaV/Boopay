# Correção HTTP do exportador Prometheus da ponte VTEX

**Atualização posterior:** a ponte [0.2.5 corrige o runtime UUID mantendo as entradas legadas](VTEX-UUID.md). As contagens e a referência 0.2.4 abaixo preservam a evidência desta revisão Prometheus.

O candidato **0.2.4** inclui o pacote mantido localmente **`@opentelemetry/exporter-prometheus@0.57.2-boopay.1`**. A alteração retorna HTTP 400 para uma URL que o parser não consegue interpretar, mantendo a coleta e a serialização de métricas do SDK atual. A instalação em loja continua pendente.

## Origem e decisão

O [aviso do mantenedor GHSA-q7rr-3cgh-j5r3](https://github.com/open-telemetry/opentelemetry-js/security/advisories/GHSA-q7rr-3cgh-j5r3) descreve a exceção não tratada no servidor HTTP do exportador e informa correção na família 0.217.0 ou posterior. O alcance depende de o servidor Prometheus estar ativo e acessível; a presença do pacote não demonstra exposição da loja.

A versão oficial **0.222.0**, consultada no registro nesta revisão, depende de métricas/Core/resources **2.11.0**. Sua instalação foi avaliada separadamente com o `MeterProvider@1.30.1` retido pelo SDK: a criação de contador falhou com `aggregation.createAggregator is not a function`. O [guia de migração 2.x](https://github.com/open-telemetry/opentelemetry-js/blob/main/doc/upgrade-to-2.x.md) descreve mudanças de API; a troca isolada do exportador não é uma migração completa da telemetria.

A correção local preserva `@vtex/api@7.5.0`, diagnóstico IO **0.1.8-io**, SDK Node **0.57.2** e métricas/Core/resources **1.30.1**. Não remove o exportador nem desativa a telemetria. O tratamento da URL segue a correção observada na versão oficial; a manutenção deste backport é do Boopay, sem homologação pela VTEX ou pelo OpenTelemetry.

## Fonte e pacote reproduzível

Os cinco fontes TypeScript foram extraídos dos mapas de código publicados no pacote npm original **0.57.2**, com hashes e integridade de origem registrados em `tools/vtex-catalog/node/vendor/exporter-prometheus/BOOPAY-PROVENANCE.json`. A licença Apache-2.0 e o README original foram preservados.

Somente dois fontes mudaram: `PrometheusExporter.ts` trata a falha de URL; `version.ts` identifica a versão local. Os demais mantêm o hash original. O compilador fixado **TypeScript 5.5.3** produz JavaScript, declarações e mapas com os fontes atualizados. A CI recompila e compara esses arquivos com o commit antes dos testes.

`npm run vtex:catalog:pack-prometheus` verifica os hashes dos fontes, compila e empacota somente os 25 arquivos permitidos. O arquivo `vendor/opentelemetry-exporter-prometheus-0.57.2-boopay.1.tgz` tem SHA-256 **`e2c522b27f4154b853561cda2a729f8d6eaba0a630e5ee8ab707c2ace38e1b0f`**; a repetição local produziu o mesmo hash.

A dependência direta local e `overrides` npm referem-se ao mesmo pacote; o Yarn usa a resolução local equivalente, com integridade fixada nos dois lockfiles. O empacotador da ponte copia arquivo, fontes, compilados, licença e proveniência por uma lista explícita. Não depende de scripts de instalação.

## Provas

Três testes novos completam **15 testes distintos** da ponte:

1. Resolução SDK → diagnóstico IO → SDK Node → pacote local; igualdade dos 25 arquivos instalados com os mantidos, hashes dos fontes e compartilhamento das bibliotecas de métricas 1.30.1.
2. `MeterProvider` original, servidor HTTP real em loopback e três requisições TCP com URLs malformadas. Todas recebem 400; caminho inexistente recebe 404 e a consulta posterior de métricas recebe 200.
3. Mesmo ensaio por `NodeSDK`, selecionando a fábrica nativa com `OTEL_METRICS_EXPORTER=prometheus`. O processo de teste apenas escolhe porta efêmera; não substitui a criação do exportador, agregações ou coleta.

Nos dois modos, as consultas antes/depois verificam o contador acumulado **2 → 5**, histograma com **duas observações e soma 7**, gauge observável **7** e contador que aumenta/diminui com saldo **3**. O caso válido com query string é preservado. A mesma prova, na árvore original, terminou com `ERR_INVALID_URL` e código 1 ao chegar à requisição malformada.

Os 15 testes passaram localmente em Node **24.18.0**, por npm e repetidos em pacote novo por Yarn **1.22.22**, com lockfile congelado. O ensaio ponte → Core confirmou resposta perdida com 202/200, SKU de 2.431 centavos, zero pedidos e pacote 0.2.4.

O código `4f6a098820a00d973ac56bf4e0e3cde50ea7f695` passou nos **sete jobs** da [CI 34623262563](https://github.com/ThiagoVenturaV/boopay-platform/actions/runs/34623262563). Em **Node 20.20.2**, a recompilação reproduziu os arquivos versionados e os **15 testes por npm e os mesmos 15 por Yarn** passaram. O lockfile Yarn preservou o SHA-256 `a6ebbf46e37e9f29d0d4572b0e06dc5d76cf14b6dee3d2fa1ed31fd17ac0bdcb`. Regressões: **390 cenários distintos de backend, 53 percursos do painel e quatro dos pixels**, Woo nativo com Stripe sintético e demos Linux/Windows. [Evidência oficial](https://github.com/ThiagoVenturaV/boopay-platform/blob/3ab824e3375d6d5d2956e0ca61aa90100f93a0d7/docs/evidence/vtex-prometheus-ci-2026-09-11.json).

As auditorias do candidato ainda reportam **32 pacotes afetados no npm: 30 moderados e dois altos**; no Yarn, **12 avisos moderados e um alto**. SDK Node e diagnóstico IO permanecem entre os altos do npm. As contagens são diferentes e não certificam código mantido localmente. As etapas de auditoria toleram falha, portanto os sete jobs verdes não liberam instalação.

## Limites

O teste habilita Prometheus apenas nos processos isolados; a configuração de telemetria da aplicação não mudou. Não usa loja, scraper ou coletor remoto. As provas cobrem os comportamentos descritos e não todos os instrumentos, exportadores, opções ou a execução no worker/proxy da VTEX.

A auditoria por nome/versão não certifica o backport. O SDK Node original também pertence à faixa do aviso, e sua substituição exige tratar a composição completa. Continuam pendentes os achados de Core/W3C Baggage e UUID, a manutenção do runtime gerenciado e a homologação da ponte em workspace autorizado. A meta integral do MVP permanece aberta.
