# Revisão e confirmação de compra por protocolo

[Protocolos ACP/UCP](PROTOCOLS.md) · [Resumo do projeto](../../README.md)

O agente pode iniciar e consultar a compra dentro da autorização recebida. A confirmação pertence ao comprador, na rota `/protocol-review`, usando a sessão própria. A autorização delegada não permite ao agente aceitar o resumo em nome do comprador.

## Percurso atual

1. A rota abre a sessão de checkout já criada; não cria silenciosamente uma nova identidade ou uma compra substituta.
2. O comprador confere produto, quantidade, moeda, total, entrega e condições do resumo comercial.
3. O aceite começa desmarcado. A confirmação vincula o comprador à cotação/revisão exatas; mudanças exigem novo resumo e novo aceite.
4. Confirmação e conclusão/pagamento são etapas distintas. O estado financeiro retornado determina o que foi comprovado.
5. Uma falha temporária oferece nova consulta da mesma compra; a tentativa original permanece preservada.
6. Uma sessão expirada orienta o comprador a voltar à conversa e solicitar outra compra, em vez de reiniciar silenciosamente nessa rota.

Sessão ausente ou incompatível não expõe produtos ou dados da compra de outro comprador. A interface identifica a loja, o ambiente demonstrativo e o pagamento de teste.

## Contratos associados

- [Checkout Core e cotação](CHECKOUT-COMMERCE.md)
- [Cadastro de clientes e consentimento](PROTOCOL-ACCESS.md)
- [Operações via WooCommerce, Shopify e VTEX](PROTOCOL-COMMERCE.md)
- [Pedidos e notificações autorizadas](PROTOCOL-ORDERS.md)

O fluxo tem provas locais de API/Core/navegador e limites por integração. Isso não demonstra aprovação da superfície oficial de uma plataforma externa. O [estado atual](ESTADO-ATUAL.md) reúne a evidência funcional mais recente sem os pareceres ou instruções de agentes usados durante o desenvolvimento.
