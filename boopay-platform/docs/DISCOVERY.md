# Da recomendação ao pedido

A recomendação concluída preserva URL, SKU, revisão, preço, moeda, prontidão e referência da auditoria GEO. A seleção vincula esse registro à sessão do Checkout Core. O relatório cruza a sessão com o pedido canônico e seu estado financeiro atual. Isso documenta continuidade; não demonstra que GEO ou IA causaram uma venda.

## Contrato e privacidade

Desde 10/09/2026, `preparedFeed` preserva a referência e o SHA-256 do [arquivo de catálogo](CATALOG-FEED.md) quando a revisão, declaração e validade do item correspondem ao arquivo gerado. O campo é opcional para snapshots antigos e não significa envio ou aprovação externa. A demonstração integrada gera o feed antes de recomendar.

- `boopay-discovery-v1`: snapshot calculado pelo servidor na mesma transação que conclui e valida a recomendação. O provedor e o comprador não podem fornecer referências de atribuição arbitrárias.
- A avaliação de prontidão usa a revisão atual do produto, a idade da fonte, as políticas declaradas e o vínculo de auditoria. Apenas os produtos recomendados são avaliados nessa transação. Estar pronto não implica auditoria concluída nem aprovação de canal.
- O snapshot registra a situação da auditoria naquele momento, versões e digest do relatório, separando evidência simulada/observada e vínculo atual/desatualizado. Mudanças posteriores no catálogo ou no relatório não reescrevem esse registro.
- O conjunto fica **criptografado dentro de `ai_turn`**, com autenticação vinculada ao tenant e ao ID da mensagem. Não aparece na resposta de conversa do comprador. `ai_selection` guarda a referência do produto e digest; a consulta detalhada exige sessão administrativa.
- Exclusão do perfil e retenção de conteúdo de IA removem mensagens e seleções, incluindo a trilha. A retenção vigente é de sete dias. A conciliação preserva pedidos pelos controles operacionais existentes. Sem a trilha pessoal, esses pedidos passam para a cobertura sem vínculo, sem alterar os valores financeiros.
- Não reconstruímos vínculos de mensagens anteriores à implementação, dados apagados, eventos ou catálogo atual. Uma cotação renovada fora da seleção de IA também não ganha atribuição por inferência.
- Catálogo alterado antes da seleção exige nova recomendação. Se o resumo mudar posteriormente, o relatório mostra a revisão cotada e se o produto recomendado ainda está presente. A confirmação explícita continua obrigatória.

## APIs e métricas

`GET /v1/admin/reports/discovery` e `GET /v1/admin/reports/discovery.csv` aceitam `from`, `to` e `evidence`, com as mesmas regras do resumo financeiro. Respostas privadas usam `no-store`.

O funil considera recomendações **criadas no período**, com estado atual das sessões seguintes. Uma recomendação pode ter várias seleções; cada checkout entra uma vez. Mensagens sem produtos não contam como recomendação. Os contadores de prontidão e auditoria medem ocorrências de produtos recomendados, não produtos únicos nem etapas causais de conversão. Auditoria parcial não conta como concluída.

A cobertura financeira considera **pedidos criados no período**, inclusive quando a recomendação ocorreu antes dele. Cada pedido entra uma vez, por moeda, em uma das categorias:

| Cobertura | Critério |
|---|---|
| Todos os itens vinculados | Todos os produtos do resumo final têm seleção explícita preservada nessa sessão |
| Parte dos itens vinculada | O resumo final também contém produtos sem seleção vinculada |
| Sem vínculo preservado | Nenhum produto final corresponde a uma seleção preservada |

Os três grupos somam os totais do resumo canônico: aprovado, estornado e após estornos. Um pedido pendente não gera receita paga. O valor de um pedido parcial permanece inteiro em seu grupo, sem alocar frete, descontos ou receita a um único produto. Revisão diferente não apaga a origem da seleção; fica sinalizada separadamente. A receita de origem simulada e a observada continuam filtráveis, sem somar moedas.

O JSON mostra os cem registros de produto/recomendação mais recentes; contadores e conciliação usam toda a coorte. O CSV inclui todos os registros preservados desse filtro, uma linha por seleção ou recomendação sem seleção, com células protegidas contra fórmulas. Valores monetários não se repetem no CSV de rastreio; a exportação financeira continua em `orders.csv`.

## Painel

Em **Visão da receita**, a seção aparece depois dos pedidos recentes, preservando a composição B de conciliação. Herda período e origem do painel e moeda da conciliação. Os detalhes mostram a evidência GEO, página/SKU/revisão, sessão e pedido. Distribuição é apresentada como **envio de feed não registrado** e elegibilidade como **não avaliada**.

Esta entrega não inclui envio de feed. O contrato oficial atual distingue dados de descoberta de integrações de checkout e exige marca/vendedor reais no feed; o catálogo atual não fornece esses campos de forma geral. Não preenchemos esses valores com nomes inventados nem tratamos uma recomendação local como publicação. [Referência oficial de produtos, consultada em 10/09/2026](https://developers.openai.com/commerce/specs/file-upload/products).

## Demonstração reproduzível

```powershell
npm ci
npm run build
npm run discovery:demo
```

SQLite efêmero, sem `.env`, chamadas externas ou cobrança. O cenário usa os serviços reais do núcleo com provedores GEO/IA sintéticos, catálogo fictício e pagamento sandbox:

1. Configura home, categoria e produto, cria e acompanha auditoria com metadados completos sintéticos.
2. Recomenda um produto e captura prontidão/auditoria.
3. Repete uma seleção com a mesma chave e confirma que não duplica a sessão.
4. Cria três checkouts: paga dois após aceite explícito simulado, cancela um e estorna integralmente um pedido.
5. Confere dois pedidos, um checkout abandonado, R$ 230,00 aprovados, R$ 115,00 estornados e R$ 115,00 após estornos, iguais ao resumo financeiro. A saída inclui a trilha verificável e os limites.

Essa evidência **não fecha a meta externa**: as três páginas são fixtures, sem inspeção de loja pública; provedores, feed, contas de teste, BigQuery e homologações mantêm seus próprios critérios. A demonstração integrada do núcleo deixou de depender de ensaios separados, mas sua evidência permanece sintética. Estado das execuções e revisão visual: [STATUS.md](ESTADO-ATUAL.md).
