# Feed de produtos e prontidão

Implementação local em 10/09/2026. O gestor prepara e baixa um catálogo JSONL pelo Catálogo → GEO e prontidão → Feed de produtos. O arquivo usa o perfil **Stable de File Upload / Products da OpenAI**, consultado em [10/09/2026](https://developers.openai.com/commerce/specs/file-upload/products). Não usa o esquema Draft. `boopay-openai-file-products-2026-09-10-v1` identifica as regras locais, sem inventar uma versão oficial.

Este incremento atende à geração e validação local do feed prevista no escopo como “feed ACP”. Descoberta por arquivo e operações de checkout ACP/UCP são contratos separados. Gerar, baixar ou ter um item no arquivo não comprova distribuição, aceitação, elegibilidade, recomendação externa ou venda. Não há envio automático nem chamada ao serviço OpenAI.

## Dados e validação

Cada linha corresponde a um item ou variação e contém os nove campos básicos documentados: identificador, título, descrição, página, marca, vendedor, imagem, disponibilidade e preço. O arquivo inclui a condição declarada e a intenção de participação em busca; produtos inativos recebem `is_eligible_search:false`. Preço é expresso em unidade monetária principal, preservando os centavos do catálogo.

O lojista informa **marca, vendedor e condição** por produto. Nenhum deles é inferido pela IA. O cadastro exige a revisão do produto e a revisão dos metadados; edição concorrente retorna 409. Qualquer nova revisão canônica exige conferir e salvar a declaração novamente, inclusive quando a mudança é de preço/estoque. Essa política conservadora evita reutilizar uma declaração sobre outro estado do produto.

- Preço, disponibilidade, identidade, páginas, imagens e variantes vêm do catálogo. Não são editáveis neste formulário.
- Identificadores são strings. O ID canônico do item é estável; o grupo deriva da integração e do pai, sem preço no ID. Uma identidade já usada em arquivo não pode ser reaproveitada para outro item externo.
- Variações precisam de pai, atributos preenchidos, os mesmos nomes de opções no grupo e combinações distintas.
- A validação local limita título a 150 caracteres e descrição a 5.000 após remoção de tags. Não trunca silenciosamente.
- URLs exigem HTTPS sem credenciais, endereços locais/IPs ou parâmetros conhecidos de autenticação. Parâmetros de variantes e imagem são preservados. Esta validação é sintática: não visita nem certifica páginas ou imagens públicas.
- Preço e estoque usam a data da origem, inclusive o watermark de sincronização. Dados com 24 horas ou mais, data inválida ou futuro além de cinco minutos impedem a geração.
- Disponibilidade desconhecida permanece `unknown`; falta de estoque é explícita. Itens sem estoque ou inativos continuam representados, permitindo informar a disponibilidade correta em vez de desaparecer silenciosamente. Não há pré-venda inferida.
- O arquivo só é gerado quando todos os itens passam pelas regras do feed. Sem catálogo, a interface orienta sincronizar; pendências são mostradas por produto.

## Estados de prontidão

`boopay-catalog-readiness-v2` preserva o booleano `ready` e acrescenta `state`. A ordem de precedência é:

| Estado | Critério |
|---|---|
| `blocked` | Inativo, preço inválido, disponibilidade zero/fora de estoque/backorder ou dados da origem fora da validade |
| `unknown` | Nenhum bloqueio conhecido, mas disponibilidade explicitamente desconhecida ou sem quantidade/status positivo |
| `pending` | Informação comercial conhecida, com lacunas no checklist de conteúdo/páginas/políticas |
| `ready` | Todos os requisitos internos atendidos |

A classificação pode transitar entre estados sem alterar preço ou estoque. Eventos preservam `catalog.product.ready`/`catalog.product.not_ready` e incluem o novo estado. Na primeira avaliação de um registro v1, o estado v2 fica persistido.

**Prontidão comercial e validade do feed são diferentes:** um item fora de estoque pode ter uma linha de feed válida que informa essa condição. Uma URL de política declarada não prova conformidade; checklist, auditoria GEO e elegibilidade oficial continuam separados.

## Arquivo e trilha preservados

A geração ocorre na mesma transação que lê produtos, origem e declarações. O cliente envia o digest da validação que revisou; uma mudança exige nova validação. O mesmo conteúdo/revisões retorna o mesmo arquivo, inclusive após perda de resposta. Não há efeitos externos para repetir.

`catalog_feed` guarda o snapshot imutável, revisões, contrato, data, validade, registros e SHA-256 dos bytes UTF-8 do JSONL. O download autenticado revalida o catálogo inteiro: alteração ou expiração retorna `feed_stale`, sem servir um arquivo antigo como atual. Arquivos históricos permanecem como evidência interna, sem rota de download obsoleto.

A recomendação preserva `preparedFeed` quando a revisão selecionada, declaração e validade correspondem à versão gerada. O vínculo identifica preparação daquele item, não atualidade futura do arquivo inteiro. Mudanças posteriores não reescrevem a recomendação. O campo acompanha seleção, checkout e pedido na [trilha de descoberta](DISCOVERY.md) e no CSV. Recomendações antigas continuam sem vínculo inferido. A exclusão/retenção do perfil remove o snapshot pessoal, preservando os arquivos comerciais sem dados do comprador.

`distribution:not_recorded` e `eligibility:not_evaluated` permanecem explícitos. O evento `catalog.feed.generated` é diferente de qualquer confirmação de envio/aceitação; catálogo misto com itens simulados não recebe evidência de origem totalmente observada.

## API administrativa

Todas as rotas exigem administrador, isolamento por tenant e `Cache-Control: no-store`; gravações seguem a proteção de origem existente.

| Método e caminho | Resultado |
|---|---|
| `GET /v1/admin/catalog/feed` | Validação por produto, metadados e `inputDigest` |
| `POST /v1/admin/catalog/feed/metadata` | Salva `productId`, `expectedProductRevision`, `expectedRevision`, `brand`, `sellerName`, `condition` |
| `POST /v1/admin/catalog/feed` | Gera com `{expectedDigest}` e retorna snapshot |
| `GET /v1/admin/catalog/feed/:id/download` | Attachment `boopay-products.jsonl`, revalidado no servidor |

Não há credenciais OpenAI nesse fluxo. Upload externo, registro do feed no canal, recibos oficiais e homologação dependem da integração e do ambiente autorizado.

## Verificação

`test/catalog-feed.test.ts` cobre geração idempotente, centavos/UTF-8/SHA-256, tenant/autorização, concorrência, expiração, identidade reutilizada, variantes, disponibilidade, quatro estados e vínculo imutável até receita. O caso PostgreSQL usa duas conexões independentes. `e2e/feed.spec.ts` exercita o formulário, teclado, falha/recuperação e download obsoleto em 1440/390 px.

`npm run discovery:demo` agora prepara e valida o arquivo antes da recomendação, mantendo o mesmo abandono, compra e estorno reconciliados. Todos os dados da demonstração são fictícios; não há provedor ou loja externa homologada. Resultados efetivamente executados ficam em [STATUS.md](ESTADO-ATUAL.md).
