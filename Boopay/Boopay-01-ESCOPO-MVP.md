# Boopay — Escopo e trade-offs do MVP

Versão: 1.3
Data-base: 26 de agosto de 2026
Meta: MVP demonstrável até dezembro de 2026

## 0. Decisão central e sequência de entregas

O principal diferencial do Boopay é um ciclo integrado de **GEO, catálogo agêntico, checkout conversacional invisível e atribuição de receita**. A jornada começa preparando a loja para ser entendida por agentes, passa pela distribuição de produtos elegíveis e termina com a compra e o pedido no próprio contexto conversacional, sem abrir o storefront.

Existem dois marcos diferentes:

| Marco | Papel |
|---|---|
| MVP inicial descrito no PRD v1.0 de 25/08 | Fundação WooCommerce: conexão, catálogo, busca, tracking e painel operacional, com checkout ainda demonstrativo |
| MVP de dezembro | Jornada conversacional ponta a ponta, com checkout real em sandbox e sem redirecionamento; superfície oficial quando houver aprovação externa |

“Invisível” não significa pagamento oculto ou autônomo. Produto, quantidade, preço total, entrega e meio de pagamento devem ser apresentados antes da confirmação explícita do comprador.

## 1. Objetivo do MVP

Demonstrar uma jornada completa de Agentic Commerce na qual o Boopay:

1. executa o GEO Readiness Audit da KeyCore nas páginas selecionadas da loja;
2. relaciona evidências e recomendações a páginas, produtos e SKUs;
3. conecta-se à loja virtual e normaliza seu catálogo;
4. valida a prontidão e a elegibilidade dos produtos para distribuição agêntica;
5. disponibiliza produtos e capacidades comerciais a uma superfície de IA;
6. permite que ChatGPT, Gemini ou o simulador do Boopay recomende um produto com base em dados válidos;
7. abre uma sessão canônica de checkout por ACP ou UCP;
8. recalcula preço, estoque, desconto, frete, impostos e total na fonte autoritativa;
9. coleta somente os dados necessários e apresenta o resumo final;
10. recebe a confirmação explícita e uma credencial de pagamento tokenizada e limitada à transação;
11. processa a compra em sandbox e registra o pedido na plataforma de e-commerce;
12. sincroniza status, cancelamento ou estorno quando suportado;
13. apresenta do diagnóstico à conversão em um dashboard administrativo.

## 2. Definição de “completo” no MVP

“Completo” significa funcional de ponta a ponta para uma loja demonstrativa, com dados e integrações reais ou em sandbox, sem redirecionar o comprador ao storefront no fluxo controlado.

Não significa, nesta fase:

- escala enterprise;
- operação simultânea de várias lojas;
- publicação em marketplaces de aplicativos;
- disponibilidade automática no ChatGPT ou no Modo IA do Google;
- compra autônoma sem revisão e confirmação humana;
- armazenamento de cartão ou captura direta de credencial bruta pelo Boopay;
- pagamentos em produção sem homologação;
- CDP de nível enterprise;
- rastreamento avançado entre dispositivos e canais.
- integração com WhatsApp ou campanhas de recuperação por mensagem.
- promessa de citação ou recomendação causada pelo score GEO;
- correção automática e sem aprovação do site do lojista;
- monitoramento amplo e contínuo de participação da marca nas respostas de todas as IAs.

## 3. Escopo funcional

### 3.1 Integrações de e-commerce

Entram no MVP:

- WooCommerce;
- Shopify;
- VTEX.

As três integrações deverão compartilhar:

- um modelo canônico de catálogo;
- um modelo canônico de cliente;
- um modelo canônico de carrinho e pedido;
- um modelo canônico de sessão de checkout e credencial de pagamento delegada;
- o mesmo contrato de eventos;
- a mesma camada de autenticação e monitoramento.

Profundidade esperada por integração:

| Plataforma | Entrega no MVP |
|---|---|
| WooCommerce | Primeira fatia vertical: plugin instalável, catálogo, preço, estoque, cálculo do checkout, criação de pedido, webhooks e tracking |
| Shopify | Aplicativo privado/customizado em development store, catálogo, cálculo do checkout, pedidos, webhooks e eventos |
| VTEX | Integração privada pelas APIs disponíveis, simulação de carrinho, catálogo, pedidos, webhooks e eventos |

Trade-off: as integrações serão funcionais, mas não dependerão de publicação nos marketplaces oficiais.

### 3.2 Coleta de eventos

Entram no MVP:

- SDK JavaScript;
- identificação da loja;
- identificação da sessão;
- associação com o cliente quando houver identificação válida;
- evento view;
- evento add_to_cart;
- evento exit_intent;
- validação do payload;
- prevenção básica de eventos duplicados;
- envio seguro e tolerante a falhas;
- normalização dos eventos recebidos dos três e-commerces.

Ficam no backlog:

- CDP completo;
- identity resolution entre dispositivos;
- rastreamento omnichannel;
- atribuição avançada;
- criação de audiências;
- dezenas de eventos adicionais;
- automações comportamentais complexas.

### 3.3 Dados

Entram no MVP:

- PostgreSQL;
- Firestore;
- BigQuery.

Responsabilidades:

| Tecnologia | Responsabilidade principal |
|---|---|
| PostgreSQL | Fonte transacional de lojas, integrações, clientes identificados, consentimentos, configurações, pedidos e auditoria |
| Firestore | Estado operacional em tempo real de sessões, carrinhos, contexto conversacional e projeção rápida do perfil |
| BigQuery | Histórico analítico de eventos, funis, agregações, desempenho e dados consumidos pelo dashboard |

Trade-off: cada dado terá uma fonte de verdade definida. Os três bancos não serão usados como cópias indiscriminadas da mesma informação.

### 3.4 GEO Readiness e catálogo agêntico

Entram no MVP para a loja demonstrativa:

- execução do GEO Readiness Audit da KeyCore em três páginas representativas: inicial, categoria e produto;
- armazenamento do score total, categorias, evidências, achados, severidade, data e versão da auditoria;
- relação entre URL de produto auditada e `product_id`/SKU do catálogo canônico;
- checklist de completude, atualidade e consistência do produto para feeds agênticos;
- validação de dados estruturados e políticas comerciais sem presumir que sejam requisitos especiais de uma IA;
- estado de distribuição e elegibilidade para ACP e UCP/Merchant Center quando as plataformas fornecerem esse dado;
- recomendações somente de leitura, sem alterar automaticamente o site;
- painel ligando prontidão GEO, produto elegível, recomendação observada ou simulada, checkout, pedido e receita.

Limites:

- o score mede prontidão e evidência técnica/editorial; não mede nem garante ranking, citação, recomendação ou conversão;
- indicação de recomendação real só será registrada quando a superfície oficial disponibilizar evidência; no sandbox, o evento será identificado como simulado;
- `llms.txt`, arquivos de IA ou schema adicional serão tratados como sinais auxiliares quando aplicáveis, nunca como atalhos garantidos;
- a ferramenta da KeyCore permanece um serviço separado do Checkout Core, integrado por contrato versionado.

### 3.5 Inteligência artificial

Entram no MVP:

- integração funcional com GPT-4o;
- integração funcional com Gemini;
- camada comum de provedores;
- seleção do provedor por configuração;
- recomendação de produtos;
- uso do catálogo e do perfil 360° como contexto;
- embeddings;
- regras comerciais autorizadas;
- confirmação do cliente antes do pagamento;
- registro de solicitações, respostas, latência e erros;
- comparação básica entre os provedores.

Na superfície oficial, ChatGPT ou Gemini conduz a conversa e decide quais produtos apresentar. ACP e UCP não “fazem a recomendação”; eles padronizam a troca de catálogo, capacidades, sessão de checkout, pagamento e pedido. No sandbox próprio, a camada de provedores do Boopay reproduz a jornada para que a demonstração não dependa de uma aprovação externa.

Restrições:

- o agente não poderá inventar preço, estoque, prazo ou desconto;
- a IA não autorizará pagamento sem confirmação do cliente;
- descontos deverão obedecer a regras previamente cadastradas;
- respostas relevantes deverão ser auditáveis;
- dados pessoais enviados aos modelos deverão ser minimizados.

### 3.6 Protocolos ACP e UCP

Entram no MVP:

- ACP e UCP como adaptadores substituíveis sobre o mesmo Checkout Core;
- descoberta de versão e capacidades quando exigida pelo protocolo;
- criação, consulta, atualização, conclusão e cancelamento de sessões de checkout;
- atualização de status do pedido;
- assinatura, autenticação, idempotência e proteção contra repetição;
- documentação dos fluxos;
- exemplos de requisição e resposta;
- testes locais e em sandbox quando disponíveis;
- demonstração do fluxo compatível com a arquitetura Boopay.

Ficam no backlog:

- aprovação como parceiro;
- homologação externa;
- publicação nas superfícies oficiais;
- checkout nativo público dentro do ChatGPT sem parceria ou aplicativo aprovado;
- checkout público no Gemini ou Modo IA do Google sem aprovação do Google.

Trade-off: o Boopay garante a compatibilidade e a demonstração controlada; implementar o protocolo não será apresentado como garantia de publicação na superfície de terceiros. Em 25 de agosto de 2026, o Google documenta UCP com checkout direto sujeito a aprovação. A OpenAI prioriza descoberta e checkout próprio do lojista, mantendo experiências nativas mais profundas por aplicativos e parcerias.

### 3.7 Pagamentos

Entram no MVP:

- Stripe Connect em sandbox;
- Google Pay em ambiente de teste;
- suporte a credenciais ou tokens delegados pela superfície, quando o protocolo e o provedor permitirem;
- confirmação explícita do cliente;
- processamento de sucesso e falha;
- webhooks;
- idempotência;
- registro da transação;
- associação entre pagamento e pedido;
- demonstração de estorno ou cancelamento quando o ambiente permitir.

Entrada em produção:

Será tratada como objetivo condicional. Só ocorrerá se os testes de segurança, conciliação, estorno, idempotência e homologação forem aprovados.

O Boopay não armazenará dados brutos de cartão.

O lojista permanece como **Merchant of Record**. O sistema de e-commerce mantém o pedido autoritativo e o provedor de pagamento mantém os dados sensíveis. O Boopay orquestra a sessão, valida o resultado e registra a trilha de auditoria.

### 3.8 Checkout conversacional invisível

Entram no MVP:

- sessão canônica independente de ACP, UCP, WooCommerce, Shopify ou VTEX;
- estados `draft`, `requires_information`, `ready_for_confirmation`, `confirmed`, `payment_authorized`, `completed`, `failed`, `canceled` e `expired`;
- atualização autoritativa de preço, disponibilidade, frete, impostos e descontos;
- resumo final antes da confirmação;
- confirmação explícita registrada com data, superfície e versão dos termos;
- conclusão idempotente;
- criação de pedido no e-commerce;
- atribuição do pedido à superfície e ao protocolo;
- tratamento de erros recuperáveis dentro da conversa;
- sincronização pós-compra suportada pelo adaptador.

Não entram no MVP:

- compra sem confirmação humana;
- assinatura, produto altamente customizável ou fluxo B2B complexo;
- armazenamento de cartão pelo Boopay;
- substituição do e-commerce como sistema de pedidos;
- promessa de que toda personalização visual do checkout da loja aparecerá na superfície de IA.

### 3.9 Análise de abandono de carrinho

Entram no MVP:

- detecção de carrinho abandonado;
- registro do evento e do estado do carrinho;
- cálculo da taxa de abandono;
- visualização de abandono no dashboard.

Não entra no produto:

- integração com WhatsApp;
- envio ativo de mensagens de recuperação;
- templates, webhooks, opt-in e controle de frequência específicos de mensageria;
- rastreamento de retorno atribuído a mensagens.

Decisão: o WhatsApp foi retirado do produto na reunião de 24 de agosto de 2026. O item não foi transferido para o backlog.

### 3.10 Dashboard administrativo

O dashboard do MVP será completo para a loja demonstrativa e incluirá:

- visão executiva;
- funil de navegação e compra;
- exposição, interação, adição ao carrinho e conversão;
- carrinhos abandonados e taxa de abandono;
- receita total;
- receita influenciada pela IA;
- produtos mais vistos;
- produtos mais adicionados ao carrinho;
- produtos mais vendidos;
- desempenho de GPT-4o e Gemini;
- métricas por origem, plataforma e período;
- score GEO atual, categorias, achados prioritários e histórico da loja demonstrativa;
- quantidade e percentual de produtos prontos, pendentes e inelegíveis para canais agênticos;
- funil `auditado → pronto → distribuído/elegível → recomendado → checkout → pedido`;
- GMV e receita agêntica atribuídos sem apresentar correlação como causalidade;
- sessões de checkout por superfície, protocolo e estado;
- taxa de conclusão sem redirecionamento;
- falhas de integrações e pagamentos;
- filtros;
- exportação dos dados principais.

Trade-off: o conjunto de módulos entra completo, mas sem um construtor de relatórios customizáveis.

### 3.11 Perfil 360° do cliente

O perfil 360° do MVP incluirá:

- identidade conhecida;
- identificadores de sessão;
- consentimentos;
- histórico de navegação;
- linha do tempo de eventos;
- carrinhos;
- compras;
- valor total gasto;
- recência e frequência;
- categorias de interesse;
- produtos de interesse;
- preferências inferidas;
- segmentos;
- embeddings;
- recomendações recentes;
- conversas e ações relevantes da IA;
- origem dos dados;
- exclusão dos dados quando solicitada.

Trade-off: o perfil será completo para os dados disponíveis na loja demonstrativa, sem identity resolution avançada entre dispositivos.

### 3.12 SaaS e lojas

Entram no MVP:

- uma loja demonstrativa ativa;
- tenant_id desde o início;
- isolamento lógico dos dados;
- estrutura preparada para receber novas lojas;
- configuração segura das credenciais de integração.

Ficam no backlog:

- onboarding autônomo;
- várias lojas por conta;
- planos;
- cobrança recorrente;
- limites por plano;
- permissões avançadas;
- operação comercial do SaaS.

## 4. Jornada principal

1. O lojista executa o GEO Readiness Audit nas páginas selecionadas da loja demonstrativa.
2. O Boopay recebe o resultado versionado, relaciona URLs a produtos e valida a prontidão do catálogo.
3. Produtos válidos são distribuídos pelos adaptadores agênticos; elegibilidade e falhas ficam registradas.
4. O cliente pede uma recomendação em ChatGPT, Gemini ou no simulador do Boopay.
5. A superfície consulta o catálogo disponibilizado pelo Boopay e apresenta um produto.
6. Ao escolher comprar, a superfície inicia uma sessão por ACP ou UCP.
7. O Boopay consulta o e-commerce e devolve preço, estoque, frete, impostos, descontos e total atualizados.
8. A conversa coleta os dados ainda necessários e permite corrigir erros recuperáveis.
9. A superfície apresenta o resumo completo.
10. O cliente confirma explicitamente.
11. A superfície ou carteira entrega uma credencial de pagamento tokenizada e limitada.
12. O Boopay conclui a sessão de forma idempotente e cria o pedido no e-commerce.
13. O status do pagamento e do pedido é sincronizado.
14. BigQuery recebe os eventos e a atribuição da jornada.
15. O dashboard mostra a progressão do diagnóstico até a conversão sem redirecionamento.

O site continua gerando eventos `view`, `add_to_cart` e `exit_intent`, mas essa é uma jornada analítica complementar. Ela não define mais a experiência principal de venda.

## 5. Jornada de análise de abandono

1. O sistema detecta exit_intent ou abandono do carrinho.
2. O Boopay registra o evento e o estado do carrinho.
3. O BigQuery recebe o dado analítico.
4. O dashboard atualiza o volume e a taxa de abandono.

## 6. Decisão confirmada em 24 de agosto de 2026

A integração com WhatsApp foi removida do produto durante a primeira reunião com Rogério e o mentor do Porto Digital. A decisão elimina do MVP e do backlog a dependência de provedor de mensageria, templates, webhooks, opt-in de mensagens, controle de frequência e rastreamento de retorno por esse canal.

A coleta de `exit_intent`, o registro de carrinhos abandonados e suas métricas permanecem no produto como capacidades analíticas.

## 7. Fora do escopo imediato

- CDP completo;
- rastreamento avançado e omnichannel;
- publicação oficial de ACP/UCP;
- ativação garantida do checkout nativo no ChatGPT ou Gemini;
- compra autônoma sem confirmação humana;
- armazenamento de dados brutos de cartão;
- multilojas;
- planos e cobrança SaaS;
- escala enterprise;
- construtor livre de relatórios;
- pagamentos em produção antes da aprovação dos critérios técnicos.
- remediação automática do site e publicação sem aprovação do lojista;
- promessa de aparição, citação ou recomendação baseada apenas no score GEO;
- monitoramento contínuo de marca em todas as superfícies de IA.

## 8. Resultado esperado

Ao final do MVP, a equipe deverá conseguir demonstrar a jornada completa — auditoria GEO, produto pronto e distribuído, recomendação, sessão, confirmação, pagamento sandbox, pedido e pós-compra — sem abrir o storefront, sem editar dados manualmente no meio do fluxo e sem apresentar prontidão como garantia de recomendação ou sandbox como superfície homologada de produção.
