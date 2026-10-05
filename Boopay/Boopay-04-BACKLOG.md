# Boopay — Backlog pós-MVP

Versão: 1.4
Data-base: 8 de setembro de 2026

Atualização 1.4: inclusão da proposta WebMCP na seção 12.1, após pesquisa de viabilidade.

## 1. Objetivo

Este backlog registra capacidades importantes que não fazem parte do compromisso principal do MVP até dezembro de 2026.

Os itens não devem entrar silenciosamente no MVP. Qualquer antecipação exige análise de impacto e uma troca explícita de escopo.

## 2. Prioridades

- P1: evolução natural logo após validar o MVP.
- P2: importante para operação comercial e escala.
- P3: otimização ou expansão posterior.
- Externo: depende de aprovação, parceria ou disponibilidade de terceiros.

## 3. CDP e rastreamento avançado

| Prioridade | Item | Condição para iniciar |
|---|---|---|
| P1 | CDP completo | Eventos básicos e perfil 360° validados |
| P1 | Novos eventos comportamentais | Taxonomia aprovada |
| P1 | Identity resolution entre dispositivos | Estratégia de consentimento e identidade aprovada |
| P1 | Audiências e segmentos acionáveis | Dados suficientes e regras de uso definidas |
| P2 | Rastreamento omnichannel | Inclusão de novos canais |
| P2 | Atribuição multitoque | Volume e fontes de aquisição suficientes |
| P2 | Jornada completa entre sessões | Identidade persistente validada |
| P2 | Automação comportamental | Governança de contatos definida |
| P3 | Modelos preditivos de propensão | Base histórica suficiente |
| P3 | Detecção avançada de intenção | Eventos e experimentos maduros |

## 4. ACP, UCP e superfícies oficiais

| Prioridade | Item | Dependência |
|---|---|---|
| Externo | Publicação na superfície oficial do ChatGPT | Programa, aprovação e homologação da OpenAI |
| Externo | Publicação no ecossistema oficial do Google | Programa, região, aprovação e homologação do Google |
| Externo | Aplicativo ou experiência nativa profunda no ChatGPT | Aprovação do app, capacidades disponíveis e política vigente |
| Externo | Checkout direto no Gemini e Modo IA | Merchant Center, Google Pay, região elegível, waitlist e aprovação |
| Externo | Certificações ou revisões adicionais | Regras vigentes dos parceiros |
| P1 | Atualização para novas versões dos protocolos | Publicação das especificações |
| P2 | Monitoramento de compatibilidade | Operação recorrente |

O backlog externo trata de **ativação nas superfícies**, não da implementação do Checkout Core. O sandbox multiprotocolo e o checkout sem redirecionamento na experiência controlada permanecem no MVP.

## 5. Evoluções do checkout conversacional

O fluxo básico de um produto, confirmação explícita, pagamento sandbox e criação do pedido permanece no MVP. Evoluções:

| Prioridade | Item |
|---|---|
| P1 | Carrinho com produtos de múltiplos vendedores ou lojas |
| P1 | Rastreamento, cancelamento, troca e devolução conversacionais completos |
| P1 | Account linking e fidelidade |
| P2 | Assinaturas e recorrência |
| P2 | Produtos customizáveis, bundles e gift cards |
| P2 | B2B, cotação e aprovação em múltiplas etapas |
| P2 | Novos payment handlers e roteamento entre PSPs |
| P3 | Compras delegadas com limites pré-autorizados, após governança específica |
| P3 | Negociação automatizada dentro de limites comerciais |

## 6. Pagamentos em produção

Pagamentos reais são um objetivo condicional, não uma promessa automática do MVP.

Checklist para promoção:

- revisão de segurança;
- credenciais de produção;
- contas comerciais aprovadas;
- conciliação validada;
- estorno validado;
- idempotência validada;
- política de incidentes;
- termos e privacidade;
- suporte operacional;
- alertas;
- responsáveis definidos.

Evoluções posteriores:

| Prioridade | Item |
|---|---|
| P1 | Pagamentos reais após homologação |
| P1 | Conciliação operacional |
| P1 | Gestão de estornos |
| P2 | Antifraude adicional |
| P2 | Múltiplos processadores |
| P2 | Split e repasse avançado |
| P3 | Otimização de aprovação por rota |

## 7. Multilojas e comercialização SaaS

| Prioridade | Item |
|---|---|
| P1 | Onboarding autônomo de nova loja |
| P1 | Várias lojas por conta |
| P1 | Isolamento e testes completos de multitenancy |
| P1 | Usuários, equipes e permissões |
| P1 | Planos e limites |
| P1 | Cobrança recorrente |
| P2 | Trials, cupons e upgrades |
| P2 | Medição de uso por tenant |
| P2 | Portal de cobrança |
| P2 | White-label |
| P3 | Marketplace de extensões |

## 8. Dashboard e analytics

O dashboard completo definido para o MVP permanece em escopo. O backlog contém capacidades de personalização e inteligência adicionais:

| Prioridade | Item |
|---|---|
| P1 | Relatórios agendados |
| P1 | Alertas configuráveis |
| P2 | Construtor de relatórios |
| P2 | Dashboards personalizados por usuário |
| P2 | Comparação entre lojas |
| P2 | Testes A/B |
| P2 | Atribuição avançada |
| P2 | Comparação de conversão entre ACP, UCP e novas superfícies |
| P3 | Forecast de receita |
| P3 | Detecção automática de anomalias |

## 9. Perfil 360° e inteligência

O perfil 360° definido no escopo permanece no MVP. Evoluções:

| Prioridade | Item |
|---|---|
| P1 | Unificação avançada entre dispositivos |
| P1 | Política configurável de retenção |
| P2 | Propensão de compra |
| P2 | Risco de abandono |
| P2 | Lifetime Value preditivo |
| P2 | Next Best Action |
| P2 | Atualização de embeddings em grande escala |
| P3 | Modelos próprios |
| P3 | Aprendizado por segmento vertical |

## 10. Novos canais

A integração com WhatsApp foi retirada do produto na reunião de 24 de agosto de 2026. Ela não é item deste backlog e só poderá ser reconsiderada por uma nova decisão formal de produto.

| Prioridade | Item |
|---|---|
| P1 | Definição do próximo canal com base em pesquisa e métricas |
| P1 | Central de preferências de comunicação |
| P2 | Atendimento humano integrado |
| P2 | E-mail transacional e de relacionamento |
| P2 | Instagram e canais conversacionais aprovados |
| P3 | Marketplaces verticais |

## 11. Plataforma, escala e operação

| Prioridade | Item |
|---|---|
| P1 | SLAs e SLOs formais |
| P1 | Backups e testes de restauração |
| P1 | Gestão completa de incidentes |
| P1 | Ambientes segregados por tenant enterprise |
| P2 | Autoscaling |
| P2 | Filas e processamento distribuído |
| P2 | Disaster recovery regional |
| P2 | Feature flags por plano |
| P3 | Expansão internacional |

## 12. Evolução GEO e distribuição agêntica

O MVP limita a auditoria a três páginas representativas, mantém recomendações somente de leitura e mede o funil da loja demonstrativa. Evoluções:

| Prioridade | Item | Condição para iniciar |
|---|---|---|
| P1 | Auditoria recorrente de todas as páginas relevantes | API persistente, filas e limites operacionais definidos |
| P1 | Histórico de score, evidências e regressões por URL | Resultado versionado e modelo analítico validados |
| P1 | Monitoramento de rejeição e elegibilidade por feed | Integrações ACP/UCP estáveis |
| P1 | Recomendações de correção priorizadas por impacto comercial | Funil do MVP reconciliado |
| P2 | Aplicação assistida de correções com aprovação, versão e rollback | Conectores de conteúdo e governança aprovados |
| P2 | Monitoramento de citações e recomendações por conjunto de prompts | Método, fontes e limites de coleta documentados |
| P2 | Share of answer e comparação competitiva | Amostra e metodologia estatística aprovadas |
| P2 | Experimentos para relacionar correção, elegibilidade e conversão | Volume suficiente e grupo de controle |
| P3 | Remediação automática dentro de políticas predefinidas | Segurança, revisão e rollback comprovados |
| P3 | Otimização por vertical de e-commerce | Dados suficientes por segmento |

Nenhuma evolução deverá prometer controle sobre ranking ou recomendação das plataformas de IA. O valor comercial será medido por ganho de prontidão, cobertura elegível e receita atribuída.

### 12.1. WebMCP na loja conectada ao Boopay

**Status:** Backlog — proposta de prova de conceito (PoC), ainda não implementada.
**Prioridade:** P1 para investigação após validar o MVP; expansão comercial condicionada ao piloto.
**Responsável:** a definir antes da execução.
**Estimativa preliminar:** 2–4 dias de desenvolvimento para a PoC somente de leitura, assumindo uma loja WooCommerce de teste disponível e consultas comerciais utilizáveis. É uma estimativa de planejamento, a revisar após inspeção do ambiente; não inclui construir o Checkout Core nem homologar pagamentos.

**Problema e público.** Um comprador assistido por agente precisa consultar produtos e disponibilidade com dados estruturados enquanto navega na loja. A hipótese é reduzir erros e etapas de interação e permitir ao lojista medir esse uso. O ganho de conversão deverá ser demonstrado pelo piloto.

**Pesquisa verificada em 08/09/2026.** WebMCP permite que páginas ofereçam ações JavaScript a agentes. A especificação de 04/09/2026 é um rascunho do Web Machine Learning Community Group, com editores da Microsoft e Google; ainda não é um padrão W3C. [Especificação WebMCP](https://webmachinelearning.github.io/webmcp/)

A OpenAI oferece suporte como Site tools no navegador integrado, sujeito ao rollout e ao cliente elegível. O subconjunto documentado exige registro JavaScript na página principal; formulários declarativos e ferramentas dentro de iframes não são suportados nesse cliente. [OpenAI — Site tools](https://learn.chatgpt.com/docs/webmcp)

O Chrome documenta um origin trial desde a versão 149. A API atual usa `document.modelContext.registerTool`; a PoC deverá verificar a versão efetivamente disponível no navegador e a descoberta pelo agente. [Chrome — disponibilidade](https://developer.chrome.com/docs/ai/webmcp/) e [API imperativa](https://developer.chrome.com/docs/ai/webmcp/imperative-api)

**Encaixe no produto.** Canal complementar para navegação assistida na loja aberta. Preserva a jornada principal de checkout conversacional sem abrir o storefront, descrita no [índice do MVP](_INDICE.md). WebMCP não equivale à publicação oficial no ChatGPT, não garante recomendação em IA e não substitui o núcleo comercial ou os adaptadores ACP/UCP.

**Escopo por etapa** — nomes de ferramentas abaixo são propostas:

| Etapa | Entrega | Dependência |
|---|---|---|
| PoC inicial | `boopay_search_products` e `boopay_get_product`: consulta de produtos, variações, preço e disponibilidade | Loja WooCommerce demonstrativa; consultas comerciais com dados autoritativos |
| Evolução após a PoC | Consultar e atualizar carrinho com resultado visível ao comprador | Serviço de carrinho, sessão, autorização e proteção contra repetição validados |
| Evolução posterior | Preparar checkout sandbox e apresentar resumo para confirmação explícita | Checkout Core e integração sandbox funcionais |

**Base técnica e dependências.** O [plugin WooCommerce](../README.md) já documenta sincronização de catálogo e tracking. Seu [serializador de produtos](https://github.com/ThiagoVenturaV/pluginboopay/blob/fb87b6f155e9221be802e12211038655ef7fe41e/boopay-woocommerce/src/Sync/ProductSerializer.php) é uma referência para os campos comerciais. O [gateway local](../README.md) é de ingestão/revisão e não deve ser confundido com uma API de compra. O adaptador WebMCP deverá chamar serviços comerciais apropriados; os contratos do [Checkout Core planejado](Boopay-02-ARQUITETURA-E-FLUXOS.md) orientam as etapas posteriores.

**Critérios de aceite da PoC:**

1. Um agente compatível descobre e executa as duas ferramentas na página principal da loja; registrar navegador, versão, cliente e condições de ativação.
2. Resultados coincidem com a fonte autoritativa para produto simples, variação, item indisponível, busca sem resultado e alteração de preço/estoque; dados desatualizados são identificados ou revalidados.
3. Sem suporte WebMCP, com ferramentas desativadas ou após navegação/reload, a loja convencional continua funcional; o ciclo de registro não deixa ferramentas duplicadas ou com estado antigo.
4. A PoC não altera carrinho nem realiza pedidos. Parâmetros inválidos e acessos fora da loja/sessão autorizada são recusados pelos serviços responsáveis.
5. Segredos HMAC/tokens administrativos permanecem no servidor; respostas contêm somente os dados comerciais necessários, sem perfis ou pedidos de outros clientes.
6. Registrar sucesso, falha e duração das chamadas, com identificação de WebMCP e correlação quando disponível. Comparar consultas equivalentes com a navegação convencional, sem atribuir receita nem identificar o provedor de IA por suposição.

**Impactos e promoção.** Prever manutenção diante de mudanças da API, validação de entradas, limites de uso e tratamento de conteúdo de catálogo como dado não confiável. Para futuras mutações: conferir permissões no servidor, revalidar preço/estoque, impedir duplicidade e manter confirmação explícita de compra. Custos de desenvolvimento, hospedagem e observabilidade devem entrar na estimativa; benefícios comerciais continuam sendo hipótese.

**Decisão de escopo.** Item pós-MVP, sem data de execução assumida. Antecipação exige responsável e troca explícita de escopo conforme a seção 13. Ao concluir a PoC, decidir entre descartar, aguardar maturidade ou estimar um piloto de carrinho/checkout com evidências reais.

## 13. Regra de entrada no roadmap

Um item do backlog só entra em execução quando possuir:

1. problema e público definidos;
2. prioridade;
3. responsável;
4. critério de aceite;
5. dependências;
6. estimativa;
7. impacto sobre segurança, dados e custos;
8. decisão explícita sobre o que será adiado caso concorra com o MVP.
