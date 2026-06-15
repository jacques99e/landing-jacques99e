import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(
  "Application",
  "Accédez à l'application Wazo Digital : gestion commerce, stock, caisse Mobile Money et modules métier.",
  "/app"
);

export default function AppRedirectLayout({ children }: { children: React.ReactNode }) {
  return children;
}
