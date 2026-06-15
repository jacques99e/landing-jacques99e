/** Informations légales — à compléter si le statut juridique évolue. */
export const LEGAL_ENTITY = {
  brand: "Wazo Digital",
  editor: "Wazo Digital",
  /** Responsable du traitement — personne physique ou morale titulaire du compte. */
  dataController: "Wazo Digital",
  country: "Togo",
  contactEmail: "contact@wazo-digital.com",
  supportWhatsApp: "+228 93 92 40 40",
  hosting: {
    site: "Vercel Inc. — 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis",
    database: "Supabase Inc. — 970 Toa Payoh North #07-04, Singapore 318992",
  },
  lastUpdated: "11 juin 2026",
} as const;

export const LEGAL_PAGES = [
  { href: "/legal/mentions-legales", title: "Mentions légales" },
  { href: "/legal/confidentialite", title: "Politique de confidentialité" },
  { href: "/legal/cgu", title: "Conditions générales d'utilisation" },
  { href: "/legal/cookies", title: "Politique cookies" },
] as const;
