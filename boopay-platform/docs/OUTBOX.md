# Entrega de eventos

Cada alteração transacional grava o evento e sua outbox na mesma transação. `OutboxWorker` envia esses registros fora da transação, com controle independente por destino (`firestore`, `bigquery`). Destinos sem um cliente configurado permanecem pendentes.

O worker usa uma lease durável por evento e destino. Outro processo não pode reivindicar a mesma entrega antes da expiração. Se o primeiro processo morrer ou perder a conexão, a lease expira e a entrega pode ser retomada. Confirmações de um dono antigo não sobrescrevem o estado de uma lease já assumida por outro worker.

A garantia é **ao menos uma entrega**. Uma falha após o destino aceitar o evento, mas antes da confirmação local, pode provocar repetição. Cada cliente de destino deve usar `event.id` como chave idempotente ou oferecer uma projeção que elimine duplicatas antes de calcular métricas. O worker sozinho não garante exatamente uma inserção em serviços externos.

Falhas normais usam espera exponencial de um segundo a uma hora. Após dez tentativas, por padrão, o destino passa a `dead` para intervenção operacional. O worker persiste apenas um código de erro limitado, nunca a mensagem completa do provedor. Um destino entregue não é repetido porque o outro falhou.

Testes verificam destinos independentes, isolamento por tenant, duas instâncias concorrentes, recuperação de lease, resposta tardia, falha do banco após sucesso remoto e limite de tentativas. Os sinks desses testes são projeções controladas em memória; não representam acesso validado a Firestore ou BigQuery.

Os [clientes Firestore/BigQuery](DATA-PROJECTIONS.md) agora usam esse worker com filtro para marcadores `data.entity.changed`. `ProjectionStore` grava esses marcadores na transação canônica, inclusive em exclusões; os eventos comerciais não são contados novamente. A reconciliação gera versões, preserva tombstones e registra o operador na transação. A configuração permanece desativada por padrão.

Rotas administrativas expõem fila, execução de lote, reparação e recibos. Tipos não aplicáveis ao destino geram recibo explícito, não alegação de escrita remota. Firestore foi validado no emulador oficial; BigQuery tem contratos sintéticos. Painel da fila, compactação/retenção e validação cloud permanecem pendentes.
