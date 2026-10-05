# Boopay — checkout conversacional invisível

Versão: 1.1\
Data-base: 26 de agosto de 2026\
Status: decisão de produto e referência arquitetural vigente

## 1. Decisão de produto

O principal diferencial do Boopay será transformar lojas existentes em operações encontráveis, compráveis e mensuráveis por agentes de IA. A tese atual combina o GEO Readiness Audit da KeyCore, catálogo agêntico, checkout invisível e atribuição de receita; sua análise detalhada está em [GEO + checkout invisível](Boopay-08-GEO-E-CHECKOUT-INVISIVEL.md).

Depois que ChatGPT, Gemini ou outra superfície compatível recomendar um produto, o comprador poderá iniciar, revisar e concluir a compra dentro do próprio contexto conversacional. O Boopay conecta catálogo, preço, estoque, regras comerciais, entrega, pagamento, pedido e pós-compra sem exigir que o cliente abra o storefront.

Nome de produto adotado: **checkout conversacional invisível**.

Definição precisa:

- invisível para a navegação: sem redirecionamento e sem troca de contexto;
- visível para o consentimento: produto, quantidade, preço final, entrega e pagamento aparecem antes da confirmação;
- seguro para o pagamento: o Boopay não recebe nem armazena dados brutos de cartão;
- integrado à operação: o pedido nasce e continua sendo administrado no e-commerce do lojista;
- auditável: cada cotação, alteração, confirmação, tentativa, pedido e atualização fica correlacionado.

O checkout invisível não é compra escondida, compra com um clique sem resumo ou autorização irrestrita para um agente gastar em nome do cliente.

O GEO também não é uma promessa de que ChatGPT, Gemini ou outra IA recomendará a loja. Ele mede prontidão e gera evidências para correção. Distribuição do catálogo, elegibilidade, recomendação e conversão são etapas próprias do funil.

## 2. Quem faz o quê

É incorreto dizer que “ACP ou UCP recomenda um produto”. A divisão correta é:

| Participante | Responsabilidade |
|---|---|
| ChatGPT, Gemini ou agente | Entender a intenção, descobrir opções, recomendar e conduzir a conversa |
| ACP ou UCP | Padronizar a comunicação de catálogo, capacidades, checkout, pagamento e pedido |
| Boopay | Traduzir protocolos, orquestrar a sessão, aplicar segurança e conectar a operação existente |
| WooCommerce, Shopify ou VTEX | Fornecer preço, estoque, promoções, entrega e pedido autoritativos |
| Stripe, Google Pay ou outro PSP compatível | Tokenizar, autorizar e processar o pagamento |
| Lojista | Permanecer como Merchant of Record e responsável pela relação comercial |

## 4. Tese de diferenciação do Boopay

Hipótese de posicionamento:

> O Boopay prepara a loja para ser entendida por agentes, distribui um catálogo comprável, conclui a venda sem redirecionamento e prova a receita gerada — preservando o e-commerce, o PSP e o lojista como fontes de verdade.

O conjunto que pode diferenciar o produto é:

1. **GEO Readiness da KeyCore**, transformando evidências técnicas e editoriais em um plano de prontidão;
2. **catálogo agêntico**, relacionando página, produto, feed, atualização e elegibilidade;
3. **tradução bidirecional entre ACP e UCP**, sem duplicar regras de negócio;
4. **modelo canônico multi-commerce**, começando em WooCommerce e evoluindo para Shopify e VTEX;
5. **integração sem migração de plataforma**, respeitando catálogo, impostos, frete, promoções, pagamento e OMS existentes;
6. **PSP desacoplado no núcleo**, ainda que o MVP use Stripe e Google Pay;
7. **auditoria ponta a ponta**, ligando prontidão, recomendação, sessão, confirmação, credencial, pagamento, pedido e pós-compra;
8. **dashboard de receita agêntica**, com atribuição por produto, superfície e protocolo;
9. **sandbox de conformidade**, capaz de provar a jornada mesmo antes da aprovação de uma superfície oficial;
10. **foco inicial em implantação prática para operações WooCommerce**, sem exigir que a loja reconstrua seu checkout.

Essa é uma hipótese de vantagem competitiva, não um moat comprovado. Ela precisa ser validada com lojistas e comparada continuamente com Stripe, PayPal, Shopify, WooCommerce e VTEX.

## 6. Arquitetura-alvo

    ChatGPT / app aprovado ── ACP ──┐
                                    ├── Agentic Commerce Gateway
    Gemini / Modo IA ─────── UCP ──┘             │
                                                  v
                                        Checkout Core canônico
                                        ├── sessão e estado
                                        ├── cotação autoritativa
                                        ├── fulfillment
                                        ├── consentimento
                                        ├── pagamento delegado
                                        ├── pedido
                                        └── pós-compra
                                             │           │
                                    Commerce adapters   Payment adapters
                                    ├── WooCommerce     ├── Stripe
                                    ├── Shopify         └── Google Pay
                                    └── VTEX
                                             │
                                    Dados, auditoria e dashboard

O gateway traduz o protocolo. O Checkout Core aplica a lógica canônica. O adaptador de commerce consulta a verdade operacional. O adaptador de pagamento processa a credencial. Nenhum adaptador deve reimplementar regras de preço, estoque, desconto, frete ou imposto.

## 7. Ciclo de vida da compra

1. A superfície descobre catálogo e capacidades do lojista.
2. O agente recomenda um produto a partir de dados atualizados.
3. A escolha do comprador cria uma `CheckoutSession`.
4. O Boopay pede ao e-commerce uma cotação autoritativa.
5. A superfície coleta endereço, entrega ou informação ausente.
6. Cada mudança recalcula o total e a disponibilidade.
7. A superfície exibe produto, quantidade, descontos, frete, impostos, total e meio de pagamento.
8. O cliente confirma explicitamente.
9. A superfície ou carteira entrega uma credencial tokenizada e limitada à compra.
10. O Boopay conclui a sessão com chave de idempotência.
11. O adaptador cria o pedido no e-commerce e relaciona o pagamento.
12. Webhooks atualizam pagamento, fulfillment, cancelamento e estorno.
13. O dashboard recebe atribuição, latência, erro e conversão.

Estados principais:

    draft -> requires_information -> ready_for_confirmation -> confirmed
          -> payment_authorized -> completed

    estados não finais -> failed | canceled | expired

Se preço, estoque, entrega ou total mudar depois da confirmação, a sessão não pode concluir silenciosamente; deve voltar à revisão do comprador.

## 8. Contrato canônico mínimo

| Campo | Finalidade |
|---|---|
| `checkout_session_id` | Identificador interno |
| `tenant_id` | Isolamento da loja |
| `surface` e `protocol` | Origem e atribuição |
| `external_session_id` | Correlação com o agente |
| `state` | Estado da máquina de checkout |
| `items` | SKUs, quantidades e valores atuais |
| `buyer` | Dados mínimos e consentidos |
| `fulfillment` | Endereço, opção, custo e prazo |
| `totals` | Subtotal, descontos, frete, impostos e total |
| `payment_handler` | Provedor e tipo de credencial |
| `idempotency_key` | Proteção contra duplicidade |
| `consent_at` | Evidência da confirmação |
| `expires_at` | Validade da sessão e cotação |
| `order_id` | Pedido autoritativo criado |

## 9. Implementação WooCommerce esperada

WooCommerce será a primeira fatia vertical por estar no PRD inicial.

### 9.1 Plugin e APIs

- usar `wc/v3` para conexão, sincronização inicial de catálogo e consulta administrativa de pedidos;
- usar webhooks nativos do WooCommerce para mudanças incrementais de produto, estoque e pedido;
- usar o plugin Boopay como fronteira segura para instalação, saúde, tracking e operações de checkout que dependem da lógica da loja;
- calcular carrinho, cupom, imposto, frete e total dentro do contexto WooCommerce, sem copiar as regras para o Boopay;
- criar o pedido por API ou pelo plugin, nunca escrevendo diretamente no banco do WordPress;
- registrar metadados de atribuição: sessão Boopay, superfície, protocolo e `correlation_id`;
- sincronizar `order.created`, `order.updated`, `order.refunded` e alterações de fulfillment quando disponíveis.

### 9.2 Consistência

- revalidar estoque e total imediatamente antes da conclusão;
- usar idempotência no Boopay e um identificador externo único no pedido WooCommerce;
- tratar webhook repetido como atualização, não como novo pedido;
- nunca confiar em preço enviado pelo agente ou pelo navegador;
- expirar sessões e cotações antigas;
- definir claramente quando o estoque é apenas verificado e quando é reservado.

### 9.3 Pagamento

O plugin oficial Stripe para WooCommerce e a Agentic Commerce Suite são tanto uma possível integração quanto um concorrente. Antes de escolher a rota final, o time deve provar no sandbox se a credencial delegada da superfície pode ser processada pelo PSP configurado no lojista e refletida corretamente no pedido WooCommerce.

O Boopay não deve coletar PAN, CVV ou dados brutos de cartão. O fluxo deve usar token ou credencial delegada do payment handler, validar lojista, valor, moeda, finalidade e validade e manter o comerciante como Merchant of Record.

## 10. Estratégia de demonstração

| Nível | Compromisso | Como apresentar |
|---|---|---|
| 1 — Sandbox Boopay | Obrigatório | Jornada completa, sem storefront, usando os mesmos contratos e adaptadores do produto |
| 2 — Conformidade ACP/UCP | Obrigatório | Requisições, estados, assinaturas, idempotência, erros e evidências automatizadas |
| 3 — Gemini/Google oficial | Condicional | Somente com Merchant Center, região e aprovação confirmados |
| 4 — ChatGPT oficial | Condicional | Somente por capacidade vigente, aplicativo ou parceria aprovada |

O pitch deve dizer “compatível e demonstrado em sandbox” nos níveis 1 e 2. “Funcionando no Gemini” ou “funcionando no ChatGPT” só pode ser usado com uma transação repetível naquela superfície oficial.

## 11. Critério de sucesso do diferencial

O diferencial está demonstrado quando:

- o comprador pede e recebe uma recomendação;
- escolhe comprar sem abrir a loja;
- altera dados ou entrega dentro da conversa e recebe um total atualizado;
- vê e confirma o resumo final;
- conclui um pagamento sandbox sem expor cartão ao Boopay;
- gera exatamente um pedido no WooCommerce;
- recebe o status do pedido na experiência conversacional;
- o dashboard mostra origem, protocolo, sessão, confirmação, pagamento e pedido;
- repetir mensagens ou webhooks não duplica cobrança nem pedido;
- uma mudança de preço ou estoque força nova revisão;
- o ambiente demonstrado é identificado honestamente como sandbox ou oficial.

## 12. Decisões ainda necessárias

- escolher a loja e o catálogo da demonstração;
- confirmar país, moeda, impostos e regras de frete do caso de uso;
- definir o PSP real da loja WooCommerce demonstrativa;
- validar a compatibilidade técnica entre credencial delegada e plugin de pagamento;
- decidir se o pedido nasce antes ou depois da autorização no cenário de sandbox;
- definir a política de reserva de estoque;
- iniciar o quanto antes os processos de waitlist, Merchant Center, app e homologação;
- validar com lojistas se a proposta multiprotocolo e sem migração resolve uma dor melhor que Stripe, PayPal ou a solução nativa da plataforma.

## 13. Regra de atualização

Como protocolos e superfícies mudam rapidamente, qualquer afirmação sobre disponibilidade oficial deve registrar fonte, data, região, elegibilidade e evidência de acesso. O núcleo do produto deve permanecer independente dessas mudanças.
