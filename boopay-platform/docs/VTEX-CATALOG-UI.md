# Acompanhamento da fila de catálogo VTEX

Implementação de 11/09/2026. Configurações → VTEX → **Atualização do catálogo** mostra o estado dos SKUs notificados, o orçamento diário e a próxima tentativa elegível. A composição B de Receita e o sistema visual existente permanecem como referência. Não há instalação ou ativação de uma loja por esta interface.

## Operação

**Consultar fila novamente** executa somente `GET /v1/admin/vtex/catalog-updates/status`, autenticado para o tenant atual. Não consome a cota de releituras, não dispara Search ou carrinho nativo e não ignora orçamento, lease ou revogação. As ações manuais da conexão continuam separadas. Uma falha ao consultar a fila não impede usar os demais controles autorizados.

| Situação | Comportamento |
|---|---|
| Carregando | Contadores anteriores saem de exibição; a seção sinaliza processamento e bloqueia outra consulta sem remover o foco do botão |
| Não configurada | Informa ausência da atualização automática nessa conexão |
| Publicação necessária | Orienta consultar e publicar manualmente o catálogo com a configuração atual |
| Sem notificações | Informa que nenhum SKU está sendo acompanhado |
| Espera ou execução | Distingue SKUs aguardando de consultas com lease vigente |
| Falha na loja | Explica ausência no índice, preferências incompatíveis ou consulta não confirmada, mantendo a próxima tentativa elegível |
| Sem pendências | Informa apenas a ausência de trabalho pendente nessa fila; não certifica catálogo completo ou estoque |
| Cota esgotada | Mostra orçamento usado e data de reinício; não oferece envio forçado |
| Estado indisponível | Declara que o estado atual é desconhecido, oculta contadores e oferece nova consulta |
| Revogada | Preserva o histórico local, declara interrupção e remove a estimativa de nova tentativa, inclusive após recarga |

Datas são formatadas no horário de Fortaleza. As cotas são calculadas pelo dia UTC, com reinício às 21h de Fortaleza. O número mostrado é o consumo do dia atual; um registro do dia anterior não aparece como consumo de hoje. `Próxima tentativa elegível` é o primeiro instante permitido pelo agendamento, lease e orçamento, não promessa de execução naquele instante. Na conexão revogada ou sem autorização não é apresentada uma estimativa.

## API e apresentação

O status acrescenta `tracked`, `waiting`, `failed`, `nextCheckAt`, `observedAt` e `dayResetsAt`. O campo anterior `queued` continua contando toda pendência, incluindo as em execução; `waiting` exclui leases vigentes e `running` conta estes últimos. Consultar o status não escreve um novo registro de cota. O contrato completo do worker, seus limites e os efeitos remotos estão em [VTEX-CATALOG-UPDATES.md](VTEX-CATALOG-UPDATES.md).

`VtexIntegrations` consulta a fila independentemente do status da inspeção/checkout. Respostas antigas são canceladas quando muda a consulta; durante nova leitura os valores deixam de ser exibidos. O botão permanece no DOM com `aria-disabled` e proteção no handler, preservando foco durante a leitura. Mensagens usam os estados e avisos existentes. A lista de fatos alinha rótulos/valores no desktop e empilha cada par no celular.

## Evidências e limites

Publicado no commit `8286fbd7f4a549cf2e3d73fd65177e08fd8fb140`: os sete jobs da [CI 34593853517](https://github.com/ThiagoVenturaV/boopay-platform/actions/runs/34593853517) concluíram com sucesso, com **380 cenários distintos de backend** (377 PostgreSQL + três Firestore), **53 percursos do painel e quatro dos pixels**, regressão WooCommerce nativa e demos Linux/Windows. O job da ponte admite a falha da auditoria; o artefato atual preserva os 39 achados do SDK, incluindo 11 altos. [Resultado oficial e limites](https://github.com/ThiagoVenturaV/boopay-platform/blob/3ab824e3375d6d5d2956e0ca61aa90100f93a0d7/docs/evidence/vtex-catalog-ui-ci-2026-09-11.json).

Três novos cenários de backend validam contagem de execução/espera, leitura sem requisição nativa, virada diária sem escrita, orçamento, falha e estimativa removida após revogação. `npm run check` local: **380 cenários declarados, 352 aprovados, zero falhas, 28 reservados a PostgreSQL/Firestore**.

Os quatro percursos anteriores de checkout e cancelamento VTEX também passaram após o ajuste final. Os resultados locais estão registrados em [evidence/vtex-catalog-ui-local-2026-09-11.json](https://github.com/ThiagoVenturaV/boopay-platform/blob/3ab824e3375d6d5d2956e0ca61aa90100f93a0d7/docs/evidence/vtex-catalog-ui-local-2026-09-11.json).

A ponte Broadcaster continua candidata, com **39 achados de auditoria do SDK (11 altos)**, e não está liberada para instalação. A UI não resolve essa auditoria, a homologação externa, a comprovação de remoção, a retenção remota ou a meta completa. Nenhuma conta, segredo de loja, pagamento ou implantação externa foi utilizado neste incremento.
