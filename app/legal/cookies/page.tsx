import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { CookiesContent, LegalPageShell } from "@/components/vitrine/LegalPageShell";

export const metadata: Metadata = pageMetadata(
  "Politique cookies",
  "Cookies essentiels et mesure d'audience — Wazo Digital.",
  "/legal/cookies"
);

export default function CookiesPage() {
  return (
    <LegalPageShell title="Politique cookies">
      <CookiesContent />
    </LegalPageShell>
  );
}
