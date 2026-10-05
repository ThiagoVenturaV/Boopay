# Aceite do perfil na sessão nativa WooCommerce

O plugin 0.7.2 implementa a ponte entre a [interface de aceite](STORE-PROFILE-UI.md) e a sessão assinada do WooCommerce. A [API de perfil](PROFILE-STOREFRONT.md) continua sendo a autoridade sobre consentimento, prazo, origem e vínculo. Esta extensão não autentica a conta do comprador na loja e não resolve identidade entre dispositivos.

## Uso e armazenamento

O lojista habilita a coleta, integra seu mecanismo de consentimento e inclui `[boopay_profile]` em uma página de privacidade. Os botões de conectar e desconectar herdam o tema do WooCommerce. O aceite acontece na mesma interface Boopay já revisada.

Antes de receber a capacidade de escrita, a loja prepara o cookie nativo da sessão WooCommerce. A entrega confere origem, janela e nonce; o receptor da própria loja grava o vínculo cifrado com AES-256-GCM. Repetir a entrega após perder a resposta preserva o identificador da sessão. O plugin devolve ao navegador somente os identificadores e datas necessários ao roteamento.

Visualizações e saída enviadas pelo navegador precisam apresentar o vínculo e a sessão correspondentes ao cookie assinado. A adição ao carrinho é observada pelo hook nativo, sem confiar numa declaração do navegador. Somente eventos posteriores ao aceite podem produzir observações no perfil. Recibos anônimos anteriores não são associados retroativamente; navegação não cria compras ou receita.

Os recibos e o Action Scheduler guardam a capacidade cifrada por evento. A decifragem ocorre em memória antes da serialização e assinatura HMAC. O transporte preserva o mesmo corpo em reenvios; revogação e expiração são avaliadas no Core sem mudar um evento já aceito. Não há capacidade em URL, markup, cookies ou armazenamento do navegador.

## Revogação e limites

O botão da loja remove o vínculo nativo, marca a capacidade localmente como revogada e solicita a revogação limitada no Core, mesmo se estatísticas forem negadas. A interface informa quando a tentativa remota falha. O comprador deve confirmar a remoção na Privacidade do Boopay nesses casos.

Revogar na janela do Core também informa a página que abriu a janela, enquanto esse canal continua ativo, por até 15 minutos. Se a página da loja foi recarregada/navegada ou o canal expirou, o Core ainda impede observações; use o botão da loja para limpar o campo nativo. Uma restauração concorrente antiga da sessão é recusada pela marca de revogação local.

Fechar uma tentativa pendente ou atingir seu prazo encerra a orientação de aguardar a janela. Se já havia um vínculo na sessão, a mensagem informa que ele foi mantido. Conexão ou revogação concluídas preservam seu feedback. Se a remoção nativa falhar após revogar no Core, a mensagem orienta repetir **Desconectar perfil** quando a rede voltar; não há promessa de reenvio automático.

A validade é de até 24 horas. Expiração lógica e remoção física são distintas: os campos cifrados seguem os ciclos de sessão, recibo e fila do WooCommerce/WordPress; backups não foram homologados. Trocar o salt de autenticação invalida os envelopes existentes. Sem OpenSSL/AES-GCM, o vínculo falha sem gravar a capacidade em texto aberto.

Instalação numa loja autorizada, integração do CMP real, retenção física e validações externas de pagamento/IA/dados permanecem pendentes. Nada neste incremento altera a [matriz de aceite integral](CRITERIOS-DE-ACEITE.md).

## Ensaio e evidência

`tools/woocommerce/profile-smoke.mjs` é executado pelo job WooCommerce da CI, depois da coleta anônima e antes das jornadas comerciais. Usa navegador, WordPress 7.0.4, WooCommerce 11.0.1, PHP 8.3, MySQL e Core reais. A perda de resposta e a retirada do CMP são injetadas pelo teste; nenhum cliente real é usado.

O ensaio cobre aceite visual, preparação da sessão, reentrega após perder a resposta nativa, navegação depois de recarregar a página, adição de duas unidades ao carrinho, snapshot na saída, privacidade do armazenamento, isolamento entre sessões/origens e revogação pela loja, pelo popup e pelo CMP sintético. Os testes de SDK também verificam metadados imutáveis em reenvios e descarte do vínculo revogado.

`npm run check` aprovou 311 cenários localmente, com 23 reservados aos ambientes PostgreSQL/Firestore e zero falhas. A [CI 34577217481](https://github.com/ThiagoVenturaV/boopay-platform/actions/runs/34577217481) aprovou os seis jobs no commit `270a68100f533d1a160a81c8b8dff1c72be6edc6`: **334 cenários distintos de backend** (331 PostgreSQL + três Firestore), 49 percursos do painel, quatro dos pixels e a jornada Woo nativa completa, incluindo regressão comercial com Stripe sintético.

Pacote privado **0.7.2**, commit de origem `99a0d5d558990dd68d383b5b12421f68169c1fbe`, SHA-256 `7a585cc386c613f5d2aa996c1e48a1544a0c412a0d958317ee9ad851e4de1851`, fixado no manifesto. [Evidência oficial](https://github.com/ThiagoVenturaV/boopay-platform/blob/3ab824e3375d6d5d2956e0ca61aa90100f93a0d7/docs/evidence/woo-profile-ci-2026-09-11.json), incluindo as tentativas anteriores do ensaio que falharam e os motivos; [verificação local](https://github.com/ThiagoVenturaV/boopay-platform/blob/3ab824e3375d6d5d2956e0ca61aa90100f93a0d7/docs/evidence/woo-profile-local-2026-09-11.json).
