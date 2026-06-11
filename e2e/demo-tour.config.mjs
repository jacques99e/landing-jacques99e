/** Configuration partagée : enregistrement Playwright + voix off + durées */

const LANDING_URL = process.env.E2E_LANDING_URL || "https://landing-jacques99e.vercel.app";
const APP_URL = process.env.E2E_APP_URL || "https://wazo-digital.vercel.app";

/**
 * Parcours détaillé : chaque scène explique ce que l'utilisateur voit à l'écran.
 * `scroll: true` — défilement lent pour montrer toute la page.
 * `minVisualMs` — temps minimum sur l'écran (en plus de la voix).
 */
export const DEMO_TOUR = [
  {
    id: "landing",
    url: `${LANDING_URL}/`,
    pauseMs: 5000,
    narration:
      "Bienvenue sur Wazo Digital. Cette vitrine vous présente les six modules métier : commerce, santé, agriculture, logistique, formation et traçabilité. Cliquez sur Créer mon compte gratuit pour vous inscrire, puis utilisez l'application au quotidien.",
  },
  {
    id: "dashboard",
    url: `${APP_URL}/dashboard`,
    pauseMs: 5500,
    scroll: true,
    narration:
      "Voici votre tableau de bord. En haut, les ventes du jour et les alertes importantes. En dessous, les raccourcis vers chaque module activé pour votre activité. Tout est accessible en un seul écran, même sur mobile.",
  },
  {
    id: "commerce-products",
    url: `${APP_URL}/products`,
    pauseMs: 5500,
    scroll: true,
    narration:
      "Module Commerce — Produits. Ajoutez vos articles avec photo, prix et stock. Les alertes de rupture s'affichent en rouge. Vous pouvez aussi partager votre catalogue sur WhatsApp sans que le client installe l'application.",
  },
  {
    id: "commerce-sales",
    url: `${APP_URL}/sales`,
    pauseMs: 6000,
    scroll: true,
    narration:
      "La caisse enregistreuse. Choisissez vos produits, le mode de paiement — espèces, Mobile Money MoMo ou crédit client — puis validez. Un reçu peut partir automatiquement sur WhatsApp. La caisse fonctionne aussi hors ligne, avec synchronisation dès le retour du réseau.",
  },
  {
    id: "commerce-credit",
    url: `${APP_URL}/sales/credit`,
    pauseMs: 5500,
    scroll: true,
    narration:
      "Le carnet crédit client. Ici vous voyez qui vous doit de l'argent, le montant et la date. Un bouton permet d'envoyer une relance WhatsApp personnalisée en un clic, pour récupérer vos créances sans paperasse.",
  },
  {
    id: "health",
    url: `${APP_URL}/health`,
    pauseMs: 5000,
    scroll: true,
    narration:
      "Module Santé. Gérez les dossiers patients, l'historique des consultations et les constantes vitales. Idéal pour cabinets, cliniques et pharmacies de quartier.",
  },
  {
    id: "health-appointments",
    url: `${APP_URL}/health/appointments`,
    pauseMs: 5500,
    scroll: true,
    narration:
      "Le planning des rendez-vous. Créez un créneau, associez le patient, et programmez un rappel automatique par SMS ou notification avant la consultation.",
  },
  {
    id: "health-pharmacie",
    url: `${APP_URL}/health/pharmacie`,
    pauseMs: 5500,
    scroll: true,
    narration:
      "L'outil Pharmacie. Suivez vos stocks de médicaments, les dates de péremption et les ventes comptoir. Les alertes vous préviennent avant une rupture ou une expiration.",
  },
  {
    id: "agriculture",
    url: `${APP_URL}/agriculture`,
    pauseMs: 5000,
    scroll: true,
    narration:
      "Module Agriculture. Vue d'ensemble de vos parcelles, des prix du marché en temps réel et des outils de calcul de rendement pour mieux planifier vos récoltes.",
  },
  {
    id: "agriculture-calendrier",
    url: `${APP_URL}/agriculture/calendrier`,
    pauseMs: 5500,
    scroll: true,
    narration:
      "Le calendrier cultural. Planifiez semis, traitements et récoltes par culture. Chaque étape est datée pour ne rien oublier dans la saison.",
  },
  {
    id: "logistics",
    url: `${APP_URL}/logistics`,
    pauseMs: 5000,
    scroll: true,
    narration:
      "Module Logistique. Créez une livraison, assignez un livreur et suivez le statut en direct : en préparation, en route, livré.",
  },
  {
    id: "logistics-tournee",
    url: `${APP_URL}/logistics/tournee`,
    pauseMs: 5500,
    scroll: true,
    narration:
      "La tournée livreur. Regroupez plusieurs colis sur un même trajet, optimisez l'ordre des arrêts et partagez un lien de suivi au client pour chaque livraison.",
  },
  {
    id: "education",
    url: `${APP_URL}/education`,
    pauseMs: 5000,
    scroll: true,
    narration:
      "Module Formation. Publiez vos cours, modules et supports. Vos apprenants accèdent au contenu depuis leur téléphone, sans installation complexe.",
  },
  {
    id: "education-presence",
    url: `${APP_URL}/education/presence`,
    pauseMs: 5500,
    scroll: true,
    narration:
      "La feuille de présence. Faites l'appel en un clic, consultez les absences et exportez les statistiques pour vos rapports de fin de session.",
  },
  {
    id: "blockchain",
    url: `${APP_URL}/blockchain`,
    pauseMs: 5000,
    scroll: true,
    narration:
      "Module Traçabilité. Enregistrez l'origine de vos produits — café, cacao, artisanat — avec une preuve infalsifiable pour rassurer vos acheteurs.",
  },
  {
    id: "blockchain-qr",
    url: `${APP_URL}/blockchain/qr`,
    pauseMs: 5500,
    scroll: true,
    narration:
      "Le générateur de QR code. Scannez pour afficher la fiche produit complète : origine, producteur, date et certifications. Parfait pour étiqueter vos lots.",
  },
  {
    id: "notifications",
    url: `${APP_URL}/settings/notifications`,
    pauseMs: 5000,
    scroll: true,
    narration:
      "Les notifications. Activez les alertes push pour les ventes, stocks bas et rendez-vous. Programmez aussi un rapport hebdomadaire par e-mail pour votre équipe.",
  },
  {
    id: "team",
    url: `${APP_URL}/settings/team`,
    pauseMs: 5500,
    scroll: true,
    narration:
      "Gestion d'équipe. Invitez vos collaborateurs par e-mail, attribuez un rôle — employé, manager ou comptable — et contrôlez qui accède à quoi.",
  },
  {
    id: "outro",
    url: `${APP_URL}/dashboard`,
    pauseMs: 6000,
    narration:
      "Wazo Digital réunit six modules métier dans une seule application, pensée pour l'Afrique : Mobile Money, mode hors ligne et interface mobile. Créez votre compte gratuit sur la vitrine et commencez dès aujourd'hui.",
  },
];

export const DEMO_RECORDING = {
  slowMoMs: 300,
  viewport: { width: 1920, height: 1080 },
  /** Volume musique de fond (0 = désactivé) */
  musicVolume: 0,
  /** Voix Microsoft Edge TTS */
  edgeVoice: "fr-FR-DeniseNeural",
  /** Débit plus lent pour une écoute claire */
  edgeRate: "-10%",
  /** Marge visuelle après la fin de la phrase (ms) */
  visualBufferMs: 1800,
  /** Pause après chargement avant défilement (ms) */
  settleMs: 800,
  /** Vitesse du défilement (ms entre chaque pas) */
  scrollStepMs: 320,
};

export function estimatedDurationSec() {
  const pauses = DEMO_TOUR.reduce((s, step) => s + step.pauseMs, 0);
  return Math.round(pauses / 1000 + DEMO_TOUR.length * 2);
}
