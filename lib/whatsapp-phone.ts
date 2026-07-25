/** Normalise un numéro WhatsApp (chiffres, avec indicatif si possible). */
export function normalizeWhatsAppPhone(raw: string): string {
  let digits = String(raw || "").replace(/\D/g, "");
  if (!digits) return "";
  // Numéros locaux 8 chiffres (TG/BJ courants) → +228 par défaut si non préfixés
  if (digits.length === 8) digits = `228${digits}`;
  // SN mobile 9 chiffres commençant par 7
  if (digits.length === 9 && digits.startsWith("7")) digits = `221${digits}`;
  return digits;
}

export function isValidWhatsAppPhone(raw: string): boolean {
  const digits = normalizeWhatsAppPhone(raw);
  return digits.length >= 10 && digits.length <= 15;
}
