# Boopay — Dicionário técnico

Versão: 1.3\
Data-base: 26 de agosto de 2026

Este dicionário explica em linguagem direta os termos usados na documentação e no desenvolvimento do Boopay. As definições descrevem o uso previsto no projeto.

## 1. Produto e planejamento

| Termo | Explicação |
|---|---|
| ACP — Agentic Commerce Protocol | Protocolo aberto de comércio agêntico usado para conectar agentes e sistemas comerciais. No Boopay, é um adaptador para descoberta, sessão de checkout e pedido; não é o modelo que recomenda produtos e sua implementação não garante checkout nativo no ChatGPT. |
| AdCore | Nome comercial associado ao contexto original do desafio. A relação exata entre AdCore e Boopay deve ser tratada como decisão de produto, não como termo técnico genérico. |
| Agentic Commerce | Modelo de comércio no qual agentes de IA ajudam a descobrir produtos, recomendar opções e conduzir etapas da compra. A autonomia continua limitada por regras e confirmação do cliente. |
| Catálogo agêntico | Representação de produtos preparada para consumo por agentes e canais de IA, com identificadores, descrições, imagens, preço, estoque, políticas e capacidades comerciais atualizados. |
| GEO — Generative Engine Optimization | Prática de melhorar a capacidade de mecanismos generativos entenderem, recuperarem e citarem conteúdo. No Boopay, GEO é uma camada de prontidão para descoberta e não uma promessa de ranking, recomendação ou venda. |
| GEO Readiness Audit | Ferramenta da KeyCore que avalia evidências técnicas, editoriais e semânticas de uma página. Seu resultado alimenta a preparação do catálogo e o dashboard do Boopay, mas permanece separado do Checkout Core. |
| Backlog | Lista organizada de funcionalidades, melhorias e trabalhos que serão considerados futuramente e não fazem parte do compromisso atual. |
| Critério de aceite | Condição objetiva que precisa ser atendida para uma entrega ser considerada aprovada. |
| Definition of Done | Conjunto de condições gerais para considerar um item concluído, incluindo implementação, testes, documentação e validação. |
| Dependência externa | Condição que não está sob controle exclusivo da equipe, como aprovação de um parceiro. |
| Enterprise | Nível de operação voltado a organizações maiores, normalmente com exigências elevadas de escala, segurança, suporte e governança. |
| Escopo | Conjunto de entregas e limites assumidos pelo projeto. |
| Fatia vertical | Recorte que implementa uma jornada completa atravessando interface, API, dados e integrações. |
| Homologação | Processo de verificação e aprovação necessário antes de liberar uma integração ou operação em produção. |
| Marco | Resultado verificável que demonstra o avanço de uma fase do projeto. |
| Middleware | Camada intermediária que conecta sistemas e aplica regras. O Boopay atua entre lojas, dados, IA, pagamentos e canais. |
| MVP inicial ou MVP 0 | Fundação descrita no PRD v1.0 recebido em 25/08/2026: WooCommerce, catálogo, busca, tracking e painel operacional. Precede o MVP conversacional de dezembro. |
| MVP — Minimum Viable Product | Menor versão capaz de demonstrar valor real e validar as principais hipóteses. Neste projeto, é completa dentro do recorte de uma loja demonstrativa. |
| Produção | Ambiente real usado por clientes e sujeito a dados, pagamentos e responsabilidades operacionais reais. |
| Protótipo | Versão criada para validar funcionamento ou conceito, ainda sem todas as garantias de produção. |
| Roadmap | Plano temporal que organiza entregas e marcos. |
| Sandbox | Ambiente controlado que imita uma integração real sem movimentar dinheiro real ou afetar a operação de produção. |
| Trade-off | Escolha que ganha uma vantagem ao aceitar uma limitação. Exemplo: implementar três integrações privadas e adiar a publicação pública. |
| UCP — Universal Commerce Protocol | Padrão aberto e modular para descoberta de capacidades, checkout, identidade, pedidos e pagamentos por diferentes transportes. No Boopay, é um adaptador do Checkout Core. O uso nas superfícies do Google depende de Merchant Center, região, aprovação e homologação. |

## 2. Arquitetura e desenvolvimento

| Termo | Explicação |
|---|---|
| Adaptador | Componente que traduz a linguagem de um sistema externo para o modelo interno do Boopay. |
| Agentic Catalog Readiness | Estado operacional que informa se um produto possui dados atuais, políticas, identificadores e campos suficientes para ser distribuído a um canal agêntico. |
| Agentic Commerce Gateway | Porta de entrada que recebe chamadas de ACP, UCP ou simuladores, aplica segurança e converte tudo para o contrato canônico do Boopay. |
| Ambiente | Instância separada do sistema para uma finalidade, como desenvolvimento, teste, demonstração ou produção. |
| API — Application Programming Interface | Contrato que permite que sistemas troquem dados e executem operações de forma programada. |
| Aplicativo privado ou customizado | Integração instalada diretamente em uma loja específica, sem publicação pública no marketplace da plataforma. |
| Arquitetura | Organização dos componentes, responsabilidades e fluxos de um sistema. |
| Autenticação | Verificação de quem é o usuário ou sistema que está tentando acessar o Boopay. |
| Autorização | Verificação do que um usuário ou sistema autenticado tem permissão para fazer. |
| Container | Unidade empacotada que contém uma aplicação e suas dependências. |
| Correlation ID | Identificador que conecta logs e etapas pertencentes à mesma jornada. |
| Credencial | Informação usada por um sistema para provar sua identidade, como chave de API, token ou certificado. |
| Docker | Tecnologia que empacota aplicações e dependências em containers reproduzíveis. |
| Endpoint | Endereço específico de uma API usado para consultar ou alterar uma informação. |
| Feature flag | Controle que ativa ou desativa uma funcionalidade sem remover o código. |
| Framework | Estrutura de software que fornece padrões e recursos para construir aplicações. |
| HTTP | Protocolo usado na comunicação entre navegadores, APIs e serviços web. |
| HTTPS | Versão protegida do HTTP, com criptografia durante a transmissão. |
| Idempotência | Propriedade que garante que repetir a mesma operação não gere efeitos duplicados. É essencial para eventos, pedidos e pagamentos. |
| Integração contínua | Prática de combinar e testar mudanças de código com frequência. |
| JavaScript | Linguagem usada no navegador e em servidores. O SDK de coleta será executado nas páginas web. |
| Next.js | Framework baseado em React para construir aplicações web com recursos de servidor e cliente. |
| Node.js | Ambiente que permite executar JavaScript no servidor. |
| Orquestração | Coordenação de vários serviços e etapas para completar um fluxo. |
| Payload | Conteúdo enviado em uma requisição, evento ou mensagem. |
| Python | Linguagem que pode ser usada em processamento de dados, serviços e automações. |
| React | Biblioteca para construção de interfaces web. |
| REST | Estilo comum de construção de APIs usando recursos, URLs e métodos HTTP. |
| Retry | Nova tentativa automática após uma falha temporária. |
| Schema | Definição da estrutura, campos e tipos de um dado. |
| SDK — Software Development Kit | Conjunto de código e instruções que facilita integrar uma aplicação. O SDK do Boopay coleta eventos no site. |
| Webhook | Mensagem automática enviada por um sistema a outro quando algo acontece, como pagamento aprovado ou pedido criado. |

## 3. E-commerce e integrações

| Termo | Explicação |
|---|---|
| Carrinho | Conjunto de produtos que um cliente separou antes de finalizar uma compra. |
| Carrinho abandonado | Carrinho que não virou pedido dentro da regra de tempo definida pelo negócio. |
| Catálogo | Conjunto de produtos, variações, preços, imagens, descrições e disponibilidade da loja. |
| Checkout | Etapa em que o cliente revisa e confirma itens, dados necessários, entrega, valor final e pagamento. |
| Checkout conversacional invisível | Checkout concluído dentro do contexto da conversa, sem abrir o storefront. “Invisível” se refere à ausência de redirecionamento, nunca à ausência de resumo, consentimento ou confirmação. |
| Checkout Core | Núcleo canônico do Boopay que controla sessão, cotação, entrega, confirmação, pagamento e pedido sem depender de ACP, UCP ou de um e-commerce específico. |
| Checkout Session | Registro de uma tentativa de compra, com itens, totais, dados necessários, estado, expiração, confirmação, pagamento e pedido relacionado. |
| Development store | Loja de desenvolvimento usada para criar e testar integrações sem operar como loja comercial normal. |
| E-commerce | Sistema de venda de produtos ou serviços pela internet. |
| Estoque | Quantidade disponível de um produto ou SKU. |
| Integração nativa | Integração construída especificamente para uma plataforma, usando suas APIs, eventos e mecanismos de instalação. |
| Marketplace de aplicativos | Canal oficial onde extensões de uma plataforma podem ser publicadas e instaladas por clientes. |
| Order ID | Identificador único de um pedido. |
| Pedido | Registro comercial criado quando o cliente confirma uma compra. |
| Plugin | Extensão instalada em outra plataforma para adicionar integração ou comportamento. |
| Produto | Item comercial apresentado e vendido pela loja. |
| Shopify | Plataforma de comércio eletrônico integrada ao Boopay por aplicativo e APIs. |
| SKU — Stock Keeping Unit | Identificador de uma variação comercial específica, como uma combinação de tamanho e cor. |
| VTEX | Plataforma de comércio digital integrada ao Boopay por APIs e mecanismos privados disponíveis. |
| WooCommerce | Plataforma de e-commerce baseada em WordPress integrada ao Boopay por plugin e APIs. |

## 4. Coleta, eventos e CDP

| Termo | Explicação |
|---|---|
| add_to_cart | Evento que registra a adição de um produto ao carrinho. |
| Atribuição | Regra usada para decidir qual canal, mensagem ou interação recebeu crédito por uma conversão. |
| CDP — Customer Data Platform | Plataforma que unifica dados de clientes de várias fontes, resolve identidades, cria segmentos e disponibiliza dados para análise e ativação. Um CDP completo está no backlog. |
| Customer ID | Identificador interno de um cliente conhecido. |
| Deduplicação | Processo que impede o mesmo evento ou registro de ser contado mais de uma vez. |
| Event ID | Identificador único de um evento. |
| Evento | Registro estruturado de algo que ocorreu, como uma visualização ou adição ao carrinho. |
| exit_intent | Evento ou sinal de que o visitante provavelmente está prestes a sair da página. |
| Identity resolution | Processo de decidir se diferentes sessões, dispositivos e identificadores pertencem à mesma pessoa. |
| occurred_at | Data e hora, geralmente em UTC, em que o evento realmente aconteceu. |
| Omnichannel | Experiência integrada entre múltiplos canais, como site, e-mail, aplicativo e loja física. |
| properties | Campos adicionais específicos de um evento. |
| Rastreamento ou tracking | Coleta estruturada de eventos para entender a jornada do usuário. |
| Session ID | Identificador de uma sessão de navegação. |
| source | Campo que indica a origem técnica ou comercial do evento. |
| Taxonomia de eventos | Lista padronizada de nomes, significados e propriedades dos eventos capturados. |
| UTC | Padrão de tempo recomendado para armazenar datas e horas de sistemas distribuídos. |
| view | Evento que registra a visualização de uma página ou produto. |

## 5. Dados e armazenamento

| Termo | Explicação |
|---|---|
| Armazém analítico | Banco otimizado para análise de grandes volumes e consultas históricas. No Boopay, esse papel pertence ao BigQuery. |
| Batch | Processamento realizado em lotes ou intervalos, em vez de imediatamente após cada evento. |
| BigQuery | Serviço analítico do Google Cloud usado para eventos históricos, agregações, funis e métricas do dashboard. |
| Banco de documentos | Banco que organiza informações como documentos flexíveis, em vez de linhas relacionais tradicionais. |
| Banco relacional | Banco que organiza dados em tabelas relacionadas e aplica regras de consistência. |
| Data pipeline | Sequência de etapas que recebe, valida, transforma, armazena e disponibiliza dados. |
| Firestore | Banco de documentos do Google Cloud usado para estado recente de sessão, carrinho, conversa e projeção do perfil. |
| Fonte de verdade | Sistema considerado autoritativo para determinado dado, evitando versões conflitantes. |
| Google Cloud | Plataforma de serviços de nuvem do Google, onde estão BigQuery e Firestore. |
| Modelo canônico | Formato interno comum usado para representar informações vindas de plataformas diferentes. |
| Normalização | Conversão de dados diferentes para um formato comum. |
| PostgreSQL | Banco relacional usado como fonte transacional de configurações, identidade, consentimentos, pedidos e auditoria. |
| Processamento em tempo real | Atualização realizada logo após um evento, com baixa espera percebida. |
| Projeção | Representação derivada e otimizada de dados cuja fonte principal está em outro lugar. |
| Query | Consulta realizada em um banco de dados. |
| Transação de banco | Conjunto de alterações que deve ser concluído de forma consistente ou desfeito em caso de falha. |

## 6. Inteligência artificial

| Termo | Explicação |
|---|---|
| Agente de IA | Software que usa IA para interpretar uma intenção, consultar informações, escolher uma ação permitida e responder. |
| Alucinação | Resposta em que a IA apresenta como verdadeiro algo que não está sustentado pelos dados disponíveis. |
| Answerability | Capacidade de uma página responder com clareza às perguntas que uma pessoa ou agente pode fazer sobre uma entidade, produto, serviço ou política. É uma categoria de prontidão, não uma garantia de citação. |
| Camada de provedores | Interface comum que permite usar GPT-4o ou Gemini sem alterar o restante do sistema. |
| Contexto da IA | Informações fornecidas ao modelo, como catálogo, perfil, regras e histórico recente. |
| Embedding | Representação numérica de um texto, produto ou perfil que permite medir similaridade. |
| Gemini | Família de modelos de IA do Google e um dos provedores do Boopay. |
| GPT-4o | Modelo da OpenAI previsto como um dos provedores de IA do Boopay. |
| Guardrail | Regra técnica ou de negócio que limita o que a IA pode responder ou executar. |
| IA — Inteligência Artificial | Área de sistemas capazes de realizar tarefas como interpretação de linguagem, recomendação e geração de conteúdo. |
| Inferência | Execução de um modelo de IA para produzir uma resposta ou previsão. |
| Latência | Tempo entre uma solicitação e a resposta. |
| LLM — Large Language Model | Modelo de linguagem de grande porte, como GPT-4o e Gemini. |
| `llms.txt` | Arquivo proposto para orientar sistemas de IA sobre conteúdo de um site. Pode funcionar como sinal auxiliar para algumas ferramentas, mas não é requisito universal nem garantia de uso por mecanismos generativos. |
| OpenAI | Empresa provedora de modelos e serviços de IA, incluindo o GPT-4o. |
| Prompt | Instrução e contexto enviados a um modelo de IA. |
| Provedor de IA | Empresa ou serviço que disponibiliza um modelo de IA por API. |
| RAG — Retrieval-Augmented Generation | Técnica que recupera informações relevantes antes de a IA gerar a resposta. Ajuda o agente a usar catálogo e regras atuais. |
| Recomendação | Sugestão de produto ou ação baseada no contexto, catálogo e regras. |
| Resposta estruturada | Saída da IA em formato previsível e validável, em vez de apenas texto livre. |
| Similaridade semântica | Proximidade de significado calculada entre embeddings. |
| Token | Unidade usada pelos modelos de linguagem para processar texto e calcular parte do consumo. |
| Vetor | Lista de números que representa características de um conteúdo. Embeddings são vetores. |
| Vector search | Busca que encontra itens com vetores semelhantes, útil para produtos e preferências relacionados. |

## 7. Protocolos e superfícies

| Termo | Explicação |
|---|---|
| Contrato | Definição de campos, operações, respostas e erros esperados em uma integração. |
| Capability ou capacidade | Função que um participante declara suportar, como checkout, fulfillment, identidade ou atualização de pedido. |
| Descoberta de capacidades | Negociação pela qual agente e lojista identificam versões, operações, extensões e payment handlers compatíveis antes do fluxo. |
| Modo IA do Google | Experiência de pesquisa com IA do Google. A disponibilidade de integrações comerciais oficiais depende das regras e aprovações do ecossistema. |
| Parceiro aprovado | Empresa autorizada por um provedor a usar uma capacidade restrita ou participar de um programa. |
| Protocolo | Conjunto de regras e formatos que sistemas seguem para se comunicar. |
| Publicação oficial | Disponibilização de uma integração em uma superfície controlada por terceiro após aprovação. |
| Superfície oficial | Produto ou interface de terceiro onde a experiência aparece para usuários, como ChatGPT ou uma experiência do Google. |
| Surface ou superfície | Canal em que a jornada aparece ao comprador, como ChatGPT, Gemini ou o sandbox conversacional do Boopay. |

## 8. Pagamentos

| Termo | Explicação |
|---|---|
| Adquirente | Instituição que conecta o comerciante às redes de pagamento e participa do processamento da transação. |
| Chargeback | Contestação de uma cobrança pelo titular, podendo resultar na reversão do valor. |
| Conciliação | Comparação entre pedidos, pagamentos, estornos e repasses para verificar se os valores correspondem. |
| Estorno | Devolução de um pagamento após a cobrança. |
| Gateway de pagamento | Camada que conecta a experiência de checkout ao processamento do pagamento. |
| Google Pay | Carteira digital do Google usada para apresentar um meio de pagamento. No MVP será usada em teste; o processamento financeiro depende da infraestrutura associada. |
| Pagamento em sandbox | Simulação de pagamento que testa o fluxo sem movimentar dinheiro real. |
| Payment handler | Contrato que informa como uma credencial de pagamento será obtida, entregue e processada no checkout agêntico. |
| PCI DSS | Padrão de segurança para ambientes que tratam dados de cartões. Não armazenar cartão reduz o escopo, mas não elimina toda responsabilidade. |
| PSP — Payment Service Provider | Provedor que ajuda a processar pagamentos entre cliente, loja e instituições financeiras. |
| Split de pagamento | Divisão automática do valor de uma transação entre diferentes recebedores. |
| Stripe | Provedor de infraestrutura de pagamentos. |
| Stripe Connect | Produto da Stripe voltado a plataformas que conectam e gerenciam pagamentos de contas ou vendedores conectados. |
| Merchant of Record | Lojista legalmente responsável pela venda, cobrança, impostos, atendimento e obrigações comerciais. No desenho do Boopay, essa função permanece com a loja. |
| Token ou credencial de pagamento delegada | Identificador sensível emitido por carteira, superfície ou PSP para uma finalidade limitada. Deve ser restrito, quando possível, por lojista, valor, moeda, validade e uso. |
| Tokenização de pagamento | Substituição de dados sensíveis por um identificador seguro controlado pelo provedor. |
| Transação financeira | Operação de cobrança, autorização, estorno ou repasse. |
| Wallet ou carteira digital | Aplicação que guarda ou apresenta meios de pagamento tokenizados, como o Google Pay. |

## 9. Dashboard, métricas e perfil 360°

| Termo | Explicação |
|---|---|
| Analytics | Processo de organizar e analisar dados para entender comportamento, desempenho e resultados. |
| Abandono de carrinho | Situação em que um carrinho recebe itens, mas não se transforma em compra no intervalo definido pelo produto. |
| Conversão | Ação final desejada. No fluxo principal, normalmente significa uma compra concluída. |
| Dashboard | Interface que apresenta métricas, funis, resultados e saúde operacional. |
| Exposição | Quantidade de vezes que um produto, oferta ou recomendação foi apresentada. |
| Exportação | Geração de um arquivo com dados selecionados para uso fora do dashboard. |
| Funil | Sequência de etapas usada para medir quantas pessoas avançam de exposição até compra. |
| Funil de receita agêntica | Sequência `auditado → pronto → distribuído/elegível → recomendado → checkout → pedido`, usada para conectar prontidão GEO ao resultado comercial sem presumir causalidade. |
| GMV agêntico | Valor bruto dos pedidos atribuídos a jornadas iniciadas em uma superfície de IA, antes de estornos e dos ajustes definidos pela regra da métrica. |
| Interação | Ação realizada sobre uma exposição, como clique, pergunta ou adição ao carrinho. |
| KPI — Key Performance Indicator | Métrica escolhida para representar um resultado importante, como conversão. |
| Lifetime Value — LTV | Estimativa do valor total gerado por um cliente ao longo do relacionamento. |
| Linha do tempo | Lista cronológica das ações relevantes do cliente. |
| Métrica | Valor calculado para medir atividade ou resultado. |
| Next Best Action | Próxima ação considerada mais adequada para um cliente. |
| Perfil 360° | Visão unificada que reúne identidade, consentimento, comportamento, carrinhos, compras, preferências, segmentos e interações. |
| Preferência inferida | Interesse estimado a partir do comportamento, e não informado diretamente pelo cliente. |
| Receita influenciada pela IA | Receita de compras cuja jornada teve participação mensurável de uma recomendação ou interação da IA, segundo regra de atribuição. |
| RFM | Método de análise baseado em recência, frequência e valor monetário das compras. |
| Segmento | Grupo de clientes com características ou comportamentos semelhantes. |

## 10. SaaS e multitenancy

| Termo | Explicação |
|---|---|
| Cobrança recorrente | Pagamento periódico por assinatura. |
| Isolamento lógico | Garantia de que os dados de um tenant não sejam acessados por outro. |
| Limite por plano | Restrição de uso ou funcionalidade associada ao plano contratado. |
| Multilojas | Capacidade de uma conta ou operação gerenciar mais de uma loja. |
| Multitenancy | Arquitetura na qual vários clientes usam a mesma plataforma com dados e configurações isolados. |
| Onboarding | Processo de cadastrar, configurar e ativar uma nova loja ou usuário. |
| Plano | Pacote comercial do SaaS que define preço, funcionalidades e limites. |
| RBAC — Role-Based Access Control | Controle de permissões baseado no papel do usuário, como administrador ou analista. |
| SaaS — Software as a Service | Software oferecido como serviço contínuo, geralmente com contas, planos e cobrança recorrente. |
| Single-tenant | Modelo em que uma instalação ou operação atende um único cliente. |
| Tenant | Cliente ou organização isolada dentro de uma plataforma SaaS. Inicialmente, cada loja será tratada como tenant. |
| tenant_id | Identificador que informa a qual tenant um registro pertence. |
| Trial | Período de avaliação de um plano antes da cobrança regular. |
| White-label | Versão do produto adaptada para usar a identidade de outra empresa. |

## 11. Segurança, privacidade e operação

| Termo | Explicação |
|---|---|
| Alerta | Notificação automática de que uma condição importante ou anormal ocorreu. |
| Anonimização | Transformação que remove a possibilidade razoável de associar um dado a uma pessoa específica. |
| Auditoria | Registro verificável de ações importantes, como alteração de regra, recomendação da IA, pagamento e exclusão. |
| Backup | Cópia protegida usada para recuperar dados após perda ou corrupção. |
| Criptografia em trânsito | Proteção dos dados durante o envio entre sistemas, normalmente usando HTTPS/TLS. |
| Dado pessoal | Informação relacionada a uma pessoa identificada ou identificável. |
| Disaster recovery | Plano e capacidade de restaurar a operação após uma falha grave. |
| Exclusão de dados | Processo de remover dados de uma pessoa quando aplicável e solicitado. |
| LGPD | Lei Geral de Proteção de Dados Pessoais do Brasil. Define princípios e obrigações para tratamento de dados pessoais. |
| Log | Registro técnico de uma ação, resultado ou erro. Logs devem evitar segredos e dados pessoais desnecessários. |
| Minimização de dados | Coleta e uso somente das informações necessárias para a finalidade declarada. |
| Observabilidade | Capacidade de entender o estado do sistema por métricas, logs, rastreamentos e alertas. |
| PII — Personally Identifiable Information | Termo comum para informações capazes de identificar uma pessoa. No Brasil, deve ser analisado junto ao conceito de dado pessoal da LGPD. |
| Política de retenção | Regra que define por quanto tempo cada tipo de dado será armazenado. |
| Quota | Limite de uso de uma API ou serviço por tempo, conta ou plano. |
| Rate limit | Limite de quantidade de chamadas permitidas em um período. |
| Segredo | Informação confidencial usada pelo sistema, como chave de API ou senha. |
| SLA — Service Level Agreement | Compromisso formal de nível de serviço entre fornecedor e cliente. |
| SLO — Service Level Objective | Meta interna e mensurável de confiabilidade ou desempenho. |
| Tracing | Rastreamento técnico de uma solicitação enquanto ela passa por vários serviços. |

## 12. Estados usados na documentação

| Estado | Significado |
|---|---|
| Em escopo | Compromisso do MVP. |
| Condicional | Será feito somente se critérios e dependências forem atendidos. |
| Backlog | Planejado para avaliação futura. |
| Dependência externa | Não está sob controle exclusivo da equipe. |
| Concluído | Implementado, testado, documentado e aceito. |

## 13. Regra para novos termos

Quando um termo técnico novo entrar no projeto, ele deverá ser adicionado a este arquivo com:

1. nome e sigla;
2. explicação em linguagem simples;
3. uso específico no Boopay;
4. diferença para termos semelhantes, quando necessário.
