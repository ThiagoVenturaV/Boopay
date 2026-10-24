import os

path = r"c:\Users\thiag\Downloads\Squad 45 - KeyCore Tech Hub\boopay-time\web\app\page.tsx"

with open(path, "r", encoding="utf-8") as f:
    code = f.read()

# 1. Imports: add Tag
if "Tag," not in code:
    code = code.replace("  Sparkles,\n", "  Sparkles,\n  Tag,\n")

# 2. Add PaymentMethodType and UpsellItem definitions
types_code = """export type PaymentMethodType =
  | 'pix_sandbox'
  | 'card_sandbox'
  | 'apple_pay'
  | 'google_pay'
  | 'samsung_pay'
  | 'mercado_pago';

export interface CheckoutUpsellItem {
  id: string;
  name: string;
  brand: string;
  originalPriceCents: number;
  dealPriceCents: number;
  discountPct: number;
  imageUrl: string;
  highlight: string;
}

export const CHECKOUT_UPSELL_ITEMS: CheckoutUpsellItem[] = [
  {
    id: 'upsell-organizer',
    name: 'Organizador de Cabos Pro',
    brand: 'KeyCore Gear',
    originalPriceCents: 12900,
    dealPriceCents: 6900,
    discountPct: 46,
    imageUrl: '/products/cable-organizer.png',
    highlight: 'Estojo impermeável com divisórias moduláveis para cabos e SSD.',
  },
  {
    id: 'upsell-bottle',
    name: 'Garrafa Térmica Inox 750ml',
    brand: 'BooLab Athletics',
    originalPriceCents: 14990,
    dealPriceCents: 7900,
    discountPct: 47,
    imageUrl: '/products/thermo-bottle.png',
    highlight: 'Parede dupla a vácuo: 24h gelado ou 12h quente sem condensar.',
  },
  {
    id: 'upsell-stand',
    name: 'Suporte Articulado em Alumínio',
    brand: 'KeyCore Gear',
    originalPriceCents: 16900,
    dealPriceCents: 9900,
    discountPct: 41,
    imageUrl: '/products/laptop-stand.png',
    highlight: 'Liga aeroespacial leve com 7 níveis de inclinação ergonômica.',
  },
];
"""

if "CHECKOUT_UPSELL_ITEMS" not in code:
    code = code.replace("type StoreConnectorId = 'demo'", types_code + "\ntype StoreConnectorId = 'demo'")

# 3. Update paymentMethod and checkoutStep state
old_payment_state = """  const [paymentMethod, setPaymentMethod] = useState<
    'pix_sandbox' | 'card_sandbox' | 'google_pay_sandbox'
  >('pix_sandbox');
  const [cardLast4] = useState<string>('4242');
  const [checkoutStep, setCheckoutStep] = useState<'delivery' | 'payment' | 'review'>('delivery');"""

new_payment_state = """  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('pix_sandbox');
  const [cardLast4] = useState<string>('4242');
  const [checkoutStep, setCheckoutStep] = useState<'delivery' | 'payment' | 'upsell' | 'review'>('delivery');
  const [upsellSelectedIds, setUpsellSelectedIds] = useState<string[]>([]);
  const [couponCode, setCouponCode] = useState<string>('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountPct: number;
    discountCents: number;
  } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  const applyCoupon = useCallback((codeToApply?: string) => {
    const code = (codeToApply || couponCode).trim().toUpperCase();
    if (!code) {
      setCouponError('Digite um código de cupom.');
      return;
    }
    if (code === 'BOOPAY10' || code === 'BOO10') {
      setAppliedCoupon({ code, discountPct: 10, discountCents: 0 });
      setCouponError(null);
    } else if (code === 'PRIMEIRACOMPRA' || code === 'BEMVINDO') {
      setAppliedCoupon({ code, discountPct: 15, discountCents: 0 });
      setCouponError(null);
    } else if (code === 'KEYCORE') {
      setAppliedCoupon({ code, discountPct: 20, discountCents: 0 });
      setCouponError(null);
    } else {
      setCouponError('Cupom inválido. Experimente BOOPAY10 ou BEMVINDO.');
    }
  }, [couponCode]);

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError(null);
  }, []);

  const toggleUpsellItem = useCallback((id: string) => {
    setUpsellSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);"""

code = code.replace(old_payment_state, new_payment_state)

# 4. Update checkout steps indicator in modal
old_steps_indicator = """                      <div className="checkout-steps" aria-label="Etapas do checkout">
                        <div
                          className={`checkout-step ${
                            checkoutStep === 'delivery' ? 'is-active' : 'is-done'
                          }`}
                        >
                          <i>{checkoutStep === 'delivery' ? '1' : <Check size={12} />}</i>
                          <span>Entrega</span>
                        </div>
                        <span className="checkout-step-line" aria-hidden="true" />
                        <div
                          className={`checkout-step ${
                            checkoutStep === 'payment'
                              ? 'is-active'
                              : checkoutStep === 'review'
                              ? 'is-done'
                              : ''
                          }`}
                        >
                          <i>{checkoutStep === 'review' ? <Check size={12} />}</i>
                          <span>Pagamento</span>
                        </div>
                        <span className="checkout-step-line" aria-hidden="true" />
                        <div
                          className={`checkout-step ${
                            checkoutStep === 'review' ? 'is-active' : ''
                          }`}
                        >
                          <i>3</i>
                          <span>Revisão</span>
                        </div>
                      </div>"""

new_steps_indicator = """                      <div className="checkout-steps" aria-label="Etapas do checkout">
                        <div
                          className={`checkout-step ${
                            checkoutStep === 'delivery' ? 'is-active' : 'is-done'
                          }`}
                        >
                          <i>{checkoutStep === 'delivery' ? '1' : <Check size={12} />}</i>
                          <span>Entrega</span>
                        </div>
                        <span className="checkout-step-line" aria-hidden="true" />
                        <div
                          className={`checkout-step ${
                            checkoutStep === 'payment'
                              ? 'is-active'
                              : ['upsell', 'review'].includes(checkoutStep)
                              ? 'is-done'
                              : ''
                          }`}
                        >
                          <i>{['upsell', 'review'].includes(checkoutStep) ? <Check size={12} /> : '2'}</i>
                          <span>Pagamento</span>
                        </div>
                        <span className="checkout-step-line" aria-hidden="true" />
                        <div
                          className={`checkout-step ${
                            checkoutStep === 'upsell'
                              ? 'is-active'
                              : checkoutStep === 'review'
                              ? 'is-done'
                              : ''
                          }`}
                        >
                          <i>{checkoutStep === 'review' ? <Check size={12} /> : '3'}</i>
                          <span>Ofertas</span>
                        </div>
                        <span className="checkout-step-line" aria-hidden="true" />
                        <div
                          className={`checkout-step ${
                            checkoutStep === 'review' ? 'is-active' : ''
                          }`}
                        >
                          <i>4</i>
                          <span>Revisão</span>
                        </div>
                      </div>"""

code = code.replace(old_steps_indicator, new_steps_indicator)

# 5. Replace Payment Step (with Digital Wallets: Apple Pay, Google Pay, Samsung Pay, Mercado Pago)
# and add Upsell Step!
old_payment_section = """                      {checkoutStep === 'payment' && (
                        <>
                          <div className="checkout-section-title">
                            <h4>Como você quer pagar?</h4>
                            <span>Sandbox Seguro</span>
                          </div>

                          <div className="option-stack">
                            <label className="option-card">
                              <input
                                type="radio"
                                name="payment"
                                checked={paymentMethod === 'pix_sandbox'}
                                onChange={() => setPaymentMethod('pix_sandbox')}
                              />
                              <span className="option-radio" />
                              <span className="option-copy">
                                <strong>Pix Instantâneo</strong>
                                <small>Aprovação imediata nesta sessão</small>
                              </span>
                              <span className="option-icon"><QrCode size={18} /></span>
                            </label>

                            <label className="option-card">
                              <input
                                type="radio"
                                name="payment"
                                checked={paymentMethod === 'card_sandbox'}
                                onChange={() => setPaymentMethod('card_sandbox')}
                              />
                              <span className="option-radio" />
                              <span className="option-copy">
                                <strong>Cartão de Crédito Tokenizado</strong>
                                <small>Visa final {cardLast4} · 1x sem juros</small>
                              </span>
                              <span className="option-icon"><CreditCard size={18} /></span>
                            </label>

                            <label className="option-card">
                              <input
                                type="radio"
                                name="payment"
                                checked={paymentMethod === 'google_pay_sandbox'}
                                onChange={() => setPaymentMethod('google_pay_sandbox')}
                              />
                              <span className="option-radio" />
                              <span className="option-copy">
                                <strong>Google Pay (Ambiente TEST)</strong>
                                <small>Token criptografado da carteira</small>
                              </span>
                              <span className="option-icon"><Sparkles size={18} /></span>
                            </label>
                          </div>

                          <div className="checkout-actions">
                            <button
                              className="button button-secondary"
                              type="button"
                              onClick={() => setCheckoutStep('delivery')}
                            >
                              Voltar
                            </button>
                            <button
                              className="button button-primary"
                              type="button"
                              disabled={checkoutLoading}
                              onClick={() => void syncCheckoutStep('review')}
                            >
                              Revisar pedido <ArrowRight size={16} style={{ marginLeft: 6 }} />
                            </button>
                          </div>
                        </>
                      )}"""

new_payment_and_upsell_section = """                      {checkoutStep === 'payment' && (
                        <>
                          <div className="checkout-section-title">
                            <h4>Como você quer pagar?</h4>
                            <span>Ambiente Criptografado</span>
                          </div>

                          <div className="payment-group-label">Pagamento Direto</div>
                          <div className="option-stack">
                            <label className={`option-card ${paymentMethod === 'pix_sandbox' ? 'is-selected' : ''}`}>
                              <input
                                type="radio"
                                name="payment"
                                checked={paymentMethod === 'pix_sandbox'}
                                onChange={() => setPaymentMethod('pix_sandbox')}
                              />
                              <span className="option-radio" />
                              <span className="option-copy">
                                <strong>Pix Instantâneo</strong>
                                <small>QR Code e Copia e Cola gerados na hora · Aprovação em 2s</small>
                              </span>
                              <span className="option-icon"><QrCode size={18} color="#00DAFA" /></span>
                            </label>

                            <label className={`option-card ${paymentMethod === 'card_sandbox' ? 'is-selected' : ''}`}>
                              <input
                                type="radio"
                                name="payment"
                                checked={paymentMethod === 'card_sandbox'}
                                onChange={() => setPaymentMethod('card_sandbox')}
                              />
                              <span className="option-radio" />
                              <span className="option-copy">
                                <strong>Cartão de Crédito</strong>
                                <small>Visa final {cardLast4} · Em até 12x sem juros</small>
                              </span>
                              <span className="option-icon"><CreditCard size={18} color="#6366f1" /></span>
                            </label>
                          </div>

                          <div className="payment-group-label" style={{ marginTop: 14 }}>
                            Carteiras Digitais (1 Toque)
                          </div>
                          <div className="wallet-options-grid">
                            <label className={`wallet-card ${paymentMethod === 'apple_pay' ? 'is-selected' : ''}`}>
                              <input
                                type="radio"
                                name="payment"
                                checked={paymentMethod === 'apple_pay'}
                                onChange={() => setPaymentMethod('apple_pay')}
                              />
                              <div className="wallet-card-head">
                                <span className="wallet-brand apple-brand">Pay</span>
                                <span className="wallet-badge">Touch / Face ID</span>
                              </div>
                              <span className="wallet-desc">Pague com biometria no ecossistema Apple</span>
                            </label>

                            <label className={`wallet-card ${paymentMethod === 'google_pay' ? 'is-selected' : ''}`}>
                              <input
                                type="radio"
                                name="payment"
                                checked={paymentMethod === 'google_pay'}
                                onChange={() => setPaymentMethod('google_pay')}
                              />
                              <div className="wallet-card-head">
                                <span className="wallet-brand google-brand">GPay</span>
                                <span className="wallet-badge">1 Toque</span>
                              </div>
                              <span className="wallet-desc">Cartões salvos na sua Conta Google</span>
                            </label>

                            <label className={`wallet-card ${paymentMethod === 'samsung_pay' ? 'is-selected' : ''}`}>
                              <input
                                type="radio"
                                name="payment"
                                checked={paymentMethod === 'samsung_pay'}
                                onChange={() => setPaymentMethod('samsung_pay')}
                              />
                              <div className="wallet-card-head">
                                <span className="wallet-brand samsung-brand">Samsung Pay</span>
                                <span className="wallet-badge">Knox Secure</span>
                              </div>
                              <span className="wallet-desc">Tokenização e biometria em aparelhos Galaxy</span>
                            </label>

                            <label className={`wallet-card ${paymentMethod === 'mercado_pago' ? 'is-selected' : ''}`}>
                              <input
                                type="radio"
                                name="payment"
                                checked={paymentMethod === 'mercado_pago'}
                                onChange={() => setPaymentMethod('mercado_pago')}
                              />
                              <div className="wallet-card-head">
                                <span className="wallet-brand mp-brand">Mercado Pago</span>
                                <span className="wallet-badge">Saldo / Cartão</span>
                              </div>
                              <span className="wallet-desc">Saldo em conta ou Linha de Crédito</span>
                            </label>
                          </div>

                          <div className="checkout-actions">
                            <button
                              className="button button-secondary"
                              type="button"
                              onClick={() => setCheckoutStep('delivery')}
                            >
                              Voltar
                            </button>
                            <button
                              className="button button-primary"
                              type="button"
                              disabled={checkoutLoading}
                              onClick={() => setCheckoutStep('upsell')}
                            >
                              Ver Ofertas Especiais <ArrowRight size={16} style={{ marginLeft: 6 }} />
                            </button>
                          </div>
                        </>
                      )}

                      {checkoutStep === 'upsell' && (
                        <>
                          <div className="checkout-section-title">
                            <div>
                              <h4>Ofertas Exclusivas de Checkout</h4>
                              <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--muted)' }}>
                                Adicione produtos complementares à sua entrega com super desconto:
                              </p>
                            </div>
                            <span className="upsell-badge"><Sparkles size={13} style={{ marginRight: 4 }} /> até 47% OFF</span>
                          </div>

                          <div className="upsell-items-stack">
                            {CHECKOUT_UPSELL_ITEMS.map((item) => {
                              const isAdded = upsellSelectedIds.includes(item.id);
                              return (
                                <div key={item.id} className={`upsell-card ${isAdded ? 'is-added' : ''}`}>
                                  <div className="upsell-media">
                                    <img src={item.imageUrl} alt={item.name} width={72} height={72} />
                                    <span className="upsell-tag">-{item.discountPct}%</span>
                                  </div>
                                  <div className="upsell-info">
                                    <div className="upsell-name-row">
                                      <strong>{item.name}</strong>
                                      <span className="upsell-brand">{item.brand}</span>
                                    </div>
                                    <p className="upsell-desc">{item.highlight}</p>
                                    <div className="upsell-price-action">
                                      <div className="upsell-price-col">
                                        <span className="upsell-old-price">{formatBRL(item.originalPriceCents)}</span>
                                        <strong className="upsell-deal-price">{formatBRL(item.dealPriceCents)}</strong>
                                      </div>
                                      <button
                                        type="button"
                                        className={`upsell-add-btn ${isAdded ? 'is-added' : ''}`}
                                        onClick={() => toggleUpsellItem(item.id)}
                                      >
                                        {isAdded ? (
                                          <>
                                            <Check size={14} style={{ marginRight: 4 }} /> Adicionado
                                          </>
                                        ) : (
                                          <>
                                            + Adicionar por {formatBRL(item.dealPriceCents)}
                                          </>
                                        )}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          <div className="checkout-actions">
                            <button
                              className="button button-secondary"
                              type="button"
                              onClick={() => setCheckoutStep('payment')}
                            >
                              Voltar ao Pagamento
                            </button>
                            <button
                              className="button button-primary"
                              type="button"
                              disabled={checkoutLoading}
                              onClick={() => void syncCheckoutStep('review')}
                            >
                              Continuar para Revisão <ArrowRight size={16} style={{ marginLeft: 6 }} />
                            </button>
                          </div>
                        </>
                      )}"""

code = code.replace(old_payment_section, new_payment_and_upsell_section)

# 6. Update syncCheckoutStep signature/definition if needed
code = code.replace(
    "async (nextStep: 'delivery' | 'payment' | 'review') =>",
    "async (nextStep: 'delivery' | 'payment' | 'upsell' | 'review') =>"
)

# 7. Update Review Step to include Upsell lines, Coupon Field, and payment method labels!
old_review_step = """                      {checkoutStep === 'review' && (
                        <>
                          <div className="checkout-section-title">
                            <h4>Revise e autorize seu pedido</h4>
                            <span>{itemCount} itens</span>
                          </div>

                          <div className="review-box">
                            <div className="review-row">
                              <span>Subtotal</span>
                              <strong>
                                {formatBRL(checkoutSession?.subtotalCents || 0)}
                              </strong>
                            </div>
                            {(checkoutSession?.discountCents || 0) > 0 && (
                              <div className="review-row">
                                <span>Desconto Combo IA</span>
                                <strong>
                                  − {formatBRL(checkoutSession?.discountCents || 0)}
                                </strong>
                              </div>
                            )}
                            <div className="review-row">
                              <span>Frete ({deliveryMethod})</span>
                              <strong>
                                {(checkoutSession?.shippingCents || 0) === 0
                                  ? 'Grátis'
                                  : formatBRL(checkoutSession?.shippingCents || 0)}
                              </strong>
                            </div>
                            <div className="review-row">
                              <span>Pagamento</span>
                              <strong>
                                {paymentMethod === 'pix_sandbox'
                                  ? 'Pix Instantâneo'
                                  : paymentMethod === 'card_sandbox'
                                  ? `Cartão •••• ${cardLast4}`
                                  : 'Google Pay (TEST)'}
                              </strong>
                            </div>
                            <div className="review-row total">
                              <span>Total a Pagar</span>
                              <strong>{formatBRL(checkoutSession?.totalCents || 0)}</strong>
                            </div>
                          </div>"""

new_review_step = """                      {checkoutStep === 'review' && (() => {
                        const upsellTotal = upsellSelectedIds.reduce((sum, id) => {
                          const up = CHECKOUT_UPSELL_ITEMS.find((u) => u.id === id);
                          return sum + (up ? up.dealPriceCents : 0);
                        }, 0);
                        const subtotalVal = (checkoutSession?.subtotalCents || 0) + upsellTotal;
                        const comboDiscount = checkoutSession?.discountCents || 0;
                        const couponDiscount = appliedCoupon
                          ? Math.round((subtotalVal - comboDiscount) * (appliedCoupon.discountPct / 100))
                          : 0;
                        const totalCalculated = Math.max(
                          0,
                          subtotalVal - comboDiscount - couponDiscount + (checkoutSession?.shippingCents || 0)
                        );

                        return (
                        <>
                          <div className="checkout-section-title">
                            <h4>Revise e autorize seu pedido</h4>
                            <span>{itemCount + upsellSelectedIds.length} itens</span>
                          </div>

                          <div className="review-box">
                            <div className="review-row">
                              <span>Subtotal da Compra</span>
                              <strong>{formatBRL(subtotalVal)}</strong>
                            </div>
                            {upsellSelectedIds.length > 0 && (
                              <div className="review-row" style={{ color: '#032541', fontSize: 12 }}>
                                <span>Itens adicionais ({upsellSelectedIds.length} ofertas de checkout)</span>
                                <strong>+{formatBRL(upsellTotal)}</strong>
                              </div>
                            )}
                            {comboDiscount > 0 && (
                              <div className="review-row">
                                <span>Desconto do Combo</span>
                                <strong>− {formatBRL(comboDiscount)}</strong>
                              </div>
                            )}
                            {appliedCoupon && (
                              <div className="review-row" style={{ color: '#166534' }}>
                                <span>Cupom aplicado ({appliedCoupon.code} -{appliedCoupon.discountPct}%)</span>
                                <strong>− {formatBRL(couponDiscount)}</strong>
                              </div>
                            )}
                            <div className="review-row">
                              <span>Frete ({deliveryMethod})</span>
                              <strong>
                                {(checkoutSession?.shippingCents || 0) === 0
                                  ? 'Grátis'
                                  : formatBRL(checkoutSession?.shippingCents || 0)}
                              </strong>
                            </div>
                            <div className="review-row">
                              <span>Forma de Pagamento</span>
                              <strong>
                                {paymentMethod === 'pix_sandbox'
                                  ? 'Pix Instantâneo (QR Code)'
                                  : paymentMethod === 'card_sandbox'
                                  ? `Cartão de Crédito •••• ${cardLast4}`
                                  : paymentMethod === 'apple_pay'
                                  ? 'Apple Pay (Face ID)'
                                  : paymentMethod === 'google_pay'
                                  ? 'Google Pay (1 Toque)'
                                  : paymentMethod === 'samsung_pay'
                                  ? 'Samsung Pay (Knox)'
                                  : 'Mercado Pago'}
                              </strong>
                            </div>
                            <div className="review-row total">
                              <span>Total a Pagar</span>
                              <strong>{formatBRL(totalCalculated)}</strong>
                            </div>
                          </div>

                          {/* Campo de Cupom no Checkout */}
                          <div className="coupon-container">
                            {!appliedCoupon ? (
                              <div className="coupon-input-group">
                                <Tag size={15} className="coupon-icon" />
                                <input
                                  type="text"
                                  placeholder="Tem cupom? Digite aqui (ex: BOOPAY10)"
                                  value={couponCode}
                                  onChange={(e) => {
                                    setCouponCode(e.target.value.toUpperCase());
                                    setCouponError(null);
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      applyCoupon();
                                    }
                                  }}
                                  className="coupon-input"
                                />
                                <button
                                  type="button"
                                  onClick={() => applyCoupon()}
                                  disabled={!couponCode.trim()}
                                  className="coupon-btn"
                                >
                                  Aplicar
                                </button>
                              </div>
                            ) : (
                              <div className="coupon-applied-badge">
                                <span className="coupon-applied-info">
                                  <Check size={14} color="#166534" />
                                  <strong>Cupom {appliedCoupon.code} aplicado</strong> (−{appliedCoupon.discountPct}%)
                                </span>
                                <button
                                  type="button"
                                  onClick={removeCoupon}
                                  className="coupon-remove-btn"
                                  title="Remover cupom"
                                >
                                  <X size={13} />
                                </button>
                              </div>
                            )}
                            {couponError && <p className="coupon-error-text">{couponError}</p>}
                          </div>"""

code = code.replace(old_review_step, new_review_step)

# 8. Close the IIFE in review step
old_review_end = """                          <div className="checkout-actions">
                            <button
                              className="button button-secondary"
                              type="button"
                              onClick={() => setCheckoutStep('payment')}
                            >
                              Voltar
                            </button>"""

new_review_end = """                          <div className="checkout-actions">
                            <button
                              className="button button-secondary"
                              type="button"
                              onClick={() => setCheckoutStep('upsell')}
                            >
                              Voltar
                            </button>"""

code = code.replace(old_review_end, new_review_end)

# And close the IIFE paren before {checkoutStep === 'review' ends
old_review_close = """                          </div>
                        </>
                      )}"""

new_review_close = """                          </div>
                        </>
                        );
                      })()}"""

# Replace only the review closing block
code = code.replace(
    """                          <div className="checkout-actions">
                            <button
                              className="button button-secondary"
                              type="button"
                              onClick={() => setCheckoutStep('upsell')}
                            >
                              Voltar
                            </button>
                            <button
                              className="button button-primary"
                              type="button"
                              disabled={checkoutLoading}
                              onClick={() => void confirmInvisibleOrder()}
                            >
                              {checkoutLoading
                                ? 'Confirmando...'
                                : <>Confirmar pedido <Check size={16} style={{ marginLeft: 6 }} /></>}
                            </button>
                          </div>
                        </>
                      )}""",
    """                          <div className="checkout-actions">
                            <button
                              className="button button-secondary"
                              type="button"
                              onClick={() => setCheckoutStep('upsell')}
                            >
                              Voltar
                            </button>
                            <button
                              className="button button-primary"
                              type="button"
                              disabled={checkoutLoading}
                              onClick={() => void confirmInvisibleOrder()}
                            >
                              {checkoutLoading
                                ? 'Confirmando...'
                                : <>Confirmar pedido <Check size={16} style={{ marginLeft: 6 }} /></>}
                            </button>
                          </div>
                        </>
                        );
                      })()}"""
)

# 9. Also add Coupon Field in Right Sidebar Cart Summary!
old_cart_summary = """                  <div className="kit-summary">
                    <div className="summary-row">
                      <span>Subtotal ({itemCount} itens)</span>
                      <strong>{formatBRL(cart?.subtotalCents || 0)}</strong>
                    </div>
                    {(cart?.discountCents || 0) > 0 && (
                      <div className="summary-row kit-discount">
                        <span>Desconto do combo</span>
                        <strong>− {formatBRL(cart?.discountCents || 0)}</strong>
                      </div>
                    )}
                    <div className="summary-row">
                      <span>Frete estimado</span>
                      <strong>
                        {(cart?.shippingCents || 0) === 0
                          ? 'Grátis'
                          : formatBRL(cart?.shippingCents || 0)}
                      </strong>
                    </div>
                    <div className="summary-row total">
                      <span>Total garantido</span>
                      <strong>{formatBRL(cart?.totalCents || 0)}</strong>
                    </div>
                  </div>"""

new_cart_summary = """                  <div className="kit-summary">
                    <div className="summary-row">
                      <span>Subtotal ({itemCount} itens)</span>
                      <strong>{formatBRL(cart?.subtotalCents || 0)}</strong>
                    </div>
                    {(cart?.discountCents || 0) > 0 && (
                      <div className="summary-row kit-discount">
                        <span>Desconto do combo</span>
                        <strong>− {formatBRL(cart?.discountCents || 0)}</strong>
                      </div>
                    )}
                    {appliedCoupon && (
                      <div className="summary-row" style={{ color: '#166534' }}>
                        <span>Cupom ({appliedCoupon.code})</span>
                        <strong>− {formatBRL(Math.round(((cart?.subtotalCents || 0) - (cart?.discountCents || 0)) * (appliedCoupon.discountPct / 100)))}</strong>
                      </div>
                    )}
                    <div className="summary-row">
                      <span>Frete estimado</span>
                      <strong>
                        {(cart?.shippingCents || 0) === 0
                          ? 'Grátis'
                          : formatBRL(cart?.shippingCents || 0)}
                      </strong>
                    </div>
                    <div className="summary-row total">
                      <span>Total garantido</span>
                      <strong>
                        {formatBRL(
                          Math.max(
                            0,
                            (cart?.totalCents || 0) -
                              (appliedCoupon
                                ? Math.round(((cart?.subtotalCents || 0) - (cart?.discountCents || 0)) * (appliedCoupon.discountPct / 100))
                                : 0)
                          )
                        )}
                      </strong>
                    </div>
                  </div>

                  {/* Cupom de desconto na Sacola */}
                  <div className="coupon-container">
                    {!appliedCoupon ? (
                      <div className="coupon-input-group">
                        <Tag size={14} className="coupon-icon" />
                        <input
                          type="text"
                          placeholder="Cupom (ex: BOOPAY10)"
                          value={couponCode}
                          onChange={(e) => {
                            setCouponCode(e.target.value.toUpperCase());
                            setCouponError(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              applyCoupon();
                            }
                          }}
                          className="coupon-input"
                        />
                        <button
                          type="button"
                          onClick={() => applyCoupon()}
                          disabled={!couponCode.trim()}
                          className="coupon-btn"
                        >
                          Aplicar
                        </button>
                      </div>
                    ) : (
                      <div className="coupon-applied-badge">
                        <span className="coupon-applied-info">
                          <Check size={13} color="#166534" />
                          <strong>{appliedCoupon.code}</strong> (−{appliedCoupon.discountPct}%)
                        </span>
                        <button
                          type="button"
                          onClick={removeCoupon}
                          className="coupon-remove-btn"
                          title="Remover cupom"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    )}
                    {couponError && <p className="coupon-error-text">{couponError}</p>}
                  </div>"""

code = code.replace(old_cart_summary, new_cart_summary)

with open(path, "w", encoding="utf-8", newline="\n") as f:
    f.write(code)

print("Updated page.tsx with coupon, upsell, and digital wallets!")
