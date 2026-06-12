/** Configuration partagée : enregistrement Playwright + voix off + durées */

const LANDING_URL = process.env.E2E_LANDING_URL || "https://landing-jacques99e.vercel.app";
const APP_URL = process.env.E2E_APP_URL || "https://wazo-digital.vercel.app";

/**
 * Parcours conversion + tutoriel : accroche → usage concret → abonnement PRO.
 * Chaque narration lie l'écran à un bénéfice et pousse vers le plan PRO.
 */
export const DEMO_TOUR = [
  {
    id: "landing",
    url: `${LANDING_URL}/`,
    pauseMs: 4500,
    narration:
      "Vous perdez des ventes avec un cahier et cinq applications différentes ? En trois minutes, découvrez Wazo Digital : caisse MoMo, stock et boutique WhatsApp — gratuit pour démarrer, PRO à neuf euros quatre-vingt-dix-neuf par mois.",
  },
  {
    id: "dashboard",
    url: `${APP_URL}/dashboard`,
    pauseMs: 5000,
    scroll: true,
    narration:
      "Étape un : votre tableau de bord. Ventes du jour, alertes stock et accès direct à chaque module — tout sur un seul écran mobile, même hors ligne.",
  },
  {
    id: "commerce-products",
    url: `${APP_URL}/products`,
    pauseMs: 5000,
    scroll: true,
    narration:
      "Étape deux : ajoutez vos produits avec photo, prix et stock. Les ruptures s'affichent en rouge. Partagez le catalogue sur WhatsApp — vos clients n'installent rien.",
  },
  {
    id: "commerce-sales",
    url: `${APP_URL}/sales`,
    pauseMs: 5500,
    scroll: true,
    narration:
      "Étape trois : la caisse. Sélectionnez les articles, choisissez Mobile Money MoMo ou espèces, validez — le reçu part sur WhatsApp. C'est ce que les commerçants PRO utilisent toute la journée.",
  },
  {
    id: "commerce-credit",
    url: `${APP_URL}/sales/credit`,
    pauseMs: 5000,
    scroll: true,
    narration:
      "Étape quatre : le carnet crédit. Voyez qui vous doit, le montant, la date — et relancez par WhatsApp en un clic. Fini les créances oubliées.",
  },
  {
    id: "billing",
    url: `${APP_URL}/billing`,
    pauseMs: 6000,
    scroll: true,
    narration:
      "Et voici l'abonnement. Le plan GRATUIT : cinquante produits, une boutique. Le plan PRO recommandé : neuf euros quatre-vingt-dix-neuf par mois, produits illimités, trois boutiques, analytics et support prioritaire. Sans engagement — vous passez au PRO en un clic.",
  },
  {
    id: "health-appointments",
    url: `${APP_URL}/health/appointments`,
    pauseMs: 4500,
    scroll: true,
    narration:
      "Module Santé : planifiez les rendez-vous et envoyez des rappels automatiques — inclus dans tous les plans.",
  },
  {
    id: "agriculture-calendrier",
    url: `${APP_URL}/agriculture/calendrier`,
    pauseMs: 4500,
    scroll: true,
    narration:
      "Module Agriculture : calendrier cultural, semis et récoltes datés — pour ne rien oublier en saison.",
  },
  {
    id: "logistics-tournee",
    url: `${APP_URL}/logistics/tournee`,
    pauseMs: 4500,
    scroll: true,
    narration:
      "Module Logistique : organisez la tournée du jour et partagez le lien de suivi au client par WhatsApp.",
  },
  {
    id: "blockchain-qr",
    url: `${APP_URL}/blockchain/qr`,
    pauseMs: 4500,
    scroll: true,
    narration:
      "Module Traçabilité : générez un QR sur vos produits — origine vérifiable pour vos acheteurs.",
  },
  {
    id: "landing-tarifs",
    url: `${LANDING_URL}/#tarifs`,
    pauseMs: 5500,
    narration:
      "Vous venez de voir l'application réelle. Commencez gratuitement, puis choisissez le PRO quand vous êtes prêt. Cliquez sur Choisir PRO — je m'abonne : neuf euros quatre-vingt-dix-neuf par mois, sans engagement. Votre activité mérite un vrai outil.",
  },
];

export const DEMO_RECORDING = {
  slowMoMs: 280,
  viewport: { width: 1920, height: 1080 },
  musicVolume: 0,
  edgeVoice: "fr-FR-DeniseNeural",
  edgeRate: "-5%",
  visualBufferMs: 1400,
  settleMs: 700,
  scrollStepMs: 280,
};

export function estimatedDurationSec() {
  const pauses = DEMO_TOUR.reduce((s, step) => s + step.pauseMs, 0);
  return Math.round(pauses / 1000 + DEMO_TOUR.length * 1.8);
}
