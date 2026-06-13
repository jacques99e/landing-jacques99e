import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wazo Digital — Site vitrine de l'application",
  description:
    "Découvrez Wazo Digital : caisse, stock, boutique WhatsApp, formation, livraisons et traçabilité. Inscrivez-vous et gérez votre activité depuis l'application.",
  openGraph: {
    title: "Wazo Digital — L'app pour digitaliser votre activité en Afrique",
    description:
      "Commerce, agriculture, santé, logistique, formation et traçabilité — une application mobile pensée pour l'Afrique.",
    type: "website",
    url: "https://wazo-digital.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased">{children}</body>
    </html>
  );
}
