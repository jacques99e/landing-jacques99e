import { WHATSAPP_SUPPORT } from "./vitrine-data";

/** Informations légales — éditeur et contact réels Wazo Digital. */
export const LEGAL_ENTITY = {
  brand: "Wazo Digital",
  /** Dénomination commerciale affichée publiquement. */
  tradeName: "Wazo Digital",
  /** Éditeur / responsable légal du service. */
  editor: "Jacques Noussougan",
  legalForm: "Entrepreneur individuel",
  dataController: "Jacques Noussougan",
  publisher: "Jacques Noussougan",
  address: "Lomé, République du Togo",
  country: "Togo",
  activity:
    "Édition de logiciels SaaS et services de gestion digitale pour micro-entreprises et PME en Afrique.",
  websites: {
    landing: "https://wazo-digital.com",
    app: "https://app.wazo-digital.com",
  },
  contactEmail: "jacquesnoussougan93@gmail.com",
  privacyEmail: "jacquesnoussougan93@gmail.com",
  supportWhatsApp: WHATSAPP_SUPPORT.replace(
    /(\+228)(\d{2})(\d{2})(\d{2})(\d{2})/,
    "$1 $2 $3 $4 $5"
  ),
  hosting: {
    site: "Vercel Inc. — 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis",
    database: "Supabase Inc. — 970 Toa Payoh North #07-04, Singapore 318992",
  },
  lastUpdated: "15 juin 2026",
} as const;

export const LEGAL_PAGES = [
  { href: "/legal/mentions-legales", title: "Mentions légales" },
  { href: "/legal/confidentialite", title: "Politique de confidentialité" },
  { href: "/legal/cgu", title: "Conditions générales d'utilisation" },
  { href: "/legal/cookies", title: "Politique cookies" },
] as const;
