#!/usr/bin/env node
/**
 * Messages WhatsApp prêts à copier pour le programme pilote.
 * Usage: node scripts/pilot-outreach.mjs [invitation|relance|merci]
 */

const GUIDE = "https://wazo-digital.com/guide-pilote";
const REGISTER = "https://wazo-digital.com/register";

const MESSAGES = {
  invitation: [
    "Bonjour ! Voici votre guide pour démarrer sur *Wazo Digital* en pilote 🚀",
    "",
    "1️⃣ Inscription : https://wazo-digital.com/register",
    "2️⃣ Ajoutez vos produits puis ouvrez la *Caisse*",
    "3️⃣ Partagez votre catalogue WhatsApp depuis *Produits*",
    "4️⃣ Installez l'app sur l'écran d'accueil (PWA)",
    "",
    `Guide complet : ${GUIDE}`,
    "",
    "Une question ? Répondez à ce message.",
  ].join("\n"),

  relance: [
    "Bonjour ! Petit rappel pour votre test *Wazo Digital* 🙏",
    "",
    "Avez-vous pu :",
    "✅ Créer votre compte",
    "✅ Ajouter 1 produit",
    "✅ Faire 1 vente à la caisse",
    "",
    `Guide : ${GUIDE}`,
    "Un blocage ? Répondez ici avec une capture d'écran.",
  ].join("\n"),

  merci: [
    "Merci d'avoir testé *Wazo Digital* ! 🎉",
    "",
    "Votre avis compte :",
    "1. Qu'est-ce qui vous a le plus aidé ?",
    "2. Qu'est-ce qui a bloqué ?",
    "3. Recommanderiez-vous Wazo à un collègue ? (1-10)",
    "",
    `Inscription ouverte : ${REGISTER}`,
  ].join("\n"),
};

const key = process.argv[2]?.trim() || "invitation";
const message = MESSAGES[key] || MESSAGES.invitation;

console.log(`--- Message « ${key} » ---\n`);
console.log(message);
console.log("\n--- Lien WhatsApp (sans numéro) ---");
console.log(`https://wa.me/?text=${encodeURIComponent(message)}`);
