# Painel analítico e conciliação

Implementação de 11/09/2026. O painel de receita pode consultar o BigQuery e usar seus indicadores, preservando a composição B aprovada. A implementação e os ensaios locais não comprovam ingestão nem execução do SQL em um projeto Google Cloud real.

## Fluxo

1. A abertura usa a base operacional. Verificar disponibilidade não dispara uma consulta no BigQuery.
2. Com o destino configurado, **Consultar e comparar** envia os mesmos filtros de período, evidência, canal, superfície e protocolo do painel. O tenant vem da sessão administrativa.
3. A API captura métricas e versões canônicas em uma transação, consulta o warehouse fora dela e verifica novamente a origem. O instante de captura também determina a expiração dos checkouts no SQL.
4. O seletor permite usar os indicadores analíticos retornados. Valores divergentes têm aviso e diferenças consultáveis. A troca de qualquer filtro ou atualização invalida o resultado exibido e exige nova consulta explícita; não há substituição silenciosa da fonte.
5. Pedidos recentes, CSVs de pedidos/sessões e trilha de descoberta continuam operacionais e são identificados como tal. O relatório analítico contém agregados, sem dados pessoais dos pedidos.

## Contrato

`POST /v1/admin/data/bigquery/dashboard`, JSON estrito com `from`, `to`, `evidence`, `channel`, `surface` e `protocol` opcionais. Datas ISO, intervalo inclusivo, evidência `simulated` ou `observed`. Sem SQL, URL ou tenant arbitrário. Autenticação, origem e `Cache-Control: no-store` seguem o restante do painel. A resposta e o cache usam `contract: boopay-dashboard-v2`.

Resposta: `generatedAt`, `filter`, `canonical`, `warehouse`, `reconciliation`, `cacheHit`, `totalBytesProcessed`, origem `bigquery`, consistência `eventual`, unidade monetária `minor` e fuso `America/Fortaleza`.

Escopo comparado:

- Catálogo atual: produtos e produtos ativos, independente do período/evidência.
- Coorte de criação dos checkouts: sessões, concluídas, abandonadas, abertas e taxas. Submissão e conciliação pendente não viram abandono apenas pelo relógio.
- Funil por canal/superfície/protocolo/estado, receita atribuída por origem/moeda e medição explícita da continuidade da compra. Totais sem medição permanecem desconhecidos. [Definições e exportações](REPORTING-ORIGINS.md).
- Coorte de criação dos pedidos: contagens, pendências, estornos e evidência. Pedidos pendentes não representam receita paga.
- Receita por moeda: aprovado, estornado, após estornos, mercadorias, frete, impostos, taxas e contagens financeiras; série diária revisada pelo estado atual do pedido. Moedas não são somadas entre si.
- Eventos por tipo, filtrados pelo instante do evento e evidência. Não se transfere `event.data` arbitrário ao warehouse.

O SQL seleciona a maior versão e deduplica antes de filtrar tombstones, estados ou período. Um estorno posterior revisa o dia de criação da compra. Não aplica filtro temporal às versões brutas, o que poderia restaurar uma versão antiga. A consulta e o esquema de projeção estão em `src/data/dashboard-sql.ts` e `src/data/projector.ts`.

## Estados da conciliação

| Estado | Interpretação |
|---|---|
| `matched` | Mesmas versões e todos os agregados comparados iguais no instante capturado |
| `projection_pending` | Conjunto de versões diferente; pode ser atraso, destino incorreto ou projeção divergente |
| `source_changed` | A origem mudou enquanto a consulta estava em andamento; comparação inconclusiva |
| `source_untracked` | Existem registros canônicos sem marcadores; preparar a reconciliação das projeções |
| `divergent` | Mesmas versões, mas métricas diferentes; investigar SQL, conteúdo e contrato |

O manifesto usa SHA-256 das linhas `tipo:identificador_cloud:versão`, ordenadas e separadas por LF, inclusive tombstones. Não expõe identificadores de compradores. A comparação abrange todas as entidades analíticas da loja, mesmo quando o relatório filtra um período. Pode sinalizar uma pendência fora desse recorte: essa escolha conservadora evita certificar uma projeção parcialmente sincronizada.

`matched` atesta **versões e métricas deste contrato**, não igualdade byte a byte de todo o payload, integridade de histórico, ausência de alterações futuras, desempenho cloud ou validação comercial. As diferenças indicam caminhos completos e valores dos dois lados; uma dimensão ausente não é convertida silenciosamente em zero.

## Limites e erros

- Consulta explícita; uma consulta concorrente por tenant sob lease persistido de 60 segundos, compartilhado entre processos. Rede fora da transação.
- Até 20 tentativas por loja e dia UTC; falhas e respostas ambíguas consomem tentativa. Limite específico deste endpoint; não substitui quotas de projeto nem se aplica às APIs anteriores de diagnóstico/relatório financeiro.
- Um resultado em cache por loja, por até 60 segundos, vinculado a filtros, métricas e manifesto canônicos. Mudanças e expiração de checkout invalidam a reutilização. Resultado com origem alterada durante a consulta não entra em cache.
- `maximumBytesBilled` configurado no cliente (padrão 100 MB), parâmetros nomeados, localização explícita. Requisição com `timeoutMs` e `jobTimeoutMs` de 10 segundos, transporte com limite de 15 segundos. O timeout de job é uma tentativa de cancelamento do serviço, não garantia de interrupção imediata. Não há polling automático ou reenvio de consulta ambígua.
- Job incompleto, erro, paginação inesperada ou envelope diferente de uma linha são recusados. JSON inválido, dimensões duplicadas, inteiros inseguros e inconsistências entre série diária e agregado são recusados. Resposta limitada pelo transporte e parser; catálogos/históricos grandes exigem trabalho de escala.
- O cache armazena agregados administrativos na base privada, sem cópia de pedidos recentes ou perfil pessoal.

## Evidência e pendências

Contrato v2 no commit `5fa4f1abdbbfe1bf37fae1c52ded6a6426a7abe6`, [CI 34560251917](https://github.com/ThiagoVenturaV/boopay-platform/actions/runs/34560251917): seis jobs aprovados, 290 cenários distintos de backend (287 PostgreSQL e três Firestore), 49 percursos de navegador e Woo nativo. Inclui os filtros, somas por origem, cobertura desconhecida, concorrência da medição e seleção de moeda após mudar o recorte. [Evidência oficial](https://github.com/ThiagoVenturaV/boopay-platform/blob/3ab824e3375d6d5d2956e0ca61aa90100f93a0d7/docs/evidence/origin-ci-2026-09-11.json). As respostas BigQuery permanecem sintéticas; o resultado não certifica execução GoogleSQL cloud.

Commit `fc034e9555507834a7060561559a8a233a64327c`, [CI 34557639728](https://github.com/ThiagoVenturaV/boopay-platform/actions/runs/34557639728): seis jobs aprovados, 283 cenários distintos de backend (280 PostgreSQL e três Firestore) e 47 percursos de navegador. Inclui o novo teste de orçamento/lease com dois pools PostgreSQL. [Resultado oficial](https://github.com/ThiagoVenturaV/boopay-platform/blob/3ab824e3375d6d5d2956e0ca61aa90100f93a0d7/docs/evidence/warehouse-ci-2026-09-11.json), [validação local e limites](https://github.com/ThiagoVenturaV/boopay-platform/blob/3ab824e3375d6d5d2956e0ca61aa90100f93a0d7/docs/evidence/warehouse-local-2026-09-11.json). Esses resultados mantêm a distinção entre contrato sintético BigQuery e execução SQL no serviço.

Testes `test/data-dashboard.test.ts` exercitam métricas esperadas independentemente, receita multimoeda, estorno na coorte original, tombstones no manifesto, atraso, origem alterada, registros legados, divergência, validação de resposta, autenticação e orçamento/lease compartilhado. Um teste requer PostgreSQL e dois pools independentes. As respostas BigQuery desses testes são **sintéticas**; assertions sobre SQL não são execução do mecanismo GoogleSQL.

Ainda é necessário executar o SQL no projeto autorizado, comparar os agregados da demonstração completa, verificar ingestão/reentrega/atraso no serviço e registrar resultados reais. Retenção física, backups, paginação e operação de escala continuam nos limites de [DATA-PROJECTIONS.md](DATA-PROJECTIONS.md). Canal, superfície, protocolo e continuidade instrumentada foram acrescentados no contrato v2; seus limites estão em [REPORTING-ORIGINS.md](REPORTING-ORIGINS.md).

Referências primárias consultadas: [jobs.query](https://docs.cloud.google.com/bigquery/docs/reference/rest/v2/jobs/query), [serialização JSON de inteiros](https://docs.cloud.google.com/bigquery/docs/reference/standard-sql/json_functions#json_encodings), [agregações ordenadas](https://docs.cloud.google.com/bigquery/docs/reference/standard-sql/aggregate_functions#string_agg). Inteiros fora da representação segura do JavaScript são recusados, inclusive quando a serialização os transforma em strings.
