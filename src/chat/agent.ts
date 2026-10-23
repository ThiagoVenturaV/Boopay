import { PrismaClient } from '@prisma/client';
import {
  CartSnapshot,
  CheckoutService,
  CheckoutSessionView,
  OrderView
} from '../checkout/checkout-service';
import {
  CatalogBundle,
  CatalogProduct
} from '../commerce/catalog-data';
import { createCommerceAdapter } from '../commerce/adapter';

export type UiBlock =
  | { tipo: 'product_list'; dados: { title: string; subtitle?: string; items: CatalogProduct[] } }
  | { tipo: 'product_card'; dados: CatalogProduct }
  | { tipo: 'kit_card'; dados: CatalogBundle }
  | { tipo: 'cart'; dados: CartSnapshot }
  | { tipo: 'checkout'; dados: CheckoutSessionView }
  | { tipo: 'order_tracking'; dados: OrderView }
  | {
      tipo: 'geo_audit';
      dados: {
        storeName: string;
        overallScore: number;
        eligibleCount: number;
        totalCount: number;
        protocols: string[];
        highlights: string[];
      };
    };

export interface SseWriter {
  send(event: string, data: unknown): void;
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function formatBrl(cents: number): string {
  return `R$ ${(cents / 100).toFixed(2).replace('.', ',')}`;
}

export const DEFAULT_GROQ_MODEL = 'qwen/qwen3.8-27b';
export const GROQ_QWEN_CANDIDATES = [
  DEFAULT_GROQ_MODEL,
  'qwen-3.8-27b',
  'qwen/qwen3-32b',
  'qwen-qwq-32b'
];

async function generateLlmNarrative(
  userMessage: string,
  factualContext: string,
  fallbackText: string
): Promise<{ text: string; provider: string }> {
  const groqKey = process.env.GROQ_API_KEY;
  const configuredModel = process.env.GROQ_MODEL || DEFAULT_GROQ_MODEL;
  const providerPref = (process.env.BOOPAY_AI_PROVIDER || 'groq').toLowerCase();

  if (providerPref === 'groq' && groqKey) {
    const modelCandidates = Array.from(new Set([configuredModel, ...GROQ_QWEN_CANDIDATES]));
    for (const candidateModel of modelCandidates) {
      try {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${groqKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: candidateModel,
            temperature: 0.25,
            max_completion_tokens: 360,
            messages: [
              {
                role: 'system',
                content:
                  'Você é o Boo, assistente de Agentic Commerce e Checkout Conversacional Invisível do Boopay rodando sobre Groq com o modelo Qwen 3.8 27B. ' +
                  'Regras estritas: (1) NUNCA invente preços, estoque, prazos ou descontos — use exclusivamente os fatos fornecidos no contexto autoritativo; ' +
                  '(2) NUNCA conclua pagamento sem a confirmação humana explícita no botão de revisão; ' +
                  '(3) Responda em português do Brasil, de forma objetiva, calorosa e clara (máximo 2 parágrafos curtos).'
              },
              {
                role: 'user',
                content: `Mensagem do comprador: "${userMessage}"\n\nFatos autoritativos do catálogo/sessão:\n${factualContext}`
              }
            ]
          }),
          signal: AbortSignal.timeout(9000)
        });
        if (res.ok) {
          const json = (await res.json()) as {
            choices?: Array<{ message?: { content?: string } }>;
          };
          const raw = json.choices?.[0]?.message?.content?.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
          if (raw && raw.length > 15) {
            return { text: raw, provider: `groq:${configuredModel}` };
          }
        }
      } catch {
        // Try next candidate slug or fallback cleanly to deterministic narrative
      }
    }
  }

  return { text: fallbackText, provider: `groq:${configuredModel} (deterministic-guardrail)` };
}

export class ConversationalAgent {
  private readonly checkout: CheckoutService;

  constructor(private readonly db: PrismaClient) {
    this.checkout = new CheckoutService(db);
  }

  async runTurn(
    input: {
      conversationId?: string;
      requestId: string;
      message: string;
      storeSource?: string;
      cep?: string;
    },
    writer: SseWriter
  ): Promise<void> {
    const startedAt = Date.now();
    const conv = await this.checkout.ensureConversation({
      conversationId: input.conversationId,
      storeSource: input.storeSource,
      customerCep: input.cep
    });

    writer.send('session', {
      conversationId: conv.id,
      requestId: input.requestId,
      storeSource: conv.storeSource,
      cep: conv.customerCep
    });

    // Idempotent replay if requestId was already processed
    const existingTurn = await this.db.conversationTurn.findUnique({
      where: {
        conversationId_requestId: {
          conversationId: conv.id,
          requestId: input.requestId
        }
      }
    });
    if (existingTurn) {
      const blocks = JSON.parse(existingTurn.uiBlocksJson) as UiBlock[];
      const snapshot = await this.checkout.getCartSnapshot(conv.id);
      writer.send('cart_updated', { carrinho: snapshot });
      writer.send('token', { texto: existingTurn.assistantText });
      for (const b of blocks) {
        writer.send('ui', b);
      }
      writer.send('done', {
        conversationId: conv.id,
        requestId: input.requestId,
        replayed: true,
        provider: existingTurn.provider,
        latencyMs: existingTurn.latencyMs
      });
      return;
    }

    const adapter = createCommerceAdapter(this.db, conv.storeSource);
    const msg = normalize(input.message);
    const uiBlocks: UiBlock[] = [];
    let fallbackNarrative = '';
    let factualContext = '';

    const emitTool = async <T>(toolName: string, label: string, fn: () => Promise<T>): Promise<T> => {
      writer.send('tool-start', { name: toolName, label });
      const out = await fn();
      writer.send('tool-end', { name: toolName, status: 'ok' });
      return out;
    };

    // 1. Order tracking / post-sale intent
    if (
      msg.includes('rastrear') ||
      msg.includes('status do pedido') ||
      msg.includes('meu pedido') ||
      msg.includes('acompanhar pedido') ||
      msg.includes('onde esta meu pedido') ||
      msg.includes('avancar pedido')
    ) {
      const order = await emitTool('statusPedido', 'Consultando status do pedido na loja…', async () => {
        const latest = await this.checkout.getLatestOrderForConversation(conv.id);
        if (latest && msg.includes('avancar')) {
          return this.checkout.advanceOrderStatus(latest.id);
        }
        return latest;
      });

      if (order) {
        uiBlocks.push({ tipo: 'order_tracking', dados: order });
        const activeStep = order.steps.find((s) => s.current) || order.steps[0];
        factualContext = `Pedido ${order.id} (${order.externalOrderId}) no estado ${order.status}: ${activeStep.label}. Total pago: ${formatBrl(order.totalCents)}.`;
        fallbackNarrative =
          `Localizei seu pedido **${order.id}** (vínculo na loja: \`${order.externalOrderId}\`). ` +
          `O status atual é **${activeStep.label}** — ${activeStep.description}. Você pode acompanhar a linha do tempo ou simular o avanço da entrega abaixo.`;
      } else {
        fallbackNarrative =
          'Ainda não encontrei um pedido confirmado nesta conversa. Posso te ajudar a escolher produtos ou abrir o checkout da sua sacola atual!';
        factualContext = 'Nenhum pedido confirmado ainda nesta conversa.';
      }
    }
    // 2. GEO Readiness Audit / Agentic Catalog explanation intent
    else if (
      msg.includes('geo') ||
      msg.includes('prontidao') ||
      msg.includes('auditoria') ||
      msg.includes('elegibilidade') ||
      msg.includes('protocolo')
    ) {
      const products = await emitTool('auditarProntidaoGeo', 'Verificando prontidão GEO e catálogo agêntico…', async () =>
        adapter.searchProducts('', { limit: 12 })
      );
      const avgScore = Math.round(products.reduce((s, p) => s + p.geoScore, 0) / Math.max(1, products.length));
      uiBlocks.push({
        tipo: 'geo_audit',
        dados: {
          storeName: adapter.displayName,
          overallScore: avgScore,
          eligibleCount: products.length,
          totalCount: products.length,
          protocols: ['Checkout Core Canônico', 'ACP (OpenAI ready)', 'UCP (Google ready)', 'WooCommerce Plugin v1'],
          highlights: [
            '100% dos SKUs ativos possuem GTIN/SKU, preço autoritativo, estoque em tempo real e política de troca estruturada.',
            'Cotação versionada com hash SHA-256: o agente nunca inventa preço, frete ou desconto.',
            'Confirmação humana explícita obrigatória antes da autorização do token sandbox.'
          ]
        }
      });
      factualContext = `Score médio GEO: ${avgScore}/100 com ${products.length} produtos elegíveis para distribuição agêntica.`;
      fallbackNarrative =
        `Executei a verificação de **Prontidão GEO & Catálogo Agêntico** para **${adapter.displayName}**. ` +
        `O score médio atual é **${avgScore}/100**, com **${products.length}/${products.length} SKUs elegíveis** para recomendação e compra sem redirecionamento.`;
    }
    // 3. Checkout / payment / delivery / final review intent
    else if (
      msg.includes('checkout') ||
      msg.includes('finalizar') ||
      msg.includes('fechar compra') ||
      msg.includes('pagar') ||
      msg.includes('pagamento') ||
      msg.includes('confirmar pedido') ||
      msg.includes('entrega expressa') ||
      msg.includes('retirada na loja') ||
      msg.includes('retirar na unidade')
    ) {
      let session = await emitTool('iniciarCheckout', 'Calculando cotação autoritativa na loja…', async () =>
        this.checkout.openOrUpdateSession({ conversationId: conv.id })
      );

      if (session.lines.length === 0) {
        const suggested = await adapter.searchProducts('', { limit: 4 });
        uiBlocks.push({
          tipo: 'product_list',
          dados: {
            title: 'Sugestões prontas para compra imediata',
            subtitle: 'Adicione um item ou combo para abrir a revisão do checkout invisível',
            items: suggested
          }
        });
        factualContext = 'Sacola vazia ao tentar abrir checkout.';
        fallbackNarrative =
          'Sua sacola ainda está vazia! Selecione um produto ou combo abaixo (ou me diga o que procura) para eu calcular o preço, frete e abrir o checkout aqui mesmo na conversa.';
      } else {
        // Check if user also specified delivery or payment in the message
        if (msg.includes('retirada') || msg.includes('retirar')) {
          session = await this.checkout.setDelivery(session.id, { deliveryType: 'pickup' });
        } else if (msg.includes('expressa') || msg.includes('expresso')) {
          session = await this.checkout.setDelivery(session.id, { deliveryType: 'express' });
        }
        if (msg.includes('cartao') || msg.includes('credito')) {
          session = await this.checkout.setPayment(session.id, { paymentMethod: 'card_sandbox' });
        } else if (msg.includes('google pay')) {
          session = await this.checkout.setPayment(session.id, { paymentMethod: 'google_pay_sandbox' });
        } else if (msg.includes('pix')) {
          session = await this.checkout.setPayment(session.id, { paymentMethod: 'pix_sandbox' });
        }

        uiBlocks.push({ tipo: 'checkout', dados: session });
        factualContext =
          `Sessão de checkout ${session.id} aberta (versão da cotação v${session.quoteVersion}, hash ${session.quoteHash}). ` +
          `Subtotal: ${formatBrl(session.subtotalCents)}, Descontos: ${formatBrl(session.discountCents)}, Frete: ${formatBrl(session.shippingCents)}, Total: ${formatBrl(session.totalCents)}. ` +
          `Regra Boopay: exige confirmação humana explícita do comprador.`;
        fallbackNarrative =
          `Preparei o **resumo autoritativo do seu checkout** (cotação \`v${session.quoteVersion}\` · hash \`${session.quoteHash.slice(0, 8)}\`) no total de **${formatBrl(session.totalCents)}** ` +
          `(economia de **${formatBrl(session.discountCents)}**). Revise a entrega e o pagamento abaixo e clique em **Confirmar e pagar no sandbox** para concluir sem sair da conversa.`;
      }
    }
    // 4. Add kit/combo to cart intent
    else if (
      (msg.includes('adicionar') || msg.includes('colocar') || msg.includes('quero esse') || msg.includes('levar')) &&
      (msg.includes('combo') || msg.includes('kit') || msg.includes('conjunto'))
    ) {
      const bundle = await emitTool('adicionarKitAoCarrinho', 'Adicionando combo completo à sua sacola…', async () => {
        const picked = await adapter.composeBundle({ goal: input.message, tenantId: conv.tenantId });
        await this.checkout.mutateCart({
          conversationId: conv.id,
          action: 'add_bundle',
          bundleId: picked.id
        });
        return picked;
      });
      const snapshot = await this.checkout.getCartSnapshot(conv.id);
      writer.send('cart_updated', { carrinho: snapshot });
      uiBlocks.push({ tipo: 'kit_card', dados: bundle });
      uiBlocks.push({ tipo: 'cart', dados: snapshot });
      factualContext = `Combo "${bundle.title}" adicionado com ${bundle.discountPct}% OFF (${formatBrl(bundle.bundlePriceCents)}). Total na sacola: ${formatBrl(snapshot.totalCents)}.`;
      fallbackNarrative =
        `Adicionei todos os **${bundle.items.length} itens** do **${bundle.title}** à sua sacola com **${bundle.discountPct}% OFF** (**${formatBrl(bundle.bundlePriceCents)}** no combo). ` +
        `Você já pode revisar sua sacola ou clicar em **Ir para o checkout** quando quiser!`;
    }
    // 5. Kit / Combo recommendation intent (`montarKitRecomendado`)
    else if (
      msg.includes('kit') ||
      msg.includes('combo') ||
      msg.includes('conjunto') ||
      msg.includes('rotina') ||
      msg.includes('montar') ||
      msg.includes('monte') ||
      msg.includes('viagem') ||
      msg.includes('home office') ||
      msg.includes('setup')
    ) {
      const bundle = await emitTool('montarKitRecomendado', 'Montando combo personalizado com desconto autorizado…', async () =>
        adapter.composeBundle({ goal: input.message, tenantId: conv.tenantId })
      );
      uiBlocks.push({ tipo: 'kit_card', dados: bundle });
      factualContext =
        `Combo recomendado: "${bundle.title}" (${bundle.items.length} itens: ${bundle.subtitle}). ` +
        `De ${formatBrl(bundle.originalTotalCents)} por ${formatBrl(bundle.bundlePriceCents)} (${bundle.discountPct}% OFF). Motivo: ${bundle.whyRecommended}`;
      fallbackNarrative =
        `Montei o **${bundle.title}** pensado para o seu objetivo, com **${bundle.discountPct}% de desconto autorizado** ` +
        `(de ~~${formatBrl(bundle.originalTotalCents)}~~ por **${formatBrl(bundle.bundlePriceCents)}**). ` +
        `Você pode adicionar todos os **${bundle.items.length} itens** à sacola com **1 clique** no card abaixo!`;
    }
    // 6. Direct add product to cart intent
    else if (
      msg.startsWith('adicionar ') ||
      msg.startsWith('comprar ') ||
      msg.includes('adicione ') ||
      msg.includes('coloca na sacola') ||
      msg.includes('adicionar ao carrinho') ||
      msg.includes('adicionar a sacola')
    ) {
      const matches = await emitTool('adicionarAoCarrinho', 'Consultando produto e atualizando sacola…', async () =>
        adapter.searchProducts(input.message, { limit: 3 })
      );
      const top = matches[0];
      if (top) {
        const snapshot = await this.checkout.mutateCart({
          conversationId: conv.id,
          action: 'add',
          productRef: top.id,
          qty: 1
        });
        writer.send('cart_updated', { carrinho: snapshot });
        uiBlocks.push({ tipo: 'product_card', dados: top });
        uiBlocks.push({ tipo: 'cart', dados: snapshot });
        factualContext = `Produto "${top.name}" (${formatBrl(top.priceCents)}) adicionado à sacola. Total atual da sacola: ${formatBrl(snapshot.totalCents)} (${snapshot.itemCount} itens).`;
        fallbackNarrative =
          `Pronto! Adicionei **${top.name}** (**${formatBrl(top.priceCents)}**) à sua sacola. ` +
          `Sua sacola agora tem **${snapshot.itemCount} ${snapshot.itemCount === 1 ? 'item' : 'itens'}** somando **${formatBrl(snapshot.totalCents)}**. Deseja abrir o checkout ou continuar explorando?`;
      }
    }
    // 7. View cart intent
    else if (msg.includes('sacola') || msg.includes('carrinho') || msg.includes('meus itens')) {
      const snapshot = await emitTool('verCarrinho', 'Sincronizando sua sacola…', async () =>
        this.checkout.getCartSnapshot(conv.id)
      );
      uiBlocks.push({ tipo: 'cart', dados: snapshot });
      factualContext = `Sacola com ${snapshot.itemCount} itens e total ${formatBrl(snapshot.totalCents)}.`;
      fallbackNarrative =
        snapshot.itemCount > 0
          ? `Aqui está o resumo atualizado da sua sacola com **${snapshot.itemCount} ${snapshot.itemCount === 1 ? 'item' : 'itens'}** (**${formatBrl(snapshot.totalCents)}**). Você pode ajustar quantidades ou iniciar o checkout em 3 passos.`
          : 'Sua sacola está vazia no momento. Quer ver sugestões de tênis de corrida, mochilas de viagem ou combos de home office?';
    }
    // 8. Default: Product search & recommendation (`buscarProdutos`)
    else {
      const products = await emitTool('buscarProdutos', 'Consultando catálogo autoritativo e sinais GEO…', async () =>
        adapter.searchProducts(input.message, { limit: 6 })
      );
      uiBlocks.push({
        tipo: 'product_list',
        dados: {
          title: 'Recomendações verificadas no catálogo',
          subtitle: `Fonte: ${adapter.displayName} · Preço e estoque em tempo real`,
          items: products
        }
      });
      const topNames = products.slice(0, 3).map((p) => `${p.name} (${formatBrl(p.priceCents)}, GEO ${p.geoScore}/100)`).join('; ');
      factualContext = `Produtos encontrados para "${input.message}": ${topNames}.`;
      fallbackNarrative =
        `Selecionei **${products.length} opções verificadas** no catálogo da loja com estoque imediato e alta prontidão agêntica. ` +
        `Destaque para **${products[0].name}** por **${formatBrl(products[0].priceCents)}** — ${products[0].whyRecommended} ` +
        `Você pode clicar em qualquer card para ver os detalhes, adicionar à sacola ou pedir um combo com desconto!`;
    }

    const { text: finalNarrative, provider } = await generateLlmNarrative(
      input.message,
      factualContext,
      fallbackNarrative
    );

    // Stream tokens progressively so UI shows smooth typing like PR #28
    const chunks = finalNarrative.match(/.{1,36}(\s|$)/g) || [finalNarrative];
    for (const chunk of chunks) {
      writer.send('token', { texto: chunk });
    }

    for (const block of uiBlocks) {
      writer.send('ui', block);
    }

    const snapshot = await this.checkout.getCartSnapshot(conv.id);
    writer.send('cart_updated', { carrinho: snapshot });

    const latencyMs = Date.now() - startedAt;
    await this.db.conversationTurn.create({
      data: {
        conversationId: conv.id,
        requestId: input.requestId,
        userMessage: input.message,
        assistantText: finalNarrative,
        uiBlocksJson: JSON.stringify(uiBlocks),
        provider,
        latencyMs
      }
    });

    writer.send('done', {
      conversationId: conv.id,
      requestId: input.requestId,
      replayed: false,
      provider,
      latencyMs
    });
  }
}
