import type { Metadata } from "next";
import { PROD_APP_URL, PROD_LANDING_URL } from "./site-urls";

export const SITE_URL =
  process.env.NEXT_PUBLIC_LANDING_URL?.trim().replace(/\/$/, "") || PROD_LANDING_URL;
export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "") || PROD_APP_URL;

export const SITE_NAME = "Wazo Digital";

export const DEFAULT_DESCRIPTION =
  "Wazo Digital : caisse Mobile Money, stock, boutique WhatsApp, formation, livraisons et traçabilité. L'application pour digitaliser votre micro-entreprise en Afrique.";

const KEYWORDS = [
  "Wazo Digital",
  "gestion commerce Afrique",
  "caisse Mobile Money",
  "boutique WhatsApp",
  "application commerçants",
  "gestion stock",
  "micro-entreprise Afrique",
  "FCFA",
  "MoMo",
];

function siteVerification(): Metadata["verification"] | undefined {
  const google = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim();
  const facebook =
    process.env.NEXT_PUBLIC_FACEBOOK_DOMAIN_VERIFICATION?.trim() ||
    "tc5avvkkhyutxy570fae95j12u09ma";

  const verification: NonNullable<Metadata["verification"]> = {
    other: {
      "facebook-domain-verification": facebook,
    },
  };
  if (google) verification.google = google;
  return verification;
}

export function buildRootMetadata(): Metadata {
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: "Wazo Digital — L'app pour digitaliser votre activité en Afrique",
      template: `%s | ${SITE_NAME}`,
    },
    description: DEFAULT_DESCRIPTION,
    keywords: KEYWORDS,
    authors: [{ name: SITE_NAME, url: SITE_URL }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    applicationName: SITE_NAME,
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large" },
    },
    alternates: {
      canonical: "/",
      languages: { "fr-FR": "/" },
    },
    openGraph: {
      type: "website",
      locale: "fr_FR",
      url: SITE_URL,
      siteName: SITE_NAME,
      title: "Wazo Digital — L'app pour digitaliser votre activité en Afrique",
      description: DEFAULT_DESCRIPTION,
      images: [{ url: "/logo-wazo.svg", alt: SITE_NAME }],
    },
    twitter: {
      card: "summary",
      title: "Wazo Digital — Commerce & digital en Afrique",
      description: DEFAULT_DESCRIPTION,
      images: ["/logo-wazo.svg"],
    },
    verification: siteVerification(),
  };
}

export function noIndexMetadata(title: string): Metadata {
  return {
    title,
    robots: { index: false, follow: false },
  };
}

export function pageMetadata(
  title: string,
  description: string,
  path: string,
  options?: { index?: boolean }
): Metadata {
  const index = options?.index !== false;
  return {
    title,
    description,
    alternates: { canonical: path },
    robots: index ? { index: true, follow: true } : { index: false, follow: false },
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url: `${SITE_URL}${path}`,
      type: "website",
    },
  };
}
