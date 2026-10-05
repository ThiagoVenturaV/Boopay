# Boopay

O Boopay conecta lojas virtuais a jornadas de compra mediadas por agentes de IA: **prontidão GEO → catálogo estruturado → recomendação → revisão → confirmação do comprador → pagamento → pedido → receita conciliada**. É o projeto de Agentic Commerce do Squad 45, na residência com a KeyCore Tech Hub.

**Estado atual, conferido em 05/10/2026:** há plataforma, plugin WooCommerce e landing implementados em repositórios privados. O fluxo próprio funciona em ambiente local e nos ensaios documentados. O MVP completo continua aberto: faltam validações com lojas, contas e serviços externos autorizados. A centralização destes documentos não representa implantação ou homologação.

Este README apresenta o estado consolidado. Os detalhes estão organizados por repositório, sem snapshots antigos, instruções de agentes ou relatórios das ferramentas do Codex.

## Navegação

- [Produto, escopo e arquitetura](Boopay/_INDICE.md)
- [Plataforma, APIs e integrações](boopay-platform/_INDICE.md)
- [Plugin WooCommerce](pluginboopay/_INDICE.md)
- [Landing e identidade visual](boopay-landing/_INDICE.md)
- [Estado validado e pendências](boopay-platform/docs/ESTADO-ATUAL.md)
- [Critérios para concluir o MVP](boopay-platform/docs/CRITERIOS-DE-ACEITE.md)
- [Todos os documentos](INDICE-CENTRAL.md)

## Problema, público e objetivo

Lojas operam com páginas, catálogos, eventos, pedidos e pagamentos dispersos. Um agente precisa de dados confiáveis para interpretar um produto e conduzir a compra, enquanto o gestor precisa entender de onde veio uma recomendação, o que foi confirmado e se houve receita comprovada.

O público principal são gestores de e-commerce responsáveis por catálogo, operação e receita. O comprador participa de uma conversa de compra com revisão e confirmação explícitas. O objetivo do MVP é demonstrar essa jornada completa para **uma loja controlada**, começando por WooCommerce e usando o mesmo núcleo nos adaptadores Shopify e VTEX.

A proposta de valor combina preparação para descoberta, catálogo consultável, compra no contexto da conversa e atribuição auditável. A validação comercial com lojistas e métricas de resultado permanece pendente; score GEO não garante citação, recomendação ou venda. [Escopo](Boopay/Boopay-01-ESCOPO-MVP.md) · [GEO e checkout](Boopay/Boopay-08-GEO-E-CHECKOUT-INVISIVEL.md).

## Escopo e jornada do MVP

1. O gestor conecta a loja e prepara as páginas que serão auditadas.
2. O GEO Readiness Audit da KeyCore fornece evidências de prontidão; o Boopay relaciona URLs, SKUs e catálogo, sem modificar automaticamente a loja.
3. Produtos, variações, preços e estoque são normalizados. O feed é validado e versionado; gerar o arquivo não comprova distribuição externa.
4. A IA consulta o catálogo e recomenda produtos rastreáveis. A seleção preserva produto, revisão, preço e origem da recomendação.
5. O Checkout Core recalcula os valores na autoridade comercial e apresenta itens, quantidade, entrega, pagamento e total.
6. O comprador confirma o resumo exato. Mudanças de preço, estoque ou prazo exigem nova revisão.
7. A operação cria ou recupera a mesma tentativa de pagamento/pedido, com idempotência e conciliação.
8. O painel relaciona descoberta, sessão, pedido, pagamento e estorno, distinguindo receita paga de operações pendentes.

Checkout “invisível” significa permanecer no contexto da experiência controlada, com revisão e confirmação humanas. O agente não recebe permissão irrestrita para comprar. A ativação oficial em ChatGPT, Gemini ou outras superfícies depende das capacidades, programas e aprovações externas. [Checkout conversacional](Boopay/Boopay-07-CHECKOUT-CONVERSACIONAL.md) · [Trilha de descoberta](boopay-platform/docs/DISCOVERY.md).

Ficam fora do MVP: WhatsApp e recuperação por mensagens, CDP enterprise, resolução avançada entre dispositivos, operação comercial multiloja, planos/cobrança SaaS, WebMCP e compras autônomas sem revisão. Publicação em marketplaces e pagamentos em produção têm requisitos próprios. [Backlog](Boopay/Boopay-04-BACKLOG.md).

## Funcionalidades atuais

- **Gestão da loja:** conexões revogáveis, catálogo, sessões de checkout, pedidos, cotação e acompanhamento de falhas.
- **GEO e feed:** fila persistida de auditorias, evidências por página/produto, prontidão e geração de JSONL versionado.
- **IA e perfil:** adaptadores OpenAI/Gemini, busca por catálogo/embeddings, recomendações verificadas, consumo e falhas; perfil consentido com exportação, exclusão e revogação.
- **Compra:** revisão e confirmação, assinatura, tentativas duráveis, recuperação de resposta perdida e bloqueio de duplicidade.
- **Pagamentos de teste:** integração Stripe/Connect, tokenização e autenticação pelo SDK, autorização/captura separadas, estorno, Google Pay TEST e retomada com novo aceite.
- **Painel:** receita e conciliação em destaque, funil, conversão/abandono de checkout, filtros por período/origem/moeda, CSV, catálogo, integrações, IA, audiência e privacidade.
- **Pós-compra e operação:** consulta do estado comprovado, notificações autorizadas, acompanhamento/cancelamento VTEX, tratamento de rascunhos Shopify, outbox e backup cifrado com restauração em quarentena.

O painel usa dados das APIs; números ilustrativos não representam resultados comerciais. `exit_intent` é um sinal de navegação, não abandono comprovado. Moedas permanecem separadas, e pedido criado não equivale a pagamento recebido. [Guia do painel](boopay-platform/docs/DASHBOARD.md) · [Receita por origem](boopay-platform/docs/REPORTING-ORIGINS.md).

## Arquitetura e componentes

A plataforma usa **TypeScript, Node.js 24+, Fastify, React e Vite**. O Core mantém regras comerciais independentes do protocolo e do e-commerce. Adaptadores conectam lojas, GEO, IA e pagamentos; ACP/UCP transportam operações do mesmo núcleo. A landing usa Next.js, TypeScript, CSS e Three.js. O conector WooCommerce usa PHP, APIs nativas do WordPress/WooCommerce e Action Scheduler.

- `src/core`: contratos, catálogo, cotação e regras comerciais.
- `src/services`: checkout, identidade, consentimento, eventos, auditoria e analytics.
- `src/adapters` e integrações: ligação com lojas e serviços externos.
- `src/protocols`: descoberta, delegação, assinaturas, checkout, pedidos e notificações ACP/UCP.
- `src/storage` e `src/data`: persistência, outbox, projeções e clientes Google.
- `web/src`: painel, revisão do comprador e controles operacionais.

As chamadas externas ocorrem fora das transações. Registros, leituras, idempotência e autorização são limitados por tenant; a aplicação não oferece contas SaaS multiloja prontas para comercialização. [Arquitetura](Boopay/Boopay-02-ARQUITETURA-E-FLUXOS.md) · [Núcleo transacional](boopay-platform/docs/ADR-001-transactional-core.md).

## Dados, API e segurança

**PostgreSQL** é a fonte transacional prevista para staging; **SQLite** atende às demos e testes locais. A implementação persiste registros canônicos com tenant, tipo e revisão. **Firestore** e **BigQuery** recebem projeções específicas por outbox, mediante habilitação e configuração: Firestore para estado/perfil operacional e BigQuery para análises. Não são três cópias indiscriminadas da mesma informação.

A API local abre em `http://127.0.0.1:9510`. Payloads são JSON estritos, valores monetários usam centavos e datas usam UTC ISO-8601. Rotas administrativas cobrem sessão, catálogo, integrações, pedidos, GEO, métricas e relatórios; rotas do comprador cobrem catálogo, checkout, revisão, confirmação e acompanhamento. A ingestão de catálogo/eventos mantém o contrato do plugin. [API](boopay-platform/docs/API.md) · [Projeções](boopay-platform/docs/DATA-PROJECTIONS.md).

O operador usa sessão administrativa ou Bearer; o comprador tem sessão limitada à loja e à própria identidade. Códigos temporários conectam o plugin, tokens são armazenados como hash e segredos privados são cifrados. HMAC e assinaturas vinculam conteúdo, prazo e autoridade; dados brutos de cartão e segredos do PSP não chegam ao navegador ou ao Git. A confirmação registra o resumo aceito, e a idempotência preserva a tentativa original.

A coleta de analytics e o vínculo ao perfil são permissões distintas. Atividade de vitrine só alimenta perfil após o aceite específico; revogação interrompe a coleta autorizada. Backup é cifrado/autenticado e restaura em destino vazio, com quarentena e reaplicação das exclusões mais recentes antes de uma retomada. Políticas legais, retenção física e recuperação externa ainda exigem definição operacional. [Privacidade](boopay-platform/docs/PROFILE.md) · [Backup](boopay-platform/docs/BACKUP-RESTORE.md) · [Recuperação](boopay-platform/docs/RECOVERY-PRIVACY.md).

## Integrações: alcance atual

**WooCommerce — plugin 0.7.2.** Conexão, catálogo, estoque, cotação, confirmação assinada, tentativa durável, coleta/reenvio e perfil consentido estão implementados. Há ensaios em WordPress/PHP/MySQL reais; Stripe nesses ensaios é sintético. Instalação e homologação em loja autorizada continuam pendentes. A versão foi conferida no cabeçalho do plugin, corrigindo a indicação 0.6.0 do README anterior. [Plugin](pluginboopay/boopay-woocommerce/README.md).

**Shopify.** Catálogo, cálculo, rascunho/pedido pendente, consulta da tentativa original, webhooks, coleta e limpeza opt-in estão implementados com transporte sintético nos testes. Pagamento nativo e a prova atômica entre resumo, expiração e conclusão continuam abertos. [Adaptador](boopay-platform/docs/SHOPIFY.md) · [Lacunas da confirmação](boopay-platform/docs/SHOPIFY-CONFIRMATION.md).

**VTEX.** Inspeção de catálogo, cotação, promissória de teste, pedido pendente, conciliação, acompanhamento, cancelamento e catálogo incremental estão implementados. A ponte de catálogo é candidata **0.2.6**; os ensaios de loja são sintéticos. A instalação está bloqueada pelos achados do SDK/runtime e pela homologação pendente; captura e estorno PSP não estão comprovados. [VTEX](boopay-platform/docs/VTEX.md) · [Ponte e runtime](boopay-platform/docs/VTEX-BRIDGE-RUNTIME.md).

**ACP/UCP.** Descoberta, assinaturas ES256, delegação, sessão canônica, confirmação própria do comprador, recuperação e notificações opt-in estão implementadas. WooCommerce passou pela jornada nativa; Shopify/VTEX usam transportes sintéticos. Isso não comprova ativação oficial em ChatGPT ou Gemini. [Protocolos](boopay-platform/docs/PROTOCOLS.md).

**GEO, IA, pagamentos e Google Cloud.** Há clientes e contratos implementados. GEO externo está qualificado como parcial; as três páginas da loja ainda precisam de validação completa. IA, Stripe e Google Pay usam provas sintéticas; Firestore foi testado no emulador oficial e BigQuery com respostas sintéticas. As contas externas e a demonstração integrada autorizada permanecem pendentes.

## Validação e próximos requisitos

A [CI funcional de referência](https://github.com/ThiagoVenturaV/boopay-platform/actions/runs/34628418872) foi reconfirmada como concluída com sucesso. A evidência documenta **390 cenários distintos de backend, 53 percursos do painel, quatro dos pixels e 21 testes da ponte VTEX**. A branch atual acrescenta documentação das lacunas nativas Shopify; nenhuma nova validação funcional foi executada para esta centralização.

O candidato VTEX continua com achados de dependências: a evidência da revisão 0.2.6 registra três entradas altas no npm e avisos no Yarn. Os jobs admitem falha de auditoria; CI aprovada não libera instalação ou certifica os backports. As contagens são daquela revisão, sem nova auditoria de dependências nesta atualização documental.

Para fechar o MVP, faltam contas/lojas e permissões de teste, configuração de IA/pagamentos/Google/GEO, instalação e validação nativa dos coletores, confirmação/pagamento Shopify, composição segura da ponte VTEX e uma demonstração integral com páginas e serviços autorizados. Conciliação, privacidade, retenção e retomada precisam ser comprovadas nesse ambiente. [Estado detalhado](boopay-platform/docs/ESTADO-ATUAL.md) · [Critérios de aceite](boopay-platform/docs/CRITERIOS-DE-ACEITE.md).

## Executar e operar

Na plataforma, use Node.js 24 ou superior:

```powershell
npm ci
npm run check
npm run demo
npm start
```

O painel abre na porta **9510**. A chave administrativa local é gerada fora do Git; o painel inicia sem vendas inventadas. `npm run discovery:demo` reproduz a jornada integrada **simulada**. Os demais comandos de operação, staging, dados, pagamentos e backup estão no [guia operacional](boopay-platform/docs/OPERATIONS.md).

Integrações externas e workers sensíveis são opt-in e precisam de configuração por ambiente. Segredos pertencem ao ambiente/secret manager. Credenciais de produção, loja real e aprovação de parceiro não podem ser substituídas por fixtures.

## Landing, identidade e comercialização

A landing apresenta o mecanismo de GEO até compra e atribuição. Boo percorre o scroll, com proteção das áreas de leitura, controle de movimento e alternativas para WebGL indisponível/movimento reduzido. A identidade usa creme, petróleo, menta e laranja. O repositório contém a implementação; a documentação não comprova hospedagem pública. [Landing](boopay-landing/README.md) · [Modelo e movimento](boopay-landing/docs/boo-v2.md).

O kit Woo Marketplace permanece em preparação. Vendor, monetização, termos, privacidade, suporte, URLs e infraestrutura pública dependem do responsável pelo produto. Documentos comerciais com marcadores são rascunhos vigentes para completar, e não aprovação de lançamento. [Pendências comerciais](pluginboopay/marketplace/DECISIONS-NEEDED.md) · [Processo de submissão](pluginboopay/marketplace/EXTERNAL-PROCESS.md).

## Repositórios e documentação

- **Boopay:** esta central pública e os documentos atuais de produto.
- **boopay-platform:** implementação privada do Core, API, painel, adaptadores, dados, IA e protocolos.
- **pluginboopay:** implementação privada do plugin WooCommerce e documentos de operação/submissão.
- **boopay-landing:** implementação privada da landing e seus detalhes visuais.

Os Markdown foram copiados e organizados por origem; os arquivos das origens permanecem intactos. Links entre documentos ficam nesta central. Links para implementação/evidências apontam aos commits originais e exigem acesso quando a origem é privada. [Índice completo](INDICE-CENTRAL.md) · [Conferência do conjunto](CONFERENCIA.md).
