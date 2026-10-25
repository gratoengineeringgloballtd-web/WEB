/*
 * One-off setup: `npm run seed`
 * - creates (or promotes) the admin account from ADMIN_EMAIL / ADMIN_PASSWORD
 * - adds the starter catalogue if the products collection is empty
 * Starter prices are SAMPLES (flagged samplePrice: true). The admin dashboard lists
 * them until each one is edited or confirmed. Replace them before launch.
 */
import 'dotenv/config';
import { getDb, getClient } from './db.js';
import { hashPassword } from './auth.js';

const xaf = (ngn) => Math.round(ngn / 2.7 / 500) * 500;
const P = (slug, category, brand, sku, en, fr, ngn, mode, stock, images = [], specs = [], featured = false) => ({
  slug, category, brand, sku, name: { en: en[0], fr: fr[0] }, summary: { en: en[1], fr: fr[1] },
  description: { en: en[2] || en[1], fr: fr[2] || fr[1] }, specs: specs.map(([label, value]) => ({ label, value })),
  images, prices: ngn ? { NGN: ngn, XAF: xaf(ngn) } : { NGN: null, XAF: null }, mode, stock, featured,
  active: true, samplePrice: true, sortOrder: 100, createdAt: new Date(), updatedAt: new Date(),
});

const PRODUCTS = [
  // Generators
  P('mikano-20kva-soundproof', 'generators', 'Mikano', 'MK-20S', ['Mikano 20 kVA soundproof generator', 'Standby diesel generator for homes and small offices, with ATS-ready control panel.'], ['Groupe Mikano 20 kVA insonorisé', 'Groupe diesel de secours pour maisons et petits bureaux, panneau de commande compatible ATS.'], 9_800_000, 'buy', 3, ['/img/mikano-compact.webp'], [['Prime power', '18 kVA'], ['Standby power', '20 kVA'], ['Fuel', 'Diesel'], ['Enclosure', 'Soundproof canopy']], true),
  P('mikano-60kva-soundproof', 'generators', 'Mikano', 'MK-60S', ['Mikano 60 kVA soundproof generator', 'Prime or standby power for shops, clinics, schools and small factories.'], ['Groupe Mikano 60 kVA insonorisé', 'Énergie principale ou de secours pour commerces, cliniques, écoles et petites usines.'], 24_500_000, 'buy', 2, ['/img/mikano-sets.webp'], [['Prime power', '55 kVA'], ['Standby power', '60 kVA'], ['Fuel', 'Diesel'], ['Phase', 'Three-phase']], true),
  P('mikano-100kva-soundproof', 'generators', 'Mikano', 'MK-100S', ['Mikano 100 kVA soundproof generator', 'For hotels, hospitals and office buildings. Delivery and installation quoted per site.'], ['Groupe Mikano 100 kVA insonorisé', 'Pour hôtels, hôpitaux et immeubles de bureaux. Livraison et installation sur devis.'], null, 'quote', null, ['/img/mikano-standby.webp'], [['Standby power', '100 kVA'], ['Fuel', 'Diesel'], ['Phase', 'Three-phase']]),
  P('industrial-500kva-container', 'generators', '', 'IND-500C', ['500 kVA containerised generator', 'Industrial generator in a 20 ft container for factories, estates and hospitals.'], ['Groupe 500 kVA en conteneur', 'Groupe industriel en conteneur 20 pieds pour usines, résidences et hôpitaux.'], null, 'quote', null, ['/img/container-genset.webp'], [['Standby power', '500 kVA'], ['Enclosure', '20 ft container']]),
  P('greaves-15kva', 'generators', 'Greaves', 'GR-15', ['Greaves 15 kVA generator', 'Compact diesel generator for homes and telecom sites.'], ['Groupe Greaves 15 kVA', 'Groupe diesel compact pour maisons et sites télécoms.'], 7_200_000, 'buy', 4, [], [['Standby power', '15 kVA'], ['Fuel', 'Diesel']]),
  P('mahindra-30kva', 'generators', 'Mahindra', 'MH-30', ['Mahindra 30 kVA generator', 'Telecom-grade diesel generator with remote monitoring option.'], ['Groupe Mahindra 30 kVA', 'Groupe diesel adapté aux télécoms, supervision à distance en option.'], 13_500_000, 'buy', 2, [], [['Standby power', '30 kVA'], ['Fuel', 'Diesel']]),
  // Spare parts
  P('oil-filter', 'spare-parts', '', 'SP-OF', ['Generator oil filter', 'Spin-on oil filter for 10–100 kVA diesel generators. Tell us your model at checkout.'], ['Filtre à huile', 'Filtre à huile vissé pour groupes diesel 10–100 kVA. Indiquez votre modèle à la commande.'], 18_000, 'buy', 40),
  P('fuel-filter', 'spare-parts', '', 'SP-FF', ['Generator fuel filter', 'Diesel fuel filter element for 10–100 kVA generators.'], ['Filtre à gasoil', 'Élément filtrant gasoil pour groupes 10–100 kVA.'], 16_500, 'buy', 40),
  P('air-filter', 'spare-parts', '', 'SP-AF', ['Generator air filter', 'Air filter element for 10–100 kVA generators.'], ['Filtre à air', 'Élément filtrant à air pour groupes 10–100 kVA.'], 24_000, 'buy', 30),
  P('starter-battery-12v-100ah', 'spare-parts', '', 'SP-BAT100', ['12 V 100 Ah starter battery', 'Maintenance-free starter battery for generators.'], ['Batterie de démarrage 12 V 100 Ah', 'Batterie de démarrage sans entretien pour groupes.'], 145_000, 'buy', 15),
  P('avr-regulator', 'spare-parts', '', 'SP-AVR', ['Automatic voltage regulator (AVR)', 'Replacement AVR for brushless alternators. Confirm alternator model before ordering.'], ['Régulateur automatique de tension (AVR)', 'AVR de remplacement pour alternateurs sans balais. Confirmez le modèle avant de commander.'], 95_000, 'buy', 10),
  P('coolant-20l', 'spare-parts', '', 'SP-CL20', ['Engine coolant, 20 litres', 'Ready-mixed coolant for diesel generator engines.'], ['Liquide de refroidissement, 20 litres', 'Liquide prêt à l’emploi pour moteurs de groupes diesel.'], 48_000, 'buy', 25),
  P('fan-belt', 'spare-parts', '', 'SP-FB', ['Generator fan belt', 'V-belt for generator radiator fans. Give your engine model at checkout.'], ['Courroie de ventilateur', 'Courroie trapézoïdale pour ventilateurs de radiateur. Indiquez le modèle moteur.'], 22_000, 'buy', 20),
  // Power systems
  P('lithium-48v-100ah', 'power', 'Exicom', 'PW-LI48', ['48 V 100 Ah lithium battery', 'Rack-mount LiFePO4 battery for telecom sites and hybrid power systems.'], ['Batterie lithium 48 V 100 Ah', 'Batterie LiFePO4 en rack pour sites télécoms et systèmes hybrides.'], 1_650_000, 'buy', 8, [], [['Chemistry', 'LiFePO4'], ['Voltage', '48 V'], ['Capacity', '100 Ah']], true),
  P('rectifier-module-3kw', 'power', 'Exicom', 'PW-RM3', ['3 kW rectifier module', 'Hot-swappable 48 V DC rectifier module for telecom power systems.'], ['Module redresseur 3 kW', 'Module redresseur 48 V DC remplaçable à chaud pour systèmes d’énergie télécoms.'], 420_000, 'buy', 12),
  P('dc-air-conditioner', 'power', 'Exicom', 'PW-DCAC', ['DC air conditioner, 1,500 W', '48 V DC cabinet and shelter air conditioner.'], ['Climatiseur DC 1 500 W', 'Climatiseur 48 V DC pour armoires et shelters.'], 1_150_000, 'buy', 5),
  P('ats-100a', 'power', '', 'PW-ATS100', ['Automatic transfer switch, 100 A', 'Switches between grid and generator automatically.'], ['Inverseur automatique 100 A', 'Bascule automatiquement entre le réseau et le groupe.'], 380_000, 'buy', 6),
  P('solar-panel-550w', 'power', '', 'PW-PV550', ['550 W solar panel', 'Monocrystalline panel for hybrid and solar sites.'], ['Panneau solaire 550 W', 'Panneau monocristallin pour sites hybrides et solaires.'], 165_000, 'buy', 60),
  // Telecom infrastructure
  P('outdoor-equipment-cabinet', 'telecom', '', 'TC-CAB', ['Outdoor equipment cabinet', 'Weatherproof cabinet for BTS, power and transmission equipment.'], ['Armoire d’équipements extérieure', 'Armoire étanche pour équipements BTS, énergie et transmission.'], null, 'quote', null),
  P('equipment-shelter', 'telecom', '', 'TC-SHL', ['Equipment shelter', 'Insulated shelter for telecom sites, supplied and installed by Grato.'], ['Shelter d’équipements', 'Shelter isolé pour sites télécoms, fourni et installé par Grato.'], null, 'quote', null, ['/img/tower-shelter.webp']),
  P('lattice-tower-components', 'telecom', '', 'TC-TWR', ['Lattice tower sections', 'Galvanised lattice tower sections and accessories, sized per site.'], ['Sections de pylône treillis', 'Sections de pylône galvanisées et accessoires, dimensionnées par site.'], null, 'quote', null, ['/img/lattice-tower.webp']),
  P('grounding-kit', 'telecom', '', 'TC-GND', ['Site grounding kit', 'Earth rods, clamps and bonding cable for one site.'], ['Kit de mise à la terre', 'Piquets de terre, colliers et câble de liaison pour un site.'], 210_000, 'buy', 10),
  P('dc-power-cable-35mm', 'telecom', '', 'TC-CBL35', ['DC power cable 35 mm², per metre', 'Flexible copper cable for DC power distribution.'], ['Câble d’énergie DC 35 mm², au mètre', 'Câble cuivre souple pour la distribution d’énergie DC.'], 9_500, 'buy', 500),
];

async function main() {
  const db = await getDb();
  const email = String(process.env.ADMIN_EMAIL || '').toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD || '';
  if (email && password) {
    if (password.length < 10) throw new Error('ADMIN_PASSWORD must be at least 10 characters.');
    const existing = await db.collection('users').findOne({ email });
    if (existing) {
      await db.collection('users').updateOne({ _id: existing._id }, { $addToSet: { roles: 'admin' } });
      console.log(`Admin role given to ${email}`);
    } else {
      await db.collection('users').insertOne({ name: 'Grato Admin', email, passwordHash: await hashPassword(password), roles: ['customer', 'admin'], referral: { status: 'none' }, createdAt: new Date() });
      console.log(`Admin account created: ${email}`);
    }
  } else console.log('ADMIN_EMAIL / ADMIN_PASSWORD not set: no admin created.');

  if ((await db.collection('products').countDocuments()) === 0) {
    await db.collection('products').insertMany(PRODUCTS);
    console.log(`Added ${PRODUCTS.length} starter products (sample prices — replace them in the admin dashboard).`);
  } else console.log('Products already exist: catalogue left unchanged.');
  await (await getClient()).close();
}

main().catch((e) => { console.error(e.message); process.exit(1); });
