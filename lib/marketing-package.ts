/**
 * Package marketing complet Wazo Digital — plaquette, vidéo, 30 posts réseaux.
 * Source unique pour les pages /marketing/* et exports commerciaux.
 */
import { APP_MODULES, DEMO_CHAPTERS, HERO, PRICING, WHATSAPP_SUPPORT } from "./vitrine-data";
import { LEGAL_ENTITY } from "./legal-content";

export const BRAND = {
  name: "Wazo Digital",
  tagline: HERO.title,
  accent: HERO.titleAccent,
  pitch: HERO.subtitle,
  landing: LEGAL_ENTITY.websites.landing,
  app: LEGAL_ENTITY.websites.app,
  register: `${LEGAL_ENTITY.websites.landing}/register`,
  tarifs: `${LEGAL_ENTITY.websites.landing}/tarifs`,
  demoVideo: `${LEGAL_ENTITY.websites.landing}/#demo`,
  whatsapp: WHATSAPP_SUPPORT,
  whatsappLink: `https://wa.me/${WHATSAPP_SUPPORT.replace(/\D/g, "")}`,
  email: LEGAL_ENTITY.contactEmail,
  editor: LEGAL_ENTITY.editor,
  country: LEGAL_ENTITY.country,
} as const;

/** Plaquette commerciale — sections pour impression PDF */
export const BROCHURE = {
  cover: {
    headline: "Digitalisez votre activité en Afrique",
    subheadline: "Caisse MoMo · Stock · WhatsApp · 6 modules métier — une seule application",
    bullets: [
      "Gratuit pour démarrer — sans carte bancaire",
      "Fonctionne hors ligne sur smartphone",
      "Paiement PRO par Mobile Money (9,99 €/mois)",
      "Déploiement en 2 minutes",
    ],
  },
  problem: {
    title: "Le problème que vous connaissez",
    items: [
      "Cahier illisible, stocks oubliés, créances jamais relancées",
      "Caisse, catalogue et clients sur 3 outils différents",
      "Impossible de vendre quand le réseau coupe",
      "Aucune vision claire de la journée ou du mois",
    ],
  },
  solution: {
    title: "La solution Wazo Digital",
    items: [
      "Caisse MoMo + reçu WhatsApp en un geste",
      "Alertes stock et relance crédit automatique",
      "Mode hors ligne : vous vendez quand même",
      "Dashboard unifié : ventes, badges, actions rapides",
    ],
  },
  modules: APP_MODULES.map((m) => ({
    emoji: m.emoji,
    title: m.title,
    tagline: m.tagline,
    features: m.features,
  })),
  pricing: PRICING.map((p) => ({
    title: p.title,
    price: p.price,
    suffix: p.priceSuffix,
    subtitle: p.subtitle,
    features: p.features,
    popular: p.popular,
  })),
  steps: [
    { n: "1", title: "Inscrivez-vous", desc: "wazo-digital.com/register — email ou Google" },
    { n: "2", title: "Configurez", desc: "Nommez votre activité, choisissez vos modules" },
    { n: "3", title: "Vendez", desc: "Caisse, stock, clients — même sans réseau" },
    { n: "4", title: "Grandissez", desc: "Passez PRO pour analytics et multi-boutiques" },
  ],
  trust: [
    "Données isolées par boutique (sécurité Supabase)",
    "Hébergement cloud professionnel (Vercel + Supabase)",
    "Support WhatsApp humain",
    "Cadre légal RGPD (CGU, confidentialité)",
  ],
  contact: {
    name: BRAND.editor,
    email: BRAND.email,
    whatsapp: BRAND.whatsapp,
    web: BRAND.landing,
  },
} as const;

/** Script vidéo courte 60 s — Reels / TikTok / Status */
export const VIDEO_SCRIPT_60S = {
  title: "Wazo Digital — Teaser 60 secondes",
  duration: "60 s",
  format: "Vertical 9:16 ou carré 1:1",
  scenes: [
    {
      t: "0–5 s",
      visuel: "Gros plan cahier griffonné vs smartphone Wazo",
      voix: "Vous perdez des ventes avec un cahier ?",
      texteEcran: "STOP AU CAHIER 📓",
    },
    {
      t: "5–15 s",
      visuel: "Écran caisse MoMo — validation vente",
      voix: "Wazo Digital : caisse Mobile Money, stock et reçu WhatsApp en un clic.",
      texteEcran: "CAISSE MOMO + WHATSAPP",
    },
    {
      t: "15–25 s",
      visuel: "Mode avion ON → vente quand même",
      voix: "Même hors ligne. La sync se fait au retour du réseau.",
      texteEcran: "FONCTIONNE SANS INTERNET",
    },
    {
      t: "25–40 s",
      visuel: "Montage rapide 6 modules (commerce, agri, santé…)",
      voix: "Commerce, agriculture, santé, logistique, formation, traçabilité — six modules, une seule app.",
      texteEcran: "6 MODULES MÉTIER",
    },
    {
      t: "40–50 s",
      visuel: "Page tarifs — badge PRO",
      voix: "Gratuit pour démarrer. PRO à neuf euros quatre-vingt-dix-neuf par mois, sans engagement.",
      texteEcran: "0 € → 9,99 €/mois",
    },
    {
      t: "50–60 s",
      visuel: "QR code + logo Wazo",
      voix: "Wazo Digital. Le lien est en description. Essai gratuit maintenant.",
      texteEcran: `👉 ${BRAND.register}`,
    },
  ],
  cta: BRAND.register,
  music: "Afrobeat léger, tempo moyen, sans paroles",
} as const;

/** Script vidéo complète ~3 min30 — alignée sur la démo enregistrée */
export const VIDEO_SCRIPT_FULL = {
  title: "Wazo Digital — Démo complète",
  duration: "~3 min 30",
  format: "Horizontal 16:9 (YouTube, site, présentation)",
  chapters: DEMO_CHAPTERS.map((c) => c.label),
  narration: [
    "Vous perdez des ventes avec un cahier et cinq applications différentes ? En trois minutes, découvrez Wazo Digital : caisse MoMo, stock et boutique WhatsApp — gratuit pour démarrer, PRO à neuf euros quatre-vingt-dix-neuf par mois.",
    "Votre tableau de bord : ventes du jour, série active, badges et actions rapides — tout sur un écran mobile.",
    "Ajoutez vos produits avec photo, prix et stock. Partagez le catalogue sur WhatsApp.",
    "La caisse : articles, MoMo ou espèces, reçu WhatsApp automatique.",
    "Le carnet crédit : qui vous doit, combien, relance en un clic.",
    "Les abonnements : GRATUIT pour tester, PRO recommandé pour grandir.",
    "Module Santé : patients, rendez-vous, rappels.",
    "Module Agriculture : journal de champ et calendrier cultural.",
    "Module Logistique : tournée et suivi client.",
    "Module Traçabilité : QR et certificat d'origine.",
    "Commencez gratuitement sur wazo-digital.com. Votre activité mérite un vrai outil.",
  ],
  production: {
    recordCommand: "npm run record:demo",
    outputFiles: [
      "public/videos/wazo-demo.mp4",
      "public/videos/wazo-demo.webm",
      "public/videos/wazo-demo-poster.jpg",
    ],
    requirements: [
      "Compte test configuré (E2E_TEST_EMAIL)",
      "Node.js + Playwright installés",
      "Connexion internet stable",
    ],
  },
} as const;

export type SocialChannel =
  | "WhatsApp"
  | "Instagram"
  | "Facebook"
  | "LinkedIn"
  | "TikTok"
  | "Twitter";

export interface SocialPost {
  day: number;
  channel: SocialChannel;
  format: "texte" | "carrousel" | "reel" | "story";
  theme: string;
  text: string;
  hashtags?: string;
  cta: string;
}

/** 30 posts réseaux sociaux — calendrier 30 jours */
export const SOCIAL_POSTS_30: SocialPost[] = [
  {
    day: 1,
    channel: "WhatsApp",
    format: "story",
    theme: "Lancement",
    text: `🚀 Vous perdez des ventes avec un cahier ?\n\nWazo Digital remplace cahier + Excel + 5 apps :\n✅ Caisse MoMo\n✅ Stock & alertes\n✅ Boutique WhatsApp\n\nGratuit pour démarrer 👇`,
    cta: `${BRAND.register}?module=commerce`,
  },
  {
    day: 2,
    channel: "Instagram",
    format: "carrousel",
    theme: "Avant / Après",
    text: `Slide 1 : « Sans Wazo » — cahier, ruptures, créances oubliées\nSlide 2 : « Avec Wazo » — caisse, dashboard, reçu WhatsApp\nSlide 3 : Inscription gratuite en 2 min\n\n${BRAND.tagline}`,
    hashtags: "#WazoDigital #CommerceAfrique #MoMo #Togo #Entrepreneur",
    cta: BRAND.register,
  },
  {
    day: 3,
    channel: "Facebook",
    format: "texte",
    theme: "Commerce",
    text: `🏪 Commerçants : et si votre caisse tenait dans votre poche ?\n\n• Encaissement MoMo ou espèces\n• Reçu WhatsApp automatique\n• Promotions flash % à la caisse\n• Carnet crédit avec relance client\n\nEssai gratuit, sans engagement.`,
    hashtags: "#gestioncommerce #MobileMoney #Afrique",
    cta: `${BRAND.register}?module=commerce`,
  },
  {
    day: 4,
    channel: "LinkedIn",
    format: "texte",
    theme: "Vision produit",
    text: `Nous construisons l'OS des micro-entreprises africaines.\n\nWazo Digital unifie caisse, stock, CRM, logistique, formation et traçabilité dans une PWA mobile-first — hors ligne d'abord, cloud ensuite.\n\n${BRAND.pitch}\n\nDémo : ${BRAND.demoVideo}`,
    hashtags: "#SaaS #Afrique #Fintech #EdTech",
    cta: BRAND.landing,
  },
  {
    day: 5,
    channel: "TikTok",
    format: "reel",
    theme: "Hook 3 secondes",
    text: `POV : tu encaisses MoMo et le client reçoit son reçu WhatsApp avant de partir 😱\n\nApp : Wazo Digital\nSon : tendance + voix off script 60s`,
    hashtags: "#MoMo #commerce #Togo #wazodigital",
    cta: BRAND.register,
  },
  {
    day: 6,
    channel: "WhatsApp",
    format: "texte",
    theme: "Témoignage style",
    text: `« Avant Wazo, je notais tout dans un cahier. Maintenant je vois mes ventes du jour et mes stocks en rouge. »\n\n— Fatou, boutique Lomé\n\nRejoignez les commerçants qui structurent leur activité 👇`,
    cta: BRAND.register,
  },
  {
    day: 7,
    channel: "Instagram",
    format: "reel",
    theme: "Hors ligne",
    text: `Le réseau coupe ? Pas de problème.\n\nWazo Digital continue en mode hors ligne. Sync auto au retour de la 4G.\n\nParfait pour les marchés et zones mal couvertes.`,
    hashtags: "#HorsLigne #PWA #CommerceLocal",
    cta: BRAND.app,
  },
  {
    day: 8,
    channel: "Facebook",
    format: "texte",
    theme: "Agriculture",
    text: `🌾 Producteurs & coopératives :\n\n• Journal de champ par parcelle\n• Calendrier semis → récolte\n• Prix marchés locaux\n• Rendement kg/ha\n\nDigitalisez votre exploitation depuis le smartphone.`,
    cta: `${BRAND.register}?module=agriculture`,
  },
  {
    day: 9,
    channel: "Twitter",
    format: "texte",
    theme: "Chiffre clé",
    text: `2 minutes.\nC'est le temps pour créer votre boutique Wazo Digital et enregistrer votre première vente MoMo.\n\nGratuit → ${BRAND.register}`,
    hashtags: "#BuildInPublic #WazoDigital",
    cta: BRAND.register,
  },
  {
    day: 10,
    channel: "WhatsApp",
    format: "story",
    theme: "Formation",
    text: `🎓 Formateurs : cours vidéo, quiz, certificats PDF et portail élève sans installation.\n\nVos apprenants ouvrent un lien — c'est tout.`,
    cta: `${BRAND.register}?module=education`,
  },
  {
    day: 11,
    channel: "Instagram",
    format: "carrousel",
    theme: "6 modules",
    text: `1/7 Commerce 🏪\n2/7 Agriculture 🌾\n3/7 Santé 🏥\n4/7 Logistique 🚚\n5/7 Formation 🎓\n6/7 Traçabilité 🔗\n7/7 Tout activable depuis une seule app`,
    hashtags: "#MultiActivité #WazoDigital",
    cta: BRAND.landing,
  },
  {
    day: 12,
    channel: "Facebook",
    format: "texte",
    theme: "Santé",
    text: `🏥 Cabinets & pharmacies de quartier :\n\nDossiers patients, RDV, rappels de suivi WhatsApp, ordonnances PDF.\n\nWazo Digital — module Santé inclus dans tous les plans.`,
    cta: `${BRAND.register}?module=health`,
  },
  {
    day: 13,
    channel: "LinkedIn",
    format: "texte",
    theme: "Équipe BUSINESS",
    text: `Vous gérez plusieurs points de vente ou une équipe ?\n\nPlan BUSINESS Wazo Digital :\n• 10 boutiques\n• Rôles & permissions (propriétaire, employé)\n• Rapports hebdomadaires par e-mail\n\nÀ partir de 16 350 FCFA/mois.`,
    cta: BRAND.tarifs,
  },
  {
    day: 14,
    channel: "TikTok",
    format: "reel",
    theme: "Promo flash",
    text: `Comment doubler tes ventes le week-end ?\n\n1. Ouvre Wazo\n2. Crée une promo -10%\n3. Partage sur WhatsApp Status\n\nModule Promotions inclus 💰`,
    cta: `${BRAND.app}/sales/promotions`,
  },
  {
    day: 15,
    channel: "WhatsApp",
    format: "texte",
    theme: "Logistique",
    text: `🚚 Livreurs : fini les négociations au téléphone.\n\nZones & tarifs fixes par quartier + lien de suivi /suivi pour vos clients.\n\nEssai gratuit 👇`,
    cta: `${BRAND.register}?module=logistics`,
  },
  {
    day: 16,
    channel: "Instagram",
    format: "story",
    theme: "Engagement",
    text: `🔥 Série de jours actifs + badges à débloquer sur Wazo Digital.\n\nVentes, formation, livraisons… chaque action compte.\n\nGamification qui motive votre équipe.`,
    hashtags: "#Productivité #Motivation",
    cta: `${BRAND.app}/achievements`,
  },
  {
    day: 17,
    channel: "Facebook",
    format: "texte",
    theme: "Traçabilité",
    text: `🔗 Exportateurs & coopératives :\n\nCertificats d'origine PDF + QR vérifiable + ancrage blockchain Celo.\n\nRassurez vos acheteurs internationaux.`,
    cta: `${BRAND.register}?module=blockchain`,
  },
  {
    day: 18,
    channel: "Twitter",
    format: "texte",
    theme: "Tarifs transparents",
    text: `GRATUIT : 50 produits, 1 boutique, tous les modules.\nPRO : 9,99 €/mois — illimité + analytics.\nBUSINESS : équipes & multi-sites.\n\nSans engagement. Paiement MoMo.`,
    cta: BRAND.tarifs,
  },
  {
    day: 19,
    channel: "WhatsApp",
    format: "story",
    theme: "Parrainage",
    text: `📣 Vous aimez Wazo ?\n\nInvitez un collègue commerçant depuis le dashboard — bouton WhatsApp intégré.\n\nAidez votre réseau à digitaliser.`,
    cta: `${BRAND.app}/dashboard`,
  },
  {
    day: 20,
    channel: "Instagram",
    format: "reel",
    theme: "Démo",
    text: `Regardez l'app en 3 minutes 👇\n\nCaisse MoMo → crédit client → modules métier → plan PRO.\n\nVidéo complète sur notre site.`,
    hashtags: "#Demo #SaaS #Afrique",
    cta: BRAND.demoVideo,
  },
  {
    day: 21,
    channel: "Facebook",
    format: "texte",
    theme: "FAQ prix",
    text: `❓ « C'est vraiment gratuit ? »\n\nOui. 50 produits, 1 boutique, mode hors ligne, tous les modules.\n\nVous passez PRO (9,99 €/mois) quand vous voulez plus de volume et d'analytics. Sans piège.`,
    cta: BRAND.tarifs,
  },
  {
    day: 22,
    channel: "LinkedIn",
    format: "texte",
    theme: "Sécurité",
    text: `Données isolées par boutique. Authentification sécurisée. Hébergement professionnel.\n\nWazo Digital respecte le RGPD (CGU + politique de confidentialité publiées).\n\nConfiance pour vos données métier.`,
    cta: `${BRAND.landing}/legal/confidentialite`,
  },
  {
    day: 23,
    channel: "TikTok",
    format: "reel",
    theme: "Employé caisse",
    text: `Tu as des employés ?\n\nIls accèdent à la caisse sans voir la facturation.\n\nRôles équipe sur plan BUSINESS 👥`,
    cta: BRAND.tarifs,
  },
  {
    day: 24,
    channel: "WhatsApp",
    format: "texte",
    theme: "Support humain",
    text: `Une question sur Wazo Digital ?\n\nRéponse humaine sur WhatsApp :\n${BRAND.whatsapp}\n\nOu inscrivez-vous et testez en 2 minutes 👇`,
    cta: BRAND.whatsappLink,
  },
  {
    day: 25,
    channel: "Instagram",
    format: "carrousel",
    theme: "3 étapes",
    text: `1️⃣ Créez votre compte (email ou Google)\n2️⃣ Nommez votre activité + modules\n3️⃣ Vendez — même hors ligne\n\nC'est tout. Pas de formation de 3 jours.`,
    hashtags: "#Onboarding #Simple",
    cta: BRAND.register,
  },
  {
    day: 26,
    channel: "Facebook",
    format: "texte",
    theme: "Conversion PRO",
    text: `📊 +10 ventes par semaine ?\n\nLe plan PRO se rentabilise vite :\n• Produits illimités\n• 3 boutiques\n• Analytics & exports PDF\n• Support prioritaire\n\n9,99 €/mois — moins qu'un café par jour.`,
    cta: `${BRAND.app}/billing`,
  },
  {
    day: 27,
    channel: "Twitter",
    format: "texte",
    theme: "Portails publics",
    text: `4 portails sans compte pour vos clients :\n🛒 Boutique /boutique\n🎓 Formation /formation\n📦 Suivi /suivi\n🔍 Traçabilité /trace\n\nTout inclus dans Wazo Digital.`,
    cta: BRAND.landing,
  },
  {
    day: 28,
    channel: "WhatsApp",
    format: "story",
    theme: "Urgence douce",
    text: `Chaque jour sans outil = ventes perdues et stock mal suivi.\n\nCommencez gratuitement ce soir. 2 minutes suffisent.`,
    cta: BRAND.register,
  },
  {
    day: 29,
    channel: "Instagram",
    format: "reel",
    theme: "Conseil du jour",
    text: `💡 Astuce Wazo :\n\nRelancez vos clients en retard de paiement depuis l'onglet Clients — un message WhatsApp suffit.\n\nLe carnet crédit ne sert pas à décorer.`,
    hashtags: "#ConseilBusiness #CRM",
    cta: `${BRAND.app}/clients`,
  },
  {
    day: 30,
    channel: "Facebook",
    format: "texte",
    theme: "CTA final mois",
    text: `🌍 Rejoignez Wazo Digital\n\nL'application des commerçants, producteurs, formateurs et livreurs qui veulent grandir sans complexité.\n\n✅ Gratuit pour démarrer\n✅ PRO à 9,99 €/mois\n✅ Support WhatsApp ${BRAND.whatsapp}\n\n${BRAND.tagline} ${BRAND.accent}`,
    hashtags: "#WazoDigital #Afrique #Digitalisation",
    cta: BRAND.register,
  },
];
