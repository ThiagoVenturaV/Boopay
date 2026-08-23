# Boopay — Escopo e trade-offs do MVP

Versão: 1.0  
Data-base: 22 de agosto de 2026  
Meta: MVP demonstrável até dezembro de 2026

## 1. Objetivo do MVP

Demonstrar uma jornada completa de Agentic Commerce na qual o Boopay:

1. conecta-se a uma loja virtual;
2. coleta comportamento de navegação;
3. constrói e atualiza o perfil 360° do cliente;
4. permite que GPT-4o e Gemini façam recomendações com base no catálogo e no perfil;
5. conduz o cliente ao checkout;
6. processa a compra em sandbox;
7. recupera um carrinho abandonado pelo WhatsApp;
8. apresenta os resultados em um dashboard administrativo.

## 2. Definição de “completo” no MVP

“Completo” significa funcional de ponta a ponta para uma loja demonstrativa, com dados e integrações reais ou em sandbox.

Não significa, nesta fase:

- escala enterprise;
- operação simultânea de várias lojas;
- publicação em marketplaces de aplicativos;
- disponibilidade automática no ChatGPT ou no Modo IA do Google;
- pagamentos em produção sem homologação;
- CDP de nível enterprise;
- rastreamento avançado entre dispositivos e canais.

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
- o mesmo contrato de eventos;
- a mesma camada de autenticação e monitoramento.

Profundidade esperada por integração:

| Plataforma | Entrega no MVP |
|---|---|
| WooCommerce | Plugin instalável, leitura de catálogo e pedidos, captura dos eventos e sincronização |
| Shopify | Aplicativo privado/customizado em development store, webhooks, catálogo, pedidos e eventos |
| VTEX | Integração privada pelas APIs disponíveis, sincronização de catálogo/pedidos e captura de eventos |

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

### 3.4 Inteligência artificial

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

Restrições:

- o agente não poderá inventar preço, estoque, prazo ou desconto;
- a IA não autorizará pagamento sem confirmação do cliente;
- descontos deverão obedecer a regras previamente cadastradas;
- respostas relevantes deverão ser auditáveis;
- dados pessoais enviados aos modelos deverão ser minimizados.

### 3.5 Protocolos ACP e UCP

Entram no MVP:

- implementação dos contratos necessários ao projeto;
- endpoints e adaptadores;
- documentação dos fluxos;
- exemplos de requisição e resposta;
- testes locais e em sandbox quando disponíveis;
- demonstração do fluxo compatível com a arquitetura Boopay.

Ficam no backlog:

- aprovação como parceiro;
- homologação externa;
- publicação nas superfícies oficiais;
- disponibilidade pública dentro do ChatGPT;
- disponibilidade pública no Modo IA do Google.

Trade-off: implementar o protocolo não será apresentado como garantia de publicação na superfície de terceiros.

### 3.6 Pagamentos

Entram no MVP:

- Stripe Connect em sandbox;
- Google Pay em ambiente de teste;
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

### 3.7 Recuperação por WhatsApp

Entram no MVP:

- detecção de carrinho abandonado;
- verificação de consentimento;
- envio de mensagem por template permitido;
- limite de frequência;
- link de retorno para o carrinho;
- rastreamento de clique, retorno e conversão;
- opção de bloqueio de novos contatos.

Não entram inicialmente:

- campanhas em massa;
- automações complexas;
- grande biblioteca de templates;
- central completa de atendimento.

### 3.8 Dashboard administrativo

O dashboard do MVP será completo para a loja demonstrativa e incluirá:

- visão executiva;
- funil de navegação e compra;
- exposição, interação, adição ao carrinho e conversão;
- carrinhos abandonados e recuperados;
- receita total;
- receita influenciada pela IA;
- produtos mais vistos;
- produtos mais adicionados ao carrinho;
- produtos mais vendidos;
- desempenho de GPT-4o e Gemini;
- métricas por canal e período;
- falhas de integrações e pagamentos;
- filtros;
- exportação dos dados principais.

Trade-off: o conjunto de módulos entra completo, mas sem um construtor de relatórios customizáveis.

### 3.9 Perfil 360° do cliente

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
- contatos de recuperação por WhatsApp;
- origem dos dados;
- exclusão dos dados quando solicitada.

Trade-off: o perfil será completo para os dados disponíveis na loja demonstrativa, sem identity resolution avançada entre dispositivos.

### 3.10 SaaS e lojas

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

1. O cliente abre um produto.
2. O SDK registra o evento view.
3. O cliente adiciona um item ao carrinho.
4. O SDK registra add_to_cart.
5. O perfil 360° é atualizado.
6. GPT-4o ou Gemini consulta catálogo, regras e perfil.
7. O agente recomenda um produto ou condição permitida.
8. O cliente confirma o checkout.
9. Stripe Connect ou Google Pay processa o fluxo em sandbox.
10. O pedido é registrado.
11. BigQuery recebe os dados analíticos.
12. O dashboard exibe a conversão.

## 5. Jornada de recuperação

1. O sistema detecta exit_intent ou abandono do carrinho.
2. O Boopay verifica consentimento e limite de frequência.
3. O WhatsApp envia a mensagem de recuperação.
4. O cliente retorna por um link rastreável.
5. A compra é concluída.
6. O dashboard atribui a recuperação ao fluxo correto.

## 6. Fora do escopo imediato

- CDP completo;
- rastreamento avançado e omnichannel;
- publicação oficial de ACP/UCP;
- multilojas;
- planos e cobrança SaaS;
- escala enterprise;
- campanhas completas de WhatsApp;
- construtor livre de relatórios;
- pagamentos em produção antes da aprovação dos critérios técnicos.

## 7. Resultado esperado

Ao final do MVP, a equipe deverá conseguir demonstrar a jornada completa sem editar dados manualmente no meio do fluxo e sem apresentar telas ou integrações simuladas como se estivessem em produção.
