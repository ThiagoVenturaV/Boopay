# Registro de Ensaios da Apresentação Oficial (RB-075)

Este documento registra os ensaios cronometrados de 10 minutos da apresentação oficial do Boopay, com o mapeamento por blocos de tempo, papéis, ajustes observados e validação do Plano B.

## 1. Identificação e Estrutura da Apresentação

- **Tempo Total**: 10 minutos (rigorosamente cronometrado).
- **Apresentador Principal**: Thiago Ventura (@ThiagoVenturaV).
- **Operador Substituto & Apoio Técnico**: Pedro Lucas (@Pedro-Lucas001).
- **Commit Base da Demo**: `feat/mvp-checkout-conversacional` (build Next.js + Fastify Core).
- **Artefatos de Contingência**: `docs/evidencias/e2e-pc-desktop.mp4` e `docs/evidencias/mvp-*.png`.

---

## 2. Roteiro Cronometrado por Blocos (10 Minutos)

| Bloco | Minuto | Conteúdo e Foco | Responsável |
| :--- | :--- | :--- | :--- |
| **1. Abertura & Hook** | 00:00 - 01:00 (1 min) | Contexto de mercado: atrito no e-commerce tradicional e taxa de abandono de carrinho (70%+). Introdução do Boopay como Checkout Conversacional Autoritativo. | Thiago |
| **2. O Problema & Arquitetura** | 01:00 - 03:00 (2 min) | Por que LLMs sozinhas geram alucinação de preço. Como a arquitetura Boopay desacopla intenção conversacional de regras rígidas via `quoteHash` SHA-256 e adaptadores (WooCommerce, VTEX). | Thiago |
| **3. Live Demo E2E** | 03:00 - 06:30 (3.5 min) | Demonstração ponta a ponta na interface Web:<br>1. Descoberta e recomendação natural de kit de corrida.<br>2. Montagem de carrinho inteligente.<br>3. Cálculo autoritativo de frete e cotação assinada.<br>4. Confirmação explícita e checkout invisível com Pix/Wallet e rastreamento. | Thiago (Apresentando) / Pedro (Monitorando) |
| **4. Viabilidade Financeira & Custos IA** | 06:30 - 08:00 (1.5 min) | Modelo econômico: custo por sessão de conversação < R$ 0,02 via prompt caching e tokens otimizados. ROI para o lojista e métricas de conversão. | Thiago |
| **5. Segurança, Multitenancy & Fechamento** | 08:00 - 09:30 (1.5 min) | HMAC assinado, isolamento estrito de tenants (RB-068), adaptabilidade a VTEX (RB-038) e Shopify. | Thiago |
| **6. Buffer & Q&A da Banca** | 09:30 - 10:00 (0.5 min) | Margem de segurança de 30 segundos para conclusão sem estouro de tempo. | Ambos |

---

## 3. Registro dos Ensaios Executados

### Ensaio 1
- **Data e Horário**: 2026-10-28 19:30 BRT
- **Participantes**: Thiago Ventura e Pedro Lucas.
- **Duração Total Registrada**: 11 min e 15 seg (**Estourou o teto em 1m15s**).
- **Duração por Bloco**:
  - Bloco 1 (Abertura): 1m20s (introdução muito detalhada).
  - Bloco 2 (Arquitetura): 2m45s (excesso de detalhes sobre migrations do Prisma).
  - Bloco 3 (Live Demo): 4m10s (demora na digitação e leitura das mensagens).
  - Bloco 4 (Custos): 1m30s.
  - Bloco 5 (Segurança & Fechamento): 1m30s.
- **Falhas Observadas**:
  - Transição lenta entre os slides de arquitetura e o navegador da aplicação web.
  - Digitação manual ao vivo no chat demorou mais que o esperado.
- **Ajustes Definidos**:
  - Condensar o bloco de arquitetura para focar apenas no `quoteHash` e isolamento.
  - Utilizar mensagens preparadas no clipboard ou atalhos de sugestão rápida do chat ("Quero um kit para corrida de rua") para agilizar a demo.

### Ensaio 2 (Validação Final)
- **Data e Horário**: 2026-10-29 20:00 BRT
- **Participantes**: Thiago Ventura e Pedro Lucas.
- **Duração Total Registrada**: **09 min e 42 seg** (**Dentro da meta com 18s de margem**).
- **Duração por Bloco**:
  - Bloco 1 (Abertura): 0m55s (direto ao ponto e objetivo).
  - Bloco 2 (Arquitetura): 1m50s (foco visual no fluxo Core).
  - Bloco 3 (Live Demo): 3m25s (execução fluida com recomendação, kit e checkout instantâneo).
  - Bloco 4 (Custos): 1m20s (slide claro de unit economics).
  - Bloco 5 (Segurança & Fechamento): 1m30s.
  - Bloco 6 (Conclusão): 0m42s.
- **Falhas Observadas**: Nenhuma falha funcional; tempo perfeitamente ajustado e sincronizado.

---

## 4. Teste e Validação do Plano B (Contingência)

- **Cenário de Falha Simulado**: Queda da rede Wi-Fi / latência elevada na API de IA.
- **Procedimento Acionado**:
  1. Thiago comunica imediatamente à banca que alternará para o espelhamento de contingência local.
  2. Pedro projeta o vídeo pré-gravado em alta resolução `docs/evidencias/e2e-pc-desktop.mp4` (duração: 48 segundos cobrindo o fluxo completo de compra).
  3. Thiago narra sobre a gravação com os mesmos pontos-chave da live demo.
- **Tempo de Transição Testado**: 4 segundos para alternar a tela para o player de mídia.
- **Resultado do Teste de Contingência**: Aprovado sem perda de continuidade narrativa.
