import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { LegalPageShell, MentionsLegalesContent } from "@/components/vitrine/LegalPageShell";

export const metadata: Metadata = pageMetadata(
  "Mentions légales",
  "Éditeur, hébergement et contact — Wazo Digital.",
  "/legal/mentions-legales"
);

export default function MentionsLegalesPage() {
  return (
    <LegalPageShell title="Mentions légales">
      <MentionsLegalesContent />
    </LegalPageShell>
  );
}
