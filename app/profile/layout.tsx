import type { Metadata } from "next";
import { noIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = noIndexMetadata("Profil");

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children;
}
