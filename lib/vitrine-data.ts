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

export const APP_STATS = [
  { value: "6", label: "modules métier" },
  { value: "Nexus", label: "score continental" },
  { value: "Premium", label: "outils exclusifs" },
  { value: "MoMo", label: "Mobile Money" },
] as const;

export const WAZO_PREMIUM_HIGHLIGHTS = [
  "Wazo Nexus — score santé business 0-100",
  "Caisse Vocale en français (marché sans clavier)",
  "Tontine Digitale pour commerçants",
  "Agri Radar — alertes maladies & prix",
  "Santé Sentinel — veille vaccinale communautaire",
  "Fleet Pulse — flotte & carburant FCFA/km",
  "Micro-Badges vérifiables par QR",
  "Passeport Produit pour export international",
  "Liens MoMo PayDunya LIVE — paiement 1 clic + notif",
] as const;

/** Numéro WhatsApp support (lien wa.me sans + ni espaces) */
export const WHATSAPP_SUPPORT = "+22893924040";

export const NAV_LINKS = [
  { label: "L'application", href: "#application" },
  { label: "Démo", href: "#demo" },
  { label: "Modules", href: "#modules" },
  { label: "Premium", href: "#premium" },
  { label: "Portails", href: "#portails" },
  { label: "Tarifs", href: "/tarifs" },
  { label: "FAQ", href: "#faq" },
] as const;

export const DEMO_VIDEO = {
  title: "Wazo Digital — tour complet (~1 min)",
  subtitle:
    "Parcours réel avec voix Microsoft Edge (naturelle) : commerce, santé, agriculture, logistique, formation, traçabilité, notifications et équipe.",
  webmSrc: "/videos/wazo-demo.webm",
  mp4Src: "/videos/wazo-demo.mp4",
  poster: "/videos/wazo-demo-poster.jpg",
  durationLabel: "~1 min",
} as const;

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
      "Caisse Vocale — vendre à la voix en français",
      "Tontine Digitale + carnet crédit WhatsApp",
      "Wazo Nexus score & catalogue MoMo",
      "Boutique publique hors ligne",
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
      "Agri Radar — maladies & signaux prix",
      "Calendrier cultural + météo GPS",
      "Prix marchés & rendement kg/ha",
      "Vente récolte en 1 clic",
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
      "Santé Sentinel — veille épidémique",
      "Mini pharmacie + dossiers patients",
      "RDV + rappels WhatsApp/SMS",
      "Téléconsultation directe",
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
      "Fleet Pulse — flotte & carburant",
      "Tournée optimisée + /suivi public",
      "MoMo à la livraison",
      "Preuve photo/signature",
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
      "Micro-Badges QR vérifiables",
      "Présences PDF + portail /formation",
      "Cours hors ligne faible data",
      "Certificats bailleurs",
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
      "Passeport Produit export UE",
      "QR étiquettes → /trace public",
      "Hash GPS + contrats coop",
      "Grand livre infalsifiable",
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
    subtitle: "Pour démarrer",
    price: "0 €/mois",
    features: ["50 produits", "1 boutique", "Vitrine en ligne", "Mode hors ligne"],
    popular: false,
  },
  {
    id: "pro",
    title: "PRO",
    subtitle: "Pour les pros",
    price: "9,99 €/mois",
    features: ["Produits illimités", "3 boutiques", "Analytics & insights", "Support prioritaire"],
    popular: true,
  },
  {
    id: "business",
    title: "BUSINESS",
    subtitle: "Pour les équipes",
    price: "24,99 €/mois",
    features: ["Tout illimité", "10 boutiques", "Équipe & rôles", "Rapports hebdo par email"],
    popular: false,
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
      "Ma boutique WhatsApp et ma caisse sont dans la même app. Je vois mes ventes du jour en un coup d'œil.",
    name: "Fatou",
    role: "Commerçante — Sénégal",
  },
  {
    quote:
      "Je note les prix du marché et je calcule mon rendement avant de vendre la récolte.",
    name: "Kofi",
    role: "Agriculteur — Ghana",
  },
  {
    quote:
      "Mes élèves suivent les cours sur /formation et reçoivent un certificat avec QR code.",
    name: "Aïcha",
    role: "Formatrice — Côte d'Ivoire",
  },
] as const;
