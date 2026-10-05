# Boopay — Roadmap e critérios de aceite

Versão: 1.3
Período: agosto a dezembro de 2026

## 1. Estratégia de execução

As frentes devem avançar em paralelo, mas compartilhar contratos estáveis:

- plataforma e segurança;
- SDK e integrações;
- dados e perfil 360°;
- IA e protocolos;
- GEO Readiness e catálogo agêntico;
- Checkout Core, pagamentos e fluxo de pedidos;
- dashboard e experiência de demonstração;
- qualidade e documentação.

O fluxo ponta a ponta deve ser testado desde cedo. Não se deve esperar dezembro para integrar os componentes.

## Horizonte atual

O horizonte planejado é dezembro de 2026. O fechamento depende dos critérios abaixo e da validação nos ambientes autorizados. O [estado atual](../boopay-platform/docs/ESTADO-ATUAL.md) distingue implementação e pendências, sem tratar o calendário como prova de conclusão.

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
- o adaptador fornece cotação autoritativa e cria o pedido sem depender da interface visual da loja;
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

### 7.4 GEO Readiness e catálogo agêntico

- a auditoria cobre página inicial, categoria e ao menos uma página de produto;
- todo resultado possui `geo_audit_id`, `tenant_id`, data, versão, score, categorias, evidências e achados;
- a página de produto auditada está relacionada a um `product_id` e SKU válidos;
- o estado de prontidão distingue `ready`, `pending`, `blocked` e `unknown`;
- preço e estoque desatualizados impedem o produto de ser considerado pronto;
- publicação, rejeição e elegibilidade de feed ficam registradas quando a plataforma fornece esses estados;
- falha parcial ou conclusão inconsistente da ferramenta não é apresentada como auditoria válida;
- score GEO não é apresentado como garantia de citação, recomendação ou venda;
- recomendação simulada e observada em superfície oficial possuem origens distintas;
- nenhuma alteração automática é aplicada ao site no MVP.

### 7.5 GPT-4o e Gemini

- ambos consultam o catálogo real da demonstração;
- ambos respeitam preço e estoque fornecidos;
- ambos conseguem gerar recomendações;
- descontos fora das regras são recusados;
- a resposta identifica o provedor utilizado;
- latência, erro e consumo são registrados;
- falha de um provedor não corrompe o pedido;
- dados pessoais desnecessários não são enviados.

### 7.6 ACP e UCP

- contratos estão documentados;
- endpoints respondem aos casos previstos;
- exemplos de requisição e resposta existem;
- testes automatizados cobrem os fluxos principais;
- indisponibilidade de publicação externa não impede a demonstração;
- a documentação diferencia implementação de protocolo e acesso à superfície oficial.
- ACP e UCP convergem para a mesma sessão canônica.
- criação, atualização, conclusão, cancelamento e expiração são cobertos.
- versão e capacidades negociadas são registradas.
- assinatura, repetição e idempotência possuem casos de teste.
- erros recuperáveis podem ser explicados e corrigidos dentro da conversa.

### 7.7 Checkout conversacional invisível

- o produto pode ser descoberto e selecionado na conversa;
- iniciar a compra não abre o site nem o checkout visual da loja;
- preço, estoque, frete, impostos, descontos e total vêm da fonte autoritativa;
- toda mudança relevante atualiza o resumo;
- produto, quantidade, total, entrega e pagamento são exibidos antes da confirmação;
- a confirmação explícita fica auditável;
- repetir a conclusão não cria cobrança ou pedido duplicado;
- o pedido aparece no e-commerce com atribuição de superfície e protocolo;
- estados de sucesso, falha, cancelamento e expiração aparecem no dashboard;
- o sandbox é visualmente identificado e não é apresentado como produção.

### 7.8 Stripe Connect e Google Pay

- o ambiente de teste é claramente identificado;
- pagamentos de sucesso e falha são demonstráveis;
- repetição de webhook não duplica a compra;
- pedido e pagamento permanecem associados;
- cancelamento ou estorno é testado quando suportado;
- o cliente confirma antes da etapa de pagamento;
- o Boopay não armazena dados brutos de cartão.
- a credencial recebida é compatível com lojista, valor, moeda e finalidade confirmados;
- credenciais sensíveis não aparecem nos logs.

### 7.9 Abandono de carrinho

- o evento de abandono é identificado e normalizado;
- o estado do carrinho é registrado sem duplicidade;
- o dado chega à base analítica;
- volume e taxa de abandono são exibidos corretamente;
- nenhuma mensagem de recuperação é enviada pelo produto.

### 7.10 Dashboard

- apresenta visão executiva e funil;
- apresenta produtos, carrinhos, conversões e receita;
- apresenta carrinhos abandonados e taxa de abandono;
- compara GPT-4o e Gemini;
- permite filtros por período e canal;
- mostra saúde das integrações e falhas;
- mostra o funil de sessões conversacionais por superfície, protocolo e estado;
- mede a taxa de conclusão sem redirecionamento;
- exporta os dados principais;
- seus totais reconciliam com a base analítica.
- apresenta score, achados prioritários e prontidão dos produtos;
- apresenta o funil completo do diagnóstico GEO ao pedido;
- não mistura correlação com causalidade nem recomendação simulada com oficial;
- permite reconciliar o pedido com a URL, o produto, o feed, a superfície e a sessão correspondentes.

### 7.11 Perfil 360°

- identidade, sessões e consentimentos estão visíveis;
- existe linha do tempo de eventos;
- carrinhos e compras aparecem corretamente;
- recência, frequência e valor são calculados;
- interesses e preferências são apresentados;
- embeddings e recomendações estão associados ao perfil;
- origem dos dados é identificável;
- exclusão do perfil é executável.

### 7.12 SaaS e isolamento

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
| ChatGPT não oferecer checkout direto geral | Demonstrar no sandbox e tratar app/parceria aprovada como trilha externa |
| Gemini/UCP depender de região e aprovação | Implementar conformidade, Merchant Center e evidências sem prometer ativação |
| Stripe, PayPal, Shopify, WooCommerce e VTEX já oferecerem soluções agentic | Diferenciar por camada multiprotocolo, multi-commerce, auditável e sem migração obrigatória |
| Pagamentos atrasarem por homologação | Garantir fluxo completo em sandbox primeiro |
| Dashboard e perfil 360° crescerem sem limite | Fixar os módulos e campos descritos no escopo |
| Integração apenas no final | Executar testes ponta a ponta em todos os meses |
| Score GEO ser apresentado como promessa de ranking ou venda | Separar prontidão, elegibilidade, recomendação, checkout e conversão; usar linguagem explícita no dashboard e no pitch |
| Ferramenta GEO atual não possuir contrato de produto persistente | Versionar resultados, persistir jobs e exigir estado final inequívoco antes de integrar ao funil |
| Auditoria ampla consumir o prazo | Limitar o MVP a três páginas representativas de uma loja demonstrativa |
| Plataformas não exporem impressões ou recomendações | Registrar evidência oficial quando existir e identificar o evento do simulador separadamente |
| Produto publicado ficar desatualizado | Bloquear prontidão quando preço, estoque ou feed ultrapassarem o limite de atualização |
