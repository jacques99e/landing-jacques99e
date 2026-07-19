/** Runtime Node (sans TypeScript) pour scripts meta-post / cron local. */

const GRAPH = "https://graph.facebook.com/v21.0";
const REGISTER = "https://wazo-digital.com/register";
const GUIDE = "https://wazo-digital.com/guide-pilote";

const POSTS = {
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

const ORDER = ["register", "pilote", "pro"];

function getPost(key) {
  if (key && POSTS[key]) return POSTS[key];
  const day = Math.floor(Date.now() / 86_400_000);
  return POSTS[ORDER[day % ORDER.length]];
}

function imageUrl() {
  return (
    process.env.META_SOCIAL_IMAGE_URL?.trim() ||
    "https://wazo-digital.com/social-card.png"
  );
}

async function graphPost(pathname, token, body) {
  const url = new URL(`${GRAPH}${pathname}`);
  url.searchParams.set("access_token", token);
  for (const [k, v] of Object.entries(body)) url.searchParams.set(k, String(v));
  const res = await fetch(url.toString(), { method: "POST" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.error) {
    return { ok: false, error: data.error?.message || `HTTP ${res.status}` };
  }
  return { ok: true, data };
}

async function waitIg(containerId, token) {
  for (let i = 0; i < 12; i++) {
    const url = new URL(`${GRAPH}/${containerId}`);
    url.searchParams.set("fields", "status_code");
    url.searchParams.set("access_token", token);
    const res = await fetch(url.toString());
    const data = await res.json().catch(() => ({}));
    if (data.error) return { ok: false, error: data.error.message };
    if (data.status_code === "FINISHED") return { ok: true };
    if (data.status_code === "ERROR") return { ok: false, error: "IG container ERROR" };
    await new Promise((r) => setTimeout(r, 2500));
  }
  return { ok: false, error: "IG container timeout" };
}

export async function publishFromEnv({ key = null, dryRun = true } = {}) {
  const post = getPost(key);

  if (dryRun) {
    return { ok: true, post, skipped: "dry-run" };
  }

  // --live publie tout de suite (test manuel), même si META_SOCIAL_ENABLED=0
  const pageId = process.env.META_PAGE_ID?.trim();
  const token = process.env.META_PAGE_ACCESS_TOKEN?.trim();
  const igUserId = process.env.META_IG_USER_ID?.trim();
  const doFb = process.env.META_POST_FACEBOOK !== "0";
  const doIg = process.env.META_POST_INSTAGRAM !== "0";

  if (!pageId || !token) {
    return {
      ok: false,
      post,
      skipped: "META_PAGE_ID / META_PAGE_ACCESS_TOKEN manquants — npm run meta:connect",
    };
  }

  const result = { ok: true, post };

  if (doFb) {
    const fb = await graphPost(`/${pageId}/feed`, token, {
      message: post.message,
      link: REGISTER,
    });
    result.facebook = fb.ok
      ? { id: String(fb.data.id || "") }
      : { error: fb.error };
    if (!fb.ok) result.ok = false;
  }

  if (doIg) {
    if (!igUserId) {
      result.instagram = {
        error: "META_IG_USER_ID manquant — lie Instagram Pro à la Page",
      };
      result.ok = false;
    } else {
      const created = await graphPost(`/${igUserId}/media`, token, {
        image_url: imageUrl(),
        caption: post.caption,
      });
      if (!created.ok) {
        result.instagram = { error: created.error };
        result.ok = false;
      } else {
        const creationId = String(created.data.id || "");
        const ready = await waitIg(creationId, token);
        if (!ready.ok) {
          result.instagram = { error: ready.error };
          result.ok = false;
        } else {
          const pub = await graphPost(`/${igUserId}/media_publish`, token, {
            creation_id: creationId,
          });
          result.instagram = pub.ok
            ? { id: String(pub.data.id || "") }
            : { error: pub.error };
          if (!pub.ok) result.ok = false;
        }
      }
    }
  }

  return result;
}
