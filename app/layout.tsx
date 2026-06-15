import type { Metadata } from "next";
import "./globals.css";
import { buildRootMetadata } from "@/lib/seo";
import { CookieConsent } from "@/components/vitrine/CookieConsent";

export const metadata: Metadata = buildRootMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased">
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
