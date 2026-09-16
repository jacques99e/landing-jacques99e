import { gateway, generateText } from "ai";
import {
  fetchCampaignSnapshot,
  isAdminPhone,
  sendWhatsAppText,
  type WhatsAppInbound,
} from "./whatsapp-cloud";
import { allowRequest } from "./rate-limit";
import {
  loadThread,
  lookupMerchantByPhone,
  pushMessage,
  saveThread,
  shouldBotReply,
  type WhatsAppThread,
} from "./whatsapp-threads";

const APP = (process.env.NEXT_PUBLIC_APP_URL || "https://app.wazo-digital.com").replace(/\/$/, "");
const SITE = "https://wazo-digital.com";
const REGISTER = `${SITE}/register`;
const JACQUES_WA = "https://wa.me/22893924040";

const SYSTEM = `Tu es l'assistant WhatsApp de Wazo Digital, pour Jacques (fondateur, Togo).
Wazo est une caisse / boutique WhatsApp pour commerçants Afrique de l'Ouest (Togo, Bénin, Côte d'Ivoire, Cameroun, Sénégal).
Réponds TOUJOURS en français, messages courts (max 4 phrases, WhatsApp). Tutoiement. Pas d'emojis excessifs.

Objectif campagne Click-to-WhatsApp : un premier paiement Mobile Money, PAS vendre PRO le jour 1.
Parcours : créer compte → 1 produit → partager le lien de paiement MoMo → encaisser.

Liens :
- Inscription : ${REGISTER}
- App : ${APP}/app
- Tarifs : ${SITE}/tarifs
- Guide : ${SITE}/guide-pilote

Règles :
- Si le commerçant a déjà une boutique, envoie son lien de paiement (payUrl) tout de suite et explique : « envoie ça à un client, il paie par MoMo ».
- Sinon : 1) qu'est-ce que tu vends 2) tu as un client aujourd'hui ? 3) lien d'inscription. Ne noie pas.
- Ne jamais proposer PRO / 9 900 F / abonnement dans le premier échange.
- Si quelqu'un veut parler à Jacques, dis que Jacques reprend la main.
- Si question ads / campagne / stats : résume les chiffres fournis, n'invente rien.
- Si tu ne sais pas, dis-le et propose Jacques.
- Pas de markdown lourd. Pas de listes à puces trop longues.`;

function fallbackReply(text: string, merchant: Awaited<ReturnType<typeof lookupMerchantByPhone>>): string {
  const t = text.toLowerCase();
  if (merchant) {
    return `C'est Wazo. Ta boutique « ${merchant.storeName} » est déjà là.\nPour encaisser : envoie ce lien à un client, il paie par Mobile Money :\n${merchant.payUrl}\nQuand c'est payé, dis-moi.`;
  }
  if (/prix|tarif|coût|cout|pro|abonnement/.test(t)) {
    return `On commence gratuit : 1 produit, 1 lien MoMo, 1 vrai paiement. L'abo PRO vient après, pas aujourd'hui.\nCrée le compte ici : ${REGISTER}`;
  }
  if (/pub|campagne|meta|facebook|instagram|ads/.test(t)) {
    return `La pub WhatsApp tourne. Dis-moi ce que tu vends et si tu as un client aujourd'hui — je t'envoie le bon lien.`;
  }
  return `Salut, c'est Wazo — caisse WhatsApp + paiement Mobile Money.\nTu vends quoi, et tu as un client aujourd'hui ?\nPour créer la boutique : ${REGISTER}`;
}

async function notifyJacques(subject: string, html: string) {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return;
  const from = process.env.REPORT_EMAIL_FROM?.trim() || "Wazo Digital <onboarding@wazo-digital.com>";
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: ["jacquesnoussougan93@gmail.com"],
      subject,
      html,
    }),
  }).catch(() => {});
}

async function generateReply(thread: WhatsAppThread, inbound: WhatsAppInbound): Promise<string> {
  const merchant = await lookupMerchantByPhone(inbound.from);
  if (merchant) thread.merchant = merchant as unknown as Record<string, unknown>;
  const history = thread.messages
    .slice(-8)
    .map((m) => `${m.role === "user" ? "Lead" : m.role === "human" ? "Jacques" : "Assistant"}: ${m.text}`)
    .join("\n");

  let campaignBlock = "";
  if (/campagne|pub|meta|stats|dépens|depens|clic|conversation/i.test(inbound.text)) {
    const snap = await fetchCampaignSnapshot();
    campaignBlock = `État campagne WA v1: ${JSON.stringify(snap)}`;
  }

  const context = [
    `Lead: ${inbound.name || "inconnu"} +${inbound.from}`,
    merchant
      ? `Compte existant: boutique ${merchant.storeName} slug=${merchant.slug} payer=${merchant.payUrl}`
      : "Pas de boutique trouvée pour ce numéro.",
    inbound.referral ? `Arrivé via pub: ${JSON.stringify(inbound.referral)}` : "Pas de referral pub (ou déjà capturé).",
    campaignBlock,
    history ? `Historique:\n${history}` : "Premier message.",
    `Message: ${inbound.text || "(ouverture pub WhatsApp)"}`,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const { text } = await generateText({
      model: gateway("openai/gpt-5-mini"),
      system: SYSTEM,
      prompt: context,
      maxOutputTokens: 400,
    });
    const reply = (text || "").trim();
    if (reply) return reply.slice(0, 900);
  } catch {
    /* fallback scripté */
  }
  return fallbackReply(inbound.text, merchant);
}

function isHandoff(text: string): boolean {
  return /\b(jacques|humain|conseiller|appeler|parler (à|a) quelqu|opérateur)\b/i.test(text);
}

export async function handleInbound(inbound: WhatsAppInbound): Promise<void> {
  if (!inbound.from) return;
  if (!allowRequest(`wa:${inbound.from}`, 24, 60 * 60 * 1000)) return;
  const thread = await loadThread(inbound.from);
  if (thread.seen_ids.includes(inbound.messageId)) return;
  thread.seen_ids.push(inbound.messageId);
  if (inbound.name) thread.name = inbound.name;
  if (inbound.referral) thread.referral = inbound.referral;

  if (inbound.isEcho) {
    thread.mode = "human";
    thread.last_human_at = new Date().toISOString();
    if (inbound.text) pushMessage(thread, "human", inbound.text);
    await saveThread(thread);
    return;
  }

  const text = inbound.text.trim();
  const lower = text.toLowerCase();

  if (await runAdminCommand(inbound.from, lower, thread)) {
    return;
  }

  pushMessage(thread, "user", text || "(ouverture WhatsApp)");

  const firstTouch = thread.messages.filter((m) => m.role === "user").length <= 1;
  if (firstTouch) {
    await notifyJacques(
      `WhatsApp${inbound.referral ? " pub" : ""} : ${inbound.name || inbound.from}`,
      `<p><b>${inbound.name || "Lead"}</b> +${inbound.from}</p>
       <p>${text || "(ouverture pub)"}</p>
       ${inbound.referral ? `<p>Pub: ${inbound.referral.headline || inbound.referral.sourceId || ""}</p>` : ""}
       <p><a href="${JACQUES_WA}">Ouvrir WhatsApp</a></p>
       <p>L'IA a répondu. Pour reprendre la main, réponds dans WhatsApp Business — le bot se tait 2 h.</p>`,
    );
  }

  if (isHandoff(text)) {
    thread.mode = "human";
    thread.last_human_at = new Date().toISOString();
    const msg = "Jacques reprend. Il te répond ici dès qu'il est dispo.";
    pushMessage(thread, "assistant", msg);
    await sendWhatsAppText(inbound.from, msg);
    await saveThread(thread);
    await notifyJacques(
      `Handoff WhatsApp : ${inbound.name || inbound.from}`,
      `<p>Le lead +${inbound.from} demande Jacques.</p><p>${text}</p>`,
    );
    return;
  }

  if (!shouldBotReply(thread)) {
    await saveThread(thread);
    return;
  }

  thread.mode = "bot";
  const reply = await generateReply(thread, inbound);
  pushMessage(thread, "assistant", reply);
  await sendWhatsAppText(inbound.from, reply);
  await saveThread(thread);
}

async function runAdminCommand(from: string, lower: string, thread: WhatsAppThread): Promise<boolean> {
  if (!isAdminPhone(from)) return false;

  if (lower === "campagne" || lower === "stats" || lower === "pub") {
    const snap = await fetchCampaignSnapshot();
    const msg = snap.error
      ? `Campagne: ${snap.error}`
      : `WA v1\nCampagne: ${snap.campaign}\nAdset: ${snap.adset}\nPub: ${snap.ad}\nDépensé: ${snap.spend} $\nImpr: ${snap.impressions}\nClics: ${snap.clicks}\nConv. WA: ${snap.conversations}`;
    await sendWhatsAppText(from, msg);
    return true;
  }

  if (lower === "bot" || lower.startsWith("bot ")) {
    const target = lower.replace(/^bot\s*/, "").replace(/\D/g, "") || from;
    const t = target === from ? thread : await loadThread(target);
    t.mode = "bot";
    t.last_human_at = null;
    await saveThread(t);
    await sendWhatsAppText(from, `Bot réactivé pour +${target}.`);
    return true;
  }

  if (lower === "stop" || lower === "pause" || lower.startsWith("humain")) {
    const target = lower.replace(/^(stop|pause|humain)\s*/, "").replace(/\D/g, "") || from;
    const t = target === from ? thread : await loadThread(target);
    t.mode = "human";
    t.last_human_at = new Date().toISOString();
    await saveThread(t);
    await sendWhatsAppText(from, `Bot en pause pour +${target}. Réponds toi-même. « bot ${target} » pour reprendre.`);
    return true;
  }

  if (lower === "aide" || lower === "help") {
    await sendWhatsAppText(
      from,
      "Commandes Jacques :\n• campagne — stats pub WA v1\n• pause [num] — bot off\n• bot [num] — bot on\nLe bot se tait tout seul dès que tu réponds dans WhatsApp Business (2 h).",
    );
    return true;
  }

  return false;
}
