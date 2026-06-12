import type { LucideIcon } from "lucide-react";
import {
  Blocks,
  GraduationCap,
  HeartPulse,
  Leaf,
  Lock,
  Package,
  ShieldCheck,
  Smartphone,
  Store,
  Truck,
  WifiOff,
} from "lucide-react";

export const HERO = {
  badge: "🚀 L'app n°1 pour gérer votre activité en Afrique",
  title: "Encaissez plus. Perdez moins de temps.",
  titleAccent: "Tout depuis votre téléphone.",
  subtitle:
    "Caisse MoMo, stock, crédit clients, livraisons et boutique WhatsApp — une seule app qui remplace cahier, Excel et 5 outils différents.",
  ctaPrimary: "Démarrer gratuitement",
  ctaSecondary: "Voir comment ça marche",
  reassurance: "Sans carte bancaire · Gratuit pour toujours · Upgrade PRO en 1 clic",
} as const;

export const APP_STATS = [
  { value: "2 min", label: "pour démarrer" },
  { value: "6", label: "modules métier" },
  { value: "0 €", label: "pour commencer" },
  { value: "MoMo", label: "Mobile Money intégré" },
] as const;

export const SOCIAL_PROOF_ITEMS = [
  { emoji: "🏪", highlight: "+500", label: "commerçants actifs" },
  { emoji: "⭐", highlight: "4,8/5", label: "satisfaction utilisateurs" },
  { emoji: "📱", highlight: "100%", label: "mobile & hors ligne" },
  { emoji: "💰", highlight: "9,99 €", label: "seulement pour le PRO" },
] as const;

export const PAIN_GAIN = {
  title: "Et si tout tenait dans votre poche ?",
  subtitle:
    "La plupart des commerçants perdent des ventes faute d'outil simple. Wazo change la donne — voici la différence en 30 secondes.",
  withoutLabel: "Sans Wazo Digital",
  withLabel: "Avec Wazo Digital",
  without: [
    "Cahier illisible, stocks oubliés, créances jamais relancées",
    "Clients WhatsApp et caisse sur des apps différentes",
    "Impossible de vendre quand le réseau coupe",
    "Aucune vue claire sur la journée ou le mois",
  ],
  with: [
    "Caisse MoMo + reçu WhatsApp en un geste",
    "Alertes stock et relance crédit automatique",
    "Mode hors ligne : vous vendez quand même",
    "Dashboard : ventes, alertes et modules en un écran",
  ],
  cta: "Je veux ça — essayer le PRO",
} as const;

export const STICKY_CTA = {
  title: "Prêt à structurer votre activité ?",
  subtitle: "Gratuit pour démarrer · PRO à 9,99 €/mois sans engagement",
  button: "Choisir PRO",
} as const;

export const MID_CTA_AFTER_DEMO = {
  eyebrow: "Vous avez vu la démo ?",
  title: "Imaginez la même chose pour votre boutique demain matin",
  subtitle:
    "Inscription en 2 minutes. Vous testez gratuitement, puis vous passez au PRO quand vous voulez plus de volume et d'analytics.",
} as const;

export const MID_CTA_BEFORE_PRICING = {
  eyebrow: "Presque prêt ?",
  title: "Le plan PRO paie sa facture dès la première semaine",
  subtitle:
    "Produits illimités, 3 boutiques, analytics et support prioritaire — pour moins qu'un café par jour.",
} as const;

/** Numéro WhatsApp support (lien wa.me sans + ni espaces) */
export const WHATSAPP_SUPPORT = "+22893924040";

export const NAV_LINKS = [
  { label: "L'application", href: "#application" },
  { label: "Démo", href: "#demo" },
  { label: "Modules", href: "#modules" },
  { label: "Tarifs", href: "#tarifs" },
  { label: "FAQ", href: "#faq" },
] as const;

export const DEMO_VIDEO = {
  title: "Wazo Digital — tutoriel + pourquoi passer au PRO",
  subtitle:
    "Regardez l'app en action : caisse MoMo, crédit client, modules métier — puis la page abonnement PRO à 9,99 €/mois.",
  webmSrc: "/videos/wazo-demo.webm",
  mp4Src: "/videos/wazo-demo.mp4",
  poster: "/videos/wazo-demo-poster.jpg",
  durationLabel: "~3 min 30",
} as const;

/** Chapitres affichés sous la vidéo (alignés sur le parcours enregistré). */
export const DEMO_CHAPTERS = [
  { emoji: "⚡", label: "Accroche" },
  { emoji: "📊", label: "Dashboard" },
  { emoji: "🏪", label: "Produits & caisse MoMo" },
  { emoji: "💳", label: "Crédit WhatsApp" },
  { emoji: "⭐", label: "Abonnement PRO" },
  { emoji: "🩺", label: "Santé & RDV" },
  { emoji: "🌾", label: "Agriculture" },
  { emoji: "🚚", label: "Livraisons" },
  { emoji: "🔗", label: "QR traçabilité" },
  { emoji: "🚀", label: "Passer au PRO" },
] as const;

export interface AppModule {
  id: string;
  icon: LucideIcon;
  emoji: string;
  title: string;
  tagline: string;
  features: string[];
  color: string;
}

export const APP_MODULES: AppModule[] = [
  {
    id: "commerce",
    icon: Package,
    emoji: "🏪",
    title: "Commerce",
    tagline: "Caisse, stock et boutique WhatsApp",
    features: [
      "Caisse MoMo + reçu WhatsApp automatique",
      "Carnet crédit client avec relance",
      "Catalogue & boutique publique sans appli",
      "Caisse hors ligne avec sync auto",
    ],
    color: "bg-[#075E54]",
  },
  {
    id: "agriculture",
    icon: Leaf,
    emoji: "🌾",
    title: "Agriculture",
    tagline: "Champs, intrants et prix marchés",
    features: [
      "Calendrier cultural (semis → récolte)",
      "Météo GPS + conseils agricoles",
      "Prix marchés locaux comparables",
      "Rendement kg/ha & vente récolte",
    ],
    color: "bg-emerald-700",
  },
  {
    id: "health",
    icon: HeartPulse,
    emoji: "🏥",
    title: "Santé",
    tagline: "Patients, RDV et rappels",
    features: [
      "Dossiers patients + ordonnances PDF",
      "Mini pharmacie avec alertes stock",
      "RDV du jour + rappels WhatsApp/SMS",
      "Téléconsultation via WhatsApp",
    ],
    color: "bg-rose-600",
  },
  {
    id: "logistics",
    icon: Truck,
    emoji: "🚚",
    title: "Logistique",
    tagline: "Livraisons et suivi client",
    features: [
      "Tournée du jour + partage WhatsApp",
      "Portail public /suivi sans compte",
      "Paiement MoMo à la livraison",
      "Preuve de livraison photo/signature",
    ],
    color: "bg-sky-600",
  },
  {
    id: "education",
    icon: GraduationCap,
    emoji: "📚",
    title: "Formation",
    tagline: "Cours, élèves et certificats",
    features: [
      "Feuille de présence + export PDF",
      "Portail /formation sans installation",
      "Cours hors ligne (faible data)",
      "Certificats PDF avec QR vérifiable",
    ],
    color: "bg-amber-600",
  },
  {
    id: "blockchain",
    icon: Blocks,
    emoji: "✅",
    title: "Traçabilité",
    tagline: "Preuve d'origine infalsifiable",
    features: [
      "QR sur étiquettes → portail /trace",
      "Hash GPS infalsifiable à l'origine",
      "Contrats numériques coopératives",
      "Grand livre vérifiable pour export",
    ],
    color: "bg-indigo-600",
  },
];

export const PUBLIC_PORTALS = [
  {
    emoji: "🛒",
    title: "Boutique en ligne",
    desc: "Vitrine publique pour vos clients",
    path: "/boutique",
    example: true,
  },
  {
    emoji: "🎓",
    title: "Portail formation",
    desc: "Vos apprenants accèdent par code",
    path: "/formation",
    example: false,
  },
  {
    emoji: "📦",
    title: "Suivi colis",
    desc: "Le client suit sa livraison",
    path: "/suivi",
    example: false,
  },
  {
    emoji: "🔍",
    title: "Vérification traçabilité",
    desc: "Preuve d'origine par hash",
    path: "/trace",
    example: false,
  },
] as const;

export const APP_FEATURES = [
  {
    icon: Store,
    title: "Tableau de bord unifié",
    desc: "Ventes du jour, alertes stock et modules actifs sur un seul écran.",
  },
  {
    icon: Smartphone,
    title: "Pensé pour le smartphone",
    desc: "Navigation basse, gros boutons, installation PWA sur l'écran d'accueil.",
  },
  {
    icon: WifiOff,
    title: "Fonctionne hors ligne",
    desc: "Continuez à vendre sans réseau — sync automatique au retour de connexion.",
  },
] as const;

export const TRUST_SIGNALS = [
  {
    icon: ShieldCheck,
    title: "Données isolées par boutique",
    desc: "Chaque compte ne voit que ses propres ventes, stocks et clients — politiques RLS Supabase.",
  },
  {
    icon: Lock,
    title: "Connexion sécurisée",
    desc: "Authentification Supabase (e-mail, Google, téléphone). Sessions chiffrées HTTPS.",
  },
  {
    icon: Smartphone,
    title: "Vos données, votre téléphone",
    desc: "Mode hors ligne local : vos opérations restent sur l'appareil jusqu'à la synchronisation.",
  },
] as const;

export const STEPS = [
  {
    n: "1",
    title: "Créez votre compte",
    desc: "Inscription sur ce site (email, Google ou téléphone).",
  },
  {
    n: "2",
    title: "Configurez votre activité",
    desc: "Nommez votre boutique et choisissez vos modules.",
  },
  {
    n: "3",
    title: "Ouvrez l'application",
    desc: "Gérez ventes, stocks et clients dans Wazo Digital.",
  },
] as const;

export const PRICING = [
  {
    id: "free",
    title: "GRATUIT",
    subtitle: "Pour tester sans risque",
    price: "0 €",
    priceSuffix: "/mois",
    hook: "Idéal pour découvrir l'app",
    features: ["50 produits", "1 boutique", "Vitrine en ligne", "Mode hors ligne", "Tous les modules"],
    popular: false,
    cta: "Commencer gratuit",
    ctaVariant: "outline" as const,
  },
  {
    id: "pro",
    title: "PRO",
    subtitle: "Le choix des commerçants actifs",
    price: "9,99 €",
    priceSuffix: "/mois",
    hook: "≈ 33 centimes par jour",
    features: [
      "Produits illimités",
      "3 boutiques",
      "Analytics & exports PDF",
      "Support prioritaire",
      "Sans engagement",
    ],
    popular: true,
    cta: "Choisir PRO — je m'abonne",
    ctaVariant: "primary" as const,
  },
  {
    id: "business",
    title: "BUSINESS",
    subtitle: "Pour équipes & multi-sites",
    price: "24,99 €",
    priceSuffix: "/mois",
    hook: "ROI dès 2 employés",
    features: ["Tout illimité", "10 boutiques", "Équipe & rôles", "Rapports hebdo par email", "Onboarding dédié"],
    popular: false,
    cta: "Passer au BUSINESS",
    ctaVariant: "outline" as const,
  },
] as const;

export const PRICING_COMPARISON = [
  { feature: "Produits & stock", free: "50 max", pro: "Illimité", business: "Illimité" },
  { feature: "Boutiques", free: "1", pro: "3", business: "10" },
  { feature: "Modules métier", free: "Tous", pro: "Tous", business: "Tous" },
  { feature: "Vitrine /boutique", free: true, pro: true, business: true },
  { feature: "Mode hors ligne", free: true, pro: true, business: true },
  { feature: "Analytics & PDF", free: false, pro: true, business: true },
  { feature: "Notifications push", free: true, pro: true, business: true },
  { feature: "Équipe & rôles", free: false, pro: false, business: true },
  { feature: "Rapport e-mail hebdo", free: false, pro: false, business: true },
  { feature: "Support", free: "Communauté", pro: "Prioritaire", business: "Prioritaire +" },
] as const;

export const FAQS = [
  {
    q: "Quelle est la différence entre ce site et l'application ?",
    a: "Ce site présente Wazo Digital et gère votre inscription. L'application (wazo-digital.vercel.app) est l'outil de gestion au quotidien : caisse, stock, modules métier.",
  },
  {
    q: "L'application fonctionne-t-elle sans Internet ?",
    a: "Oui. Vous pouvez enregistrer ventes et produits hors ligne. Les données se synchronisent dès que la connexion revient.",
  },
  {
    q: "Quels moyens de paiement sont acceptés ?",
    a: "Espèces, Mobile Money (Orange, MTN, Moov…) et carte selon votre configuration dans la caisse.",
  },
  {
    q: "Puis-je former mes clients ou élèves sans qu'ils aient l'app ?",
    a: "Oui. Le portail public /formation permet l'accès par code invitation, avec certificats PDF vérifiables par QR code.",
  },
  {
    q: "Comment mes clients suivent une livraison ?",
    a: "Chaque colis a un code suivi. Partagez le lien /suivi — le destinataire voit le statut sans créer de compte.",
  },
  {
    q: "Mes données sont-elles en sécurité ?",
    a: "Oui. Connexion chiffrée (HTTPS), authentification Supabase et isolation des données par boutique. Seuls vous et votre équipe autorisée accédez à vos informations.",
  },
] as const;

export const TESTIMONIALS = [
  {
    quote:
      "Avant j'avais 3 cahiers. Maintenant ma caisse MoMo et ma boutique WhatsApp sont au même endroit — j'ai passé au PRO en 2 semaines.",
    name: "Fatou",
    role: "Commerçante — Sénégal",
    result: "+40 % de ventes suivies",
  },
  {
    quote:
      "Le calendrier cultural et les prix marché m'ont évité une mauvaise vente. Je recommande le PRO à tous les coopérateurs.",
    name: "Kofi",
    role: "Agriculteur — Ghana",
    result: "Plan PRO depuis 6 mois",
  },
  {
    quote:
      "Mes élèves accèdent aux cours sans installer l'app. Le plan BUSINESS nous a permis d'ajouter 2 formatrices.",
    name: "Aïcha",
    role: "Formatrice — Côte d'Ivoire",
    result: "120 apprenants actifs",
  },
] as const;
