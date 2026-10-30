import test from 'node:test';
import assert from 'node:assert/strict';
import { PrismaClient } from '@prisma/client';
import { VtexCommerceAdapter } from '../src/connectors/vtex/checkout';
import { createCommerceAdapter } from '../src/commerce/adapter';

const db = new PrismaClient();

test('VtexCommerceAdapter - propriedades e inicialização', () => {
  const adapter = new VtexCommerceAdapter(db);
  assert.equal(adapter.source, 'vtex');
  assert.equal(adapter.displayName, 'VTEX Commerce Cloud');
  assert.equal(adapter.configured, false);

  const configuredAdapter = new VtexCommerceAdapter(db, {
    accountName: 'lojaexemplo',
    appKey: 'vtexappkey-test',
    appToken: 'vtexapptoken-secret'
  });
  assert.equal(configuredAdapter.configured, true);
});

test('createCommerceAdapter - instancia VtexCommerceAdapter quando source é vtex', () => {
  const adapter = createCommerceAdapter(db, 'vtex');
  assert.equal(adapter.source, 'vtex');
  assert.equal(adapter.displayName, 'VTEX Commerce Cloud');
});

test('VtexCommerceAdapter - busca de produtos e catálogo', async () => {
  const adapter = new VtexCommerceAdapter(db);
  const products = await adapter.searchProducts('mochila');
  assert.ok(products.length > 0);
  const backpack = await adapter.getProduct('boo-prod-02');
  assert.ok(backpack);
  assert.equal(backpack?.id, 'boo-prod-02');
  assert.ok(backpack?.priceCents > 0);
});

test('VtexCommerceAdapter - simulação de carrinho e SLAs de frete', async () => {
  const adapter = new VtexCommerceAdapter(db);
  const simulation = await adapter.simulateOrderForm({
    items: [{ id: 'boo-prod-02', quantity: 2 }],
    postalCode: '01310-100',
    country: 'BRA'
  });

  assert.equal(simulation.items.length, 1);
  assert.equal(simulation.items[0].availability, 'available');
  assert.ok(simulation.items[0].sellingPrice > 0);

  assert.ok(simulation.logisticsInfo.length > 0);
  const slas = simulation.logisticsInfo[0].slas;
  assert.ok(slas.some((s) => s.id === 'standard'));
  assert.ok(slas.some((s) => s.id === 'express'));
  assert.ok(slas.some((s) => s.id === 'pickup'));

  const itemsTotal = simulation.totals.find((t) => t.id === 'Items')?.value;
  assert.ok(itemsTotal && itemsTotal > 0);
});

test('VtexCommerceAdapter - geração de cotação autoritativa com quoteHash SHA-256', async () => {
  const adapter = new VtexCommerceAdapter(db);
  const quote = await adapter.quote(
    [{ productRef: 'boo-prod-02', qty: 1 }],
    { type: 'standard', cep: '01310-100' }
  );

  assert.equal(quote.source, 'vtex');
  assert.equal(quote.lines.length, 1);
  assert.ok(quote.subtotalCents > 0);
  assert.ok(quote.totalCents > 0);
  assert.ok(typeof quote.quoteHash === 'string' && quote.quoteHash.length > 0, 'quoteHash deve ser gerado');

  // Cotação com mais itens altera o quoteHash determinístico
  const quote2 = await adapter.quote(
    [{ productRef: 'boo-prod-02', qty: 2 }],
    { type: 'standard', cep: '01310-100' }
  );
  assert.notEqual(quote.quoteHash, quote2.quoteHash);
});

test('VtexCommerceAdapter - criação idempotente de pedido', async () => {
  const adapter = new VtexCommerceAdapter(db);
  const quote = await adapter.quote(
    [{ productRef: 'boo-prod-02', qty: 1 }],
    { type: 'standard', cep: '01310-100' }
  );

  const orderId = 'BOO-2026-TESTVTEX';
  const order1 = await adapter.createOrder({
    orderId,
    quote,
    delivery: { type: 'standard', cep: '01310-100' },
    paymentMethod: 'pix_sandbox'
  });

  assert.ok(order1.externalOrderId.startsWith('VTEX-'));

  // Repetição idempotente com o mesmo orderId retorna o mesmo externalOrderId
  const order2 = await adapter.createOrder({
    orderId,
    quote,
    delivery: { type: 'standard', cep: '01310-100' },
    paymentMethod: 'pix_sandbox'
  });

  assert.equal(order1.externalOrderId, order2.externalOrderId, 'Deve retornar o mesmo pedido para a mesma chave idempotente');
});
