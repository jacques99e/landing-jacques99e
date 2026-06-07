"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { NAV_LINKS } from "@/lib/vitrine-data";
import { resolveAppUrl } from "@/lib/public-urls";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const appUrl = resolveAppUrl();

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-50 bg-[#075E54] px-4 py-2 text-center text-sm font-medium text-white">
        🚀 Site vitrine — Inscrivez-vous ici, gérez votre activité dans l&apos;application Wazo Digital
      </div>

      <header className="fixed inset-x-0 top-10 z-40 border-b border-[#075E54]/10 bg-white/95 shadow-sm backdrop-blur">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold text-[#075E54]">
            <Image src="/logo-wazo.svg" alt="Wazo Digital" width={32} height={32} priority />
            <span>Wazo Digital</span>
          </Link>

          <div className="hidden items-center gap-6 md:flex">
            {NAV_LINKS.map((item) =>
              item.href.startsWith("/") ? (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium text-[#1A1A1A]/80 transition hover:text-[#075E54]"
                >
                  {item.label}
                </Link>
              ) : (
                <a
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium text-[#1A1A1A]/80 transition hover:text-[#075E54]"
                >
                  {item.label}
                </a>
              )
            )}
            <a
              href={`${appUrl}/login`}
              className="text-sm font-medium text-[#075E54] hover:underline"
            >
              Ouvrir l&apos;app
            </a>
            <Link
              href="/register"
              className="rounded-full bg-[#FF6F00] px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-105"
            >
              Essayer gratuitement
            </Link>
          </div>

          <button
            type="button"
            className="rounded-lg p-2 text-[#075E54] md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </nav>

        {open && (
          <div className="border-t border-[#075E54]/10 bg-white px-4 py-4 md:hidden">
            <div className="flex flex-col gap-3">
              {NAV_LINKS.map((item) =>
                item.href.startsWith("/") ? (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="text-sm font-medium"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="text-sm font-medium"
                  >
                    {item.label}
                  </a>
                )
              )}
              <a href={`${appUrl}/login`} className="text-sm font-medium text-[#075E54]">
                Ouvrir l&apos;application
              </a>
              <Link
                href="/register"
                onClick={() => setOpen(false)}
                className="rounded-full bg-[#FF6F00] px-5 py-2.5 text-center text-sm font-semibold text-white"
              >
                Essayer gratuitement
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
