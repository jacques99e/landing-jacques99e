/**
 * Découvre phone_number_id / WABA pour brancher l'assistant.
 * Usage : node --env-file=.env.local scripts/whatsapp-assistant-setup.mjs
 * Ne jamais logger le token.
 *
 * IMPORTANT — ne PAS « Ajouter un numéro » dans developers.facebook.com
 * → WhatsApp → Configuration API. Ça déconnecte WhatsApp Business sur le téléphone.
 *
 * La coexistence (app + Cloud API sur le MÊME numéro) n'est pas un bouton Ads Manager.
 * Elle n'existe que via un partenaire Meta (Embedded Signup
 * « Connect existing WhatsApp Business App ») ou un 2e numéro dédié au bot.
 */
const GRAPH = "https://graph.facebook.com/v21.0";
const GRAPH = "https://graph.facebook.com/v21.0";
const token =
  process.env.WHATSAPP_ACCESS_TOKEN ||
  process.env.META_ADS_ACCESS_TOKEN ||
  process.env.FB_ACCESS_TOKEN ||
  process.env.META_PAGE_ACCESS_TOKEN ||
  "";

if (!token) {
  console.error("Manque WHATSAPP_ACCESS_TOKEN ou FB_ACCESS_TOKEN / META_PAGE_ACCESS_TOKEN");
  process.exit(1);
}

async function g(path) {
  const res = await fetch(`${GRAPH}/${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

const out = {
  me: await g("me?fields=id,name"),
  businesses: await g("me/businesses?fields=id,name"),
};

const bizId = out.businesses?.data?.[0]?.id || process.env.META_BUSINESS_ID || "1169171289619557";
out.waba = await g(`${bizId}/owned_whatsapp_business_accounts?fields=id,name,timezone_id`);
const wabaId = out.waba?.data?.[0]?.id;
if (wabaId) {
  out.phones = await g(`${wabaId}/phone_numbers?fields=id,display_phone_number,verified_name,quality_rating`);
}

console.log(JSON.stringify(out, null, 2));
console.log(`
Webhook GET/POST : https://wazo-digital.com/api/whatsapp/webhook
Champs : messages, smb_message_echoes
Env Vercel Landing :
  WHATSAPP_PHONE_NUMBER_ID=<id ci-dessus>
  WHATSAPP_ACCESS_TOKEN=<token Cloud API>
  WHATSAPP_VERIFY_TOKEN=<secret que tu choisis>
  WHATSAPP_ADMIN_PHONES=22893924040,22898399255
  META_APP_SECRET=<déjà là>
  SUPABASE_SERVICE_ROLE_KEY=<déjà là>
  RESEND_API_KEY=<déjà là>
Puis SQL : supabase/whatsapp_assistant.sql
`);
