import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { ConfidentialiteContent, LegalPageShell } from "@/components/vitrine/LegalPageShell";

export const metadata: Metadata = pageMetadata(
  "Politique de confidentialité",
  "Protection des données personnelles et droits RGPD — Wazo Digital.",
  "/legal/confidentialite"
);

export default function ConfidentialitePage() {
  return (
    <LegalPageShell title="Politique de confidentialité">
      <ConfidentialiteContent />
    </LegalPageShell>
  );
}
