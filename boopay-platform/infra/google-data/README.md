# Provisionamento Google Data — não executado em cloud

O runtime não cria projeto, dataset, tabela, conta de serviço ou regras. Use um projeto privado de teste autorizado. Defina localização/retenção com o operador e valide permissões antes de habilitar. Estes artefatos são revisáveis; não há deploy automático.

## Firestore

Base Firestore Native na localização aprovada. O runtime usa `(default)` ou a base explicitamente configurada. Navegadores acessam somente as APIs Boopay; regras devem negar acesso direto, como [firestore.rules](https://github.com/ThiagoVenturaV/boopay-platform/blob/3ab824e3375d6d5d2956e0ca61aa90100f93a0d7/tools/firestore/firestore.rules). A conta de serviço usa IAM independentemente dessas regras: valide permissões mínimas de leitura/criação/atualização na base. Não exponha credenciais de servidor ao frontend.

As consultas usam caminhos exatos, sem collection-group queries/índices compostos. Payload JSON armazenado como string com hash/versão. Exclusões gravam tombstones. Backups e retenção não são configurados pelo código.

## BigQuery

Crie a tabela antes de `insertAll`. [Esquema JSON](https://github.com/ThiagoVenturaV/boopay-platform/blob/3ab824e3375d6d5d2956e0ca61aa90100f93a0d7/infra/google-data/bigquery-schema.json). SQL equivalente com placeholders para substituição pelo operador:

```sql
CREATE TABLE `PROJECT_ID.DATASET_ID.boopay_records_v1` (
  schema_version STRING NOT NULL,
  tenant_id STRING NOT NULL,
  row_id STRING NOT NULL,
  record_type STRING NOT NULL,
  entity_id STRING NOT NULL,
  version INT64 NOT NULL,
  occurred_at TIMESTAMP NOT NULL,
  payload_hash STRING NOT NULL,
  payload_json STRING NOT NULL
)
PARTITION BY DATE(occurred_at)
CLUSTER BY tenant_id, record_type, entity_id;
```

Sem expiração automática: apagar só parte das versões/tombstones pode alterar consultas/recuperação. Defina e teste retenção física antes de dados reais. Consultas atuais podem varrer histórico; filtrar partições antes da maior versão pode ignorar estornos tardios. O limite de bytes por consulta não substitui quotas/alertas.

Não conceda acesso público. O workload precisa inserir e consultar o dataset autorizado e criar jobs no projeto de consulta. Separe provisionamento de runtime. Isolamento por tenant é aplicado pelo código/parâmetros SQL; RLS BigQuery ou dataset físico por tenant não foram implantados.

Consultas são geradas por [bigquery.ts](https://github.com/ThiagoVenturaV/boopay-platform/blob/3ab824e3375d6d5d2956e0ca61aa90100f93a0d7/src/data/bigquery.ts). Não some diretamente a tabela bruta: deduplique, selecione a maior versão e trate tombstones. O relatório mantém criação do pedido e estorno atual.

## Procedimento de validação pendente

1. Verificar privacidade, localização e permissões do workload sem expor credenciais.
2. Executar `reconcile` com loja demonstrativa e conferir fila/recibos.
3. Testar reenvio, atraso, erro por linha, falta de permissão e indisponibilidade.
4. Comparar BigQuery e API canônica: duas moedas, virada de dia em Fortaleza, pendência, estorno posterior e evidência.
5. Revogar perfil fictício; confirmar API, tombstone remoto, filas em trânsito e restauração. Documentar remoção física/retenção.
6. Só após validar, adotar o warehouse no dashboard; essa troca ainda não está implementada.

[Estado e operação](../../docs/DATA-PROJECTIONS.md). Estes passos são pendentes, não resultados obtidos.
