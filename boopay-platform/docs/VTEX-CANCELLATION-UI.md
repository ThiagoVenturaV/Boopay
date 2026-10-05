# Cancelamento VTEX no checkout e nos pedidos

Implementado em 11/09/2026. A interface estende o resumo da compra e o detalhe administrativo do pedido, preservando a identidade Boopay e a composição B. A entrada do painel continua sendo receita. A modalidade é promissória VTEX de teste; os ensaios usam transporte VTEX sintético.

## Fluxo e confirmação

No Checkout, o comprador proprietário vê **Cancelamento na VTEX** depois do resultado do pedido. Em Pedidos, o gestor encontra a mesma seção no detalhe selecionado. Configurações informa se a conexão permite solicitar cancelamento. A função continua opt-in no descritor privado; não há alternância de credenciais pela interface.

**Revisar cancelamento** abre confirmação inline com valor/moeda e grupo do pedido original. O aceite começa desmarcado; **Confirmar solicitação de cancelamento** só habilita depois dele. **Voltar sem solicitar** não envia comandos e devolve o foco ao botão de revisão. O servidor deriva comprador/gestor da sessão; o navegador envia somente `accepted: true` e o hash retornado do resumo original.

Durante o envio, as ações da seção e o início de outra compra ficam bloqueados; o detalhe administrativo não pode ser fechado por seu botão. Navegar para outra área não repete nem desfaz uma operação já enviada. Respostas de componentes desmontados são ignoradas.

Solicitação aceita permanece **aguardando a loja**; ausência de recibo nativo permanece **resposta não confirmada**. Etapas ainda não enviadas podem ser retomadas com outro aceite do mesmo tipo de ator. Etapas enviadas não oferecem nova solicitação. **Cancelamento confirmado pela loja** depende do estado canônico conciliado pelo Core. A [API comercial](VTEX-CANCELLATION.md) mantém as verificações OMS/gateway e os limites de concorrência nativa.

## Leitura e recuperação

`GET /v1/buyer/vtex/orders/{id}/cancellation` e `GET /v1/admin/vtex/orders/{id}/cancellation` leem uma projeção local do pedido e do registro cifrado numa transação do mesmo tenant. Retornam estado, referência do grupo, valor/moeda/hash original, data da solicitação, contagem de envios e disponibilidade das ações. Não retornam contato, documento, endereço, cookies, credenciais ou hash do ator.

O comprador só lê seu pedido; o gestor só lê pedidos do tenant autenticado. A leitura usa `Cache-Control: no-store`, não chama VTEX, não renova aceite e não inicia cancelamentos. O histórico continua disponível após revogação ou remoção do descritor privado. Contexto ausente, conexão indisponível, modalidade financeira incompatível, outro processo em andamento e origem diferente da solicitação desabilitam novos envios com motivo explícito.

A seção lê o estado local ao abrir e a cada dez segundos enquanto a página está visível. **Consultar cancelamento na loja** aciona a conciliação existente e depois relê a projeção; o adaptador VTEX somente inspeciona a tentativa original. Sem conexão, **Atualizar estado registrado** só relê o histórico local. Após perder uma resposta, a interface tenta ler o registro sem repetir POST, preserva aviso e exige consulta antes de outra ação. Não existe retry comercial automático no navegador.

Valores e referências vêm do pedido retornado pelo serviço. O estado conciliado atualiza resumo e lista de pedidos. Solicitar cancelamento não cria receita paga nem estorno de promissória pendente.

## Validação e limites

Publicação em `695db13a1757d60772a0dac072b77c11631a66f1`, com [seis jobs aprovados na CI 34585069784](https://github.com/ThiagoVenturaV/boopay-platform/actions/runs/34585069784): 360 cenários distintos de backend (357 PostgreSQL + três Firestore), 51 percursos do painel e quatro dos pixels, regressão Woo nativa e demos Linux/Windows. A primeira CI encontrou um seletor antigo no teste UCP VTEX; a correção usa o botão atual e verifica a resposta de conciliação, com os quatro percursos UCP aprovados. [Evidência verificável](https://github.com/ThiagoVenturaV/boopay-platform/blob/3ab824e3375d6d5d2956e0ca61aa90100f93a0d7/docs/evidence/vtex-cancellation-ui-ci-2026-09-11.json).

Três novos cenários em `test/vtex-cancellation.test.ts` cobrem projeção local: isolamento/modalidade financeira; concorrência/etapas não enviadas/tipo de ator; perda de recibo, revogação e remoção da configuração sem chamadas externas ou exposição de dados privados. O teste HTTP existente também verifica GET, autenticação, propriedade, papel e `no-store`.

Os dois percursos de `e2e/vtex-cancellation.spec.ts`, em 1440px e 390px, cobrem abertura por teclado, foco, aceite desmarcado, desistência sem POST, confirmação do comprador, perda da resposta HTTP já processada, recarga, consulta sem repetir envio, transição nativa sintética para cancelado, solicitação como gestor e histórico após revogação. Os dois percursos VTEX anteriores verificam opt-in desligado. Chromium, HTTP, Core e SQLite são reais; transporte e transições VTEX são sintéticos.
