/*
 * Placeholder photos for shop products that have no photos of their own yet.
 * Wikimedia Commons images are loaded from Commons (free licences; author and
 * licence are on each file page, linked from the photo caption). Paths starting
 * with /img/ are photos already in the site.
 *
 * As soon as an admin uploads a photo for a product, only the uploaded photos are
 * shown for that product.
 */
import { mediaUrl } from '../lib/apiBase.js';

const C = (file) => ({ commons: file });

const GENERATOR = [C('Caterpillar_(Olympian)_Generator_Set.jpg'), C('Kirloskar_-_Silent_Diesel_Generator_Set_-_Mathura_2013-02-24_6663.JPG'), C('Dieselgenerator.jpg'), C('Diesel_generator.jpg')];
const MIKANO = ['/img/mikano-compact.webp', '/img/mikano-sets.webp', '/img/mikano-standby.webp'];

export const PLACEHOLDERS = {
  'mikano-20kva-soundproof': ['/img/mikano-compact.webp', '/img/mikano-sets.webp', '/img/mikano-standby.webp', GENERATOR[1]],
  'mikano-60kva-soundproof': ['/img/mikano-sets.webp', '/img/mikano-standby.webp', '/img/mikano-compact.webp', GENERATOR[0]],
  'mikano-100kva-soundproof': ['/img/mikano-standby.webp', '/img/mikano-sets.webp', '/img/mikano-compact.webp', GENERATOR[0]],
  'industrial-500kva-container': ['/img/container-genset.webp', '/img/trailer-genset.webp', '/img/genset-yard.webp'],
  'greaves-15kva': [GENERATOR[1], GENERATOR[2], GENERATOR[3]],
  'mahindra-30kva': [GENERATOR[0], GENERATOR[1], GENERATOR[3]],
  'oil-filter': [C('Oil_filter.JPG'), C('3318853_CUMMINS_TJG115561_FORD_OIL.jpg'), C('Engine_oil_filter_cutaway.JPG'), C('Oil_filter_and_Fuel_filter_of_UD_Trucks,.jpg')],
  'fuel-filter': [C('Fuel_filter.jpg'), C('Just_a_fuel_filter..._(22493933238).jpg'), C('Oil_filter_and_Fuel_filter_of_UD_Trucks,.jpg')],
  'air-filter': [C('Air_filter_for_Toyota_1KR-FE.jpg'), C('Air_filter,_opel_astra(1).JPG'), C('Dirty-air-filter.jpg')],
  'starter-battery-12v-100ah': [C('Lead-acid_automotive_battery,_55_Ah.jpg'), C('Diamond_Energie_car_battery.jpg'), C('Photo-CarBattery.jpg')],
  'avr-regulator': [C('EMRI_LXCOS_Voltage_Regulator.jpg'), C('Deutz_F6L912_diesel_generator.jpg')],
  'coolant-20l': [C('Antifreeze.jpg'), C('Antifreeze_in_the_radiator.jpg'), C('Coolant_Recovery_system.jpg')],
  'fan-belt': [C('Multiple-V-belt_drive_001.jpg'), C('Belt_drive_systen_01.JPG')],
  'lithium-48v-100ah': [C('Lithium_Iron_Phosphate_LiFePO4_Cells_700Ah_in_Parallel_and_Series_and_Busbar_-_1.jpg'), C('OneCharge_Lithium_ion_battery_photo.jpg'), C('Lithium_Iron_Phosphate_LiFePO4_Cells_700_Ah_Amp_Hours_3.25_Volts_-_7.jpg'), C('Datacenter_Backup_Batteries.jpg')],
  'rectifier-module-3kw': ['/img/data-centre.webp', C('Datacenter_Backup_Batteries.jpg'), '/img/tower-shelter.webp'],
  'dc-air-conditioner': [C('DAIKIN_AIR_CONDITIONER_OUTDOOR_UNIT_(6).jpg'), C('MITSUBISHI_ELECTRIC_AIR_CONDITIONER_OUTDOOR_UNIT_(54).jpg'), C('Panasonic_AIR_CONDITIONER_OUTDOOR_UNIT.jpg')],
  'ats-100a': [C('Generator_Transfer_Switch_Panel.jpg'), C('Electrical_Main_and_distribution_panel_for_480_volt.JPG')],
  'solar-panel-550w': [C('Solar_panel.jpg'), C('Photovoltaic_Solar_Panel.jpg'), C('Solar_Panels.jpg'), '/img/solar-tower.webp'],
  'outdoor-equipment-cabinet': [C('Mobilfunk-Basisstation.jpg'), C('Turkcell_Mobile_Base_Station.jpg'), C('BTS_Vodafone.jpg')],
  'equipment-shelter': ['/img/tower-shelter.webp', C('Mobile_Cellular_Site.jpg'), C('Cell-Tower.jpg')],
  'lattice-tower-components': ['/img/lattice-tower.webp', C('GSM-R_Panel_Antennas_on_Lattice_Mast.jpg'), C('Large_cell_tower.jpg'), C('Mobile_Phone_Mast_-_geograph.org.uk_-_537205.jpg')],
  'grounding-kit': [C('HomeEarthRodAustralia1.jpg'), C('Grounding_terminal-wire.JPG'), C('Erdungsstange.JPG')],
  'dc-power-cable-35mm': [C('Copper_cable_5G16.JPG'), C('Power_cables.jpg'), C('Cable_reels_in_Finland.jpg')],
};

/** Used for new products the admin adds without photos. */
const BY_CATEGORY = {
  generators: [...MIKANO, GENERATOR[0]],
  'spare-parts': [C('Oil_filter.JPG'), C('Fuel_filter.jpg'), C('Lead-acid_automotive_battery,_55_Ah.jpg')],
  power: [C('Solar_panel.jpg'), C('Datacenter_Backup_Batteries.jpg'), C('Generator_Transfer_Switch_Panel.jpg')],
  telecom: ['/img/lattice-tower.webp', '/img/tower-shelter.webp', C('Mobilfunk-Basisstation.jpg')],
};

const commonsSrc = (file, w) => `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=${w}`;
const commonsPage = (file) => `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(file)}`;

/** True when the product has photos uploaded by Grato (not the starter photos). */
const hasOwnPhotos = (p) => (p?.images || []).some((u) => /^(\/api\/images\/|https?:)/.test(u));

/**
 * The photos to show for a product: [{ src, srcLarge, credit }] where credit is
 * null for Grato's own photos, or { url } for a Commons placeholder.
 */
export function galleryFor(p, asset = (x) => x) {
  if (!p) return [];
  if (hasOwnPhotos(p)) return p.images.map((u) => { const s = u.startsWith('/img/') ? asset(u) : mediaUrl(u); return { src: s, srcLarge: s, credit: null }; });
  const list = PLACEHOLDERS[p.slug] || [...(p.images || []), ...(BY_CATEGORY[p.category] || [])];
  const seen = new Set();
  return list.filter((x) => { const k = typeof x === 'string' ? x : x.commons; if (seen.has(k)) return false; seen.add(k); return true; }).map((x) => (
    typeof x === 'string'
      ? { src: asset(x), srcLarge: asset(x), credit: null, example: true }
      : { src: commonsSrc(x.commons, 640), srcLarge: commonsSrc(x.commons, 1400), credit: { url: commonsPage(x.commons) }, example: true }
  ));
}
