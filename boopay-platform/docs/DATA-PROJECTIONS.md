# Projeções Firestore e BigQuery

Implementação opt-in do MVP, documentada em 10/09/2026. PostgreSQL continua como fonte transacional em staging; SQLite atende à demonstração local. Clientes, fila e APIs estão implementados. Firestore foi exercitado por HTTP no emulador oficial; BigQuery usa respostas sintéticas nos testes. Nenhuma conta Google Cloud, credencial ADC real, tabela remota ou regra IAM foi ativada nesta etapa.

## Fluxo e garantias

`ProjectionStore` observa os serviços existentes. Na mesma transação da entidade canônica, coalesce alterações repetidas e grava `data_entity` e um marcador mínimo `data.entity.changed` na outbox. Rollback também desfaz marcador/versão. A versão permanece depois de apagar e recriar a entidade. A CI exercita serialização em dois pools PostgreSQL.

O marcador não contém snapshot privado e não entra na tabela de eventos comerciais. O worker lê o estado canônico atual ao entregar. Atualizações intermediárias podem ser condensadas; eventos comerciais existentes mantêm seus registros próprios. Backfill recupera o estado disponível, sem inventar versões históricas não coletadas.

Só tenants configurados são observados/enviados. Leases de 60 segundos, reenvios e checkpoints são independentes por destino. O runtime seleciona apenas os novos marcadores; outboxes legadas de eventos permanecem disponíveis ao worker genérico, sem serem falsamente marcadas como enviadas. Dez falhas normais levam a `dead`. Erros guardam códigos sanitizados. Falha de banco em um tenant não interrompe os demais. O processo evita ciclos sobrepostos e aguarda o trabalho ativo ao encerrar.

## Destinos e minimização

| Entidade | Firestore | BigQuery |
|---|---|---|
| Produto | Estado público, nome/SKU, moeda, preço e estoque | Ativo/plataforma |
| Checkout | Carrinho, estado, datas, valor/moeda, origem | Estado, criação/expiração e origem |
| Pedido | Estado, valores, itens sem identidade do comprador, origem | Estado financeiro, datas, valores em unidade mínima, moeda e origem |
| Perfil | Interesses, segmentos, carrinhos/compras consentidos, metadados/recomendações de IA permitidos | Não enviado |
| Conversa | Provedor, datas, quantidade/estado dos turnos; exige consentimento e conversa elegível | Não enviada |
| Evento | Não enviado | Tipo, data, origem e hash da correlação; nunca o objeto arbitrário `data` |

Não são projetados campos de identidade, endereço, mensagem, vetor, corpo privado de auditoria, segredo ou token. Isso é minimização de campos, não anonimização: os dados continuam vinculáveis à operação e precisam de governança.

Firestore usa `boopay_tenants/{hashTenant}/{kind}/{hashEntity}`. Payload JSON de até 128 KiB, hash e versão. A gravação substitui o documento inteiro com precondição `exists:false` ou `updateTime`. Conflitos exigem nova leitura. Resposta perdida é recuperada pela versão confirmada. Tombstone vazio de versão maior impede uma entrega antiga de restaurar conteúdo.

A API verifica autenticação, propriedade, versão e consentimento antes e depois da consulta remota. Estado ausente, atrasado, apagado ou vencido não é apresentado como atual. Perfis consentidos têm refresh a cada minuto, coordenado na base entre processos, e validade de leitura de dois minutos. Essa cadência gera trabalho proporcional aos perfis ativos e não constitui SLA de tempo real.

BigQuery recebe `row_id` estável por tenant/entidade/versão. `insertAll` só é aceito após HTTP 200 sem `insertErrors`. `insertId` oferece deduplicação de melhor esforço. As consultas eliminam duplicatas por `tenant_id,row_id`, selecionam a maior versão da entidade e só depois tratam tombstones, origem e período. Não há promessa de uma única inserção física. [Limites oficiais do streaming](https://docs.cloud.google.com/bigquery/docs/write-api-rest).

## Relatório financeiro

O endpoint BigQuery calcula valores diários e por moeda. Usa a criação do pedido em `America/Fortaleza` e seu estado de estorno atual. Pendências não geram receita paga. Um estorno revisa o período original; moedas não são somadas entre si. O filtro de data vem depois da versão atual, para preservar estornos posteriores à coorte.

Tenant, início, fim e evidência são parâmetros SQL. Projeto/dataset/tabela usam identificadores restritos. Cada consulta tem limite de bytes faturáveis (padrão 100 MB, máximo configurável 1 GB), timeout de 10 segundos e até 5.000 linhas agregadas. Resultado incompleto/paginado, inteiro fora da precisão segura ou totais inconsistentes produz erro. Não há polling de jobs pendentes; reduza o período e confira a operação antes de repetir consultas que possam gerar custo.

**O dashboard agora oferece consulta e escolha da fonte analítica.** A base operacional continua inicial; o BigQuery fornece os agregados de receita, funil, catálogo e eventos sob demanda, com comparação de versões, diferenças e indicação de possível atraso. Implementação e limites em [DATA-DASHBOARD.md](DATA-DASHBOARD.md). Execução real do SQL e paridade no projeto autorizado continuam pendentes. Testes de strings/contrato HTTP não validam o mecanismo SQL do BigQuery.

## Configuração

Padrão: `BOOPAY_DATA_ENABLED=false` e `BOOPAY_DATA_CONFIG={}`. Não há leitura de ADC ou tráfego cloud nessa condição. Habilitar exige ao menos um destino e lista de até 20 tenants. Exemplo de identificadores, **não ativado**:

```json
{
  "tenants": ["TENANT_ID"],
  "firestore": { "projectId": "your-project", "databaseId": "(default)" },
  "bigquery": {
    "projectId": "your-project", "datasetId": "boopay_private",
    "tableId": "boopay_records_v1", "location": "US",
    "maximumBytesBilled": 100000000
  },
  "intervalMs": 10000, "batchSize": 50
}
```

Defina o JSON em `BOOPAY_DATA_CONFIG`. `google-auth-library` usa ADC/identidade de workload somente quando o cliente configurado faz uma chamada. Chaves/tokens não pertencem ao JSON de projeções, Git ou navegador. [Artefatos de provisionamento](../infra/google-data/README.md).

Emulador: origem HTTP exata `127.0.0.1`, projeto `demo-`, ambiente local. Seu transporte recusa hosts cloud e usa o sentinela fixo `Bearer owner` do servidor do emulador, sem ADC. Cloud: HTTPS, hosts oficiais fixos, redirects recusados, timeout de transporte de 15 segundos e resposta de até 2 MB.

Após provisionar/configurar, execute `POST /v1/admin/data/reconcile` uma vez para registros existentes. Mudanças novas entram automaticamente. A ação grava horário, hash do operador e quantidade na mesma transação. Repetir cria versões de reparação; não execute em loop. Marcadores antigos `dead` permanecem como evidência, sem reescrever histórico.

## APIs

Autenticação existente, tenant da sessão e proteção de origem nas mutações. Nenhuma aceita tenant/URL/SQL arbitrário no corpo.

| Rota | Resultado |
|---|---|
| `GET /v1/admin/data/status` | Configuração, fila por destino, recibos sem payload pessoal |
| `POST /v1/admin/data/run` | Lote; `{}` ou `{"limit":50}` (1–500) |
| `POST /v1/admin/data/reconcile` | Repara entidades e tombstones retidos; `{}` |
| `POST /v1/admin/data/bigquery/inspect` | Contagens deduplicadas por entidade; `{}` |
| `POST /v1/admin/data/bigquery/financial-report` | Valores por dia/moeda; `{}` ou filtros `from`, `to`, `evidence` |
| `POST /v1/admin/data/bigquery/dashboard` | Agregados do painel e comparação canônica; mesmos filtros, consulta explícita e orçamento próprio |
| `GET /v1/{buyer,admin}/data/firestore/:kind/:id` | Estado recente autorizado e compatível com a versão canônica |

`kind`: `product`, `checkout`, `order`, `profile` ou `conversation`. Recurso de outro comprador/tenant: 404. Consentimento revogado: 403. Projeção atrasada/desativada: 503. Eventos não têm leitura Firestore.

Extensão de 11/09/2026: checkout inclui somente `navigationMode` na projeção. UUID efêmero e fingerprint do documento permanecem fora de Firestore/BigQuery. Mudanças usam os marcadores versionados existentes, sem adicionar eventos de venda. O painel `boopay-dashboard-v2` compara funil/receita por origem e cobertura de medição; campos antigos ausentes significam desconhecido. [Contrato e limites](REPORTING-ORIGINS.md).

`delivered` significa trabalho concluído no destino; tipos não aplicáveis geram recibo `not_applicable`. `receipts.accepted` conta pares entidade/destino confirmados, não vendas nem inserções físicas únicas. Configuração/recibo não significa homologação cloud. Pendências do destino desativado não são falha do destino ativo.

## Exclusão e recuperação

Revogar personalização apaga dados canônicos previstos na política e agenda tombstones. A API bloqueia leituras após a alteração canônica; a substituição remota é eventual. Não se promete remoção instantânea de uma solicitação em trânsito. Tombstones mais novos impedem restauração por entregas antigas após a reparação.

BigQuery retém metadados minimizados de versões anteriores na tabela bruta. Consultas atuais respeitam tombstones; remoção física, backups e retenção de pedidos exigem procedimento específico e validação no projeto real. Não remova tombstones antes de esvaziar filas/restaurar backups. **Desligar o runtime não apaga cópias externas.** Reconcilie exclusões e confira destinos antes de desativar uma integração já usada.

Listas em memória/documentos JSON atendem à loja demonstrativa. Paginação, compactação da outbox, quotas por tenant, alertas, índices adicionais e carga permanecem trabalho de escala. Não há exclusão física cloud automática nesta entrega.

## Evidências reproduzíveis

Commit `ac8a5ef918f2f947ff21a46ce8bb756a5d41fb5d`: [CI 34454583029](https://github.com/ThiagoVenturaV/boopay-platform/actions/runs/34454583029) aprovada nos seis jobs. PostgreSQL aprovou 164 testes; os três testes reservados ao emulador foram aprovados no job Firestore. Cobertura combinada: 167 cenários de backend, além de 29 cenários de navegador e WooCommerce nativo. Esses números não transformam o transporte BigQuery sintético em validação cloud.

```powershell
npm ci
npm run check
node tools/firestore/run.mjs
```

O último comando exige Java 21+, baixa o JAR oficial Firestore 1.22.0, verifica tamanho/SHA-256, abre porta efêmera em loopback e encerra os processos criados pelo ensaio. Não usa a CLI Firebase, credenciais ou projeto real. [Manifesto oficial no Firebase Tools 15.30.0](https://raw.githubusercontent.com/firebase/firebase-tools/v15.30.0/src/emulator/downloadableEmulatorInfo.json). Cache/logs ignorados em `tools/firestore/.cache`.

Três ensaios reais de emulador cobrem concorrência/precondição, resposta perdida e compra/estorno simulados no Core com revogação e regras de cliente negadas. Nove testes locais adicionais cobrem atomicidade, minimização, autorização, refresh, recuperação e contratos BigQuery; um teste adicional usa dois pools PostgreSQL na CI. O emulador difere em índices, limites e transações do serviço real. [Limitações oficiais](https://firebase.google.com/docs/emulator-suite/connect_firestore).

Referências: [commit Firestore](https://docs.cloud.google.com/firestore/docs/reference/rest/v1/projects.databases.documents/commit), [precondições](https://docs.cloud.google.com/firestore/docs/reference/rest/v1/Precondition), [erros canônicos](https://docs.cloud.google.com/firestore/native/docs/use-rest-api), [insertAll](https://docs.cloud.google.com/bigquery/docs/reference/rest/v2/tabledata/insertAll), [jobs.query](https://docs.cloud.google.com/bigquery/docs/reference/rest/v2/jobs/query), [Google Auth Library](https://github.com/googleapis/google-auth-library-nodejs).
