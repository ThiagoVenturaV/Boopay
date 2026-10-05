# Integração WooCommerce

O catálogo usa o plugin privado [pluginboopay](https://github.com/ThiagoVenturaV/pluginboopay). A Store API do WooCommerce é a fonte de preço, cupom, frete, estoque e pedido para o adaptador comercial. O catálogo sincronizado serve à descoberta; seu preço não autoriza uma cobrança.

## Conexão e sincronização

O administrador gera um código de uso único no painel Boopay, válido por dez minutos. O plugin troca esse código por credenciais vinculadas ao tenant e assina os envelopes enviados à API. Tokens e assinaturas não entram nos relatórios ou no Git.

Validação local em 09/09/2026: WordPress 7.0.4, WooCommerce 11.0.1, PHP 8.3.32, plugin 0.2.0. Uma instância nova do WordPress conectou-se ao backend Fastify real; o plugin enviou um produto de R$ 79,90 com três unidades, recebido corretamente no catálogo do tenant de teste.

Correções verificadas no receptor:

- Datas ISO com offset `+00:00`, emitidas por `gmdate('c')`, são aceitas e normalizadas para UTC.
- Uma loja sem produtos pode concluir uma página de sincronização vazia.
- Eventos antigos não desfazem exclusões mais recentes, inclusive de variações ainda desconhecidas.
- O snapshot completo de um produto variável desativa variações ausentes, inclusive quando a última foi removida.
- Timestamps iguais usam exclusão como prioridade e, para atualizações, ordenação por ID do evento. Isso torna o resultado independente da ordem de entrega; o ID não prova a ordem causal de duas edições no mesmo segundo. Uma nova sincronização posterior resolve a ambiguidade do produtor legado.

## Adaptador comercial

`src/adapters/woocommerce.ts` contém um cliente de Store API com URL configurada pelo operador e origem explicitamente permitida. Lojas remotas exigem HTTPS. Redirecionamentos são recusados. O token de carrinho deve ficar no servidor, criptografado quando persistido.

O cliente obtém o carrinho, inclui SKUs, atualiza endereço, aplica cupom, seleciona entrega, monta uma cotação reconciliada em centavos, consulta o estado de checkout e pode solicitar transferência bancária offline (`bacs`). O pedido `on-hold` é **pendente**, mesmo que `payment_result.payment_status` retorne `success`.

Antes do envio, o adaptador verifica novamente itens, quantidades, valores, destino, entrega selecionada e estado do checkout. O WooCommerce 11.0.1 retorna `order_id: 0` enquanto ainda não materializou o pedido e não implementa a proteção nativa `expected_total`, embora ela apareça na documentação pública atual. Esses dois comportamentos foram conferidos no código da versão instalada.

O plugin 0.3.0 fornece `boopay-checkout-v2`: assinatura HMAC-SHA256 vinculada ao carrinho, itens, moeda, total, endereços de entrega/cobrança e método `bacs`, com validade de até cinco minutos. O comprovante confere o JSON original; o pedido é comparado aos campos normalizados pelo WooCommerce, inclusive CEP. O adaptador exige a versão correspondente, sem downgrade. Consulte o [contrato no plugin](../../pluginboopay/boopay-woocommerce/docs/COMMERCE-GUARD.md).

O plugin registra uma tentativa única por integração e referência antes de executar o checkout. Um pedido só pode ser vinculado a uma operação, e uma transição atômica permite a entrada no gateway uma vez. Reenvios retornam conflito; não voltam ao pagamento. A consulta `lookupOperation` assina `POST /boopay/v1/commerce/operations/lookup` e retorna apenas referência, hash, estado e dados comerciais mínimos, sem endereço ou chave do pedido.

Falha de transporte após mutação significa resultado desconhecido. A recuperação consulta a referência original. Uma operação ausente, presa em `dispatching`/`committing` ou sem pedido correspondente não autoriza criar outra compra. Não há desbloqueio automático por tempo. Os registros mínimos são preservados no plugin ao desinstalar; a política final de retenção permanece pendente.

O cliente agora está ligado ao Checkout Core e à interface para lojas de teste autorizadas pelo operador. A sessão mantém confirmação explícita, intenção durável, dados privados criptografados e conciliação por referência. Produtos WooCommerce recebem cotação e pedido da loja, sem preços ou pagamentos locais como fallback. Consulte [o fluxo integrado](CHECKOUT-COMMERCE.md) para contrato, testes e limites. Compensações e pagamentos de PSP ainda estão pendentes.

## Reproduzir

A execução [34420690608](https://github.com/ThiagoVenturaV/boopay-platform/actions/runs/34420690608) passou com PHP 8.3.33 e MySQL 8.0. Verificou um pedido `on-hold` de R$ 158,82 (dois itens de R$ 79,90, cupom de 10%, frete de R$ 15,00), estoque de três para uma unidade, reenvio do estoque atualizado pelo plugin e recusa de repetição após o carrinho concluído. Não houve cobrança de PSP ou reconhecimento de receita paga.

A suíte 0.3.0 passou na execução [34422183337](https://github.com/ThiagoVenturaV/boopay-platform/actions/runs/34422183337), commit `c772ca330d2dc23b65667bff0330bf5565ecab35`. Acrescentou oito processos PHP concorrentes disputando uma operação, vínculo exclusivo de pedido, alteração de endereço/método, consulta não autorizada/expirada, conflitos de referência e recuperação de resposta descartada depois da criação do pedido. Dois reenvios diretos foram recusados; continuou existindo um único pedido pendente, estoque 3 → 1 e nenhuma receita paga. Os cinco jobs da CI passaram.

Na raiz de `boopay-platform`, execute `npm ci` e `npm run build`. Depois:

```powershell
cd tools/woocommerce
npm ci
npm test
```

O teste usa o ZIP do plugin em `tools/woocommerce/fixtures`, com hash SHA-256, repositório e commit registrados em `manifest.json`. O código fonte autoritativo permanece em `pluginboopay`. Essa fixture permite que o CI teste a mesma versão sem credenciais para ler outro repositório privado. `BOOPAY_PLUGIN_PATH` pode apontar para um checkout de desenvolvimento no modo Playground.

O teste usa as portas locais 9400 e 9512, cria banco e credenciais temporários e encerra os serviços ao terminar. O modo local padrão executa WordPress/PHP no Playground com SQLite e cobre conexão, catálogo, cotação e rejeições de confirmação. **A finalização do pedido exige a suíte nativa MySQL**: a reserva de estoque do WooCommerce utiliza locks InnoDB e falhou no SQLite. A suíte não desabilita essa proteção para passar.

No CI, `WOO_NATIVE_TEST=1` usa PHP 8.3 nativo e MySQL 8.0. Requer `WOO_DB_PASSWORD`; host, usuário e banco podem ser configurados por `WOO_DB_HOST`, `WOO_DB_USER` e `WOO_DB_NAME`. Use somente um banco vazio dedicado ao teste. WordPress e dados temporários ficam em `data/woo-native`, fora do Git. Emails são desabilitados na loja de teste. Essa evidência não substitui homologação em hospedagem, PSP e configuração de produção.

A ferramenta de teste tem lockfile separado e não é dependência do servidor. O override de `qs` para a versão corrigida elimina os avisos transitivos conhecidos do CLI fixado. Não use `npm audit fix --force` para trocar indiscriminadamente a versão do Playground.

## Referências

- [Store API: Cart Tokens](https://developer.woocommerce.com/docs/apis/store-api/cart-tokens)
- [Store API: Checkout](https://developer.woocommerce.com/docs/apis/store-api/resources-endpoints/checkout)
- [WordPress Playground CLI](https://wordpress.github.io/wordpress-playground/developers/local-development/wp-playground-cli/)
- [Código do Checkout no WooCommerce 11.0.1](https://github.com/woocommerce/woocommerce/blob/11.0.1/plugins/woocommerce/src/StoreApi/Routes/V1/Checkout.php)
- [Resposta sem pedido materializado no WooCommerce 11.0.1](https://github.com/woocommerce/woocommerce/blob/11.0.1/plugins/woocommerce/src/StoreApi/Schemas/V1/CheckoutSchema.php)

Consultadas em 09/09/2026. Compatibilidade é determinada pelos testes da versão instalada, além da documentação pública.
