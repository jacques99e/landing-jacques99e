import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { LegalPageShell } from "@/components/vitrine/LegalPageShell";
import { LEGAL_PAGES } from "@/lib/legal-content";

export const metadata: Metadata = pageMetadata(
  "Informations légales",
  "Mentions légales, confidentialité, CGU et cookies — Wazo Digital.",
  "/legal"
);

export default function LegalIndexPage() {
  return (
    <LegalPageShell title="Informations légales">
      <p>
        Retrouvez ci-dessous l&apos;ensemble des documents régissant l&apos;utilisation de Wazo Digital,
        conformément au RGPD et aux bonnes pratiques pour un déploiement marketing en Afrique et en
        Europe.
      </p>
      <ul className="mt-4 space-y-3">
        {LEGAL_PAGES.map((page) => (
          <li key={page.href}>
            <Link
              href={page.href}
              className="text-base font-medium text-[#075E54] underline hover:opacity-80"
            >
              {page.title}
            </Link>
          </li>
        ))}
      </ul>
    </LegalPageShell>
  );
}
