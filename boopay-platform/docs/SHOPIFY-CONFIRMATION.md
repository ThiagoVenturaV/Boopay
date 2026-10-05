# Garantia da confirmação na Shopify

Análise de 11/09/2026, sobre o adaptador do commit `5c588715ce65d4f28e9c84dc3f41757e30c768ca`. **A garantia comercial forte continua pendente.** Este documento identifica uma alternativa de implementação e a prova necessária; nenhuma Function foi instalada ou validada em loja.

## Requisito e comportamento atual

O item 7.7 da [matriz original de aceite](../../Boopay/Boopay-03-ROADMAP-E-ACEITE.md) exige revisão e nova confirmação quando houver mudança material. A conclusão deve preservar itens, quantidades, entrega, pagamento e valores aprovados pelo comprador.

Em `src/adapters/shopify-checkout.ts`, `submit` relê o rascunho, compara a cotação e verifica a validade do aceite antes de enviar a conclusão. `lookup` confere o pedido resultante. Um escritor externo ainda pode alterar o rascunho entre a leitura e a conclusão. A conferência posterior detecta o problema, mas não impede a criação do pedido pendente divergente. O [contrato atual](SHOPIFY.md) e seus testes registram essa limitação.

## O que a documentação do fornecedor permite afirmar

A referência Admin GraphQL exibida como **2026-07** lista `id`, `paymentGatewayId`, `sourceName` e `paymentPending` na conclusão. Não lista precondição de hash ou versão esperada. Portanto, acrescentar uma variável local ou outra leitura não estabelece atomicidade na mutation. [Referência oficial](https://shopify.dev/docs/api/admin-graphql/latest/mutations/draftOrderComplete).

A API de validação de carrinho/checkout declara suporte a rascunhos no Admin e no checkout; a criação direta por Order API não consta como suportada. A documentação apresenta custo total, linhas e grupos de entrega como entradas selecionáveis. Isso torna uma validação nativa uma hipótese relevante, sem provar equivalência com o resumo do Boopay. Alvos de mensagens de erro não comprovam, por si, que os mesmos campos possam ser lidos pela Function. [API oficial](https://shopify.dev/docs/api/functions/latest/cart-and-checkout-validation).

A disponibilidade também depende da distribuição: a documentação distingue apps públicos com Functions de apps personalizados, estes restritos a Shopify Plus. Essa condição não foi verificada para uma loja do projeto. Não implica autorização para contratar um plano ou publicar um app. [Disponibilidade oficial](https://shopify.dev/docs/apps/build/functions).

Consultar o Core pela rede durante a Function não é uma alternativa geral: o acesso descrito é limitado a apps personalizados em lojas Enterprise, exige solicitação e não está disponível em lojas de desenvolvimento. Uma prova local de HTTP não satisfaz essa dependência. [Acesso à rede](https://shopify.dev/docs/apps/build/functions/network-access).

## Prova necessária antes de alterar o caminho comercial

Na loja de teste autorizada, verificar elegibilidade, versão do schema e execução da validação pela conclusão usada pelo adaptador. Em seguida, obter o payload nativo e demonstrar que ele permite conferir todos os campos comerciais exigidos, inclusive a relação com a confirmação original. Não presumir que uma cópia gravada em atributo reflita o estado nativo corrente.

O candidato deve vincular a expectativa ao tenant, à loja, à tentativa e ao aceite vigente, sem expor segredos nem confiar em um total editável pelo navegador. Ausência, alteração ou expiração da prova deve impedir a conclusão dos rascunhos Boopay abrangidos. A instalação, ativação e cobertura da Function precisam ser verificáveis; uma flag local não prova proteção remota.

Os ensaios de aceite devem demonstrar:

1. Resumo íntegro e confirmação válida produzem um único pedido com os valores aprovados.
2. Alterações de variante, quantidade, descontos, impostos, frete, endereço ou condição de pagamento após a última leitura impedem a criação divergente e exigem nova revisão.
3. Prova ausente, modificada ou expirada não conclui o rascunho abrangido.
4. Function desativada, erro de execução ou cobertura incompleta impedem o Boopay de alegar a garantia.
5. Perda de resposta e concorrência preservam a consulta da tentativa original, sem novo envio comercial.
6. Rascunhos alheios mantêm seu fluxo e dados pessoais não aparecem nas evidências publicadas.

Se a plataforma não fornecer os dados ou a garantia necessária, registrar essa incompatibilidade e avaliar outra arquitetura com o responsável pelo produto. A consulta posterior e um teste sintético continuam úteis, mas não fecham o item 7.7. Nenhuma exceção de aceite foi concedida.

## Estado da decisão

Alternativa identificada; implementação e homologação pendentes de confirmação das capacidades da loja. O ambiente local consultado não tem conexão Shopify configurada. O adaptador permanece de desenvolvimento, com pedido pendente e sem prova de captura. Esta revisão é documental e não acrescenta testes aprovados aos resultados da CI existente.

## Conferência adicional após a ponte VTEX 0.2.6

Em 11/09/2026, a referência voltou a apresentar 2026-07; o endereço solicitado com versão explícita redirecionou para `latest`. Foram localizados total, imposto e opção de entrega selecionada. Não foram localizados `paymentMethod` ou `paymentTerms` no texto da referência de validação. Isso limita a evidência disponível, mas não substitui obter e validar o schema da loja. `shop.localTime` oferece comparações com argumentos da consulta; a validade específica de cada aceite ainda precisa de prova. [Referência consultada](https://shopify.dev/docs/api/functions/latest/cart-and-checkout-validation).

A conclusão continua sem argumento de versão/hash esperado. [Mutation consultada](https://shopify.dev/docs/api/admin-graphql/latest/mutations/draftOrderComplete). A restrição de acesso à rede impede assumir uma consulta online ao Core numa loja comum de desenvolvimento. [Limite de rede](https://shopify.dev/docs/apps/build/functions/network-access).

Não há base suficiente para apresentar uma Function parcial como solução do item 7.7. Total equivalente não prova condição de pagamento equivalente; um atributo copiado tampouco prova o estado nativo. O próximo passo depende da loja/app autorizados e de payloads nativos que cubram identidade, pagamento, entrega e expiração, além dos seis ensaios acima. Nenhuma Function foi gerada ou ativada. [Registro da conferência e configuração disponível](https://github.com/ThiagoVenturaV/boopay-platform/blob/3ab824e3375d6d5d2956e0ca61aa90100f93a0d7/docs/evidence/mvp-access-review-2026-09-11.json).
