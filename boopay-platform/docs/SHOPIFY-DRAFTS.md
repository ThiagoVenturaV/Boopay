# Shopify — ciclo de vida dos rascunhos

Implementado em 11/09/2026. Uma revisão substituída, compra abandonada, cancelamento local ou resposta perdida de `draftOrderCreate` pode deixar contato e endereço na Shopify. O adaptador agora registra cada nova tentativa antes de enviar a criação, para permitir sua limpeza posterior mesmo sem receber o ID remoto. O código foi testado com transporte sintético; nenhuma loja externa foi configurada e nenhuma exclusão real foi executada.

## Política implementada

- Todo novo rascunho do adaptador conectado recebe registro durável, separado por tenant, integração e origem. Guarda UUID, ID remoto quando conhecido, datas, estado e códigos de erro. Não copia comprador, e-mail, telefone, endereço, credenciais ou mensagens remotas.
- A criação envia `boopay-development` e uma tag única `boopay-guard-{UUID}`, além de `boopay_guard` nos atributos. O ID retornado é registrado antes de validar o restante da cotação: uma cotação rejeitada também pode deixar um rascunho que exige limpeza.
- A elegibilidade começa **uma hora após o registro de criação**. A reserva original expira em até trinta minutos. Cancelar ou substituir a revisão não dispara exclusão imediata nem modifica esse prazo.
- Antes de enviar a conclusão nativa, o adaptador protege o registro em transação. Proteção e aquisição pela limpeza são mutuamente exclusivas; uma tentativa que chegou a esse ponto fica fora da exclusão automática, mesmo que o resultado posterior seja desconhecido. Essa conservação também pode manter rascunhos cuja conclusão não chegou à Shopify.
- Rascunhos anteriores a esta versão, sem registro local, não são varridos por tag genérica. Seus contextos antigos continuam utilizáveis pelo fluxo comercial existente.

## Habilitar e acompanhar

No descritor da conexão em `BOOPAY_SHOPIFY_CONNECTIONS`, `draftCleanupEnabled` é opcional e booleano. Omitido ou `false`, não há chamadas de limpeza; o registro das novas criações continua ativo. `true` habilita o worker e a rota administrativa abaixo. É uma configuração do processo, aplicada após reinício, sem incluir valores de segredo no descritor. Todas as instâncias que concluem compras devem executar a versão com proteção durável antes de habilitar a limpeza.

O worker principal tenta a limpeza a cada trinta segundos, após o passo de sincronização, mesmo sem entregas de webhook pendentes. Uma falha de sincronização não descarta os registros de limpeza. Cada execução trata no máximo dez registros, com lease individual de três minutos e revalidação antes do envio. Falhas repetem com espera crescente de vinte a trezentos segundos; registros em revisão ficam preservados. Esse intervalo é a frequência de tentativa, não um SLA de exclusão.

`POST /v1/admin/shopify/{id}/drafts/cleanup` com corpo `{}` usa a mesma rotina, exige administrador, tenant correto e a proteção de origem já existente. A rota não habilita a função nem aceita IDs arbitrários para excluir. Revogação, expiração, origem permitida, revisão de credenciais e versão da API continuam sendo verificadas.

`GET /v1/admin/shopify/status` inclui `connections[].draftCleanup`: `enabled`, contagens `pending`, `protected`, `review`, `resolved` e `errors` sem texto externo. A interface existente não acrescenta um controle para habilitar exclusões.

## Recuperação e limites

Quando o ID é desconhecido, a consulta procura a tag única, limitada a dois resultados e `hasNextPage`. Zero resultados continua **não localizado**, sem declarar que nada foi criado; a indexação pode estar atrasada. Múltiplos resultados ou atributos divergentes vão para revisão, sem exclusão. Um ID localizado e validado é persistido antes de excluir.

A rotina consulta o ID diretamente e confere tags e atributo exatos. Só envia `draftOrderDelete` após observar `OPEN` e ausência de pedido. Fatura enviada, conclusão nativa ou pedido associado observado exigem revisão. A consulta não solicita dados de contato ou endereço. A mutation precisa confirmar o mesmo `deletedId`. Se a resposta se perder, a próxima tentativa consulta o ID: ausência é registrada como `absent`; não repete a exclusão de um recurso já ausente. Erro de permissão, transporte ou GraphQL permanece pendente, sem tratar a falha como sucesso.

A API `draftOrderDelete` recebe apenas o ID, **sem precondição atômica de estado ou versão**. Um operador ou outra app pode modificar/concluir um rascunho depois da leitura e antes da exclusão. A proteção local impede a concorrência com a conclusão nesta versão do Boopay; não bloqueia operações externas. A ativação exige homologar esse limite e reservar esses rascunhos de teste ao fluxo Boopay. O código não chama exclusão, cancelamento, captura ou estorno de pedidos; ainda assim, a remoção de um rascunho alterado externamente pode prejudicar sua referência de conciliação. Não há garantia de exclusão apenas de objetos que permaneçam `OPEN` no instante da mutation.

Recibos `deleted`/`absent` são podados depois de sete dias na próxima criação ou execução da limpeza. Registros pendentes, protegidos ou em revisão não são apagados por tempo decorrido. Dez mil pendências por tenant impedem novas criações até resolução. Não foi implementada resolução administrativa de ambiguidades, retenção física de backups, limpeza de pedidos/clientes Shopify, expurgo completo de PII remota nem migração dos rascunhos antigos. Uma exclusão de perfil Boopay continua sem apagar automaticamente essas cópias.

## Verificação

`test/shopify-drafts.test.ts` cobre registro anterior ao envio, desligamento padrão, revisão ainda válida, abandono/cancelamento/substituição, cotação rejeitada, rascunho alheio preservado, respostas perdidas, busca vazia/ambígua, fatura nativa, proteção de conclusão incerta, permissões/origens, reinício, retenção dos recibos e processo atrasado. O cenário PostgreSQL usa dois pools independentes, testa exclusão única e impede o envio de um worker cujo lease foi substituído.

Validação local: `npm run check` passou, com **344 cenários declarados, 320 aprovados, zero falhas e 24 reservados ao PostgreSQL/Firestore**. Dos dez novos cenários, nove passaram localmente. Evidência local em [evidence/shopify-drafts-local-2026-09-11.json](https://github.com/ThiagoVenturaV/boopay-platform/blob/3ab824e3375d6d5d2956e0ca61aa90100f93a0d7/docs/evidence/shopify-drafts-local-2026-09-11.json).

A [CI 34579746423](https://github.com/ThiagoVenturaV/boopay-platform/actions/runs/34579746423), no commit `e3c4bea492037f24667553446758449727b1cd9a`, aprovou os seis jobs e os dez novos cenários, incluindo os dois pools PostgreSQL. **344 cenários distintos de backend** (341 PostgreSQL + três no emulador Firestore), 49 percursos do painel, quatro dos pixels e a regressão Woo nativa passaram. [Registro oficial](https://github.com/ThiagoVenturaV/boopay-platform/blob/3ab824e3375d6d5d2956e0ca61aa90100f93a0d7/docs/evidence/shopify-drafts-ci-2026-09-11.json). Testes sintéticos não comprovam aceitação da busca/mutation, permissões, indexação, política de retenção ou comportamento concorrente numa loja autorizada.

## Contratos consultados

Documentação oficial consultada em 11/09/2026, identificada como Admin GraphQL **2026-07**, versão fixada no cliente:

- [draftOrderDelete](https://shopify.dev/docs/api/admin-graphql/latest/mutations/draftOrderDelete): entrada por ID, `deletedId`, `userErrors`, escopo de escrita e permissão de exclusão.
- [draftOrders](https://shopify.dev/docs/api/admin-graphql/latest/queries/draftOrders): pesquisa por tag e conexão paginada.
- [draftOrder](https://shopify.dev/docs/api/admin-graphql/latest/queries/draftOrder): consulta pelo ID original.

Essas páginas de documentação não substituem a homologação externa descrita em [SHOPIFY.md](SHOPIFY.md) nem fecham a [meta completa](CRITERIOS-DE-ACEITE.md).
