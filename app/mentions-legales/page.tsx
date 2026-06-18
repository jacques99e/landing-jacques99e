import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { SiteHeader } from "@/components/vitrine/SiteHeader";
import { SiteFooter } from "@/components/vitrine/SiteFooter";
import { WHATSAPP_SUPPORT } from "@/lib/vitrine-data";

export const metadata: Metadata = pageMetadata(
  "Mentions légales",
  "Mentions légales du site Wazo Digital.",
  "/mentions-legales"
);

export default function MentionsLegalesPage() {
  return (
    <div className="scroll-smooth bg-[#FFF8F0] font-[system-ui,sans-serif] text-[#1A1A1A]">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 pb-20 pt-32 md:px-6">
        <h1 className="text-3xl font-bold">Mentions légales</h1>
        <div className="prose prose-sm mt-8 max-w-none space-y-6 text-[#1A1A1A]/85">
          <section>
            <h2 className="text-lg font-semibold text-[#075E54]">Éditeur</h2>
            <p>
              Wazo Digital — plateforme de gestion pour commerçants et micro-entreprises en Afrique.
            </p>
            <p>
              Contact :{" "}
              <a
                href={`https://wa.me/${WHATSAPP_SUPPORT.replace(/\D/g, "")}`}
                className="text-[#075E54] underline"
              >
                WhatsApp {WHATSAPP_SUPPORT}
              </a>
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-[#075E54]">Hébergement</h2>
            <p>
              Site vitrine et application hébergés par Vercel Inc. Données applicatives hébergées
              par Supabase (infrastructure cloud sécurisée).
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-[#075E54]">Propriété intellectuelle</h2>
            <p>
              L&apos;ensemble du contenu du site (textes, visuels, marque Wazo Digital) est protégé.
              Toute reproduction sans autorisation est interdite.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-[#075E54]">Données personnelles</h2>
            <p>
              Voir notre{" "}
              <Link href="/confidentialite" className="text-[#075E54] underline">
                politique de confidentialité
              </Link>
              .
            </p>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
