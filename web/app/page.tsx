'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  AlertCircle,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Bot,
  Gift,
  Check,
  ChevronDown,
  ChevronRight,
  CreditCard,
  Keyboard,
  Laptop,
  Loader2,
  MapPin,
  Menu,
  MessageSquare,
  Mic,
  PanelLeftClose,
  PanelLeftOpen,
  MicOff,
  Package,
  Plus,
  QrCode,
  Radio,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Tag,
  Truck,
  Trash2,
  User,
  Volume2,
  X,
  Zap,
} from 'lucide-react';

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

type PaymentMethodType =
  | 'pix_sandbox'
  | 'card_sandbox'
  | 'apple_pay'
  | 'google_pay'
  | 'samsung_pay'
  | 'mercado_pago';

interface CheckoutUpsellItem {
  id: string;
  name: string;
  brand: string;
  originalPriceCents: number;
  dealPriceCents: number;
  discountPct: number;
  imageUrl: string;
  highlight: string;
}

const CHECKOUT_UPSELL_ITEMS: CheckoutUpsellItem[] = [
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
    protocol: 'Catálogo Próprio',
    statusLabel: '12 SKUs Ativos',
  },
  {
    id: 'woocommerce',
    name: 'WooCommerce',
    protocol: 'Sincronização Direta',
    statusLabel: 'Plugin Conectado',
  },
  {
    id: 'shopify',
    name: 'Shopify',
    protocol: 'Conexão Storefront',
    statusLabel: 'Adapter Ready',
  },
  {
    id: 'vtex',
    name: 'VTEX IO',
    protocol: 'Integração Oficial',
    statusLabel: 'Adapter Ready',
  },
];

const QUICK_SUGGESTIONS = [
  'Montar kit de corrida urbana com desconto',
  'Mochila + fone ANC para trabalho remoto',
  'Equipamentos para setup home office',
  'Quais são os itens mais vendidos?',
  'Ver opções para viagem',
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
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [conversations, setConversations] = useState<Array<{
    id: string;
    title: string;
    updatedAt: string;
    preview: string;
    itemCount: number;
    totalCents: number;
  }>>([
    {
      id: 'conv-corrida',
      title: 'Performance & Corrida Urbana',
      updatedAt: 'Agora',
      preview: 'Tênis Pulse Carbon Pro + Smartband',
      itemCount: 4,
      totalCents: 107780,
    },
    {
      id: 'conv-nomade',
      title: 'Kit Nômade Digital & Viagem',
      updatedAt: 'Hoje',
      preview: 'Mochila 24L + Fone Bluetooth ANC',
      itemCount: 3,
      totalCents: 94700,
    },
    {
      id: 'conv-homeoffice',
      title: 'Setup Home Office & Café V60',
      updatedAt: 'Ontem',
      preview: 'Teclado Mecânico 75% + Suporte Alumínio',
      itemCount: 3,
      totalCents: 73710,
    },
    {
      id: 'conv-presente',
      title: 'Sugestões de Presentes & Kits',
      updatedAt: '23 out',
      preview: 'Kit Café V60 + Garrafa Térmica',
      itemCount: 2,
      totalCents: 27450,
    },
  ]);
  const [activeConvId, setActiveConvId] = useState<string>('conv-corrida');
  const [isLiveMode, setIsLiveMode] = useState<boolean>(true);
  const [liveAudioActive, setLiveAudioActive] = useState<boolean>(false);
  const [liveTranscript, setLiveTranscript] = useState<string>('');
  const recognitionRef = useRef<any>(null);
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
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('pix_sandbox');
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
  }, []);
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

  // Modo de Voz Ao Vivo (Web Speech API com fallback de simulação)
  const toggleLiveVoice = useCallback(() => {
    if (liveAudioActive) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
        recognitionRef.current = null;
      }
      setLiveAudioActive(false);
      return;
    }

    setLiveAudioActive(true);
    setLiveTranscript('');

    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const rec = new SpeechRecognition();
          rec.lang = 'pt-BR';
          rec.continuous = true;
          rec.interimResults = true;

          rec.onresult = (event: any) => {
            let transcript = '';
            for (let i = 0; i < event.results.length; i++) {
              transcript += event.results[i][0].transcript;
            }
            if (transcript.trim()) {
              setLiveTranscript(transcript);
              setComposerText(transcript);
            }
          };

          rec.onerror = () => {
            // Mantém ativo em modo interativo
          };

          rec.onend = () => {
            // Continua ativo se usuário ainda estiver no modo
          };

          rec.start();
          recognitionRef.current = rec;
        } catch {
          // Fallback gracioso
        }
      }
    }
  }, [liveAudioActive]);

  const confirmLiveSpeech = useCallback(() => {
    const textToSend = liveTranscript.trim() || composerText.trim();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    setLiveAudioActive(false);
    if (textToSend) {
      setComposerText('');
      setLiveTranscript('');
      void sendMessage(textToSend);
    }
  }, [liveTranscript, composerText]);

  const cancelLiveSpeech = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    setLiveAudioActive(false);
    setLiveTranscript('');
  }, []);


  // Atalho global Ctrl+B / Cmd+B para alternar barra lateral
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setIsSidebarOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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
          toolBanner: 'Consultando catálogo de produtos disponíveis...',
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
    async (nextStep: 'delivery' | 'payment' | 'upsell' | 'review') => {
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
          content: `Pedido **${confirmedOrder.id}** confirmado com sucesso no Boopay! O pagamento foi aprovado e seu pedido já entrou no fluxo de entrega.`,
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

      <div className={`workspace app ${isSidebarOpen ? '' : 'sidebar-collapsed'}`}>

        {/* ==================== COLUNA ESQUERDA: RAIL ==================== */}
        <aside
          className={`rail ${isSidebarOpen ? '' : 'is-collapsed'}`}
          aria-label="Navegação Boopay"
        >
          <div className="rail-top">
            <div className="sidebar-top-row">
              <a
                className="brand brand-plate"
                href="#top"
                onClick={(e) => e.preventDefault()}
                aria-label="Boopay, início"
              >
                <img
                  src="/brand/boopay-dark-transparent.svg"
                  alt="Boopay"
                  width={132}
                  height={38}
                />
              </a>

              <button
                type="button"
                className="sidebar-close-btn"
                onClick={() => setIsSidebarOpen(false)}
                title="Recolher barra lateral (Ctrl+B)"
                aria-label="Recolher barra lateral"
              >
                <PanelLeftClose size={18} />
              </button>
            </div>

            <button
              className="new-care"
              type="button"
              onClick={() => {
                const newId = `conv-${Date.now()}`;
                const newConv = {
                  id: newId,
                  title: 'Nova conversa assistida',
                  updatedAt: 'Agora',
                  preview: 'Iniciando atendimento…',
                  itemCount: 0,
                  totalCents: 0,
                };
                setConversations((prev) => [newConv, ...prev]);
                setActiveConvId(newId);
                void ensureSession(true, storeId);
              }}
              title="Nova conversa (Ctrl+B abre/fecha o painel)"
            >
              <span className="new-care-icon"><Plus size={16} /></span>
              <span>Nova conversa</span>
              <kbd className="sidebar-kbd">Ctrl B</kbd>
            </button>
          </div>

          {/* LISTA DE CONVERSAS FEITAS (HISTÓRICO) */}
          <div className="sidebar-history-container">
            <div className="sidebar-history-header">
              <span className="eyebrow rail-eyebrow" style={{ margin: 0 }}>Conversas feitas</span>
              <span className="geo-score-badge" style={{ fontSize: 10 }}>{conversations.length}</span>
            </div>

            <div className="sidebar-history-list" role="list">
              {conversations.map((c) => {
                const isActive = activeConvId === c.id;
                return (
                  <div
                    key={c.id}
                    className={`sidebar-conv-item ${isActive ? 'is-active' : ''}`}
                    onClick={() => {
                      setActiveConvId(c.id);
                      if (!isActive) {
                        void ensureSession(true, storeId);
                        if (c.title.includes('Corrida')) {
                          void sendMessage('Quero montar um kit de corrida de rua e academia');
                        } else if (c.title.includes('Nômade')) {
                          void sendMessage('Preciso de um kit para viagem e rotina híbrida');
                        } else if (c.title.includes('Home Office')) {
                          void sendMessage('Me recomende um kit para meu setup home office');
                        } else if (c.title.includes('Presente')) {
                          void sendMessage('Me mostre opções de presentes e kits especiais');
                        }
                      }
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <MessageSquare size={15} className="sidebar-conv-icon" />
                    <div className="sidebar-conv-info">
                      <span className="sidebar-conv-title">{c.title}</span>
                      <span className="sidebar-conv-meta">
                        {c.itemCount > 0 ? `${c.itemCount} itens` : c.updatedAt} · {c.preview}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="sidebar-conv-del"
                      title="Excluir conversa"
                      onClick={(e) => {
                        e.stopPropagation();
                        setConversations((prev) => prev.filter((item) => item.id !== c.id));
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <nav className="rail-journey" aria-label="Sua jornada">
            <p className="eyebrow rail-eyebrow">Sua jornada</p>
            <ol className="journey">
              <li
                className={`journey-step ${journeyStep === 1 ? 'is-active' : 'is-done'}`}
              >
                <span className="step-mark">{journeyStep > 1 ? <Check size={14} /> : '1'}</span>
                <span className="step-copy">
                  <strong>Escolha de Produtos</strong>
                  <small>Recomendações sob medida</small>
                </span>
              </li>
              <li
                className={`journey-step ${
                  journeyStep === 2 ? 'is-active' : journeyStep > 2 ? 'is-done' : ''
                }`}
              >
                <span className="step-mark">{journeyStep > 2 ? <Check size={14} /> : '2'}</span>
                <span className="step-copy">
                  <strong>Sua sacola ({itemCount})</strong>
                  <small>Escolher e ajustar combos</small>
                </span>
              </li>
              <li className={`journey-step ${journeyStep === 3 ? 'is-active' : ''}`}>
                <span className="step-mark">3</span>
                <span className="step-copy">
                  <strong>Finalização Segura</strong>
                  <small>Revise e conclua seu pedido</small>
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
              <ChevronRight size={16} className="rail-user-chev" />
            </button>

            <p className="rail-demo">Boopay · Atendimento & Checkout Seguro</p>
          </div>
        </aside>

        {/* ==================== COLUNA CENTRAL: CHAT SHELL ==================== */}
        <section className="chat-shell" aria-label="Atendimento Conversacional Boopay">
          <header className="chat-header">
            <button
              className="sidebar-toggle-header-btn"
              type="button"
              onClick={() => setIsSidebarOpen((prev) => !prev)}
              title={isSidebarOpen ? 'Recolher barra lateral (Ctrl+B)' : 'Abrir barra lateral (Ctrl+B)'}
              aria-label="Alternar barra lateral"
            >
              {isSidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
            </button>

            <button
              className="icon-button icon-btn mobile-menu"
              type="button"
              title="Abrir navegação"
              aria-label="Abrir navegação"
              onClick={() => setActiveDialog('menu')}
            >
              <Menu size={20} />
            </button>

            <div className="chat-heading">
              <div>
                <h1>Atendimento Conversacional Boopay</h1>
                <p>Compre direto no chat · Entrega rápida · Pagamento seguro</p>
              </div>
            </div>

            <div className="header-actions">
              <button
                className="location delivery-pill"
                type="button"
                onClick={() => setActiveDialog('profile')}
                title="Preferências e CEP"
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <MapPin size={14} /> {postalCode} · {city}, {stateCode} <ChevronDown size={14} className="chev" />
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
                <ShoppingBag size={20} />
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
                      <span className="intent-icon"><Activity size={22} strokeWidth={2.2} /></span>
                      <span className="intent-arrow"><ArrowRight size={16} /></span>
                    </span>
                    <h3>Performance & Corrida Urbana</h3>
                    <p>
                      Tênis Pulse Runner X1 + Smartband GPS + Garrafa Térmica Inox com 10% OFF no
                      combo.
                    </p>
                    <span className="intent-thumbs" aria-hidden="true">
                      <img
                        className="intent-thumb"
                        src="/products/pulse-runner.png"
                        alt=""
                        width={40}
                        height={40}
                      />
                      <img
                        className="intent-thumb"
                        src="/products/smartband-gps.png"
                        alt=""
                        width={40}
                        height={40}
                      />
                      <img
                        className="intent-thumb"
                        src="/products/thermo-bottle.png"
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
                      <span className="intent-icon"><Laptop size={22} strokeWidth={2.2} /></span>
                      <span className="intent-arrow"><ArrowRight size={16} /></span>
                    </span>
                    <h3>Kit Nômade Digital & Viagem</h3>
                    <p>
                      Mochila Impermeável 24L + Fone Bluetooth ANC + Powerbank MagSafe com 12% OFF.
                    </p>
                    <span className="intent-thumbs" aria-hidden="true">
                      <img
                        className="intent-thumb"
                        src="/products/commuter-backpack.png"
                        alt=""
                        width={40}
                        height={40}
                      />
                      <img
                        className="intent-thumb"
                        src="/products/anc-headphones.png"
                        alt=""
                        width={40}
                        height={40}
                      />
                      <img
                        className="intent-thumb"
                        src="/products/powerbank-mag.png"
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
                      <span className="intent-icon"><Keyboard size={22} strokeWidth={2.2} /></span>
                      <span className="intent-arrow"><ArrowRight size={16} /></span>
                    </span>
                    <h3>Estúdio Home Office & Produtividade</h3>
                    <p>
                      Teclado Mecânico Sem Fio 75% + Suporte Alumínio + Kit Café V60 com 10% OFF.
                    </p>
                    <span className="intent-thumbs" aria-hidden="true">
                      <img
                        className="intent-thumb"
                        src="/products/mech-keyboard.png"
                        alt=""
                        width={40}
                        height={40}
                      />
                      <img
                        className="intent-thumb"
                        src="/products/laptop-stand.png"
                        alt=""
                        width={40}
                        height={40}
                      />
                      <img
                        className="intent-thumb"
                        src="/products/coffee-kit.png"
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
                  </button>
                </div>

                <div className="trust-row">
                  <span className="trust-item"><ShieldCheck size={15} style={{ marginRight: 6, color: '#00DAFA' }} /> Preço e estoque garantidos</span>
                  <span className="trust-item"><Check size={15} style={{ marginRight: 6, color: '#85FA2E' }} /> Confirmação segura no chat</span>
                  <button
                    className="trust-item"
                    type="button"
                    onClick={() => setActiveDialog('help')}
                  >
                    <Zap size={15} style={{ marginRight: 6, color: '#00DAFA' }} /> Como funciona a compra
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
                          <strong>Assistente Boopay</strong>
                          <span>Agora</span>
                        </div>

                        <div className="assistant-content">
                          {message.toolBanner && (
                            <ul className="tool-list" aria-label="Atividades do agente">
                              <li>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Zap size={13} style={{ color: '#85FA2E' }} /> {message.toolBanner}</span>
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
                                    {prod.brand} · {prod.category}
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
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Zap size={12} /> {message.kit.badge}</span>
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
                          )}

                          {/* Inline Order Tracking Widget */}
                          {message.orderWidget && (
                            <section className="agent-widget order-tracking-widget">
                              <div className="agent-widget-head">
                                <div className="widget-kicker-row">
                                  <span className="widget-kicker">
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Package size={15} /> Rastreio Pós-Venda em Tempo Real</span>
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
                                  Código de rastreamento: {message.orderWidget.externalOrderId}
                                </p>
                              </div>

                              <ol className="tracking-events">
                                {message.orderWidget.steps.map((ev) => (
                                  <li
                                    key={ev.code}
                                    className={ev.done || ev.current ? 'complete' : ''}
                                  >
                                    <span>{ev.done ? <Check size={13} /> : ev.current ? <Truck size={13} /> : '•'}</span>
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
                                  Avançar etapa logística <ArrowRight size={16} style={{ marginLeft: 6 }} />
                                </button>
                              </div>
                            </section>
                          )}

                          {/* Inline Catalog Status Widget */}
                          {message.geoAudit && (
                            <section className="agent-widget">
                              <div className="agent-widget-head">
                                <div className="widget-kicker-row">
                                  <span className="widget-kicker">
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Bot size={15} /> Catálogo Boopay</span>
                                  </span>
                                  <span className="status-pill" style={{ background: '#eefde0', color: '#166534', padding: '3px 8px', borderRadius: 999, fontSize: 11, fontWeight: 700 }}>
                                    Pronta Entrega
                                  </span>
                                </div>
                                <h3>
                                  {message.geoAudit.eligibleCount} de{' '}
                                  {message.geoAudit.totalCount} produtos disponíveis
                                </h3>
                                <p>
                                  Itens com pronta entrega, garantia de fábrica e nota fiscal.
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


            {liveAudioActive && (
              <div className="live-audio-dock">
                <div className="live-audio-dock-head">
                  <div className="live-audio-status">
                    <Mic size={16} />
                    <span>Ouvindo em tempo real…</span>
                    <div className="live-wave-bars">
                      <span className="wave-bar" />
                      <span className="wave-bar" />
                      <span className="wave-bar" />
                      <span className="wave-bar" />
                      <span className="wave-bar" />
                      <span className="wave-bar" />
                    </div>
                  </div>
                  <button
                    type="button"
                    className="live-cancel-speech-btn"
                    onClick={cancelLiveSpeech}
                    title="Fechar gravação de voz"
                  >
                    <X size={14} /> Fechar
                  </button>
                </div>
                <div className="live-transcript-box">
                  {liveTranscript || 'Fale seu objetivo agora ou escolha uma sugestão…'}
                </div>
                <div className="live-audio-actions">
                  <button
                    type="button"
                    className="live-send-speech-btn"
                    onClick={confirmLiveSpeech}
                  >
                    Enviar áudio para o Boo <ArrowUp size={14} />
                  </button>
                </div>
              </div>
            )}
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
                  Avançar simulação logística <ArrowRight size={16} style={{ marginLeft: 6 }} />
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
                className={`composer-icon ${liveAudioActive ? 'is-listening' : ''}`}
                type="button"
                onClick={toggleLiveVoice}
                title={liveAudioActive ? 'Parar microfone' : 'Falar por microfone'}
                aria-label={liveAudioActive ? 'Parar microfone' : 'Falar por microfone'}
              >
                <Mic size={18} />
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
                <ArrowUp size={18} />
              </button>
            </form>

            <p className="composer-note">
              <ShieldCheck size={14} style={{ marginRight: 6, display: 'inline-block', verticalAlign: 'middle' }} /> Compra Segura Boopay · Preços e estoque garantidos com confirmação antes do pagamento.
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
                  <span className="kit-empty-icon"><ShoppingBag size={40} strokeWidth={1.5} /></span>
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
                                <X size={15} />
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
                  </div>

                  <button
                    type="button"
                    className="button button-primary panel-cta"
                    disabled={isMutatingCart}
                    onClick={() => void openInvisibleCheckout()}
                  >
                    Fechar pedido <ArrowRight size={16} style={{ marginLeft: 6 }} />
                  </button>
                  <p className="panel-note">
                    Preço e estoque garantidos · Você revisa todos os dados antes de pagar.
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
                <span className="care-chip"><MapPin size={13} style={{ marginRight: 4 }} /> CEP {postalCode}</span>
                <span className="care-chip">
                  <Zap size={13} style={{ marginRight: 4 }} /> {paymentMethod === 'pix_sandbox' ? 'Pix Instantâneo' : paymentMethod === 'card_sandbox' ? `Cartão final ${cardLast4}` : 'Google Pay'}
                </span>
                <span className="care-chip"><Truck size={13} style={{ marginRight: 4 }} /> Entrega Expressa</span>
              </div>
              <p className="care-note">
                Preenchemos automaticamente seu endereço e pagamento para você finalizar seu pedido com rapidez e segurança.
              </p>
            </section>

            {/* PAINEL 3: GARANTIA & BENEFÍCIOS */}
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
                    {activeDialog === 'product' && 'Detalhes do Produto'}
                    {activeDialog === 'profile' && 'Preferências de Entrega & Pagamento'}
                    {activeDialog === 'help' && 'Como Funciona o Boopay'}
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
                  <X size={18} />
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
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><ShieldCheck size={14} /> Ambiente Seguro Criptografado</span>
                          </span>
                          <h3>Finalização do Pedido</h3>
                        </div>
                        <span className="secure-tag">
                          <ShieldCheck size={13} style={{ marginRight: 4, display: 'inline-block', verticalAlign: 'middle' }} /> Compra Protegida
                        </span>
                      </div>

                      <div className="checkout-steps" aria-label="Etapas do checkout">
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
                          <i>{checkoutStep === 'review' ? <Check size={12} /> : '2'}</i>
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
                        <div className="input-error" role="alert"><AlertCircle size={15} style={{ marginRight: 6 }} /> {checkoutError}</div>
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
                              Continuar para Pagamento <ArrowRight size={16} style={{ marginLeft: 6 }} />
                            </button>
                          </div>
                        </>
                      )}

                      {checkoutStep === 'payment' && (
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
                      )}

                      {checkoutStep === 'review' && (() => {
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
                              <strong>Confirmação do Pedido:</strong> Confirmo que
                              revisei os itens, o endereço ({postalCode}) e autorizo o fechamento
                              do pedido no valor de{' '}
                              <strong>{formatBRL(checkoutSession?.totalCents || 0)}</strong>.
                            </span>
                          </label>

                          <div className="checkout-actions">
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
                      })()}
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
                        {selectedProduct.brand} · {selectedProduct.category}
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
                      Salvar preferências <Check size={16} style={{ marginLeft: 6 }} />
                    </button>
                  </form>
                )}

                {/* MODAL: HELP / COMO FUNCIONA */}
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
                        'Quero ver kits com desconto',
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
                          <Mic size={16} style={{ marginRight: 8 }} /> &ldquo;{cmd}&rdquo;
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
                        Finalizar Compra <ArrowRight size={16} style={{ marginLeft: 6 }} />
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
