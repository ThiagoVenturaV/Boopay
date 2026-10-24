import os
import re

path = r"c:\Users\thiag\Downloads\Squad 45 - KeyCore Tech Hub\boopay-time\web\app\page.tsx"

with open(path, "r", encoding="utf-8") as f:
    code = f.read()

# 1. Add Gift to imports if not present
if "Gift," not in code:
    code = code.replace("  Bot,\n", "  Bot,\n  Gift,\n")

# 2. STORE_CONNECTORS
code = code.replace("protocol: 'UCP · Catálogo Local'", "protocol: 'Catálogo Próprio'")
code = code.replace("protocol: 'HMAC Sync + REST v3'", "protocol: 'Sincronização Direta'")
code = code.replace("protocol: 'Storefront MCP'", "protocol: 'Conexão Storefront'")
code = code.replace("protocol: 'OrderForm API'", "protocol: 'Integração Oficial'")

# 3. QUICK_SUGGESTIONS
old_qs = """const QUICK_SUGGESTIONS = [
  'Montar kit de corrida urbana com desconto',
  'Mochila + fone ANC para trabalho remoto',
  'Equipamentos para setup home office',
  'Auditar prontidão GEO do catálogo',
  'Fechar compra no chat',
];"""

new_qs = """const QUICK_SUGGESTIONS = [
  'Montar kit de corrida urbana com desconto',
  'Mochila + fone ANC para trabalho remoto',
  'Equipamentos para setup home office',
  'Quais são os itens mais vendidos?',
  'Ver opções para viagem',
];"""
code = code.replace(old_qs, new_qs)

# 4. Conversations list
old_conv = """    {
      id: 'conv-geo',
      title: 'Auditoria de Prontidão GEO',
      updatedAt: '23 out',
      preview: 'Score 96/100 · 12 SKUs elegíveis',
      itemCount: 0,
      totalCents: 0,
    },"""

new_conv = """    {
      id: 'conv-presente',
      title: 'Sugestões de Presentes & Kits',
      updatedAt: '23 out',
      preview: 'Kit Café V60 + Garrafa Térmica',
      itemCount: 2,
      totalCents: 27450,
    },"""
code = code.replace(old_conv, new_conv)

# Sidebar conv click handler
code = code.replace(
    "} else if (c.title.includes('GEO')) {\n                          void sendMessage('Auditar prontidão GEO e protocolos agênticos do catálogo');\n                        }",
    "} else if (c.title.includes('Presente')) {\n                          void sendMessage('Me mostre opções de presentes e kits especiais');\n                        }"
)

# 5. Brand plate GEO badge removal
code = code.replace(
    """                <img
                  src="/brand/boopay-dark-transparent.svg"
                  alt="Boopay"
                  width={132}
                  height={38}
                />
                <span className="geo-score-badge">GEO 96%</span>""",
    """                <img
                  src="/brand/boopay-dark-transparent.svg"
                  alt="Boopay"
                  width={132}
                  height={38}
                />"""
)

# 6. Journey steps
code = code.replace(
    """                  <strong>Descoberta & GEO</strong>
                  <small>Catálogo pronto para IA</small>""",
    """                  <strong>Escolha de Produtos</strong>
                  <small>Recomendações sob medida</small>"""
)
code = code.replace(
    """                  <strong>Checkout Invisível</strong>
                  <small>Confirmar e receber no chat</small>""",
    """                  <strong>Finalização Segura</strong>
                  <small>Revise e conclua seu pedido</small>"""
)

# 7. Rail bottom help box
old_rail_help = """            <section className="rail-help">
              <span className="rail-help-icon"><Zap size={16} /></span>
              <strong>Checkout Invisível & GEO</strong>
              <p>
                Cotação determinística com assinatura SHA-256 e confirmação humana obrigatória.
              </p>
              <button
                className="rail-help-btn"
                type="button"
                onClick={() => setActiveDialog('help')}
              >
                Ver arquitetura
              </button>
            </section>"""

new_rail_help = """            <section className="rail-help">
              <span className="rail-help-icon"><Zap size={16} /></span>
              <strong>Compra Segura Boopay</strong>
              <p>
                Preços e estoque garantidos com confirmação transparente antes de qualquer cobrança.
              </p>
              <button
                className="rail-help-btn"
                type="button"
                onClick={() => setActiveDialog('help')}
              >
                Como funciona
              </button>
            </section>"""
code = code.replace(old_rail_help, new_rail_help)

# 8. Rail footer
old_rail_demo = "<p className=\"rail-demo\">{isLiveMode ? 'Boopay · Modo Ao Vivo (Groq Qwen 3.8 27B) · UCP/ACP' : 'Boopay MVP · Groq (Qwen 3.8 27B) · UCP / ACP'}</p>"
new_rail_demo = "<p className=\"rail-demo\">Boopay · Atendimento & Checkout Seguro</p>"
code = code.replace(old_rail_demo, new_rail_demo)

# 9. Chat heading and remove live-mode badge & subhead technical details
old_heading = """            <div className="chat-heading">
              <span className="live-mark" aria-hidden="true" />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <h1>Compra Assistida Boopay</h1>
                  <button
                    type="button"
                    className={`live-mode-badge ${isLiveMode ? 'is-live' : 'is-off'}`}
                    onClick={() => setIsLiveMode((prev) => !prev)}
                    title={isLiveMode ? 'Modo Ao Vivo Ativo: Transmissão contínua SSE e IA instantânea' : 'Ativar Modo Ao Vivo'}
                    aria-pressed={isLiveMode}
                  >
                    <span className="live-dot-pulse" aria-hidden="true" />
                    <span>{isLiveMode ? 'Ao Vivo' : 'Padrão'}</span>
                    <Radio size={12} />
                  </button>
                </div>
                <p>Groq · Qwen 3.8 27B · Catálogo GEO (96/100) · Checkout Invisível</p>
              </div>
            </div>"""

new_heading = """            <div className="chat-heading">
              <div>
                <h1>Atendimento Conversacional Boopay</h1>
                <p>Compre direto no chat · Entrega rápida · Pagamento seguro</p>
              </div>
            </div>"""
code = code.replace(old_heading, new_heading)

# 10. Intent card 4
old_intent_4 = """                  <button
                    className="intent-card"
                    type="button"
                    onClick={() =>
                      void sendMessage(
                        'Auditar prontidão GEO e protocolos agênticos do catálogo'
                      )
                    }
                  >
                    <span className="intent-top">
                      <span className="intent-icon"><Bot size={22} strokeWidth={2.2} /></span>
                      <span className="intent-arrow"><ArrowRight size={16} /></span>
                    </span>
                    <h3>Auditoria de Prontidão Agêntica (GEO)</h3>
                    <p>
                      Inspecione sinais JSON-LD, GTIN/EAN, estoque em tempo real e compatibilidade
                      UCP/ACP.
                    </p>
                    <span className="intent-thumbs" aria-hidden="true">
                      <img
                        className="intent-thumb"
                        src="/brand/boo-eyes.svg"
                        alt=""
                        width={40}
                        height={40}
                      />
                    </span>
                  </button>"""

new_intent_4 = """                  <button
                    className="intent-card"
                    type="button"
                    onClick={() =>
                      void sendMessage(
                        'Quero ver presentes e kits especiais com desconto'
                      )
                    }
                  >
                    <span className="intent-top">
                      <span className="intent-icon"><Gift size={22} strokeWidth={2.2} /></span>
                      <span className="intent-arrow"><ArrowRight size={16} /></span>
                    </span>
                    <h3>Presentes & Combos com Desconto</h3>
                    <p>
                      Descubra kits montados com café gourmet, caneca térmica e organizadores exclusivos.
                    </p>
                    <span className="intent-thumbs" aria-hidden="true">
                      <img
                        className="intent-thumb"
                        src="/products/coffee-kit.png"
                        alt=""
                        width={40}
                        height={40}
                      />
                    </span>
                  </button>"""
code = code.replace(old_intent_4, new_intent_4)

# 11. Trust row
old_trust = """                <div className="trust-row">
                  <span className="trust-item"><ShieldCheck size={15} style={{ marginRight: 6, color: '#00DAFA' }} /> Cotação autoritativa SHA-256</span>
                  <span className="trust-item"><Check size={15} style={{ marginRight: 6, color: '#85FA2E' }} /> Você confirma cada etapa</span>
                  <button
                    className="trust-item"
                    type="button"
                    onClick={() => setActiveDialog('help')}
                  >
                    <Zap size={15} style={{ marginRight: 6, color: '#00DAFA' }} /> Protocolos UCP / ACP ativos
                  </button>
                </div>"""

new_trust = """                <div className="trust-row">
                  <span className="trust-item"><ShieldCheck size={15} style={{ marginRight: 6, color: '#00DAFA' }} /> Preço e estoque garantidos</span>
                  <span className="trust-item"><Check size={15} style={{ marginRight: 6, color: '#85FA2E' }} /> Confirmação segura no chat</span>
                  <button
                    className="trust-item"
                    type="button"
                    onClick={() => setActiveDialog('help')}
                  >
                    <Zap size={15} style={{ marginRight: 6, color: '#00DAFA' }} /> Como funciona a compra
                  </button>
                </div>"""
code = code.replace(old_trust, new_trust)

# 12. Assistant header
code = code.replace(
    "<strong>Boopay AI · Qwen 3.8 27B (Groq)</strong>",
    "<strong>Assistente Boopay</strong>"
)

# 13. Tool banner
code = code.replace(
    "toolBanner: 'Consultando catálogo enriquecido para IA (GEO)...',",
    "toolBanner: 'Consultando catálogo de produtos disponíveis...',",
)

# 14. Product card brand and category
code = code.replace(
    """                                  <span className="product-brand">
                                    {prod.brand} · GEO {prod.geoScore}
                                  </span>""",
    """                                  <span className="product-brand">
                                    {prod.brand} · {prod.category}
                                  </span>"""
)

# 15. Checkout Widget in Chat Message
old_chk_widget = """                          {/* Inline Checkout Session Widget */}
                          {message.checkoutWidget && (
                            <section className="agent-widget checkout-agent-widget">
                              <div className="agent-widget-head">
                                <div className="widget-kicker-row">
                                  <span className="widget-kicker">
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><ShieldCheck size={14} /> Protocolo Universal (UCP / ACP)</span>
                                  </span>
                                  <span className="geo-score-badge">
                                    Hash #{message.checkoutWidget.quoteHash.slice(0, 8)}
                                  </span>
                                </div>
                                <h3>Sessão de Checkout Invisível</h3>
                                <p>
                                  Total garantido:{' '}
                                  <strong>{formatBRL(message.checkoutWidget.totalCents)}</strong>
                                </p>
                              </div>
                              <div className="agent-widget-foot">
                                <button
                                  className="button button-primary"
                                  type="button"
                                  onClick={() => void openInvisibleCheckout()}
                                >
                                  Revisar e confirmar no painel <ArrowRight size={16} style={{ marginLeft: 6 }} />
                                </button>
                              </div>
                            </section>
                          )}"""

new_chk_widget = """                          {/* Inline Checkout Session Widget */}
                          {message.checkoutWidget && (
                            <section className="agent-widget checkout-agent-widget">
                              <div className="agent-widget-head">
                                <div className="widget-kicker-row">
                                  <span className="widget-kicker">
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><ShieldCheck size={14} /> Compra Segura Boopay</span>
                                  </span>
                                  <span className="status-pill" style={{ background: '#eefde0', color: '#166534', padding: '3px 8px', borderRadius: 999, fontSize: 11, fontWeight: 700 }}>
                                    Pronto para Revisão
                                  </span>
                                </div>
                                <h3>Finalizar Compra</h3>
                                <p>
                                  Total garantido:{' '}
                                  <strong>{formatBRL(message.checkoutWidget.totalCents)}</strong>
                                </p>
                              </div>
                              <div className="agent-widget-foot">
                                <button
                                  className="button button-primary"
                                  type="button"
                                  onClick={() => void openInvisibleCheckout()}
                                >
                                  Revisar e Pagar <ArrowRight size={16} style={{ marginLeft: 6 }} />
                                </button>
                              </div>
                            </section>
                          )}"""
code = code.replace(old_chk_widget, new_chk_widget)

# 16. Order tracking widget protocol text
code = code.replace(
    """                                <p>
                                  Protocolo {message.orderWidget.protocol.toUpperCase()} · Vínculo{' '}
                                  {message.orderWidget.externalOrderId}
                                </p>""",
    """                                <p>
                                  Código de rastreamento: {message.orderWidget.externalOrderId}
                                </p>"""
)

# 17. Telemetry dock removal
old_telemetry = """            {isLiveMode && (
              <div className="live-telemetry">
                <div className="live-telemetry-left">
                  <span className="live-telemetry-pill">
                    <Radio size={13} style={{ color: '#85FA2E' }} /> Modo Ao Vivo
                  </span>
                  <span>·</span>
                  <span>Groq Qwen 3.8 27B</span>
                  <span>·</span>
                  <span className="live-telemetry-ping">24ms (SSE Ativo)</span>
                </div>
                <span style={{ fontSize: 10.5, color: '#00DAFA', fontWeight: 700 }}>
                  Cotação SHA-256 Sincronizada
                </span>
              </div>
            )}"""
code = code.replace(old_telemetry, "")

# 18. Composer note
old_comp_note = """            <p className="composer-note">
              <ShieldCheck size={14} style={{ marginRight: 6, display: 'inline-block', verticalAlign: 'middle' }} /> Checkout Invisível Boopay · Preços e descontos validados deterministicamente pelo
              servidor com confirmação humana explícita.
            </p>"""
new_comp_note = """            <p className="composer-note">
              <ShieldCheck size={14} style={{ marginRight: 6, display: 'inline-block', verticalAlign: 'middle' }} /> Compra Segura Boopay · Preços e estoque garantidos com confirmação antes do pagamento.
            </p>"""
code = code.replace(old_comp_note, new_comp_note)

# 19. Panel note (cart)
old_p_note = """                  <p className="panel-note">
                    Cotação #{cart?.quoteHash.slice(0, 8)} · Confirmação explícita no próximo
                    passo.
                  </p>"""
new_p_note = """                  <p className="panel-note">
                    Preço e estoque garantidos · Você revisa todos os dados antes de pagar.
                  </p>"""
code = code.replace(old_p_note, new_p_note)

# 20. Care note
old_care_note = """              <p className="care-note">
                O Checkout Invisível pré-carrega seu CEP e preferência de pagamento para agilizar o
                fechamento em 3 passos.
              </p>"""
new_care_note = """              <p className="care-note">
                Preenchemos automaticamente seu endereço e pagamento para você finalizar seu pedido com rapidez e segurança.
              </p>"""
code = code.replace(old_care_note, new_care_note)

# 21. Panel 3 replacement
old_p3 = """            {/* PAINEL 3: PRONTIDÃO AGÊNTICA & GEO */}
            <section className="pharm-card" aria-label="Prontidão Agêntica e GEO">
              <div className="pharm-card-top">
                <span className="pharm-avatar">
                  <img src="/brand/boo-eyes.svg" alt="" width={22} height={15} />
                </span>
                <div>
                  <strong>Prontidão Agêntica (GEO)</strong>
                  <small>
                    {activeConnector.name} · {activeConnector.protocol}
                  </small>
                </div>
              </div>
              <p>
                Catálogo sincronizado com JSON-LD Schema.org, GTIN/EAN e disponibilidade em tempo
                real para agentes de IA.
              </p>
              <button
                className="button button-secondary"
                type="button"
                onClick={() =>
                  void sendMessage(
                    'Auditar prontidão GEO e protocolos agênticos do catálogo'
                  )
                }
              >
                Auditar sinais GEO no chat
              </button>
            </section>"""

new_p3 = """            {/* PAINEL 3: GARANTIA & BENEFÍCIOS */}
            <section className="pharm-card" aria-label="Garantia e Benefícios">
              <div className="pharm-card-top">
                <span className="pharm-avatar">
                  <ShieldCheck size={20} color="#00DAFA" />
                </span>
                <div>
                  <strong>Garantia & Compra Segura</strong>
                  <small>Proteção total ao consumidor</small>
                </div>
              </div>
              <p>
                Todos os produtos contam com nota fiscal, garantia oficial de fábrica e política de troca grátis em até 30 dias.
              </p>
              <button
                className="button button-secondary"
                type="button"
                onClick={() => setActiveDialog('help')}
              >
                Ver termos e garantias
              </button>
            </section>"""
code = code.replace(old_p3, new_p3)

# 22. Dialog header titles
code = code.replace(
    "{activeDialog === 'product' && 'Detalhes e Sinais GEO do Produto'}",
    "{activeDialog === 'product' && 'Detalhes do Produto'}"
)
code = code.replace(
    "{activeDialog === 'help' && 'Arquitetura GEO & Checkout Invisível'}",
    "{activeDialog === 'help' && 'Como Funciona o Boopay'}"
)

# 23. Checkout dialog head
old_chk_head = """                        <div>
                          <span className="widget-kicker">
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><ShieldCheck size={14} /> Protocolo Universal (UCP / ACP)</span>
                          </span>
                          <h3>Checkout Invisível</h3>
                        </div>
                        <span className="secure-tag">
                          Hash #{checkoutSession?.quoteHash?.slice(0, 8) || 'SHA256'}
                        </span>"""

new_chk_head = """                        <div>
                          <span className="widget-kicker">
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><ShieldCheck size={14} /> Ambiente Seguro Criptografado</span>
                          </span>
                          <h3>Finalização do Pedido</h3>
                        </div>
                        <span className="secure-tag">
                          <ShieldCheck size={13} style={{ marginRight: 4, display: 'inline-block', verticalAlign: 'middle' }} /> Compra Protegida
                        </span>"""
code = code.replace(old_chk_head, new_chk_head)

# 24. Review step texts
code = code.replace("<span>Total Autoritativo</span>", "<span>Total a Pagar</span>")
code = code.replace(
    "<strong>Confirmação Humana Explícita:</strong>",
    "<strong>Confirmação do Pedido:</strong>"
)

# 25. Product modal brand/GEO
code = code.replace(
    """                      <p className="detail-brand">
                        {selectedProduct.brand} · {selectedProduct.category} · GEO{' '}
                        {selectedProduct.geoScore}/100
                      </p>""",
    """                      <p className="detail-brand">
                        {selectedProduct.brand} · {selectedProduct.category}
                      </p>"""
)

# 26. Help Modal content
old_help_content = """                {/* MODAL: HELP / ARQUITETURA */}
                {activeDialog === 'help' && (
                  <div className="help-content">
                    <h3>Duas Frentes Integradas: GEO + Checkout Invisível</h3>
                    <p>
                      1. <strong>Catálogo Pronto para IA (GEO)</strong>: Sincronizamos produtos do
                      WooCommerce (via plugin HMAC) e conectores de e-commerce estruturando GTIN,
                      JSON-LD e disponibilidade em tempo real.
                    </p>
                    <p>
                      2. <strong>Checkout Invisível com Guarda-Rails (Groq · Qwen 3.8 27B)</strong>: O
                      agente roda sobre a API da Groq com o modelo <code>qwen/qwen3.8-27b</code>,
                      enquanto preço, estoque e descontos vêm exclusivamente da cotação determinística
                      SHA-256 com confirmação humana explícita obrigatória.
                    </p>
                    <button
                      className="secondary"
                      type="button"
                      onClick={() => setActiveDialog(null)}
                    >
                      Voltar à conversa
                    </button>
                  </div>
                )}"""

new_help_content = """                {/* MODAL: HELP / COMO FUNCIONA */}
                {activeDialog === 'help' && (
                  <div className="help-content">
                    <h3>Como Funciona o Boopay</h3>
                    <p>
                      1. <strong>Atendimento Inteligente</strong>: Converse em linguagem natural, tire dúvidas sobre tamanhos, materiais e especificações, e receba recomendações de produtos e kits com descontos exclusivos.
                    </p>
                    <p>
                      2. <strong>Compra Segura e Transparente</strong>: Seu endereço e forma de pagamento são preenchidos com facilidade, garantindo que você revise todos os itens e valores antes de qualquer confirmação de compra.
                    </p>
                    <p>
                      3. <strong>Garantia & Rastreamento</strong>: Após confirmar seu pedido, você recebe atualizações de envio e rastreio em tempo real diretamente na conversa.
                    </p>
                    <button
                      className="secondary"
                      type="button"
                      onClick={() => setActiveDialog(null)}
                    >
                      Voltar à conversa
                    </button>
                  </div>
                )}"""
code = code.replace(old_help_content, new_help_content)

# 27. Voice dialog
code = code.replace(
    "'Auditar prontidão GEO do catálogo',",
    "'Quero ver kits com desconto',",
)

# 28. Menu / Kit dialog button
code = code.replace(
    "Fechar pedido no Checkout Invisível <ArrowRight size={16} style={{ marginLeft: 6 }} />",
    "Finalizar Compra <ArrowRight size={16} style={{ marginLeft: 6 }} />"
)

# 29. Order confirmed message content
code = code.replace(
    "content: `Pedido **${confirmedOrder.id}** confirmado com sucesso via Checkout Invisível Boopay! O pagamento foi aprovado e seu pedido já entrou no fluxo logístico.`,",
    "content: `Pedido **${confirmedOrder.id}** confirmado com sucesso no Boopay! O pagamento foi aprovado e seu pedido já entrou no fluxo de entrega.`,",
)

with open(path, "w", encoding="utf-8", newline="\n") as f:
    f.write(code)

print("Finished applying all UI jargon cleaning!")
