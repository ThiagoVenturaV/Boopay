# Boopay for WooCommerce

Conector nativo entre uma loja WooCommerce e a plataforma SaaS Boopay.

A versão 0.7.2 entrega o [perfil consentido na sessão nativa](docs/PROFILE-LINK.md), preservando os [recibos duráveis e reenvio do SDK](docs/TRACKING-DELIVERY.md). Eventos de navegação não representam abandono comprovado nem receita. O pacote passou no WordPress/PHP/MySQL real; veja a [evidência da versão](../../boopay-platform/docs/ESTADO-ATUAL.md).

## O que esta versão entrega

- configuração dentro de `WooCommerce > Configurações > Integrações > Boopay`;
- conexão por código temporário, trocado por token com expiração e segredo HMAC;
- sincronização inicial paginada do catálogo em segundo plano;
- sincronização incremental de produtos, variações, preço e estoque;
- remoção de produtos por evento;
- tracking opcional de `view`, `add_to_cart` e `exit_intent`;
- pseudonimização de cliente, sessão e carrinho;
- Action Scheduler com fallback para WP-Cron e até cinco tentativas;
- logs sanitizados no WooCommerce;
- compatibilidade declarada com HPOS;
- confirmação comercial assinada, verificada contra itens, moeda e total antes do pagamento;
- registro durável de tentativa, proteção contra reenvio e consulta assinada do resultado;
- vínculo da confirmação com os endereços e a forma de pagamento;
- limpeza de credenciais e agendamentos na desinstalação.

Consulte o [contrato de confirmação](docs/COMMERCE-GUARD.md). O cliente e a suíte de integração com o novo backend ficam no repositório privado `ThiagoVenturaV/boopay-platform`. A orquestração comercial ponta a ponta continua em implementação.

## Requisitos

- WordPress 6.4 ou superior;
- WooCommerce 8.2 ou superior;
- PHP 7.4 ou superior;
- HTTPS em produção;
- API Boopay implementando o contrato em [`docs/API-CONTRACT.md`](docs/API-CONTRACT.md).

## Instalação

1. Envie o arquivo `boopay-woocommerce.zip` em `Plugins > Adicionar plugin > Enviar plugin`.
2. Ative o plugin.
3. Acesse `WooCommerce > Configurações > Integrações > Boopay`.
4. Informe a URL HTTPS da API, habilite a integração e cole um código temporário emitido pela Boopay.
5. Salve. O código é apagado localmente depois da tentativa de troca.
6. Depois da conexão, acompanhe a fila em `WooCommerce > Status > Ações agendadas`.

Em produção, a URL pode ser fixada no `wp-config.php`:

```php
define( 'BOOPAY_API_URL', 'https://api.exemplo.com' );
```

## Privacidade

O tracking de vitrine vem desabilitado. Quando habilitado, o plugin respeita `wp_has_consent( 'analytics' )` se um gerenciador compatível estiver disponível. Ele não envia cartão, endereço, e-mail, nome ou IP. IDs de cliente e carrinho são pseudonimizados com segredos da própria instalação WordPress.

O checkout confirmado envia os endereços para a loja. A tabela própria de operações guarda somente referências, hashes e estado comercial, sem endereços brutos ou credenciais. Esses registros e os metadados do pedido são preservados na desinstalação para manter rastreabilidade. Uma nova conexão não acessa os registros da anterior.

## Limites desta entrega

Este pacote implementa o lado WooCommerce. Uma sincronização ponta a ponta exige que os três endpoints da API Boopay descritos no contrato estejam publicados. Checkout invisível, pagamentos, assinatura comercial do Marketplace e conectores Shopify/VTEX não fazem parte deste código.

## Desenvolvimento e validação

Execute:

```powershell
node tools/validate-package.mjs
```

O validador confere estrutura, cabeçalho, guardas PHP, padrões inseguros, contrato, JavaScript e arquivos que podem entrar no ZIP.
