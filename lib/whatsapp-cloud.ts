import { createHmac, timingSafeEqual } from "crypto";
import { secretsEqual } from "./secret-compare";

const GRAPH = "https://graph.facebook.com/v21.0";
const D360_HOST = "https://waba-v2.360dialog.io";

export const WA_CAMPAIGN_ID = "120252031716930071";
export const WA_ADSET_ID = "120252032030720071";
export const WA_AD_ID = "120252032043730071";
export const WA_AD_ACCOUNT = "act_2420819281774883";

export type WhatsAppInbound = {
  from: string;
  name: string;
  text: string;
  messageId: string;
  phoneNumberId: string;
  isEcho: boolean;
  referral?: {
    sourceType?: string;
    sourceId?: string;
    headline?: string;
    body?: string;
    ctwaClid?: string;
  };
};

type GraphMessage = {
  from?: string;
  to?: string;
  id?: string;
  type?: string;
  text?: { body?: string };
  button?: { text?: string };
  interactive?: { button_reply?: { title?: string }; list_reply?: { title?: string } };
  referral?: {
    source_type?: string;
    source_id?: string;
    headline?: string;
    body?: string;
    ctwa_clid?: string;
  };
};

function digits(value: string | undefined | null): string {
  return (value || "").replace(/\D/g, "");
}

async function graphGet(path: string, token: string): Promise<Record<string, unknown>> {
  const res = await fetch(`${GRAPH}/${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return (await res.json()) as Record<string, unknown>;
}

export function dialogApiKey(): string {
  return process.env.WHATSAPP_360DIALOG_API_KEY?.trim() || "";
}

export function dialogBase(): string {
  return (process.env.WHATSAPP_360DIALOG_BASE?.trim() || D360_HOST).replace(/\/$/, "");
}

export function usesDialog(): boolean {
  return Boolean(dialogApiKey());
}

export function metaAdsToken(): string {
  return (
    process.env.META_ADS_ACCESS_TOKEN?.trim() ||
    process.env.FB_ACCESS_TOKEN?.trim() ||
    process.env.META_PAGE_ACCESS_TOKEN?.trim() ||
    ""
  );
}

export function whatsappAccessToken(): string {
  return process.env.WHATSAPP_ACCESS_TOKEN?.trim() || metaAdsToken();
}

export function whatsappPhoneNumberId(): string {
  return process.env.WHATSAPP_PHONE_NUMBER_ID?.trim() || "";
}

export function adminPhones(): Set<string> {
  const raw = process.env.WHATSAPP_ADMIN_PHONES?.trim() || "22893924040,22898399255";
  return new Set(raw.split(/[,\s]+/).map(digits).filter(Boolean));
}

export function isAdminPhone(phone: string): boolean {
  return adminPhones().has(digits(phone));
}

export function parseWhatsAppPayload(body: unknown): WhatsAppInbound[] {
  const out: WhatsAppInbound[] = [];
  if (!body || typeof body !== "object") return out;
  const entries = (body as { entry?: unknown[] }).entry;
  if (!Array.isArray(entries)) return out;

  for (const entry of entries) {
    if (!entry || typeof entry !== "object") continue;
    const changes = (entry as { changes?: unknown[] }).changes;
    if (!Array.isArray(changes)) continue;
    for (const change of changes) {
      if (!change || typeof change !== "object") continue;
      const field = (change as { field?: string }).field;
      const value = (change as { value?: Record<string, unknown> }).value;
      if (!value) continue;
      const metadata = value.metadata as { phone_number_id?: string } | undefined;
      const contacts = Array.isArray(value.contacts) ? value.contacts : [];
      const name =
        ((contacts[0] as { profile?: { name?: string } } | undefined)?.profile?.name || "").trim();
      const phoneNumberId = metadata?.phone_number_id || "";
      const echoList = Array.isArray(value.message_echoes)
        ? (value.message_echoes as GraphMessage[])
        : [];
      const isEchoField = field === "smb_message_echoes" || echoList.length > 0;
      const messages = [
        ...(Array.isArray(value.messages) ? (value.messages as GraphMessage[]) : []),
        ...echoList,
      ];
      for (const msg of messages) {
        if (!msg?.id) continue;
        const text =
          msg.text?.body ||
          msg.button?.text ||
          msg.interactive?.button_reply?.title ||
          msg.interactive?.list_reply?.title ||
          (msg.type && msg.type !== "text" ? `[${msg.type}]` : "");
        if (!text && !msg.referral) continue;
        const peer = isEchoField ? digits(msg.to) : digits(msg.from);
        if (!peer) continue;
        out.push({
          from: peer,
          name,
          text: String(text || "").trim(),
          messageId: msg.id,
          phoneNumberId,
          isEcho: isEchoField,
          referral: msg.referral
            ? {
                sourceType: msg.referral.source_type,
                sourceId: msg.referral.source_id,
                headline: msg.referral.headline,
                body: msg.referral.body,
                ctwaClid: msg.referral.ctwa_clid,
              }
            : undefined,
        });
      }
    }
  }
  return out;
}

function messageHeaders(): Record<string, string> | null {
  if (usesDialog()) {
    return { "D360-API-KEY": dialogApiKey(), "Content-Type": "application/json" };
  }
  const token = whatsappAccessToken();
  const phoneId = whatsappPhoneNumberId();
  if (!token || !phoneId) return null;
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

function messagesUrl(): string | null {
  if (usesDialog()) return `${dialogBase()}/messages`;
  const phoneId = whatsappPhoneNumberId();
  if (!phoneId) return null;
  return `${GRAPH}/${phoneId}/messages`;
}

export async function sendWhatsAppText(to: string, body: string): Promise<{ ok: boolean; error?: string }> {
  const headers = messageHeaders();
  const url = messagesUrl();
  if (!headers || !url) {
    return { ok: false, error: "WhatsApp non configuré (360dialog API key ou Cloud API)." };
  }
  const text = body.trim().slice(0, 900);
  if (!text) return { ok: true };
  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: digits(to),
      type: "text",
      text: { preview_url: true, body: text },
    }),
  });
  if (!res.ok) {
    const err = await res.text().catch(() => "");
    return { ok: false, error: err.slice(0, 400) };
  }
  return { ok: true };
}

export async function markWhatsAppRead(messageId: string): Promise<void> {
  const headers = messageHeaders();
  const url = messagesUrl();
  if (!headers || !url || !messageId) return;
  await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      messaging_product: "whatsapp",
      status: "read",
      message_id: messageId,
    }),
  }).catch(() => {});
}

type CampaignSnapshot = {
  campaign?: string;
  adset?: string;
  ad?: string;
  spend?: string;
  impressions?: string;
  clicks?: string;
  conversations?: string;
  error?: string;
};

export async function fetchCampaignSnapshot(): Promise<CampaignSnapshot> {
  const token = metaAdsToken();
  if (!token) return { error: "Pas de token Meta ads." };
  try {
    const [campaign, adset, ad, insights] = await Promise.all([
      graphGet(`${WA_CAMPAIGN_ID}?fields=name,status,effective_status`, token),
      graphGet(`${WA_ADSET_ID}?fields=name,status,effective_status`, token),
      graphGet(`${WA_AD_ID}?fields=name,status,effective_status`, token),
      graphGet(
        `${WA_CAMPAIGN_ID}/insights?fields=spend,impressions,clicks,actions&date_preset=maximum`,
        token,
      ),
    ]);
    const insightsPayload = insights as { data?: Array<Record<string, unknown>> };
    const row = insightsPayload.data?.[0] || {};
    const actions = Array.isArray(row.actions) ? (row.actions as Array<{ action_type?: string; value?: string }>) : [];
    const conversations = actions.find((a) =>
      (a.action_type || "").includes("conversation"),
    )?.value;
    const campaignErr = campaign.error;
    return {
      campaign: String(campaign.effective_status || campaign.status || ""),
      adset: String(adset.effective_status || adset.status || ""),
      ad: String(ad.effective_status || ad.status || ""),
      spend: String(row.spend || "0"),
      impressions: String(row.impressions || "0"),
      clicks: String(row.clicks || "0"),
      conversations: conversations || "0",
      error: campaignErr ? JSON.stringify(campaignErr).slice(0, 200) : undefined,
    };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "insights indisponibles" };
  }
}

export function verifyWhatsAppSignature(rawBody: string, header: string | null): boolean {
  const secret = process.env.META_APP_SECRET?.trim();
  if (!secret) return false;
  if (!header?.startsWith("sha256=")) return false;
  const expected = header.slice("sha256=".length);
  const digest = createHmac("sha256", secret).update(rawBody).digest("hex");
  const a = Buffer.from(digest);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function verifyWhatsAppRequest(rawBody: string, request: Request): boolean {
  const expected = process.env.WHATSAPP_VERIFY_TOKEN?.trim();
  if (expected && secretsEqual(request.headers.get("x-wazo-webhook-secret"), expected)) {
    return true;
  }
  const basicUser = process.env.WHATSAPP_WEBHOOK_USER?.trim();
  const basicPass = process.env.WHATSAPP_WEBHOOK_PASS?.trim();
  const auth = request.headers.get("authorization") || "";
  if (basicUser && basicPass && auth.startsWith("Basic ")) {
    const decoded = Buffer.from(auth.slice(6), "base64").toString("utf8");
    if (secretsEqual(decoded, `${basicUser}:${basicPass}`)) return true;
  }
  if (verifyWhatsAppSignature(rawBody, request.headers.get("x-hub-signature-256"))) {
    return true;
  }
  if (!expected && !process.env.META_APP_SECRET?.trim() && process.env.NODE_ENV !== "production") {
    return true;
  }
  return false;
}
