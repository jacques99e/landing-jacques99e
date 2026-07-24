import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import FeedbackPageClient from "./FeedbackForm";

export const metadata: Metadata = pageMetadata(
  "Donnez votre avis",
  "Aidez-nous à améliorer Wazo Digital : notez l'app et dites ce qu'il faut changer.",
  "/feedback",
  { index: false }
);

export default function FeedbackPage() {
  return <FeedbackPageClient />;
}
