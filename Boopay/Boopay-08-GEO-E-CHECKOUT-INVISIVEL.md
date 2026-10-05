# Boopay — GEO + checkout invisível

Versão: 1.0\
Data-base: 26 de agosto de 2026\
Status: decisão de produto e referência de integração vigente

## 1. Decisão

O diferencial do Boopay passa a ser um ciclo completo de receita agêntica:

> **Ser encontrado, ser escolhido, ser comprado e medir a receita.**

Esse ciclo combina quatro capacidades:

1. **GEO Readiness da KeyCore:** diagnostica se a loja pode ser rastreada, entendida e citada por mecanismos generativos;
2. **catálogo agêntico do Boopay:** transforma produtos, políticas, preço e estoque em dados atuais e elegíveis para distribuição;
3. **checkout conversacional invisível:** permite revisar, confirmar e concluir a compra sem abrir o storefront;
4. **atribuição de receita:** liga página, SKU, feed, recomendação, sessão, pagamento e pedido em um funil auditável.

O valor não está em empacotar duas ferramentas independentes. Está em transformar o diagnóstico GEO em prontidão comercial e conectar essa prontidão ao resultado transacional.

## 2. O que a ferramenta GEO da KeyCore faz

O [GEO Readiness Audit da KeyCore](https://www.keycore.com.br/geo-audit) se apresenta como um diagnóstico para sites que precisam ser entendidos, citados e usados por IA. A ferramenta avalia até três páginas e usa sete categorias:

| Categoria | Peso máximo |
|---|---:|
| Rastreabilidade e indexabilidade | 18 |
| Semântica HTML e extração limpa | 14 |
| Dados estruturados e entidades | 14 |
| Capacidade de responder perguntas | 20 |
| Confiança, prova e atualização | 14 |
| Prontidão para agentes e acessibilidade | 10 |
| Performance e experiência | 10 |

A metodologia pública informa 80% do score baseado em evidência, 20% em avaliação semântica e 0% em suposição. Arquivos como `llms.txt`, documentação em Markdown, RSS e APIs entram como bônus limitado, não como requisitos obrigatórios.

Fluxo técnico divulgado pela KeyCore:

1. validação da URL e proteção contra SSRF;
2. descoberta por `robots.txt` e sitemap;
3. extração de HTML renderizado, Markdown limpo, links e schema;
4. aplicação de regras determinísticas;
5. avaliação por agentes semânticos;
6. geração de score, linha do tempo e PDF.

A arquitetura pública da ferramenta cita backend NestJS, atualização por SSE e job mantido em memória. Essa solução é adequada para a demonstração atual, mas a integração com o Boopay exige persistência e estado final inequívoco para que uma reinicialização ou divergência visual não quebre o funil.

## 3. Limite honesto do GEO

GEO melhora prontidão; não controla a seleção feita por uma plataforma de IA.

As orientações oficiais do [Google para recursos de IA na busca](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) mantêm SEO técnico e conteúdo útil como fundação e afirmam que não é necessário schema especial ou outro arquivo exclusivo para aparecer em recursos generativos. Dados estruturados continuam úteis quando representam corretamente o conteúdo visível.

Portanto, o Boopay deve manter quatro conceitos separados:

| Etapa | O que prova |
|---|---|
| Score GEO | A página possui sinais de prontidão e evidências avaliadas |
| Produto pronto/elegível | O catálogo atende às regras do canal e está atualizado |
| Recomendação observada | A superfície apresentou o produto e disponibilizou evidência do evento |
| Pedido atribuído | Uma sessão e um pedido foram ligados àquela jornada pelas regras de atribuição |

Correlação entre essas etapas não prova, sozinha, que uma mudança GEO causou a venda. Causalidade exigirá experimentos, volume e grupos comparáveis, previstos para depois do MVP.

## 4. Por que isso fortalece o Boopay

Plataformas de comércio já começam a cobrir partes isoladas da jornada. A OpenAI recebe [feeds de produtos e promoções para descoberta no ChatGPT](https://openai.com/index/powering-product-discovery-in-chatgpt/). O Google usa Merchant Center e registra a [elegibilidade de checkout UCP](https://developers.google.com/merchant/ucp/guides/overview/merchant-center). Aplicativos como o [GEO-Mode para Shopify](https://apps.shopify.com/geo-mode?locale=pt-BR) já combinam otimização de catálogo e monitoramento de recomendações.

Por isso, “fazemos GEO” ou “fazemos checkout em IA” isoladamente não sustentam diferenciação. A oportunidade defensável do conjunto KeyCore + Boopay é:

- partir de uma ferramenta GEO própria e já funcional;
- operar em WooCommerce e depois em outras plataformas, sem exigir migração;
- traduzir prontidão editorial em prontidão de catálogo e feeds;
- suportar ACP e UCP por um núcleo canônico;
- concluir a venda no chat com confirmação explícita;
- reconciliar recomendação, checkout, pedido e receita;
- demonstrar tudo em sandbox enquanto acessos oficiais ainda dependem de terceiros.

Nome de categoria recomendado para comunicação institucional: **Agentic Revenue Readiness**. O nome descreve o resultado combinado sem reduzir o produto a SEO ou pagamento.

## 5. Funil de receita agêntica

    Página auditada
          │
          v
    Produto pronto
          │
          v
    Feed distribuído / produto elegível
          │
          v
    Recomendação observada ou simulada
          │
          v
    Checkout iniciado
          │
          v
    Confirmação explícita
          │
          v
    Pedido concluído
          │
          v
    GMV e receita atribuída

Eventos mínimos:

| Evento | Finalidade |
|---|---|
| `geo.audit.completed` | Auditoria final válida e versionada |
| `catalog.product.ready` | Produto atende às regras atuais de prontidão |
| `feed.product.published` | Produto foi enviado a um canal |
| `feed.product.eligible` | Canal confirmou elegibilidade quando esse dado existir |
| `agent.product.recommended` | Superfície apresentou o produto; origem oficial ou simulada obrigatória |
| `checkout.session.created` | Comprador iniciou a compra |
| `checkout.confirmed` | Comprador confirmou o resumo |
| `order.completed` | Pedido autoritativo foi concluído |
| `order.refunded` | Receita atribuída deve ser ajustada |

Cada evento deverá carregar `tenant_id`, `correlation_id`, `product_id`, `surface`, origem da evidência e data/hora quando aplicável.

## 6. Arquitetura de integração

    GEO Readiness Audit da KeyCore
               │
       resultado versionado
               v
    GEO & Catalog Readiness Service
    ├── URL ↔ produto/SKU
    ├── score e evidências
    ├── completude e atualização
    ├── políticas e dados estruturados
    └── feed e elegibilidade
               │
               v
    Agentic Commerce Gateway
    ├── ACP / ChatGPT
    ├── UCP / Google
    └── simulador Boopay
               │
               v
    Checkout Core → pagamento → pedido
               │
               v
    BigQuery → funil e dashboard de receita

A ferramenta GEO não entra no caminho síncrono de pagamento. Uma indisponibilidade da auditoria não pode interromper uma sessão já iniciada. Mudanças em score também não alteram preço, estoque, frete ou pedido; essas verdades continuam no e-commerce.

## 7. Contrato com a KeyCore

Entrada mínima:

- `tenant_id`;
- domínio e URLs autorizadas;
- tipo esperado de página;
- idioma e região;
- `correlation_id`;
- versão solicitada da auditoria.

Saída mínima:

- `geo_audit_id`;
- estado `queued`, `running`, `completed`, `partial` ou `failed`;
- URL final e tipo de página;
- score total e por categoria;
- achados com severidade, evidência e recomendação;
- custo e duração observados;
- versão das regras e agentes;
- data de início e conclusão;
- erro sanitizado quando houver.

Requisitos não funcionais:

- autenticação e isolamento por tenant;
- proteção contra SSRF preservada;
- persistência de job e resultado;
- idempotência para repetição da mesma solicitação;
- fila, retentativa e limite de uso;
- callback, webhook ou SSE com estado final consistente;
- trilha de auditoria;
- nenhuma alteração no site sem autorização separada.

## 8. Recorte do MVP de dezembro

### Obrigatório

- uma loja WooCommerce demonstrativa;
- auditoria da página inicial, de uma categoria e de ao menos um produto;
- score, evidências e achados persistidos no Boopay;
- URL de produto ligada ao SKU canônico;
- checklist de prontidão e atualização do catálogo;
- geração/validação do feed ACP;
- registro de elegibilidade UCP/Merchant Center quando o ambiente permitir;
- recomendação controlada do produto no simulador;
- checkout invisível completo em sandbox;
- exatamente um pedido no WooCommerce;
- dashboard mostrando todo o funil;
- identificação explícita do que é simulado, sandbox ou oficial.

### Condicional

- recomendação e compra em uma superfície oficial do ChatGPT;
- recomendação e checkout em Gemini ou Modo IA;
- evidência oficial de impressão/recomendação fornecida pela superfície;
- pagamento real após homologação.

### Fora do MVP

- auditoria de todo o domínio e de várias lojas;
- correção automática do site;
- acompanhamento contínuo de milhares de prompts;
- share of answer competitivo;
- experimento causal entre score e vendas;
- garantia de citação, recomendação ou posicionamento.

## 9. Dashboard

O dashboard precisa responder quatro perguntas:

1. **A loja está pronta?** Score, categorias, achados, evidências e páginas cobertas.
2. **Os produtos estão distribuíveis?** Completude, atualização, feed, rejeição e elegibilidade.
3. **A experiência funciona?** Recomendações, sessões, confirmações, falhas e conclusão sem redirecionamento.
4. **Gerou resultado?** Pedidos, conversão, GMV agêntico, estornos e receita atribuída.

Visualizações mínimas:

- score atual e achados prioritários;
- prontidão por produto;
- saúde e elegibilidade por canal;
- funil completo com perdas entre etapas;
- conversão por superfície e protocolo;
- GMV e pedidos atribuídos;
- separação entre recomendação oficial observada e simulada;
- alertas de preço, estoque ou feed desatualizados.

## 10. Critérios de sucesso

O diferencial conjunto está demonstrado quando:

- a auditoria retorna um resultado final consistente, versionado e baseado em evidências;
- a página de produto é ligada automaticamente ao SKU correto;
- o produto só fica pronto com catálogo, preço e estoque atuais;
- a publicação ou elegibilidade do feed é registrada sem ser confundida com recomendação;
- o simulador recomenda o mesmo produto usando o catálogo canônico;
- o cliente conclui a compra sem abrir o storefront;
- o WooCommerce recebe exatamente um pedido;
- o dashboard reconcilia auditoria, produto, feed, recomendação, sessão e pedido;
- repetir eventos, callbacks ou conclusão não duplica métricas, cobrança ou pedido;
- a apresentação não promete ranking, citação ou ativação oficial sem evidência.

## 11. Mensagem para o pitch

Versão principal:

> O Boopay, junto à tecnologia GEO da KeyCore, prepara a loja para ser entendida pelos agentes, transforma o catálogo em uma experiência comprável e conclui a venda sem tirar o cliente da conversa. Depois, mostra ao lojista exatamente quais produtos avançaram da prontidão à receita.

Versão curta:

> **Da resposta ao pedido, sem sair da conversa.**

Afirmações permitidas:

- “auditamos a prontidão da loja para mecanismos generativos”;
- “preparamos e distribuímos produtos para canais agênticos”;
- “demonstramos a compra completa em sandbox”;
- “ligamos o funil de prontidão ao pedido e à receita atribuída”.

Afirmações que exigem evidência externa:

- “a loja aparece no ChatGPT ou Gemini”;
- “o GEO fez a IA recomendar este produto”;
- “o checkout está homologado na superfície oficial”;
- “a melhoria do score aumentou as vendas em determinado percentual”.

## 12. Encaixe no modelo de negócio

O conjunto permite uma cobrança híbrida mais defensável que um spread isolado:

| Componente | O que remunera | Modelo recomendado |
|---|---|---|
| Implantação e diagnóstico | Conexão da loja, auditoria inicial e correções priorizadas | taxa de setup ou pacote inicial |
| Plataforma recorrente | auditorias, catálogo, feeds, dashboard e operação | mensalidade por loja/faixa de catálogo |
| Resultado transacional | checkout e pedidos originados no funil agêntico | take rate sobre o GMV agêntico líquido |
| Processamento financeiro | custo e margem do PSP, quando o contrato permitir | spread separado e transparente, opcional |

Recomendação: usar **mensalidade + take rate** como núcleo. O GEO sustenta valor recorrente mesmo antes de haver grande volume transacional; o take rate alinha o Boopay à receita efetivamente gerada. Spread de pagamento não deve ser a única fonte, porque depende do PSP, da estrutura regulatória e da capacidade contratual de capturar essa margem.

A regra de cobrança precisa excluir pedidos cancelados, estornados ou não atribuíveis e permitir reconciliação pelo `order_id`. O dashboard deve separar GMV, take rate do Boopay, custo do PSP e eventual spread financeiro.

## 13. Próximas decisões

- definir se a integração da ferramenta KeyCore ocorrerá por API, webhook ou importação inicial;
- obter documentação técnica e responsável interno pela ferramenta GEO;
- escolher as três URLs da loja demonstrativa;
- definir os campos obrigatórios do produto por ACP e UCP;
- confirmar como a KeyCore deseja apresentar a oferta conjunta e sua marca;
- decidir o nome comercial entre Boopay GEO, Boopay Discover ou Agentic Revenue Readiness;
- fechar a regra de atribuição de GMV e receita agêntica;
- testar e corrigir a divergência entre o estado final, a contagem de especialistas e a geração de achados da ferramenta.

## 14. Fontes consultadas

- [KeyCore — GEO Readiness Audit](https://www.keycore.com.br/geo-audit)
- [KeyCore](https://keycore.com.br/)
- [Google Search — AI features and your website](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)
- [Google Search — Generative AI content](https://developers.google.com/search/docs/fundamentals/using-gen-ai-content)
- [Google UCP — Merchant Center](https://developers.google.com/merchant/ucp/guides/overview/merchant-center)
- [OpenAI — Powering Product Discovery in ChatGPT](https://openai.com/index/powering-product-discovery-in-chatgpt/)
- [OpenAI — Commerce policies](https://openai.com/policies/commerce-policies/)
- [Shopify App Store — GEO-Mode](https://apps.shopify.com/geo-mode?locale=pt-BR)

Como GEO, ACP, UCP e superfícies oficiais mudam rapidamente, disponibilidade, políticas, preços e capacidades devem ser verificadas novamente antes do pitch e antes de qualquer compromisso comercial.
