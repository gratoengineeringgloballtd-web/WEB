import { SVCS, PROJECTS, STRINGS } from '../data/content.js';

export const svcOf = (id) => SVCS.find((s) => s.id === id);
export const svcName = (id, lang) => svcOf(id)?.[lang].n ?? (STRINGS[lang] || STRINGS.en).notSure;
export const caseProjects = (list = PROJECTS) => list.map((p, i) => [p, i]).filter(([p]) => p.case);
export const YEARS_IN_OPERATION = new Date().getFullYear() - 2002;

/** Phone and WhatsApp numbers used across the site (to confirm before launch). */
export const CONTACT = {
  phoneHQ: '+237 679 586 444',
  phoneHQRaw: '+237679586444',
  phoneRO: '+234 803 281 8658',
  whatsapp: 'https://wa.me/237679586444',
  email: 'info@gratoengineering.com',
};
