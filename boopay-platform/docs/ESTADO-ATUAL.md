# Estado atual da implementação

[Resumo completo](../../README.md) · [Todos os documentos da plataforma](../_INDICE.md)

Conferência em **05/10/2026**, a partir das branches atuais, arquivos locais de produto, cabeçalho do plugin e evidências existentes. Este documento consolida o estado final disponível, sem reproduzir o histórico de incrementos.

## Resultado geral

**Implementação disponível para operação local e ensaios controlados; MVP integral ainda aberto.** O fluxo demonstrativo é rastreável, com revisão e confirmação explícitas. Serviços configuráveis e testes de contrato não comprovam instalação em loja autorizada, validação com credenciais externas ou homologação oficial.

## Fontes atuais

- Plataforma: [`3ab824e`](https://github.com/ThiagoVenturaV/boopay-platform/commit/3ab824e3375d6d5d2956e0ca61aa90100f93a0d7). O último commit acrescenta documentação das lacunas Shopify, com CI dispensada para essa mudança documental.
- Plugin WooCommerce: [`fb87b6f`](https://github.com/ThiagoVenturaV/pluginboopay/commit/fb87b6f155e9221be802e12211038655ef7fe41e); versão **0.7.2** conferida no cabeçalho PHP e no README do pacote.
- Landing: [`05f12fd`](https://github.com/ThiagoVenturaV/boopay-landing/commit/05f12fd1cafb31b04da2053432699ea1d38f3dd5); implementação Boo v2.
- Produto: documentos do workspace conferidos contra a cópia de referência usada pela plataforma, com decisões GEO + catálogo + checkout + receita e exclusão de WhatsApp.

Os três repositórios de implementação foram confirmados privados. Esta central publica documentação, sem copiar aplicação, credenciais, bancos ou dados operacionais.

## Funcionalidades e alcance da validação

### Core, checkout e segurança

Autenticação, isolamento por tenant, persistência transacional, cotação versionada, confirmação do resumo, idempotência, operações duráveis, outbox e conciliação estão implementados. SQLite e PostgreSQL têm provas locais/CI. Resposta HTTP ou pedido criado não bastam para reconhecer pagamento; a receita depende do estado financeiro comprovado.

### WooCommerce

Plugin 0.7.2: conexão, catálogo, cotação, confirmação assinada, pedido, eventos duráveis e perfil consentido na sessão nativa. WordPress, PHP, WooCommerce e MySQL reais foram usados nos ensaios, inclusive resposta perdida e reentrega. O PSP Stripe é sintético nesses ensaios. Instalação na loja autorizada, credenciais e validação operacional continuam pendentes. [Contrato comercial](CHECKOUT-COMMERCE.md) · [Perfil Woo](WOO-PROFILE.md).

### Shopify e VTEX

Adaptadores, catálogos, cálculo, tentativa original, pedido pendente, consultas, conciliação e interfaces estão implementados com APIs de loja sintéticas nas provas. SDKs de coleta/perfil são candidatos instaláveis, com consentimento, reenvio e receptor comum.

Shopify ainda precisa comprovar pagamento nativo, expiração e proteção atômica entre resumo e conclusão. A limpeza de rascunhos é opt-in e preserva tentativas comerciais. VTEX usa promissória de teste; consulta automática, cancelamento pendente e catálogo incremental não comprovam captura/estorno PSP. [Shopify](SHOPIFY.md) · [Confirmação](SHOPIFY-CONFIRMATION.md) · [VTEX](VTEX.md).

### Ponte de catálogo VTEX

Candidata **0.2.6**, com builder 7.x, correções/backports documentados e 21 testes distintos da ponte na evidência de referência. **Instalação não liberada.** A evidência 0.2.6 registra achados altos no npm e avisos no Yarn; o SDK/runtime e os backports precisam de sustentação e homologação. Auditorias de versão não certificam patches locais. [Runtime](VTEX-BRIDGE-RUNTIME.md) · [Baggage](VTEX-BAGGAGE.md).

### GEO, catálogo e atribuição

Fila persistida, relatórios normalizados, vínculo URL/SKU, prontidão, feed JSONL e continuidade da recomendação até sessão/pedido estão implementados. O relatório externo obtido é parcial; falta auditar completamente as três páginas e o contrato persistente do provedor. Feed gerado não comprova distribuição/elegibilidade. A demonstração integrada usa GEO e IA sintéticos. [GEO](GEO.md) · [Feed](CATALOG-FEED.md) · [Atribuição](DISCOVERY.md).

### IA e perfil

OpenAI/Gemini compartilham catálogo, política de recomendação, embeddings opcionais, Checkout Core e relatório de consumo. Perfil exige consentimento e minimização, com exportação/exclusão. Provedores foram simulados nas provas; configuração e avaliação com credenciais reais permanecem pendentes. [IA](AI.md) · [Perfil](PROFILE.md).

### Dados e painel

Filtros, funil, receita, abandono de checkout, origens, moeda, CSV e comparação analítica estão implementados. Firestore tem prova pelo emulador oficial. BigQuery usa respostas sintéticas; execução SQL, ingestão, IAM e paridade no projeto Google autorizado continuam abertos. [Projeções](DATA-PROJECTIONS.md) · [Painel analítico](DATA-DASHBOARD.md).

### Pagamentos e protocolos

Stripe/Connect sandbox, autorização/captura, inbox de webhooks, estorno, tokenização/3DS, Google Pay TEST e retomada com novo aceite têm implementação e provas sintéticas. Homologação do PSP/carteira depende das contas externas.

ACP/UCP oferecem descoberta, assinaturas, delegação, confirmação própria do comprador, pedidos e notificações opt-in. Há jornada Woo nativa e transportes Shopify/VTEX sintéticos. A ativação em ChatGPT/Gemini não está comprovada. [Pagamentos](PAYMENTS.md) · [Protocolos](PROTOCOLS.md).

### Operação e landing

Backup cifrado/autenticado, restauração em destino vazio, quarentena e conciliação das exclusões posteriores estão implementados. Retomada financeira, retenção física, RPO/RTO e ambiente externo exigem definição e prova próprias. A landing está implementada; não há comprovação de hospedagem pública na documentação corrente.

## Evidência funcional disponível

A [CI 34628418872](https://github.com/ThiagoVenturaV/boopay-platform/actions/runs/34628418872), commit `3307d55`, foi reconfirmada em 05/10/2026 como **completed / success**. A documentação da execução registra:

- 390 cenários distintos de backend: 387 no PostgreSQL e três no emulador Firestore.
- 53 percursos do painel e quatro dos pixels.
- 21 testes distintos da ponte VTEX, repetidos via npm/Yarn.
- WooCommerce nativo e demos Linux/Windows, com os limites externos descritos acima.

Executar os mesmos cenários em sistemas operacionais ou gerenciadores diferentes não aumenta a contagem de cenários distintos. O job VTEX tolera falha das auditorias; sucesso de CI não encerra os achados. Nenhum teste funcional ou nova auditoria de dependências foi executado nesta atualização documental.

## Pendências para conclusão

1. Disponibilizar lojas, contas e permissões de teste autorizadas; configurar GEO, IA, PSP/carteira e Google Cloud.
2. Instalar e validar os coletores/perfil nas lojas e CMPs reais, mantendo autorizações separadas.
3. Completar auditoria GEO das três páginas e demonstrar a trilha com produtos e serviços autorizados.
4. Comprovar pagamento/confirmação nativos Shopify e capacidade financeira VTEX.
5. Resolver sustentação/segurança/runtime da ponte VTEX antes da instalação.
6. Validar ingestão, execução analítica e conciliação Firestore/BigQuery no projeto autorizado.
7. Reproduzir uma jornada integral, falhas, retomada, estorno, exclusão e receita reconciliada no ambiente autorizado.
8. Definir retenção, recuperação, alertas e responsáveis operacionais para uso externo.

Marketplace, superfícies oficiais, multilojas e WebMCP têm requisitos separados. Eles não substituem nem redefinem o aceite da demonstração própria. [Critérios atuais](CRITERIOS-DE-ACEITE.md).
