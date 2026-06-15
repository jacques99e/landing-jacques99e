/**
 * Identité et URLs — source unique pour le package marketing.
 */
export const WAZO_BRAND = {
  name: "Wazo Digital",
  tagline: "Encaissez plus. Perdez moins de temps.",
  taglineLong: "Tout depuis votre téléphone.",
  promise:
    "La plateforme mobile qui remplace cahier, Excel et 5 applications — caisse MoMo, stock, clients et 6 modules métier.",
  landingUrl: "https://wazo-digital.com",
  registerUrl: "https://wazo-digital.com/register",
  appUrl: "https://app.wazo-digital.com",
  tarifsUrl: "https://wazo-digital.com/tarifs",
  demoVideoUrl: "https://wazo-digital.com/#demo",
  whatsapp: "+228 93 92 40 40",
  email: "jacquesnoussougan93@gmail.com",
  editor: "Jacques Noussougan",
  country: "Togo · Afrique de l'Ouest",
  legalUrl: "https://wazo-digital.com/legal",
} as const;

export const WAZO_PRICING = {
  free: { name: "GRATUIT", price: "0 €/mois", hook: "50 produits · 1 boutique · tous les modules" },
  pro: { name: "PRO", price: "9,99 €/mois", hook: "Illimité · 3 boutiques · analytics PDF" },
  business: { name: "BUSINESS", price: "24,99 €/mois", hook: "10 boutiques · équipe · rapports hebdo" },
} as const;

export const WAZO_HASHTAGS = {
  core: ["#WazoDigital", "#AfriqueDigitale", "#MobileMoney", "#EntrepreneurAfrique"],
  commerce: ["#CommerceAfrique", "#BoutiqueWhatsApp", "#CaisseMoMo", "#GestionStock"],
  agri: ["#AgriTech", "#AgricultureAfrique", "#Cooperative"],
  edu: ["#FormationAfrique", "#EdTech", "#Apprentissage"],
  logistics: ["#LogistiqueAfrique", "#Livraison", "#LastMile"],
} as const;
