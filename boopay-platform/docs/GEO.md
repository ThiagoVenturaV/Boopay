# GEO e prontidão do catálogo

Implementação de 09/09/2026, ampliada em 10/09/2026. A API persiste planos de páginas, tentativas, estados, relatórios normalizados, vínculos de URL com SKU e eventos na mesma transação. A interface administrativa está disponível em **Catálogo → GEO e prontidão**. A [geração e validação do feed](CATALOG-FEED.md) é local; distribuição externa continua pendente. Auditorias não modificam conteúdo da loja, preço, estoque ou checkout.

## Usar no painel

1. Abra **Catálogo → GEO e prontidão**. O checklist pode ser consultado mesmo com auditorias externas desabilitadas. A habilitação e os domínios autorizados são definidos pelo operador do ambiente.
2. Em **Configurar páginas**, escolha o domínio e o catálogo correspondente. Informe início, categoria e produto; URLs de outro domínio são recusadas. As políticas de entrega, devolução e privacidade são opcionais na configuração, mas sua ausência aparece nas pendências do catálogo.
3. Salve as páginas e selecione **Iniciar auditoria na KeyCore**. A interface preserva a chave de idempotência no navegador até receber a resposta da criação. Uma execução ativa impede outra para o mesmo site.
4. Acompanhe o estado e use **Consultar andamento** quando necessário. Atualizações automáticas leem o estado persistido; o worker do backend acompanha o provedor. Recarregar o navegador preserva o histórico e a execução. Uma criação com resultado incerto exige conciliação operacional e não oferece reenvio automático.
5. Confira score, categorias e lacunas. Os detalhes expõem páginas solicitadas/recebidas, SKUs vinculados, evidências, recomendações, agentes, versões e custo informado. Campos ausentes continuam identificados como ausentes; o rótulo **Dados de demonstração** identifica o provedor sintético dos testes.
6. Em **Prontidão do catálogo**, filtre produtos com pendências ou requisitos atendidos e abra o checklist. O vínculo de uma auditoria antiga pode deixar de representar a revisão atual do produto. Requisitos internos atendidos não equivalem à aprovação em canais oficiais.

Configuração e relatório recebem foco ao abrir; fechar a configuração devolve o foco ao controle de origem. Atualizações de dados preservam campos ainda não salvos. Erros de validação mantêm os valores para correção. Revogar o domínio bloqueia iniciar/consultar e mostra a orientação para restaurar a autorização, sem esconder histórico. A consulta também verifica o domínio congelado na auditoria. O relatório é texto escapado e links HTTPS sem credenciais; conteúdo recebido não é executado como HTML.

## Contrato disponível

O cliente público da [KeyCore](https://www.keycore.com.br/geo-audit), inspecionado nesta data, usa `POST https://api.keycore.com.br/geo-audits` com `url`, `source` e `mode: sample_3_pages`; a resposta contém `audit_id`. O acompanhamento público usa `GET /geo-audits/{audit_id}/events` por SSE. O endpoint `/report` retornou 401 sem autenticação. Nenhum fluxo de lead, PDF, cadastro ou contato foi acionado.

A criação aceita uma URL inicial e escolhe sua própria amostra. Não foi observado parâmetro que garanta as três URLs solicitadas nem contrato público de idempotência na criação. O Boopay envia apenas a URL inicial autorizada e verifica a cobertura no resultado. A versão própria do adaptador, `keycore-public-sse-observed-2026-09-09`, não representa a versão das regras/agentes da KeyCore. Metadados ausentes permanecem nulos.

## Configurar e executar

```dotenv
BOOPAY_GEO_PROVIDER=keycore-public
BOOPAY_GEO_ALLOWED_ORIGINS=https://loja.exemplo.com
BOOPAY_GEO_DAILY_LIMIT=5
```

O padrão é `none`, sem chamadas externas. Cada origem exige HTTPS, hostname público, ausência de credenciais e porta padrão. A autorização é exata, sem wildcard ou autorização automática pelo cadastro. O backend só acessa o endpoint fixo da KeyCore e recusa redirecionamentos. Resolução DNS, rebinding, robots e redirecionamentos durante o rastreamento continuam sob responsabilidade do crawler da KeyCore; o Boopay não faz crawl direto.

O operador autenticado configura `POST /v1/admin/geo/sites`:

```json
{
  "id": "loja-principal",
  "origin": "https://loja.exemplo.com",
  "integrationId": "ID_DA_CONEXAO_WOOCOMMERCE",
  "language": "pt-BR",
  "region": "BR",
  "pages": [
    { "kind": "home", "url": "https://loja.exemplo.com/" },
    { "kind": "category", "url": "https://loja.exemplo.com/categoria/cafe" },
    { "kind": "product", "url": "https://loja.exemplo.com/produto/cafe" }
  ],
  "policies": {
    "shipping": "https://loja.exemplo.com/entrega",
    "returns": "https://loja.exemplo.com/trocas",
    "privacy": "https://loja.exemplo.com/privacidade"
  }
}
```

A conexão deve pertencer ao tenant, estar ativa e corresponder ao domínio. `integrationId: null` permite um site de demonstração, vinculando somente produtos do simulador. URLs de outro domínio são recusadas. Tracking e fragmentos são removidos; parâmetros aceitos de página/produto estão enumerados em `publicPageUrl`, e outros são recusados para evitar enviar tokens ou dados privados.

`POST /v1/admin/geo/audits`, com `Idempotency-Key` e `{ "siteId": "loja-principal" }`, persiste a fila e retorna o ID. O processo principal consulta a fila a cada dez segundos, sem sobrepor ciclos no mesmo processo. Leases no banco evitam posse simultânea entre processos. `GET /v1/admin/geo/audits/{id}` consulta o estado; `POST .../{id}/refresh` executa uma consulta explícita. `/geo/sites`, `/geo/audits` e `/geo/status`, sob o prefixo `/v1/admin`, listam configuração e histórico. Todas as rotas exigem autenticação administrativa.

## Persistência e recuperação

Plano e revisão do site ficam congelados na auditoria. Repetir a chave com a mesma revisão retorna a execução; repetir após alterar a configuração gera conflito. Há uma auditoria ativa por site e, por padrão, cinco criações por tenant numa janela móvel de 24 horas.

Antes do job externo, estado `submitting` e lease são gravados. Se o processo cair ou perder a resposta sem conhecer o ID, o estado passa a `reconciliation_required`. Não há repetição automática do POST. A API ainda não oferece associação manual de ID externo ou cancelamento remoto: essa condição exige conciliação operacional com a KeyCore antes de outra execução.

Com ID conhecido, repetições leem apenas o SSE do mesmo job. Lease expirada permite retomar a consulta. Falhas usam espera progressiva entre dez segundos e cinco minutos; seis falhas ou desaparecimento do job encerram o acompanhamento. Trinta minutos sem conclusão também encerram o acompanhamento, preservando o ID para consulta explícita posterior. Remover a origem autorizada interrompe novos envios e consultas.

O provedor público mantém jobs em memória. Persistência Boopay não recupera um relatório que nunca chegou antes de ser perdido no provedor. Uma referência devolvida novamente não gera outra conclusão local. Mudanças de estado geram eventos duráveis e outbox, com ID, site, produtos, problemas sanitizados e hash; corpos brutos e erros do provedor não entram nos eventos. SSE tem limite de 1 MiB e doze segundos por consulta.

## Conclusão e evidências

`completed` exige categorias coerentes, versões de regras/agentes, datas do provedor, análise semântica concluída, achados com evidência/recomendação, cobertura HTTP 200 das três páginas e vínculo com produto canônico. Esta versão exige ao menos um achado documentado; relatório vazio sem evidência de verificações bem-sucedidas fica parcial. Ajustes de score sem explicação também ficam parciais.

O score recebido é preservado quando a qualificação é `partial`; lacunas ficam em `issues`. Datas locais não substituem datas ausentes do provedor. Custos são estimativas informadas, não cobranças confirmadas. Fixtures mantêm evidência `simulated`; o cliente externo mantém `observed`. Isso descreve a origem da auditoria, não uma recomendação de produto por IA.

O vínculo usa URL normalizada, conexão, SKU, ID e revisão persistidos. Variações na mesma página aparecem como vários vínculos explícitos; não se escolhe silenciosamente um SKU. Alterar catálogo ou plano invalida o vínculo atual, preservando o histórico.

## Checklist comercial

`GET /v1/admin/catalog/readiness` reavalia `boopay-catalog-readiness-v1`: produto ativo, nome, descrição, SKU, categoria, URLs públicas, preço positivo, estoque conhecido, origem atualizada nas últimas 24 horas e URLs declaradas de entrega, devolução e privacidade. No WooCommerce, usa a data do evento de origem; receber uma sincronização atrasada não torna o dado atual.

Estoque sem quantidade pode ser disponível quando o plugin declara `instock`; backorder e disponibilidade desconhecida exigem revisão. Políticas são URLs declaradas, sem afirmar que seu conteúdo foi lido ou aprovado. Transições de prontidão geram eventos sem duplicação. A validade temporal acompanha o registro e deve ser respeitada pelos consumidores.

O checklist não certifica ACP, UCP ou Merchant Center: mantém `channelEligibility: not_evaluated`, auditoria mais recente, estado e vínculo atual. Score alto não torna catálogo incompleto distribuível; catálogo completo não prova recomendação nem venda.

## Evidência e limites

Em 09/09/2026, uma auditoria pública da própria KeyCore foi criada e consultada novamente pelo adaptador compilado, sem reenviar a análise. [Registro](https://github.com/ThiagoVenturaV/boopay-platform/blob/3ab824e3375d6d5d2956e0ca61aa90100f93a0d7/docs/evidence/geo-keycore-2026-09-09.json): estado externo `completed`, score 89, quatro agentes falhos, zero achados e versões/datas ausentes; qualificação Boopay `partial`. Não é auditoria da loja WooCommerce nem comprova cobertura de categoria/produto ou SKU.

Para inspecionar uma referência existente, enquanto disponível:

```powershell
npm run build
npm run geo:inspect -- ID_EXISTENTE_DA_AUDITORIA
```

Oito cenários novos cobrem concorrência, idempotência, vínculo, imutabilidade, resultados parciais, reinício, backoff, leases, prazo, revogação, SSE, tamanho, autorização, quotas e desatualização. A suíte local passou com 48 testes e um PostgreSQL omitido por falta do serviço local. A [CI 34425172882](https://github.com/ThiagoVenturaV/boopay-platform/actions/runs/34425172882), commit `9ab04020954d0fdc6a70967bb29d420e06433149`, passou em Linux, Windows, PostgreSQL, navegador e WooCommerce nativo. Cenários GEO de serviço usam provedor sintético explícito; a inspeção externa valida separadamente o contrato público e parser. O teste PostgreSQL existente valida o armazenamento transacional compartilhado, não uma auditoria real da KeyCore sobre PostgreSQL.

Seis cenários Playwright adicionais verificam o painel em 1440, 1280 e 390 px, correção de domínio inválido, atualização com formulário preenchido, recarga durante a auditoria, uma única criação, retorno parcial, vínculo SKU, checklist e escape de texto recebido. Também cobrem provedor desabilitado e revogação/restauração do domínio, tanto com allowlist vazia quanto contendo outra origem. Os percursos usam API e persistência reais da suíte com provedor `browser-fixture`, instalado somente no servidor efêmero de E2E; não há chamadas à KeyCore. Os cenários desabilitado/revogado substituem apenas `/geo/status`; a recusa autoritativa por domínio tem teste separado no serviço. As capturas e o parecer estão na [revisão da interface](../../README.md).

A interface e as regressões foram publicadas no commit `901d62b0ef501c5573b3f23433255ebfc53eb100`, com os cinco jobs aprovados na [CI 34426741149](https://github.com/ThiagoVenturaV/boopay-platform/actions/runs/34426741149). A suíte de navegador passou com 11 testes, incluindo os seis cenários GEO.

A [trilha de recomendação e compra](DISCOVERY.md) preserva catálogo e auditoria na recomendação, com vínculo explícito à sessão/pedido e conciliação no painel. `npm run discovery:demo` reproduz a jornada integrada local com três páginas e provedores sintéticos.

Pendentes: comprovação externa do funil GEO, políticas verificadas, distribuição/elegibilidade do feed, três páginas reais da loja demonstrativa, resolução manual de criação incerta e contrato persistente/autenticado com metadados completos da KeyCore. A prontidão agora distingue ready/pending/blocked/unknown, conforme [CATALOG-FEED.md](CATALOG-FEED.md). Não há garantia de ranking, citação, recomendação ou receita incremental.
