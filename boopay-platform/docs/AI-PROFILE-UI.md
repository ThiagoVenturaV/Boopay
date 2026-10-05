# IA, Audiência e privacidade no painel

Extensão funcional das entradas já previstas na composição B aprovada. Preserva receita como página inicial, identidade Boopay e checkout existente. Os dados vêm das APIs autenticadas; o frontend não contém uma lista de respostas ou métricas simuladas.

## Percurso do comprador de teste

Em **Agentes de IA → Conversa de teste**, o comprador escolhe um provedor configurado e limita moeda, preço unitário e categoria. Filtros ficam fixos durante a conversa; uma nova conversa permite alterá-los. Cada mensagem usa uma chave de idempotência. Atualizar ou recuperar uma mensagem pendente consulta o histórico; não chama o modelo novamente.

Boo mostra decisões finais e produtos fundamentados no catálogo. Nome, descrição, preço, disponibilidade, variante, origem e trecho usado como evidência permanecem próximos da seleção. Sem resposta válida, o painel não inventa produtos. Provedor desabilitado impede envio e explica a configuração necessária.

O botão Atualizar recarrega a configuração preservando rascunho, filtros e conversa. Falhas movem o foco ao aviso; opções retidas de um turno anterior ficam identificadas como sugestões anteriores. Resposta válida leva às sugestões ou à mensagem de esclarecimento.

**Revisar compra** cria um checkout não confirmado e transfere sua referência para a tela Checkout. O comprador informa entrega, confere o total autoritativo, aceita o resumo e executa a ação comercial existente. Seleções repetidas da mesma sugestão/quantidade reutilizam a chave durante a sessão do navegador. A conversa nunca confirma ou paga. Histórico e chaves do servidor aplicam os mesmos controles às lojas conectadas.

Somente identificadores de conversa/checkout/seleção ficam no `sessionStorage`; mensagens, identidade e credenciais não são copiadas para esse armazenamento. A sessão do comprador é estabelecida pelo servidor e compartilhada entre telas. Recarregar recupera a conversa; expiração/exclusão remove a referência indisponível.

## Privacidade

Em **Agentes de IA → Privacidade**, as duas finalidades começam desligadas. O formulário separa coleta do perfil e uso dos interesses pela IA, explica os destinatários e avisa o que uma revogação apaga. O contexto de IA exige autorização do perfil. Versões concorrentes provocam atualização das escolhas visíveis, sem sobrescrever o aceite mais recente.

Nome/e-mail são opcionais e declarados, com orientação para usar dados fictícios no ambiente. Abrir detalhes de um produto na conversa registra uma visualização apenas quando a API confirma coleta autorizada. Ver o produto não depende do sucesso desse registro.

Exportar baixa o snapshot JSON autenticado. Excluir exige aceite inline separado e mostra o recibo com quantidades de checkouts/pedidos preservados, além dos limites de backups e provedores. A tela sempre separa o prazo de mensagens na base ativa Boopay das condições próprias do provedor. Reativação não restaura dados apagados. A geração opcional de afinidade informa o envio e o uso de quota e exige interesses existentes.

Abrir Privacidade leva o foco ao seu título depois do carregamento. Entrar no checkout ainda sem cotação leva ao título da compra; cotação disponível segue o foco existente no resumo. A transição não deixa o foco no botão desmontado.

## Operação da loja

**Audiência** lista somente perfis autorizados do tenant, com busca, filtro de segmento e detalhe inline. Abertura move foco/rolagem ao detalhe; fechar devolve à lista. Mostra janela de coleta, identidade declarada, frequência/recência, totais por moeda, pedidos, interesses e atividade. Não junta pessoas por e-mail nem apresenta a janela como histórico vitalício.

**Consumo e catálogo** mostra provedores/modelos, origem observada ou simulada, quota e timeout. A indexação é explícita e informa o lote concluído, revisões pendentes e alterações concorrentes. A tabela compara chamadas, conclusões, falhas/interrupções, tokens conhecidos e latência. Ausência de custos ou tokens não é convertida em zero financeiro. O período é todo o histórico de metadados retido.

## Evidências e limites

Os testes de navegador usam API, autenticação, SQLite, perfil, catálogo e Checkout Core reais do projeto. `scripts/ai-e2e-fixture.ts` fornece respostas/embeddings sintéticos somente ao servidor efêmero de testes; não é importado pelo servidor normal. Lojas próprias por cenário isolam estoque e perfis. A indisponibilidade visual é também exercitada com resposta de configuração vazia interceptada no navegador.

`npm run test:e2e` executa os projetos `operations` e `ai-profile` separadamente, cada um com servidor e base efêmeros. Essa separação evita que cenários independentes consumam a mesma quota de 600 requisições/minuto por IP. O limite da aplicação não foi aumentado ou desativado. Para executar apenas os novos cenários: `npx playwright test --project=ai-profile`.

A [CI 34432249085](https://github.com/ThiagoVenturaV/boopay-platform/actions/runs/34432249085), do commit `36fdd875f9f4864b5d4efe30d819c7f33d6b0aa4`, confirmou os cinco jobs: Linux, Windows, PostgreSQL, navegador e WooCommerce nativo. O job PostgreSQL aprovou 91 testes, sem falhas ou omissões; o de navegador aprovou as 11 operações e os quatro cenários de IA/perfil em servidores separados.

Interfaces não comprovam qualidade dos modelos, homologação em ChatGPT/Gemini, identidade verificada, pagamentos PSP nem projeções Firestore/BigQuery. Os limites de [AI.md](AI.md), [PROFILE.md](PROFILE.md) e [DELIVERY.md](CRITERIOS-DE-ACEITE.md) continuam válidos.
