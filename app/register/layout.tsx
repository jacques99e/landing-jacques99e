import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(
  "Créer un compte gratuit",
  "Inscrivez-vous en 30 secondes. Sans carte bancaire. Encaissez en Mobile Money dès aujourd’hui.",
  "/register"
);

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
