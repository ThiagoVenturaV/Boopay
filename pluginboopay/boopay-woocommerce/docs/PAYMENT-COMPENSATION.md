# Cancelamento e estorno sandbox

Versão 0.5.0. Extensão opt-in do [gateway assinado](PAYMENT-GATE.md), ainda sem homologação Stripe ou habilitação de pagamentos em produção.

POST `/boopay/v1/commerce/payments/compensate` usa o mesmo HMAC `boopay-payment-v1`, incluindo a ação `compensate`, timestamp e bytes exatos. O vínculo original de checkout/pedido/cotação/conta/valor/moeda/referência permanece imutável. Acrescenta `intentId`, `outcome` (`canceled` ou `refunded`) e, somente para estorno, `refundId` do provedor. O backend deve consultar o estado atual do PSP: autorização pendente ou refund pending/failed não autoriza compensar.

Cancelamento confirmado fecha um pedido não pago e restaura seu estoque nativo. Funciona também quando o comprador cancela antes de autorizar o PaymentIntent. Estorno integral confirmado gera um `WC_Order_Refund` com linhas, frete e impostos da loja, marca a evidência do reembolso externo e devolve o estoque. `refund_payment=false` garante que Woo não repita uma devolução já feita pelo PSP. Não há estorno parcial neste contrato.

A tabela própria `boopay_payments` migra para schema 2, mantendo registros anteriores e unicidade de pedido, intent e refund por conta. Resultado terminal, objeto de refund e estoque são gravados na mesma transação MySQL. As tabelas WordPress com o prefixo atual precisam usar InnoDB; falha de verificação recusa o ajuste. O lock por pedido serializa nossos endpoints. Estoque e objetos de pedido/refund são alterados apenas por APIs CRUD e funções Woo.

Interrupção antes do COMMIT exige rollback de todas as alterações no banco. Resposta perdida depois do COMMIT é recuperada pelo mesmo vínculo, sem recriar refund ou devolver estoque outra vez. O recibo traz estado, intent, refund do PSP, ID do refund Woo e `stockRestored=true`; só é emitido após verificar objetos/estoque e confirmar a transação.

O fingerprint financeiro do gateway 0.5.0 permite compensar após alteração de endereço, desde que itens, quantidades, preços, moeda e total permaneçam os mesmos. Alteração financeira, produto eliminado, redução parcial de estoque, refund manual anterior ou outra divergência exige conciliação; não há ajuste automático de valores ou restauração estimada. Pedidos 0.4.0 sem o fingerprint financeiro continuam exigindo o snapshot completo original.

Uma mudança manual de status não comprova captura/refund do PSP. A consulta assinada informa `paidVerified`, `refundedTotal` e `refundVerified`; o core exige a comprovação correspondente para projetar o pagamento sandbox.

O ensaio nativo usa WooCommerce 11.0.1, WordPress 7.0.4, PHP 8.3, MySQL 8, cache padrão e e-mails suprimidos. Stripe HTTP continua sintético. Compatibilidade com plugins que abrem/confirmam transações próprias, caches externos ou hooks que enviam efeitos externos antes do commit precisa ser homologada: uma transação no banco não desfaz e-mails ou chamadas externas de terceiros.

Fontes técnicas: [wc_create_refund e restock](https://github.com/woocommerce/woocommerce/blob/11.0.1/plugins/woocommerce/includes/wc-order-functions.php) e [restauração nativa de estoque](https://github.com/woocommerce/woocommerce/blob/11.0.1/plugins/woocommerce/includes/wc-stock-functions.php).
