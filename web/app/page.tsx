'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export interface CatalogProduct {
  id: string;
  sku: string;
  name: string;
  brand: string;
  category: string;
  priceCents: number;
  originalPriceCents?: number;
  stock: number;
  inStock: boolean;
  imageUrl: string;
  description: string;
  highlights: string[];
  attributes: Record<string, string>;
  geoScore: number;
  geoSignals: string[];
  whyRecommended: string;
  source: 'demo' | 'woocommerce' | 'shopify' | 'vtex';
}

export interface CatalogBundleItem {
  productId: string;
  name: string;
  brand: string;
  priceCents: number;
  qty: number;
  imageUrl: string;
  category: string;
}

export interface CatalogBundle {
  id: string;
  title: string;
  subtitle: string;
  goal: string;
  badge: string;
  discountPct: number;
  originalTotalCents: number;
  bundlePriceCents: number;
  items: CatalogBundleItem[];
  whyRecommended: string;
  source: 'demo' | 'ai_curated';
}

export interface QuoteLine {
  productId?: string;
  productRef?: string;
  sku?: string;
  name: string;
  brand: string;
  category: string;
  imageUrl: string;
  qty: number;
  priceCents?: number;
  unitPriceCents?: number;
  totalCents?: number;
  subtotalCents?: number;
  lineTotalCents?: number;
  discountCents?: number;
  bundleId?: string | null;
}

export interface CartSnapshot {
  conversationId: string;
  cartVersion: number;
  source: string;
  lines: QuoteLine[];
  subtotalCents: number;
  discountCents: number;
  shippingCents: number;
  totalCents: number;
  itemCount: number;
  quoteHash: string;
}

export interface CheckoutSessionView {
  id: string;
  conversationId: string;
  tenantId: string;
  protocol: 'chat' | 'acp' | 'ucp';
  surface: string;
  status: string;
  deliveryType: 'express' | 'standard' | 'pickup' | null;
  cep: string | null;
  paymentMethod: 'pix_sandbox' | 'card_sandbox' | 'google_pay_sandbox' | null;
  subtotalCents: number;
  discountCents: number;
  shippingCents: number;
  taxCents: number;
  totalCents: number;
  lines: QuoteLine[];
  quoteVersion: number;
  quoteHash: string;
  confirmedAt: string | null;
  orderId: string | null;
}

export interface OrderView {
  id: string;
  conversationId: string;
  checkoutSessionId: string;
  source: string;
  externalOrderId: string | null;
  protocol: string;
  surface: string;
  status: string;
  steps: Array<{
    code: string;
    label: string;
    description: string;
    done: boolean;
    current: boolean;
  }>;
  simulated: boolean;
  deliveryType: string;
  paymentMethod: string;
  paymentStatus: string;
  subtotalCents: number;
  discountCents: number;
  shippingCents: number;
  totalCents: number;
  lines: QuoteLine[];
  quoteHash: string;
  confirmedAt: string;
  createdAt: string;
}

export interface GeoAuditPayload {
  storeName: string;
  overallScore: number;
  eligibleCount: number;
  totalCount: number;
  protocols: string[];
  highlights: string[];
}

export interface ChatTurnMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  streaming?: boolean;
  toolBanner?: string | null;
  products?: CatalogProduct[];
  kit?: CatalogBundle | null;
  cartWidget?: CartSnapshot | null;
  checkoutWidget?: CheckoutSessionView | null;
  orderWidget?: OrderView | null;
  geoAudit?: GeoAuditPayload | null;
}

type DialogType =
  | null
  | 'menu'
  | 'kit'
  | 'product'
  | 'checkout'
  | 'profile'
  | 'help'
  | 'voice'
  | 'new';

type StoreConnectorId = 'demo' | 'woocommerce' | 'shopify' | 'vtex';

const STORE_CONNECTORS: Array<{
  id: StoreConnectorId;
  name: string;
  protocol: string;
  statusLabel: string;
}> = [
  {
    id: 'demo',
    name: 'Boopay Demo',
    protocol: 'UCP · Catálogo Local',
    statusLabel: '12 SKUs Ativos',
  },
  {
    id: 'woocommerce',
    name: 'WooCommerce',
    protocol: 'HMAC Sync + REST v3',
    statusLabel: 'Plugin Conectado',
  },
  {
    id: 'shopify',
    name: 'Shopify',
    protocol: 'Storefront MCP',
    statusLabel: 'Adapter Ready',
  },
  {
    id: 'vtex',
    name: 'VTEX IO',
    protocol: 'OrderForm API',
    statusLabel: 'Adapter Ready',
  },
];

const QUICK_SUGGESTIONS = [
  'Montar kit de corrida urbana com desconto',
  'Mochila + fone ANC para trabalho remoto',
  'Equipamentos para setup home office',
  'Auditar prontidão GEO do catálogo',
  'Fechar compra no chat',
];

function formatBRL(cents: number): string {
  const safe = Number.isFinite(cents) ? cents : 0;
  return (safe / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function renderFormattedLine(line: string): React.ReactNode[] {
  const parts = line.split(/(\*\*[^*]+\*\*|~~[^~]+~~|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('~~') && part.endsWith('~~')) {
      return <del key={i}>{part.slice(2, -2)}</del>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i}>{part.slice(1, -1)}</code>;
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

function makeClientKey(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function BoopayConversationalCheckoutPage() {
  const [storeId, setStoreId] = useState<StoreConnectorId>('demo');
  const [conversationId, setConversationId] = useState<string>('');
  const [cart, setCart] = useState<CartSnapshot | null>(null);
  const [checkoutSession, setCheckoutSession] = useState<CheckoutSessionView | null>(null);
  const [latestOrder, setLatestOrder] = useState<OrderView | null>(null);
  const [messages, setMessages] = useState<ChatTurnMessage[]>([]);
  const [composerText, setComposerText] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [isMutatingCart, setIsMutatingCart] = useState<boolean>(false);
  const [activeDialog, setActiveDialog] = useState<DialogType>(null);
  const [selectedProduct, setSelectedProduct] = useState<CatalogProduct | null>(null);

  // Buyer profile & checkout form state
  const [postalCode, setPostalCode] = useState<string>('60115-080');
  const [addressLine, setAddressLine] = useState<string>('Avenida Santos Dumont');
  const [addressNumber, setAddressNumber] = useState<string>('1510');
  const [district, setDistrict] = useState<string>('Aldeota');
  const [city, setCity] = useState<string>('Fortaleza');
  const [stateCode, setStateCode] = useState<string>('CE');
  const [customerName, setCustomerName] = useState<string>('Marina S.');
  const [deliveryMethod, setDeliveryMethod] = useState<'express' | 'standard' | 'pickup'>('express');
  const [paymentMethod, setPaymentMethod] = useState<
    'pix_sandbox' | 'card_sandbox' | 'google_pay_sandbox'
  >('pix_sandbox');
  const [cardLast4] = useState<string>('4242');
  const [checkoutStep, setCheckoutStep] = useState<'delivery' | 'payment' | 'review'>('delivery');
  const [explicitHumanCheck, setExplicitHumanCheck] = useState<boolean>(false);
  const [checkoutLoading, setCheckoutLoading] = useState<boolean>(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [cepLoading, setCepLoading] = useState<boolean>(false);

  const chatScrollRef = useRef<HTMLDivElement | null>(null);
  const composerInputRef = useRef<HTMLTextAreaElement | null>(null);
  const cartMutationQueueRef = useRef<Promise<unknown>>(Promise.resolve());
  const sessionPromiseRef = useRef<Promise<string> | null>(null);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      if (chatScrollRef.current) {
        chatScrollRef.current.scrollTo({
          top: chatScrollRef.current.scrollHeight,
          behavior: 'smooth',
        });
      }
    });
  }, []);

  const ensureSession = useCallback(
    async (forceNew = false, targetStoreId: StoreConnectorId = storeId): Promise<string> => {
      if (!forceNew && conversationId) {
        return conversationId;
      }
      if (!forceNew && sessionPromiseRef.current) {
        return sessionPromiseRef.current;
      }

      const promise = (async () => {
        const storedId =
          !forceNew && typeof window !== 'undefined'
            ? window.localStorage.getItem('boopay_conversation_id')
            : null;

        const sessionRes = await fetch('/api/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversationId: storedId || undefined,
            storeSource: targetStoreId,
            cep: postalCode,
          }),
        });

        if (!sessionRes.ok) {
          throw new Error('Falha ao criar sessão conversacional');
        }

        const sessionData = await sessionRes.json();
        setConversationId(sessionData.conversationId);
        setCart(sessionData.cart || null);

        if (typeof window !== 'undefined') {
          window.localStorage.setItem('boopay_conversation_id', sessionData.conversationId);
        }

        if (forceNew) {
          setMessages([]);
          setCheckoutSession(null);
          setLatestOrder(null);
        }

        return String(sessionData.conversationId);
      })();

      sessionPromiseRef.current = promise;
      try {
        return await promise;
      } finally {
        sessionPromiseRef.current = null;
      }
    },
    [conversationId, postalCode, storeId]
  );

  useEffect(() => {
    void ensureSession(false, storeId);
  }, [ensureSession, storeId]);

  // Sequential Cart Mutation Queue
  const enqueueCartMutation = useCallback(
    (
      action: 'add' | 'set_qty' | 'remove' | 'clear' | 'add_bundle',
      payload: { productRef?: string; qty?: number; bundleId?: string }
    ) => {
      setIsMutatingCart(true);
      cartMutationQueueRef.current = cartMutationQueueRef.current
        .then(async () => {
          const activeConvId = await ensureSession(false, storeId);
          const res = await fetch('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              conversationId: activeConvId,
              requestId: makeClientKey(`cart-${action}`),
              action,
              ...payload,
            }),
          });
          if (res.ok) {
            const updatedCart: CartSnapshot = await res.json();
            setCart(updatedCart);
          }
        })
        .catch((err) => {
          console.error('Falha ao atualizar sacola:', err);
        })
        .finally(() => {
          setIsMutatingCart(false);
        });
    },
    [ensureSession, storeId]
  );

  // Send message to Conversational Agent (SSE streaming via POST /api/chat/stream)
  const sendMessage = useCallback(
    async (rawText: string) => {
      const text = rawText.trim();
      if (!text || isStreaming) return;

      const userTurnId = makeClientKey('user-msg');
      const assistantTurnId = makeClientKey('assistant-msg');
      const nowIso = new Date().toISOString();

      setComposerText('');
      setIsStreaming(true);

      setMessages((prev) => [
        ...prev,
        {
          id: userTurnId,
          role: 'user',
          content: text,
          createdAt: nowIso,
        },
        {
          id: assistantTurnId,
          role: 'assistant',
          content: '',
          createdAt: nowIso,
          streaming: true,
          toolBanner: 'Consultando catálogo enriquecido para IA (GEO)...',
        },
      ]);
      scrollToBottom();

      try {
        const activeConvId = await ensureSession(false, storeId);
        const response = await fetch('/api/chat/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversationId: activeConvId,
            requestId: makeClientKey('turn'),
            message: text,
            storeSource: storeId,
            cep: postalCode,
          }),
        });

        if (!response.ok || !response.body) {
          throw new Error(`HTTP ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const blocks = buffer.split('\n\n');
          buffer = blocks.pop() || '';

          for (const block of blocks) {
            const lines = block.split('\n');
            let eventType = 'message';
            let dataRaw = '';
            for (const line of lines) {
              if (line.startsWith('event:')) {
                eventType = line.slice(6).trim();
              } else if (line.startsWith('data:')) {
                dataRaw += line.slice(5).trim();
              }
            }
            if (!dataRaw) continue;
            let parsed: Record<string, unknown>;
            try {
              parsed = JSON.parse(dataRaw);
            } catch {
              continue;
            }

            if (eventType === 'tool-start') {
              const label = String(parsed.label || parsed.name || 'Executando ferramenta...');
              setMessages((prev) =>
                prev.map((m) => (m.id === assistantTurnId ? { ...m, toolBanner: label } : m))
              );
            } else if (eventType === 'tool-end') {
              setMessages((prev) =>
                prev.map((m) => (m.id === assistantTurnId ? { ...m, toolBanner: null } : m))
              );
            } else if (eventType === 'token') {
              const delta = String(parsed.texto || '');
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantTurnId ? { ...m, content: m.content + delta } : m
                )
              );
              scrollToBottom();
            } else if (eventType === 'cart_updated') {
              const updatedCart = parsed.carrinho as CartSnapshot;
              if (updatedCart) {
                setCart(updatedCart);
              }
            } else if (eventType === 'ui') {
              const tipo = String(parsed.tipo || '');
              const dados = parsed.dados as Record<string, unknown>;

              if (tipo === 'product_list') {
                const items = (dados.items as CatalogProduct[]) || [];
                setMessages((prev) =>
                  prev.map((m) => (m.id === assistantTurnId ? { ...m, products: items } : m))
                );
              } else if (tipo === 'product_card') {
                const item = dados as unknown as CatalogProduct;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantTurnId
                      ? { ...m, products: [...(m.products || []), item] }
                      : m
                  )
                );
              } else if (tipo === 'kit_card') {
                const kit = dados as unknown as CatalogBundle;
                setMessages((prev) =>
                  prev.map((m) => (m.id === assistantTurnId ? { ...m, kit } : m))
                );
              } else if (tipo === 'cart') {
                const snap = dados as unknown as CartSnapshot;
                setCart(snap);
                setMessages((prev) =>
                  prev.map((m) => (m.id === assistantTurnId ? { ...m, cartWidget: snap } : m))
                );
              } else if (tipo === 'checkout') {
                const session = dados as unknown as CheckoutSessionView;
                setCheckoutSession(session);
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantTurnId ? { ...m, checkoutWidget: session } : m
                  )
                );
              } else if (tipo === 'order_tracking') {
                const order = dados as unknown as OrderView;
                setLatestOrder(order);
                setMessages((prev) =>
                  prev.map((m) => (m.id === assistantTurnId ? { ...m, orderWidget: order } : m))
                );
              } else if (tipo === 'geo_audit') {
                const geoAudit = dados as unknown as GeoAuditPayload;
                setMessages((prev) =>
                  prev.map((m) => (m.id === assistantTurnId ? { ...m, geoAudit } : m))
                );
              }
              scrollToBottom();
            } else if (eventType === 'done') {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantTurnId ? { ...m, streaming: false, toolBanner: null } : m
                )
              );
            }
          }
        }
      } catch (err) {
        console.error('Erro no streaming do chat:', err);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantTurnId
              ? {
                  ...m,
                  streaming: false,
                  toolBanner: null,
                  content:
                    m.content ||
                    'Tive uma oscilação momentânea ao consultar o motor conversacional. Você pode tentar novamente?',
                }
              : m
          )
        );
      } finally {
        setIsStreaming(false);
        scrollToBottom();
      }
    },
    [ensureSession, isStreaming, postalCode, scrollToBottom, storeId]
  );

  // CEP lookup via backend /api/cep/:cep
  const handleCepLookup = useCallback(async (rawCep: string) => {
    setPostalCode(rawCep);
    const clean = rawCep.replace(/\D/g, '');
    if (clean.length !== 8) return;
    setCepLoading(true);
    try {
      const res = await fetch(`/api/cep/${clean}`);
      if (res.ok) {
        const data = await res.json();
        if (data.logradouro) setAddressLine(data.logradouro);
        if (data.bairro) setDistrict(data.bairro);
        if (data.cidade) setCity(data.cidade);
        if (data.estado) setStateCode(data.estado);
      }
    } catch {
      // fallback silently
    } finally {
      setCepLoading(false);
    }
  }, []);

  // Open 3-step Invisible Checkout Modal
  const openInvisibleCheckout = useCallback(async () => {
    if (!cart || cart.lines.length === 0) return;
    setCheckoutError(null);
    setExplicitHumanCheck(false);
    setCheckoutStep('delivery');
    setActiveDialog('checkout');
    setCheckoutLoading(true);

    try {
      const activeConvId = await ensureSession(false, storeId);
      const res = await fetch('/api/checkout/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: activeConvId,
          protocol: 'ucp',
          surface: 'nextjs-chat',
        }),
      });
      if (res.ok) {
        const session: CheckoutSessionView = await res.json();
        setCheckoutSession(session);
      } else {
        setCheckoutError('Não foi possível iniciar a sessão de checkout.');
      }
    } catch {
      setCheckoutError('Erro de conexão ao iniciar o checkout.');
    } finally {
      setCheckoutLoading(false);
    }
  }, [cart, ensureSession, storeId]);

  // Sync checkout step changes
  const syncCheckoutStep = useCallback(
    async (nextStep: 'delivery' | 'payment' | 'review') => {
      if (!checkoutSession) return;
      setCheckoutLoading(true);
      setCheckoutError(null);
      try {
        if (checkoutStep === 'delivery') {
          const res = await fetch(`/api/checkout/sessions/${checkoutSession.id}/delivery`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              deliveryType: deliveryMethod,
              cep: postalCode,
              address: {
                cep: postalCode,
                logradouro: addressLine,
                numero: addressNumber,
                bairro: district,
                cidade: city,
                estado: stateCode,
              },
            }),
          });
          if (res.ok) {
            setCheckoutSession(await res.json());
          }
        } else if (checkoutStep === 'payment') {
          const res = await fetch(`/api/checkout/sessions/${checkoutSession.id}/payment`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              paymentMethod,
              paymentToken: `tok_boopay_${paymentMethod}`,
            }),
          });
          if (res.ok) {
            setCheckoutSession(await res.json());
          }
        }
        setCheckoutStep(nextStep);
      } catch {
        setCheckoutError('Não foi possível atualizar a cotação do checkout.');
      } finally {
        setCheckoutLoading(false);
      }
    },
    [
      addressLine,
      addressNumber,
      checkoutSession,
      checkoutStep,
      city,
      deliveryMethod,
      district,
      paymentMethod,
      postalCode,
      stateCode,
    ]
  );

  // Confirm order with explicit human confirmation guard-rail
  const confirmInvisibleOrder = useCallback(async () => {
    if (!checkoutSession) return;
    if (!explicitHumanCheck) {
      setCheckoutError(
        'Por segurança, marque a caixa de confirmação explícita antes de autorizar o pagamento.'
      );
      return;
    }

    setCheckoutLoading(true);
    setCheckoutError(null);

    try {
      const res = await fetch(`/api/checkout/sessions/${checkoutSession.id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          explicitConfirmation: true,
          quoteHash: checkoutSession.quoteHash,
          termsVersion: '2026-10',
          surface: 'nextjs-chat',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setCheckoutError(data.error || 'Erro ao confirmar o pedido.');
        return;
      }

      const confirmedOrder: OrderView = data.order || data;
      setLatestOrder(confirmedOrder);
      setActiveDialog(null);

      const activeConvId = await ensureSession(false, storeId);
      const cartRes = await fetch(`/api/cart?conversationId=${encodeURIComponent(activeConvId)}`);
      if (cartRes.ok) {
        setCart(await cartRes.json());
      }

      setMessages((prev) => [
        ...prev,
        {
          id: makeClientKey('order-confirmed'),
          role: 'assistant',
          content: `Pedido **${confirmedOrder.id}** confirmado com sucesso via Checkout Invisível Boopay! O pagamento foi aprovado e seu pedido já entrou no fluxo logístico.`,
          createdAt: new Date().toISOString(),
          orderWidget: confirmedOrder,
        },
      ]);
      scrollToBottom();
    } catch {
      setCheckoutError('Falha de rede ao confirmar o pedido.');
    } finally {
      setCheckoutLoading(false);
    }
  }, [checkoutSession, ensureSession, explicitHumanCheck, scrollToBottom, storeId]);

  // Advance order stage
  const refreshOrAdvanceOrder = useCallback(async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}/advance`, {
        method: 'POST',
      });
      if (res.ok) {
        const updatedOrder: OrderView = await res.json();
        setLatestOrder(updatedOrder);
        setMessages((prev) =>
          prev.map((m) =>
            m.orderWidget && m.orderWidget.id === orderId
              ? { ...m, orderWidget: updatedOrder }
              : m
          )
        );
      }
    } catch {
      // ignore
    }
  }, []);

  const itemCount = cart?.itemCount || 0;

  const journeyStep = useMemo(() => {
    if (latestOrder || checkoutSession) {
      return 3;
    }
    if (itemCount > 0) {
      return 2;
    }
    return 1;
  }, [checkoutSession, itemCount, latestOrder]);

  const activeConnector =
    STORE_CONNECTORS.find((c) => c.id === storeId) || STORE_CONNECTORS[0];

  return (
    <div className={`boopay-chat-page ${activeDialog ? 'has-dialog' : ''}`}>
      <a className="skip-link" href="#chat-prompt">
        Ir para a conversa
      </a>

      <div className="workspace app">
        {/* ==================== COLUNA ESQUERDA: RAIL ==================== */}
        <aside className="rail" aria-label="Navegação Boopay">
          <div className="rail-top">
            <a
              className="brand brand-plate"
              href="#top"
              onClick={(e) => e.preventDefault()}
              aria-label="Boopay, início"
            >
              <img
                src="/brand/boopay-dark-transparent.svg"
                alt="Boopay"
                width={142}
                height={42}
              />
              <span className="geo-score-badge">GEO 96%</span>
            </a>

            <button
              className="new-care"
              type="button"
              onClick={() => setActiveDialog('new')}
            >
              <span className="new-care-icon">+</span>
              <span>Nova conversa</span>
            </button>
          </div>

          <nav className="rail-journey" aria-label="Sua jornada">
            <p className="eyebrow rail-eyebrow">Sua jornada</p>
            <ol className="journey">
              <li
                className={`journey-step ${journeyStep === 1 ? 'is-active' : 'is-done'}`}
              >
                <span className="step-mark">{journeyStep > 1 ? '✓' : '1'}</span>
                <span className="step-copy">
                  <strong>Descoberta & GEO</strong>
                  <small>Catálogo pronto para IA</small>
                </span>
              </li>
              <li
                className={`journey-step ${
                  journeyStep === 2 ? 'is-active' : journeyStep > 2 ? 'is-done' : ''
                }`}
              >
                <span className="step-mark">{journeyStep > 2 ? '✓' : '2'}</span>
                <span className="step-copy">
                  <strong>Sua sacola ({itemCount})</strong>
                  <small>Escolher e ajustar combos</small>
                </span>
              </li>
              <li className={`journey-step ${journeyStep === 3 ? 'is-active' : ''}`}>
                <span className="step-mark">3</span>
                <span className="step-copy">
                  <strong>Checkout Invisível</strong>
                  <small>Confirmar e receber no chat</small>
                </span>
              </li>
            </ol>

            <p className="eyebrow rail-eyebrow" style={{ marginTop: 14 }}>
              Conector de Loja ({activeConnector.statusLabel})
            </p>
            <div className="connector-grid">
              {STORE_CONNECTORS.map((conn) => (
                <button
                  key={conn.id}
                  type="button"
                  className={`connector-btn ${storeId === conn.id ? 'is-active' : ''}`}
                  onClick={() => setStoreId(conn.id)}
                  title={`${conn.name} — ${conn.protocol}`}
                >
                  <span>{conn.name}</span>
                  <span className="connector-dot" />
                </button>
              ))}
            </div>
          </nav>

          <div className="rail-bottom">
            <section className="rail-help">
              <span className="rail-help-icon">⚡</span>
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
            </section>

            <button
              className="profile rail-user"
              type="button"
              onClick={() => setActiveDialog('profile')}
            >
              <span className="avatar avatar-sm">MS</span>
              <span className="rail-user-copy">
                <strong>{customerName}</strong>
                <small>
                  CEP {postalCode} · {city}/{stateCode}
                </small>
              </span>
              <span className="rail-user-chev">›</span>
            </button>

            <p className="rail-demo">Boopay MVP · Protocolos UCP / ACP</p>
          </div>
        </aside>

        {/* ==================== COLUNA CENTRAL: CHAT SHELL ==================== */}
        <section className="chat-shell" aria-label="Atendimento Conversacional Boopay">
          <header className="chat-header">
            <button
              className="icon-button icon-btn mobile-menu"
              type="button"
              title="Abrir navegação"
              aria-label="Abrir navegação"
              onClick={() => setActiveDialog('menu')}
            >
              ☰
            </button>

            <div className="chat-heading">
              <span className="live-mark" aria-hidden="true" />
              <div>
                <h1>Compra Assistida Boopay</h1>
                <p>Catálogo GEO (Score 96/100) · Checkout Invisível integrado</p>
              </div>
            </div>

            <div className="header-actions">
              <button
                className="location delivery-pill"
                type="button"
                onClick={() => setActiveDialog('profile')}
                title="Preferências e CEP"
              >
                <span>
                  📍 {postalCode} · {city}, {stateCode}
                </span>
              </button>

              <button
                className="avatar avatar-button"
                type="button"
                onClick={() => setActiveDialog('profile')}
                title="Perfil de compra"
                aria-label="Perfil de compra"
              >
                MS
              </button>

              <button
                className="icon-button icon-btn mobile-kit-btn"
                type="button"
                onClick={() => setActiveDialog('kit')}
                title="Abrir sua sacola"
                aria-label={`Abrir sua sacola, ${itemCount} itens`}
              >
                🛍️
                {itemCount > 0 && <span className="kit-badge">{itemCount}</span>}
              </button>
            </div>
          </header>

          <main
            className="chat-scroll"
            ref={chatScrollRef}
            tabIndex={0}
            aria-label="Histórico da conversa"
          >
            {messages.length === 0 && (
              <section className="welcome" aria-labelledby="welcome-title">
                <h2 id="welcome-title">
                  O que vamos <em>encontrar e fechar</em> hoje?
                  <span className="title-plus" aria-hidden="true">
                    +
                  </span>
                </h2>
                <p className="welcome-lede">
                  Conte o que você procura. Eu consulto o catálogo estruturado para IA, monto
                  combos com desconto real e concluo a compra <strong>com você</strong> — sem
                  redirecionamentos.
                </p>

                <div className="intent-grid" aria-label="Comece por um objetivo">
                  <button
                    className="intent-card"
                    type="button"
                    onClick={() =>
                      void sendMessage('Quero montar um kit de corrida de rua e academia')
                    }
                  >
                    <span className="intent-top">
                      <span className="intent-icon">🏃</span>
                      <span className="intent-arrow">→</span>
                    </span>
                    <h3>Performance & Corrida Urbana</h3>
                    <p>
                      Tênis Pulse Runner X1 + Smartband GPS + Garrafa Térmica Inox com 10% OFF no
                      combo.
                    </p>
                    <span className="intent-thumbs" aria-hidden="true">
                      <img
                        className="intent-thumb"
                        src="/products/pulse-runner.svg"
                        alt=""
                        width={40}
                        height={40}
                      />
                      <img
                        className="intent-thumb"
                        src="/products/smartband-gps.svg"
                        alt=""
                        width={40}
                        height={40}
                      />
                      <img
                        className="intent-thumb"
                        src="/products/thermo-bottle.svg"
                        alt=""
                        width={40}
                        height={40}
                      />
                    </span>
                  </button>

                  <button
                    className="intent-card"
                    type="button"
                    onClick={() =>
                      void sendMessage(
                        'Preciso de um kit para viagem e rotina híbrida'
                      )
                    }
                  >
                    <span className="intent-top">
                      <span className="intent-icon">💻</span>
                      <span className="intent-arrow">→</span>
                    </span>
                    <h3>Kit Nômade Digital & Viagem</h3>
                    <p>
                      Mochila Impermeável 24L + Fone Bluetooth ANC + Powerbank MagSafe com 12% OFF.
                    </p>
                    <span className="intent-thumbs" aria-hidden="true">
                      <img
                        className="intent-thumb"
                        src="/products/commuter-backpack.svg"
                        alt=""
                        width={40}
                        height={40}
                      />
                      <img
                        className="intent-thumb"
                        src="/products/anc-headphones.svg"
                        alt=""
                        width={40}
                        height={40}
                      />
                      <img
                        className="intent-thumb"
                        src="/products/powerbank-mag.svg"
                        alt=""
                        width={40}
                        height={40}
                      />
                    </span>
                  </button>

                  <button
                    className="intent-card"
                    type="button"
                    onClick={() =>
                      void sendMessage('Me recomende um kit para meu setup home office')
                    }
                  >
                    <span className="intent-top">
                      <span className="intent-icon">⌨️</span>
                      <span className="intent-arrow">→</span>
                    </span>
                    <h3>Estúdio Home Office & Produtividade</h3>
                    <p>
                      Teclado Mecânico Sem Fio 75% + Suporte Alumínio + Kit Café V60 com 10% OFF.
                    </p>
                    <span className="intent-thumbs" aria-hidden="true">
                      <img
                        className="intent-thumb"
                        src="/products/mech-keyboard.svg"
                        alt=""
                        width={40}
                        height={40}
                      />
                      <img
                        className="intent-thumb"
                        src="/products/laptop-stand.svg"
                        alt=""
                        width={40}
                        height={40}
                      />
                      <img
                        className="intent-thumb"
                        src="/products/coffee-kit.svg"
                        alt=""
                        width={40}
                        height={40}
                      />
                    </span>
                  </button>

                  <button
                    className="intent-card"
                    type="button"
                    onClick={() =>
                      void sendMessage(
                        'Auditar prontidão GEO e protocolos agênticos do catálogo'
                      )
                    }
                  >
                    <span className="intent-top">
                      <span className="intent-icon">🤖</span>
                      <span className="intent-arrow">→</span>
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
                  </button>
                </div>

                <div className="trust-row">
                  <span className="trust-item">🛡️ Cotação autoritativa SHA-256</span>
                  <span className="trust-item">✓ Você confirma cada etapa</span>
                  <button
                    className="trust-item"
                    type="button"
                    onClick={() => setActiveDialog('help')}
                  >
                    ⚡ Protocolos UCP / ACP ativos
                  </button>
                </div>
              </section>
            )}

            <div className="thread" role="log" aria-label="Mensagens" aria-live="off">
              {messages.map((message) => (
                <article
                  key={message.id}
                  className={`message msg ${
                    message.role === 'user' ? 'user-message msg-user' : 'msg-assistant'
                  }`}
                  data-status={message.streaming ? 'streaming' : 'complete'}
                >
                  {message.role === 'user' ? (
                    <>
                      <div className="user-bubble">{message.content}</div>
                      <span className="msg-meta">Agora</span>
                    </>
                  ) : (
                    <>
                      <span className="agent-avatar" aria-hidden="true">
                        <img
                          src="/brand/boo-eyes.svg"
                          alt=""
                          width={22}
                          height={15}
                        />
                      </span>
                      <div className="assistant-body">
                        <div className="assistant-meta">
                          <strong>Boopay AI</strong>
                          <span>Agora</span>
                        </div>

                        <div className="assistant-content">
                          {message.toolBanner && (
                            <ul className="tool-list" aria-label="Atividades do agente">
                              <li>
                                <span>⚡ {message.toolBanner}</span>
                              </li>
                            </ul>
                          )}

                          {message.content && (
                            <div className="prose assistant-text">
                              {message.content.split('\n').map((line, idx) => (
                                <p key={idx}>{renderFormattedLine(line)}</p>
                              ))}
                            </div>
                          )}

                          {/* Horizontal Product Rail */}
                          {message.products && message.products.length > 0 && (
                            <div className="product-rail">
                              {message.products.map((prod) => (
                                <article key={prod.id} className="product-card">
                                  <button
                                    className="product-media"
                                    type="button"
                                    onClick={() => {
                                      setSelectedProduct(prod);
                                      setActiveDialog('product');
                                    }}
                                  >
                                    <img
                                      src={prod.imageUrl}
                                      alt={prod.name}
                                      width={112}
                                      height={112}
                                    />
                                  </button>
                                  <span className="product-brand">
                                    {prod.brand} · GEO {prod.geoScore}
                                  </span>
                                  <h3 className="product-name">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSelectedProduct(prod);
                                        setActiveDialog('product');
                                      }}
                                    >
                                      {prod.name}
                                    </button>
                                  </h3>
                                  <div className="product-price-row">
                                    <strong className="product-price">
                                      {formatBRL(prod.priceCents)}
                                    </strong>
                                  </div>
                                  <button
                                    className="product-add"
                                    type="button"
                                    onClick={() =>
                                      enqueueCartMutation('add', {
                                        productRef: prod.id,
                                        qty: 1,
                                      })
                                    }
                                  >
                                    + Adicionar
                                  </button>
                                </article>
                              ))}
                            </div>
                          )}

                          {/* Kit / Bundle Agent Widget */}
                          {message.kit && (
                            <section className="agent-widget kit-card">
                              <div className="agent-widget-head">
                                <div className="widget-kicker-row">
                                  <span className="widget-kicker">
                                    ⚡ {message.kit.badge}
                                  </span>
                                  <span className="geo-score-badge">
                                    -{message.kit.discountPct}% OFF
                                  </span>
                                </div>
                                <h3>{message.kit.title}</h3>
                                <p>{message.kit.subtitle}</p>
                              </div>

                              {message.kit.items && message.kit.items.length > 0 && (
                                <div className="product-rail">
                                  {message.kit.items.map((prod) => (
                                    <article key={prod.productId} className="product-card">
                                      <div className="product-media">
                                        <img
                                          src={prod.imageUrl}
                                          alt={prod.name}
                                          width={112}
                                          height={112}
                                        />
                                      </div>
                                      <span className="product-brand">{prod.brand}</span>
                                      <h3 className="product-name">
                                        <button type="button">{prod.name}</button>
                                      </h3>
                                      <div className="product-price-row">
                                        <strong className="product-price">
                                          {formatBRL(prod.priceCents)}
                                        </strong>
                                      </div>
                                    </article>
                                  ))}
                                </div>
                              )}

                              <div className="agent-widget-foot">
                                <div>
                                  <strong>{formatBRL(message.kit.bundlePriceCents)}</strong>
                                  {message.kit.originalTotalCents && (
                                    <small
                                      style={{
                                        marginLeft: 8,
                                        textDecoration: 'line-through',
                                        color: 'var(--muted)',
                                      }}
                                    >
                                      {formatBRL(message.kit.originalTotalCents)}
                                    </small>
                                  )}
                                </div>
                                <button
                                  className="button button-primary"
                                  type="button"
                                  onClick={() =>
                                    enqueueCartMutation('add_bundle', {
                                      bundleId: message.kit!.id,
                                    })
                                  }
                                >
                                  Adicionar combo à sacola +
                                </button>
                              </div>
                            </section>
                          )}

                          {/* Inline Checkout Session Widget */}
                          {message.checkoutWidget && (
                            <section className="agent-widget checkout-agent-widget">
                              <div className="agent-widget-head">
                                <div className="widget-kicker-row">
                                  <span className="widget-kicker">
                                    🛡️ Protocolo Universal (UCP / ACP)
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
                                  Revisar e confirmar no painel →
                                </button>
                              </div>
                            </section>
                          )}

                          {/* Inline Order Tracking Widget */}
                          {message.orderWidget && (
                            <section className="agent-widget order-tracking-widget">
                              <div className="agent-widget-head">
                                <div className="widget-kicker-row">
                                  <span className="widget-kicker">
                                    📦 Rastreio Pós-Venda em Tempo Real
                                  </span>
                                  <span className="geo-score-badge">
                                    {message.orderWidget.status}
                                  </span>
                                </div>
                                <h3>
                                  Pedido {message.orderWidget.id} ·{' '}
                                  {formatBRL(message.orderWidget.totalCents)}
                                </h3>
                                <p>
                                  Protocolo {message.orderWidget.protocol.toUpperCase()} · Vínculo{' '}
                                  {message.orderWidget.externalOrderId}
                                </p>
                              </div>

                              <ol className="tracking-events">
                                {message.orderWidget.steps.map((ev) => (
                                  <li
                                    key={ev.code}
                                    className={ev.done || ev.current ? 'complete' : ''}
                                  >
                                    <span>{ev.done ? '✓' : ev.current ? '🚚' : '•'}</span>
                                    <div>
                                      <strong>{ev.label}</strong>
                                      <small style={{ display: 'block' }}>
                                        {ev.description}
                                      </small>
                                    </div>
                                  </li>
                                ))}
                              </ol>

                              <div className="agent-widget-foot">
                                <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                                  Atualização sincronizada no chat
                                </span>
                                <button
                                  className="button button-secondary"
                                  type="button"
                                  onClick={() =>
                                    void refreshOrAdvanceOrder(message.orderWidget!.id)
                                  }
                                >
                                  Avançar etapa logística →
                                </button>
                              </div>
                            </section>
                          )}

                          {/* Inline GEO Audit Widget */}
                          {message.geoAudit && (
                            <section className="agent-widget">
                              <div className="agent-widget-head">
                                <div className="widget-kicker-row">
                                  <span className="widget-kicker">
                                    🤖 Auditoria de Prontidão Agêntica (GEO)
                                  </span>
                                  <span className="geo-score-badge">
                                    Score Médio {message.geoAudit.overallScore}/100
                                  </span>
                                </div>
                                <h3>
                                  {message.geoAudit.eligibleCount} de{' '}
                                  {message.geoAudit.totalCount} SKUs prontos para agentes
                                </h3>
                                <p>
                                  Protocolos suportados:{' '}
                                  {message.geoAudit.protocols.join(' · ')}
                                </p>
                              </div>
                            </section>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </article>
              ))}
            </div>
          </main>

          {/* ==================== COMPOSER AREA ==================== */}
          <div className="composer-area">
            {latestOrder && (
              <div className="order-actions" aria-label="Pós-venda">
                <span>
                  <strong>{latestOrder.id}</strong> · {latestOrder.status}
                </span>
                <button
                  type="button"
                  className="button button-secondary button-sm"
                  onClick={() => void refreshOrAdvanceOrder(latestOrder.id)}
                >
                  Avançar simulação logística →
                </button>
              </div>
            )}

            <div className="quick-row" aria-label="Sugestões rápidas">
              {QUICK_SUGGESTIONS.map((chip, idx) => (
                <button
                  key={chip}
                  className={`quick-chip ${idx === 0 ? 'is-primary' : ''}`}
                  type="button"
                  disabled={isStreaming}
                  onClick={() => void sendMessage(chip)}
                >
                  {chip}
                </button>
              ))}
            </div>

            <form
              className="composer"
              onSubmit={(e) => {
                e.preventDefault();
                void sendMessage(composerText);
              }}
            >
              <button
                className="composer-icon"
                type="button"
                onClick={() => setActiveDialog('voice')}
                title="Comando de voz"
                aria-label="Comando de voz"
              >
                🎤
              </button>

              <label className="sr-only" htmlFor="chat-prompt">
                Escreva sua mensagem
              </label>
              <textarea
                ref={composerInputRef}
                id="chat-prompt"
                name="message"
                value={composerText}
                onChange={(e) => setComposerText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    void sendMessage(composerText);
                  }
                }}
                rows={1}
                maxLength={4000}
                placeholder="Peça uma recomendação, monte um combo ou diga 'Quero fechar no Pix'…"
              />

              <button
                className="send-button"
                type="submit"
                disabled={isStreaming || !composerText.trim()}
                aria-label="Enviar mensagem"
                title="Enviar mensagem"
              >
                ↑
              </button>
            </form>

            <p className="composer-note">
              🛡️ Checkout Invisível Boopay · Preços e descontos validados deterministicamente pelo
              servidor com confirmação humana explícita.
            </p>
          </div>
        </section>

        {/* ==================== COLUNA DIREITA: SACOLA & CONTEXTO ==================== */}
        <aside className="context" aria-label="Sua sacola e prontidão GEO">
          <div className="context-scroll">
            {/* PAINEL 1: SUA SACOLA */}
            <section className="panel-card" aria-label="Resumo da sacola">
              <header className="panel-head">
                <h2>Sua sacola</h2>
                <span className="panel-count">{itemCount}</span>
              </header>

              {itemCount === 0 ? (
                <div className="kit-empty">
                  <span className="kit-empty-icon">🛍️</span>
                  <strong>Sua sacola aparece aqui</strong>
                  <p>
                    A conversa e a sacola andam juntas. Adicione um item ou escolha um combo com
                    desconto automático.
                  </p>
                  <button
                    className="button button-secondary button-sm"
                    type="button"
                    onClick={() => composerInputRef.current?.focus()}
                  >
                    Continuar conversando
                  </button>
                </div>
              ) : (
                <>
                  <ul className="kit-lines">
                    {cart?.lines.map((line) => {
                      const refId = line.productRef || line.productId || line.name;
                      const unitCents = line.priceCents ?? line.unitPriceCents ?? 0;
                      const lineTotal =
                        line.lineTotalCents ??
                        line.totalCents ??
                        line.subtotalCents ??
                        unitCents * line.qty;
                      return (
                        <li key={refId} className="kit-line">
                          <div className="kit-line-media">
                            <img
                              src={line.imageUrl}
                              alt={line.name}
                              width={46}
                              height={46}
                            />
                          </div>
                          <div className="kit-line-copy">
                            <div className="kit-line-top">
                              <span className="kit-line-name">{line.name}</span>
                              <button
                                className="kit-line-remove"
                                type="button"
                                title="Remover da sacola"
                                onClick={() =>
                                  enqueueCartMutation('remove', {
                                    productRef: refId,
                                  })
                                }
                              >
                                ✕
                              </button>
                            </div>
                            {line.bundleId && (
                              <small className="kit-origin">Item de combo promocional</small>
                            )}
                            <div className="kit-line-bottom">
                              <strong className="kit-line-price">
                                {formatBRL(lineTotal)}
                              </strong>
                              <div className="qty">
                                <button
                                  type="button"
                                  title="Diminuir quantidade"
                                  onClick={() =>
                                    enqueueCartMutation('set_qty', {
                                      productRef: refId,
                                      qty: line.qty - 1,
                                    })
                                  }
                                >
                                  −
                                </button>
                                <output>{line.qty}</output>
                                <button
                                  type="button"
                                  title="Aumentar quantidade"
                                  onClick={() =>
                                    enqueueCartMutation('add', {
                                      productRef: refId,
                                      qty: 1,
                                    })
                                  }
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>

                  <div className="kit-summary">
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
                  </div>

                  <button
                    type="button"
                    className="button button-primary panel-cta"
                    disabled={isMutatingCart}
                    onClick={() => void openInvisibleCheckout()}
                  >
                    Fechar pedido →
                  </button>
                  <p className="panel-note">
                    Cotação #{cart?.quoteHash.slice(0, 8)} · Confirmação explícita no próximo
                    passo.
                  </p>
                </>
              )}
            </section>

            {/* PAINEL 2: PERFIL & PREFERÊNCIAS */}
            <section className="panel-card" aria-label="Perfil de compra">
              <div className="panel-head">
                <h2>Perfil & Entrega</h2>
                <button
                  className="panel-edit"
                  type="button"
                  onClick={() => setActiveDialog('profile')}
                >
                  Editar
                </button>
              </div>
              <div className="care-chips">
                <span className="care-chip">📍 CEP {postalCode}</span>
                <span className="care-chip">
                  ⚡{' '}
                  {paymentMethod === 'pix_sandbox'
                    ? 'Pix Instantâneo'
                    : paymentMethod === 'card_sandbox'
                    ? `Cartão •••• ${cardLast4}`
                    : 'Google Pay'}
                </span>
                <span className="care-chip">🚚 Entrega Expressa</span>
              </div>
              <p className="care-note">
                O Checkout Invisível pré-carrega seu CEP e preferência de pagamento para agilizar o
                fechamento em 3 passos.
              </p>
            </section>

            {/* PAINEL 3: PRONTIDÃO AGÊNTICA & GEO */}
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
            </section>
          </div>
        </aside>
      </div>

      {/* ==================== DIALOG MODALS ==================== */}
      {activeDialog && (
        <div
          className="dialog-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveDialog(null);
          }}
        >
          <dialog open className="dialog" aria-labelledby="modal-title">
            <div className="dialog-shell">
              <header className="dialog-header">
                <div>
                  <p>Boopay · Checkout Conversacional</p>
                  <h2 id="modal-title">
                    {activeDialog === 'checkout' && 'Vamos conferir e fechar seu pedido?'}
                    {activeDialog === 'product' && 'Detalhes e Sinais GEO do Produto'}
                    {activeDialog === 'profile' && 'Preferências de Entrega & Pagamento'}
                    {activeDialog === 'help' && 'Arquitetura GEO & Checkout Invisível'}
                    {activeDialog === 'voice' && 'Comando de Voz Boopay'}
                    {activeDialog === 'new' && 'Iniciar nova conversa?'}
                    {activeDialog === 'menu' && 'Navegação Boopay'}
                    {activeDialog === 'kit' && 'Sua sacola'}
                  </h2>
                </div>
                <button
                  className="icon-button"
                  type="button"
                  onClick={() => setActiveDialog(null)}
                  aria-label="Fechar"
                >
                  ✕
                </button>
              </header>

              <div className="dialog-body">
                {/* MODAL: CHECKOUT INVISÍVEL 3 ETAPAS */}
                {activeDialog === 'checkout' && (
                  <div className="checkout-widget">
                    <div className="widget-head">
                      <div className="checkout-top">
                        <div>
                          <span className="widget-kicker">
                            🛡️ Protocolo Universal (UCP / ACP)
                          </span>
                          <h3>Checkout Invisível</h3>
                        </div>
                        <span className="secure-tag">
                          Hash #{checkoutSession?.quoteHash?.slice(0, 8) || 'SHA256'}
                        </span>
                      </div>

                      <div className="checkout-steps" aria-label="Etapas do checkout">
                        <div
                          className={`checkout-step ${
                            checkoutStep === 'delivery' ? 'is-active' : 'is-done'
                          }`}
                        >
                          <i>{checkoutStep === 'delivery' ? '1' : '✓'}</i>
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
                          <i>{checkoutStep === 'review' ? '✓' : '2'}</i>
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
                      </div>
                    </div>

                    <div className="checkout-body">
                      {checkoutError && (
                        <div className="input-error" role="alert">
                          ⚠️ {checkoutError}
                        </div>
                      )}

                      {checkoutStep === 'delivery' && (
                        <>
                          <div className="checkout-section-title">
                            <h4>Como você quer receber?</h4>
                            <span>{itemCount} itens</span>
                          </div>

                          <div className="option-stack">
                            <label className="option-card">
                              <input
                                type="radio"
                                name="delivery"
                                checked={deliveryMethod === 'express'}
                                onChange={() => setDeliveryMethod('express')}
                              />
                              <span className="option-radio" />
                              <span className="option-copy">
                                <strong>Entrega Expressa Boopay (até 2h)</strong>
                                <small>Rastreio em tempo real na conversa</small>
                              </span>
                              <span className="option-price">R$ 18,90</span>
                            </label>

                            <label className="option-card">
                              <input
                                type="radio"
                                name="delivery"
                                checked={deliveryMethod === 'standard'}
                                onChange={() => setDeliveryMethod('standard')}
                              />
                              <span className="option-radio" />
                              <span className="option-copy">
                                <strong>Entrega Padrão (1–2 dias úteis)</strong>
                                <small>Grátis acima de R$ 299,00</small>
                              </span>
                              <span className="option-price">Grátis</span>
                            </label>

                            <label className="option-card">
                              <input
                                type="radio"
                                name="delivery"
                                checked={deliveryMethod === 'pickup'}
                                onChange={() => setDeliveryMethod('pickup')}
                              />
                              <span className="option-radio" />
                              <span className="option-copy">
                                <strong>Retirada Rápida no Hub Parceiro</strong>
                                <small>Pronto em 30 minutos</small>
                              </span>
                              <span className="option-price is-free">Grátis</span>
                            </label>
                          </div>

                          <div className="checkout-field-grid">
                            <label className="checkout-field">
                              CEP {cepLoading ? '(Buscando ViaCEP...)' : ''}
                              <input
                                value={postalCode}
                                onChange={(e) => void handleCepLookup(e.target.value)}
                                placeholder="00000-000"
                              />
                            </label>
                            <label className="checkout-field">
                              Bairro
                              <input
                                value={district}
                                onChange={(e) => setDistrict(e.target.value)}
                              />
                            </label>
                            <label className="checkout-field full">
                              Logradouro e número
                              <input
                                value={`${addressLine}, ${addressNumber}`}
                                onChange={(e) => setAddressLine(e.target.value)}
                              />
                            </label>
                            <label className="checkout-field">
                              Cidade
                              <input
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                              />
                            </label>
                            <label className="checkout-field">
                              UF
                              <input
                                value={stateCode}
                                onChange={(e) => setStateCode(e.target.value)}
                                maxLength={2}
                              />
                            </label>
                          </div>

                          <div className="checkout-actions">
                            <button
                              className="button button-primary"
                              type="button"
                              disabled={checkoutLoading}
                              onClick={() => void syncCheckoutStep('payment')}
                            >
                              Continuar para Pagamento →
                            </button>
                          </div>
                        </>
                      )}

                      {checkoutStep === 'payment' && (
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
                              <span className="option-icon">Pix</span>
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
                              <span className="option-icon">••••</span>
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
                              <span className="option-icon">GPay</span>
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
                              Revisar pedido →
                            </button>
                          </div>
                        </>
                      )}

                      {checkoutStep === 'review' && (
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
                              <span>Total Autoritativo</span>
                              <strong>{formatBRL(checkoutSession?.totalCents || 0)}</strong>
                            </div>
                          </div>

                          <label
                            className="attachment-consent"
                            style={{
                              marginTop: 12,
                              padding: 12,
                              borderRadius: 12,
                              background: '#eefde0',
                              border: '1.5px solid #68d317',
                              display: 'flex',
                              gap: 10,
                              alignItems: 'flex-start',
                              cursor: 'pointer',
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={explicitHumanCheck}
                              onChange={(e) => setExplicitHumanCheck(e.target.checked)}
                            />
                            <span>
                              <strong>Confirmação Humana Explícita:</strong> Confirmo que
                              revisei os itens, o endereço ({postalCode}) e autorizo o fechamento
                              do pedido no valor de{' '}
                              <strong>{formatBRL(checkoutSession?.totalCents || 0)}</strong>.
                            </span>
                          </label>

                          <div className="checkout-actions">
                            <button
                              className="button button-secondary"
                              type="button"
                              onClick={() => setCheckoutStep('payment')}
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
                                : 'Confirmar pedido ✓'}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* MODAL: DETALHE DO PRODUTO */}
                {activeDialog === 'product' && selectedProduct && (
                  <div className="detail-product">
                    <div className="detail-media">
                      <img
                        src={selectedProduct.imageUrl}
                        alt={selectedProduct.name}
                        width={180}
                        height={180}
                      />
                    </div>
                    <div>
                      <p className="detail-brand">
                        {selectedProduct.brand} · {selectedProduct.category} · GEO{' '}
                        {selectedProduct.geoScore}/100
                      </p>
                      <h3 className="detail-name">{selectedProduct.name}</h3>
                      <p className="detail-price">
                        {formatBRL(selectedProduct.priceCents)}
                      </p>
                      <p className="detail-desc">{selectedProduct.description}</p>
                      <p className="detail-desc" style={{ marginTop: 8 }}>
                        <strong>Por que recomendamos:</strong>{' '}
                        {selectedProduct.whyRecommended}
                      </p>
                      <div className="detail-actions" style={{ marginTop: 14 }}>
                        <button
                          className="button button-primary"
                          type="button"
                          onClick={() => {
                            enqueueCartMutation('add', {
                              productRef: selectedProduct.id,
                              qty: 1,
                            });
                            setActiveDialog(null);
                          }}
                        >
                          + Adicionar à sacola
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* MODAL: PERFIL */}
                {activeDialog === 'profile' && (
                  <form
                    className="profile-form"
                    onSubmit={(e) => {
                      e.preventDefault();
                      setActiveDialog(null);
                    }}
                  >
                    <label htmlFor="postal-code">CEP de Entrega</label>
                    <input
                      id="postal-code"
                      value={postalCode}
                      onChange={(e) => void handleCepLookup(e.target.value)}
                      placeholder="00000-000"
                    />
                    <label htmlFor="customer-name">Seu Nome</label>
                    <input
                      id="customer-name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                    />
                    <button className="primary" type="submit">
                      Salvar preferências ✓
                    </button>
                  </form>
                )}

                {/* MODAL: HELP / ARQUITETURA */}
                {activeDialog === 'help' && (
                  <div className="help-content">
                    <h3>Duas Frentes Integradas: GEO + Checkout Invisível</h3>
                    <p>
                      1. <strong>Catálogo Pronto para IA (GEO)</strong>: Sincronizamos produtos do
                      WooCommerce (via plugin HMAC) e conectores de e-commerce estruturando GTIN,
                      JSON-LD e disponibilidade em tempo real.
                    </p>
                    <p>
                      2. <strong>Checkout Invisível com Guarda-Rails</strong>: O cliente descobre,
                      monta combos e paga sem sair do chat, com cotação determinística SHA-256 e
                      confirmação humana explícita obrigatória.
                    </p>
                    <button
                      className="secondary"
                      type="button"
                      onClick={() => setActiveDialog(null)}
                    >
                      Voltar à conversa
                    </button>
                  </div>
                )}

                {/* MODAL: VOZ */}
                {activeDialog === 'voice' && (
                  <div className="help-content">
                    <p>
                      Escolha um comando de voz para testar a jornada conversacional Boopay:
                    </p>
                    <div className="option-stack">
                      {[
                        'Quero montar um kit de corrida de rua e academia',
                        'Preciso de mochila impermeável e fone ANC',
                        'Auditar prontidão GEO do catálogo',
                        'Quero fechar compra no Pix',
                      ].map((cmd) => (
                        <button
                          key={cmd}
                          type="button"
                          className="button button-secondary"
                          onClick={() => {
                            setActiveDialog(null);
                            void sendMessage(cmd);
                          }}
                        >
                          🎙️ &ldquo;{cmd}&rdquo;
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* MODAL: NOVA CONVERSA */}
                {activeDialog === 'new' && (
                  <div>
                    <p>
                      Deseja iniciar uma nova sessão conversacional com uma sacola limpa?
                    </p>
                    <div className="dialog-actions" style={{ marginTop: 16 }}>
                      <button
                        className="secondary"
                        type="button"
                        onClick={() => setActiveDialog(null)}
                      >
                        Manter conversa
                      </button>
                      <button
                        className="primary"
                        type="button"
                        onClick={() => {
                          setActiveDialog(null);
                          void ensureSession(true, storeId);
                        }}
                      >
                        Nova conversa +
                      </button>
                    </div>
                  </div>
                )}

                {/* MODAL: MENU / KIT MOBILE */}
                {(activeDialog === 'menu' || activeDialog === 'kit') && (
                  <div className="help-content">
                    <p>
                      Sacola atual: <strong>{itemCount} itens</strong> · Total:{' '}
                      <strong>{formatBRL(cart?.totalCents || 0)}</strong>
                    </p>
                    {itemCount > 0 && (
                      <button
                        className="primary"
                        type="button"
                        onClick={() => void openInvisibleCheckout()}
                      >
                        Fechar pedido no Checkout Invisível →
                      </button>
                    )}
                    <button
                      className="secondary"
                      type="button"
                      onClick={() => setActiveDialog(null)}
                    >
                      Voltar
                    </button>
                  </div>
                )}
              </div>
            </div>
          </dialog>
        </div>
      )}
    </div>
  );
}
