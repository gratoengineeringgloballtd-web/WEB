import { getDb } from './db.js';

/*
 * Shop and referral settings live in one document (_id: 'main') that admins edit.
 * These defaults are used until the first save, and fill in any missing field.
 */
export const DEFAULT_SETTINGS = {
  tiers: [
    { name: 'Bronze', rate: 3, min: { NGN: 0, XAF: 0 } },
    { name: 'Silver', rate: 5, min: { NGN: 5_000_000, XAF: 2_000_000 } },
    { name: 'Gold', rate: 7, min: { NGN: 20_000_000, XAF: 8_000_000 } },
  ],
  payoutMinimum: { NGN: 20_000, XAF: 8_000 },
  referralDays: 30,
  pickupPoints: [
    { id: 'douala', currency: 'XAF', name: { en: 'Douala – Bonaberi warehouse', fr: 'Douala – entrepôt de Bonaberi' }, address: '95 Rue 4443, Ancienne Route, Bonaberi, Douala' },
    { id: 'abuja', currency: 'NGN', name: { en: 'Abuja – Jabi office', fr: 'Abuja – bureau de Jabi' }, address: 'Success Plaza, Plot 523, Sylvester Ugoh Crescent, Jabi, Abuja' },
  ],
  deliveryZones: [
    { id: 'abuja', currency: 'NGN', name: 'Abuja (FCT)', fee: 15_000 },
    { id: 'lagos', currency: 'NGN', name: 'Lagos', fee: 25_000 },
    { id: 'port-harcourt', currency: 'NGN', name: 'Port Harcourt', fee: 25_000 },
    { id: 'kano', currency: 'NGN', name: 'Kano', fee: 30_000 },
    { id: 'douala', currency: 'XAF', name: 'Douala', fee: 10_000 },
    { id: 'yaounde', currency: 'XAF', name: 'Yaoundé', fee: 20_000 },
    { id: 'bafoussam', currency: 'XAF', name: 'Bafoussam', fee: 25_000 },
  ],
};

export async function getSettings() {
  const db = await getDb();
  const doc = await db.collection('settings').findOne({ _id: 'main' });
  return { ...DEFAULT_SETTINGS, ...(doc || {}) };
}

export function publicSettings(s, flwLive) {
  return {
    tiers: s.tiers, payoutMinimum: s.payoutMinimum, referralDays: s.referralDays,
    pickupPoints: s.pickupPoints, deliveryZones: s.deliveryZones,
    payments: { online: true, live: flwLive },
  };
}
