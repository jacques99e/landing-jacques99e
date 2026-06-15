import { WAZO_BRAND, WAZO_HASHTAGS } from "./brand";

export type SocialPlatform = "instagram" | "facebook" | "linkedin" | "whatsapp" | "tiktok" | "twitter";
export type ContentPillar =
  | "awareness"
  | "product"
  | "proof"
  | "education"
  | "conversion"
  | "community";

export interface SocialPost {
  day: number;
  platform: SocialPlatform[];
  pillar: ContentPillar;
  title: string;
  copy: string;
  hashtags: string[];
  cta?: string;
  visualHint?: string;
}

const R = WAZO_BRAND.registerUrl;
const T = WAZO_BRAND.tarifsUrl;
const A = WAZO_BRAND.appUrl;
const H = WAZO_HASHTAGS;

/** 30 posts prêts à publier — calendrier 30 jours. */
export const SOCIAL_POSTS_30: SocialPost[] = [
  {
    day: 1,
    platform: ["instagram", "facebook", "whatsapp"],
    pillar: "awareness",
    title: "Le problème du cahier",
    copy: `📓 Votre cahier de ventes vous coûte cher.\n\nStocks oubliés. Créances jamais relancées. MoMo noté n'importe comment.\n\nWazo Digital met tout dans votre poche : caisse, stock, clients, boutique WhatsApp.\n\n✅ Gratuit pour démarrer\n✅ Sans carte bancaire\n\n👉 ${R}?module=commerce`,
    hashtags: [...H.core, ...H.commerce],
    visualHint: "Split screen : cahier désordonné vs dashboard Wazo propre",
  },
  {
    day: 2,
    platform: ["instagram", "tiktok"],
    pillar: "product",
    title: "Caisse MoMo en 3 clics",
    copy: `💰 Vendre avec Mobile Money, c'est simple :\n\n1️⃣ Ajoutez le produit\n2️⃣ Choisissez MoMo ou espèces\n3️⃣ Envoyez le reçu sur WhatsApp\n\nC'est tout. Pas d'ordinateur. Pas d'Excel.\n\nEssai gratuit → ${R}`,
    hashtags: [...H.core, ...H.commerce, "#MoMo", "#Togo"],
    visualHint: "Écran caisse /sales avec animation 3 taps",
  },
  {
    day: 3,
    platform: ["linkedin", "facebook"],
    pillar: "education",
    title: "Digitaliser sans budget",
    copy: `Micro-entreprises africaines : vous n'avez pas besoin d'un ERP à 500 €/mois.\n\nWazo Digital démarre à 0 €. Passez au PRO (9,99 €/mois) quand votre activité grandit.\n\n📊 Analytics, exports PDF, 3 boutiques.\n\n${T}`,
    hashtags: [...H.core, "#PME", "#SaaS", "#Francophone"],
    cta: T,
  },
  {
    day: 4,
    platform: ["instagram", "whatsapp"],
    pillar: "product",
    title: "Mode hors ligne",
    copy: `📵 Pas de réseau ? Pas de problème.\n\nWazo continue de fonctionner hors ligne. Vos ventes se synchronisent dès que la 4G revient.\n\nParfait pour les marchés, les zones rurales et les coupures électriques.\n\n${R}`,
    hashtags: [...H.core, "#HorsLigne", "#InnovationAfrique"],
    visualHint: "Icône avion mode + vente validée offline",
  },
  {
    day: 5,
    platform: ["facebook", "instagram"],
    pillar: "conversion",
    title: "Plan PRO = 33 centimes/jour",
    copy: `☕ Moins qu'un café par jour.\n\nLe plan PRO Wazo Digital : 9,99 €/mois\n\n→ Produits illimités\n→ 3 boutiques\n→ Analytics & rapports PDF\n→ Support prioritaire\n\nSans engagement. Upgrade en 1 clic.\n\n${T}`,
    hashtags: [...H.core, "#PRO", "#ROI"],
  },
  {
    day: 6,
    platform: ["instagram", "tiktok"],
    pillar: "product",
    title: "Boutique WhatsApp",
    copy: `🛒 Vos clients commandent sans installer d'app.\n\nPartagez votre lien boutique sur WhatsApp Status. Ils voient vos produits, vous encaissez en MoMo.\n\nVitrine en ligne incluse dans le plan gratuit.\n\n${R}?module=commerce`,
    hashtags: [...H.commerce, "#WhatsAppBusiness", "#EcommerceAfrique"],
    visualHint: "Lien boutique + mockup téléphone client",
  },
  {
    day: 7,
    platform: ["whatsapp", "facebook"],
    pillar: "community",
    title: "Témoignage type",
    copy: `💬 « Avant Wazo, je perdais 2 heures par jour à compter le stock. Maintenant je vois mes ventes du jour en un coup d'œil. »\n\n— Commerçant, Lomé\n\nRejoignez les entrepreneurs qui structurent leur activité.\n\n${R}`,
    hashtags: [...H.core, "#Temoignage"],
    visualHint: "Citation sur fond vert Wazo + photo commerçant",
  },
  {
    day: 8,
    platform: ["instagram", "linkedin"],
    pillar: "product",
    title: "Module Agriculture",
    copy: `🌾 Producteurs & coopératives :\n\n• Journal de champ\n• Calendrier cultural\n• Prix marchés locaux\n• Rendement kg/ha\n\nDigitalisez votre exploitation depuis le smartphone.\n\n${R}?module=agriculture`,
    hashtags: [...H.agri, ...H.core],
  },
  {
    day: 9,
    platform: ["facebook", "instagram"],
    pillar: "product",
    title: "Module Formation",
    copy: `🎓 Formateurs : arrêtez d'envoyer des PDF par WhatsApp.\n\n• Cours vidéo YouTube ou MP4\n• Quiz par leçon\n• Portail élève /formation\n• Certificat PDF avec QR vérifiable\n\n${R}?module=education`,
    hashtags: [...H.edu, ...H.core, "#Certificat"],
  },
  {
    day: 10,
    platform: ["linkedin", "twitter"],
    pillar: "proof",
    title: "6 modules, 1 app",
    copy: `Une seule app. Six métiers :\n\n🏪 Commerce · 🌾 Agriculture · 🏥 Santé\n🚚 Logistique · 📚 Formation · 🔗 Traçabilité\n\nActivez uniquement ce dont vous avez besoin. Le reste reste masqué.\n\n${WAZO_BRAND.landingUrl}/#modules`,
    hashtags: [...H.core, "#AllInOne"],
  },
  {
    day: 11,
    platform: ["instagram", "tiktok"],
    pillar: "product",
    title: "Promo flash",
    copy: `📣 Weekend promo ?\n\nCréez une promotion flash (-10 %, -20 %…) directement dans la caisse Wazo. Partagez-la sur WhatsApp Status.\n\nPlus de clients. Plus de ventes. Zéro tableur.\n\n${A}/sales/promotions`,
    hashtags: [...H.commerce, "#Promo", "#Weekend"],
  },
  {
    day: 12,
    platform: ["facebook", "whatsapp"],
    pillar: "education",
    title: "Crédit client",
    copy: `💳 « Il me doit combien déjà ? »\n\nLe carnet crédit Wazo affiche chaque client, le montant dû et la date. Relance WhatsApp en 1 clic.\n\nFini les créances oubliées.\n\n${A}/sales/credit`,
    hashtags: [...H.commerce, "#GestionClient"],
  },
  {
    day: 13,
    platform: ["instagram"],
    pillar: "product",
    title: "Logistique & suivi",
    copy: `🚚 Livreurs : fini les appels « Où est mon colis ? »\n\n• Zones & tarifs par quartier\n• Tournée du jour\n• Lien suivi /suivi pour le client\n\n${R}?module=logistics`,
    hashtags: [...H.logistics, ...H.core],
  },
  {
    day: 14,
    platform: ["facebook", "linkedin"],
    pillar: "conversion",
    title: "BUSINESS pour équipes",
    copy: `👥 Vous avez une équipe ?\n\nPlan BUSINESS — 24,99 €/mois :\n\n→ 10 boutiques\n→ Rôles employé / manager\n→ Rapport hebdo par e-mail\n→ Onboarding dédié\n\n${T}`,
    hashtags: [...H.core, "#Equipe", "#MultiSite"],
  },
  {
    day: 15,
    platform: ["instagram", "tiktok"],
    pillar: "product",
    title: "Série & badges",
    copy: `🔥 7 jours d'affilée sur Wazo = badge « Semaine champion »\n\nSérie quotidienne, badges de progression, conseils business chaque matin.\n\nGérer son activité devient motivant.\n\n${A}/dashboard`,
    hashtags: [...H.core, "#Gamification", "#Productivite"],
    visualHint: "Capture dashboard série + badges",
  },
  {
    day: 16,
    platform: ["whatsapp", "facebook"],
    pillar: "awareness",
    title: "2 minutes pour démarrer",
    copy: `⏱️ 2 minutes chrono :\n\n1. Créez votre compte\n2. Nommez votre activité\n3. Choisissez vos modules\n4. Enregistrez votre 1ère vente\n\nC'est aussi simple que ça.\n\n${R}`,
    hashtags: [...H.core],
  },
  {
    day: 17,
    platform: ["instagram", "linkedin"],
    pillar: "product",
    title: "Santé & rappels",
    copy: `🏥 Cabinets & pharmacies de quartier :\n\n• Dossiers patients\n• RDV + rappels SMS/WhatsApp\n• Rappels de suivi patients\n• Ordonnances PDF\n\n${R}?module=health`,
    hashtags: [...H.core, "#Sante", "#Cabinet"],
  },
  {
    day: 18,
    platform: ["facebook", "instagram"],
    pillar: "proof",
    title: "Sécurité des données",
    copy: `🔒 Vos données vous appartiennent.\n\n• HTTPS chiffré\n• Isolation par boutique (RLS)\n• Connexion sécurisée Supabase\n• Mode hors ligne local sur votre téléphone\n\n${WAZO_BRAND.legalUrl}/confidentialite`,
    hashtags: [...H.core, "#CyberSecurite", "#Confiance"],
  },
  {
    day: 19,
    platform: ["tiktok", "instagram"],
    pillar: "product",
    title: "Traçabilité blockchain",
    copy: `🔗 Exportateurs & coopératives :\n\nCertificat d'origine PDF + QR code + ancrage blockchain Celo.\n\nRassurez vos acheteurs. Prouvez l'origine de vos lots.\n\n${R}?module=blockchain`,
    hashtags: [...H.core, "#Blockchain", "#Traceabilite", "#Export"],
  },
  {
    day: 20,
    platform: ["linkedin", "facebook"],
    pillar: "education",
    title: "Pourquoi pas Excel ?",
    copy: `Excel sur téléphone = cauchemar.\n\nWazo est pensé mobile-first :\n→ Gros boutons\n→ Navigation basse\n→ Installation PWA sur l'écran d'accueil\n→ MoMo natif\n\nConçu pour l'Afrique, par l'Afrique.\n\n${R}`,
    hashtags: [...H.core, "#MobileFirst"],
  },
  {
    day: 21,
    platform: ["instagram", "whatsapp"],
    pillar: "community",
    title: "Parrainage",
    copy: `🤝 Connaissez un commerçant qui galère avec son cahier ?\n\nPartagez Wazo Digital. Bouton « Inviter un collègue » dans l'app → message WhatsApp pré-rempli.\n\nEnsemble, on digitalise l'économie locale.\n\n${R}`,
    hashtags: [...H.core, "#Parrainage", "#Reseau"],
  },
  {
    day: 22,
    platform: ["facebook", "instagram"],
    pillar: "conversion",
    title: "Comparaison tarifs",
    copy: `📊 GRATUIT vs PRO vs BUSINESS\n\n| | Gratuit | PRO | Business |\n| Produits | 50 | ∞ | ∞ |\n| Boutiques | 1 | 3 | 10 |\n| Analytics | ❌ | ✅ | ✅ |\n| Équipe | ❌ | ❌ | ✅ |\n\nDétail complet → ${T}`,
    hashtags: [...H.core, "#Tarifs", "#Transparent"],
    visualHint: "Infographie comparatif 3 colonnes",
  },
  {
    day: 23,
    platform: ["tiktok", "instagram"],
    pillar: "product",
    title: "Alertes stock",
    copy: `🚨 Stock bas ? Wazo vous alerte avant la rupture.\n\nDashboard rouge + notification. Vous restockez à temps. Vous ne perdez plus de ventes.\n\nInclus dans tous les plans.\n\n${A}/products`,
    hashtags: [...H.commerce, "#Stock", "#Alerte"],
  },
  {
    day: 24,
    platform: ["linkedin", "facebook"],
    pillar: "education",
    title: "Cas d'usage multi-activité",
    copy: `🧩 Boutique + livraison + formation ?\n\nActivez Commerce + Logistique + Formation dans une seule app. Un seul abonnement. Un seul tableau de bord.\n\nC'est le modèle Wazo : multi-modules, une interface.\n\n${R}`,
    hashtags: [...H.core, "#MultiActivite"],
  },
  {
    day: 25,
    platform: ["instagram", "whatsapp"],
    pillar: "product",
    title: "Rapport PDF hebdo",
    copy: `📈 Chaque lundi, votre bilan en PDF.\n\nVentes de la semaine, top produits, alertes — exportable et partageable avec un partenaire ou banquier.\n\nPlan PRO et BUSINESS.\n\n${A}/billing?plan=pro`,
    hashtags: [...H.core, "#Analytics", "#Rapport"],
  },
  {
    day: 26,
    platform: ["facebook", "instagram"],
    pillar: "awareness",
    title: "Vidéo démo",
    copy: `🎬 Vous voulez voir avant de vous inscrire ?\n\nRegardez la démo 3 min sur notre site : caisse MoMo, crédit client, modules métier, abonnement PRO.\n\n${WAZO_BRAND.demoVideoUrl}\n\nPuis essai gratuit → ${R}`,
    hashtags: [...H.core, "#Demo", "#Video"],
    cta: WAZO_BRAND.demoVideoUrl,
  },
  {
    day: 27,
    platform: ["whatsapp", "facebook"],
    pillar: "community",
    title: "Support WhatsApp",
    copy: `💬 Une question ? On répond sur WhatsApp.\n\n${WAZO_BRAND.whatsapp}\n\nSetup en 15 min avec notre équipe. Première vente le jour J.\n\n${R}`,
    hashtags: [...H.core, "#Support", "#ServiceClient"],
  },
  {
    day: 28,
    platform: ["instagram", "tiktok"],
    pillar: "product",
    title: "Journal de champ",
    copy: `🌱 Semis, traitement, récolte — notez tout au champ.\n\nJournal agricole Wazo : date, parcelle, activité, photo. Historique consultable. Export pour coopérative.\n\n${A}/agriculture/journal`,
    hashtags: [...H.agri, "#JournalDeChamp"],
  },
  {
    day: 29,
    platform: ["linkedin", "facebook"],
    pillar: "conversion",
    title: "Offre pilote",
    copy: `🚀 Lancement officiel Wazo Digital\n\n10 places pilotes ce mois :\n→ Setup accompagné gratuit\n→ 1 mois PRO offert si vous enregistrez 20 ventes en 7 jours\n\nContact : ${WAZO_BRAND.whatsapp}\n\n${R}`,
    hashtags: [...H.core, "#Lancement", "#OffrePilote"],
  },
  {
    day: 30,
    platform: ["instagram", "facebook", "whatsapp", "linkedin"],
    pillar: "conversion",
    title: "CTA final mois",
    copy: `✅ Récap du mois :\n\n• Caisse MoMo + stock + WhatsApp\n• 6 modules métier\n• Gratuit pour démarrer\n• PRO à 9,99 €/mois\n• Fonctionne hors ligne\n\nVotre activité mérite mieux qu'un cahier.\n\n👉 ${R}\n\n${WAZO_BRAND.name} — Fait avec ❤️ pour l'Afrique`,
    hashtags: [...H.core, ...H.commerce, ...H.agri, ...H.edu, ...H.logistics],
    visualHint: "Carrousel récap 5 slides + CTA final",
  },
];
