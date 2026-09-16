import { after, NextResponse } from "next/server";
import { markWhatsAppRead, parseWhatsAppPayload, verifyWhatsAppRequest } from "@/lib/whatsapp-cloud";
import { handleInbound } from "@/lib/whatsapp-assistant";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");
  const expected = process.env.WHATSAPP_VERIFY_TOKEN?.trim();
  if (mode === "subscribe" && expected && token === expected && challenge) {
    return new NextResponse(challenge, { status: 200 });
  }
  return NextResponse.json({ error: "forbidden" }, { status: 403 });
}

export async function POST(request: Request) {
  const raw = await request.text();
  if (!verifyWhatsAppRequest(raw, request)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  let body: unknown = {};
  try {
    body = raw ? JSON.parse(raw) : {};
  } catch {
    return NextResponse.json({ ok: true });
  }

  const inbound = parseWhatsAppPayload(body);
  after(async () => {
    for (const msg of inbound) {
      await markWhatsAppRead(msg.messageId).catch(() => {});
      await handleInbound(msg).catch((err) => {
        console.error("[whatsapp] inbound", err instanceof Error ? err.message : err);
      });
    }
  });

  return NextResponse.json({ ok: true });
}
