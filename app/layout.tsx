import type { Metadata } from "next";
import "./globals.css";
import { GoogleAdsTag } from "@/components/GoogleAdsTag";
import { MetaPixel } from "@/components/MetaPixel";
import { UtmCapture } from "@/components/UtmCapture";
import { buildRootMetadata } from "@/lib/seo";

export const metadata: Metadata = buildRootMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased">
        <MetaPixel />
        <GoogleAdsTag />
        <UtmCapture />
        {children}
      </body>
    </html>
  );
}
