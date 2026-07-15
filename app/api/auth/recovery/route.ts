import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { PROD_LANDING_URL } from "@/lib/site-urls";

export const runtime = "nodejs";

const RATE = new Map<string, number>();

function clientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function tooFrequent(key: string, minMs = 60_000): boolean {
  const now = Date.now();
  const prev = RATE.get(key) || 0;
  if (now - prev < minMs) return true;
  RATE.set(key, now);
  return false;
}

async function sendResend(params: {
  to: string;
  subject: string;
  text: string;
  html: string;
}) {
  const key = process.env.RESEND_API_KEY?.trim();
  const from =
    process.env.REPORT_EMAIL_FROM?.trim() ||
    "Wazo Digital <onboarding@wazo-digital.com>";
  if (!key) return { ok: false as const, error: "RESEND_API_KEY manquant" };

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [params.to],
      subject: params.subject,
      text: params.text,
      html: params.html,
    }),
  });
  const body = (await res.json().catch(() => ({}))) as {
    id?: string;
    message?: string;
  };
  if (!res.ok) {
    return { ok: false as const, error: body.message || res.statusText };
  }
  return { ok: true as const, id: body.id };
}

/**
 * Recovery password via Resend (contourne SMTP Supabase cassé / mal configuré).
 * Ne révèle pas si l'email existe.
 */
export async function POST(request: Request) {
  let email = "";
  try {
    const body = (await request.json()) as { email?: string };
    email = String(body.email || "")
      .trim()
      .toLowerCase();
  } catch {
    return NextResponse.json({ success: false, error: "JSON invalide" }, { status: 400 });
  }

  if (!email || !email.includes("@") || email.endsWith(".com.com")) {
    return NextResponse.json(
      { success: false, error: "Adresse email invalide" },
      { status: 400 }
    );
  }

  const ip = clientIp(request);
  if (tooFrequent(`ip:${ip}`) || tooFrequent(`email:${email}`)) {
    // Réponse neutre anti-énumération
    return NextResponse.json({
      success: true,
      message:
        "Si un compte existe pour cette adresse, un email vient d'être envoyé.",
    });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !service) {
    console.error("[recovery] SUPABASE_SERVICE_ROLE_KEY manquant sur Landing");
    return NextResponse.json(
      {
        success: false,
        error:
          "Configuration serveur incomplète. Réessayez plus tard ou contactez le support.",
      },
      { status: 503 }
    );
  }

  const admin = createClient(url, service, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const landing =
    process.env.NEXT_PUBLIC_LANDING_URL?.replace(/\/$/, "") || PROD_LANDING_URL;
  const redirectTo = `${landing}/auth/callback?next=${encodeURIComponent("/reset-password")}`;

  const { data, error } = await admin.auth.admin.generateLink({
    type: "recovery",
    email,
    options: { redirectTo },
  });

  // Ne pas révéler l'absence de compte
  if (error || !data?.properties?.action_link) {
    console.warn("[recovery] generateLink:", error?.message || "no link");
    return NextResponse.json({
      success: true,
      message:
        "Si un compte existe pour cette adresse, un email vient d'être envoyé.",
    });
  }

  const actionLink = data.properties.action_link;
  const text = [
    "Bonjour,",
    "",
    "Vous avez demandé à réinitialiser votre mot de passe Wazo Digital.",
    "",
    "Cliquez sur ce lien (valide une durée limitée) :",
    actionLink,
    "",
    "Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.",
    "",
    "— Wazo Digital",
  ].join("\n");

  const html = `
    <div style="font-family:sans-serif;max-width:560px;line-height:1.5;color:#1A1A1A">
      <p>Bonjour,</p>
      <p>Vous avez demandé à réinitialiser votre mot de passe <strong>Wazo Digital</strong>.</p>
      <p style="margin:24px 0">
        <a href="${actionLink}"
           style="background:#FF6F00;color:#fff;padding:12px 20px;border-radius:999px;text-decoration:none;font-weight:600;display:inline-block">
          Réinitialiser mon mot de passe
        </a>
      </p>
      <p style="font-size:13px;color:#555">Si le bouton ne marche pas, copiez ce lien :<br>${actionLink}</p>
      <p style="font-size:13px;color:#555">Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
    </div>
  `;

  const sent = await sendResend({
    to: email,
    subject: "Réinitialisation de votre mot de passe — Wazo Digital",
    text,
    html,
  });

  if (!sent.ok) {
    console.error("[recovery] Resend:", sent.error);
    return NextResponse.json(
      {
        success: false,
        error:
          "Impossible d'envoyer l'email pour le moment. Vérifiez RESEND_API_KEY sur la Landing.",
      },
      { status: 502 }
    );
  }

  return NextResponse.json({
    success: true,
    message:
      "Si un compte existe pour cette adresse, un email vient d'être envoyé.",
  });
}
