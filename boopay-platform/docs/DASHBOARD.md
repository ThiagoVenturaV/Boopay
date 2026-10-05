# Painel de receita e compra de teste

## Usar

1. Entre com o identificador e a chave do ambiente.
2. Em Checkout, selecione o simulador ou uma loja de teste conectada e autorizada pelo operador. Escolha quantidades e informe o CEP. Na loja conectada, preencha entrega, cobrança e cupom opcional.
3. Confira produtos, frete, taxas, impostos, descontos, endereços e total. Marque o aceite e confirme o resumo. Mudar a compra exige revisar e confirmar novamente.
4. No simulador, escolha aprovação ou recusa. No WooCommerce, envie o pedido com transferência bancária pendente. O servidor revalida a cotação e registra a tentativa antes do envio.
5. Se o resultado da loja estiver incerto, use **Consultar resultado**. A consulta recupera a mesma tentativa. Um pedido identificado pode continuar com pagamento pendente; só um pagamento confirmado entra na receita paga.
6. Volte à Visão da receita ou abra o pedido em Pedidos. O detalhe permite conferir o estado da loja; estorno demonstrativo continua restrito a pedidos do simulador.

Preço, estoque, confirmação e idempotência são conferidos pelo servidor. Recarregar a página recupera a sessão de compra do mesmo navegador. Tokens ficam em cookies HttpOnly; o sessionStorage guarda somente o identificador da compra e as chaves de repetição das tentativas. Produtos WooCommerce não usam silenciosamente o simulador de compra.

## Ler os valores

O período cobre dias completos no fuso America/Fortaleza. As opções são 7 ou 30 dias, e a origem pode ser simulada, observada ou ambas. Toda a conciliação e o gráfico usam o mesmo filtro.

- Pedidos aprovados: soma dos pedidos pagos criados no período, incluindo os posteriormente estornados. Pendentes, cancelados, falhos e resultados que exigem conciliação não entram nessa soma.
- Estornos: soma integral dos pedidos estornados dessa mesma coorte.
- Receita líquida: aprovados menos estornos. Inclui frete e impostos; não representa lucro e não desconta custos ou taxas de PSP.
- Receita por dia: atribuída ao dia original da criação do pedido. Um estorno posterior revisa aquele dia; não é um extrato de movimentação por data de liquidação.
- Conversão: sessões com pedido identificado divididas por sessões criadas no período. No checkout conectado, pedido identificado não significa pagamento recebido.
- Abandono: sessões canceladas ou expiradas divididas por sessões criadas. Saída de página isolada não comprova abandono. Uma tentativa enviada com resultado incerto permanece em conciliação, mesmo após o prazo original da sessão.
- Sem sessões, as taxas mostram travessão, pois não há denominador.

Moedas nunca são somadas entre si. A seletora aparece quando há mais de uma e contém somente as presentes no recorte; se um filtro excluir a moeda preferida, a interface passa a uma disponível. O resumo operacional continua contabilizando as sessões e pedidos de todas as moedas. Atribuição por origem não demonstra causalidade ou receita incremental.

## Origem e continuidade

Canal, superfície registrada e protocolo se combinam com período e evidência. A seção **Funil por origem** vem depois da conciliação e apresenta sessões por estado e receita na moeda atual. **Exportar sessões** baixa todas as sessões do mesmo recorte. Combinações sem dados permanecem escolhidas e mostram o vazio.

**Conclusão sem sair da página** separa continuidade informada pela interface, navegação registrada e ausência de medição. Compras antigas ou sem relato não entram como sucesso sem redirecionamento. A taxa usa todas as sessões criadas; a cobertura usa as concluídas. No celular, as tabelas têm rolagem própria e orientação para consultar as outras colunas. [Contrato e limites](REPORTING-ORIGINS.md).

**Fonte dos indicadores** abre na base operacional. Com BigQuery configurado, **Consultar e comparar** consulta sob demanda e permite selecionar o resultado analítico, com divergências explícitas. Alterar filtros exige nova consulta; CSVs e pedidos recentes continuam operacionais, identificados como tal. [Conciliação analítica](DATA-DASHBOARD.md).

## Exportar e navegar

Exportar baixa CSV UTF-8 com BOM, separador ponto e vírgula, moeda e valores inteiros em centavos. Inclui todos os pedidos do filtro, sem o limite visual de 20 recentes ou 100 na listagem. Campos são escapados e protegidos contra interpretação como fórmula. Identificadores, origem e data permitem reconciliação; endereço e dados pessoais não são exportados.

O detalhe mostra linhas e componentes do total. Abrir move foco e rolagem ao detalhe; fechar retorna à listagem. No celular, navegação e tabelas possuem rolagem própria, e o gráfico reduz a quantidade de rótulos. Uma tabela textual de valores do gráfico fica disponível pelo controle abaixo dele.

## Conexões e limites

O Catálogo possui as visões **Produtos** e **GEO e prontidão**. A segunda permite configurar páginas, acompanhar auditorias, consultar categorias/evidências e conferir pendências por SKU. Estado parcial e origem demonstrativa permanecem explícitos. A configuração de domínios exige autorização do ambiente, e o checklist funciona com o provedor externo desabilitado. Veja o [percurso GEO](GEO.md#usar-no-painel).

Configurações gera código WooCommerce de uso único, válido por 10 minutos, lista conexões e permite revogação explícita. O WordPress precisa alcançar o endereço da API; 127.0.0.1 de máquinas diferentes não é a mesma máquina.

Audiência e Agentes de IA incluem interfaces de perfil, consentimento, conversa, consumo e indexação, com disponibilidade dependente da configuração. O painel não indica homologação de ACP/UCP, serviços externos de IA, pagamentos de PSP, Shopify ou VTEX. Pedidos do simulador e das lojas de teste mantêm os limites de evidência documentados; um pedido nativo WooCommerce não comprova recomendação observada numa plataforma oficial. Consulte [IA e perfil](AI-PROFILE-UI.md) e [Checkout com loja conectada](CHECKOUT-COMMERCE.md).
