import { randomBytes } from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import {
  AuthoritativeQuote,
  CommerceAdapter,
  DeliverySelection,
  createCommerceAdapter
} from '../commerce/adapter';

export interface CartSnapshot {
  conversationId: string;
  cartVersion: number;
  source: string;
  lines: AuthoritativeQuote['lines'];
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
  status:
    | 'draft'
    | 'requires_information'
    | 'ready_for_confirmation'
    | 'confirmed'
    | 'payment_authorized'
    | 'completed'
    | 'failed'
    | 'canceled'
    | 'expired';
  deliveryType: 'express' | 'standard' | 'pickup' | null;
  cep: string | null;
  address: DeliverySelection['address'] | null;
  paymentMethod: 'pix_sandbox' | 'card_sandbox' | 'google_pay_sandbox' | 'apple_pay' | 'google_pay' | 'samsung_pay' | 'mercado_pago' | null;
  paymentToken: string | null;
  subtotalCents: number;
  discountCents: number;
  shippingCents: number;
  taxCents: number;
  totalCents: number;
  lines: AuthoritativeQuote['lines'];
  quoteVersion: number;
  quoteHash: string;
  confirmedAt: string | null;
  termsVersion: string | null;
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
  status: 'CONFIRMADO' | 'EM_SEPARACAO' | 'PRONTO_RETIRADA' | 'ENVIADO' | 'ENTREGUE' | 'CANCELADO';
  steps: Array<{
    code: string;
    label: string;
    description: string;
    done: boolean;
    current: boolean;
  }>;
  simulated: boolean;
  deliveryType: string;
  address: DeliverySelection['address'] | null;
  paymentMethod: string;
  paymentStatus: string;
  subtotalCents: number;
  discountCents: number;
  shippingCents: number;
  totalCents: number;
  lines: AuthoritativeQuote['lines'];
  quoteHash: string;
  confirmedAt: string;
  createdAt: string;
}

export class CheckoutService {
  constructor(private readonly db: PrismaClient) {}

  private getAdapter(source?: string): CommerceAdapter {
    return createCommerceAdapter(this.db, source);
  }

  async ensureConversation(input?: {
    conversationId?: string;
    tenantId?: string;
    storeSource?: string;
    customerCep?: string;
  }) {
    if (input?.conversationId) {
      const found = await this.db.conversation.findUnique({ where: { id: input.conversationId } });
      if (found) {
        if (
          (input.storeSource && input.storeSource !== found.storeSource) ||
          (input.customerCep && input.customerCep !== found.customerCep)
        ) {
          return this.db.conversation.update({
            where: { id: found.id },
            data: {
              storeSource: input.storeSource || found.storeSource,
              customerCep: input.customerCep ?? found.customerCep
            }
          });
        }
        return found;
      }
    }
    return this.db.conversation.create({
      data: {
        id: input?.conversationId || undefined,
        tenantId: input?.tenantId || 'demo-tenant',
        storeSource: input?.storeSource || process.env.BOOPAY_COMMERCE || 'demo',
        customerCep: input?.customerCep || '01310-100'
      }
    });
  }

  async getCartSnapshot(conversationId: string): Promise<CartSnapshot> {
    const conv = await this.ensureConversation({ conversationId });
    const adapter = this.getAdapter(conv.storeSource);
    const dbLines = await this.db.cartLine.findMany({
      where: { conversationId: conv.id },
      orderBy: { createdAt: 'asc' }
    });
    const quote = await adapter.quote(
      dbLines.map((l) => ({
        productRef: l.productRef,
        qty: l.qty,
        bundleId: l.bundleId
      })),
      conv.customerCep ? { type: 'standard', cep: conv.customerCep } : null
    );
    const itemCount = quote.lines.reduce((acc, l) => acc + l.qty, 0);
    return {
      conversationId: conv.id,
      cartVersion: conv.cartVersion,
      source: quote.source,
      lines: quote.lines,
      subtotalCents: quote.subtotalCents,
      discountCents: quote.discountCents,
      shippingCents: quote.shippingCents,
      totalCents: quote.totalCents,
      itemCount,
      quoteHash: quote.quoteHash
    };
  }

  async mutateCart(input: {
    conversationId: string;
    requestId?: string;
    action: 'add' | 'add_bundle' | 'set_qty' | 'remove' | 'clear';
    productRef?: string;
    bundleId?: string;
    qty?: number;
  }): Promise<CartSnapshot> {
    const conv = await this.ensureConversation({ conversationId: input.conversationId });
    if (input.requestId) {
      const existing = await this.db.cartMutation.findUnique({
        where: {
          conversationId_requestId: {
            conversationId: conv.id,
            requestId: input.requestId
          }
        }
      });
      if (existing) {
        return JSON.parse(existing.resultJson) as CartSnapshot;
      }
    }

    const adapter = this.getAdapter(conv.storeSource);

    if (input.action === 'clear') {
      await this.db.cartLine.deleteMany({ where: { conversationId: conv.id } });
    } else if (input.action === 'remove' && input.productRef) {
      await this.db.cartLine.deleteMany({
        where: { conversationId: conv.id, productRef: input.productRef }
      });
    } else if (input.action === 'set_qty' && input.productRef) {
      const targetQty = Math.max(0, Math.min(20, input.qty ?? 1));
      if (targetQty === 0) {
        await this.db.cartLine.deleteMany({
          where: { conversationId: conv.id, productRef: input.productRef }
        });
      } else {
        const product = await adapter.getProduct(input.productRef);
        if (product) {
          await this.db.cartLine.upsert({
            where: {
              conversationId_productRef: {
                conversationId: conv.id,
                productRef: product.id
              }
            },
            create: {
              conversationId: conv.id,
              productRef: product.id,
              name: product.name,
              brand: product.brand,
              category: product.category,
              priceCents: product.priceCents,
              originalPriceCents: product.originalPriceCents ?? null,
              qty: Math.min(targetQty, product.stock),
              stock: product.stock,
              imageUrl: product.imageUrl,
              source: product.source,
              geoScore: product.geoScore,
              whyRecommended: product.whyRecommended
            },
            update: {
              qty: Math.min(targetQty, product.stock)
            }
          });
        }
      }
    } else if (input.action === 'add' && input.productRef) {
      const product = await adapter.getProduct(input.productRef);
      if (product) {
        const current = await this.db.cartLine.findUnique({
          where: {
            conversationId_productRef: {
              conversationId: conv.id,
              productRef: product.id
            }
          }
        });
        const nextQty = Math.min(product.stock, (current?.qty ?? 0) + Math.max(1, input.qty ?? 1));
        await this.db.cartLine.upsert({
          where: {
            conversationId_productRef: {
              conversationId: conv.id,
              productRef: product.id
            }
          },
          create: {
            conversationId: conv.id,
            productRef: product.id,
            name: product.name,
            brand: product.brand,
            category: product.category,
            priceCents: product.priceCents,
            originalPriceCents: product.originalPriceCents ?? null,
            qty: nextQty,
            stock: product.stock,
            imageUrl: product.imageUrl,
            source: product.source,
            geoScore: product.geoScore,
            whyRecommended: product.whyRecommended
          },
          update: {
            qty: nextQty,
            bundleId: null,
            bundleTitle: null
          }
        });
      }
    } else if (input.action === 'add_bundle' && input.bundleId) {
      const bundle = await adapter.getBundle(input.bundleId);
      if (bundle) {
        for (const bItem of bundle.items) {
          const product = await adapter.getProduct(bItem.productId);
          if (!product) continue;
          const current = await this.db.cartLine.findUnique({
            where: {
              conversationId_productRef: {
                conversationId: conv.id,
                productRef: product.id
              }
            }
          });
          const nextQty = Math.min(product.stock, (current?.qty ?? 0) + bItem.qty);
          await this.db.cartLine.upsert({
            where: {
              conversationId_productRef: {
                conversationId: conv.id,
                productRef: product.id
              }
            },
            create: {
              conversationId: conv.id,
              productRef: product.id,
              name: product.name,
              brand: product.brand,
              category: product.category,
              priceCents: bItem.priceCents,
              originalPriceCents: product.originalPriceCents ?? product.priceCents,
              qty: nextQty,
              stock: product.stock,
              imageUrl: product.imageUrl,
              source: product.source,
              bundleId: bundle.id,
              bundleTitle: bundle.title,
              geoScore: product.geoScore,
              whyRecommended: bundle.whyRecommended
            },
            update: {
              qty: nextQty,
              priceCents: bItem.priceCents,
              bundleId: bundle.id,
              bundleTitle: bundle.title
            }
          });
        }
      }
    }

    await this.db.conversation.update({
      where: { id: conv.id },
      data: { cartVersion: { increment: 1 } }
    });

    // Sync any open checkout session so quoteVersion increments and quote stays authoritative
    const activeSession = await this.db.checkoutSession.findFirst({
      where: {
        conversationId: conv.id,
        status: { in: ['draft', 'requires_information', 'ready_for_confirmation'] }
      },
      orderBy: { updatedAt: 'desc' }
    });
    if (activeSession) {
      await this.refreshCheckoutSession(activeSession.id);
    }

    const snapshot = await this.getCartSnapshot(conv.id);

    if (input.requestId) {
      await this.db.cartMutation.create({
        data: {
          conversationId: conv.id,
          requestId: input.requestId,
          action: input.action,
          resultJson: JSON.stringify(snapshot)
        }
      });
    }

    return snapshot;
  }

  private formatSessionView(row: {
    id: string;
    conversationId: string;
    tenantId: string;
    protocol: string;
    surface: string;
    status: string;
    deliveryType: string | null;
    cep: string | null;
    addressJson: string | null;
    paymentMethod: string | null;
    paymentToken: string | null;
    subtotalCents: number;
    discountCents: number;
    shippingCents: number;
    taxCents: number;
    totalCents: number;
    itemsJson: string;
    quoteVersion: number;
    quoteHash: string;
    confirmedAt: Date | null;
    termsVersion: string | null;
    orderId: string | null;
  }): CheckoutSessionView {
    return {
      id: row.id,
      conversationId: row.conversationId,
      tenantId: row.tenantId,
      protocol: (row.protocol as CheckoutSessionView['protocol']) || 'chat',
      surface: row.surface,
      status: row.status as CheckoutSessionView['status'],
      deliveryType: (row.deliveryType as CheckoutSessionView['deliveryType']) || null,
      cep: row.cep,
      address: row.addressJson ? JSON.parse(row.addressJson) : null,
      paymentMethod: (row.paymentMethod as CheckoutSessionView['paymentMethod']) || null,
      paymentToken: row.paymentToken,
      subtotalCents: row.subtotalCents,
      discountCents: row.discountCents,
      shippingCents: row.shippingCents,
      taxCents: row.taxCents,
      totalCents: row.totalCents,
      lines: JSON.parse(row.itemsJson || '[]'),
      quoteVersion: row.quoteVersion,
      quoteHash: row.quoteHash,
      confirmedAt: row.confirmedAt ? row.confirmedAt.toISOString() : null,
      termsVersion: row.termsVersion,
      orderId: row.orderId
    };
  }

  async openOrUpdateSession(input: {
    conversationId: string;
    protocol?: 'chat' | 'acp' | 'ucp';
    surface?: string;
  }): Promise<CheckoutSessionView> {
    const conv = await this.ensureConversation({ conversationId: input.conversationId });
    const existing = await this.db.checkoutSession.findFirst({
      where: {
        conversationId: conv.id,
        status: { in: ['draft', 'requires_information', 'ready_for_confirmation'] }
      },
      orderBy: { updatedAt: 'desc' }
    });

    if (existing) {
      return this.refreshCheckoutSession(existing.id, input.protocol, input.surface);
    }

    const adapter = this.getAdapter(conv.storeSource);
    const dbLines = await this.db.cartLine.findMany({
      where: { conversationId: conv.id },
      orderBy: { createdAt: 'asc' }
    });
    const defaultDelivery: DeliverySelection = {
      type: 'express',
      cep: conv.customerCep || '01310-100',
      address: {
        cep: conv.customerCep || '01310-100',
        logradouro: 'Av. Paulista, 1000',
        bairro: 'Bela Vista',
        cidade: 'São Paulo',
        estado: 'SP'
      }
    };
    const quote = await adapter.quote(
      dbLines.map((l) => ({ productRef: l.productRef, qty: l.qty, bundleId: l.bundleId })),
      defaultDelivery
    );

    const status = quote.lines.length === 0 ? 'draft' : 'requires_information';
    const created = await this.db.checkoutSession.create({
      data: {
        conversationId: conv.id,
        tenantId: conv.tenantId,
        protocol: input.protocol || 'chat',
        surface: input.surface || 'boopay_sandbox',
        status,
        deliveryType: defaultDelivery.type,
        cep: defaultDelivery.cep,
        addressJson: JSON.stringify(defaultDelivery.address),
        paymentMethod: 'pix_sandbox',
        subtotalCents: quote.subtotalCents,
        discountCents: quote.discountCents,
        shippingCents: quote.shippingCents,
        taxCents: quote.taxCents,
        totalCents: quote.totalCents,
        itemsJson: JSON.stringify(quote.lines),
        quoteVersion: 1,
        quoteHash: quote.quoteHash
      }
    });

    return this.refreshCheckoutSession(created.id);
  }

  async refreshCheckoutSession(
    sessionId: string,
    protocolOverride?: string,
    surfaceOverride?: string
  ): Promise<CheckoutSessionView> {
    const row = await this.db.checkoutSession.findUniqueOrThrow({ where: { id: sessionId } });
    if (['completed', 'canceled', 'expired'].includes(row.status)) {
      return this.formatSessionView(row);
    }
    const conv = await this.ensureConversation({ conversationId: row.conversationId });
    const adapter = this.getAdapter(conv.storeSource);
    const dbLines = await this.db.cartLine.findMany({
      where: { conversationId: conv.id },
      orderBy: { createdAt: 'asc' }
    });

    const delivery: DeliverySelection | null = row.deliveryType
      ? {
          type: row.deliveryType as DeliverySelection['type'],
          cep: row.cep,
          address: row.addressJson ? JSON.parse(row.addressJson) : null
        }
      : null;

    const quote = await adapter.quote(
      dbLines.map((l) => ({ productRef: l.productRef, qty: l.qty, bundleId: l.bundleId })),
      delivery
    );

    const hasDelivery =
      Boolean(row.deliveryType) &&
      (row.deliveryType === 'pickup' || Boolean(row.cep && row.cep.replace(/\D/g, '').length >= 8));
    const hasPayment = Boolean(row.paymentMethod);
    const nextStatus =
      quote.lines.length === 0
        ? 'draft'
        : hasDelivery && hasPayment
          ? 'ready_for_confirmation'
          : 'requires_information';

    const quoteChanged = row.quoteHash !== quote.quoteHash;
    const updated = await this.db.checkoutSession.update({
      where: { id: row.id },
      data: {
        protocol: protocolOverride || row.protocol,
        surface: surfaceOverride || row.surface,
        status: nextStatus,
        subtotalCents: quote.subtotalCents,
        discountCents: quote.discountCents,
        shippingCents: quote.shippingCents,
        taxCents: quote.taxCents,
        totalCents: quote.totalCents,
        itemsJson: JSON.stringify(quote.lines),
        quoteVersion: quoteChanged ? row.quoteVersion + 1 : row.quoteVersion,
        quoteHash: quote.quoteHash
      }
    });

    return this.formatSessionView(updated);
  }

  async getSession(sessionId: string): Promise<CheckoutSessionView> {
    return this.refreshCheckoutSession(sessionId);
  }

  async setDelivery(
    sessionId: string,
    input: {
      deliveryType: 'express' | 'standard' | 'pickup';
      cep?: string;
      address?: DeliverySelection['address'];
    }
  ): Promise<CheckoutSessionView> {
    const row = await this.db.checkoutSession.findUniqueOrThrow({ where: { id: sessionId } });
    const cleanCep = (input.cep || row.cep || '01310-100').replace(/\D/g, '');
    const formattedCep = cleanCep.length === 8 ? `${cleanCep.slice(0, 5)}-${cleanCep.slice(5)}` : input.cep || '01310-100';
    const address =
      input.address ||
      (row.addressJson ? JSON.parse(row.addressJson) : null) || {
        cep: formattedCep,
        logradouro: input.deliveryType === 'pickup' ? 'Hub Boopay / Loja Parceira Centro' : 'Av. Paulista, 1000',
        bairro: 'Bela Vista',
        cidade: 'São Paulo',
        estado: 'SP'
      };

    await this.db.checkoutSession.update({
      where: { id: sessionId },
      data: {
        deliveryType: input.deliveryType,
        cep: formattedCep,
        addressJson: JSON.stringify({ ...address, cep: formattedCep })
      }
    });
    await this.db.conversation.update({
      where: { id: row.conversationId },
      data: { customerCep: formattedCep }
    });
    return this.refreshCheckoutSession(sessionId);
  }

  async setPayment(
    sessionId: string,
    input: {
      paymentMethod: 'pix_sandbox' | 'card_sandbox' | 'google_pay_sandbox' | 'apple_pay' | 'google_pay' | 'samsung_pay' | 'mercado_pago';
      paymentToken?: string;
    }
  ): Promise<CheckoutSessionView> {
    const token =
      input.paymentToken || `tok_sandbox_${input.paymentMethod}_${randomBytes(6).toString('hex')}`;
    await this.db.checkoutSession.update({
      where: { id: sessionId },
      data: {
        paymentMethod: input.paymentMethod,
        paymentToken: token
      }
    });
    return this.refreshCheckoutSession(sessionId);
  }

  async confirmAndComplete(
    sessionId: string,
    input: {
      explicitConfirmation: boolean;
      quoteHash?: string;
      termsVersion?: string;
      surface?: string;
    }
  ): Promise<{ session: CheckoutSessionView; order: OrderView }> {
    if (!input.explicitConfirmation) {
      throw new Error('explicit_human_confirmation_required');
    }

    const session = await this.refreshCheckoutSession(sessionId);

    // Idempotent return if already completed
    if (session.status === 'completed' && session.orderId) {
      const existingOrder = await this.getOrder(session.orderId);
      return { session, order: existingOrder };
    }

    if (session.lines.length === 0) {
      throw new Error('empty_cart');
    }
    if (!session.deliveryType || !session.paymentMethod) {
      throw new Error('checkout_requires_information');
    }
    if (input.quoteHash && input.quoteHash !== session.quoteHash) {
      throw new Error('quote_version_mismatch');
    }

    const conv = await this.ensureConversation({ conversationId: session.conversationId });
    const adapter = this.getAdapter(conv.storeSource);

    const now = new Date();
    const orderId = `BOO-${now.getFullYear()}-${randomBytes(3).toString('hex').toUpperCase()}`;

    const ext = await adapter.createOrder({
      orderId,
      quote: {
        source: adapter.source,
        lines: session.lines,
        subtotalCents: session.subtotalCents,
        discountCents: session.discountCents,
        shippingCents: session.shippingCents,
        taxCents: session.taxCents,
        totalCents: session.totalCents,
        quoteHash: session.quoteHash
      },
      delivery: {
        type: session.deliveryType,
        cep: session.cep,
        address: session.address
      },
      paymentMethod: session.paymentMethod
    });

    const createdOrder = await this.db.chatOrder.create({
      data: {
        id: orderId,
        conversationId: session.conversationId,
        checkoutSessionId: session.id,
        tenantId: session.tenantId,
        source: adapter.source,
        externalOrderId: ext.externalOrderId,
        protocol: session.protocol,
        surface: input.surface || session.surface,
        status: 'CONFIRMADO',
        simulated: ext.simulated,
        deliveryType: session.deliveryType,
        addressJson: JSON.stringify(session.address || {}),
        paymentMethod: session.paymentMethod,
        paymentStatus: 'PAID_SANDBOX',
        subtotalCents: session.subtotalCents,
        discountCents: session.discountCents,
        shippingCents: session.shippingCents,
        totalCents: session.totalCents,
        itemsJson: JSON.stringify(session.lines),
        quoteHash: session.quoteHash,
        confirmedAt: now
      }
    });

    const updatedSession = await this.db.checkoutSession.update({
      where: { id: session.id },
      data: {
        status: 'completed',
        confirmedAt: now,
        termsVersion: input.termsVersion || 'v1.0-sandbox-2026',
        surface: input.surface || session.surface,
        orderId: createdOrder.id
      }
    });

    // Clear cart after order completion
    await this.db.cartLine.deleteMany({ where: { conversationId: session.conversationId } });
    await this.db.conversation.update({
      where: { id: session.conversationId },
      data: { cartVersion: { increment: 1 } }
    });

    return {
      session: this.formatSessionView(updatedSession),
      order: this.formatOrderView(createdOrder)
    };
  }

  async cancelSession(sessionId: string): Promise<CheckoutSessionView> {
    const updated = await this.db.checkoutSession.update({
      where: { id: sessionId },
      data: { status: 'canceled' }
    });
    return this.formatSessionView(updated);
  }

  private formatOrderView(row: {
    id: string;
    conversationId: string;
    checkoutSessionId: string;
    source: string;
    externalOrderId: string | null;
    protocol: string;
    surface: string;
    status: string;
    simulated: boolean;
    deliveryType: string;
    addressJson: string;
    paymentMethod: string;
    paymentStatus: string;
    subtotalCents: number;
    discountCents: number;
    shippingCents: number;
    totalCents: number;
    itemsJson: string;
    quoteHash: string;
    confirmedAt: Date;
    createdAt: Date;
  }): OrderView {
    const isPickup = row.deliveryType === 'pickup';
    const stageOrder = isPickup
      ? [
          { code: 'CONFIRMADO', label: 'Pedido confirmado', description: 'Confirmação explícita e token sandbox validados' },
          { code: 'EM_SEPARACAO', label: 'Em separação na loja', description: 'Itens reservados no estoque autoritativo' },
          { code: 'PRONTO_RETIRADA', label: 'Pronto para retirada', description: 'Disponível no balcão Boopay Express com QR Code' },
          { code: 'ENTREGUE', label: 'Retirado pelo comprador', description: 'Jornada concluída sem redirecionamento' }
        ]
      : [
          { code: 'CONFIRMADO', label: 'Pedido confirmado', description: 'Confirmação explícita e token sandbox validados' },
          { code: 'EM_SEPARACAO', label: 'Em separação no hub', description: 'Itens reservados e nota fiscal em emissão' },
          { code: 'ENVIADO', label: 'Em rota de entrega', description: 'Transportadora parceira a caminho do endereço' },
          { code: 'ENTREGUE', label: 'Pedido entregue', description: 'Jornada concluída sem redirecionamento' }
        ];

    const currentIdx = Math.max(0, stageOrder.findIndex((s) => s.code === row.status));
    const steps = stageOrder.map((st, idx) => ({
      ...st,
      done: idx <= currentIdx,
      current: idx === currentIdx
    }));

    return {
      id: row.id,
      conversationId: row.conversationId,
      checkoutSessionId: row.checkoutSessionId,
      source: row.source,
      externalOrderId: row.externalOrderId,
      protocol: row.protocol,
      surface: row.surface,
      status: row.status as OrderView['status'],
      steps,
      simulated: row.simulated,
      deliveryType: row.deliveryType,
      address: row.addressJson ? JSON.parse(row.addressJson) : null,
      paymentMethod: row.paymentMethod,
      paymentStatus: row.paymentStatus,
      subtotalCents: row.subtotalCents,
      discountCents: row.discountCents,
      shippingCents: row.shippingCents,
      totalCents: row.totalCents,
      lines: JSON.parse(row.itemsJson || '[]'),
      quoteHash: row.quoteHash,
      confirmedAt: row.confirmedAt.toISOString(),
      createdAt: row.createdAt.toISOString()
    };
  }

  async getOrder(orderId: string): Promise<OrderView> {
    const row = await this.db.chatOrder.findUniqueOrThrow({ where: { id: orderId } });
    return this.formatOrderView(row);
  }

  async getLatestOrderForConversation(conversationId: string): Promise<OrderView | null> {
    const row = await this.db.chatOrder.findFirst({
      where: { conversationId },
      orderBy: { createdAt: 'desc' }
    });
    return row ? this.formatOrderView(row) : null;
  }

  async advanceOrderStatus(orderId: string): Promise<OrderView> {
    const row = await this.db.chatOrder.findUniqueOrThrow({ where: { id: orderId } });
    const isPickup = row.deliveryType === 'pickup';
    const sequence = isPickup
      ? ['CONFIRMADO', 'EM_SEPARACAO', 'PRONTO_RETIRADA', 'ENTREGUE']
      : ['CONFIRMADO', 'EM_SEPARACAO', 'ENVIADO', 'ENTREGUE'];
    const idx = sequence.indexOf(row.status);
    const nextStatus = idx >= 0 && idx < sequence.length - 1 ? sequence[idx + 1] : row.status;
    const updated = await this.db.chatOrder.update({
      where: { id: orderId },
      data: { status: nextStatus }
    });
    return this.formatOrderView(updated);
  }
}
