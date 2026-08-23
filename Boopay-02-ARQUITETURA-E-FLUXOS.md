# Boopay — Arquitetura e fluxos do MVP

Versão: 1.0  
Data-base: 22 de agosto de 2026

## 1. Princípios de arquitetura

1. Uma integração comum para três plataformas, evitando três produtos separados.
2. Fonte de verdade definida para cada tipo de dado.
3. Eventos padronizados desde o SDK até o dashboard.
4. GPT-4o e Gemini acessados por uma camada comum.
5. Agentes limitados por regras comerciais e de segurança.
6. Pagamentos confirmados pelo cliente e processados fora do Boopay.
7. tenant_id presente em todos os dados relevantes.
8. Observabilidade e auditoria desde o MVP.
9. Dados pessoais minimizados e protegidos.
10. Integrações externas substituíveis por adaptadores.

## 2. Visão de alto nível

    WooCommerce ─┐
    Shopify ─────┼──> Adaptadores ──> API/Middleware Boopay
    VTEX ────────┘                         │
                                          ├──> PostgreSQL
    SDK JavaScript ──> Eventos ────────────┼──> Firestore
                                          └──> BigQuery
                                                   │
                         Perfil 360° <─────────────┤
                              │                    └──> Dashboard
                              │
                         Camada de IA
                         ├── GPT-4o
                         └── Gemini
                              │
                         ACP / UCP
                              │
                         Checkout
                         ├── Stripe Connect
                         └── Google Pay
                              │
                         Pedido e métricas

    Carrinho abandonado ──> Regras de consentimento ──> WhatsApp ──> Retorno

## 3. Componentes

### 3.1 SDK JavaScript

Responsável por:

- iniciar uma sessão;
- identificar a loja;
- capturar view, add_to_cart e exit_intent;
- validar a estrutura do evento;
- criar um identificador único para o evento;
- tentar novamente em falhas temporárias;
- enviar somente os dados necessários.

Contrato mínimo de evento:

| Campo | Descrição |
|---|---|
| event_id | Identificador único do evento |
| event_type | view, add_to_cart ou exit_intent |
| occurred_at | Data e hora em UTC |
| tenant_id | Loja responsável pelo evento |
| session_id | Sessão de navegação |
| customer_id | Cliente, quando identificado |
| product_id | Produto relacionado |
| cart_id | Carrinho relacionado, quando aplicável |
| source | Origem do evento |
| properties | Propriedades adicionais validadas |

### 3.2 Adaptadores de e-commerce

Cada plataforma terá um adaptador que converte seus dados para os contratos canônicos do Boopay.

Operações comuns:

- importar catálogo;
- atualizar preço e estoque;
- receber eventos;
- consultar ou criar carrinho;
- consultar ou registrar pedido;
- relacionar cliente e sessão;
- informar falhas de sincronização.

O núcleo do Boopay não deverá depender de campos exclusivos de WooCommerce, Shopify ou VTEX.

### 3.3 API e middleware

Responsabilidades:

- autenticar integrações;
- receber e validar eventos;
- aplicar tenant_id;
- evitar duplicidade;
- normalizar payloads;
- orquestrar os serviços;
- registrar auditoria;
- expor endpoints para dashboard, perfil, IA, protocolos e pagamentos.

### 3.4 PostgreSQL

Fonte transacional para:

- tenants;
- usuários administrativos;
- credenciais referenciadas de forma segura;
- configurações das integrações;
- clientes identificados;
- consentimentos;
- regras comerciais;
- pedidos;
- pagamentos referenciados;
- registros de auditoria.

### 3.5 Firestore

Camada operacional em tempo real para:

- sessões ativas;
- estado atual do carrinho;
- contexto recente da conversa;
- projeção rápida do perfil 360°;
- estado de tarefas curtas e recuperações;
- atualização rápida de interfaces.

O Firestore não substituirá o histórico transacional do PostgreSQL nem o histórico analítico do BigQuery.

### 3.6 BigQuery

Camada analítica para:

- eventos históricos;
- funis;
- agregações por período;
- desempenho por produto;
- desempenho dos modelos;
- atribuição de recuperação;
- métricas do dashboard;
- análises posteriores.

### 3.7 Serviço de perfil 360°

O serviço combina:

- identidade e consentimentos do PostgreSQL;
- estado recente do Firestore;
- histórico e agregações do BigQuery;
- embeddings e preferências calculadas.

Ele entrega uma visão única para o dashboard e uma visão minimizada para os agentes de IA.

### 3.8 Camada de inteligência artificial

Será criada uma interface comum de provedor.

Entradas:

- intenção do cliente;
- catálogo disponível;
- preço e estoque atuais;
- regras comerciais;
- perfil permitido;
- histórico recente relevante.

Saídas:

- resposta conversacional;
- produtos recomendados;
- justificativa estruturada;
- ação sugerida;
- indicação do modelo usado;
- latência e consumo;
- alertas ou falhas.

Provedores iniciais:

- GPT-4o;
- Gemini.

Guardrails:

- não inventar dados do catálogo;
- não aplicar desconto fora das regras;
- não iniciar pagamento sem confirmação;
- não expor dados pessoais desnecessários;
- não executar ações sem autorização;
- registrar decisões relevantes.

### 3.9 ACP e UCP

Os protocolos serão implementados como adaptadores sobre os serviços internos do Boopay.

Eles deverão consultar:

- catálogo;
- disponibilidade;
- preço;
- perfil permitido;
- carrinho;
- checkout;
- status do pedido.

Essa separação permite evoluir a implementação sem acoplar o núcleo do produto à disponibilidade de uma superfície oficial.

### 3.10 Pagamentos

Fluxo:

1. O agente prepara o resumo da compra.
2. O cliente confirma.
3. O Boopay cria a tentativa de pagamento.
4. Stripe Connect ou Google Pay assume a etapa segura.
5. O provedor envia o resultado.
6. O webhook é validado.
7. O pedido é atualizado de forma idempotente.
8. Os dados analíticos são publicados.

Regras:

- não armazenar cartão;
- validar assinatura dos webhooks;
- usar chaves diferentes por ambiente;
- evitar cobranças duplicadas;
- manter trilha de auditoria;
- testar sucesso, falha, repetição e cancelamento.

### 3.11 WhatsApp

Fluxo:

1. A regra identifica abandono.
2. O consentimento é verificado.
3. O limite de frequência é consultado.
4. Uma mensagem baseada em template é criada.
5. O link recebe identificador de rastreamento.
6. Clique, retorno e compra são registrados.

### 3.12 Dashboard

O dashboard consumirá APIs próprias do Boopay. Métricas históricas deverão vir de agregações do BigQuery; estado operacional e alertas poderão usar Firestore e PostgreSQL.

## 4. Fluxo de atualização do perfil

1. Um evento chega com tenant_id e session_id.
2. O evento é validado e deduplicado.
3. O estado recente é atualizado no Firestore.
4. O evento é enviado ao BigQuery.
5. Quando o cliente é conhecido, o PostgreSQL mantém identidade e consentimentos.
6. Agregações atualizam interesses, recência, frequência e valor.
7. Embeddings são gerados ou atualizados quando necessário.
8. O serviço de perfil publica a nova projeção 360°.

## 5. Isolamento da loja

Mesmo com apenas uma loja ativa no MVP:

- tabelas e documentos relevantes terão tenant_id;
- consultas deverão filtrar pelo tenant;
- credenciais não serão compartilhadas;
- eventos sem tenant válido serão rejeitados;
- testes verificarão vazamento entre tenants fictícios.

## 6. Segurança e LGPD

Requisitos mínimos:

- consentimento registrado;
- minimização de dados;
- separação entre dados pessoais e analíticos quando possível;
- criptografia em trânsito;
- segredos fora do código;
- controle de acesso administrativo;
- logs de auditoria;
- exclusão do perfil mediante solicitação;
- política de retenção definida;
- nenhuma informação bruta de cartão armazenada.

## 7. Observabilidade

Cada fluxo crítico deverá registrar:

- correlation_id;
- tenant_id;
- componente;
- duração;
- resultado;
- erro sanitizado;
- tentativas;
- provedor externo;
- data e hora.

Alertas mínimos:

- integração sem sincronizar;
- falha repetida na coleta;
- aumento de erros da IA;
- webhook inválido;
- pagamento inconsistente;
- falha no envio do WhatsApp;
- atraso na atualização das métricas.

## 8. Ambientes

| Ambiente | Uso |
|---|---|
| Local | Desenvolvimento individual |
| Desenvolvimento | Integração contínua da equipe |
| Sandbox/Teste | Provedores externos e testes ponta a ponta |
| Demonstração | Ambiente estável para apresentação |
| Produção | Somente após homologação e decisão formal |
