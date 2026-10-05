# Conversa e provedores de IA

Implementação da IA do simulador Boopay, política `boopay-shopping-v1`. OpenAI e Gemini usam o mesmo contrato, catálogo, regras de recomendação e Checkout Core. O [perfil consentido](PROFILE.md) fornece contexto minimizado e embeddings opcionais. A [interface de Agentes de IA](AI-PROFILE-UI.md) oferece conversa, seleção para revisão e relatório de consumo. Projeções externas do perfil e validação com credenciais reais ainda estão pendentes. Esta camada não representa integração nativa aprovada no ChatGPT ou Gemini.

## Jornada implementada

1. O comprador autenticado abre uma conversa com provedor e filtros explícitos: moeda, teto de preço unitário em centavos e categoria opcional.
2. O modelo consulta `search_catalog` e `get_product`. Pode pesquisar e ordenar opções, mas não confirmar compras, executar código, acessar URLs ou modificar preço/desconto.
3. A ação final `respond` contém uma decisão estruturada, IDs e trechos exatos do catálogo. A aplicação valida os produtos novamente e monta o texto e os cartões com valores autoritativos. Prosa comercial arbitrária do modelo não é apresentada.
4. O comprador escolhe produto e quantidade. A seleção cria uma sessão no Checkout Core, com ID reservado antes da execução e vínculo persistente com a conversa.
5. Frete, cupons, tributos e total seguem o núcleo existente: simulador local ou cotação da loja conectada. Endereços e dados comerciais são enviados por campos próprios, fora do contexto do modelo.
6. A sessão começa sem confirmação e sem pedido. A confirmação explícita da cotação atual e a finalização continuam nas rotas do Checkout Core. Atribuição usa o ID do checkout e não presume receita paga.

Os modos de resposta são recomendação, pergunta de esclarecimento, ausência de opções, orientação de checkout e operação não suportada. As perguntas disponíveis são categoria, orçamento e quantidade. Filtros da conversa são imutáveis nesta versão; a interface desabilita os campos durante a conversa e oferece Nova conversa para alterá-los.

## Adaptadores e contratos oficiais

Contratos consultados em 09/09/2026:

| Provedor | Inferência | Embeddings | Padrões configuráveis |
|---|---|---|---|
| OpenAI | Responses API, ferramentas estritas, `store:false` | `/v1/embeddings`, vetores float | `gpt-4o`, `text-embedding-3-small` |
| Gemini | Interactions API, `store:false`, ferramentas com `tool_choice:any` | `batchEmbedContents`, `EmbedContentConfig.taskType` | `gemini-3.8-flash`, `gemini-embedding-001` |

O GPT-4o solicitado é mantido e aceita ferramentas na Responses API. A continuação transporta os itens nativos de saída e resultados identificados das funções. [GPT-4o](https://developers.openai.com/api/docs/models/gpt-4o), [function calling](https://developers.openai.com/api/docs/guides/function-calling).

Para Gemini, a documentação vigente recomenda Interactions para novos projetos. O adaptador preserva os `steps` nativos, inclusive assinaturas opacas, e devolve `function_result` com o identificador da chamada. Não usa `previous_interaction_id`. [Visão geral](https://ai.google.dev/gemini-api/docs/interactions-overview), [contrato Interactions](https://ai.google.dev/api/interactions-api), [funções](https://ai.google.dev/gemini-api/docs/function-calling).

Embeddings distinguem documento e consulta no Gemini. O consumo informado é preservado; um campo ausente continua `null`. [Embeddings OpenAI](https://developers.openai.com/api/docs/guides/embeddings), [embeddings Gemini](https://ai.google.dev/api/embeddings).

Os endpoints são fixos e redirecionamentos são recusados. O identificador do modelo não pode introduzir outro caminho ou host. Não há troca automática de provedor nem repetição automática de requisições externas. A disponibilidade dos modelos na conta precisa ser verificada pelo operador; os testes de transporte não comprovam acesso real.

## Catálogo e busca

Cada resultado exige produto ativo, preço positivo, moeda/filtros compatíveis e estoque conhecido disponível. Produtos de integração exigem conexão ativa e não expirada. Estoque desconhecido, ruptura e encomenda ficam fora das recomendações desta versão. A fonte deve ter menos de 24 horas, tolerando até cinco minutos de diferença futura. Quando existe watermark de ingestão, ele prevalece sobre o horário do registro local.

O índice liga tenant, produto, revisão, provedor, modelo de embedding e hash do texto minimizado. Uma revisão alterada invalida o vetor anterior; uma atualização durante a indexação não salva o vetor antigo sobre a nova revisão. Cada acionamento administrativo processa até 16 produtos. `remaining` informa o trabalho restante; o operador pode acionar o próximo lote explicitamente.

A busca combina correspondência textual e similaridade de cosseno quando há índice disponível. O limiar inicial de 0,35 é uma heurística de implementação, não uma medida validada de relevância. São devolvidos até oito candidatos; até cinco podem compor uma recomendação. Índice parcial não equivale a catálogo inteiramente indexado. Sem índice, a busca é textual; falha ao gerar o vetor da consulta encerra a tentativa e fica registrada.

A resposta final só aceita produtos consultados naquele turno e ainda na mesma revisão. O trecho de evidência deve existir no campo indicado, após minimização e limite de tamanho. Não há comprovação independente das alegações do lojista; a fonte é identificada como `merchant_catalog`.

## Persistência, consumo e falhas

| Registro | Finalidade |
|---|---|
| `ai_conversation` | Dono, provedor, filtros, validade de 24 horas, sequência de turnos e turno ativo |
| `ai_turn` | Idempotência, status/lease e mensagem/resposta criptografadas |
| `ai_call` | Reserva prévia, solicitação/resposta criptografadas, status, latência, uso e versão do adaptador |
| `ai_quota` | Contador durável por tenant, provedor e dia UTC |
| `ai_embedding` | Vetores vinculados à revisão do catálogo |
| `ai_selection` | Intenção de seleção, ID reservado do checkout e vínculo de atribuição |

Uma conversa aceita até 30 turnos e um turno ativo; um comprador pode manter até 20 conversas não expiradas. Cada turno aceita 2.000 caracteres, até quatro rodadas de inferência e até quatro chamadas de ferramenta por rodada. O limite de saída é 1.200 tokens por inferência. O prazo do turno é 45 segundos, com lease de 50 segundos; cada chamada externa tem até 15 segundos. O corpo enviado é limitado a 256 KiB e a resposta a 2 MiB.

O contador padrão é 100 chamadas por tenant/provedor/dia, incluindo embeddings, erros e respostas incertas. Isso limita chamadas, não garante um teto monetário. Solicitações já reservadas não são reembolsadas na quota por timeout. O relatório separa operação, provedor, modelo e evidência; informa latência, sucesso, falha e uso conhecido. `knownTokens:0` junto de `callsWithoutTokenUsage>0` não significa consumo zero. Custo é `null`, pois tarifas não estão configuradas.

Repetir a chave de idempotência devolve o turno ou seleção persistidos. Mudar o conteúdo com a mesma chave é conflito. Turnos interrompidos não voltam a chamar o modelo automaticamente. Ao recuperar uma seleção, a aplicação consulta o ID reservado; se o checkout já existe, reconstitui o vínculo sem criar outro. Uma nova tentativa voluntária usa outra chave. Nunca contorne uma finalização comercial incerta criando uma compra substituta: siga a conciliação do Checkout Core.

Transações não permanecem abertas durante chamadas aos provedores. O PostgreSQL usa a mesma exclusão transacional por tenant já empregada pelo núcleo; há teste com duas conexões independentes.

## Dados privados e limites operacionais

Mensagens e auditorias são criptografadas com AES-GCM e contexto vinculado ao tenant e registro. Antes do envio, o sistema remove padrões conhecidos de e-mail, URLs, credenciais, identificadores numéricos e campos como CVV/senha. Isso não é um classificador completo de dados pessoais: texto livre ainda pode conter nomes ou endereços. Não inserir informações pessoais em conversas de demonstração.

O histórico enviado contém até três turnos concluídos anteriores, sem detalhes de pagamento ou endereço do checkout. Métricas e eventos não contêm transcrições; o endpoint administrativo não expõe o conteúdo criptografado das chamadas. `store:false` é uma opção do contrato do provedor, não uma promessa de ausência de qualquer retenção externa.

O backend de [perfil e privacidade](PROFILE.md) implementa consentimento, contexto permitido, exportação, exclusão e limpeza automática. Conversas/corpos de IA duram sete dias na base ativa; sua expiração de 24 horas para novos turnos é uma regra distinta. Revogação e exclusão bloqueiam a regravação por respostas tardias. Backups, retenção operacional/comercial e tratamento em provedores externos ainda exigem configuração própria. Banco, backups e chave não devem entrar no Git.

## Configuração

IA fica desabilitada por padrão. Em `.env`, configure `BOOPAY_AI_PROVIDERS=openai,gemini` ou apenas o provedor desejado, suas chaves `BOOPAY_OPENAI_API_KEY`/`BOOPAY_GEMINI_API_KEY` e, opcionalmente, modelos e `BOOPAY_AI_DAILY_CALL_LIMIT`. Reinicie a API após alterar a configuração. Chaves ausentes para um provedor habilitado fazem a inicialização falhar. Não são procuradas chaves de outros projetos ou variáveis globais alternativas.

## API

Rotas de comprador exigem sessão do comprador; rotas administrativas exigem administrador do tenant. Cookies seguem a mesma proteção de origem/CSRF da aplicação. As rotas de turnos e seleções exigem `Idempotency-Key` com 8–160 caracteres seguros.

| Método/rota | Corpo ou resultado |
|---|---|
| `GET /v1/buyer/ai/configuration` | Provedores configurados, versões, limites e evidência |
| `POST /v1/buyer/ai/conversations` | `{ "provider":"openai", "constraints":{"currency":"BRL","maxUnitAmount":15000,"category":null} }` |
| `GET /v1/buyer/ai/conversations/:id` | Conversa e turnos minimizados do próprio comprador |
| `POST /v1/buyer/ai/conversations/:id/turns` | `{ "message":"Procuro uma camiseta de algodão" }` |
| `POST /v1/buyer/ai/conversations/:id/selections` | `{ "turnId":"...", "productId":"...", "quantity":1, "destination":{"country":"BR","postalCode":"50000000"} }`; loja conectada também exige `commerce` do contrato existente |
| `GET /v1/admin/ai/report` | Comparação operacional e até 100 chamadas recentes, sem corpos |
| `POST /v1/admin/ai/index` | `{ "provider":"openai" }`; processa um lote |

Falhas de execução de um turno são um resultado persistido com `status:failed` e `errorCode`; leia o status, mesmo quando o HTTP for 200. Falhas de autorização, validação de entrada e conflitos usam erros HTTP. `pending` não indica conclusão; consulte a mesma conversa e preserve a chave.

## Verificação e demonstração

Evidência de 09/09/2026: commit `d2624585ac743568498978a8adb345c9d48ff52c`, [CI 34428242134](https://github.com/ThiagoVenturaV/boopay-platform/actions/runs/34428242134), cinco jobs aprovados. PostgreSQL executou os 73 testes sem omissões; Linux/Windows passaram nos testes aplicáveis e na demo simulada; navegador passou nos 11 percursos existentes; WooCommerce nativo passou na jornada comercial. São verificações do código e fixtures, sem conexão real aos modelos. Plataforma, plugin e landing foram novamente confirmados privados.

`npm run check` valida contratos de transporte, continuidade opaca, embeddings, limites, grounding, isolamento, mudanças de catálogo, criptografia, quota, reinício, seleção e confirmação. Fixtures dos provedores são explicitamente simuladas. O teste PostgreSQL adicional roda quando `TEST_DATABASE_URL` está configurado. Os percursos comerciais e do navegador existentes continuam na CI.

Depois do build, `npm run ai:demo` usa somente uma fixture determinística, catálogo/perfil fictícios e SQLite em memória. Demonstra consentimento e interesses → índice → recomendação → seleção idempotente → confirmação simulada → pedido → exportação e exclusão do perfil. Não acessa OpenAI/Gemini nem gera cobrança.

Para uma verificação voluntária com conta real, `npm run ai:demo -- --live openai` ou `--live gemini` usa a credencial específica do projeto, envia exclusivamente o catálogo fictício/mensagem de demonstração e pode consumir crédito do provedor. O probe real termina em cotação não confirmada, sem pedido. Não foi executado nesta entrega. A base é efêmera; guarde apenas o relatório sanitizado da execução, nunca credenciais.

A interface conversacional, consumo, indexação e privacidade está descrita em [AI-PROFILE-UI.md](AI-PROFILE-UI.md), com fixture de IA exclusivamente no servidor efêmero de teste. Próximos itens do escopo: avaliações com modelos reais, relevância/personalização mensuradas, projeções externas e governança operacional completa. Pagamentos de PSP, ACP/UCP, Shopify/VTEX e demais dados continuam nos marcos próprios de [DELIVERY.md](CRITERIOS-DE-ACEITE.md).
