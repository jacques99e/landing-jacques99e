import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 30;

type FeedbackBody = {
  name?: string;
  email?: string;
  store?: string;
  rating?: string | number;
  worksWell?: string;
  improve?: string;
  missingFeature?: string;
  source?: string;
};

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as FeedbackBody;
    const name = String(body.name || "").trim().slice(0, 120);
    const email = String(body.email || "").trim().slice(0, 180);
    const store = String(body.store || "").trim().slice(0, 120);
    const rating = Number(body.rating);
    const worksWell = String(body.worksWell || "").trim().slice(0, 2000);
    const improve = String(body.improve || "").trim().slice(0, 2000);
    const missingFeature = String(body.missingFeature || "").trim().slice(0, 2000);
    const source = String(body.source || "web").trim().slice(0, 40);

    if (!improve && !worksWell && !missingFeature) {
      return NextResponse.json(
        { success: false, error: "Écrivez au moins un commentaire." },
        { status: 400 }
      );
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ success: false, error: "Email invalide." }, { status: 400 });
    }
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: "Notez de 1 à 5." },
        { status: 400 }
      );
    }

    const key = process.env.RESEND_API_KEY?.trim();
    const from =
      process.env.REPORT_EMAIL_FROM?.trim() || "Wazo Digital <onboarding@wazo-digital.com>";
    const to =
      process.env.FEEDBACK_EMAIL_TO?.trim() ||
      process.env.REPORT_EMAIL_TO?.trim() ||
      "jacquesnoussougan93@gmail.com";

    if (!key) {
      return NextResponse.json(
        { success: false, error: "Envoi email non configuré." },
        { status: 503 }
      );
    }

    const text = [
      "Nouveau feedback Wazo Digital",
      `Source: ${source}`,
      `Note: ${rating}/5`,
      `Nom: ${name || "—"}`,
      `Email: ${email || "—"}`,
      `Boutique: ${store || "—"}`,
      "",
      "Ce qui marche bien:",
      worksWell || "—",
      "",
      "À améliorer:",
      improve || "—",
      "",
      "Fonctionnalité manquante:",
      missingFeature || "—",
    ].join("\n");

    const html = `
      <div style="font-family:sans-serif;max-width:560px;padding:16px;line-height:1.5">
        <h2 style="margin:0 0 12px;color:#075E54">Feedback pilote — ${rating}/5</h2>
        <p><strong>Nom:</strong> ${escapeHtml(name || "—")}<br/>
        <strong>Email:</strong> ${escapeHtml(email || "—")}<br/>
        <strong>Boutique:</strong> ${escapeHtml(store || "—")}<br/>
        <strong>Source:</strong> ${escapeHtml(source)}</p>
        <h3 style="color:#075E54">Ce qui marche bien</h3>
        <p>${escapeHtml(worksWell || "—").replace(/\n/g, "<br/>")}</p>
        <h3 style="color:#075E54">À améliorer</h3>
        <p>${escapeHtml(improve || "—").replace(/\n/g, "<br/>")}</p>
        <h3 style="color:#075E54">Fonctionnalité manquante</h3>
        <p>${escapeHtml(missingFeature || "—").replace(/\n/g, "<br/>")}</p>
      </div>`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email || undefined,
        subject: `Feedback Wazo ${rating}/5 — ${name || store || email || "anonyme"}`,
        text,
        html,
      }),
    });

    const payload = (await res.json().catch(() => ({}))) as { id?: string; message?: string };
    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: payload.message || "Envoi impossible." },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, id: payload.id });
  } catch {
    return NextResponse.json(
      { success: false, error: "Erreur serveur feedback." },
      { status: 500 }
    );
  }
}
