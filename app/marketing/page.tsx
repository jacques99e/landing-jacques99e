import Link from "next/link";
import type { Metadata } from "next";
import { noIndexMetadata } from "@/lib/seo";
import { BRAND, SOCIAL_POSTS_30 } from "@/lib/marketing-package";

export const metadata: Metadata = {
  ...noIndexMetadata("Marketing Wazo Digital"),
  title: "Package marketing",
};

export default function MarketingHubPage() {
  return (
    <div className="min-h-screen bg-[#FFF8F0] px-4 py-12 font-[system-ui,sans-serif] text-[#1A1A1A]">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-medium text-[#075E54]">Usage interne / commercial</p>
        <h1 className="mt-2 text-3xl font-bold">Package marketing Wazo Digital</h1>
        <p className="mt-2 text-[#1A1A1A]/75">
          Plaquette imprimable, scripts vidéo et {SOCIAL_POSTS_30.length} posts réseaux prêts à publier.
        </p>

        <ul className="mt-8 space-y-4">
          <li>
            <Link
              href="/marketing/plaquette"
              className="block rounded-2xl border border-[#075E54]/15 bg-white p-5 shadow-sm hover:border-[#075E54]/40"
            >
              <span className="text-2xl">📄</span>
              <h2 className="mt-2 text-lg font-semibold text-[#075E54]">Plaquette commerciale</h2>
              <p className="text-sm text-[#1A1A1A]/70">
                Document A4 prêt à imprimer ou exporter en PDF (Ctrl+P).
              </p>
            </Link>
          </li>
          <li>
            <Link
              href="/marketing/video"
              className="block rounded-2xl border border-[#075E54]/15 bg-white p-5 shadow-sm hover:border-[#075E54]/40"
            >
              <span className="text-2xl">🎬</span>
              <h2 className="mt-2 text-lg font-semibold text-[#075E54]">Vidéo de démonstration</h2>
              <p className="text-sm text-[#1A1A1A]/70">
                Scripts 60 s et 3 min30 + lien vers la démo en ligne et commande d&apos;enregistrement.
              </p>
            </Link>
          </li>
          <li>
            <Link
              href="/marketing/posts"
              className="block rounded-2xl border border-[#075E54]/15 bg-white p-5 shadow-sm hover:border-[#075E54]/40"
            >
              <span className="text-2xl">📱</span>
              <h2 className="mt-2 text-lg font-semibold text-[#075E54]">
                30 posts réseaux sociaux
              </h2>
              <p className="text-sm text-[#1A1A1A]/70">
                Calendrier 30 jours — WhatsApp, Instagram, Facebook, LinkedIn, TikTok.
              </p>
            </Link>
          </li>
        </ul>

        <p className="mt-10 text-center text-sm text-[#1A1A1A]/60">
          <Link href="/" className="text-[#075E54] underline">
            Retour au site
          </Link>
          {" · "}
          {BRAND.landing}
        </p>
      </div>
    </div>
  );
}
