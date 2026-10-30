# Roteiro Completo da Apresentação de 10 Minutos — Boopay

## Visão Geral
- **Objetivo**: Apresentar à banca avaliadora a proposta de valor, a arquitetura autoritativa e a demonstração ao vivo do Checkout Conversacional Boopay.
- **Público**: Banca avaliadora técnica e de negócios.
- **Apresentador**: Thiago Ventura (@ThiagoVenturaV).
- **Operador de Suporte**: Pedro Lucas (@Pedro-Lucas001).

---

## 00:00 - 01:00 | Minuto 1: Abertura e Oportunidade
- **Slide 1 — Boopay**: "O checkout conversacional e invisível que transforma intenção em venda em menos de 60 segundos."
- **Fala de impacto**: "7 a cada 10 carrinhos são abandonados no e-commerce tradicional devido à fricção: formulários longos, redirecionamentos e perda de contexto. O Boopay resolve isso levando o checkout para dentro da conversa, unindo a naturalidade de um agente de IA à precisão determinística de um ERP de pagamentos."

## 01:00 - 03:00 | Minutos 2 e 3: O Desafio dos Agentes e a Solução Boopay
- **Slide 2 — Por que não usar apenas LLM?**: Alucinação de preços, falta de garantias de estoque e vulnerabilidades de injeção.
- **Slide 3 — Arquitetura de Cotação Autoritativa**:
  - LLM lida apenas com **intenção** e linguagem natural.
  - Backend Boopay é o único responsável pelo cálculo de valores, regras fiscais e frete.
  - Toda cotação recebe uma assinatura criptográfica imutável: o `quoteHash` SHA-256.
  - Confirmação humana explícita obrigatória antes do fechamento do pedido.

## 03:00 - 06:30 | Minutos 4 a 6: Live Demo Ponta a Ponta
- **Passo 1 (Descoberta)**: Usuário digita: *"Preciso me preparar para uma meia maratona mês que vem"*.
- **Passo 2 (Recomendação com IA)**: O assistente analisa o objetivo e sugere o Tênis Pulse Carbon Pro + Mochila commuter impermeável com desconto de combo.
- **Passo 3 (Cotação com Frete)**: CEP informado (`01310-100`). O backend invoca o cálculo de frete autoritativo e exibe o resumo com Hash SHA-256.
- **Passo 4 (Confirmação Explícita & Pagamento)**: O cliente clica em "Confirmar e Pagar". O pedido é gerado via Pix/Carteiras Digitais com código de rastreamento imediato.

## 06:30 - 08:00 | Minutos 7 e 8: Viabilidade Econômica & IA Unit Economics
- **Slide 4 — Unit Economics**: Custo médio de tokens por sessão de checkout: < R$ 0,02.
- Estratégias: System prompts compactados, cache de contexto e roteamento para modelos rápidos.
- ROI: Aumento estimado de conversão em 25% compensa o custo de inferência por mais de 50x.

## 08:00 - 09:30 | Minuto 9: Segurança, Conectores e Escalabilidade
- Conectores nativos: WooCommerce e VTEX Cloud (RB-038).
- Auditoria de segurança aprovada: HMAC SHA-256, isolamento multitenant estrito e anti-replay (RB-068).
- LGPD compliance: Zero dados de cartão armazenados e logs sanitizados.

## 09:30 - 10:00 | Minuto 10: Conclusão & Abertura para Perguntas
- Recapitulação dos diferenciais e encerramento no tempo exato.
- "Boopay: O futuro do comércio é conversacional, seguro e invisível. Obrigado!"
