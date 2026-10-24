import { randomUUID } from 'node:crypto';
import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { CheckoutService } from '../checkout/checkout-service';
import { ConversationalAgent, DEFAULT_GROQ_MODEL } from '../chat/agent';
import { createCommerceAdapter } from '../commerce/adapter';

const chatStreamSchema = z.object({
  conversationId: z.string().optional(),
  requestId: z.string().min(1).max(120).optional(),
  message: z.string().min(1).max(4000),
  storeSource: z.enum(['demo', 'woocommerce', 'shopify', 'vtex']).optional(),
  cep: z.string().max(20).optional()
});

const cartMutateSchema = z.object({
  conversationId: z.string().min(1),
  requestId: z.string().min(1).max(120).optional(),
  action: z.enum(['add', 'add_bundle', 'set_qty', 'remove', 'clear']),
  productRef: z.string().optional(),
  bundleId: z.string().optional(),
  qty: z.number().int().min(0).max(50).optional()
});

const deliverySchema = z.object({
  deliveryType: z.enum(['express', 'standard', 'pickup']),
  cep: z.string().optional(),
  address: z
    .object({
      cep: z.string(),
      logradouro: z.string(),
      numero: z.string().optional(),
      complemento: z.string().optional(),
      bairro: z.string(),
      cidade: z.string(),
      estado: z.string()
    })
    .optional()
});

const paymentSchema = z.object({
  paymentMethod: z.enum(['pix_sandbox', 'card_sandbox', 'google_pay_sandbox', 'apple_pay', 'google_pay', 'samsung_pay', 'mercado_pago']),
  paymentToken: z.string().optional()
});

const completeSchema = z.object({
  explicitConfirmation: z.boolean(),
  quoteHash: z.string().optional(),
  termsVersion: z.string().optional(),
  surface: z.string().optional()
});

const KNOWN_CEPS: Record<
  string,
  { cep: string; logradouro: string; bairro: string; cidade: string; estado: string }
> = {
  '50030230': {
    cep: '50030-230',
    logradouro: 'Rua do Apolo, 235 (Porto Digital)',
    bairro: 'Recife',
    cidade: 'Recife',
    estado: 'PE'
  },
  '01310100': {
    cep: '01310-100',
    logradouro: 'Avenida Paulista, 1000',
    bairro: 'Bela Vista',
    cidade: 'São Paulo',
    estado: 'SP'
  },
  '60115080': {
    cep: '60115-080',
    logradouro: 'Avenida Santos Dumont, 1510',
    bairro: 'Aldeota',
    cidade: 'Fortaleza',
    estado: 'CE'
  }
};

export async function chatRoutes(app: FastifyInstance, options: { db: PrismaClient }) {
  const db = options.db;
  const checkout = new CheckoutService(db);
  const agent = new ConversationalAgent(db);

  // CORS support for local Next.js dev server
  app.addHook('onSend', async (request, reply, payload) => {
    const origin = request.headers.origin;
    if (origin) {
      reply.header('Access-Control-Allow-Origin', origin);
      reply.header('Access-Control-Allow-Credentials', 'true');
      reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
      reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    }
    return payload;
  });

  app.options('/api/*', async (_req, reply) => reply.code(204).send());

  app.get('/api/session', async (request) => {
    const query = request.query as { conversationId?: string; storeSource?: string };
    const conv = await checkout.ensureConversation({
      conversationId: query.conversationId,
      storeSource: query.storeSource
    });
    const cart = await checkout.getCartSnapshot(conv.id);
    const wooConfigured = Boolean(
      process.env.WOO_STORE_URL && process.env.WOO_CONSUMER_KEY && process.env.WOO_CONSUMER_SECRET
    );
    const syncedCount = await db.catalogItem.count({ where: { deleted: false } });
    const configuredGroqModel = process.env.GROQ_MODEL || DEFAULT_GROQ_MODEL;
    return {
      conversationId: conv.id,
      tenantId: conv.tenantId,
      storeSource: conv.storeSource,
      cep: conv.customerCep || '50030-230',
      cart,
      aiEngine: 'groq',
      aiModel: configuredGroqModel,
      aiProvider: process.env.GROQ_API_KEY
        ? `groq (${configuredGroqModel})`
        : `groq (${configuredGroqModel} · guardrail)`,
      connectors: [
        {
          id: 'demo',
          name: 'Boopay Demo + Plugin Woo Sync',
          status: 'active',
          syncedItems: syncedCount + 12
        },
        {
          id: 'woocommerce',
          name: 'WooCommerce REST v3',
          status: wooConfigured ? 'connected' : 'sandbox_fallback',
          syncedItems: syncedCount
        },
        {
          id: 'shopify',
          name: 'Shopify Storefront / Admin API',
          status: 'adapter_ready',
          syncedItems: 0
        },
        {
          id: 'vtex',
          name: 'VTEX Checkout & Catalog API',
          status: 'adapter_ready',
          syncedItems: 0
        }
      ]
    };
  });

  app.post('/api/conversations', async (request) => {
    const body = (request.body || {}) as {
      conversationId?: string;
      storeSource?: string;
      cep?: string;
    };
    const conv = await checkout.ensureConversation({
      conversationId: body.conversationId,
      storeSource: body.storeSource,
      customerCep: body.cep
    });
    const cart = await checkout.getCartSnapshot(conv.id);
    return {
      conversationId: conv.id,
      storeSource: conv.storeSource,
      cep: conv.customerCep,
      cart
    };
  });

  app.get('/api/catalog/products', async (request) => {
    const query = request.query as { q?: string; category?: string; source?: string; limit?: string };
    const adapter = createCommerceAdapter(db, query.source);
    const products = await adapter.searchProducts(query.q || '', {
      category: query.category,
      limit: query.limit ? Number(query.limit) : 12
    });
    return { source: adapter.source, displayName: adapter.displayName, items: products };
  });

  app.get('/api/catalog/kits', async (request) => {
    const query = request.query as { source?: string };
    const adapter = createCommerceAdapter(db, query.source);
    const kits = await adapter.listBundles();
    return { source: adapter.source, items: kits };
  });

  app.get('/api/cart', async (request) => {
    const query = request.query as { conversationId?: string };
    const conv = await checkout.ensureConversation({ conversationId: query.conversationId });
    return checkout.getCartSnapshot(conv.id);
  });

  app.post('/api/cart', async (request) => {
    const input = cartMutateSchema.parse(request.body);
    return checkout.mutateCart(input);
  });

  app.post('/api/checkout/sessions', async (request) => {
    const body = (request.body || {}) as {
      conversationId: string;
      protocol?: 'chat' | 'acp' | 'ucp';
      surface?: string;
    };
    if (!body.conversationId) {
      const conv = await checkout.ensureConversation();
      return checkout.openOrUpdateSession({ conversationId: conv.id });
    }
    return checkout.openOrUpdateSession(body);
  });

  app.get('/api/checkout/sessions/:id', async (request) => {
    const { id } = request.params as { id: string };
    return checkout.getSession(id);
  });

  app.put('/api/checkout/sessions/:id/delivery', async (request) => {
    const { id } = request.params as { id: string };
    const input = deliverySchema.parse(request.body);
    return checkout.setDelivery(id, input);
  });

  app.put('/api/checkout/sessions/:id/payment', async (request) => {
    const { id } = request.params as { id: string };
    const input = paymentSchema.parse(request.body);
    return checkout.setPayment(id, input);
  });

  app.post('/api/checkout/sessions/:id/complete', async (request, reply) => {
    const { id } = request.params as { id: string };
    const input = completeSchema.parse(request.body);
    try {
      return await checkout.confirmAndComplete(id, input);
    } catch (err) {
      const code = (err as Error).message || 'checkout_error';
      return reply.code(400).send({ error: code });
    }
  });

  app.post('/api/checkout/sessions/:id/cancel', async (request) => {
    const { id } = request.params as { id: string };
    return checkout.cancelSession(id);
  });

  app.get('/api/orders/:id', async (request) => {
    const { id } = request.params as { id: string };
    return checkout.getOrder(id);
  });

  app.post('/api/orders/:id/advance', async (request) => {
    const { id } = request.params as { id: string };
    return checkout.advanceOrderStatus(id);
  });

  app.get('/api/cep/:cep', async (request) => {
    const { cep } = request.params as { cep: string };
    const clean = (cep || '').replace(/\D/g, '');
    if (KNOWN_CEPS[clean]) {
      return KNOWN_CEPS[clean];
    }
    if (clean.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`, {
          signal: AbortSignal.timeout(3500)
        });
        if (res.ok) {
          const data = (await res.json()) as Record<string, string>;
          if (!data.erro) {
            return {
              cep: `${clean.slice(0, 5)}-${clean.slice(5)}`,
              logradouro: data.logradouro || 'Endereço localizado pelo CEP',
              bairro: data.bairro || 'Centro',
              cidade: data.localidade || 'Recife',
              estado: data.uf || 'PE'
            };
          }
        }
      } catch {
        // Fallback offline
      }
    }
    const fmt = clean.length === 8 ? `${clean.slice(0, 5)}-${clean.slice(5)}` : '50030-230';
    return {
      cep: fmt,
      logradouro: 'Rua do Apolo, 235 (Porto Digital)',
      bairro: 'Bairro do Recife',
      cidade: 'Recife',
      estado: 'PE'
    };
  });

  app.post('/api/chat/stream', async (request, reply) => {
    const input = chatStreamSchema.parse(request.body);
    const requestId = input.requestId || randomUUID();

    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
      ...(request.headers.origin
        ? {
            'Access-Control-Allow-Origin': request.headers.origin,
            'Access-Control-Allow-Credentials': 'true'
          }
        : {})
    });

    const writer = {
      send(event: string, data: unknown) {
        reply.raw.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
      }
    };

    try {
      await agent.runTurn(
        {
          conversationId: input.conversationId,
          requestId,
          message: input.message,
          storeSource: input.storeSource,
          cep: input.cep
        },
        writer
      );
    } catch (err) {
      writer.send('error', {
        code: 'stream_failed',
        message: (err as Error).message || 'Falha ao processar mensagem'
      });
    } finally {
      reply.raw.end();
    }
    return reply;
  });

  // Agentic Commerce Protocol discovery endpoints (UCP / ACP over Boopay Core)
  app.get('/.well-known/ucp', async () => ({
    protocol: 'UCP',
    version: '2026-01',
    provider: 'Boopay Agentic Commerce Core',
    sandbox: true,
    requires_explicit_buyer_confirmation: true,
    capabilities: ['catalog_search', 'authoritative_quote', 'checkout_sessions', 'tokenized_delegated_payment'],
    endpoints: {
      checkout_sessions: '/api/checkout/sessions'
    }
  }));

  app.get('/.well-known/acp', async () => ({
    protocol: 'ACP',
    version: '2026-01',
    provider: 'Boopay Agentic Commerce Core',
    sandbox: true,
    requires_explicit_buyer_confirmation: true,
    endpoints: {
      checkout_sessions: '/api/checkout/sessions'
    }
  }));
}
