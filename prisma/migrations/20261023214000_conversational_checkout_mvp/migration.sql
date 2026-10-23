CREATE TABLE "Conversation" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "tenantId" TEXT NOT NULL DEFAULT 'demo-tenant',
  "storeSource" TEXT NOT NULL DEFAULT 'demo',
  "cartVersion" INTEGER NOT NULL DEFAULT 0,
  "customerName" TEXT,
  "customerCep" TEXT,
  "preferencesJson" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);
CREATE INDEX "Conversation_tenantId_idx" ON "Conversation"("tenantId");

CREATE TABLE "ConversationTurn" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "conversationId" TEXT NOT NULL,
  "requestId" TEXT NOT NULL,
  "userMessage" TEXT NOT NULL,
  "assistantText" TEXT NOT NULL,
  "uiBlocksJson" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "latencyMs" INTEGER NOT NULL DEFAULT 0,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "ConversationTurn_conversationId_requestId_key" ON "ConversationTurn"("conversationId", "requestId");

CREATE TABLE "CartLine" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "conversationId" TEXT NOT NULL,
  "productRef" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "brand" TEXT NOT NULL DEFAULT 'Boopay Store',
  "category" TEXT NOT NULL DEFAULT 'Geral',
  "priceCents" INTEGER NOT NULL,
  "originalPriceCents" INTEGER,
  "qty" INTEGER NOT NULL DEFAULT 1,
  "stock" INTEGER NOT NULL DEFAULT 20,
  "imageUrl" TEXT NOT NULL DEFAULT '/products/placeholder.svg',
  "source" TEXT NOT NULL DEFAULT 'demo',
  "bundleId" TEXT,
  "bundleTitle" TEXT,
  "geoScore" INTEGER NOT NULL DEFAULT 92,
  "whyRecommended" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "CartLine_conversationId_productRef_key" ON "CartLine"("conversationId", "productRef");

CREATE TABLE "CartMutation" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "conversationId" TEXT NOT NULL,
  "requestId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "resultJson" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "CartMutation_conversationId_requestId_key" ON "CartMutation"("conversationId", "requestId");

CREATE TABLE "CheckoutSession" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "conversationId" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL DEFAULT 'demo-tenant',
  "protocol" TEXT NOT NULL DEFAULT 'chat',
  "surface" TEXT NOT NULL DEFAULT 'boopay_sandbox',
  "status" TEXT NOT NULL DEFAULT 'draft',
  "deliveryType" TEXT,
  "cep" TEXT,
  "addressJson" TEXT,
  "paymentMethod" TEXT,
  "paymentToken" TEXT,
  "subtotalCents" INTEGER NOT NULL DEFAULT 0,
  "discountCents" INTEGER NOT NULL DEFAULT 0,
  "shippingCents" INTEGER NOT NULL DEFAULT 0,
  "taxCents" INTEGER NOT NULL DEFAULT 0,
  "totalCents" INTEGER NOT NULL DEFAULT 0,
  "itemsJson" TEXT NOT NULL DEFAULT '[]',
  "quoteVersion" INTEGER NOT NULL DEFAULT 1,
  "quoteHash" TEXT NOT NULL DEFAULT '',
  "confirmedAt" DATETIME,
  "termsVersion" TEXT,
  "orderId" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "CheckoutSession_conversationId_status_idx" ON "CheckoutSession"("conversationId", "status");

CREATE TABLE "ChatOrder" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "conversationId" TEXT NOT NULL,
  "checkoutSessionId" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL DEFAULT 'demo-tenant',
  "source" TEXT NOT NULL DEFAULT 'demo',
  "externalOrderId" TEXT,
  "protocol" TEXT NOT NULL DEFAULT 'chat',
  "surface" TEXT NOT NULL DEFAULT 'boopay_sandbox',
  "status" TEXT NOT NULL DEFAULT 'CONFIRMADO',
  "simulated" BOOLEAN NOT NULL DEFAULT true,
  "deliveryType" TEXT NOT NULL,
  "addressJson" TEXT NOT NULL,
  "paymentMethod" TEXT NOT NULL,
  "paymentStatus" TEXT NOT NULL DEFAULT 'PAID_SANDBOX',
  "subtotalCents" INTEGER NOT NULL,
  "discountCents" INTEGER NOT NULL DEFAULT 0,
  "shippingCents" INTEGER NOT NULL,
  "totalCents" INTEGER NOT NULL,
  "itemsJson" TEXT NOT NULL,
  "quoteHash" TEXT NOT NULL,
  "confirmedAt" DATETIME NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "ChatOrder_conversationId_idx" ON "ChatOrder"("conversationId");

CREATE TABLE "CustomBundle" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "tenantId" TEXT NOT NULL DEFAULT 'demo-tenant',
  "title" TEXT NOT NULL,
  "subtitle" TEXT NOT NULL,
  "goal" TEXT NOT NULL,
  "discountPct" INTEGER NOT NULL DEFAULT 10,
  "itemsJson" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
