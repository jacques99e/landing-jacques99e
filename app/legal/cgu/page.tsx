import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { CguContent, LegalPageShell } from "@/components/vitrine/LegalPageShell";

export const metadata: Metadata = pageMetadata(
  "Conditions générales d'utilisation",
  "CGU du service Wazo Digital — abonnements, responsabilités et droits.",
  "/legal/cgu"
);

export default function CguPage() {
  return (
    <LegalPageShell title="Conditions générales d'utilisation">
      <CguContent />
    </LegalPageShell>
  );
}
