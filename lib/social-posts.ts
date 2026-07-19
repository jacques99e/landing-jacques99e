/** Textes marketing Wazo pour Facebook / Instagram. */

export type SocialPostKey = "register" | "pilote" | "pro";

export interface SocialPost {
  key: SocialPostKey;
  message: string;
  /** Légende Instagram (souvent = message, sans formatage lourd). */
  caption: string;
}

const REGISTER = "https://wazo-digital.com/register";
const GUIDE = "https://wazo-digital.com/guide-pilote";

const POSTS: Record<SocialPostKey, SocialPost> = {
  register: {
    key: "register",
    message: [
      "Wazo Digital — l'app pour digitaliser votre commerce en Afrique",
      "",
      "✅ Catalogue + WhatsApp",
      "✅ Caisse (espèces & Mobile Money)",
      "✅ Mode hors ligne sur téléphone",
      "",
      `Inscription gratuite : ${REGISTER}`,
      "Sans engagement · PRO à 9,99 €/mois si vous voulez aller plus loin",
    ].join("\n"),
    caption: [
      "Wazo Digital — digitalisez votre commerce en Afrique 🌍",
      "",
      "Catalogue WhatsApp · Caisse · Hors ligne",
      "",
      `Inscription : ${REGISTER}`,
      "",
      "#WazoDigital #CommerceAfrique #WhatsAppBusiness #MobileMoney",
    ].join("\n"),
  },
  pilote: {
    key: "pilote",
    message: [
      "On cherche des commerçants pilotes pour tester Wazo Digital",
      "",
      "Boutique, restaurant, coiffure, agriculture…",
      "On vous accompagne pas à pas (15 min).",
      "",
      `Guide : ${GUIDE}`,
      `S'inscrire : ${REGISTER}`,
    ].join("\n"),
    caption: [
      "Commerçants pilotes recherchés 📣",
      "",
      "Testez Wazo Digital avec accompagnement (15 min).",
      "",
      `Guide : ${GUIDE}`,
      `Inscription : ${REGISTER}`,
      "",
      "#WazoDigital #Pilote #EntrepreneursAfrique",
    ].join("\n"),
  },
  pro: {
    key: "pro",
    message: [
      "Wazo Digital PRO — 9,99 €/mois",
      "",
      "Rapport hebdo par email, équipe, modules avancés.",
      "Paiement Mobile Money (MoMo) depuis l'app.",
      "",
      `Essai gratuit d'abord : ${REGISTER}`,
    ].join("\n"),
    caption: [
      "Wazo Digital PRO — 9,99 €/mois",
      "",
      "Rapport hebdo · Équipe · Modules avancés · MoMo",
      "",
      `Essai gratuit : ${REGISTER}`,
      "",
      "#WazoDigital #PRO #MobileMoney",
    ].join("\n"),
  },
};

const ORDER: SocialPostKey[] = ["register", "pilote", "pro"];

export function listSocialPosts(): SocialPost[] {
  return ORDER.map((k) => POSTS[k]);
}

export function getSocialPost(key?: string | null): SocialPost {
  if (key && key in POSTS) return POSTS[key as SocialPostKey];
  // Rotation stable par jour UTC
  const day = Math.floor(Date.now() / 86_400_000);
  return POSTS[ORDER[day % ORDER.length]];
}

export function defaultSocialImageUrl(): string {
  const base =
    process.env.NEXT_PUBLIC_LANDING_URL?.trim().replace(/\/$/, "") ||
    "https://wazo-digital.com";
  return (
    process.env.META_SOCIAL_IMAGE_URL?.trim() || `${base}/social-card.png`
  );
}
