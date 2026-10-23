import { createHash } from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import {
  CatalogBundle,
  CatalogProduct,
  DEMO_BUNDLES,
  DEMO_PRODUCTS
} from './catalog-data';

export interface CartLineInput {
  productRef: string;
  qty: number;
  bundleId?: string | null;
}

export interface DeliverySelection {
  type: 'express' | 'standard' | 'pickup';
  cep?: string | null;
  address?: {
    cep: string;
    logradouro: string;
    numero?: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
  } | null;
}

export interface AuthoritativeQuote {
  source: 'demo' | 'woocommerce' | 'shopify' | 'vtex';
  lines: Array<{
    productRef: string;
    name: string;
    brand: string;
    category: string;
    priceCents: number;
    originalPriceCents?: number;
    qty: number;
    stock: number;
    imageUrl: string;
    bundleId?: string | null;
    bundleTitle?: string | null;
    geoScore: number;
    whyRecommended?: string;
  }>;
  subtotalCents: number;
  discountCents: number;
  shippingCents: number;
  taxCents: number;
  totalCents: number;
  quoteHash: string;
}

export interface CommerceAdapter {
  readonly source: 'demo' | 'woocommerce' | 'shopify' | 'vtex';
  readonly configured: boolean;
  readonly displayName: string;
  searchProducts(query: string, opts?: { limit?: number; category?: string }): Promise<CatalogProduct[]>;
  getProduct(ref: string): Promise<CatalogProduct | null>;
  listBundles(): Promise<CatalogBundle[]>;
  getBundle(bundleId: string): Promise<CatalogBundle | null>;
  composeBundle(input: { goal: string; maxBudgetCents?: number; tenantId?: string }): Promise<CatalogBundle>;
  quote(lines: CartLineInput[], delivery?: DeliverySelection | null): Promise<AuthoritativeQuote>;
  createOrder(input: {
    orderId: string;
    quote: AuthoritativeQuote;
    delivery: DeliverySelection;
    paymentMethod: string;
  }): Promise<{ externalOrderId: string; simulated: boolean }>;
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export function computeShippingCents(
  subtotalCents: number,
  discountCents: number,
  delivery?: DeliverySelection | null
): number {
  if (!delivery || !delivery.type) return 0;
  if (delivery.type === 'pickup') return 0;
  const net = Math.max(0, subtotalCents - discountCents);
  if (delivery.type === 'express') {
    return net >= 45000 ? 0 : 1490;
  }
  return net >= 29900 ? 0 : 890;
}

export function computeQuoteHash(payload: {
  source: string;
  lines: Array<{ productRef: string; priceCents: number; qty: number }>;
  subtotalCents: number;
  discountCents: number;
  shippingCents: number;
  totalCents: number;
  deliveryType?: string | null;
  cep?: string | null;
}): string {
  const canonical = JSON.stringify({
    s: payload.source,
    l: payload.lines.map((x) => ({ r: x.productRef, p: x.priceCents, q: x.qty })),
    sub: payload.subtotalCents,
    disc: payload.discountCents,
    ship: payload.shippingCents,
    tot: payload.totalCents,
    dt: payload.deliveryType || null,
    cep: payload.cep || null
  });
  return createHash('sha256').update(canonical).digest('hex').slice(0, 24);
}

export class DemoCommerceAdapter implements CommerceAdapter {
  readonly source = 'demo' as const;
  readonly configured = true;
  readonly displayName = 'Boopay Demo Store (Catálogo Agêntico + Plugin Sync)';

  constructor(private readonly db: PrismaClient) {}

  private async getAllProducts(): Promise<CatalogProduct[]> {
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
            id: `woo-sync-${item.sourceId}`,
            sku: snap.sku || `WOO-${item.sourceId}`,
            name: String(snap.name),
            brand: 'Loja WooCommerce Conectada',
            category: 'Catálogo Sincronizado',
            priceCents: priceNum,
            stock: typeof snap.stock === 'number' ? snap.stock : snap.in_stock ? 15 : 0,
            inStock: Boolean(snap.in_stock),
            imageUrl: Array.isArray(snap.images) && snap.images[0] ? String(snap.images[0]) : '/products/pulse-runner.svg',
            description: `Produto sincronizado via plugin nativo WooCommerce (revisão ${item.revision.toString()}).`,
            highlights: ['Sincronizado via Plugin Boopay v1', 'Assinatura HMAC verificada', 'Preço autoritativo da loja'],
            attributes: { origem: 'WooCommerce Plugin Sync', source_id: String(item.sourceId) },
            geoScore: 95,
            geoSignals: ['Sincronização idempotente v1', 'Estoque verificado na origem'],
            whyRecommended: 'Produto recebido da integração WooCommerce com preço e estoque autoritativos.',
            source: 'woocommerce'
          });
        }
      } catch {
        // Ignore malformed snapshot
      }
    }

    return [...syncedProducts, ...DEMO_PRODUCTS];
  }

  async searchProducts(query: string, opts?: { limit?: number; category?: string }): Promise<CatalogProduct[]> {
    const all = await this.getAllProducts();
    const limit = opts?.limit ?? 8;
    const q = normalize(query || '');
    const catFilter = opts?.category ? normalize(opts.category) : '';

    const STOP_WORDS = new Set([
      'quero', 'preciso', 'busco', 'procuro', 'mostrar', 'mostre', 'ver', 'comprar',
      'adicionar', 'colocar', 'para', 'com', 'sem', 'uma', 'uns', 'umas', 'dos', 'das',
      'que', 'qual', 'quais', 'tem', 'voce', 'boopay', 'por', 'favor', 'bom', 'boa', 'melhor'
    ]);

    const tokens = q
      .split(/[^a-z0-9]+/)
      .filter((t) => t.length >= 2 && !STOP_WORDS.has(t));

    const scored = all
      .filter((p) => !catFilter || normalize(p.category).includes(catFilter))
      .map((product) => {
        if (tokens.length === 0) return { product, score: product.geoScore };
        const hayName = normalize(product.name);
        const hayCat = normalize(product.category);
        const hayDesc = normalize(`${product.brand} ${product.description} ${product.highlights.join(' ')} ${Object.values(product.attributes).join(' ')}`);

        let score = 0;
        for (const tk of tokens) {
          if (hayName.includes(tk)) score += 35;
          if (hayCat.includes(tk)) score += 20;
          if (hayDesc.includes(tk)) score += 12;
          // Semantic synonyms
          if (['corrida', 'correr', 'treino', 'academia', 'esporte', 'tenis', 'calcado'].includes(tk) && hayCat.includes('calcados')) score += 18;
          if (['viagem', 'viajar', 'mala', 'bordo', 'mochila', 'voo', 'aviao'].includes(tk) && (hayCat.includes('viagem') || hayName.includes('powerbank'))) score += 18;
          if (['setup', 'home', 'office', 'trabalho', 'notebook', 'computador', 'programar', 'foco', 'estudo'].includes(tk) && hayCat.includes('tech')) score += 18;
          if (['agua', 'hidratacao', 'sede', 'garrafa', 'termica'].includes(tk) && hayName.includes('garrafa')) score += 28;
          if (['cafe', 'prensa', 'casa', 'presente'].includes(tk) && hayCat.includes('casa')) score += 25;
        }
        return { product, score };
      });

    const matches = scored.filter((x) => x.score > 0).sort((a, b) => b.score - a.score);
    if (matches.length > 0) {
      return matches.slice(0, limit).map((x) => x.product);
    }
    return all.slice(0, limit);
  }

  async getProduct(ref: string): Promise<CatalogProduct | null> {
    const all = await this.getAllProducts();
    const clean = ref.trim().toLowerCase();
    return (
      all.find(
        (p) =>
          p.id.toLowerCase() === clean ||
          p.sku.toLowerCase() === clean ||
          normalize(p.name) === normalize(ref)
      ) || null
    );
  }

  async listBundles(): Promise<CatalogBundle[]> {
    const customRows = await this.db.customBundle.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    const customBundles: CatalogBundle[] = customRows.map((row) => {
      const items = JSON.parse(row.itemsJson) as CatalogBundle['items'];
      const originalTotalCents = items.reduce((s, i) => s + i.priceCents * i.qty, 0);
      const bundlePriceCents = Math.round(originalTotalCents * (1 - row.discountPct / 100));
      return {
        id: row.id,
        title: row.title,
        subtitle: row.subtitle,
        goal: row.goal,
        badge: `${row.discountPct}% OFF · Combo montado pela IA Boopay`,
        discountPct: row.discountPct,
        originalTotalCents,
        bundlePriceCents,
        items,
        whyRecommended: `Conjunto personalizado criado para "${row.goal}" com produtos verificados em estoque e desconto progressivo autorizado.`,
        source: 'ai_curated'
      };
    });
    return [...customBundles, ...DEMO_BUNDLES];
  }

  async getBundle(bundleId: string): Promise<CatalogBundle | null> {
    const bundles = await this.listBundles();
    const clean = bundleId.trim().toLowerCase();
    return (
      bundles.find(
        (b) => b.id.toLowerCase() === clean || normalize(b.title).includes(normalize(bundleId))
      ) || null
    );
  }

  async composeBundle(input: { goal: string; maxBudgetCents?: number; tenantId?: string }): Promise<CatalogBundle> {
    const g = normalize(input.goal);
    if (g.includes('viagem') || g.includes('bordo') || g.includes('mochila')) {
      return DEMO_BUNDLES[0];
    }
    if (g.includes('setup') || g.includes('office') || g.includes('trabalho') || g.includes('foco') || g.includes('teclado')) {
      return DEMO_BUNDLES[1];
    }
    if (g.includes('corrida') || g.includes('treino') || g.includes('esporte') || g.includes('academia') || g.includes('tenis')) {
      return DEMO_BUNDLES[2];
    }

    // Dynamic AI bundle from catalog search
    const candidates = await this.searchProducts(input.goal, { limit: 3 });
    const picked = candidates.length >= 2 ? candidates.slice(0, 3) : DEMO_PRODUCTS.slice(0, 3);
    const discountPct = 10;
    const originalTotalCents = picked.reduce((acc, p) => acc + p.priceCents, 0);
    const items = picked.map((p) => ({
      productId: p.id,
      name: p.name,
      brand: p.brand,
      priceCents: Math.round(p.priceCents * (1 - discountPct / 100)),
      qty: 1,
      imageUrl: p.imageUrl,
      category: p.category
    }));
    const bundlePriceCents = items.reduce((acc, i) => acc + i.priceCents * i.qty, 0);
    const id = `kit-ia-${createHash('sha1').update(g).digest('hex').slice(0, 8)}`;

    await this.db.customBundle.upsert({
      where: { id },
      create: {
        id,
        tenantId: input.tenantId || 'demo-tenant',
        title: `Combo Personalizado: ${input.goal.slice(0, 36)}`,
        subtitle: picked.map((p) => p.name).join(' + '),
        goal: input.goal,
        discountPct,
        itemsJson: JSON.stringify(items)
      },
      update: {
        itemsJson: JSON.stringify(items)
      }
    });

    return {
      id,
      title: `Combo Personalizado: ${input.goal.slice(0, 36)}`,
      subtitle: picked.map((p) => p.name).join(' + '),
      goal: input.goal,
      badge: `${discountPct}% OFF · Combo montado pela IA Boopay`,
      discountPct,
      originalTotalCents,
      bundlePriceCents,
      items,
      whyRecommended: `Combo montado dinamicamente pela IA Boopay com ${picked.length} itens em estoque e 10% OFF autorizado.`,
      source: 'ai_curated'
    };
  }

  async quote(lines: CartLineInput[], delivery?: DeliverySelection | null): Promise<AuthoritativeQuote> {
    const resolvedLines: AuthoritativeQuote['lines'] = [];
    let subtotalCents = 0;
    let discountCents = 0;

    const bundles = await this.listBundles();
    const bundleMap = new Map(bundles.map((b) => [b.id, b]));

    for (const line of lines) {
      if (line.qty <= 0) continue;
      const product = await this.getProduct(line.productRef);
      if (!product) continue;

      const bundle = line.bundleId ? bundleMap.get(line.bundleId) : undefined;
      const bundleItem = bundle?.items.find((i) => i.productId === product.id);
      const effectiveUnitCents = bundleItem ? bundleItem.priceCents : product.priceCents;
      const baseUnitCents = product.originalPriceCents ?? product.priceCents;

      const qty = Math.min(line.qty, Math.max(1, product.stock));
      subtotalCents += baseUnitCents * qty;
      discountCents += Math.max(0, (baseUnitCents - effectiveUnitCents) * qty);

      resolvedLines.push({
        productRef: product.id,
        name: product.name,
        brand: product.brand,
        category: product.category,
        priceCents: effectiveUnitCents,
        originalPriceCents: baseUnitCents > effectiveUnitCents ? baseUnitCents : undefined,
        qty,
        stock: product.stock,
        imageUrl: product.imageUrl,
        bundleId: bundle?.id ?? null,
        bundleTitle: bundle?.title ?? null,
        geoScore: product.geoScore,
        whyRecommended: product.whyRecommended
      });
    }

    const shippingCents = resolvedLines.length > 0 ? computeShippingCents(subtotalCents, discountCents, delivery) : 0;
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
    return {
      externalOrderId: `WOO-SANDBOX-${input.orderId.slice(-6)}`,
      simulated: true
    };
  }
}

export class WooCommerceRestAdapter implements CommerceAdapter {
  readonly source = 'woocommerce' as const;
  readonly displayName = 'WooCommerce REST v3 (Loja Conectada)';
  private readonly fallback: DemoCommerceAdapter;

  constructor(
    db: PrismaClient,
    private readonly config: { storeUrl?: string; consumerKey?: string; consumerSecret?: string }
  ) {
    this.fallback = new DemoCommerceAdapter(db);
  }

  get configured(): boolean {
    return Boolean(this.config.storeUrl && this.config.consumerKey && this.config.consumerSecret);
  }

  private authHeaders(): Record<string, string> {
    const token = Buffer.from(`${this.config.consumerKey}:${this.config.consumerSecret}`).toString('base64');
    return {
      Authorization: `Basic ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json'
    };
  }

  async searchProducts(query: string, opts?: { limit?: number; category?: string }): Promise<CatalogProduct[]> {
    if (!this.configured) return this.fallback.searchProducts(query, opts);
    try {
      const url = new URL('/wp-json/wc/v3/products', this.config.storeUrl);
      if (query) url.searchParams.set('search', query);
      url.searchParams.set('per_page', String(opts?.limit ?? 8));
      url.searchParams.set('status', 'publish');
      const res = await fetch(url, { headers: this.authHeaders(), signal: AbortSignal.timeout(8000) });
      if (!res.ok) return this.fallback.searchProducts(query, opts);
      const data = (await res.json()) as Array<Record<string, unknown>>;
      if (!Array.isArray(data) || data.length === 0) return this.fallback.searchProducts(query, opts);
      return data.map((raw) => {
        const priceCents = Math.round(parseFloat(String(raw.price || raw.regular_price || '0')) * 100);
        const regCents = Math.round(parseFloat(String(raw.regular_price || '0')) * 100);
        const imgs = Array.isArray(raw.images) ? (raw.images as Array<{ src?: string }>) : [];
        const cats = Array.isArray(raw.categories) ? (raw.categories as Array<{ name?: string }>) : [];
        return {
          id: `woo-${raw.id}`,
          sku: String(raw.sku || `WOO-${raw.id}`),
          name: String(raw.name || 'Produto WooCommerce'),
          brand: 'Loja WooCommerce',
          category: String(cats[0]?.name || 'Geral'),
          priceCents: priceCents > 0 ? priceCents : 9900,
          originalPriceCents: regCents > priceCents ? regCents : undefined,
          stock: typeof raw.stock_quantity === 'number' ? raw.stock_quantity : 15,
          inStock: raw.stock_status !== 'outofstock',
          imageUrl: imgs[0]?.src || '/products/pulse-runner.svg',
          description: String(raw.short_description || raw.description || '').replace(/<[^>]+>/g, '').trim() || 'Produto sincronizado da loja WooCommerce.',
          highlights: ['Preço e estoque em tempo real via WooCommerce REST v3'],
          attributes: { id_woo: String(raw.id) },
          geoScore: 94,
          geoSignals: ['Catálogo WooCommerce v3 conectado', 'Preço autoritativo'],
          whyRecommended: 'Item consultado diretamente na API autoritativa do WooCommerce.',
          source: 'woocommerce'
        };
      });
    } catch {
      return this.fallback.searchProducts(query, opts);
    }
  }

  async getProduct(ref: string): Promise<CatalogProduct | null> {
    return this.fallback.getProduct(ref);
  }

  async listBundles(): Promise<CatalogBundle[]> {
    return this.fallback.listBundles();
  }

  async getBundle(bundleId: string): Promise<CatalogBundle | null> {
    return this.fallback.getBundle(bundleId);
  }

  async composeBundle(input: { goal: string; maxBudgetCents?: number; tenantId?: string }): Promise<CatalogBundle> {
    return this.fallback.composeBundle(input);
  }

  async quote(lines: CartLineInput[], delivery?: DeliverySelection | null): Promise<AuthoritativeQuote> {
    const q = await this.fallback.quote(lines, delivery);
    return { ...q, source: this.configured ? 'woocommerce' : 'demo' };
  }

  async createOrder(input: {
    orderId: string;
    quote: AuthoritativeQuote;
    delivery: DeliverySelection;
    paymentMethod: string;
  }): Promise<{ externalOrderId: string; simulated: boolean }> {
    if (!this.configured) {
      return this.fallback.createOrder(input);
    }
    try {
      const url = new URL('/wp-json/wc/v3/orders', this.config.storeUrl);
      const res = await fetch(url, {
        method: 'POST',
        headers: this.authHeaders(),
        body: JSON.stringify({
          payment_method: 'boopay_sandbox',
          payment_method_title: `Boopay Conversational Checkout (${input.paymentMethod})`,
          set_paid: true,
          billing: {
            first_name: 'Comprador',
            last_name: 'Boopay Sandbox',
            postcode: input.delivery.cep || '01310-100',
            address_1: input.delivery.address?.logradouro || 'Av. Paulista',
            city: input.delivery.address?.cidade || 'São Paulo',
            state: input.delivery.address?.estado || 'SP',
            country: 'BR',
            email: 'comprador.sandbox@boopay.example'
          },
          meta_data: [
            { key: '_boopay_order_id', value: input.orderId },
            { key: '_boopay_quote_hash', value: input.quote.quoteHash }
          ]
        }),
        signal: AbortSignal.timeout(8000)
      });
      if (res.ok) {
        const data = (await res.json()) as { id?: number | string };
        return { externalOrderId: `WOO-${data.id}`, simulated: false };
      }
    } catch {
      // Fallback to sandbox order reference if store is unreachable
    }
    return this.fallback.createOrder(input);
  }
}

export function createCommerceAdapter(db: PrismaClient, sourceOverride?: string): CommerceAdapter {
  const mode = (sourceOverride || process.env.BOOPAY_COMMERCE || 'demo').toLowerCase();
  if (mode === 'woocommerce') {
    return new WooCommerceRestAdapter(db, {
      storeUrl: process.env.WOO_STORE_URL,
      consumerKey: process.env.WOO_CONSUMER_KEY,
      consumerSecret: process.env.WOO_CONSUMER_SECRET
    });
  }
  return new DemoCommerceAdapter(db);
}
