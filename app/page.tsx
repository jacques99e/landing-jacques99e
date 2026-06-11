import { SiteHeader } from "@/components/vitrine/SiteHeader";
import { SiteFooter } from "@/components/vitrine/SiteFooter";
import { HeroSection } from "@/components/vitrine/HeroSection";
import { SocialProofBar } from "@/components/vitrine/SocialProofBar";
import { PainGainSection } from "@/components/vitrine/PainGainSection";
import { ModulesSection } from "@/components/vitrine/ModulesSection";
import { PublicPortalsSection } from "@/components/vitrine/PublicPortalsSection";
import { DemoVideoSection } from "@/components/vitrine/DemoVideoSection";
import { MidPageCta } from "@/components/vitrine/MidPageCta";
import { StickyCtaBar } from "@/components/vitrine/StickyCtaBar";
import {
  CTASection,
  FAQSection,
  FeaturesSection,
  HowItWorksSection,
  PricingSection,
  TestimonialsSection,
  TrustSection,
} from "@/components/vitrine/Sections";
import { MID_CTA_AFTER_DEMO, MID_CTA_BEFORE_PRICING } from "@/lib/vitrine-data";

export default function HomePage() {
  return (
    <div className="scroll-smooth bg-[#FFF8F0] font-[system-ui,sans-serif] text-[#1A1A1A]">
      <SiteHeader />
      <StickyCtaBar />

      <main className="mx-auto max-w-6xl px-4 pb-24 pt-32 md:px-6">
        {/* 1. Accroche immédiate */}
        <HeroSection />
        <SocialProofBar />

        {/* 2. Curiosité — le problème / la solution */}
        <PainGainSection />

        {/* 3. Preuve visuelle — voir l'app en action */}
        <DemoVideoSection />
        <div className="py-8">
          <MidPageCta
            eyebrow={MID_CTA_AFTER_DEMO.eyebrow}
            title={MID_CTA_AFTER_DEMO.title}
            subtitle={MID_CTA_AFTER_DEMO.subtitle}
          />
        </div>

        {/* 4. Découverte progressive */}
        <FeaturesSection />
        <ModulesSection />
        <PublicPortalsSection />
        <HowItWorksSection />
        <TrustSection />

        {/* 5. Social proof + conversion */}
        <TestimonialsSection />
        <div className="py-8">
          <MidPageCta
            eyebrow={MID_CTA_BEFORE_PRICING.eyebrow}
            title={MID_CTA_BEFORE_PRICING.title}
            subtitle={MID_CTA_BEFORE_PRICING.subtitle}
            secondaryHref="#tarifs"
            secondaryLabel="Comparer les plans"
          />
        </div>
        <PricingSection />
        <FAQSection />
        <CTASection />
      </main>

      <SiteFooter />
    </div>
  );
}
