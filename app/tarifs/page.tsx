import Link from "next/link";
import { Check, Minus } from "lucide-react";
import { SiteHeader } from "@/components/vitrine/SiteHeader";
import { SiteFooter } from "@/components/vitrine/SiteFooter";
import { PRICING, PRICING_COMPARISON } from "@/lib/vitrine-data";

function CellValue({ value }: { value: boolean | string }) {
  if (typeof value === "boolean") {
    return value ? (
      <Check className="mx-auto h-5 w-5 text-[#075E54]" />
    ) : (
      <Minus className="mx-auto h-5 w-5 text-gray-300" />
    );
  }
  return <span className="text-sm font-medium">{value}</span>;
}

export default function TarifsPage() {
  return (
    <div className="scroll-smooth bg-[#FFF8F0] font-[system-ui,sans-serif] text-[#1A1A1A]">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-4 pb-20 pt-32 md:px-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold md:text-4xl">Tarifs Wazo Digital</h1>
          <p className="mx-auto mt-3 max-w-2xl text-[#1A1A1A]/75">
            Commencez gratuitement, passez au Pro quand votre activité grandit, et au Business pour
            gérer une équipe avec rapports automatiques.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {PRICING.map((plan) => (
            <article
              key={plan.id}
              className={`relative rounded-2xl border bg-white p-6 shadow-sm ${
                plan.popular
                  ? "border-[#075E54] shadow-lg shadow-[#075E54]/10"
                  : plan.ctaVariant === "teams"
                    ? "border-[#075E54]/40 shadow-md ring-2 ring-[#075E54]/10"
                    : "border-[#075E54]/10"
              }`}
            >
              {plan.popular ? (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#FF6F00] px-3 py-1 text-xs font-bold text-white">
                  ⭐ Recommandé
                </span>
              ) : null}
              {"badge" in plan && plan.badge && !plan.popular ? (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#075E54] px-3 py-1 text-xs font-bold text-white">
                  {plan.badge}
                </span>
              ) : null}
              <p className="text-sm font-semibold text-[#075E54]">{plan.title}</p>
              <p className="mt-1 font-medium">{plan.subtitle}</p>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="text-sm text-[#1A1A1A]/50">{plan.priceSuffix}</span>
              </div>
              <p className="mt-1 text-xs font-medium text-[#FF6F00]">{plan.hook}</p>
              <ul className="mt-5 space-y-2 text-sm text-[#1A1A1A]/80">
                {plan.features.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 text-[#075E54]" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href={`/register?plan=${plan.id}`}
                className={`mt-6 inline-flex w-full justify-center rounded-full px-5 py-2.5 text-sm font-semibold ${
                  plan.ctaVariant === "primary"
                    ? "bg-[#FF6F00] text-white"
                    : plan.ctaVariant === "teams"
                      ? "bg-[#075E54] text-white"
                      : "border-2 border-[#075E54]/30 text-[#075E54]"
                }`}
              >
                {plan.cta}
              </Link>
            </article>
          ))}
        </div>

        <section className="mt-16 overflow-x-auto rounded-2xl border border-[#075E54]/10 bg-white p-4 shadow-sm md:p-6">
          <h2 className="mb-6 text-xl font-bold">Comparaison détaillée</h2>
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-[#075E54]/10 text-[#1A1A1A]/60">
                <th className="pb-3 pr-4 font-medium">Fonctionnalité</th>
                <th className="pb-3 text-center font-medium">Gratuit</th>
                <th className="pb-3 text-center font-medium">Pro</th>
                <th className="pb-3 text-center font-medium">Business</th>
              </tr>
            </thead>
            <tbody>
              {PRICING_COMPARISON.map((row) => (
                <tr key={row.feature} className="border-b border-[#075E54]/5">
                  <td className="py-3 pr-4">{row.feature}</td>
                  <td className="py-3 text-center">
                    <CellValue value={row.free} />
                  </td>
                  <td className="py-3 text-center">
                    <CellValue value={row.pro} />
                  </td>
                  <td className="py-3 text-center">
                    <CellValue value={row.business} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <div className="mt-10 rounded-2xl bg-[#075E54] px-6 py-10 text-center text-white">
          <h2 className="text-xl font-bold">Essai gratuit, sans carte bancaire</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-white/85">
            Créez votre compte, choisissez vos modules et ouvrez l&apos;application en moins de 2
            minutes.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/register?plan=pro"
              className="inline-flex rounded-full bg-[#FF6F00] px-6 py-3 text-sm font-semibold text-white"
            >
              Je m&apos;abonne au PRO
            </Link>
            <Link
              href="/register?plan=business"
              className="inline-flex rounded-full border-2 border-white/40 bg-white/10 px-6 py-3 text-sm font-semibold text-white hover:bg-white/20"
            >
              Passer au BUSINESS
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
