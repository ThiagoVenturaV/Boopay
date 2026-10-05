# Conferência da documentação atual

[Resumo do projeto](README.md) · [Índice completo](INDICE-CENTRAL.md)

Conjunto conferido em **05/10/2026**, conforme a instrução de reunir documentação atual para leitura no celular. A publicação central contém texto de produto, contratos, operação e navegação; as origens de implementação permanecem intactas.

## Contagem final

| Origem | Markdown encontrados no GitHub | Selecionados/adaptados | Consolidações atuais | Documentos na pasta |
|---|---:|---:|---:|---:|
| boopay-platform | 107 | 54 | 4 | 58 |
| pluginboopay | 28 | 19 | 0 | 19 |
| boopay-landing | 8 | 3 | 0 | 3 |
| Boopay | 9 antigos | 7 atuais do workspace | 0 | 7 |
| Pedro-Lucas001/boopay | 1 | 0 | 0 | 0 |

As quatro pastas reúnem **87 documentos**. O novo README principal acrescenta a síntese completa: **88 documentos do projeto**, formados por 83 fontes selecionadas/adaptadas e cinco sínteses atuais. Existem também **14 páginas de navegação/conferência**: cinco índices, esta conferência e oito atalhos para preservar URLs anteriores. Total físico: **102 arquivos MD**; páginas de navegação não são contadas como documentos de projeto.

O número preliminar 199 incluía variantes locais e históricos. O conjunto final atende ao escopo atualizado: finalidade e conteúdo foram lidos, cópias correntes agrupadas, documentos superados e material de agentes retirados. Contratos versionados que continuam em uso pertencem à documentação atual.

## Fontes e atualidade

Foram conferidos a conta `ThiagoVenturaV`, os 49 repositórios próprios, os acessíveis por colaboração e os remotes dos cinco checkouts locais. Os quatro repositórios próprios do Boopay foram identificados pelos nomes, descrições e remotes; projetos pessoais alheios não foram incluídos. As três origens de implementação têm somente `main`. O repositório de Pedro foi lido; seu README contém apenas o título, sem documentação substantiva.

O conteúdo de produto publicado originalmente no Boopay está superado pelos arquivos atuais do workspace usados como referência pela plataforma. A central usa esses sete arquivos vigentes; não apresenta as duas versões para leitura. Os checkouts de implementação foram comparados com os commits atuais e as diferenças apenas de quebra de linha foram agrupadas. Nenhum Markdown adicional local de implementação foi omitido sem avaliação de propósito: o brief de VTEX e o brief de superfície da landing servem aos agentes e foram excluídos.

O plugin 0.7.2 foi confirmado pelo cabeçalho PHP, README do pacote e SHA-256 do ZIP. A descrição antiga 0.6.0 e o hash antigo no kit de Marketplace foram corrigidos nesta central. A evidência funcional de referência e o commit atual da plataforma foram reconfirmados no GitHub; nenhuma suíte ou auditoria nova foi executada nesta tarefa documental.

## Exclusões por finalidade

- **Agentes e ferramentas do Codex:** AGENTS, CLAUDE, PRODUCT com schema de contexto, `.impeccable`, briefs/surface briefs, prompts de imagem e pareceres de revisão. O arquivo chamado PROTOCOL-REVIEW também era um parecer de agente; o comportamento funcional foi consolidado em PROTOCOLO-CONFIRMACAO.
- **Passado e duplicatas:** checkouts temporários, variantes, cópias em `docs/reference`, briefing de reunião encerrada, visão inicial Boopay, conceito visual anterior, rodada exploratória de marca, logs de prompts e relatórios de versões antigas.
- **Histórico de execução:** STATUS, ENTREGA datada, marcos incrementais de DELIVERY, relatórios VALIDATION/RELEASE e registros de correções dos revisores. O estado e os limites finais foram consolidados sem essas cronologias.
- **Terceiros e execução local:** dependências, caches npm/Yarn/WordPress/Python, runtimes de ferramentas, protocolos vendorizados, probes/downloads, arquivos de extração/render temporários. Código, binários, bases, `.env`, credenciais e dados operacionais ficaram fora.
- **Sem conteúdo pertinente:** projetos pessoais alheios e o README vazio de conteúdo do colaborador.

Os documentos de `tools/vtex-catalog` e a nota técnica de manutenção do Core OpenTelemetry foram mantidos porque descrevem componentes **do produto VTEX**, não ferramentas para o Codex funcionar. As instruções de revisores Woo descrevem revisão humana do Marketplace. DESIGN registra o sistema visual efetivamente implementado. Formulários comerciais com marcadores são rascunhos vigentes explicitamente sinalizados, dependentes de decisões externas.

## Adaptações para refletir o estado final

Os contratos detalhados foram preservados; destinos de links foram ajustados para leitura central. Foram removidos trechos de pareceres de agentes e comparações/execuções históricas. A cronologia mensal do roadmap foi reduzida ao horizonte e aos critérios vigentes. Os detalhes da confirmação ACP/UCP foram conferidos nos contratos e no fluxo atual de Checkout.tsx.

- `boopay-platform/DESIGN.md`: Trechos de parecer/revisão de agentes removidos; contrato final e limites preservados.
- `boopay-platform/docs/AI-PROFILE-UI.md`: Trechos de parecer/revisão de agentes removidos; contrato final e limites preservados.
- `boopay-platform/docs/DASHBOARD.md`: Trechos de parecer/revisão de agentes removidos; contrato final e limites preservados.
- `boopay-platform/docs/DATA-DASHBOARD.md`: Trechos de parecer/revisão de agentes removidos; contrato final e limites preservados.
- `boopay-platform/docs/DISCOVERY.md`: Trechos de parecer/revisão de agentes removidos; contrato final e limites preservados.
- `boopay-platform/docs/GOOGLE-PAY.md`: Trechos de parecer/revisão de agentes removidos; contrato final e limites preservados.
- `boopay-platform/docs/PAYMENT-RENEWAL.md`: Trechos de parecer/revisão de agentes removidos; contrato final e limites preservados.
- `boopay-platform/docs/PAYMENT-UI.md`: Trechos de parecer/revisão de agentes removidos; contrato final e limites preservados.
- `boopay-platform/docs/PROTOCOL-ACCESS.md`: Trechos de parecer/revisão de agentes removidos; contrato final e limites preservados.
- `boopay-platform/docs/PROTOCOL-COMMERCE.md`: Trechos de parecer/revisão de agentes removidos; contrato final e limites preservados.
- `boopay-platform/docs/PROTOCOLS.md`: Trechos de parecer/revisão de agentes removidos; contrato final e limites preservados.
- `boopay-platform/docs/REPORTING-ORIGINS.md`: Trechos de parecer/revisão de agentes removidos; contrato final e limites preservados.
- `boopay-platform/docs/SHOPIFY.md`: Trechos de parecer/revisão de agentes removidos; contrato final e limites preservados.
- `boopay-platform/docs/VTEX-CANCELLATION-UI.md`: Trechos de parecer/revisão de agentes removidos; contrato final e limites preservados.
- `boopay-platform/docs/VTEX-CATALOG-UI.md`: Trechos de parecer/revisão de agentes removidos; contrato final e limites preservados.
- `boopay-platform/docs/VTEX-CHECKOUT.md`: Trechos de parecer/revisão de agentes removidos; contrato final e limites preservados.
- `boopay-platform/docs/WOO-PROFILE.md`: Trechos de parecer/revisão de agentes removidos; contrato final e limites preservados.
- `pluginboopay/boopay-woocommerce/docs/COMMERCE-GUARD.md`: Situação da integração atualizada contra CHECKOUT-COMMERCE.md e o ensaio nativo documentado.
- `pluginboopay/marketplace/DECISIONS-NEEDED.md`: Estado de rascunho e pacote técnico atual explicitados; decisões externas preservadas.
- `pluginboopay/marketplace/EXTERNAL-PROCESS.md`: Estado de rascunho e pacote técnico atual explicitados; decisões externas preservadas.
- `pluginboopay/marketplace/MARKETPLACE-READINESS.md`: Prontidão antiga do candidato 0.2.0 consolidada para a versão atual, sem reproduzir histórico.
- `pluginboopay/marketplace/PRIVACY-DISCLOSURE.md`: Estado de rascunho e pacote técnico atual explicitados; decisões externas preservadas.
- `pluginboopay/marketplace/PRODUCT-LISTING.md`: Estado de rascunho e pacote técnico atual explicitados; decisões externas preservadas.
- `pluginboopay/marketplace/PUBLIC-DOCUMENTATION.md`: Estado de rascunho e pacote técnico atual explicitados; decisões externas preservadas.
- `pluginboopay/marketplace/README.md`: Kit consolidado para 0.7.2, com hash do ZIP verificado; variantes de identidade e pacote/hashes antigos removidos.
- `pluginboopay/marketplace/README.md`: Estado de rascunho e pacote técnico atual explicitados; decisões externas preservadas.
- `pluginboopay/marketplace/REVIEWER-INSTRUCTIONS.md`: Estado de rascunho e pacote técnico atual explicitados; decisões externas preservadas.
- `pluginboopay/marketplace/SUBMISSION-FORM.md`: Estado de rascunho e pacote técnico atual explicitados; decisões externas preservadas.
- `pluginboopay/marketplace/SUPPORT-AND-MAINTENANCE.md`: Estado de rascunho e pacote técnico atual explicitados; decisões externas preservadas.
- `pluginboopay/README.md`: README consolidado para o pacote corrente 0.7.2, substituindo apresentação superada 0.6.0.
- `Boopay/Boopay-03-ROADMAP-E-ACEITE.md`: Etapas mensais de planejamento anteriores removidas; estratégia, critérios, Definition of Done e riscos vigentes preservados.
- `Boopay/Boopay-07-CHECKOUT-CONVERSACIONAL.md`: Comparação de mercado datada e relação com PRD antigo removidas; direção vigente, arquitetura, ciclo comercial, contrato e aceite preservados.
- `Boopay/Boopay-08-GEO-E-CHECKOUT-INVISIVEL.md`: Relatório da execução GEO antiga removido; capacidades/limites, arquitetura, contrato e critérios vigentes preservados.

## Verificação e anexos

Hashes SHA-256 foram calculados para fontes e cópias; documentos adaptados têm mudanças identificadas acima. Os arquivos dos checkouts e workspace originais foram novamente comparados com o inventário. Nenhum arquivo foi apagado, movido ou escrito nas origens de implementação. As versões anteriores do destino continuam recuperáveis pelo Git; seus URLs antigos agora abrem atalhos para a documentação atual, sem republicar conteúdo obsoleto. Os PDFs existentes no destino foram preservados.

Links relativos, fragmentos e referências aos commits originais foram conferidos; não há links relativos sem destino. Padrões de chaves/tokens/credenciais foram verificados sem resultados nos Markdown selecionados e nas sínteses. Isso é uma conferência documental, e não certificação geral de segurança.

Foram copiados **seis PNGs**, todos usados diretamente no documento atual do modelo Boo v2 para explicar as poses. Nenhum PDF adicional, ZIP ou arquivo de implementação foi copiado. Os anexos foram verificados por SHA-256.

### Fontes selecionadas

- `ThiagoVenturaV/boopay-platform / DESIGN.md` → [DESIGN.md](boopay-platform/DESIGN.md).
- `ThiagoVenturaV/boopay-platform / docs/ADR-001-transactional-core.md` → [ADR-001-transactional-core.md](boopay-platform/docs/ADR-001-transactional-core.md).
- `ThiagoVenturaV/boopay-platform / docs/AI-PROFILE-UI.md` → [AI-PROFILE-UI.md](boopay-platform/docs/AI-PROFILE-UI.md).
- `ThiagoVenturaV/boopay-platform / docs/AI.md` → [AI.md](boopay-platform/docs/AI.md).
- `ThiagoVenturaV/boopay-platform / docs/API.md` → [API.md](boopay-platform/docs/API.md).
- `ThiagoVenturaV/boopay-platform / docs/BACKUP-RESTORE.md` → [BACKUP-RESTORE.md](boopay-platform/docs/BACKUP-RESTORE.md).
- `ThiagoVenturaV/boopay-platform / docs/CATALOG-FEED.md` → [CATALOG-FEED.md](boopay-platform/docs/CATALOG-FEED.md).
- `ThiagoVenturaV/boopay-platform / docs/CHECKOUT-COMMERCE.md` → [CHECKOUT-COMMERCE.md](boopay-platform/docs/CHECKOUT-COMMERCE.md).
- `ThiagoVenturaV/boopay-platform / docs/DASHBOARD.md` → [DASHBOARD.md](boopay-platform/docs/DASHBOARD.md).
- `ThiagoVenturaV/boopay-platform / docs/DATA-DASHBOARD.md` → [DATA-DASHBOARD.md](boopay-platform/docs/DATA-DASHBOARD.md).
- `ThiagoVenturaV/boopay-platform / docs/DATA-PROJECTIONS.md` → [DATA-PROJECTIONS.md](boopay-platform/docs/DATA-PROJECTIONS.md).
- `ThiagoVenturaV/boopay-platform / docs/DISCOVERY.md` → [DISCOVERY.md](boopay-platform/docs/DISCOVERY.md).
- `ThiagoVenturaV/boopay-platform / docs/GEO.md` → [GEO.md](boopay-platform/docs/GEO.md).
- `ThiagoVenturaV/boopay-platform / docs/GOOGLE-PAY.md` → [GOOGLE-PAY.md](boopay-platform/docs/GOOGLE-PAY.md).
- `ThiagoVenturaV/boopay-platform / docs/OPERATIONS.md` → [OPERATIONS.md](boopay-platform/docs/OPERATIONS.md).
- `ThiagoVenturaV/boopay-platform / docs/OUTBOX.md` → [OUTBOX.md](boopay-platform/docs/OUTBOX.md).
- `ThiagoVenturaV/boopay-platform / docs/PAYMENT-RENEWAL.md` → [PAYMENT-RENEWAL.md](boopay-platform/docs/PAYMENT-RENEWAL.md).
- `ThiagoVenturaV/boopay-platform / docs/PAYMENT-RUNTIME.md` → [PAYMENT-RUNTIME.md](boopay-platform/docs/PAYMENT-RUNTIME.md).
- `ThiagoVenturaV/boopay-platform / docs/PAYMENT-UI.md` → [PAYMENT-UI.md](boopay-platform/docs/PAYMENT-UI.md).
- `ThiagoVenturaV/boopay-platform / docs/PAYMENTS.md` → [PAYMENTS.md](boopay-platform/docs/PAYMENTS.md).
- `ThiagoVenturaV/boopay-platform / docs/PROFILE-STOREFRONT.md` → [PROFILE-STOREFRONT.md](boopay-platform/docs/PROFILE-STOREFRONT.md).
- `ThiagoVenturaV/boopay-platform / docs/PROFILE.md` → [PROFILE.md](boopay-platform/docs/PROFILE.md).
- `ThiagoVenturaV/boopay-platform / docs/PROTOCOL-ACCESS.md` → [PROTOCOL-ACCESS.md](boopay-platform/docs/PROTOCOL-ACCESS.md).
- `ThiagoVenturaV/boopay-platform / docs/PROTOCOL-COMMERCE.md` → [PROTOCOL-COMMERCE.md](boopay-platform/docs/PROTOCOL-COMMERCE.md).
- `ThiagoVenturaV/boopay-platform / docs/PROTOCOL-ORDERS.md` → [PROTOCOL-ORDERS.md](boopay-platform/docs/PROTOCOL-ORDERS.md).
- `ThiagoVenturaV/boopay-platform / docs/PROTOCOLS.md` → [PROTOCOLS.md](boopay-platform/docs/PROTOCOLS.md).
- `ThiagoVenturaV/boopay-platform / docs/RECOVERY-PRIVACY.md` → [RECOVERY-PRIVACY.md](boopay-platform/docs/RECOVERY-PRIVACY.md).
- `ThiagoVenturaV/boopay-platform / docs/REPORTING-ORIGINS.md` → [REPORTING-ORIGINS.md](boopay-platform/docs/REPORTING-ORIGINS.md).
- `ThiagoVenturaV/boopay-platform / docs/SHOPIFY-CONFIRMATION.md` → [SHOPIFY-CONFIRMATION.md](boopay-platform/docs/SHOPIFY-CONFIRMATION.md).
- `ThiagoVenturaV/boopay-platform / docs/SHOPIFY-DRAFTS.md` → [SHOPIFY-DRAFTS.md](boopay-platform/docs/SHOPIFY-DRAFTS.md).
- `ThiagoVenturaV/boopay-platform / docs/SHOPIFY.md` → [SHOPIFY.md](boopay-platform/docs/SHOPIFY.md).
- `ThiagoVenturaV/boopay-platform / docs/STORE-PROFILE-UI.md` → [STORE-PROFILE-UI.md](boopay-platform/docs/STORE-PROFILE-UI.md).
- `ThiagoVenturaV/boopay-platform / docs/STOREFRONT-PIXELS.md` → [STOREFRONT-PIXELS.md](boopay-platform/docs/STOREFRONT-PIXELS.md).
- `ThiagoVenturaV/boopay-platform / docs/STOREFRONT-TRACKING.md` → [STOREFRONT-TRACKING.md](boopay-platform/docs/STOREFRONT-TRACKING.md).
- `ThiagoVenturaV/boopay-platform / docs/VTEX-BAGGAGE.md` → [VTEX-BAGGAGE.md](boopay-platform/docs/VTEX-BAGGAGE.md).
- `ThiagoVenturaV/boopay-platform / docs/VTEX-BRIDGE-DEPENDENCIES.md` → [VTEX-BRIDGE-DEPENDENCIES.md](boopay-platform/docs/VTEX-BRIDGE-DEPENDENCIES.md).
- `ThiagoVenturaV/boopay-platform / docs/VTEX-BRIDGE-RUNTIME.md` → [VTEX-BRIDGE-RUNTIME.md](boopay-platform/docs/VTEX-BRIDGE-RUNTIME.md).
- `ThiagoVenturaV/boopay-platform / docs/VTEX-CANCELLATION-UI.md` → [VTEX-CANCELLATION-UI.md](boopay-platform/docs/VTEX-CANCELLATION-UI.md).
- `ThiagoVenturaV/boopay-platform / docs/VTEX-CANCELLATION.md` → [VTEX-CANCELLATION.md](boopay-platform/docs/VTEX-CANCELLATION.md).
- `ThiagoVenturaV/boopay-platform / docs/VTEX-CATALOG-UI.md` → [VTEX-CATALOG-UI.md](boopay-platform/docs/VTEX-CATALOG-UI.md).
- `ThiagoVenturaV/boopay-platform / docs/VTEX-CATALOG-UPDATES.md` → [VTEX-CATALOG-UPDATES.md](boopay-platform/docs/VTEX-CATALOG-UPDATES.md).
- `ThiagoVenturaV/boopay-platform / docs/VTEX-CHECKOUT.md` → [VTEX-CHECKOUT.md](boopay-platform/docs/VTEX-CHECKOUT.md).
- `ThiagoVenturaV/boopay-platform / docs/VTEX-JAEGER.md` → [VTEX-JAEGER.md](boopay-platform/docs/VTEX-JAEGER.md).
- `ThiagoVenturaV/boopay-platform / docs/VTEX-MULTIPART.md` → [VTEX-MULTIPART.md](boopay-platform/docs/VTEX-MULTIPART.md).
- `ThiagoVenturaV/boopay-platform / docs/VTEX-OBSERVATION.md` → [VTEX-OBSERVATION.md](boopay-platform/docs/VTEX-OBSERVATION.md).
- `ThiagoVenturaV/boopay-platform / docs/VTEX-PROMETHEUS.md` → [VTEX-PROMETHEUS.md](boopay-platform/docs/VTEX-PROMETHEUS.md).
- `ThiagoVenturaV/boopay-platform / docs/VTEX-UUID.md` → [VTEX-UUID.md](boopay-platform/docs/VTEX-UUID.md).
- `ThiagoVenturaV/boopay-platform / docs/VTEX.md` → [VTEX.md](boopay-platform/docs/VTEX.md).
- `ThiagoVenturaV/boopay-platform / docs/WOO-PROFILE.md` → [WOO-PROFILE.md](boopay-platform/docs/WOO-PROFILE.md).
- `ThiagoVenturaV/boopay-platform / docs/WOOCOMMERCE.md` → [WOOCOMMERCE.md](boopay-platform/docs/WOOCOMMERCE.md).
- `ThiagoVenturaV/boopay-platform / infra/google-data/README.md` → [README.md](boopay-platform/infra/google-data/README.md).
- `ThiagoVenturaV/boopay-platform / README.md` → [README.md](boopay-platform/README.md).
- `ThiagoVenturaV/boopay-platform / tools/vtex-catalog/node/vendor/otel-core/BOOPAY-MAINTENANCE.md` → [BOOPAY-MAINTENANCE.md](boopay-platform/tools/vtex-catalog/node/vendor/otel-core/BOOPAY-MAINTENANCE.md).
- `ThiagoVenturaV/boopay-platform / tools/vtex-catalog/README.md` → [README.md](boopay-platform/tools/vtex-catalog/README.md).
- `ThiagoVenturaV/boopay-landing / DESIGN.md` → [DESIGN.md](boopay-landing/DESIGN.md).
- `ThiagoVenturaV/boopay-landing / docs/boo-v2.md` → [boo-v2.md](boopay-landing/docs/boo-v2.md).
- `ThiagoVenturaV/boopay-landing / README.md` → [README.md](boopay-landing/README.md).
- `ThiagoVenturaV/pluginboopay / boopay-api-demo/README.md` → [README.md](pluginboopay/boopay-api-demo/README.md).
- `ThiagoVenturaV/pluginboopay / boopay-woocommerce/docs/API-CONTRACT.md` → [API-CONTRACT.md](pluginboopay/boopay-woocommerce/docs/API-CONTRACT.md).
- `ThiagoVenturaV/pluginboopay / boopay-woocommerce/docs/COMMERCE-GUARD.md` → [COMMERCE-GUARD.md](pluginboopay/boopay-woocommerce/docs/COMMERCE-GUARD.md).
- `ThiagoVenturaV/pluginboopay / boopay-woocommerce/docs/PAYMENT-COMPENSATION.md` → [PAYMENT-COMPENSATION.md](pluginboopay/boopay-woocommerce/docs/PAYMENT-COMPENSATION.md).
- `ThiagoVenturaV/pluginboopay / boopay-woocommerce/docs/PAYMENT-GATE.md` → [PAYMENT-GATE.md](pluginboopay/boopay-woocommerce/docs/PAYMENT-GATE.md).
- `ThiagoVenturaV/pluginboopay / boopay-woocommerce/docs/PROFILE-LINK.md` → [PROFILE-LINK.md](pluginboopay/boopay-woocommerce/docs/PROFILE-LINK.md).
- `ThiagoVenturaV/pluginboopay / boopay-woocommerce/docs/TRACKING-DELIVERY.md` → [TRACKING-DELIVERY.md](pluginboopay/boopay-woocommerce/docs/TRACKING-DELIVERY.md).
- `ThiagoVenturaV/pluginboopay / boopay-woocommerce/README.md` → [README.md](pluginboopay/boopay-woocommerce/README.md).
- `ThiagoVenturaV/pluginboopay / marketplace/DECISIONS-NEEDED.md` → [DECISIONS-NEEDED.md](pluginboopay/marketplace/DECISIONS-NEEDED.md).
- `ThiagoVenturaV/pluginboopay / marketplace/EXTERNAL-PROCESS.md` → [EXTERNAL-PROCESS.md](pluginboopay/marketplace/EXTERNAL-PROCESS.md).
- `ThiagoVenturaV/pluginboopay / marketplace/MARKETPLACE-READINESS.md` → [MARKETPLACE-READINESS.md](pluginboopay/marketplace/MARKETPLACE-READINESS.md).
- `ThiagoVenturaV/pluginboopay / marketplace/PRIVACY-DISCLOSURE.md` → [PRIVACY-DISCLOSURE.md](pluginboopay/marketplace/PRIVACY-DISCLOSURE.md).
- `ThiagoVenturaV/pluginboopay / marketplace/PRODUCT-LISTING.md` → [PRODUCT-LISTING.md](pluginboopay/marketplace/PRODUCT-LISTING.md).
- `ThiagoVenturaV/pluginboopay / marketplace/PUBLIC-DOCUMENTATION.md` → [PUBLIC-DOCUMENTATION.md](pluginboopay/marketplace/PUBLIC-DOCUMENTATION.md).
- `ThiagoVenturaV/pluginboopay / marketplace/README.md` → [README.md](pluginboopay/marketplace/README.md).
- `ThiagoVenturaV/pluginboopay / marketplace/REVIEWER-INSTRUCTIONS.md` → [REVIEWER-INSTRUCTIONS.md](pluginboopay/marketplace/REVIEWER-INSTRUCTIONS.md).
- `ThiagoVenturaV/pluginboopay / marketplace/SUBMISSION-FORM.md` → [SUBMISSION-FORM.md](pluginboopay/marketplace/SUBMISSION-FORM.md).
- `ThiagoVenturaV/pluginboopay / marketplace/SUPPORT-AND-MAINTENANCE.md` → [SUPPORT-AND-MAINTENANCE.md](pluginboopay/marketplace/SUPPORT-AND-MAINTENANCE.md).
- `ThiagoVenturaV/pluginboopay / README.md` → [README.md](pluginboopay/README.md).
- `ThiagoVenturaV/Boopay / Boopay-01-ESCOPO-MVP.md` → [Boopay-01-ESCOPO-MVP.md](Boopay/Boopay-01-ESCOPO-MVP.md).
- `ThiagoVenturaV/Boopay / Boopay-02-ARQUITETURA-E-FLUXOS.md` → [Boopay-02-ARQUITETURA-E-FLUXOS.md](Boopay/Boopay-02-ARQUITETURA-E-FLUXOS.md).
- `ThiagoVenturaV/Boopay / Boopay-03-ROADMAP-E-ACEITE.md` → [Boopay-03-ROADMAP-E-ACEITE.md](Boopay/Boopay-03-ROADMAP-E-ACEITE.md).
- `ThiagoVenturaV/Boopay / Boopay-04-BACKLOG.md` → [Boopay-04-BACKLOG.md](Boopay/Boopay-04-BACKLOG.md).
- `ThiagoVenturaV/Boopay / Boopay-05-DICIONARIO-TECNICO.md` → [Boopay-05-DICIONARIO-TECNICO.md](Boopay/Boopay-05-DICIONARIO-TECNICO.md).
- `ThiagoVenturaV/Boopay / Boopay-07-CHECKOUT-CONVERSACIONAL.md` → [Boopay-07-CHECKOUT-CONVERSACIONAL.md](Boopay/Boopay-07-CHECKOUT-CONVERSACIONAL.md).
- `ThiagoVenturaV/Boopay / Boopay-08-GEO-E-CHECKOUT-INVISIVEL.md` → [Boopay-08-GEO-E-CHECKOUT-INVISIVEL.md](Boopay/Boopay-08-GEO-E-CHECKOUT-INVISIVEL.md).

<details>
<summary>Arquivos excluídos das branches atuais e do workspace</summary>

- `ThiagoVenturaV/Boopay / remote-default / Boopay-00-INDICE.md`: Publicação antiga superada pelos documentos atuais do workspace; README será substituído pela síntese atual e URLs legadas apontarão aos detalhes atuais.
- `ThiagoVenturaV/Boopay / remote-default / Boopay-01-ESCOPO-MVP.md`: Publicação antiga superada pelos documentos atuais do workspace; README será substituído pela síntese atual e URLs legadas apontarão aos detalhes atuais.
- `ThiagoVenturaV/Boopay / remote-default / Boopay-02-ARQUITETURA-E-FLUXOS.md`: Publicação antiga superada pelos documentos atuais do workspace; README será substituído pela síntese atual e URLs legadas apontarão aos detalhes atuais.
- `ThiagoVenturaV/Boopay / remote-default / Boopay-03-ROADMAP-E-ACEITE.md`: Publicação antiga superada pelos documentos atuais do workspace; README será substituído pela síntese atual e URLs legadas apontarão aos detalhes atuais.
- `ThiagoVenturaV/Boopay / remote-default / Boopay-04-BACKLOG.md`: Publicação antiga superada pelos documentos atuais do workspace; README será substituído pela síntese atual e URLs legadas apontarão aos detalhes atuais.
- `ThiagoVenturaV/Boopay / remote-default / Boopay-05-DICIONARIO-TECNICO.md`: Publicação antiga superada pelos documentos atuais do workspace; README será substituído pela síntese atual e URLs legadas apontarão aos detalhes atuais.
- `ThiagoVenturaV/Boopay / remote-default / Boopay-06-BRIEFING-REUNIAO-ROGERIO-2026-08-24.md`: Publicação antiga superada pelos documentos atuais do workspace; README será substituído pela síntese atual e URLs legadas apontarão aos detalhes atuais.
- `ThiagoVenturaV/Boopay / remote-default / Boopay.md`: Publicação antiga superada pelos documentos atuais do workspace; README será substituído pela síntese atual e URLs legadas apontarão aos detalhes atuais.
- `ThiagoVenturaV/Boopay / remote-default / README.md`: Publicação antiga superada pelos documentos atuais do workspace; README será substituído pela síntese atual e URLs legadas apontarão aos detalhes atuais.
- `ThiagoVenturaV/boopay-platform / remote-default / .impeccable/review/geo-finish-review.md`: Instruções ou contexto para agentes/ferramentas de geração, sem finalidade de leitura da documentação do projeto.
- `ThiagoVenturaV/boopay-platform / remote-default / .impeccable/review/geo-verdict-f1.md`: Instruções ou contexto para agentes/ferramentas de geração, sem finalidade de leitura da documentação do projeto.
- `ThiagoVenturaV/boopay-platform / remote-default / .impeccable/surfaces/dashboard.md`: Instruções ou contexto para agentes/ferramentas de geração, sem finalidade de leitura da documentação do projeto.
- `ThiagoVenturaV/boopay-platform / remote-default / .impeccable/surfaces/web-src-agents-tsx.md`: Instruções ou contexto para agentes/ferramentas de geração, sem finalidade de leitura da documentação do projeto.
- `ThiagoVenturaV/boopay-platform / remote-default / .impeccable/surfaces/web-src-geopanel-tsx.md`: Instruções ou contexto para agentes/ferramentas de geração, sem finalidade de leitura da documentação do projeto.
- `ThiagoVenturaV/boopay-platform / remote-default / .impeccable/surfaces/web-src-payments-tsx.md`: Instruções ou contexto para agentes/ferramentas de geração, sem finalidade de leitura da documentação do projeto.
- `ThiagoVenturaV/boopay-platform / remote-default / .impeccable/surfaces/web-src-protocolaccess-tsx.md`: Instruções ou contexto para agentes/ferramentas de geração, sem finalidade de leitura da documentação do projeto.
- `ThiagoVenturaV/boopay-platform / remote-default / .impeccable/surfaces/web-src-protocolreview-tsx.md`: Instruções ou contexto para agentes/ferramentas de geração, sem finalidade de leitura da documentação do projeto.
- `ThiagoVenturaV/boopay-platform / remote-default / .impeccable/surfaces/web-src-shopifyintegration-tsx.md`: Instruções ou contexto para agentes/ferramentas de geração, sem finalidade de leitura da documentação do projeto.
- `ThiagoVenturaV/boopay-platform / remote-default / .impeccable/surfaces/web-src-storeprofile-tsx.md`: Instruções ou contexto para agentes/ferramentas de geração, sem finalidade de leitura da documentação do projeto.
- `ThiagoVenturaV/boopay-platform / remote-default / .impeccable/surfaces/web-src-stripewallet-tsx.md`: Instruções ou contexto para agentes/ferramentas de geração, sem finalidade de leitura da documentação do projeto.
- `ThiagoVenturaV/boopay-platform / remote-default / .impeccable/surfaces/web-src-vtexcancellation-tsx.md`: Instruções ou contexto para agentes/ferramentas de geração, sem finalidade de leitura da documentação do projeto.
- `ThiagoVenturaV/boopay-platform / remote-default / .impeccable/surfaces/web-src-vtexcatalogqueue-tsx.md`: Instruções ou contexto para agentes/ferramentas de geração, sem finalidade de leitura da documentação do projeto.
- `ThiagoVenturaV/boopay-platform / remote-default / .impeccable/surfaces/web-src-vtexintegrations-tsx.md`: Instruções ou contexto para agentes/ferramentas de geração, sem finalidade de leitura da documentação do projeto.
- `ThiagoVenturaV/boopay-platform / remote-default / .impeccable/surfaces/woo-profile-shortcode.md`: Instruções ou contexto para agentes/ferramentas de geração, sem finalidade de leitura da documentação do projeto.
- `ThiagoVenturaV/boopay-platform / remote-default / docs/ai-profile-surface-brief.md`: Brief de implementação para agentes; especificação funcional final preservada no documento correspondente.
- `ThiagoVenturaV/boopay-platform / remote-default / docs/AI-PROFILE-UI-REVIEW.md`: Parecer ou relatório de execução/revisão de agentes; comportamento final está no contrato funcional.
- `ThiagoVenturaV/boopay-platform / remote-default / docs/CATALOG-FEED-UI-REVIEW.md`: Parecer ou relatório de execução/revisão de agentes; comportamento final está no contrato funcional.
- `ThiagoVenturaV/boopay-platform / remote-default / docs/DATA-DASHBOARD-UI-REVIEW.md`: Parecer ou relatório de execução/revisão de agentes; comportamento final está no contrato funcional.
- `ThiagoVenturaV/boopay-platform / remote-default / docs/DELIVERY.md`: Registro cronológico de incrementos e verificações, consolidado em ESTADO-ATUAL.md, CRITERIOS-DE-ACEITE.md e README atual.
- `ThiagoVenturaV/boopay-platform / remote-default / docs/DISCOVERY-UI-REVIEW.md`: Parecer ou relatório de execução/revisão de agentes; comportamento final está no contrato funcional.
- `ThiagoVenturaV/boopay-platform / remote-default / docs/ENTREGA-2026-09-11.md`: Registro cronológico de incrementos e verificações, consolidado em ESTADO-ATUAL.md, CRITERIOS-DE-ACEITE.md e README atual.
- `ThiagoVenturaV/boopay-platform / remote-default / docs/GOOGLE-PAY-BRIEF.md`: Brief de implementação para agentes; especificação funcional final preservada no documento correspondente.
- `ThiagoVenturaV/boopay-platform / remote-default / docs/GOOGLE-PAY-REVIEW.md`: Parecer ou relatório de execução/revisão de agentes; comportamento final está no contrato funcional.
- `ThiagoVenturaV/boopay-platform / remote-default / docs/PAYMENT-RENEWAL-UI-REVIEW.md`: Parecer ou relatório de execução/revisão de agentes; comportamento final está no contrato funcional.
- `ThiagoVenturaV/boopay-platform / remote-default / docs/PAYMENT-UI-BRIEF.md`: Brief de implementação para agentes; especificação funcional final preservada no documento correspondente.
- `ThiagoVenturaV/boopay-platform / remote-default / docs/PAYMENT-UI-REVIEW.md`: Parecer ou relatório de execução/revisão de agentes; comportamento final está no contrato funcional.
- `ThiagoVenturaV/boopay-platform / remote-default / docs/PROTOCOL-ACCESS-UI-REVIEW.md`: Parecer ou relatório de execução/revisão de agentes; comportamento final está no contrato funcional.
- `ThiagoVenturaV/boopay-platform / remote-default / docs/PROTOCOL-REVIEW-BRIEF.md`: Brief de implementação para agentes; especificação funcional final preservada no documento correspondente.
- `ThiagoVenturaV/boopay-platform / remote-default / docs/PROTOCOL-REVIEW.md`: Parecer ou relatório de execução/revisão de agentes; comportamento final está no contrato funcional.
- `ThiagoVenturaV/boopay-platform / remote-default / docs/reference/Boopay-00-INDICE.md`: Cópia de referência/histórica; documentos vigentes de produto centralizados em Boopay.
- `ThiagoVenturaV/boopay-platform / remote-default / docs/reference/Boopay-01-ESCOPO-MVP.md`: Cópia de referência/histórica; documentos vigentes de produto centralizados em Boopay.
- `ThiagoVenturaV/boopay-platform / remote-default / docs/reference/Boopay-02-ARQUITETURA-E-FLUXOS.md`: Cópia de referência/histórica; documentos vigentes de produto centralizados em Boopay.
- `ThiagoVenturaV/boopay-platform / remote-default / docs/reference/Boopay-03-ROADMAP-E-ACEITE.md`: Cópia de referência/histórica; documentos vigentes de produto centralizados em Boopay.
- `ThiagoVenturaV/boopay-platform / remote-default / docs/reference/Boopay-04-BACKLOG.md`: Cópia de referência/histórica; documentos vigentes de produto centralizados em Boopay.
- `ThiagoVenturaV/boopay-platform / remote-default / docs/reference/Boopay-05-DICIONARIO-TECNICO.md`: Cópia de referência/histórica; documentos vigentes de produto centralizados em Boopay.
- `ThiagoVenturaV/boopay-platform / remote-default / docs/reference/Boopay-06-BRIEFING-REUNIAO-ROGERIO-2026-08-24.md`: Cópia de referência/histórica; documentos vigentes de produto centralizados em Boopay.
- `ThiagoVenturaV/boopay-platform / remote-default / docs/reference/Boopay-07-CHECKOUT-CONVERSACIONAL.md`: Cópia de referência/histórica; documentos vigentes de produto centralizados em Boopay.
- `ThiagoVenturaV/boopay-platform / remote-default / docs/reference/Boopay-08-GEO-E-CHECKOUT-INVISIVEL.md`: Cópia de referência/histórica; documentos vigentes de produto centralizados em Boopay.
- `ThiagoVenturaV/boopay-platform / remote-default / docs/reference/Boopay.md`: Cópia de referência/histórica; documentos vigentes de produto centralizados em Boopay.
- `ThiagoVenturaV/boopay-platform / remote-default / docs/reference/README.md`: Cópia de referência/histórica; documentos vigentes de produto centralizados em Boopay.
- `ThiagoVenturaV/boopay-platform / remote-default / docs/REPORTING-ORIGINS-UI-REVIEW.md`: Parecer ou relatório de execução/revisão de agentes; comportamento final está no contrato funcional.
- `ThiagoVenturaV/boopay-platform / remote-default / docs/SHOPIFY-UI-REVIEW.md`: Parecer ou relatório de execução/revisão de agentes; comportamento final está no contrato funcional.
- `ThiagoVenturaV/boopay-platform / remote-default / docs/STATUS.md`: Registro cronológico de incrementos e verificações, consolidado em ESTADO-ATUAL.md, CRITERIOS-DE-ACEITE.md e README atual.
- `ThiagoVenturaV/boopay-platform / remote-default / docs/STORE-PROFILE-DIRECTION.md`: Brief de implementação para agentes; especificação funcional final preservada no documento correspondente.
- `ThiagoVenturaV/boopay-platform / remote-default / docs/STORE-PROFILE-UI-REVIEW.md`: Parecer ou relatório de execução/revisão de agentes; comportamento final está no contrato funcional.
- `ThiagoVenturaV/boopay-platform / remote-default / docs/UI-REVIEW.md`: Parecer ou relatório de execução/revisão de agentes; comportamento final está no contrato funcional.
- `ThiagoVenturaV/boopay-platform / remote-default / docs/VTEX-CANCELLATION-UI-REVIEW.md`: Parecer ou relatório de execução/revisão de agentes; comportamento final está no contrato funcional.
- `ThiagoVenturaV/boopay-platform / remote-default / docs/VTEX-CATALOG-UI-REVIEW.md`: Parecer ou relatório de execução/revisão de agentes; comportamento final está no contrato funcional.
- `ThiagoVenturaV/boopay-platform / remote-default / docs/VTEX-UI-REVIEW.md`: Parecer ou relatório de execução/revisão de agentes; comportamento final está no contrato funcional.
- `ThiagoVenturaV/boopay-platform / remote-default / docs/WOO-PROFILE-UI-REVIEW.md`: Parecer ou relatório de execução/revisão de agentes; comportamento final está no contrato funcional.
- `ThiagoVenturaV/boopay-platform / remote-default / PRODUCT.md`: Instruções ou contexto para agentes/ferramentas de geração, sem finalidade de leitura da documentação do projeto.
- `ThiagoVenturaV/boopay-platform / remote-default / vendor/protocols/README.md`: Proveniência técnica consolidada em PROTOCOLOS-FONTES.md, sem copiar documentação de terceiros.
- `ThiagoVenturaV/boopay-landing / remote-default / .impeccable/surfaces/app-page-tsx.md`: Instruções ou contexto para agentes/ferramentas de geração, sem finalidade de leitura da documentação do projeto.
- `ThiagoVenturaV/boopay-landing / remote-default / AGENTS.md`: Instruções ou contexto para agentes/ferramentas de geração, sem finalidade de leitura da documentação do projeto.
- `ThiagoVenturaV/boopay-landing / remote-default / assets/references/boo-hero-award-informed-v1.prompt.md`: Instruções ou contexto para agentes/ferramentas de geração, sem finalidade de leitura da documentação do projeto.
- `ThiagoVenturaV/boopay-landing / remote-default / CLAUDE.md`: Instruções ou contexto para agentes/ferramentas de geração, sem finalidade de leitura da documentação do projeto.
- `ThiagoVenturaV/boopay-landing / remote-default / PRODUCT.md`: Instruções ou contexto para agentes/ferramentas de geração, sem finalidade de leitura da documentação do projeto.
- `ThiagoVenturaV/pluginboopay / remote-default / boopay-identidade/README.md`: Exploração anterior de marca/assets; direção visual vigente está em DESIGN.md e no README atual.
- `ThiagoVenturaV/pluginboopay / remote-default / boopay-woocommerce/docs/RELEASE-0.7.2.md`: Relatório de versão/execução; evidência mais recente e limites consolidados no estado atual, sem republicar histórico.
- `ThiagoVenturaV/pluginboopay / remote-default / marketplace/ASSET-MANIFEST.md`: Exploração anterior de marca/assets; direção visual vigente está em DESIGN.md e no README atual.
- `ThiagoVenturaV/pluginboopay / remote-default / marketplace/VALIDATION-0.2.1.md`: Relatório de versão/execução; evidência mais recente e limites consolidados no estado atual, sem republicar histórico.
- `ThiagoVenturaV/pluginboopay / remote-default / marketplace/VALIDATION-0.3.0.md`: Relatório de versão/execução; evidência mais recente e limites consolidados no estado atual, sem republicar histórico.
- `ThiagoVenturaV/pluginboopay / remote-default / marketplace/VALIDATION-0.4.0.md`: Relatório de versão/execução; evidência mais recente e limites consolidados no estado atual, sem republicar histórico.
- `ThiagoVenturaV/pluginboopay / remote-default / marketplace/VALIDATION-0.5.0.md`: Relatório de versão/execução; evidência mais recente e limites consolidados no estado atual, sem republicar histórico.
- `ThiagoVenturaV/pluginboopay / remote-default / marketplace/VALIDATION-0.6.0.md`: Relatório de versão/execução; evidência mais recente e limites consolidados no estado atual, sem republicar histórico.
- `ThiagoVenturaV/pluginboopay / remote-default / marketplace/VALIDATION-REPORT.md`: Relatório de versão/execução; evidência mais recente e limites consolidados no estado atual, sem republicar histórico.
- `Pedro-Lucas001/boopay / remote-default / README.md`: README contém apenas o título “boopay”, sem documentação substantiva; origem inspecionada, nenhum conteúdo atual a centralizar.
- `ThiagoVenturaV/Boopay / local-workspace / Boopay-00-INDICE.md`: Versão histórica, briefing encerrado, conceito anterior, log de prompts ou conjunto duplicado/superado pelo repositório atual.
- `ThiagoVenturaV/Boopay / local-workspace / Boopay-06-BRIEFING-REUNIAO-ROGERIO-2026-08-24.md`: Versão histórica, briefing encerrado, conceito anterior, log de prompts ou conjunto duplicado/superado pelo repositório atual.
- `ThiagoVenturaV/Boopay / local-workspace / boopay-api-demo/README.md`: Versão histórica, briefing encerrado, conceito anterior, log de prompts ou conjunto duplicado/superado pelo repositório atual.
- `ThiagoVenturaV/Boopay / local-workspace / boopay-identidade/README.md`: Versão histórica, briefing encerrado, conceito anterior, log de prompts ou conjunto duplicado/superado pelo repositório atual.
- `ThiagoVenturaV/Boopay / local-workspace / boopay-landing-conceito-2026-08-28/01-pesquisa-referencias.md`: Versão histórica, briefing encerrado, conceito anterior, log de prompts ou conjunto duplicado/superado pelo repositório atual.
- `ThiagoVenturaV/Boopay / local-workspace / boopay-landing-conceito-2026-08-28/02-direcao-visual.md`: Versão histórica, briefing encerrado, conceito anterior, log de prompts ou conjunto duplicado/superado pelo repositório atual.
- `ThiagoVenturaV/Boopay / local-workspace / boopay-landing-conceito-2026-08-28/03-storyboard-implementacao.md`: Versão histórica, briefing encerrado, conceito anterior, log de prompts ou conjunto duplicado/superado pelo repositório atual.
- `ThiagoVenturaV/Boopay / local-workspace / boopay-landing-conceito-2026-08-28/04-prompts-gpt-image.md`: Versão histórica, briefing encerrado, conceito anterior, log de prompts ou conjunto duplicado/superado pelo repositório atual.
- `ThiagoVenturaV/Boopay / local-workspace / boopay-landing-conceito-2026-08-28/05-briefing-para-agente.md`: Versão histórica, briefing encerrado, conceito anterior, log de prompts ou conjunto duplicado/superado pelo repositório atual.
- `ThiagoVenturaV/Boopay / local-workspace / boopay-landing-conceito-2026-08-28/README.md`: Versão histórica, briefing encerrado, conceito anterior, log de prompts ou conjunto duplicado/superado pelo repositório atual.
- `ThiagoVenturaV/Boopay / local-workspace / boopay-woocommerce/docs/API-CONTRACT.md`: Versão histórica, briefing encerrado, conceito anterior, log de prompts ou conjunto duplicado/superado pelo repositório atual.
- `ThiagoVenturaV/Boopay / local-workspace / boopay-woocommerce/README.md`: Versão histórica, briefing encerrado, conceito anterior, log de prompts ou conjunto duplicado/superado pelo repositório atual.
- `ThiagoVenturaV/Boopay / local-workspace / Boopay.md`: Versão histórica, briefing encerrado, conceito anterior, log de prompts ou conjunto duplicado/superado pelo repositório atual.
- `ThiagoVenturaV/Boopay / local-workspace / marketplace/ASSET-MANIFEST.md`: Versão histórica, briefing encerrado, conceito anterior, log de prompts ou conjunto duplicado/superado pelo repositório atual.
- `ThiagoVenturaV/Boopay / local-workspace / marketplace/DECISIONS-NEEDED.md`: Versão histórica, briefing encerrado, conceito anterior, log de prompts ou conjunto duplicado/superado pelo repositório atual.
- `ThiagoVenturaV/Boopay / local-workspace / marketplace/EXTERNAL-PROCESS.md`: Versão histórica, briefing encerrado, conceito anterior, log de prompts ou conjunto duplicado/superado pelo repositório atual.
- `ThiagoVenturaV/Boopay / local-workspace / marketplace/MARKETPLACE-READINESS.md`: Versão histórica, briefing encerrado, conceito anterior, log de prompts ou conjunto duplicado/superado pelo repositório atual.
- `ThiagoVenturaV/Boopay / local-workspace / marketplace/PRIVACY-DISCLOSURE.md`: Versão histórica, briefing encerrado, conceito anterior, log de prompts ou conjunto duplicado/superado pelo repositório atual.
- `ThiagoVenturaV/Boopay / local-workspace / marketplace/PRODUCT-LISTING.md`: Versão histórica, briefing encerrado, conceito anterior, log de prompts ou conjunto duplicado/superado pelo repositório atual.
- `ThiagoVenturaV/Boopay / local-workspace / marketplace/PUBLIC-DOCUMENTATION.md`: Versão histórica, briefing encerrado, conceito anterior, log de prompts ou conjunto duplicado/superado pelo repositório atual.
- `ThiagoVenturaV/Boopay / local-workspace / marketplace/README.md`: Versão histórica, briefing encerrado, conceito anterior, log de prompts ou conjunto duplicado/superado pelo repositório atual.
- `ThiagoVenturaV/Boopay / local-workspace / marketplace/REVIEWER-INSTRUCTIONS.md`: Versão histórica, briefing encerrado, conceito anterior, log de prompts ou conjunto duplicado/superado pelo repositório atual.
- `ThiagoVenturaV/Boopay / local-workspace / marketplace/SUBMISSION-FORM.md`: Versão histórica, briefing encerrado, conceito anterior, log de prompts ou conjunto duplicado/superado pelo repositório atual.
- `ThiagoVenturaV/Boopay / local-workspace / marketplace/SUPPORT-AND-MAINTENANCE.md`: Versão histórica, briefing encerrado, conceito anterior, log de prompts ou conjunto duplicado/superado pelo repositório atual.
- `ThiagoVenturaV/Boopay / local-workspace / marketplace/VALIDATION-REPORT.md`: Versão histórica, briefing encerrado, conceito anterior, log de prompts ou conjunto duplicado/superado pelo repositório atual.
- `ThiagoVenturaV/Boopay / local-workspace / PROMPT-OPS-BOOPAY.md`: Versão histórica, briefing encerrado, conceito anterior, log de prompts ou conjunto duplicado/superado pelo repositório atual.
- `ThiagoVenturaV/Boopay / local-workspace / PROMPTS-DO-PROJETO.md`: Versão histórica, briefing encerrado, conceito anterior, log de prompts ou conjunto duplicado/superado pelo repositório atual.
- `ThiagoVenturaV/Boopay / local-workspace / README.md`: Versão histórica, briefing encerrado, conceito anterior, log de prompts ou conjunto duplicado/superado pelo repositório atual.

</details>
