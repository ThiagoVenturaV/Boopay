# Funil, atribuição por origem e continuidade da compra

Extensão do painel em 11/09/2026, preservando a composição B aprovada. O painel apresenta o estado das sessões e a receita atribuída por canal, superfície registrada e protocolo. As categorias vêm da origem persistida no Core; não certificam presença em ChatGPT, Gemini ou outra superfície oficial.

## Recorte único

`from`, `to`, `evidence`, `channel`, `surface` e `protocol` são filtros opcionais combinados por **E**. Datas ISO inclusivas. Sessões/pedidos usam sua data de criação; eventos usam a data do evento. O estorno revisa a coorte original. Valores monetários permanecem em centavos e separados por moeda. Produtos/ativos continuam sendo o catálogo atual, sem filtro de origem.

| Canal | Regra da origem persistida |
|---|---|
| `simulator` | `boopay-simulator`, exceto o protocolo de IA abaixo |
| `boopay_ai` | `boopay-simulator` + `boopay-shopping-v1` |
| `agent_protocol` | Superfície `acp` ou `ucp` |
| `storefront` | Superfície `storefront` |
| `webmcp` | Categoria reservada; não anuncia integração implementada |

A criação HTTP comum aceita `boopay-v1`; não permite se atribuir manualmente ao fluxo de IA. A seleção persistida de IA e o gateway autenticado ACP/UCP carimbam suas próprias origens. A classificação de registros históricos usa o valor já registrado e não prova retroativamente como foram produzidos.

As mesmas dimensões filtram o resumo, os CSVs, o relatório de descoberta e as consultas BigQuery. `GET /v1/admin/report-dimensions` retorna opções distintas apenas da loja autenticada. Combinações sem correspondência produzem estado vazio; filtros não são removidos silenciosamente.

## Contagens e exportações

- `sessionFunnel`: grupos de canal/superfície/protocolo/estado, cuja soma é o total de sessões filtradas. Expiração pelo relógio é apresentada como `expired`, exceto submissão ou conciliação em curso. Cancelamento mantém seu estado.
- `revenueByOrigin`: pedidos pagos ou estornados agrupados por origem/moeda, com aprovado, estornado, após estornos e contagem. Pedidos pendentes não viram receita; atribuição não prova incremento de vendas.
- `GET /v1/admin/reports/sessions.csv`: todas as sessões do recorte, estado no instante da exportação e situação da medição. UTF-8 com BOM, separador `;`, células protegidas contra fórmulas. Sem documento bruto, fingerprint ou identificação do comprador.
- O CSV de pedidos acrescenta canal e protocolo ao final das colunas existentes. As tabelas de origem exibem até 100 grupos e orientam refinar o recorte; o CSV operacional mantém todas as sessões/pedidos.

Todos os endpoints administrativos exigem sessão da loja e retornam `no-store`. Exportações permanecem na base operacional, inclusive quando os indicadores BigQuery estão selecionados, com identificação visível no link.

## Medição da navegação

A interface cria um UUID efêmero por documento e o envia no header `X-Boopay-Document-Id`. Não usa armazenamento persistente para esse identificador. Na criação de uma compra comum ou seleção de IA, o Core grava atomicamente somente um fingerprint vinculado à loja, à sessão e ao documento. Retentativas idempotentes não substituem o início da medição. Compras antigas não ganham um início retroativo.

`POST /v1/buyer/checkouts/:id/navigation`, body estrito `{ "context": "checkout" }` ou `{ "context": "protocol_handoff" }`, exige comprador proprietário e UUID válido. Handoff exige também um vínculo de protocolo do mesmo comprador. O comprador não envia um resultado de conclusão; o serviço consulta o estado canônico.

| Situação | Resultado para uma sessão concluída |
|---|---|
| Documento original relata a conclusão, sem navegação previamente registrada | `same_document` |
| Troca de documento ou revisão por protocolo registrada antes da conclusão | `navigation_recorded`, mesmo se o relato final for perdido |
| Sem início medido, relato ausente ou primeiro relato final em outro documento | `unknown` |

Recargas e retornos do cache de navegação geram outro documento de medição. Visitas posteriores à compra não reescrevem um resultado final já observado nem inventam um handoff anterior. Escritas sem alteração não geram novas versões. A API persiste a medição em transação; falha de telemetria não autoriza, bloqueia ou repete um pagamento.

`navigation.completionWithoutRedirectRate` = conclusões informadas na mesma página / **todas as sessões criadas** no recorte. `measuredCompletionRate` = conclusões com medição conhecida / **sessões concluídas**. Denominador vazio retorna `null`. A UI mostra contagens com navegação e sem medição separadamente; desconhecidos não são classificados como sucesso sem redirecionamento.

Esta é uma medição declarada pela interface instrumentada. Não é prova independente de todas as ações do navegador ou de um PSP. Recargas e handoffs contam como navegação, sem afirmar um destino específico. Relatos podem faltar; renovação que crie outra sessão sem contexto de documento continua desconhecida. Não se promete cobertura integral.

## Projeções e contrato analítico

Checkout projeta somente `navigationMode`; UUID/fingerprint não são enviados a Firestore/BigQuery. Mudanças usam os marcadores versionados da outbox, sem criar eventos comerciais artificiais. O contrato do painel passa a `boopay-dashboard-v2`, também incluído na chave do cache. SQL usa dimensões parametrizadas e deriva a mesma classificação de canal.

O parser verifica dimensões únicas e coerentes, soma do funil, cobertura da medição e reconciliação da receita por origem com cada agregado de moeda. Ausência de medição em payload antigo é `unknown`. Divergências indicam a dimensão e o valor correspondente. Versões, quotas, leases e limites de [DATA-DASHBOARD.md](DATA-DASHBOARD.md) permanecem aplicáveis.

## Verificação e limites

`test/reporting-navigation.test.ts` cobre criação/observação HTTP, isolamento, relato ausente, idempotência, projeções sem identificador, filtros, estados efetivos, múltiplas moedas, seleção de IA e concorrência entre pools PostgreSQL. `test/data-dashboard.test.ts` inclui as novas dimensões no contrato sintético e nos parâmetros da consulta.

`e2e/origins.spec.ts` exercita a compra pela interface, continuidade e recarga, filtros combinados, estado vazio, exportação e layout em 1440/390 px. Os dados são explicitamente sintéticos. Resultados executados ficam em [STATUS.md](ESTADO-ATUAL.md); a lista de cenários não substitui evidência de aprovação.

Execução do SQL no Google Cloud e homologação das lojas/provedores continuam pendentes dos ambientes autorizados. Esta extensão implementa as dimensões locais do item 7.10, preservando as dependências externas da [matriz de entrega](CRITERIOS-DE-ACEITE.md).
