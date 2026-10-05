# Conectar o perfil à sessão da loja

Incremento de 11/09/2026: `/store-profile` estende a Privacidade do comprador e os SDKs Shopify/VTEX 0.2.0 entregam a autorização diretamente à sessão da loja. A API de perfil continua sendo a autoridade descrita em [PROFILE-STOREFRONT.md](PROFILE-STOREFRONT.md). O [plugin WooCommerce 0.7.2](WOO-PROFILE.md) usa a mesma interface e guarda a capacidade cifrada na sessão nativa, sem persistir a capacidade no navegador; o armazenamento dos SDKs descrito abaixo refere-se a Shopify/VTEX.

## Percurso disponível

1. O comprador permite analytics no mecanismo de privacidade da loja e clica em **Conectar meu perfil**, incluído no app embed Shopify e no HTML do Pixel builder VTEX.
2. A janela do Boopay resolve a loja configurada, mostra o domínio e pede uma sessão de teste explicitamente. Uma sessão de outro tenant não é associada silenciosamente.
3. As duas permissões começam desmarcadas: guardar o perfil e associar as próximas interações dessa loja. O contexto de IA permanece desligado quando a personalização é ativada por esse percurso.
4. O aceite cria uma autorização idempotente. Janela, origem e nonce são verificados nos dois sentidos. A capacidade não aparece na URL, na interface, no clipboard ou no barramento de analytics Shopify/VTEX.
5. A loja grava uma capacidade de escrita limitada em `sessionStorage`, separada da sessão anônima do pixel. Apenas novos eventos, posteriores ao aceite, podem usá-la. Repetir a entrega preserva a mesma capacidade e o UUID. Eventos antigos e reenvios não recebem uma nova identidade.
6. **Minhas conexões** permite atualizar o estado e revogar com confirmação inline. O servidor remove as observações do vínculo. A loja também fornece **Desconectar perfil**; revogação do consentimento analítico encerra coleta e vínculo local.

O vínculo permite receber interações por até 24 horas, com ativação nos primeiros cinco minutos. A política de observações é de até 30 dias ou revogação/exclusão, conforme o contrato do backend. O estado recebido pela loja confirma entrega da autorização; o recibo de analytics, sozinho, não prova uma gravação no perfil.

## Contrato de transporte

`POST /v1/storefront/profile-context` recebe `{collectorId, origin}` ou `{platform:"woocommerce", integrationId, origin}` da interface Boopay e retorna somente metadados da loja, origem canônica, validade e política. Mantém o controle de origem/CSRF do Boopay e não emite autorização.

`POST /v1/storefront/profile/collector/:id/revoke` recebe `{grant}` sem cookie/bearer. CORS permite apenas a origem configurada e `Content-Type`, sem credenciais. A capacidade limita a revogação ao vínculo correspondente; um valor desconhecido retorna o mesmo resultado genérico. A rota continua funcionando após revogar o coletor, enquanto seu descritor e origem permanecerem configurados. Existe a rota equivalente `woocommerce/:integrationId/revoke` usada pela ponte do plugin.

Os SDKs mantêm a capacidade em armazenamento de sessão da própria loja e nos corpos privados de eventos pendentes que já a receberam. Scripts do mesmo domínio podem acessar esse armazenamento; a loja deve proteger sua execução de JavaScript. O servidor remove a capacidade de eventos analíticos, outbox, exportações e respostas de perfil. Ela não dá leitura de dados, autenticação na loja nem autoridade para comprar.

Desconectar limpa o armazenamento local antes da chamada ao servidor. Se a rede falhar, a mensagem orienta confirmar a revogação na Privacidade do Boopay: não afirma que o servidor apagou observações. O vínculo expira no prazo próprio. Eventos em voo são regidos pela barreira transacional de recebimento/revogação do backend.

## Instalação e limites

Siga [STOREFRONT-PIXELS.md](STOREFRONT-PIXELS.md) para gerar os pacotes. O app embed Shopify lê a Customer Privacy API no tema; o Custom Pixel usa o proxy `browser.sessionStorage`. O contrato do proxy é da [API oficial de browser Shopify](https://shopify.dev/docs/api/web-pixels-api/standard-api/browser). Compartilhamento efetivo de contexto/origem e permissões precisa ser confirmado na loja autorizada. VTEX exige que o CMP específico chame `setAnalyticsConsent`; não há banner ou permissão implícita.

O botão pode ser colocado no percurso de privacidade do tema usando `data-boopay-profile-connect`, `data-boopay-profile-disconnect` e um elemento `data-boopay-profile-status` com `role="status"`. A instalação deve manter uma única instância do SDK por integração. As APIs `BoopayStoreProfile.connect/disconnect` no tema Shopify e `BoopayStorefront.connectProfile/disconnectProfile` na VTEX também estão disponíveis; a abertura deve decorrer de um gesto do comprador.

O plugin WooCommerce 0.7.2 oferece `[boopay_profile]` e conclui a ponte entre aceite e sessão nativa, validada na [CI 34577217481](https://github.com/ThiagoVenturaV/boopay-platform/actions/runs/34577217481). Seu contrato de armazenamento, recuperação e limites está em [WOO-PROFILE.md](WOO-PROFILE.md). Autenticação da conta nativa e resolução de identidade entre dispositivos continuam fora desta extensão.

## Evidência reproduzível

- `npm run check`: 333 cenários declarados, 310 aprovados localmente e 23 reservados aos ambientes PostgreSQL/Firestore; zero falhas.
- `npm run storefront:smoke`: quatro percursos Chromium. Dois preservam a coleta anônima e dois usam a interface real de aceite, contexto, sessão, personalização, vínculo prospectivo e revogação. Shopify inclui perda da resposta de criação com retomada pela mesma chave; VTEX inclui retirada do consentimento no CMP sintético.
- Testes de SDK verificam rejeição de outra janela/origem/nonce, reentrega sem trocar sessão, recusa após retirada do consentimento e em reload Shopify com analytics negado, preservação dos corpos em reload e descarte de reenvios cujo vínculo foi removido.
- A revisão visual usa os estados aceite, conectado, confirmação de revogação e revogado em 1440 e 390 px. O detector executado uma vez retornou `[]`.

Os ensaios usam UI, Chromium, CORS, HTTP e persistência reais com APIs de loja sintéticas. Não provam instalação em Shopify/VTEX, operação de clientes reais, pagamento, receita incremental ou fechamento da [meta completa](CRITERIOS-DE-ACEITE.md).

Resultado local persistido em [evidence/store-profile-ui-local-2026-09-11.json](https://github.com/ThiagoVenturaV/boopay-platform/blob/3ab824e3375d6d5d2956e0ca61aa90100f93a0d7/docs/evidence/store-profile-ui-local-2026-09-11.json).

CI do commit `c99c5b55e937433963d915a1d658240dbb32af30`: [seis jobs aprovados](https://github.com/ThiagoVenturaV/boopay-platform/actions/runs/34572653242), com 333 cenários distintos de backend, 49 percursos do painel e quatro dos pixels. Resultado em [evidence/store-profile-ui-ci-2026-09-11.json](https://github.com/ThiagoVenturaV/boopay-platform/blob/3ab824e3375d6d5d2956e0ca61aa90100f93a0d7/docs/evidence/store-profile-ui-ci-2026-09-11.json). Naquele commit, a regressão Woo passou com a ponte de perfil ainda ausente. A prova posterior do plugin 0.7.2 está em [WOO-PROFILE.md](WOO-PROFILE.md).
