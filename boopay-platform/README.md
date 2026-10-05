# Boopay Platform

Implementação privada do núcleo comercial, API, dados e painel do Boopay. O objetivo é executar a jornada de catálogo e GEO até uma compra com confirmação explícita, pedido e atribuição auditável.

**Em implementação.** Os critérios completos estão em `docs/DELIVERY.md`. Um teste local ou simulador não prova homologação de WooCommerce, Shopify, VTEX, ACP, UCP, Stripe, Google Pay ou superfícies oficiais.

A [entrega consolidada de 11/09/2026](docs/ESTADO-ATUAL.md) reúne o produto, os repositórios privados, a última validação e as pendências para fechar a meta.

A [atualização incremental VTEX](docs/VTEX-CATALOG-UPDATES.md) acrescenta notificações assinadas, fila durável e releitura por SKU. O candidato Broadcaster passou em compilação e ensaio HTTP com VTEX sintética; sua instalação permanece pendente por vulnerabilidades do SDK oficial e homologação externa. O opt-in é independente e desligado por padrão. A [interface da fila](docs/VTEX-CATALOG-UI.md), nas Configurações, mostra estados, limites e próxima tentativa elegível sem acionar a loja.

## Organização

A [API de vínculo entre loja e perfil](docs/PROFILE-STOREFRONT.md) recebe atividade futura sob autorização específica do comprador e permite revogar/apagar o vínculo. O [aceite visual e a entrega direta aos SDKs Shopify/VTEX 0.2.0](docs/STORE-PROFILE-UI.md) passaram em Chromium/HTTP/Core com APIs de loja sintéticas. A [ponte WooCommerce 0.7.2](docs/WOO-PROFILE.md) passou no WordPress/PHP/MySQL real: sessão nativa, capacidade cifrada, fila prospectiva, carrinho e revogação. Instalação e homologação nas lojas autorizadas continuam pendentes.

A [coleta storefront](docs/STOREFRONT-TRACKING.md) integra o SDK e os eventos nativos WooCommerce ao Core, com IDs estáveis, fila/recibos e deduplicação. Os [coletores Shopify/VTEX](docs/STOREFRONT-PIXELS.md) acrescentam pacotes instaláveis, consentimento e receptor comum; APIs das lojas foram simuladas nos ensaios de navegador, e a instalação externa continua pendente.

O [acompanhamento automático VTEX](docs/VTEX-OBSERVATION.md) consulta pedidos existentes sem reenviar etapas comerciais. A agenda tem limites, lease e tentativas progressivas persistidos; o estado fica disponível na API administrativa. A demonstração usa VTEX sintética, sem comprovar captura de pagamento ou homologação externa.

A [trilha de descoberta e compra](docs/DISCOVERY.md) preserva catálogo/GEO na recomendação e vincula a seleção ao checkout e pedido. O painel concilia cobertura completa, parcial e sem vínculo, com exportação e exclusão dos dados pessoais. `npm run discovery:demo`, após o build, reproduz GEO sintético → recomendação → compra/abandono → estorno → receita, sem chamadas externas.

O [adaptador Shopify de desenvolvimento](docs/SHOPIFY.md) acrescenta catálogo, cálculo, pedido pendente, consulta da tentativa original, webhooks e controles de sincronização. A [limpeza de rascunhos](docs/SHOPIFY-DRAFTS.md) registra tentativas antes da criação, recupera respostas perdidas e protege tentativas de conclusão; a exclusão fica desativada por padrão. O transporte Shopify dos testes é sintético; pagamento nativo, garantia atômica entre resumo e conclusão, retenção externa completa e homologação na loja permanecem pendentes.

A [integração VTEX](docs/VTEX.md) oferece inspeção por canal/vendedor e, com configuração privada adicional, [checkout com promissória de teste](docs/VTEX-CHECKOUT.md): catálogo canônico, cotação, confirmação, pedido pendente, registro durável das etapas, conciliação e interface. Permanece desligada por padrão. Testes usam transporte VTEX sintético; PSP/captura, expurgo remoto e homologação externa continuam pendentes. A demo reproduzível é `npm run vtex:checkout:demo`, após o build. [ACP/UCP também passam por Shopify e VTEX](docs/PROTOCOL-COMMERCE.md), com confirmação pela sessão do comprador e sem reconhecer receita paga: `npm run protocols:commerce:demo` reproduz as quatro jornadas com transportes nativos sintéticos.

As [projeções de dados](docs/DATA-PROJECTIONS.md) acrescentam outbox versionada, clientes Firestore/BigQuery, leitura autorizada e relatório financeiro para conciliação. Permanecem desligadas por padrão. Firestore tem ensaios HTTP no emulador oficial; BigQuery usa respostas sintéticas. O [painel analítico](docs/DATA-DASHBOARD.md) abre na base operacional e pode consultar/selecionar agregados BigQuery sob demanda, comparando métricas e versões; execução cloud e paridade no projeto autorizado ainda aguardam validação.

O painel inclui [filtros e funil por origem](docs/REPORTING-ORIGINS.md), receita por canal/superfície/protocolo e CSV de sessões. A medição distingue conclusão informada na mesma página, navegação registrada e ausência de relato. Compras antigas não viram sucesso sem redirecionamento; moedas permanecem separadas e a seleção acompanha as disponíveis no recorte.

A camada [GEO e prontidão de catálogo](docs/GEO.md) inclui fila persistida, acompanhamento da KeyCore, qualificação de relatórios incompletos e interface em **Catálogo → GEO e prontidão**. O contrato externo persistente e a auditoria das três páginas da loja ainda precisam de validação.

A [camada de IA](docs/AI.md) oferece backend comum para OpenAI/Gemini, busca com embeddings, recomendações verificadas no catálogo, seleção ligada ao Checkout Core e relatório de consumo/falhas. Provedores ficam desabilitados por padrão. O [perfil consentido](docs/PROFILE.md) reúne atividade, compras e interesses, fornece contexto permitido e permite exportar/apagar os dados. As [telas de IA, Audiência e Privacidade](docs/AI-PROFILE-UI.md) estão conectadas às APIs. Validação com credenciais reais segue pendente; `npm run ai:demo` executa uma demonstração explicitamente simulada após o build.

A [integração de pagamentos sandbox](docs/PAYMENTS.md) reúne conta Connect vinculada, autorização/captura separadas, operações duráveis, estorno PSP e inbox de webhooks. O plugin Woo 0.5.0 acrescenta reserva/verificação, confirmação idempotente, cancelamento e estorno integral com devolução de estoque em transação MySQL. O [runtime opt-in](docs/PAYMENT-RUNTIME.md) conecta rotas autorizadas, webhook, auditoria, retenção e worker ao processo principal. A [interface financeira](docs/PAYMENT-UI.md) oferece cartão tokenizado, autenticação pelo SDK, acompanhamento e confirmação de captura/estorno. Stripe permanece desabilitado sem configuração; os testes de interface e o PSP do ensaio nativo são sintéticos. A [carteira Google Pay TEST](docs/GOOGLE-PAY.md) está implementada no mesmo fluxo; homologação externa continua pendente.

A [retomada de pagamentos](docs/PAYMENT-RENEWAL.md) permite tentar outro cartão após recusa verificada e abrir uma nova cotação após cancelamento comprovado. Novo aceite, histórico, prova de estoque e recuperação da mesma sessão protegem o fluxo contra duplicidade.

A [API de cancelamento pendente VTEX](docs/VTEX-CANCELLATION.md) exige habilitação e aceite explícitos, registra cada envio e só confirma cancelamento quando OMS e gateway concordam. A [interface de comprador e gestor](docs/VTEX-CANCELLATION-UI.md) oferece revisão inline, aceite desmarcado e acompanhamento após perda de resposta e recarga. `npm run vtex:cancellation:demo` reproduz duas jornadas HTTP com transporte sintético. Homologação e estorno PSP continuam pendentes.

- `src/core`: contratos e regras comerciais independentes de protocolo.
- `src/protocols`: descoberta ACP/UCP, perfis fixados, autorização delegada, assinaturas HTTP, checkout, pedidos e notificações sobre o mesmo Core.
- `src/storage`: persistência transacional SQLite local e PostgreSQL para staging.
- `src/data`: projeções, clientes Google, configuração opt-in e worker por tenant.
- `src/services`: checkout, catálogo, identidade, eventos, auditoria e analytics.
- `src/adapters`: cliente WooCommerce, confirmação assinada, GEO e provedores de IA.
- `web/src`: painel React, conciliação, pedidos, catálogo e checkout de teste.
- `docs`: plano, decisões, contratos, evidências e operação.
- `test`: cenários de negócio, isolamento, concorrência e recuperação.
- `e2e`: jornadas de navegador com servidor e banco efêmeros.

O plugin permanece no repositório privado `ThiagoVenturaV/pluginboopay`. A landing permanece em `ThiagoVenturaV/boopay-landing`. A plataforma está em `ThiagoVenturaV/boopay-platform`, criado e verificado como privado em 09/09/2026. O repositório público histórico `Boopay` não recebe este código.

## Executar

O [feed de produtos](docs/CATALOG-FEED.md) está em Catálogo → GEO e prontidão: declaração de marca/vendedor/condição, validação, JSONL versionado, download protegido contra obsolescência e vínculo à recomendação. A preparação local não comprova distribuição ou elegibilidade oficial.

Node.js 24 ou superior.

[Backup e restauração isolada](docs/BACKUP-RESTORE.md): cópia lógica cifrada SQLite/PostgreSQL, autenticação do arquivo, restauração em destino vazio e bloqueio da aplicação restaurada até revisão operacional. `npm run backup:demo` reproduz a prova com dados sintéticos e bases efêmeras.

```powershell
npm ci
npm run check
npm run demo
npm start
```

Abra http://127.0.0.1:9510. Identificador: `tenant-demo`; a chave administrativa é gerada em `data/local-secrets.json`, fora do Git. O painel abre sem vendas inventadas. Faça uma compra na aba Checkout e acompanhe o resultado em Visão da receita e Pedidos.

`npm run test:e2e` usa Chrome instalado no Windows ou Chromium do Playwright. Em máquinas sem navegador de teste, execute `npx playwright install chromium` antes. O servidor efêmero da suíte usa a porta 9511.

Leia [estado e evidências](docs/ESTADO-ATUAL.md), [guia do painel](docs/DASHBOARD.md), [integração WooCommerce](docs/WOOCOMMERCE.md), [checkout conectado e conciliação](docs/CHECKOUT-COMMERCE.md), [operação](docs/OPERATIONS.md) e [plano completo](docs/CRITERIOS-DE-ACEITE.md). As áreas de audiência e IA exibem seu estado de implementação; não representam integrações já conectadas.

A [fundação REST de ACP/UCP](docs/PROTOCOLS.md) permite descoberta, criação, atualização, consulta, conclusão e cancelamento com assinatura ES256 e idempotência durável. O comprador revisa a compra em `/protocol-review` na própria sessão; o agente não pode confirmar por ele. Os contratos oficiais e seus hashes ficam em `vendor/protocols`. ACP e UCP passaram na jornada HTTP com WooCommerce nativo, incluindo perda de resposta, pedido BACS único e estoque autoritativo. Cópias privadas temporárias expiram em 48 horas, preservando reservas que impedem reexecução. [Pedidos e notificações](docs/PROTOCOL-ORDERS.md) acrescentam consulta autorizada, estado financeiro comprovado e webhooks assinados com fila, consentimento explícito e destino permitido pelo operador. O envio fica desativado por padrão; os ensaios usam receptor local sintético. O [cadastro e consentimento visual](docs/PROTOCOL-ACCESS.md) permite conferir perfis em Configurações e gerenciar acesso/notificações em `/protocol-access`, com sessão própria e credencial efêmera. Rastreamento físico, recuperação assistida, handlers PSP delegados e homologação externa continuam pendentes.
