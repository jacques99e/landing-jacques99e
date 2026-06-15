import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(
  "Inscription",
  "Créez votre compte Wazo Digital gratuitement. Caisse MoMo, stock, boutique WhatsApp et 6 modules métier pour votre activité.",
  "/register"
);

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
