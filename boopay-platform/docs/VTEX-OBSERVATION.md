# Acompanhamento automático VTEX

Implementado em 11/09/2026. O processo da aplicação acompanha tentativas que o Checkout Core já enviou à conexão VTEX configurada. Cada ciclo usa somente GET de OMS/gateway, valida os vínculos comerciais existentes e atualiza o estado canônico quando existe prova nativa suficiente. Não cria carrinhos, transações ou pagamentos; não retoma SendPayments/gatewayCallback. O fluxo manual de recuperação permanece descrito em [VTEX-CHECKOUT.md](VTEX-CHECKOUT.md).

## Limites e agendamento

| Controle | Comportamento |
|---|---|
| Ativação | Mesmo opt-in privado do checkout VTEX; nenhuma conexão significa nenhum timer ou chamada |
| Ciclo | A cada 30 segundos, sem sobreposição no mesmo processo |
| Lote | Até 5 tentativas por conexão, ordenadas pela próxima consulta e ID |
| Orçamento | Até 1.000 inspeções por conexão/dia UTC, compartilhadas pelo banco entre processos e reinícios |
| Reserva | Contabilizada antes da consulta; falha ou encerramento abrupto consome a reserva |
| Exclusão entre processos | Lease durável de 10 minutos, renovado antes de cada tentativa; processo antigo não pode gravar depois da expiração ou substituição |
| Pedido pendente comprovado | Nova consulta após 10 minutos |
| Resultado incompleto, divergência ou erro | Intervalo crescente de 1, 2, 4, 8, 16, 32 e no máximo 60 minutos; não interrompe as outras tentativas do lote |
| Estados encerrados | Cancelamento, estorno e falha canônicos saem da consulta periódica; consulta manual continua disponível |
| Encerramento normal | Cancela o timer e aguarda o trabalho em andamento antes de fechar o armazenamento |

O orçamento conta inspeções, não requisições HTTP. Um grupo conhecido usa duas leituras; uma tentativa sem grupo pode exigir duas buscas, até vinte pedidos e uma leitura de gateway. Cada requisição tem timeout de 15 segundos. O processamento de rede é limitado ao lote; a seleção ainda lê os metadados locais de checkouts/tentativas, sem paginação SQL específica. Não consome feeds de pedidos externos ou importa compras que nasceram fora do Core.

`vtex_reconciliation` guarda lease, dia, consumo e estado do último lote. `vtex_reconciliation_item` guarda referência de checkout/tentativa, horário, falhas e próxima consulta, sem comprador, endereço, CPF, cookie ou credencial. A reserva individual também permite recuperar uma interrupção sem começar repetidamente pelo mesmo pedido com falha. Um reinício antes da expiração preserva o lease; depois dela, outro processo pode assumir.

## Autorização e resultado financeiro

A autorização da conexão é conferida antes de cada HTTP. A gravação canônica verifica a configuração pública/privada vigente, validade, revogação e lease dentro da mesma transação que altera checkout/pedido. A confirmação do agendamento usa a mesma barreira. Assim, uma resposta atrasada não pode desfazer uma revogação, substituir a observação de outro processo ou escrever com credenciais antigas.

Ausência de prova ou erro de consulta fica no agendamento e preserva o último registro financeiro conhecido. O modo automático exige que o adaptador implemente `inspect`; não recorre ao método manual `lookup`. `inspect` não altera o journal de etapas comerciais. O Core mantém a comparação da revisão da tentativa e os vínculos de cotação, valor, moeda e pedido externo antes de persistir uma observação.

Promissória pendente não é receita paga. O cancelamento só é aceito quando OMS e gateway concordam. Aprovação manual, `Finished`, estorno parcial e estados incompatíveis continuam exigindo conciliação. O worker continua somente de leitura; a [solicitação explícita de cancelamento pendente](VTEX-CANCELLATION.md) foi implementada depois, em rota autenticada e opt-in. Captura e estorno remoto permanecem pendentes.

## Operação

`GET /v1/admin/vtex/checkout/status`, autenticado no tenant, inclui `connections[].reconciliation`: modo, limites, consumo diário, orçamento esgotado, lease ativo, quantidade elegível/devida, última execução, código sanitizado e quantidade de falhas. `active` indica trabalho reservado com lease vigente, não que o timer está habilitado. Conexões indisponíveis continuam identificadas por `connections[].state/error`; os metadados do agendamento podem retratar uma execução anterior. A interface não recebeu controles adicionais neste incremento.

Com orçamento esgotado, as consultas automáticas aguardam o próximo dia UTC. Uma divergência exige inspeção operacional do pedido na rota manual; a agenda não modifica valores nem inventa confirmação. Revogação, expiração ou rotação bloqueiam o processo desatualizado; a configuração autorizada precisa estar vigente para novas consultas. O limite manual de 100 tentativas e seu cursor são independentes deste orçamento automático.

## Evidência e limites de entrega

`npm run check` executou 299 cenários: 278 aprovados localmente, zero falhas, dezoito PostgreSQL e três Firestore reservados aos ambientes de CI. Os oito cenários novos locais verificam ausência de POST, cancelamento comprovado, backoff/fila, orçamento/reinício/dia, revogação, rotação, expiração, lease e encerramento. Um cenário adicional usa dois pools PostgreSQL para disputar o lease e rejeitar a resposta antiga.

`npm run vtex:checkout:demo` agora resolve a perda da confirmação via o mesmo ciclo automático e consulta HTTP do comprador: dois pedidos pendentes de R$ 26,01, dois envios de transação, dois envios de pagamento, um callback e zero receita paga. A transição do gateway é injetada pela fixture; não é executada contra uma conta VTEX. [Evidência local](https://github.com/ThiagoVenturaV/boopay-platform/blob/3ab824e3375d6d5d2956e0ca61aa90100f93a0d7/docs/evidence/vtex-observation-local-2026-09-11.json).

A validação externa, PSP sandbox VTEX, sincronização incremental, interface/homologação do cancelamento pendente, estorno e expurgo remoto permanecem abertos. Este incremento fecha a ausência de acompanhamento periódico das tentativas existentes; não declara concluído o MVP integral. [Matriz de entrega](CRITERIOS-DE-ACEITE.md).

Publicação validada no commit `ceca789d47bc52a08a7d5a1fe6db9408ca4a9310`: os seis jobs da [CI 34561478280](https://github.com/ThiagoVenturaV/boopay-platform/actions/runs/34561478280) passaram. PostgreSQL executou 296 cenários, incluindo a disputa de lease entre dois pools; o emulador Firestore executou os outros três. Os 49 percursos de navegador, WooCommerce nativo e demos Linux/Windows passaram. Auditoria das dependências de execução: zero vulnerabilidades. [Resultado oficial](https://github.com/ThiagoVenturaV/boopay-platform/blob/3ab824e3375d6d5d2956e0ca61aa90100f93a0d7/docs/evidence/vtex-observation-ci-2026-09-11.json). Repositório privado verificado após publicação; nenhuma conta VTEX foi acionada para esta validação.
