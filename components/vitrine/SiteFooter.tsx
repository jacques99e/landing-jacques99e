import Image from "next/image";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { resolveAppUrl } from "@/lib/public-urls";
import { WHATSAPP_SUPPORT } from "@/lib/vitrine-data";

const WHATSAPP_URL = `https://wa.me/${WHATSAPP_SUPPORT.replace(/\D/g, "")}`;

export function SiteFooter() {
  const appUrl = resolveAppUrl();

  return (
    <footer className="border-t border-[#075E54]/10 bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-4 md:px-6">
        <div>
          <div className="flex items-center gap-2 text-[#075E54]">
            <Image src="/logo-wazo.svg" alt="" width={28} height={28} />
            <span className="font-semibold">Wazo Digital</span>
          </div>
          <p className="mt-3 text-sm text-[#1A1A1A]/70">
            Site vitrine & inscription. L&apos;application complète pour gérer votre activité au
            quotidien.
          </p>
        </div>
        <div>
          <p className="font-semibold">Découvrir</p>
          <ul className="mt-3 space-y-2 text-sm text-[#1A1A1A]/70">
            <li>
              <a href="#application">L&apos;application</a>
            </li>
            <li>
              <a href="#modules">Modules</a>
            </li>
            <li>
              <a href="#portails">Portails publics</a>
            </li>
            <li>
              <a href="#tarifs">Tarifs</a>
            </li>
          </ul>
        </div>
        <div>
          <p className="font-semibold">Accès</p>
          <ul className="mt-3 space-y-2 text-sm text-[#1A1A1A]/70">
            <li>
              <Link href="/guide-pilote">Guide commerçant pilote</Link>
            </li>
            <li>
              <Link href="/register">Créer un compte</Link>
            </li>
            <li>
              <Link href="/login">Se connecter</Link>
            </li>
            <li>
              <a href={appUrl}>Ouvrir l&apos;application</a>
            </li>
            <li>
              <a href={`${appUrl}/help`}>Centre d&apos;aide app</a>
            </li>
          </ul>
        </div>
        <div>
          <p className="font-semibold">Contact</p>
          <ul className="mt-3 space-y-2 text-sm text-[#1A1A1A]/70">
            <li>
              <a href={WHATSAPP_URL} target="_blank" rel="noreferrer">
                WhatsApp {WHATSAPP_SUPPORT}
              </a>
            </li>
          </ul>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="WhatsApp"
            className="mt-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#075E54]/25 text-[#075E54] hover:bg-[#075E54]/10"
          >
            <MessageCircle className="h-4 w-4" />
          </a>
        </div>
      </div>
      <div className="border-t border-[#075E54]/10 py-4 text-center text-sm text-[#1A1A1A]/60">
        <p>
          © {new Date().getFullYear()} Wazo Digital — Fait avec ❤️ pour l&apos;Afrique
        </p>
        <p className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <Link href="/mentions-legales" className="hover:text-[#075E54]">
            Mentions légales
          </Link>
          <Link href="/confidentialite" className="hover:text-[#075E54]">
            Confidentialité
          </Link>
          <Link href="/feedback" className="hover:text-[#075E54]">
            Donner mon avis
          </Link>
        </p>
      </div>
    </footer>
  );
}
