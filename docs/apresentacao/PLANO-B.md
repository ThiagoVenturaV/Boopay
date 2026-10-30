# Protocolo de Contingência e Plano B da Apresentação — Boopay

Este documento detalha o protocolo operacional de contingência para a apresentação oficial do Boopay, definindo gatilhos, responsabilidades e procedimentos de fallback.

---

## 1. Matriz de Contingência e Gatilhos de Acionamento

| Cenário de Risco | Probabilidade / Impacto | Gatilho de Falha | Procedimento de Fallback (Plano B) |
| :--- | :--- | :--- | :--- |
| **Queda de Conexão com a Internet** | Média / Alto | Falha na resposta da API (> 5s de timeout) ou navegador desconectado. | **Fallback Offline Local**: O operador substituto abre o vídeo gravado em alta definição `docs/evidencias/e2e-pc-desktop.mp4`. Thiago conduz a narração fluida sobre o vídeo. |
| **Latência ou Indisponibilidade de LLM Externa** | Baixa / Alto | API Gemini/OpenAI indisponível ou rate limit excedido. | **Modo Determinístico Local**: O backend do Boopay já possui modo de fallback estruturado que responde à intenção usando o motor de regras local e templates do catálogo. |
| **Falha no Notebook do Apresentador Principal** | Baixa / Crítico | Travamento de hardware, bateria ou tela preta. | **Transição para Operador Substituto**: Pedro assume a apresentação no seu próprio dispositivo sincronizado e no mesmo commit. |
| **Banca com Restrição de Vídeo/Áudio** | Muito Baixa / Médio | Plataforma de videoconferência bloqueia compartilhamento de vídeo com fluidez. | **Deck de Capturas Sequenciais**: Uso das capturas numeradas `docs/evidencias/mvp-01` a `mvp-07` em slides de alta resolução. |

---

## 2. Artefatos de Contingência Disponíveis e Testados

Todos os artefatos estão versionados no repositório oficial na pasta `docs/evidencias/`:

1. **Vídeo E2E Desktop (Primário)**:
   - Caminho: `docs/evidencias/e2e-pc-desktop.mp4` (Resolução 1920x1080, 60fps, duração 48s).
   - Abrange: Welcome, prompt de intenção, geração de cotação com `quoteHash`, preenchimento de endereço e conclusão via Pix com tracking code.

2. **Vídeo E2E Mobile (Secundário para comprovar responsividade)**:
   - Caminho: `docs/evidencias/e2e-mobile.mp4` (Duração 38s).

3. **Capturas Estáticas de Resolução de Erro**:
   - `mvp-01-welcome-desktop.png`: Visão inicial do chat assistivo.
   - `mvp-02-discovery-and-kit.png`: Recomendação inteligente de kit esportivo.
   - `mvp-03-invisible-checkout-review.png`: Widget de checkout com frete e cotação assinada.
   - `mvp-04-order-confirmed-tracking.png`: Confirmação do pedido com ID externo.
   - `mvp-05-mobile-responsive.png`: Visualização compacta em smartphone.

---

## 3. Protocolo de Transição Silenciosa

Caso seja necessário acionar o Plano B:
1. **Comunicação Concisa**: Thiago avisa à banca de forma natural: *"Para mantermos o dinamismo dos nossos 10 minutos, vou projetar a gravação de execução de alta fidelidade realizada no nosso ambiente de homologação."*
2. **Tempo Máximo de Troca**: < 5 segundos (testado e aprovado no Ensaio 2).
3. **Continuidade da Avaliação**: A banca recebe 100% do conteúdo planejado sem perder tempo com debug de rede ao vivo.
