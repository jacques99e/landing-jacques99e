import type { Metadata } from "next";
import { noIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = noIndexMetadata("Redirection");

export default function PostAuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
