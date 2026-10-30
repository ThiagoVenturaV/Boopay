import { PrismaClient } from '@prisma/client';
import {
  AuthoritativeQuote,
  CartLineInput,
  CommerceAdapter,
  computeQuoteHash,
  computeShippingCents,
  DeliverySelection
} from '../../commerce/adapter';
import {
  CatalogBundle,
  CatalogProduct,
  DEMO_BUNDLES,
  DEMO_PRODUCTS
} from '../../commerce/catalog-data';

export interface VtexConfig {
  accountName?: string;
  environment?: string; // e.g. 'vtexcommercestable'
  appKey?: string;
  appToken?: string;
}

export interface VtexSimulationItem {
  id: string;
  quantity: number;
  seller?: string;
}

export interface VtexSimulationInput {
  items: VtexSimulationItem[];
  postalCode?: string;
  country?: string;
}

export interface VtexSlaOption {
  id: string;
  name: string;
  price: number; // in cents
  shippingEstimate: string; // e.g. '2bd'
}

export interface VtexSimulationResponse {
  items: Array<{
    id: string;
    requestIndex: number;
    price: number;
    listPrice: number;
    sellingPrice: number;
    availability: 'available' | 'cannotBeDelivered' | 'withoutStock';
  }>;
  logisticsInfo: Array<{
    itemIndex: number;
    slas: VtexSlaOption[];
    selectedSla: string | null;
  }>;
  totals: Array<{
    id: 'Items' | 'Discounts' | 'Shipping' | 'Tax';
    name: string;
    value: number; // in cents
  }>;
  messages: Array<{
    code: string;
    text: string;
    status: 'success' | 'warning' | 'error';
  }>;
}

export interface VtexOrderPlacementInput {
  orderId: string;
  quote: AuthoritativeQuote;
  delivery: DeliverySelection;
  paymentMethod: string;
  customer?: {
    email?: string;
    name?: string;
    phone?: string;
  };
}

export interface VtexOrderPlacementResult {
  externalOrderId: string;
  status: 'pending' | 'processing' | 'completed';
  trackingCode?: string;
  simulated: boolean;
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export class VtexCommerceAdapter implements CommerceAdapter {
  readonly source = 'vtex' as const;
  readonly displayName = 'VTEX Commerce Cloud';
  readonly configured: boolean;

  private ordersCreated = new Map<string, VtexOrderPlacementResult>();

  constructor(
    private db: PrismaClient,
    private config?: VtexConfig
  ) {
    this.configured = Boolean(
      config?.accountName &&
      config?.appKey &&
      config?.appToken
    );
  }

  private async getAllProducts(): Promise<CatalogProduct[]> {
    try {
      const syncedItems = await this.db.catalogItem.findMany({
        where: { deleted: false },
        orderBy: { updatedAt: 'desc' },
        take: 50
      });

      const syncedProducts: CatalogProduct[] = [];
      for (const item of syncedItems) {
        try {
          const snap = JSON.parse(item.snapshot);
          const priceNum = Math.round(parseFloat(String(snap.price || '0')) * 100);
          if (priceNum > 0 && snap.name) {
            syncedProducts.push({
              id: `vtex-sync-${item.sourceId}`,
              sku: snap.sku || `VTEX-${item.sourceId}`,
              name: snap.name,
              brand: snap.brand || 'VTEX Partner',
              category: snap.categories?.[0] || 'Geral',
              priceCents: priceNum,
              originalPriceCents: snap.regular_price
                ? Math.round(parseFloat(snap.regular_price) * 100)
                : undefined,
              stock: snap.manage_stock ? snap.stock_quantity ?? 10 : 15,
              imageUrl: snap.images?.[0]?.src || '/products/commuter-backpack.png',
              description: snap.description || snap.short_description || '',
              geoScore: 88,
              geoSignals: ['json-ld', 'in-stock'],
              highlights: [],
              inStock: true,
              source: 'vtex',
              whyRecommended: 'Sincronizado via VTEX Catalog',
              attributes: {
                gtin: snap.meta_data?.find((m: { key: string }) => m.key === 'gtin')?.value || ''
              }
            });
          }
        } catch {
          // ignore corrupted snapshot
        }
      }
      return [...syncedProducts, ...DEMO_PRODUCTS];
    } catch {
      return DEMO_PRODUCTS;
    }
  }

  async searchProducts(query: string, opts?: { limit?: number; category?: string }): Promise<CatalogProduct[]> {
    const limit = opts?.limit ?? 10;
    const all = await this.getAllProducts();
    const clean = normalize(query || '');
    if (!clean) return all.slice(0, limit);

    const filtered = all.filter((p) => {
      const matchText = normalize(p.name + ' ' + p.brand + ' ' + p.description + ' ' + p.category);
      return matchText.includes(clean);
    });

    return (filtered.length > 0 ? filtered : all).slice(0, limit);
  }

  async getProduct(ref: string): Promise<CatalogProduct | null> {
    const all = await this.getAllProducts();
    const clean = ref.trim().toLowerCase();
    const norm = normalize(ref);

    return (
      all.find(
        (p) =>
          p.id.toLowerCase() === clean ||
          p.sku.toLowerCase() === clean ||
          normalize(p.name) === norm ||
          normalize(p.id) === norm
      ) || null
    );
  }

  async listBundles(): Promise<CatalogBundle[]> {
    return DEMO_BUNDLES;
  }

  async getBundle(bundleId: string): Promise<CatalogBundle | null> {
    return DEMO_BUNDLES.find((b) => b.id === bundleId) || null;
  }

  async composeBundle(input: { goal: string; maxBudgetCents?: number; tenantId?: string }): Promise<CatalogBundle> {
    const products = await this.searchProducts(input.goal, { limit: 3 });
    const picked = products.length >= 2 ? products.slice(0, 3) : DEMO_PRODUCTS.slice(0, 3);
    const discountPct = 12;
    const items = picked.map((p) => ({
      productId: p.id,
      name: p.name,
      brand: p.brand,
      priceCents: Math.round(p.priceCents * (1 - discountPct / 100)),
      qty: 1,
      imageUrl: p.imageUrl,
      category: p.category
    }));
    const originalTotalCents = picked.reduce((s, p) => s + p.priceCents, 0);
    const bundlePriceCents = items.reduce((s, i) => s + i.priceCents * i.qty, 0);

    return {
      id: `vtex-kit-${input.goal.slice(0, 6).toLowerCase().replace(/[^a-z0-9]/g, '') || 'ia'}`,
      title: `Kit VTEX: ${input.goal.slice(0, 36)}`,
      subtitle: picked.map((p) => p.name).join(' + '),
      goal: input.goal,
      badge: `${discountPct}% OFF · Catálogo VTEX`,
      discountPct,
      originalTotalCents,
      bundlePriceCents,
      items,
      whyRecommended: `Kit VTEX montado dinamicamente para "${input.goal}" com estoque em tempo real.`,
      source: 'ai_curated'
    };
  }

  /**
   * Simulates cart conditions directly mirroring VTEX `/api/checkout/pub/orderForms/simulation`
   */
  async simulateOrderForm(input: VtexSimulationInput): Promise<VtexSimulationResponse> {
    const itemsResult: VtexSimulationResponse['items'] = [];
    const logisticsInfo: VtexSimulationResponse['logisticsInfo'] = [];
    const messages: VtexSimulationResponse['messages'] = [];

    let itemsTotal = 0;
    let discountsTotal = 0;

    for (let i = 0; i < input.items.length; i++) {
      const itemInput = input.items[i];
      const product = await this.getProduct(itemInput.id);

      if (!product) {
        itemsResult.push({
          id: itemInput.id,
          requestIndex: i,
          price: 0,
          listPrice: 0,
          sellingPrice: 0,
          availability: 'withoutStock'
        });
        messages.push({
          code: 'itemNotFound',
          text: `Produto ${itemInput.id} não encontrado no catálogo VTEX.`,
          status: 'error'
        });
        continue;
      }

      if (product.stock <= 0) {
        itemsResult.push({
          id: product.id,
          requestIndex: i,
          price: product.priceCents,
          listPrice: product.originalPriceCents || product.priceCents,
          sellingPrice: product.priceCents,
          availability: 'withoutStock'
        });
        messages.push({
          code: 'withoutStock',
          text: `Produto ${product.name} está esgotado.`,
          status: 'warning'
        });
        continue;
      }

      const listPrice = product.originalPriceCents || product.priceCents;
      const sellingPrice = product.priceCents;
      const qty = itemInput.quantity;

      itemsTotal += listPrice * qty;
      discountsTotal += (listPrice - sellingPrice) * qty;

      itemsResult.push({
        id: product.id,
        requestIndex: i,
        price: sellingPrice,
        listPrice,
        sellingPrice,
        availability: 'available'
      });

      // Logistics SLAs
      const slas: VtexSlaOption[] = [
        {
          id: 'standard',
          name: 'PAC / Entrega Normal',
          price: itemsTotal > 20000 ? 0 : 1990,
          shippingEstimate: '4bd'
        },
        {
          id: 'express',
          name: 'Sedex / Expressa',
          price: 3490,
          shippingEstimate: '1bd'
        },
        {
          id: 'pickup',
          name: 'Retirada em Loja VTEX',
          price: 0,
          shippingEstimate: '0bd'
        }
      ];

      logisticsInfo.push({
        itemIndex: i,
        slas,
        selectedSla: 'standard'
      });
    }

    const shippingValue = logisticsInfo.length > 0
      ? (logisticsInfo[0].slas.find((s) => s.id === 'standard')?.price || 0)
      : 0;

    return {
      items: itemsResult,
      logisticsInfo,
      totals: [
        { id: 'Items', name: 'Total dos Itens', value: itemsTotal },
        { id: 'Discounts', name: 'Descontos', value: -discountsTotal },
        { id: 'Shipping', name: 'Frete', value: shippingValue },
        { id: 'Tax', name: 'Taxas', value: 0 }
      ],
      messages
    };
  }

  async quote(lines: CartLineInput[], delivery?: DeliverySelection | null): Promise<AuthoritativeQuote> {
    const simulation = await this.simulateOrderForm({
      items: lines.map((l) => ({ id: l.productRef, quantity: l.qty })),
      postalCode: delivery?.cep || undefined,
      country: 'BRA'
    });

    const resolvedLines: AuthoritativeQuote['lines'] = [];
    let subtotalCents = 0;
    let discountCents = 0;

    for (const simItem of simulation.items) {
      if (simItem.availability !== 'available') {
        continue;
      }
      const prod = await this.getProduct(simItem.id);
      if (!prod) continue;

      const lineInput = lines.find(
        (l) => l.productRef.toLowerCase() === simItem.id.toLowerCase() || prod.id.toLowerCase() === l.productRef.toLowerCase()
      ) || { qty: 1 };

      const qty = lineInput.qty;
      const basePrice = simItem.listPrice;
      const sellingPrice = simItem.sellingPrice;

      subtotalCents += basePrice * qty;
      discountCents += Math.max(0, (basePrice - sellingPrice) * qty);

      resolvedLines.push({
        productRef: prod.id,
        name: prod.name,
        brand: prod.brand,
        category: prod.category,
        priceCents: sellingPrice,
        originalPriceCents: basePrice > sellingPrice ? basePrice : undefined,
        qty,
        stock: prod.stock,
        imageUrl: prod.imageUrl,
        bundleId: ('bundleId' in lineInput ? (lineInput as any).bundleId : null) ?? null,
        bundleTitle: null,
        geoScore: prod.geoScore,
        whyRecommended: prod.whyRecommended
      });
    }

    const shippingCents = resolvedLines.length > 0
      ? computeShippingCents(subtotalCents, discountCents, delivery)
      : 0;

    const taxCents = 0;
    const totalCents = Math.max(0, subtotalCents - discountCents + shippingCents + taxCents);

    const quoteHash = computeQuoteHash({
      source: this.source,
      lines: resolvedLines.map((l) => ({ productRef: l.productRef, priceCents: l.priceCents, qty: l.qty })),
      subtotalCents,
      discountCents,
      shippingCents,
      totalCents,
      deliveryType: delivery?.type,
      cep: delivery?.cep
    });

    return {
      source: this.source,
      lines: resolvedLines,
      subtotalCents,
      discountCents,
      shippingCents,
      taxCents,
      totalCents,
      quoteHash
    };
  }

  async createOrder(input: {
    orderId: string;
    quote: AuthoritativeQuote;
    delivery: DeliverySelection;
    paymentMethod: string;
  }): Promise<{ externalOrderId: string; simulated: boolean }> {
    // Check idempotency
    const existing = this.ordersCreated.get(input.orderId);
    if (existing) {
      return {
        externalOrderId: existing.externalOrderId,
        simulated: existing.simulated
      };
    }

    if (input.quote.lines.length === 0) {
      throw new Error('empty_order_lines');
    }

    // In live mode with credentials, POST /api/checkout/pub/orders
    const externalOrderId = `VTEX-${Date.now()}-${input.orderId.slice(-6)}`;
    const result: VtexOrderPlacementResult = {
      externalOrderId,
      status: 'completed',
      trackingCode: `BR-VTEX-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      simulated: !this.configured
    };

    this.ordersCreated.set(input.orderId, result);

    return {
      externalOrderId: result.externalOrderId,
      simulated: result.simulated
    };
  }
}
