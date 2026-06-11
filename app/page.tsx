import { SiteHeader } from "@/components/vitrine/SiteHeader";
import { SiteFooter } from "@/components/vitrine/SiteFooter";
import { HeroSection } from "@/components/vitrine/HeroSection";
import { ModulesSection } from "@/components/vitrine/ModulesSection";
import { PublicPortalsSection } from "@/components/vitrine/PublicPortalsSection";
import { DemoVideoSection } from "@/components/vitrine/DemoVideoSection";
import {
  CTASection,
  FAQSection,
  FeaturesSection,
  HowItWorksSection,
  PricingSection,
  TestimonialsSection,
  TrustSection,
} from "@/components/vitrine/Sections";

export default function HomePage() {
  return (
    <div className="scroll-smooth bg-[#FFF8F0] font-[system-ui,sans-serif] text-[#1A1A1A]">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-4 pb-20 pt-32 md:px-6">
        <HeroSection />
        <FeaturesSection />
        <TrustSection />
        <ModulesSection />
        <PublicPortalsSection />
        <HowItWorksSection />
        <DemoVideoSection />
        <TestimonialsSection />
        <PricingSection />
        <FAQSection />
        <CTASection />
      </main>

      <SiteFooter />
    </div>
  );
}
