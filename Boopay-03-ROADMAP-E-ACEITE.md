# Boopay — Roadmap e critérios de aceite

Versão: 1.0  
Período: agosto a dezembro de 2026

## 1. Estratégia de execução

As frentes devem avançar em paralelo, mas compartilhar contratos estáveis:

- plataforma e segurança;
- SDK e integrações;
- dados e perfil 360°;
- IA e protocolos;
- pagamentos e WhatsApp;
- dashboard e experiência de demonstração;
- qualidade e documentação.

O fluxo ponta a ponta deve ser testado desde cedo. Não se deve esperar dezembro para integrar os componentes.

## 2. Agosto — contratos e fundação

Entregas:

- escopo aprovado;
- critérios de aceite aprovados;
- modelo canônico de eventos;
- modelo canônico de catálogo, cliente, carrinho e pedido;
- responsabilidades de PostgreSQL, Firestore e BigQuery;
- arquitetura dos adaptadores;
- ambientes definidos;
- repositório e estratégia de branches;
- gestão inicial de segredos;
- esqueleto da API;
- definição do tenant_id;
- loja demonstrativa escolhida.

Marco:

Um evento de teste percorre a API e chega aos destinos de dados definidos.

## 3. Setembro — coleta, dados e WooCommerce

Entregas:

- SDK JavaScript;
- eventos view, add_to_cart e exit_intent;
- validação e deduplicação;
- integração funcional com WooCommerce;
- PostgreSQL operacional;
- Firestore operacional;
- ingestão no BigQuery;
- primeira versão do perfil 360°;
- primeira tela do dashboard;
- logs e correlação básica.

Marco:

Uma navegação real no WooCommerce atualiza o perfil e aparece no dashboard.

## 4. Outubro — Shopify, VTEX, IA e protocolos

Entregas:

- integração funcional com Shopify;
- integração funcional com VTEX;
- normalização das três plataformas;
- GPT-4o;
- Gemini;
- camada comum de provedores;
- recomendações baseadas no catálogo;
- embeddings;
- regras comerciais;
- primeira implementação de ACP;
- primeira implementação de UCP;
- comparação básica dos modelos.

Marco:

O mesmo caso de uso funciona nas três plataformas e pode usar GPT-4o ou Gemini sem alterar o núcleo.

## 5. Novembro — pagamentos, recuperação e visão completa

Entregas:

- Stripe Connect em sandbox;
- Google Pay em teste;
- webhooks e idempotência;
- fluxo de pedido;
- WhatsApp para carrinho abandonado;
- consentimento e limite de frequência;
- perfil 360° completo para o escopo;
- dashboard completo;
- filtros e exportações;
- métricas de recuperação e receita influenciada;
- testes de falhas externas.

Marco:

Uma compra e uma recuperação de carrinho são demonstradas de ponta a ponta e refletidas corretamente no dashboard.

## 6. Dezembro — estabilização e entrega

Entregas:

- testes ponta a ponta;
- testes de regressão;
- correções;
- revisão de segurança;
- validação de LGPD;
- revisão de custos e limites;
- documentação técnica;
- roteiro da demonstração;
- dados de demonstração controlados;
- plano de contingência;
- proposta de evolução;
- decisão sobre pagamentos em produção.

Marco final:

A demonstração completa é repetível, auditável e não depende de alterações manuais durante o fluxo.

## 7. Critérios de aceite

### 7.1 SDK e coleta

- view, add_to_cart e exit_intent são emitidos corretamente.
- Todo evento possui event_id, tenant_id, session_id e occurred_at.
- Payloads inválidos são rejeitados com erro compreensível.
- Reenvio do mesmo event_id não duplica a métrica.
- Falhas temporárias possuem tentativa de reenvio controlada.

### 7.2 WooCommerce, Shopify e VTEX

Para cada plataforma:

- catálogo pode ser sincronizado;
- produto, preço e estoque são normalizados;
- pedido pode ser relacionado ao cliente e ao carrinho;
- eventos chegam pelo contrato comum;
- credenciais inválidas geram falha segura;
- a saúde da integração é visível;
- nenhuma publicação em marketplace é necessária para a demonstração.

### 7.3 Dados

- PostgreSQL é a fonte transacional definida.
- Firestore apresenta o estado recente sem divergência crítica.
- BigQuery recebe os eventos históricos.
- Cada registro relevante possui tenant_id.
- Existe uma estratégia de deduplicação.
- Métricas do dashboard podem ser reconciliadas com os eventos.
- Exclusão de um perfil é demonstrável.

### 7.4 GPT-4o e Gemini

- ambos consultam o catálogo real da demonstração;
- ambos respeitam preço e estoque fornecidos;
- ambos conseguem gerar recomendações;
- descontos fora das regras são recusados;
- a resposta identifica o provedor utilizado;
- latência, erro e consumo são registrados;
- falha de um provedor não corrompe o pedido;
- dados pessoais desnecessários não são enviados.

### 7.5 ACP e UCP

- contratos estão documentados;
- endpoints respondem aos casos previstos;
- exemplos de requisição e resposta existem;
- testes automatizados cobrem os fluxos principais;
- indisponibilidade de publicação externa não impede a demonstração;
- a documentação diferencia implementação de protocolo e acesso à superfície oficial.

### 7.6 Stripe Connect e Google Pay

- o ambiente de teste é claramente identificado;
- pagamentos de sucesso e falha são demonstráveis;
- repetição de webhook não duplica a compra;
- pedido e pagamento permanecem associados;
- cancelamento ou estorno é testado quando suportado;
- o cliente confirma antes da etapa de pagamento;
- o Boopay não armazena dados brutos de cartão.

### 7.7 WhatsApp

- somente clientes com consentimento entram no fluxo;
- o abandono inicia a regra correta;
- o limite de frequência é respeitado;
- o link permite atribuir retorno e conversão;
- falha de envio é registrada;
- o cliente pode bloquear novos contatos.

### 7.8 Dashboard

- apresenta visão executiva e funil;
- apresenta produtos, carrinhos, conversões e receita;
- separa carrinhos abandonados e recuperados;
- compara GPT-4o e Gemini;
- permite filtros por período e canal;
- mostra saúde das integrações e falhas;
- exporta os dados principais;
- seus totais reconciliam com a base analítica.

### 7.9 Perfil 360°

- identidade, sessões e consentimentos estão visíveis;
- existe linha do tempo de eventos;
- carrinhos e compras aparecem corretamente;
- recência, frequência e valor são calculados;
- interesses e preferências são apresentados;
- embeddings e recomendações estão associados ao perfil;
- contatos pelo WhatsApp são registrados;
- origem dos dados é identificável;
- exclusão do perfil é executável.

### 7.10 SaaS e isolamento

- a loja demonstrativa opera com tenant_id;
- consultas rejeitam ou isolam tenant incorreto;
- segredos não aparecem no código ou no dashboard;
- a estrutura permite adicionar um segundo tenant posteriormente;
- multilojas e planos não são exigidos no MVP.

## 8. Definition of Done geral

Uma entrega só está concluída quando:

1. o código foi revisado;
2. os testes relevantes passaram;
3. erros e estados vazios foram tratados;
4. logs não expõem segredos ou dados pessoais desnecessários;
5. a documentação foi atualizada;
6. o fluxo funciona no ambiente de demonstração;
7. existe evidência do critério de aceite;
8. o produto não apresenta sandbox como produção.

## 9. Principais riscos

| Risco | Mitigação |
|---|---|
| Três integrações consumirem todo o prazo | Usar contratos canônicos e adaptadores finos |
| Dados duplicados ou divergentes | Definir fonte de verdade e idempotência |
| GPT-4o e Gemini produzirem resultados diferentes | Resposta estruturada, guardrails e conjunto comum de testes |
| ACP/UCP dependerem de aprovação externa | Separar protocolo interno de publicação oficial |
| Pagamentos atrasarem por homologação | Garantir fluxo completo em sandbox primeiro |
| Dashboard e perfil 360° crescerem sem limite | Fixar os módulos e campos descritos no escopo |
| WhatsApp depender de template ou aprovação | Preparar fluxo controlado e alternativa demonstrável |
| Integração apenas no final | Executar testes ponta a ponta em todos os meses |
