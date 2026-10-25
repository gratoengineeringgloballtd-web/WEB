import dns from 'node:dns';
import { MongoClient, ObjectId } from 'mongodb';

// Optional: some networks cannot answer the DNS lookups that mongodb+srv:// links need
// ("querySrv ETIMEOUT"). Set MONGODB_DNS=8.8.8.8,1.1.1.1 to use public DNS servers instead.
if (process.env.MONGODB_DNS) {
  try { dns.setServers(process.env.MONGODB_DNS.split(',').map((s) => s.trim()).filter(Boolean)); } catch { /* ignore bad values */ }
}

/*
 * One MongoDB connection, reused across requests. On Vercel each warm function
 * instance keeps its client in the module scope, so Atlas is not reconnected
 * on every call.
 */
let clientPromise = null;
let indexesReady = null;

export function getClient() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw Object.assign(new Error('MONGODB_URI is not set'), { status: 500 });
  if (!clientPromise) {
    clientPromise = new MongoClient(uri, { maxPoolSize: 10, serverSelectionTimeoutMS: 15000 }).connect().catch((e) => { clientPromise = null; throw e; });
  }
  return clientPromise;
}

export async function getDb() {
  const client = await getClient();
  const db = client.db(process.env.MONGODB_DB || 'grato');
  if (!indexesReady) indexesReady = ensureIndexes(db).catch((e) => { indexesReady = null; throw e; });
  await indexesReady;
  return db;
}

async function ensureIndexes(db) {
  await Promise.all([
    db.collection('users').createIndex({ email: 1 }, { unique: true }),
    db.collection('users').createIndex({ 'referral.code': 1 }, { unique: true, partialFilterExpression: { 'referral.code': { $type: 'string' } } }),
    db.collection('users').createIndex({ 'referral.status': 1 }),
    db.collection('products').createIndex({ slug: 1 }, { unique: true }),
    db.collection('products').createIndex({ category: 1, active: 1 }),
    db.collection('orders').createIndex({ number: 1 }, { unique: true }),
    db.collection('orders').createIndex({ 'payment.txRef': 1 }, { sparse: true }),
    db.collection('orders').createIndex({ userId: 1, createdAt: -1 }),
    db.collection('orders').createIndex({ status: 1, createdAt: -1 }),
    db.collection('commissions').createIndex({ referrerId: 1, month: 1, currency: 1 }),
    db.collection('commissions').createIndex({ orderId: 1 }),
    db.collection('payouts').createIndex({ referrerId: 1, requestedAt: -1 }),
    db.collection('payouts').createIndex({ status: 1 }),
  ]);
}

export const oid = (id) => {
  try { return new ObjectId(String(id)); } catch { return null; }
};

export { ObjectId };
