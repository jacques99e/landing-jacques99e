/** Plan de lancement marketing — contenus prêts à copier (WhatsApp, réseaux, pilotes). */
export const MARKETING_LAUNCH = {
  tagline: "Encaissez plus. Perdez moins de temps. Tout depuis votre téléphone.",
  landingUrl: "https://wazo-digital.com",
  registerUrl: "https://wazo-digital.com/register",
  appUrl: "https://app.wazo-digital.com",
  whatsappSupport: "+228 93 92 40 40",
} as const;

export const LAUNCH_PHASES = [
  {
    id: "week1",
    title: "Semaine 1 — Pilotes (10–20 commerçants)",
    actions: [
      "Inviter 5 boutiques commerce + 3 formations + 2 logistique en gratuit.",
      "Accompagnement WhatsApp : setup en 15 min, première vente le jour J.",
      "Collecter 3 témoignages vidéo 30 s (avant/après Wazo).",
    ],
  },
  {
    id: "week2",
    title: "Semaine 2 — Bouche-à-oreille",
    actions: [
      "Activer le bouton « Inviter un collègue » depuis le dashboard.",
      "Promo -10 % weekend via module Promotions (commerce).",
      "Publier 1 post/jour sur WhatsApp Status avec lien boutique ou inscription.",
    ],
  },
  {
    id: "week3",
    title: "Semaine 3 — Conversion PRO",
    actions: [
      "Cibler les comptes > 30 ventes : offre PRO 9,99 €/mois (analytics + 3 boutiques).",
      "Webinaire 20 min « Caisse MoMo + stock sans Excel » (lien /formation).",
      "Relance e-mail / WhatsApp aux inscrits sans première vente.",
    ],
  },
  {
    id: "week4",
    title: "Semaine 4 — Scale",
    actions: [
      "Partenariats chambres de commerce, coopératives agricoles, centres de formation.",
      "Publicité ciblée Facebook/Instagram : Togo, Sénégal, Côte d'Ivoire — commerçants 25–45 ans.",
      "Pack BUSINESS pour structures multi-sites (équipe + rapports hebdo).",
    ],
  },
] as const;

export const TARGET_PERSONAS = [
  {
    id: "commerce",
    label: "Commerçant / boutique",
    pain: "Cahier perdu, stock incohérent, pas de suivi MoMo",
    hook: "Caisse + stock + boutique WhatsApp en 1 app",
    cta: "https://wazo-digital.com/register?module=commerce",
  },
  {
    id: "agriculture",
    label: "Producteur / coopérative",
    pain: "Pas de traçabilité parcelle, prix marché flou",
    hook: "Journal de champ + rendement + marchés",
    cta: "https://wazo-digital.com/register?module=agriculture",
  },
  {
    id: "education",
    label: "Formateur / centre",
    pain: "Cours dispersés, pas de certificat ni portail élève",
    hook: "Cours vidéo, quiz, portail /formation public",
    cta: "https://wazo-digital.com/register?module=education",
  },
  {
    id: "logistics",
    label: "Livreur / transporteur",
    pain: "Tournées au téléphone, tarifs négociés à chaque fois",
    hook: "Zones tarifaires + suivi client /suivi",
    cta: "https://wazo-digital.com/register?module=logistics",
  },
] as const;

export const WHATSAPP_POSTS = [
  {
    day: 1,
    audience: "Commerçants",
    text: `🚀 Vous perdez des ventes avec un cahier ?\n\nWazo Digital : caisse MoMo, stock et boutique WhatsApp sur votre téléphone.\n\n✅ Gratuit pour démarrer\n✅ Fonctionne hors ligne\n\n👉 ${MARKETING_LAUNCH.registerUrl}?module=commerce`,
  },
  {
    day: 2,
    audience: "Réseau pro",
    text: `📱 J'utilise Wazo Digital pour gérer mon activité : ventes, clients, rapports.\n\nEssai gratuit (sans engagement) :\n${MARKETING_LAUNCH.registerUrl}\n\nQuestions ? WhatsApp ${MARKETING_LAUNCH.whatsappSupport}`,
  },
  {
    day: 3,
    audience: "Formateurs",
    text: `🎓 Lancez vos cours en ligne en Afrique\n\nVidéos YouTube, quiz, certificats PDF, portail élève.\n\nWazo Digital — module Formation :\n${MARKETING_LAUNCH.registerUrl}?module=education`,
  },
  {
    day: 4,
    audience: "Agriculteurs",
    text: `🌾 Notez chaque activité au champ, suivez vos rendements.\n\nJournal de champ + calendrier cultures sur Wazo Digital.\n\nGratuit : ${MARKETING_LAUNCH.registerUrl}?module=agriculture`,
  },
  {
    day: 5,
    audience: "Conversion PRO",
    text: `📊 Vous faites +10 ventes/semaine ?\n\nPassez PRO (9,99 €/mois) : analytics, exports PDF, 3 boutiques.\n\nDéjà inscrit ? Ouvrez l'app → Facturation\n${MARKETING_LAUNCH.appUrl}/billing`,
  },
] as const;

export const LAUNCH_KPIS = [
  { metric: "Inscriptions / semaine", target: "50+" },
  { metric: "Activation (1ère vente ou action module)", target: "40 %" },
  { metric: "Rétention J7 (série dashboard)", target: "25 %" },
  { metric: "Conversion PRO", target: "5 % des actifs" },
  { metric: "Parrainages WhatsApp", target: "10 / semaine" },
] as const;
