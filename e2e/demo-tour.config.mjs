/** Configuration partagée : enregistrement Playwright + voix off + durées */

const LANDING_URL = process.env.E2E_LANDING_URL || "https://landing-jacques99e.vercel.app";
const APP_URL = process.env.E2E_APP_URL || "https://wazo-digital.vercel.app";

/** Ordre narratif : vitrine → cœur métier → modules spécialisés → équipe */
export const DEMO_TOUR = [
  {
    id: "landing",
    url: `${LANDING_URL}/`,
    pauseMs: 2800,
    narration:
      "Bienvenue sur Wazo Digital. Inscrivez-vous sur la vitrine, gérez votre activité dans l'application.",
  },
  {
    id: "dashboard",
    url: `${APP_URL}/dashboard`,
    pauseMs: 4200,
    narration:
      "Votre tableau de bord unifié : ventes du jour, alertes et accès rapide à tous vos modules actifs.",
  },
  {
    id: "commerce-products",
    url: `${APP_URL}/products`,
    pauseMs: 3200,
    narration: "Module Commerce : gérez votre catalogue, vos stocks et vos alertes de rupture.",
  },
  {
    id: "commerce-sales",
    url: `${APP_URL}/sales`,
    pauseMs: 3200,
    narration: "Enregistrez vos ventes en caisse, espèces ou Mobile Money, même hors ligne.",
  },
  {
    id: "commerce-clients",
    url: `${APP_URL}/clients`,
    pauseMs: 2800,
    narration: "Suivez vos clients et planifiez vos relances commerciales.",
  },
  {
    id: "health",
    url: `${APP_URL}/health`,
    pauseMs: 3200,
    narration: "Module Santé : dossiers patients et suivi des consultations.",
  },
  {
    id: "health-appointments",
    url: `${APP_URL}/health/appointments`,
    pauseMs: 3200,
    narration: "Planifiez les rendez-vous et envoyez des rappels automatiques.",
  },
  {
    id: "agriculture",
    url: `${APP_URL}/agriculture`,
    pauseMs: 3000,
    narration: "Module Agriculture : parcelles, prix du marché et calcul de rendement.",
  },
  {
    id: "logistics",
    url: `${APP_URL}/logistics`,
    pauseMs: 3000,
    narration: "Module Logistique : créez une livraison et partagez le lien de suivi au client.",
  },
  {
    id: "education",
    url: `${APP_URL}/education`,
    pauseMs: 3000,
    narration: "Module Formation : publiez vos cours et invitez vos apprenants.",
  },
  {
    id: "blockchain",
    url: `${APP_URL}/blockchain`,
    pauseMs: 3000,
    narration: "Module Traçabilité : preuve d'origine infalsifiable pour vos produits.",
  },
  {
    id: "notifications",
    url: `${APP_URL}/settings/notifications`,
    pauseMs: 2800,
    narration: "Activez les notifications push et les rapports hebdomadaires par e-mail.",
  },
  {
    id: "team",
    url: `${APP_URL}/settings/team`,
    pauseMs: 2800,
    narration: "Invitez votre équipe et attribuez des rôles : employé, manager ou comptable.",
  },
  {
    id: "outro",
    url: `${APP_URL}/dashboard`,
    pauseMs: 3500,
    narration:
      "Wazo Digital. Six modules métier, une seule application. Commencez gratuitement dès aujourd'hui.",
  },
];

export const DEMO_RECORDING = {
  slowMoMs: 220,
  viewport: { width: 1280, height: 720 },
  /** Volume musique de fond (0 = désactivé) */
  musicVolume: 0.12,
  /** Voix Microsoft Edge TTS — voir https://learn.microsoft.com/azure/ai-services/speech-service/language-support */
  edgeVoice: "fr-FR-EloiseNeural",
  /** Débit de la voix : "+0%" normal, "+10%" plus rapide, "-5%" plus lent */
  edgeRate: "+5%",
  /** Marge visuelle après la fin de la phrase (ms) */
  visualBufferMs: 450,
};

export function estimatedDurationSec() {
  const pauses = DEMO_TOUR.reduce((s, step) => s + step.pauseMs, 0);
  return Math.round(pauses / 1000 + DEMO_TOUR.length * 1.2);
}
