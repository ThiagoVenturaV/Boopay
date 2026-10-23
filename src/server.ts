import crypto from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import { buildApp } from './app';

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'file:./local.db';
}

const credentialKey =
  process.env.BOOPAY_CREDENTIAL_KEY || crypto.randomBytes(32).toString('hex');
const adminToken =
  process.env.BOOPAY_ADMIN_TOKEN || crypto.randomBytes(24).toString('hex');

const db = new PrismaClient();
const { app } = buildApp({
  db,
  credentialKey,
  adminToken,
  logger: true,
});
app.addHook('onClose', async () => {
  await db.$disconnect();
});

const start = async () => {
  try {
    const port = Number(process.env.PORT || 3333);
    await app.listen({ port, host: '127.0.0.1' });
    console.log(`🚀 Boopay API rodando em http://localhost:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

void start();
