# Perfil 360° e governança dos dados

Perfil na base canônica SQLite/PostgreSQL, com consentimento, projeção, contexto de IA, exportação, exclusão e retenção. As [telas de Audiência e Privacidade](AI-PROFILE-UI.md) estão ligadas às APIs. A projeção Firestore opt-in está implementada e foi exercitada no emulador; BigQuery recebe somente metadados operacionais minimizados, sem perfil/conversa. [Configuração e limites](DATA-PROJECTIONS.md). Não há ativação cloud nem identidade verificada entre sessões. Esta entrega não representa certificação legal ou perfil completo de clientes externos.

## Identidade e consentimento

A [base de vínculo consentido com lojas](PROFILE-STOREFRONT.md) acrescenta autorização de escrita por integração/origem, projeção das observações e revogação transacional. Está ligada aos receptores Woo/Shopify/VTEX; [aceite visual e transporte nos SDKs Shopify/VTEX](STORE-PROFILE-UI.md) implementados; ponte do plugin Woo e instalação nas lojas ainda pendentes. Isso não verifica a identidade de uma conta nativa.

O perfil pertence ao `buyerId` autenticado dentro de um tenant. Nome e e-mail são informados pelo próprio comprador, criptografados com AES-GCM e marcados `self_declared`, `verified:false`. O servidor não junta compradores por e-mail, nome, IP ou dispositivo. Um token nunca é exposto como identificador do perfil.

A identidade acompanha a sessão existente, de até 24 horas. Recuperação entre dispositivos, verificação de e-mail e vínculo com contas reais do e-commerce seguem pendentes. Identificadores e origem dos dados aparecem na API/exportação; não há resolução de identidade implícita.

A política `boopay-profile-2026-09-09` possui duas finalidades desligadas por padrão:

| Finalidade | Efeito |
|---|---|
| `personalization` | Permite guardar identidade declarada, registrar navegação e derivar o perfil da atividade desta sessão |
| `aiContext` | Permite enviar um resumo de interesses aos provedores escolhidos e gerar embeddings pessoais; depende de `personalization` |

Alterações informam a política e `expectedVersion`. Atualizações concorrentes não sobrescrevem a escolha uma da outra; repetir a mesma solicitação retorna a versão registrada. A evidência contém finalidade, versão, geração, ação e horário, sem nome/e-mail.

Habilitar abre uma nova geração de coleta. Checkouts e histórico preexistentes ficam fora da nova projeção, inclusive se tiverem o mesmo timestamp da habilitação. Se uma conversa antiga continuar, somente os novos turnos vinculados à autorização atual entram no perfil. Reativar não recupera dados apagados. `windowStartedAt` identifica o início: os totais representam essa janela, não toda a vida de uma pessoa.

Revogar `aiContext` apaga vetores pessoais, conversas e seus corpos de auditoria. Revogar `personalization` também apaga identidade e navegação e interrompe a projeção. A rota de política informa essas consequências; a interface as explica antes de salvar a revogação.

## Projeção explicável

O servidor lê registros canônicos e não aceita receita informada pelo navegador.

| Campo | Fonte/regra |
|---|---|
| Navegação | `product_view` do comprador autenticado, produto existente, horário do servidor e idempotência; origem `browser_reported` |
| Observações da loja | `projection.storefront`: sessão autorizada, visualizações, adições e saída; snapshots de carrinho ficam separados dos checkouts. Visualização vinculada usa peso 1; receita nunca vem desses eventos |
| Carrinhos | Checkouts próprios abertos e não expirados |
| Compras | Pedidos próprios ligados a checkouts da geração atual |
| Gasto | Moedas separadas; valores pagos, devolvidos e saldo líquido. Pendências/falhas não somam receita paga |
| Frequência | Pedidos atualmente pagos, excluindo estornados |
| Recência | Dias desde o pagamento mais recente; criação do pedido quando `paidAt` não existe, como no simulador |
| Interesse por produto | Visualização × 1, quantidade no carrinho ativo × 2, quantidade em pedido pago × 3 |
| Categorias/preferências | Soma dos pontos dos produtos, com origem e regra `boopay-profile-rules-v1` |
| Segmentos | `exploring`, `buyer` ou `repeat_buyer` (dois ou mais pedidos pagos), com `active_cart` e `recent_buyer` quando aplicáveis |
| Linha do tempo | Eventos de checkouts, pedidos, turnos próprios e navegação da geração |
| IA | Até 20 recomendações recentes na projeção e metadados das conversas retidas |

Pesos são heurísticas iniciais, não medidas validadas de intenção ou poder de compra. Segmentos descrevem atividade comercial; não inferem saúde, renda ou personalidade. Estornos e alterações aparecem na leitura seguinte. O backend percorre os registros da loja demonstrativa; índices e paginação para grande volume ainda precisam evoluir.

## Contexto de IA

Cada turno recebe um snapshot autorizado com até cinco categorias, cinco IDs/nomes de produtos e segmentos. Identidade, e-mail, endereço, pagamentos, pedidos detalhados e total gasto ficam fora dele. `profileAuthorization` registra geração, versão e estado da autorização localmente, sem enviar esses identificadores ao modelo.

Embeddings pessoais são opcionais e gerados por ação explícita. Ligam comprador, geração, provedor, modelo, hash dos interesses e validade. A autorização é verificada antes da reserva da chamada e antes de salvar. Se os interesses mudarem durante a execução, o vetor não é salvo como atual. No próximo turno, vetores incompatíveis com o hash da projeção não são usados.

Um vetor válido acrescenta até 0,25 ponto de afinidade aos candidatos da busca. Não afrouxa orçamento, moeda, frescor, disponibilidade nem a validação final do catálogo. A IA continua sem ferramentas para confirmar ou pagar. A qualidade dessa personalização ainda precisa de avaliação real.

Revogação/exclusão bloqueia a geração antiga. Uma chamada já enviada pode continuar no provedor, mas seu retorno tardio não recria transcrição, vetor ou vínculo apagado. Chamadas reservadas continuam na quota, mesmo com seu conteúdo apagado.

## Exportação e exclusão

A exportação usa um snapshot transacional: identidade, autorizações, projeção, atividades, conversas/mensagens minimizadas, decisões finais, seleções, metadados de chamadas e embeddings próprios. Não inclui credenciais ou raciocínio interno dos provedores. Outros compradores e tenants ficam fora.

Excluir exige `accepted:true` e versão atual. Remove identidade, navegação, vetores, conversas, turnos, seleções, corpos de chamadas correlacionadas e eventos/outbox de IA vinculados. A nova geração da marca de exclusão bloqueia regravações tardias. Repetir a exclusão anterior é idempotente. Novas conversas criadas depois dela exigem uma nova exclusão com a versão atual.

Pedidos, tentativas e dados privados necessários ao checkout/conciliação são operacionais e separados. O recibo informa quantos permanecem e não os declara apagados. Sua retenção/revisão pelo controlador ainda precisa ser definida para clientes reais. Uma seleção explícita já em andamento pode criar um checkout não confirmado depois de seu vínculo de perfil ser apagado; isso não confirma nem cobra a compra.

As cópias temporárias de rascunhos e respostas ACP/UCP têm política técnica própria de 48 horas, com expurgo lógico e proteção contra restauração por respostas atrasadas. O registro mínimo de idempotência e o pedido comercial permanecem para impedir cobrança duplicada e permitir conciliação. Essa limpeza não substitui a exclusão do perfil nem a política de dados comerciais e backups do ambiente. Consulte [protocolos](PROTOCOLS.md#retenção-dos-dados-temporários).

O apagamento é lógico na base ativa. O [backup cifrado e a restauração isolada](BACKUP-RESTORE.md) preservam as marcas presentes na cópia e bloqueiam a inicialização da aplicação restaurada. Marcas posteriores ainda precisam ser obtidas de uma fonte confiável e reaplicadas antes da retomada. Agendamento, retenção física, liberação operacional e eliminação nos provedores externos não estão automatizados; uma restauração íntegra não prova que os consentimentos antigos continuam válidos.

A ANPD descreve direitos de acesso, correção, revogação e eliminação, com hipóteses legais de conservação. Estes são mecanismos técnicos; fundamentos e prazos da operação real precisam de avaliação do controlador. [Direitos dos titulares — ANPD](https://www.gov.br/anpd/pt-br/assuntos/titular-de-dados/direito-dos-titulares).

## Retenção da demonstração

| Registro | Regra |
|---|---|
| Navegação | 30 dias |
| Conversas, mensagens e corpos de IA | 7 dias |
| Embeddings pessoais e jobs | 7 dias; mudança dos interesses invalida o uso antes |
| Perfil inativo, incluindo identidade | 90 dias sem atividade própria do perfil: consentimento, identidade, navegação, turno de IA ou embedding concluído |
| Marca/evidência mínima de exclusão | 365 dias após exclusão |
| Metadados de chamadas, quotas e registros comerciais | Separados; política de produção ainda pendente |

`src/main.ts` limpa na inicialização e a cada 60 segundos, evita ciclos simultâneos e aguarda o ciclo no shutdown. A leitura/contexto também recusa perfil inativo vencido sem depender do worker. A projeção não usa navegação/vetores vencidos. Os prazos são parâmetros técnicos da demonstração; alterá-los exige revisar a política e sua versão.

## API

| Método/rota | Entrada/resultado |
|---|---|
| `GET /v1/buyer/profile/policy` | Finalidades, consequências e retenção |
| `GET /v1/buyer/profile` | Estado, identidade, projeção e validade dos vetores próprios |
| `PUT /v1/buyer/profile/consent` | `{ "expectedVersion":0, "policyVersion":"boopay-profile-2026-09-09", "purposes":{"personalization":true,"aiContext":true} }` |
| `PUT /v1/buyer/profile/identity` | `{ "expectedVersion":1, "identity":{"name":"Pessoa demonstrativa","email":null} }` |
| `POST /v1/buyer/profile/activities` | `Idempotency-Key` e `{ "expectedVersion":1, "type":"product_view", "productId":"..." }` |
| `POST /v1/buyer/profile/embeddings` | `{ "expectedVersion":1, "provider":"openai" }`; usa quota/credencial configuradas |
| `GET /v1/buyer/profile/export` | JSON sem raciocínio interno do provedor |
| `DELETE /v1/buyer/profile` | `{ "expectedVersion":1, "accepted":true }`; versão nova e recibo |
| `GET /v1/admin/profiles` | Resumos autorizados do tenant |
| `GET /v1/admin/profiles/:id` | Perfil autorizado; não encontra outro tenant ou perfil revogado |
| `POST /v1/admin/privacy/retention` | `{}`; ciclo no tenant com contagens |

O comprador vem da autenticação, nunca do corpo. Administradores usam a autorização por tenant do painel. Cookies exigem origem válida nas mutações. Entradas/políticas inválidas usam 422; conflitos de versão/autorização usam 409. As telas de consentimento e privacidade ficam em Agentes de IA → Privacidade. Audiência permite ao gestor consultar os perfis autorizados.

## Verificação

Commit `ac9acad39d5586e67e51bb1a5675b524ad4b497a`, [CI 34430392245](https://github.com/ThiagoVenturaV/boopay-platform/actions/runs/34430392245): Linux, Windows, PostgreSQL, navegador e WooCommerce nativo aprovados. PostgreSQL executou 91 testes sem omissões; localmente passaram 88 testes, com três dependentes de PostgreSQL omitidos, os 11 percursos Playwright e a demo simulada. A aplicação local atualizada respondeu às rotas de política/perfil/configuração, com as duas finalidades desligadas e provedores desabilitados por padrão.

Testes cobrem consentimento concorrente, coleta desligada, identidade criptografada, e-mails sem fusão, isolamento, idempotência, compras do núcleo, moedas e estornos. Também verificam contexto minimizado, ranking, mudança de interesses na indexação, exclusão durante inferência/embedding/seleção, exportação sem raciocínio interno e retenção. PostgreSQL usa duas conexões independentes.

`npm run ai:demo` demonstra perfil consentido fictício → navegação → vetores → recomendação → checkout com confirmação simulada → projeção → exportação → exclusão. A base é efêmera. `--live` continua terminando sem confirmação/pedido; seus dados são demonstrativos. Nenhum probe real foi executado nesta entrega.

O objetivo maior está em [DELIVERY.md](CRITERIOS-DE-ACEITE.md): projeções externas, identificação verificada, avaliação real da IA, pagamentos, protocolos e demais adaptadores mantêm critérios próprios de conclusão. Fluxos e testes da interface estão em [AI-PROFILE-UI.md](AI-PROFILE-UI.md).

Avisos de pedidos ACP/UCP têm uma preferência operacional própria: `orderUpdates`, false por padrão, aceita pelo comprador ao delegar o cliente. Ela não é ativada por consentimento de personalização, não é cancelada pela expiração do bearer e não equivale ao perfil 360°. O comprador interrompe avisos de cada checkout pela rota específica; o lojista pode desativar o destino ou revogar o cliente. Corpos temporários ficam cifrados e expiram em até 48h, enquanto pedido/vínculo mínimo têm retenção operacional própria. Veja [consentimento e limites do pós-compra](PROTOCOL-ORDERS.md).
