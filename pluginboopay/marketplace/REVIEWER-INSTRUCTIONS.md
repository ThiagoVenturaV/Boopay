# Instruções de teste para revisores WooCommerce

> Documento de preparação comercial/operacional. Marcadores e condições externas precisam ser concluídos antes do lançamento; versão técnica corrente do plugin: 0.7.2.

Documento-base para preencher no portal de submissão. Os marcadores entre `< >` precisam ser substituídos antes do envio.

## Requisitos

- WordPress 6.9 ou 7.0;
- WooCommerce 10.9 ou 11.0;
- PHP 7.4 a 8.3;
- HTTPS e acesso de saída ao domínio da API Boopay.

## Credenciais de revisão

- API URL: `<STAGING_API_URL>`
- Código de conexão de uso único: `<REVIEW_CONNECTION_CODE>`
- Validade do código: `<EXPIRATION_UTC>`
- Contato de suporte durante a revisão: `<REVIEW_SUPPORT_EMAIL>`

Nunca inserir token de acesso ou segredo HMAC neste documento. Eles são emitidos automaticamente durante a troca do código.

## Fluxo crítico

1. Instalar e ativar WooCommerce.
2. Instalar e ativar o ZIP `boopay-woocommerce`.
3. Abrir `WooCommerce > Settings > Integrations > Boopay`.
4. Habilitar a integração, informar a API URL e o código de conexão e salvar.
5. Confirmar o estado `Connected` e aguardar a sincronização inicial.
6. Criar ou alterar um produto e confirmar o catálogo no painel de staging.
7. Configurar um mecanismo de consentimento de analytics, habilitar eventos da vitrine e abrir a página do produto.
8. Confirmar `storefront.view`; adicionar o produto ao carrinho e confirmar `storefront.add_to_cart`.
9. Usar `Test connection` e conferir contagens e horário do último teste na tela da integração.
10. Desativar e reativar o plugin, confirmando que o checkout normal do WooCommerce permanece funcional.

## Comportamento esperado

- nenhum contato externo antes da habilitação/configuração explícita;
- código temporário apagado depois da tentativa;
- token e segredo nunca aparecem na interface ou nos logs;
- tracking desabilitado por padrão;
- falhas 401/403 exigem reconexão e falhas temporárias usam reenvio limitado;
- desativação remove tarefas agendadas, mas preserva configuração; desinstalação remove os dados locais do plugin.
