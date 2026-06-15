import type { Metadata } from "next";
import { noIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = noIndexMetadata("Marketing Wazo Digital");

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
