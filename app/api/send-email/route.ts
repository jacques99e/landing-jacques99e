import { NextResponse } from "next/server";
import { sendHelloWorldEmail } from "../../../lib/resend";

export async function POST() {
  try {
    const data = await sendHelloWorldEmail();
    return NextResponse.json({ ok: true, id: data?.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur d'envoi";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
