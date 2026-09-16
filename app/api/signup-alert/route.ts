import { NextRequest, NextResponse } from "next/server";
import { allowIp } from "@/lib/rate-limit";
import { secretsEqual } from "@/lib/secret-compare";

export const maxDuration = 20;

const ALLOWED_ORIGINS = [
  "https://app.wazo-digital.com",
  "https://wazo-digital.com",
  "https://www.wazo-digital.com",
  "http://localhost:3001",
  "http://localhost:3000",
];

function allowedOrigins(): string[] {
  const extra = [
    process.env.NEXT_PUBLIC_LANDING_URL?.replace(/\/$/, ""),
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, ""),
  ].filter(Boolean) as string[];
  return [...new Set([...ALLOWED_ORIGINS, ...extra])];
}

function alertSecret(): string {
  return (
    process.env.SIGNUP_ALERT_SECRET?.trim() ||
    process.env.CRON_SECRET?.trim() ||
    ""
  );
}

function authorizeAlert(request: NextRequest): boolean {
  const origin = request.headers.get("origin")?.trim() || "";
  if (origin) return allowedOrigins().includes(origin);

  const secret = alertSecret();
  if (!secret) return true;
  const auth = request.headers.get("authorization") || "";
  const bearer = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  const headerSecret = request.headers.get("x-wazo-alert-secret")?.trim() || "";
  return secretsEqual(bearer, secret) || secretsEqual(headerSecret, secret);
}

function withCors(request: NextRequest, res: NextResponse) {
  const origin = request.headers.get("origin") || "";
  if (allowedOrigins().includes(origin)) {
    res.headers.set("Access-Control-Allow-Origin", origin);
    res.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, x-wazo-alert-secret");
  }
  return res;
}

export async function OPTIONS(request: NextRequest) {
  return withCors(request, new NextResponse(null, { status: 204 }));
}

function strip(value: string): string {
  return value.replace(/[\r\n]+/g, " ").trim();
}

function waDigits(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  if (digits.length === 8) digits = `228${digits}`;
  return digits;
}

export async function POST(request: NextRequest) {
  const json = (body: unknown, status = 200) =>
    withCors(request, NextResponse.json(body, { status }));

  if (!authorizeAlert(request)) {
    return json({ success: false, error: "Non autorisé." }, 401);
  }

  if (!allowIp(request, "signup-alert", 8, 60 * 60 * 1000)) {
    return json({ success: false, error: "Trop de requêtes." }, 429);
  }

  const body = (await request.json().catch(() => ({}))) as {
    name?: string;
    email?: string;
    whatsapp?: string;
    store?: string;
    slug?: string;
    stage?: string;
    utm?: string;
    plan?: string;
    website?: string;
    note?: string;
  };

  if (String(body.website || "").trim()) {
    return json({ success: true });
  }

  const name = strip(String(body.name || "")).slice(0, 120);
  const email = strip(String(body.email || "")).slice(0, 180);
  const whatsapp = strip(String(body.whatsapp || "")).slice(0, 32);
  const store = strip(String(body.store || "")).slice(0, 120);
  const slug = strip(String(body.slug || "")).slice(0, 80);
  const stage = strip(String(body.stage || "register")).slice(0, 40);
  const utm = strip(String(body.utm || "")).slice(0, 160);
  const plan = strip(String(body.plan || "")).slice(0, 20);
  const note = strip(String(body.note || "")).slice(0, 200);
  const digits = waDigits(whatsapp);

  if (!name && !email && !digits) {
    return json({ success: false, error: "Contact manquant." }, 400);
  }

  const key = process.env.RESEND_API_KEY?.trim();
  const from =
    process.env.REPORT_EMAIL_FROM?.trim() || "Wazo Digital <onboarding@wazo-digital.com>";
  const to =
    process.env.SIGNUP_ALERT_TO?.trim() ||
    process.env.REPORT_EMAIL_TO?.trim() ||
    "jacquesnoussougan93@gmail.com";

  if (!key) {
    return json({ success: false, error: "Email non configuré." }, 503);
  }

  const payUrl = slug ? `https://app.wazo-digital.com/boutique/${slug}/payer` : "";
  const proPay = "https://app.wazo-digital.com/billing?plan=pro&pay=1";
  const merchantText =
    stage === "first_sale"
      ? [
          `Bonjour ${name || ""} !`.trim(),
          "",
          store
            ? `Votre boutique ${store} vient d’encaisser une vente MoMo${note ? ` (${note})` : ""}.`
            : "Vous venez d’encaisser une vente MoMo.",
          "Pour garder le lien paiement, la caisse et le stock après l’essai :",
          `PRO 9,99 €/mois (~6550 FCFA) : ${proPay}`,
          "",
          "Jacques — Wazo Digital",
        ].join("\n")
      : [
          `Bonjour ${name || ""} !`.trim(),
          "",
          store
            ? `Votre boutique ${store} est prête.`
            : "Votre compte Wazo Digital est créé.",
          payUrl
            ? `Lien MoMo (après 1 produit) : ${payUrl}`
            : "Ajoutez 1 produit, puis envoyez le lien MoMo au client.",
          "",
          "Bloqué ? Répondez ici avec une capture.",
          "Jacques — Wazo Digital",
        ].join("\n");
  const waLink = digits
    ? `https://wa.me/${digits}?text=${encodeURIComponent(merchantText)}`
    : "";

  const headline =
    stage === "first_sale"
      ? "1ère vente MoMo — relancer PRO"
      : `Nouvelle inscription Wazo (${stage})`;
  const text = [
    headline,
    `Nom: ${name || "—"}`,
    `Email: ${email || "—"}`,
    `WhatsApp: ${whatsapp || "—"}`,
    `Boutique: ${store || "—"}`,
    `Slug: ${slug || "—"}`,
    `Plan: ${plan || "—"}`,
    `UTM: ${utm || "—"}`,
    note ? `Note: ${note}` : "",
    "",
    waLink ? `Écrire maintenant : ${waLink}` : "Pas de WhatsApp.",
    payUrl ? `Lien payer : ${payUrl}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const subject =
    stage === "first_sale"
      ? `Wazo — 1ère vente MoMo ${store || name || email || digits}`
      : `Wazo — ${
          plan === "pro" || plan === "business"
            ? `essai ${plan.toUpperCase()}`
            : stage === "store"
              ? "boutique créée"
              : "inscription"
        } ${name || email || digits}`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      text,
    }),
  });

  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { message?: string };
    return json({ success: false, error: err.message || "Envoi impossible." }, 502);
  }

  return json({ success: true, waLink });
}
