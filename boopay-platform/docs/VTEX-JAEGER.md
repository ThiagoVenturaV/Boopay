# Propagação Jaeger corrigida na ponte VTEX

O candidato **0.2.3** fixa a versão oficial **`@opentelemetry/propagator-jaeger@2.9.0`**, em npm e Yarn. A mudança trata o erro de decodificação de cabeçalhos sem substituir o SDK VTEX ou o provedor de telemetria da variante IO. A instalação em loja continua pendente.

## Decisão e compatibilidade

O [aviso do mantenedor GHSA-45rx-2jwx-cxfr](https://github.com/advisories/GHSA-45rx-2jwx-cxfr) identifica exceções em cabeçalhos Jaeger malformados e informa a correção em 2.9.0. O problema depende de Jaeger estar ativo; não significa que toda configuração OpenTelemetry encerre o processo. O código de propagação da variante `@vtex/diagnostics-nodejs@0.1.8-io` usa W3C por padrão, mas seu `NodeTracerProvider` inclui a fábrica Jaeger.

A árvore agora mantém:

| Componente | Versão e alcance |
|---|---|
| SDK VTEX | `7.5.0`, sem alteração |
| Diagnóstico IO | `0.1.8-io`, sem alteração |
| NodeTracerProvider / SDK Node | `1.30.1` / `0.57.2`, sem alteração |
| Core consumido pelo diagnóstico | `1.30.1`, ainda com achado próprio |
| Jaeger | `2.9.0`, versão oficial corrigida |
| Core privado do Jaeger | `2.9.0`, dependência da versão corrigida |
| API de contexto compartilhada | `1.9.1`, preservada |

O manifesto oficial de Jaeger 2.9.0 declara a mesma faixa da API de contexto (`>=1.0.0 <1.10.0`) e aceita Node `^18.19.0 || >=20.6.0`. A substituição ultrapassa a versão exata escolhida pelo SDK de origem; é uma decisão de compatibilidade do Boopay, não uma homologação pela VTEX. A cópia de Core 2.9.0 atende somente Jaeger: não migra a pilha antiga nem resolve os achados de W3C Baggage e Prometheus.

Os lockfiles alteram apenas a versão do candidato, a entrada de Jaeger e a dependência Core adicional. As correções anteriores de cookie, systeminformation e do parser multipart local permanecem. A CI restaura o `yarn.lock` do próprio commit antes da instalação independente, porque npm também reescreve esse arquivo.

## Provas

Três testes foram acrescentados à suíte da ponte:

1. Resolução a partir do SDK → diagnóstico IO → provedor nativo → Jaeger corrigido. Confere as versões preservadas, a cópia de Core usada por Jaeger e a mesma API de contexto.
2. Cabeçalhos com escapes inválidos, preservação de contexto/baggage válidos e preexistentes, arrays de cabeçalho, nomes personalizados e supressão de tracing criada pelo Core 1.x e reconhecida pelo propagador novo.
3. Processo isolado com o `NodeTracerProvider` e `HttpInstrumentation` originais. `OTEL_PROPAGATORS=jaeger` seleciona a fábrica nativa. Quatro requisições malformadas, uma válida e uma consulta posterior retornam 200; os seis spans de servidor são exportados em memória, com trace ID e parent span remotos preservados no caso válido.

A mesma prova HTTP foi executada separadamente com Jaeger **1.30.1**: o processo terminou com `URIError` e código 1. Com **2.9.0**, concluiu as seis requisições. Não houve acesso a loja, coletor de telemetria ou serviço remoto nesse ensaio.

Os **12 testes distintos** passaram localmente em Node **24.18.0**, por npm e repetidos em pacote gerado novo por Yarn **1.22.22**, com lockfile congelado. O ensaio da ponte para o Core confirmou resposta perdida com 202/200, preço de 2.431 centavos, zero pedidos e pacote 0.2.3.

O código `91d542a875906d8d0ebd9b850ede9e72d3ba9751` passou nos **sete jobs** da [CI 34620945570](https://github.com/ThiagoVenturaV/boopay-platform/actions/runs/34620945570). Os 12 testes por npm e os mesmos 12 por Yarn passaram em **Node 20.20.2**. A instalação Yarn preservou o SHA-256 versionado `2d2d31f3440e1850739119859419b19dbd6872a3f2d0d073a85064bfd51cd23e`. Regressões: **390 cenários distintos de backend, 53 percursos do painel e quatro dos pixels**, Woo nativo com Stripe sintético e demos Linux/Windows. [Evidência oficial](https://github.com/ThiagoVenturaV/boopay-platform/blob/3ab824e3375d6d5d2956e0ca61aa90100f93a0d7/docs/evidence/vtex-jaeger-ci-2026-09-11.json).

Jaeger não aparece nas duas auditorias dessa CI. O npm ainda reporta **32 pacotes afetados: 29 moderados e três altos**; o Yarn reporta **11 avisos moderados e dois altos**. Os critérios e as contagens são diferentes. As etapas de auditoria do candidato toleram falha, portanto a CI verde não autoriza instalação nem comprova segurança integral.

## Limites

O teste ativa Jaeger somente no processo isolado; não altera a configuração de telemetria da aplicação. Preserva exportadores e instrumentações do fornecedor. Os testes provam os comportamentos descritos, não todos os usos possíveis de OpenTelemetry nem o worker/proxy remoto da VTEX.

Continuam pendentes os achados de Prometheus, Core/W3C Baggage e UUID, a manutenção do runtime gerenciado, a instalação em workspace autorizado e a homologação de catálogo/eventos. O parser multipart é mantido localmente e sua ausência na auditoria de versões não certifica o patch. A meta integral do MVP permanece aberta.
