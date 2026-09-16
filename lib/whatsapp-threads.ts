import { createAdminClient } from "./supabase/admin";

export type ThreadMessage = { role: "user" | "assistant" | "human"; text: string; at: string };

export type WhatsAppThread = {
  phone: string;
  mode: "bot" | "human";
  name: string;
  messages: ThreadMessage[];
  merchant: Record<string, unknown> | null;
  referral: Record<string, unknown> | null;
  last_human_at: string | null;
  seen_ids: string[];
  updated_at: string;
};

const HUMAN_RESUME_MS = 2 * 60 * 60 * 1000;
const MAX_MESSAGES = 16;

function emptyThread(phone: string): WhatsAppThread {
  return {
    phone,
    mode: "bot",
    name: "",
    messages: [],
    merchant: null,
    referral: null,
    last_human_at: null,
    seen_ids: [],
    updated_at: new Date().toISOString(),
  };
}

export async function loadThread(phone: string): Promise<WhatsAppThread> {
  const db = createAdminClient();
  if (!db) return emptyThread(phone);
  try {
    const { data } = await db
      .from("whatsapp_assistant_threads")
      .select("*")
      .eq("phone", phone)
      .maybeSingle();
    if (!data) return emptyThread(phone);
    return {
      phone,
      mode: data.mode === "human" ? "human" : "bot",
      name: data.name || "",
      messages: Array.isArray(data.messages) ? data.messages : [],
      merchant: data.merchant || null,
      referral: data.referral || null,
      last_human_at: data.last_human_at || null,
      seen_ids: Array.isArray(data.seen_ids) ? data.seen_ids : [],
      updated_at: data.updated_at || new Date().toISOString(),
    };
  } catch {
    return emptyThread(phone);
  }
}

export async function saveThread(thread: WhatsAppThread): Promise<void> {
  const db = createAdminClient();
  if (!db) return;
  try {
    await db.from("whatsapp_assistant_threads").upsert(
      {
        phone: thread.phone,
        mode: thread.mode,
        name: thread.name,
        messages: thread.messages.slice(-MAX_MESSAGES),
        merchant: thread.merchant,
        referral: thread.referral,
        last_human_at: thread.last_human_at,
        seen_ids: thread.seen_ids.slice(-80),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "phone" },
    );
  } catch {
    /* table absente tant que la migration n'est pas appliquée */
  }
}

export function shouldBotReply(thread: WhatsAppThread): boolean {
  if (thread.mode !== "human") return true;
  if (!thread.last_human_at) return false;
  return Date.now() - new Date(thread.last_human_at).getTime() > HUMAN_RESUME_MS;
}

export function pushMessage(thread: WhatsAppThread, role: ThreadMessage["role"], text: string) {
  thread.messages.push({ role, text, at: new Date().toISOString() });
  thread.messages = thread.messages.slice(-MAX_MESSAGES);
}

export type MerchantMatch = {
  storeName: string;
  slug: string;
  ownerId: string;
  payUrl: string;
  appUrl: string;
};

export async function lookupMerchantByPhone(phone: string): Promise<MerchantMatch | null> {
  const db = createAdminClient();
  if (!db) return null;
  const digits = phone.replace(/\D/g, "");
  const variants = [digits, `+${digits}`];
  if (digits.startsWith("228") && digits.length > 3) {
    variants.push(digits.slice(3), `+228${digits.slice(3)}`);
  }
  const { data: stores } = await db
    .from("stores")
    .select("name, slug, owner_id, phone, whatsapp")
    .or(variants.flatMap((v) => [`phone.eq.${v}`, `whatsapp.eq.${v}`]).join(","))
    .limit(3);
  const store = stores?.[0];
  if (store?.slug) {
    const app = (process.env.NEXT_PUBLIC_APP_URL || "https://app.wazo-digital.com").replace(/\/$/, "");
    return {
      storeName: store.name || "Boutique",
      slug: store.slug,
      ownerId: store.owner_id,
      payUrl: `${app}/boutique/${store.slug}/payer`,
      appUrl: `${app}/app`,
    };
  }
  const { data: profiles } = await db
    .from("profiles")
    .select("id, phone")
    .or(variants.map((v) => `phone.eq.${v}`).join(","))
    .limit(3);
  const profile = profiles?.[0];
  if (!profile?.id) return null;
  const { data: owned } = await db
    .from("stores")
    .select("name, slug, owner_id")
    .eq("owner_id", profile.id)
    .limit(1)
    .maybeSingle();
  if (!owned?.slug) return null;
  const app = (process.env.NEXT_PUBLIC_APP_URL || "https://app.wazo-digital.com").replace(/\/$/, "");
  return {
    storeName: owned.name || "Boutique",
    slug: owned.slug,
    ownerId: owned.owner_id,
    payUrl: `${app}/boutique/${owned.slug}/payer`,
    appUrl: `${app}/app`,
  };
}
