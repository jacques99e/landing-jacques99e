#!/usr/bin/env node
/**
 * Textes prêts pour communication lancement (WhatsApp status, réseaux).
 * Usage: node scripts/launch-social.mjs [register|pilote|pro]
 */
const REGISTER = "https://wazo-digital.com/register";
const GUIDE = "https://wazo-digital.com/guide-pilote";
const DEMO = "https://wazo-digital.com";

const POSTS = {
  register: [
    "🚀 *Wazo Digital* — l'app pour digitaliser votre commerce en Afrique",
    "",
    "✅ Catalogue + WhatsApp",
    "✅ Caisse (espèces & Mobile Money)",
    "✅ Mode hors ligne sur téléphone",
    "",
    `Inscription gratuite : ${REGISTER}`,
    "Sans engagement · PRO à 9,99 €/mois si vous voulez aller plus loin",
  ].join("\n"),

  pilote: [
    "📣 On cherche 5 commerçants pilotes pour tester *Wazo Digital*",
    "",
    "Boutique, restaurant, coiffure, agriculture…",
    "On vous accompagne pas à pas (15 min).",
    "",
    `Guide : ${GUIDE}`,
    `S'inscrire : ${REGISTER}`,
  ].join("\n"),

  pro: [
    "💳 *Wazo Digital PRO* — 9,99 €/mois",
    "",
    "Rapport hebdo par email, équipe, modules avancés.",
    "Paiement Mobile Money (MoMo) depuis l'app.",
    "",
    `Essai gratuit d'abord : ${REGISTER}`,
  ].join("\n"),
};

const key = process.argv[2]?.trim() || "register";
const text = POSTS[key] || POSTS.register;

console.log(`--- Post « ${key} » ---\n`);
console.log(text);
console.log("\n--- WhatsApp status (lien) ---");
console.log(`https://wa.me/?text=${encodeURIComponent(text)}`);
console.log(`\nSite : ${DEMO}`);
