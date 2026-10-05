# VTEX: inspeção e checkout de teste

A [atualização incremental](VTEX-CATALOG-UPDATES.md) adiciona opt-in independente, receptor assinado, fila e releitura por SKU. O candidato Broadcaster compila e passa no ensaio HTTP sintético, mas sua instalação está pendente por auditoria do SDK e homologação. A inspeção pública manual continua independente dessa extensão.

Implementação iniciada em 10/09/2026. Este documento descreve a inspeção pública, que permanece independente. A extensão [Checkout VTEX](VTEX-CHECKOUT.md) implementa configuração privada, catálogo canônico opt-in, sessão/cotação, confirmação explícita, promissória, registro durável, pedido pendente, conciliação e interface. [ACP/UCP](PROTOCOL-COMMERCE.md) usam esse método com dados privados na revisão do comprador. A [API de cancelamento pendente](VTEX-CANCELLATION.md), acrescentada em 11/09/2026, registra envios sem replay e exige novo aceite. **O adaptador VTEX integral do MVP permanece incompleto**: PSP/captura, homologação do [cancelamento com interface](VTEX-CANCELLATION-UI.md), pós-compra de pedidos pagos/estorno, expurgo remoto e homologação externa ainda são pendentes. Os testes VTEX usam exclusivamente transporte sintético.

## Operações implementadas

`VtexPublicApi` consulta a Legacy Search API por conta/canal/vendedor, normaliza ofertas no formato `Product` do Core e chama Cart Simulation com SKU, quantidade, vendedor, país e CEP. `VtexRuntime` controla configuração, propriedade, revisão, cotas, revogação e persistência. O processo principal inicializa os descritores sem chamadas externas; as consultas só acontecem por ação administrativa explícita.

As ofertas ficam em `vtex_snapshot`, separadas dos registros `product`. A inspeção não publica automaticamente na IA, no catálogo do comprador ou no Checkout Core. A extensão privada pode publicar ofertas explicitamente após confirmar preferências nativas; o snapshot isolado continua sem efeito comercial. O evento `vtex.catalog.inspected` registra apenas conexão, contagem, hash do ator e ausência de publicação canônica.

## Contrato e fontes

Consulta dos contratos oficiais em 10/09/2026, revisão `347a911aee100ca55b3fc83651acddd28ad68b7e` do [repositório VTEX](https://github.com/vtex/openapi-schemas/tree/347a911aee100ca55b3fc83651acddd28ad68b7e). Os hashes abaixo identificam os bytes examinados; não representam uma versão negociada pelo servidor VTEX, que não fornece esse mecanismo nestas rotas.

| Contrato | SHA-256 |
|---|---|
| [Checkout API](https://github.com/vtex/openapi-schemas/blob/347a911aee100ca55b3fc83651acddd28ad68b7e/VTEX%20-%20Checkout%20API.json) | `b125e70f052581bb50ad79c534b3228f007875566ab313ca95f7f54fb937c5e0` |
| [Search API](https://github.com/vtex/openapi-schemas/blob/347a911aee100ca55b3fc83651acddd28ad68b7e/VTEX%20-%20Search%20API.json) | `f6572c6b745b1e5c1256f42680ee50accf09dc3d335359b4126ae8c849576f9c` |

Referências operacionais: [Legacy Search](https://developers.vtex.com/docs/api-reference/search-api), [Checkout API](https://developers.vtex.com/docs/api-reference/checkout-api), [headless cart/checkout e proteção de dados](https://developers.vtex.com/docs/guides/headless-cart-and-checkout). A finalização exige o fluxo transacional e de pagamento descrito nesses contratos; chamar apenas uma rota de criação não comprova compra concluída.

O parâmetro `sc` da busca também foi conferido no [cliente oficial de catálogo do Store GraphQL](https://github.com/vtex-apps/store-graphql/blob/master/node/clients/catalog.ts): o cliente o adiciona a partir do canal do segmento. O resultado público de Search ainda não fornece, por si só, prova negociada da moeda/contexto recebido; a homologação deve conferir a conta/canal configurados.

## Catálogo

Somente origem HTTPS exata `https://{account}.vtexcommercestable.com.br`, aprovada separadamente em `BOOPAY_COMMERCE_ALLOWED_ORIGINS`. Conta, canal e vendedor são configurados pelo operador. URLs de produtos/imagens são metadados HTTPS; o servidor não as visita. Não há envio de AppKey, AppToken, autorização, cookies ou identidade do cliente.

`GET /api/catalog_system/pub/products/search` recebe `sc`, `fq=sellerId:...`, `_from` e `_to`. São até 50 produtos por página, 2500 produtos examinados e 1000 ofertas do vendedor. Fim da paginação exige uma página menor que 50. Se o limite for atingido sem prova do fim, o resultado é recusado; não se publica uma parte como completa. Repetição de produto/SKU, formatos inválidos, limite de tamanho ou falha em qualquer página preservam a observação anterior.

O índice Search não oferece snapshot transacional. Mesmo uma leitura sem erro pode sofrer omissões quando o índice muda entre páginas. Portanto, ausência não é prova de exclusão do produto. White label sellers e catálogos maiores exigem estratégia específica de catálogo/indexação antes da implementação completa.

`commertialOffer.Price` é convertido sem arredondamento silencioso para centavos. Usa-se `IsAvailable`; `AvailableQuantity` não é tratado como estoque físico. `available` permanece `null`. Kits, unidades e multiplicadores são preservados como metadados; só unidades `un` com multiplicador 1 e sem kit podem ser simuladas nesta etapa. O servidor exige representações HTTPS e campos completos conforme o subconjunto documentado; incompatibilidades bloqueiam a leitura inteira.

**Moeda:** a Search/Simulation não confirma a moeda no subconjunto usado. BRL é uma declaração do operador, marcada `currencySource:configuration_unverified`. Não é prova suficiente para confirmar ou cobrar. Validar preferências da loja/moeda faz parte do futuro fluxo transacional.

## Simulação

`POST /api/checkout/pub/orderForms/simulation?sc=...&RnbBehavior=0` recebe apenas itens, `country:BRA` e CEP. Não pede dados desatualizados, não substitui preços, não envia endereço completo, documento, e-mail, cookie, cupom ou dados de pagamento. Exige snapshot da revisão vigente e SKU previamente observado.

A resposta verifica país/CEP, correspondência por `requestIndex`, SKU, quantidade, vendedor, cadeia de um vendedor, disponibilidade, unidades, validade dos preços e coerência da logística. `priceDefinition.total` e a soma dos grupos de arredondamento são a referência por item; `sellingPrice * quantity` não é utilizado para reconstruir valores. Mensagens de erro/aviso, mudança de vendedor ou quantidade e arredondamentos inconsistentes causam recusa.

Retorna total de mercadorias, tributo informado por item, alternativas de entrega por item com preço/tributo/prazo e validade de até cinco minutos, limitada pela validade remota. Não escolhe uma combinação de SLAs nem infere aplicação de tributos. As alternativas não são um frete agregado ou compromisso de entrega; janelas, pickup, benefícios condicionados e pagamento exigem tratamento próprio.

`finalTotal:null` e `checkoutAvailable:false` são invariantes. O fingerprint identifica o resultado da consulta, **não é o `quoteHash` do Core nem autorização para comprar**. Consulta e resposta não ficam armazenadas; a cota guarda somente dia e contagem, sem CEP. O CEP é enviado à conta VTEX permitida apenas quando o administrador solicita uma simulação.

## Configuração e operação

Por padrão `BOOPAY_VTEX_CONNECTIONS=[]`. Exemplo em `.env.example`, com descritor de conta de teste a ser substituído pelo operador. O descritor de inspeção não recebe credenciais: as duas rotas desta camada são públicas. O checkout exige o descritor privado separado de [VTEX-CHECKOUT.md](VTEX-CHECKOUT.md). O tenant deve existir. Inicializar apenas configura o processo e seus registros locais.

Conta/canal/vendedor/tenant são imutáveis por conexão; uma mesma combinação não pode ser apropriada por outra conexão. Mudança de validade exige revisão maior. Revisão maior invalida a observação anterior, preserva cotas e impede a gravação de uma execução atrasada. Remover o descritor desabilita chamadas naquele processo; a revogação explícita persiste no banco, apaga snapshot e credenciais privadas, inativa os produtos publicados e não é desfeita por reinício.

| Rota administrativa | Operação |
|---|---|
| `GET /v1/admin/vtex/status` | Capacidades, estado, revisão de contrato, contagens e último erro sanitizado |
| `POST /v1/admin/vtex/:id/sync` com `{}` | Consulta integral e substituição atômica da observação |
| `GET /v1/admin/vtex/:id/catalog` | Observação administrativa da revisão atual |
| `POST /v1/admin/vtex/:id/simulate` | Corpo `{"items":[{"sku":"1001","quantity":3}],"postalCode":"60000000"}` |
| `POST /v1/admin/vtex/:id/revoke` com `{}` | Revoga, elimina snapshot/credenciais privadas e inativa produtos VTEX publicados |

Todas exigem sessão administrativa do tenant; POST exige a origem exata do Boopay. Não existe bypass de CSRF para VTEX. O comprador não pode executar essas rotas. Uma leitura concorrente retorna `worked:false` enquanto o lease de quatro minutos estiver ativo. Escrita exige lease vigente e configuração ainda autorizada na mesma transação. Cada chamada externa revalida autorização; revogação no meio da operação impede novas páginas e a publicação do resultado tardio.

Limites por conexão/dia UTC: dez leituras integrais e cem simulações, incluindo falhas iniciadas. Sem repetição automática, worker periódico ou webhook nesta etapa. Cada HTTP tem prazo de 15 s, corpo máximo de 2 MB e redirecionamento recusado. Leitura integral tem prazo de três minutos mais a requisição corrente; lease expira em quatro minutos. Os limites são deliberadamente conservadores para esta fundação. Quotas não são proteção distribuída por identidade de usuário fora do tenant.

## Evidências da fundação de inspeção

Depois de `npm run build`, execute `npm run vtex:demo` para a jornada administrativa com SQLite efêmero e transporte VTEX sintético. O comando não lê `.env` nem usa contas externas. Exibe uma oferta, três unidades cujo arredondamento fecha em 1000 centavos, alternativa de entrega, ausência de total final e zero pedidos/receita. Credenciais efêmeras ficam apenas em memória e não são impressas.

Os testes usam HTTP de aplicação/Core e SQLite reais, com resposta VTEX sintética. Incluem propriedade entre tenants, revisão, revogação após reinício, cotas, paginação e preservação do resultado anterior, arredondamentos, preços vencidos, divergência de entrega, autorização HTTP e ausência de efeitos comerciais. O teste PostgreSQL dedicado usa dois pools para tomar um lease expirado e recusar a escrita atrasada; passou na [CI 34543064325](https://github.com/ThiagoVenturaV/boopay-platform/actions/runs/34543064325), junto com os outros cinco jobs. Naquela revisão, a suíte global cobriu 213 cenários de backend entre PostgreSQL/Firestore e os 31 percursos de navegador existentes; aquela etapa não incluía interface VTEX. Demo verificada em Windows e Linux. Resultados consolidados ficam em [STATUS.md](ESTADO-ATUAL.md).

A evolução transacional e suas evidências atuais estão em [VTEX-CHECKOUT.md](VTEX-CHECKOUT.md) e [STATUS.md](ESTADO-ATUAL.md). A demo de inspeção permanece sem pedidos; a nova `npm run vtex:checkout:demo` cobre promissória pendente e recuperação sem reenvio. Essas evidências não equivalem à conclusão integral do MVP ou à homologação externa.
