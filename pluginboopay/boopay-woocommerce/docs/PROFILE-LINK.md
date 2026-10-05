# Perfil consentido na sessão WooCommerce

A versão 0.7.2 liga o aceite visual do comprador à sessão assinada do WooCommerce. O lojista habilita a coleta e inclui `[boopay_profile]` em uma página de privacidade. Os botões herdam o tema da loja; a revisão das permissões ocorre em `/store-profile` do Boopay. [Pacote e validação](../../../boopay-platform/docs/ESTADO-ATUAL.md).

## Percurso

1. O comprador permite estatísticas no mecanismo de consentimento da loja e escolhe conectar o perfil.
2. O plugin prepara o cookie de sessão nativo antes de aceitar a autorização. A janela identifica a loja, exige aceite explícito e transfere uma capacidade limitada por `postMessage` com origem, janela e nonce conferidos.
3. `POST /wp-json/boopay/v1/profile-link` guarda a capacidade cifrada com AES-256-GCM na sessão WooCommerce. A chave deriva do salt de autenticação do WordPress. O navegador recebe somente identificadores e datas; o vínculo não depende do cookie público de analytics.
4. Visualizações, adições ao carrinho nativas e saída com snapshot do carrinho podem compor o perfil a partir do aceite. Eventos anteriores não são associados retroativamente. Analytics permanece separado de identidade, pedidos e receita.
5. Desconectar pela loja remove o campo de sessão, marca a autorização como revogada localmente e tenta revogar a capacidade no Core. A operação continua disponível no receptor após negar estatísticas. Falhas de rede são informadas e exigem confirmação pela Privacidade do Boopay.

## Reenvio e minimização

O recibo de cada evento e o Action Scheduler guardam a capacidade cifrada, vinculada ao identificador do evento e da sessão. A decifragem acontece em memória imediatamente antes da assinatura HMAC. Reenvios mantêm o corpo original, inclusive após expiração ou revogação; o Core decide se pode registrar observações no perfil e deduplica o evento.

O navegador mantém apenas metadados de roteamento na fila, sem a capacidade de escrita. Não há capacidade em localStorage, sessionStorage, URL, cookies ou HTML. Após revogação ou troca do vínculo, a fila descarta os eventos associados ao vínculo anterior.

O receptor exige origem da própria loja, limita o corpo a 4 KiB e responde sem cache. Estatísticas seguem o filtro `boopay_woocommerce_tracking_allowed` e a WordPress Consent API quando instalada. A política e o CMP específicos do lojista ainda precisam de homologação.

## Limites e validação

- A capacidade vale no máximo 24 horas; o Core verifica prazo, integração, origem e consentimento. O salt do WordPress deve permanecer protegido. Sua troca invalida os envelopes cifrados existentes; o plugin falha sem enviar um corpo alterado.
- A expiração é lógica; a remoção física segue a limpeza do WooCommerce/Action Scheduler, recibos e backups. Não há alegação de limpeza instantânea de todas as cópias.
- Revogar na janela do Boopay limpa o campo nativo quando a página que abriu a janela ainda mantém o canal (até 15 minutos) e a chamada nativa funciona. Depois de navegar/recarregar essa página, expirar o canal ou perder a rede, o Core continua impedindo novas observações; use o botão da loja para remover também o vínculo nativo. A mensagem de erro orienta uma nova tentativa explícita, sem prometer reenvio automático.
- Não autentica a conta comercial do comprador nem resolve identidade entre dispositivos. Não acrescenta recuperação por mensagens.
- O ensaio `tools/woocommerce/profile-smoke.mjs` da plataforma passou na [CI 34577217481](https://github.com/ThiagoVenturaV/boopay-platform/actions/runs/34577217481), com WordPress/PHP/MySQL, navegador e Core reais. Perda de resposta, avanço do relógio da página e retirada de consentimento do CMP são injeções de teste. Os seis jobs da execução e a regressão comercial Woo também passaram; Stripe permanece sintético.

Requisitos: OpenSSL com AES-256-GCM, API Boopay com rotas de perfil e sessão nativa WooCommerce funcionando. Sem criptografia disponível, o vínculo falha de forma fechada; nenhuma autorização em texto aberto é persistida.
