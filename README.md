# Boopay

Documentação, decisões e evolução do MVP de *Agentic Commerce* desenvolvido pelo Squad 45.

> **Estado atual:** planejamento, validação do escopo e preparação da Entrega Parcial. Este repositório ainda não contém uma aplicação executável. Quando o código for adicionado, os comandos de instalação e execução serão documentados aqui.

## Recebeu este link agora?

Não é necessário instalar nada para conhecer o projeto.

1. Leia o [índice da documentação](./Boopay-00-INDICE.md).
2. Consulte o [escopo do MVP](./Boopay-01-ESCOPO-MVP.md) para entender o que entra e o que fica para depois.
3. Abra a [arquitetura e os fluxos](./Boopay-02-ARQUITETURA-E-FLUXOS.md) para conhecer o funcionamento proposto.
4. Use o [dicionário técnico](./Boopay-05-DICIONARIO-TECNICO.md) sempre que encontrar um termo desconhecido.
5. Se você faz parte do squad, acompanhe tarefas e prazos no [Notion do Boopay](https://app.notion.com/p/3c56abcea22681a299f3ddb2684ff684).

## O que é o Boopay?

O Boopay é uma proposta de plataforma que conecta lojas virtuais, dados de clientes, agentes de inteligência artificial e meios de pagamento. O objetivo é permitir jornadas de compra conversacionais: a IA consulta catálogo, estoque, regras comerciais e perfil do consumidor, recomenda produtos e conduz o checkout com confirmação do usuário.

O primeiro MVP será demonstrado com uma loja controlada e deve funcionar de ponta a ponta antes da evolução para múltiplas lojas e planos comerciais.

## Escopo atual do MVP

- coleta confiável de eventos da loja;
- integrações planejadas com WooCommerce, Shopify e VTEX;
- perfil 360° e dashboard completos para a loja demonstrativa;
- recomendações e fluxos com IA por uma camada de provedores;
- Qwen na Groq para desenvolvimento e testes, com GPT e Gemini validados em *staging* e previstos para produção;
- ACP e UCP implementados e testados em ambiente controlado;
- Stripe e Google Pay inicialmente em sandbox;
- recuperação controlada de carrinho pelo WhatsApp;
- critérios de aceite, falhas, segurança, custos e evidências documentados.

CDP completo, rastreamento avançado, publicação nas superfícies oficiais, operação multiloja, planos e cobrança SaaS permanecem no backlog futuro.

## Mapa do repositório

| Arquivo | Para que serve |
|---|---|
| [Boopay-00-INDICE.md](./Boopay-00-INDICE.md) | Porta de entrada e decisões centrais |
| [Boopay-01-ESCOPO-MVP.md](./Boopay-01-ESCOPO-MVP.md) | Escopo, limites e trade-offs do MVP |
| [Boopay-02-ARQUITETURA-E-FLUXOS.md](./Boopay-02-ARQUITETURA-E-FLUXOS.md) | Componentes, dados, integrações e fluxos |
| [Boopay-03-ROADMAP-E-ACEITE.md](./Boopay-03-ROADMAP-E-ACEITE.md) | Cronograma e critérios de aceite |
| [Boopay-04-BACKLOG.md](./Boopay-04-BACKLOG.md) | Itens posteriores ao MVP |
| [Boopay-05-DICIONARIO-TECNICO.md](./Boopay-05-DICIONARIO-TECNICO.md) | Explicação dos termos técnicos |
| [Boopay-06-BRIEFING-REUNIAO-ROGERIO-2026-08-24.md](./Boopay-06-BRIEFING-REUNIAO-ROGERIO-2026-08-24.md) | Briefing da primeira reunião com Rogério |
| [Boopay-Apoio-Reuniao-Rogerio-2026-08-24.pdf](./Boopay-Apoio-Reuniao-Rogerio-2026-08-24.pdf) | Apresentação visual de apoio à reunião |
| [Boopay.md](./Boopay.md) | Visão inicial preservada para contexto histórico |

## Onde cada informação deve ficar

- **GitHub:** documentação versionada, arquitetura, código, testes e entregáveis.
- **Notion:** responsáveis, tarefas, prazos, evidências e decisões das mentorias.
- **Briefing:** perguntas e hipóteses que ainda precisam de confirmação externa.
- **Backlog:** itens reconhecidos, mas fora do escopo atual.

O [painel do Notion](https://app.notion.com/p/3c56abcea22681a299f3ddb2684ff684) exige permissão do responsável pelo workspace. O [quadro de tarefas](https://app.notion.com/p/0b878d9b606f424a9ea58de321420391) é a referência operacional do squad.

## Como colaborar

1. Escolha uma tarefa no Notion e confirme o responsável.
2. Atualize sua cópia antes de começar.
3. Crie uma branch curta, como `docs/ajustar-arquitetura` ou `feat/coleta-eventos`.
4. Faça alterações pequenas e relacionadas a uma única tarefa.
5. Registre testes ou evidências antes de concluir.
6. Abra um pull request explicando o que mudou, por que mudou e como foi validado.
7. Atualize a tarefa e vincule o pull request ou arquivo produzido.

Para baixar o repositório:

```bash
git clone https://github.com/ThiagoVenturaV/Boopay.git
cd Boopay
```

## Regras importantes

- Não publique senhas, tokens, chaves de API, dados de clientes ou credenciais de sandbox.
- Não apresente integrações em sandbox como se estivessem homologadas para produção.
- Não trate a implementação de ACP ou UCP como garantia de publicação nas superfícies oficiais.
- Mudanças de escopo devem atualizar o escopo, o roadmap e o backlog de forma consistente.
- Novos termos técnicos devem ser incluídos no dicionário.
- Links e entregáveis devem funcionar para alguém fora do computador de quem os criou.

## Marcos atuais

- **24/08/2026:** primeira reunião com Rogério e mentor.
- **18/09/2026:** meta interna de fechamento do conteúdo da Entrega Parcial.
- **21/09/2026:** meta interna de pacote pronto.
- **21 a 25/09/2026:** janela oficial da Entrega Parcial.
- **Dezembro de 2026:** horizonte do MVP final.

A data e o canal exatos da entrega final ainda precisam ser confirmados com o Porto Digital ou com a mentoria.

## Antes de alterar o escopo

Registre:

1. a decisão atual;
2. a mudança proposta;
3. a justificativa;
4. o impacto técnico e no prazo;
5. o item que será simplificado, removido ou movido para o backlog.

Assim o repositório continua compreensível para o squad, mentores e novas pessoas que receberem o link.
