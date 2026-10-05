# Boopay — Arquitetura e fluxos do MVP

Versão: 1.3
Data-base: 26 de agosto de 2026

## 1. Princípios de arquitetura

1. Um Checkout Core canônico para vários protocolos e plataformas, evitando produtos separados.
2. Fonte de verdade definida para cada tipo de dado.
3. Eventos padronizados desde o SDK até o dashboard.
4. GPT-4o e Gemini acessados por uma camada comum.
5. Agentes limitados por regras comerciais e de segurança.
6. Checkout sem redirecionamento, sempre com resumo e confirmação explícita do cliente.
7. tenant_id presente em todos os dados relevantes.
8. Observabilidade e auditoria desde o MVP.
9. Dados pessoais minimizados e protegidos.
10. Integrações externas substituíveis por adaptadores.
11. O e-commerce é a fonte autoritativa de preço, estoque e pedido.
12. O lojista é o Merchant of Record; o Boopay não armazena cartão.
13. GEO Readiness é uma camada de diagnóstico anterior à distribuição e ao checkout, sem acoplamento ao fluxo de pagamento.
14. Score GEO, elegibilidade de feed, recomendação e conversão são etapas diferentes e devem ser medidas separadamente.

## 2. Visão de alto nível

    Loja demonstrativa ──> GEO Readiness Audit da KeyCore
                                      │
                           score, evidências e achados
                                      v
                         GEO & Catalog Readiness Service
                         ├── URL ↔ produto/SKU
                         ├── completude e atualidade
                         ├── feed e elegibilidade
                         └── resultado versionado
                                      │
          catálogo/feed ──────────────┼───────────────┐
                                      v               v
    ChatGPT / app aprovado ──> Adaptador ACP ──┐   Dashboard
                                               ├──> Agentic Commerce Gateway
    Gemini / Modo IA ─────────> Adaptador UCP ─┘              │
                                                               v
                                                     Checkout Core canônico
                                                     ├── sessão e estados
                                                     ├── preço e entrega
                                                     ├── confirmação
                                                     ├── pagamento delegado
                                                     └── pedido e pós-compra
                                                               │
                WooCommerce <── Adaptador de commerce ─────────┤
                Shopify <────── Adaptador de commerce ─────────┤
                VTEX <───────── Adaptador de commerce ─────────┤
                                                               │
                Stripe / Google Pay <── Adaptador de pagamento ┘

    SDK / webhooks ──> Eventos ──> PostgreSQL / Firestore / BigQuery
                                            │
                        Perfil 360°, funil agêntico e Dashboard

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
- cotar carrinho, descontos, frete e impostos;
- criar ou atualizar carrinho;
- criar, consultar, cancelar ou estornar pedido quando suportado;
- sincronizar fulfillment e status pós-compra;
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
- descobrir e negociar versões e capacidades de protocolo;
- manter a correlação entre sessão externa, checkout canônico, pagamento e pedido.

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
- estado de processamentos assíncronos curtos;
- atualização rápida de interfaces.

O Firestore não substituirá o histórico transacional do PostgreSQL nem o histórico analítico do BigQuery.

### 3.6 BigQuery

Camada analítica para:

- eventos históricos;
- funis;
- agregações por período;
- desempenho por produto;
- desempenho dos modelos;
- volume e taxa de abandono;
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

Na superfície oficial, a recomendação é responsabilidade de ChatGPT ou Gemini a partir do catálogo disponibilizado. ACP e UCP são contratos de integração, não modelos de recomendação. A camada de IA própria é usada no simulador do Boopay e em experiências controladas, sempre consumindo os mesmos serviços canônicos.

### 3.9 GEO & Catalog Readiness Service

Responsável por integrar o diagnóstico da KeyCore à preparação comercial do catálogo, sem executar checkout ou alterar o site.

Fluxo:

1. o Boopay solicita ou importa uma auditoria para URLs autorizadas do tenant;
2. a ferramenta GEO da KeyCore devolve resultado versionado, score, categorias, evidências e achados;
3. o serviço relaciona cada URL de produto ao `product_id` e ao SKU canônico;
4. regras determinísticas verificam completude, atualidade, consistência, políticas e campos exigidos por cada feed;
5. adaptadores registram publicação, rejeição e elegibilidade de ACP e UCP/Merchant Center;
6. os eventos resultantes alimentam o funil analítico até recomendação, checkout e pedido.

Contrato mínimo de `GeoAuditResult`:

| Campo | Descrição |
|---|---|
| `geo_audit_id` | Identificador da auditoria |
| `tenant_id` | Loja auditada |
| `url` | Página avaliada |
| `page_type` | Inicial, categoria, produto ou outra classe |
| `product_id` | Produto relacionado, quando aplicável |
| `score_total` | Score consolidado de prontidão |
| `category_scores` | Pontuação por categoria de análise |
| `findings` | Achados com severidade e recomendação |
| `evidence` | Evidências que sustentam cada achado |
| `checked_at` | Data e hora da execução |
| `tool_version` | Versão das regras e agentes usados |

Contrato operacional de prontidão por produto:

| Campo | Descrição |
|---|---|
| `agent_readiness_status` | `ready`, `pending`, `blocked` ou `unknown` |
| `catalog_completeness` | Resultado das regras de campos obrigatórios |
| `structured_data_valid` | Consistência entre marcação e conteúdo visível |
| `policy_completeness` | Presença das políticas comerciais necessárias |
| `acp_feed_status` | Estado de geração/distribuição para ACP |
| `ucp_checkout_eligibility` | Elegibilidade informada pelo ecossistema Google |
| `last_price_sync` | Última sincronização de preço |
| `last_stock_sync` | Última sincronização de estoque |

Requisitos para transformar a ferramenta atual em uma integração de produto:

- API autenticada por tenant;
- persistência dos jobs e resultados;
- idempotência, fila, limites de uso e retentativas;
- callback, webhook ou SSE com estado final inequívoco;
- versionamento das regras, evidências e score;
- contrato que diferencie auditoria concluída, parcial e falha;
- isolamento SSRF e lista de destinos permitidos;
- autorização explícita antes de qualquer remediação futura.

No MVP, a integração é somente de leitura e cobre três páginas representativas da loja demonstrativa. O score não será usado como prova de ranking, citação ou recomendação.

### 3.10 ACP e UCP

Os protocolos serão implementados como adaptadores sobre o Agentic Commerce Gateway e o Checkout Core. Nenhuma regra de preço, estoque, entrega, pagamento ou pedido ficará presa ao formato de ACP ou UCP.

Eles deverão consultar:

- catálogo;
- disponibilidade;
- preço;
- perfil permitido;
- carrinho;
- checkout;
- status do pedido.

Responsabilidades dos adaptadores:

- converter versões, capacidades, recursos, erros e estados;
- preservar identificadores externos e `correlation_id`;
- validar assinatura, autenticação, timestamp e proteção contra repetição;
- aplicar idempotência na criação e conclusão da sessão;
- devolver erros recuperáveis que a superfície consiga explicar ao comprador;
- registrar a superfície e o protocolo para atribuição e auditoria.

Essa separação permite evoluir os protocolos sem acoplar o núcleo à disponibilidade de uma superfície oficial. Em 25 de agosto de 2026, UCP no Google exige aprovação antes da ativação; no ChatGPT, o fluxo geral está orientado à descoberta e ao checkout próprio do lojista, enquanto experiências totalmente nativas dependem de integração mais profunda.

### 3.11 Checkout Core

O Checkout Core representa uma compra em andamento independentemente da superfície, do protocolo e do e-commerce.

Contrato mínimo de `CheckoutSession`:

| Campo | Descrição |
|---|---|
| checkout_session_id | Identificador canônico do Boopay |
| tenant_id | Loja responsável pela venda |
| surface | ChatGPT, Gemini ou sandbox Boopay |
| protocol | ACP, UCP ou simulador |
| external_session_id | Identificador recebido da superfície |
| state | Estado atual da máquina de checkout |
| currency | Moeda da transação |
| items | SKUs, quantidades e valores autoritativos |
| buyer | Dados mínimos e consentidos do comprador |
| fulfillment | Endereço, opção e prazo de entrega |
| totals | Subtotal, descontos, frete, impostos e total |
| payment_handler | Provedor e tipo de credencial delegada |
| idempotency_key | Chave que impede conclusão duplicada |
| consent_at | Momento da confirmação explícita |
| expires_at | Expiração da sessão e da cotação |
| order_id | Pedido criado no e-commerce, quando concluído |

Máquina de estados principal:

    draft
      └──> requires_information
              └──> ready_for_confirmation
                      └──> confirmed
                              └──> payment_authorized
                                      └──> completed

    qualquer estado não final ──> failed | canceled | expired

Toda atualização que possa alterar total ou disponibilidade volta a exigir um resumo válido antes da confirmação. A conclusão é idempotente e o e-commerce permanece como fonte autoritativa do pedido.

### 3.12 Pagamentos

Fluxo:

1. O Checkout Core obtém o total autoritativo.
2. A superfície apresenta o resumo da compra.
3. O cliente confirma explicitamente.
4. A superfície, carteira ou PSP fornece uma credencial tokenizada e limitada à transação.
5. O adaptador de pagamento autoriza ou captura conforme a configuração do lojista.
6. O resultado e os webhooks são validados.
7. O pedido é criado ou atualizado de forma idempotente no e-commerce.
8. O status e os dados analíticos são publicados.

Regras:

- não armazenar cartão;
- validar assinatura dos webhooks;
- usar chaves diferentes por ambiente;
- evitar cobranças duplicadas;
- manter trilha de auditoria;
- testar sucesso, falha, repetição e cancelamento.
- validar que valor, moeda, lojista e escopo da credencial correspondem à sessão confirmada;
- não registrar a credencial sensível em logs;
- expirar a autorização quando a sessão for cancelada ou expirada.

### 3.13 Análise de abandono

Fluxo:

1. A regra identifica abandono.
2. O evento e o estado do carrinho são normalizados.
3. O dado analítico é enviado ao BigQuery.
4. O dashboard apresenta volume e taxa de abandono.

Não haverá integração de mensageria para recuperação ativa. O WhatsApp foi retirado do produto na reunião de 24 de agosto de 2026 e não faz parte do backlog.

### 3.14 Dashboard

O dashboard consumirá APIs próprias do Boopay. Métricas históricas deverão vir de agregações do BigQuery; estado operacional e alertas poderão usar Firestore e PostgreSQL.

Além das métricas já definidas, o dashboard deverá apresentar:

- score GEO, categorias, evidências e achados prioritários da loja demonstrativa;
- produtos prontos, pendentes e bloqueados;
- publicação e elegibilidade por feed/superfície;
- recomendação observada pela superfície oficial ou identificada como simulada;
- sessões iniciadas, prontas para confirmação, confirmadas, concluídas, expiradas e falhas;
- GMV agêntico, conversão e receita atribuída por superfície e protocolo.

O painel manterá as etapas separadas para não sugerir que melhoria no score causou diretamente uma recomendação ou uma venda.

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
- confirmação explícita e versão dos termos auditáveis;
- validação de assinatura e proteção contra replay nas chamadas agente-a-agente;
- credenciais de pagamento limitadas por lojista, valor, moeda, finalidade e validade quando o provedor oferecer esses controles;
- nenhuma conclusão se preço, estoque ou total tiver mudado após a confirmação.

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
- sessão presa em estado intermediário;
- divergência entre total confirmado, pagamento e pedido;
- aumento de rejeições por assinatura, replay ou idempotência;
- atraso ou divergência na métrica de abandono;
- atraso na atualização das métricas.
- falha ou auditoria GEO presa em estado intermediário;
- resultado GEO sem versão ou sem evidência correspondente;
- página de produto sem relação válida com SKU;
- feed rejeitado ou produto que perdeu elegibilidade;
- divergência entre recomendação observada, checkout e atribuição do pedido.

## 8. Ambientes

| Ambiente | Uso |
|---|---|
| Local | Desenvolvimento individual |
| Desenvolvimento | Integração contínua da equipe |
| Sandbox/Teste | Provedores externos e testes ponta a ponta |
| Demonstração | Ambiente estável para apresentação |
| Produção | Somente após homologação e decisão formal |
