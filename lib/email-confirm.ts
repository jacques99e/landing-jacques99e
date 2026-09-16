export function isEmailNotConfirmedError(message: string | null | undefined): boolean {
  const m = String(message || "").toLowerCase();
  return (
    m.includes("email not confirmed") ||
    m.includes("not confirmed") ||
    m.includes("email_not_confirmed") ||
    m.includes("confirm your email")
  );
}

export function mailInboxUrl(email: string): string {
  const domain = email.split("@")[1]?.toLowerCase() || "";
  if (domain.includes("gmail") || domain.includes("googlemail")) {
    return "https://mail.google.com/mail/u/0/#inbox";
  }
  if (domain.includes("yahoo")) return "https://mail.yahoo.com/";
  if (domain.includes("outlook") || domain.includes("hotmail") || domain.includes("live.com")) {
    return "https://outlook.live.com/mail/0/inbox";
  }
  if (domain.includes("icloud") || domain === "me.com" || domain === "mac.com") {
    return "https://www.icloud.com/mail";
  }
  return `mailto:${email}`;
}

export function mailInboxLabel(email: string): string {
  const domain = email.split("@")[1]?.toLowerCase() || "";
  if (domain.includes("gmail") || domain.includes("googlemail")) return "Ouvrir Gmail";
  if (domain.includes("yahoo")) return "Ouvrir Yahoo Mail";
  if (domain.includes("outlook") || domain.includes("hotmail") || domain.includes("live.com")) {
    return "Ouvrir Outlook";
  }
  if (domain.includes("icloud") || domain === "me.com" || domain === "mac.com") {
    return "Ouvrir iCloud Mail";
  }
  return "Ouvrir ma boîte mail";
}
