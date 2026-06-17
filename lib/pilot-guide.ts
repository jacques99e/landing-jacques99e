export interface PilotGuideSection {
  title: string;
  bullets: string[];
}

export const PILOT_GUIDE_TITLE = "Guide commerçant pilote — Wazo Digital";

export const PILOT_GUIDE_SECTIONS: PilotGuideSection[] = [
  {
    title: "1. Créer votre compte (5 min)",
    bullets: [
      "Ouvrez https://wazo-digital.com/register",
      "Inscrivez-vous (email ou téléphone)",
      "Vous êtes redirigé vers l'application : créez votre boutique (nom + slug)",
      "Choisissez vos modules (Commerce minimum pour vendre)",
    ],
  },
  {
    title: "2. Lancer votre catalogue (10 min)",
    bullets: [
      "Produits → Ajouter un produit (nom, prix, stock, photo si connexion OK)",
      "Depuis Produits, partagez le catalogue WhatsApp à vos clients",
      "Votre vitrine publique : wazo-digital.com/boutique/votre-slug",
    ],
  },
  {
    title: "3. Première vente à la caisse",
    bullets: [
      "Menu Caisse → ajoutez des articles au panier",
      "Choisissez espèces ou Mobile Money",
      "Finalisez : reçu partageable WhatsApp en un clic",
      "Fonctionne aussi hors ligne (sync automatique au retour internet)",
    ],
  },
  {
    title: "4. Installer l'app sur votre téléphone",
    bullets: [
      "Ouvrez https://app.wazo-digital.com dans Chrome/Safari",
      "Menu navigateur → « Ajouter à l'écran d'accueil »",
      "Ouvrez l'app une fois connecté pour activer le mode hors ligne",
    ],
  },
  {
    title: "5. Modules selon votre activité",
    bullets: [
      "Logistique : créer une livraison + lien de suivi client",
      "Santé : patients + rendez-vous + rappels",
      "Formation : cours + modules + lien public /formation",
      "Agriculture : parcelles + journal de champ",
      "Traçabilité : actifs + QR de preuve",
    ],
  },
  {
    title: "6. Support & retours pilote",
    bullets: [
      "Centre d'aide dans l'app : /help",
      "Synchronisation cloud : Paramètres → Notifications → Synchroniser",
      "Signalez tout blocage avec capture d'écran sur WhatsApp support",
      "Vos retours nous aident à améliorer Wazo avant le lancement public",
    ],
  },
];

export function buildPilotGuidePlainText(): string {
  const lines = [
    PILOT_GUIDE_TITLE,
    "https://wazo-digital.com · https://app.wazo-digital.com",
    "",
    ...PILOT_GUIDE_SECTIONS.flatMap((s) => [
      s.title,
      ...s.bullets.map((b) => `  • ${b}`),
      "",
    ]),
    "— Wazo Digital, fait pour l'Afrique",
  ];
  return lines.join("\n");
}

export function buildPilotGuideWhatsAppMessage(): string {
  return [
    "Bonjour ! Voici votre guide pour démarrer sur *Wazo Digital* en pilote 🚀",
    "",
    "1️⃣ Inscription : https://wazo-digital.com/register",
    "2️⃣ Ajoutez vos produits puis ouvrez la *Caisse*",
    "3️⃣ Partagez votre catalogue WhatsApp depuis *Produits*",
    "4️⃣ Installez l'app sur l'écran d'accueil (PWA)",
    "",
    "Guide complet : https://wazo-digital.com/guide-pilote",
    "",
    "Une question ? Répondez à ce message.",
  ].join("\n");
}

export function downloadPilotGuideText() {
  const blob = new Blob([buildPilotGuidePlainText()], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "wazo-guide-pilote.txt";
  a.click();
  URL.revokeObjectURL(url);
}
