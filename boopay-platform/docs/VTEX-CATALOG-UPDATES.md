# Atualização incremental do catálogo VTEX

Implementação de 11/09/2026: receptor assinado, fila durável, releitura por SKU e candidato de ponte VTEX IO. Desativada por padrão. Os testes usam Core/HTTP/bancos reais e respostas/eventos VTEX sintéticos. A ponte compila contra `@vtex/api@7.5.0`, mas **não está liberada para instalação**: a revisão 0.2.1 tem 36 pacotes afetados na auditoria npm (nove altos e 27 moderados), após duas [correções transitivas testadas](VTEX-BRIDGE-DEPENDENCIES.md). O inventário anterior tinha 39 achados; a atualização comum não os eliminava. Nenhuma loja foi instalada ou ativada.

## Comportamento

Uma notificação invalida o SKU canônico e agenda sua releitura. O evento contém somente conta, SKU e data da alteração; preço, estoque e dados pessoais não entram no contrato. O worker consulta Search com vendedor, canal e `skuId`. Se encontra uma oferta, cria um carrinho nativo vazio para conferir BRL/BRA, duas casas decimais, canal e promissória de teste antes de atualizar o produto. Não cria pedido, transação financeira, pagamento ou receita. O carrinho vazio é um efeito remoto cuja retenção precisa ser homologada; seus cookies não são persistidos pelo worker.

Preço de Search é indicativo; a compra exige cotação e confirmação próprias do Checkout Core. Estoque desconhecido continua `available=null`. Somente produtos simples `un`, multiplicador 1 e sem kit são ativados. Uma atualização parcial preserva a data da inspeção completa e os demais SKUs. Ausência no índice mantém o produto inativo e preservado, com repetição progressiva; não comprova exclusão nativa.

Após sucesso, o SKU fica elegível a nova consulta após 30 minutos para reduzir o efeito do atraso do índice. Somente SKUs notificados entram nesse acompanhamento. Cotas e fila podem adiar a execução; não há promessa de atualização em tempo real ou em 30 minutos para todo o catálogo.

## Configuração

Além dos descritores públicos/privados de [VTEX-CHECKOUT.md](VTEX-CHECKOUT.md), configure `BOOPAY_VTEX_CATALOG_CONNECTIONS` (padrão `[]`):

```json
[{"connectionId":"vtex-test","tenantId":"tenant-demo","revision":1,"secretEnv":"BOOPAY_VTEX_CATALOG_TEST_SECRET"}]
```

O segredo indicado deve conter 64 caracteres hexadecimais aleatórios, guardados fora de Git/chat e iguais aos settings **privados** da ponte. O HMAC usa a sequência como texto, sem decodificá-la em bytes. Inicializar não consulta a loja nem concede publicação. Publique manualmente com os descritores atuais antes de receber eventos; alterações públicas/privadas exigem nova publicação. Rotacionar a chave exige incrementar a revisão de catálogo. Processos antigos perdem autorização; revogação bloqueia novas consultas e respostas atrasadas.

| Controle por conexão | Limite |
|---|---|
| Eventos novos | 1.000/dia UTC; duplicatas não consomem outra unidade |
| Tentativas de releitura | 200/dia UTC, incluindo falhas e verificações periódicas |
| SKUs acompanhados | 1.000; registros concluídos permanecem para acompanhamento |
| Worker | Até um SKU/conexão a cada minuto; rotação entre conexões |
| Lease | 2 minutos; resultado vencido/substituído não publica |
| Repetição de falha/ausência | Progressiva, de 2 minutos até 6 horas |
| Recibos | 30 dias; limpeza lógica durante novas admissões |
| Corpo / assinatura | 4 KiB / tolerância de 5 minutos |

São cotas para demonstração pequena: quatro SKUs a cada 30 minutos podem consumir 192 releituras/dia, antes de falhas/eventos extras. Lojas maiores exigem dimensionamento e aceite. Revogação não elimina registros ou backups; retenção física continua no plano operacional.

## HTTP e persistência

`POST /v1/vtex/catalog/:connectionId/notifications` aceita `application/json`, sem query, Origin, Cookie ou Authorization. Exige `x-boopay-sent-at` em segundos Unix e `x-boopay-catalog-signature` em Base64. O HMAC-SHA-256 cobre `v1`, `POST`, caminho exato, timestamp e SHA-256 hexadecimal dos bytes do corpo, separados por quebras de linha. A verificação precede o parse JSON. Retorna 202 para evento novo e 200 para repetido, com `{accepted:true,duplicate:boolean}`.

```json
{"version":1,"account":"authorized-test-account","sku":"1001","modifiedAt":"2026-09-11T12:00:00.000Z"}
```

`GET /v1/admin/vtex/catalog-updates/status` exige administrador do tenant e informa estado, fila, execução, última observação, erro sanitizado e cotas, sem segredo/corpo nativo. A [interface de acompanhamento](VTEX-CATALOG-UI.md) está em Configurações → VTEX → Atualização do catálogo. A consulta não dispara operações na loja. Configuração e segredos continuam no servidor.

`vtex_catalog_job`, `vtex_catalog_receipt` e `vtex_catalog_usage` persistem fila, deduplicação e orçamento. `vtex_catalog_credentials` guarda revisão e impressão cifrada da configuração; o segredo fica no ambiente. `vtex_catalog_publication` vincula a publicação aos descritores atuais. A transação valida tenant, revisão, lease e geração antes de gravar. Um evento durante consulta invalida o resultado anterior; reinício/outro pool pode retomar após expiração do lease.

## Ponte, testes e auditoria

O candidato 0.2.1 em [tools/vtex-catalog](../tools/vtex-catalog/README.md) usa Node builder 7.x, evento `skuChange`, sender `vtex.broadcaster` e chave `broadcaster.notification`. Minimiza `An`, `IdSku` e `DateModified`; ignora campos adicionais. Exige a conta compilada e settings privados com `enabled=false`. A permissão de saída limita host/caminho exatos. Envio ou confirmação perdidos produzem erro genérico; reentrega efetiva do runtime ainda precisa ser homologada. Não se presume entrega garantida. A [migração e prova de compatibilidade](VTEX-BRIDGE-RUNTIME.md) alinham TypeScript/tipos ao builder e acrescentam ensaio da composição oficial do SDK; auditoria e suporte do runtime continuam pendentes.

```sh
npm ci --ignore-scripts --prefix tools/vtex-catalog/node
npm run vtex:catalog:test
npm run vtex:catalog:yarn
npm run build
npm run vtex:catalog:smoke
npm audit --omit=dev --prefix tools/vtex-catalog/node
```

O ensaio reproduz contexto IO sintético → função nativa compilada → HTTP loopback → Core/persistência → Search sintético. Confirma resposta perdida com 202/200, preço de 2.431 centavos, zero pedidos, revogação e pacote sem chave/saída sobrescrita. Dois testes próprios validam assinatura/minimização e desligamento/conta/ack. Dez novos cenários de backend cobrem cotas, duplicatas, novos SKUs, moeda divergente, índice atrasado, revogação, reinício e disputa entre pools PostgreSQL. Não é execução no runtime VTEX.

O job `vtex-catalog-candidate` compila e ensaia o candidato. Suas auditorias npm/Yarn têm `continue-on-error` e publicam os relatórios como artefato para preservar os achados conhecidos; **job verde não significa auditoria do SDK aprovada**. O SDK fica isolado das dependências de execução do Core. A [evidência local](https://github.com/ThiagoVenturaV/boopay-platform/blob/3ab824e3375d6d5d2956e0ca61aa90100f93a0d7/docs/evidence/vtex-catalog-sdk-audit-2026-09-11.json) registra versões e avisos; não foram forçadas migrações incompatíveis para ocultá-los.

## Critérios abertos

Resolver as vulnerabilidades com uma composição suportada pela VTEX e validar o runtime antes de liberar instalação. Em conta/workspace autorizados: verificar permissões, sigilo dos settings/proxy, evento real, reentrega, atraso de índice, remoção/desativação, promoção/estoque, cotas, revogação e retenção dos carrinhos vazios. O Broadcaster cobre a própria conta, não alterações nas contas dos sellers; essas exigem outra estratégia. Remoção comprovada, escala e homologação continuam pendentes, assim como o adaptador integral e a meta do projeto. A interface de acompanhamento foi implementada e verificada com VTEX sintética, conforme seu [contrato e limites](VTEX-CATALOG-UI.md).

## Referências primárias

Consultadas em 11/09/2026:

- [Broadcaster Adapter](https://developers.vtex.com/docs/guides/vtex-broadcaster): evento, campos e limite de sellers.
- [Receber alterações no VTEX IO](https://developers.vtex.com/docs/guides/how-to-receive-catalog-changes-on-vtex-io): serviço de eventos.
- [Settings do aplicativo](https://developers.vtex.com/docs/guides/vtex-io-documentation-creating-an-interface-for-your-app-settings): privacidade por omissão de `access` e `getAppSettings`.
- [Permissões de saída](https://developers.vtex.com/docs/guides/accessing-external-resources-within-a-vtex-io-app): host/caminho.
- [Search OpenAPI fixado](https://github.com/vtex/openapi-schemas/blob/347a911aee100ca55b3fc83651acddd28ad68b7e/VTEX%20-%20Search%20API.json): filtro `skuId`, vendedor/canal. Arquivo previamente conferido, SHA-256 `f6572c6b745b1e5c1256f42680ee50accf09dc3d335359b4126ae8c849576f9c`.
