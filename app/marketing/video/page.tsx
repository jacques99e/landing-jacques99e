import Link from "next/link";
import type { Metadata } from "next";
import { noIndexMetadata } from "@/lib/seo";
import { DEMO_VIDEO } from "@/lib/vitrine-data";
import { BRAND, VIDEO_SCRIPT_60S, VIDEO_SCRIPT_FULL } from "@/lib/marketing-package";

export const metadata: Metadata = noIndexMetadata("Vidéo démo Wazo Digital");

export default function MarketingVideoPage() {
  return (
    <div className="min-h-screen bg-[#FFF8F0] px-4 py-12 font-[system-ui,sans-serif] text-[#1A1A1A]">
      <div className="mx-auto max-w-3xl">
        <Link href="/marketing" className="text-sm text-[#075E54] underline">
          ← Package marketing
        </Link>
        <h1 className="mt-4 text-3xl font-bold text-[#075E54]">Vidéo de démonstration</h1>

        <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Démo en ligne (site)</h2>
          <p className="mt-2 text-sm text-gray-600">{DEMO_VIDEO.subtitle}</p>
          <video
            className="mt-4 w-full rounded-xl border border-gray-200"
            controls
            poster={DEMO_VIDEO.poster}
            preload="metadata"
          >
            <source src={DEMO_VIDEO.mp4Src} type="video/mp4" />
            <source src={DEMO_VIDEO.webmSrc} type="video/webm" />
          </video>
          <p className="mt-2 text-xs text-gray-500">Durée : {DEMO_VIDEO.durationLabel}</p>
          <a
            href={BRAND.demoVideo}
            className="mt-3 inline-block text-sm font-medium text-[#075E54] underline"
          >
            Voir sur la page d&apos;accueil
          </a>
        </section>

        <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">{VIDEO_SCRIPT_60S.title}</h2>
          <p className="text-sm text-gray-600">
            {VIDEO_SCRIPT_60S.duration} · {VIDEO_SCRIPT_60S.format}
          </p>
          <ol className="mt-4 space-y-4">
            {VIDEO_SCRIPT_60S.scenes.map((scene) => (
              <li key={scene.t} className="rounded-xl border border-gray-100 p-4 text-sm">
                <p className="font-semibold text-[#075E54]">{scene.t}</p>
                <p>
                  <strong>Visuel :</strong> {scene.visuel}
                </p>
                <p>
                  <strong>Voix :</strong> « {scene.voix} »
                </p>
                <p>
                  <strong>Texte écran :</strong> {scene.texteEcran}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">{VIDEO_SCRIPT_FULL.title}</h2>
          <p className="text-sm text-gray-600">{VIDEO_SCRIPT_FULL.duration} · {VIDEO_SCRIPT_FULL.format}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {VIDEO_SCRIPT_FULL.chapters.map((ch) => (
              <span
                key={ch}
                className="rounded-full bg-[#075E54]/10 px-3 py-1 text-xs font-medium text-[#075E54]"
              >
                {ch}
              </span>
            ))}
          </div>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm">
            {VIDEO_SCRIPT_FULL.narration.map((line) => (
              <li key={line.slice(0, 40)}>{line}</li>
            ))}
          </ol>
        </section>

        <section className="mt-8 rounded-2xl border border-[#FF6F00]/30 bg-[#FF6F00]/5 p-6">
          <h2 className="text-lg font-semibold">Régénérer la vidéo automatiquement</h2>
          <p className="mt-2 text-sm text-gray-700">
            Depuis le dossier Landing, avec un compte test configuré :
          </p>
          <pre className="mt-3 overflow-x-auto rounded-lg bg-gray-900 p-4 text-xs text-green-300">
            {VIDEO_SCRIPT_FULL.production.recordCommand}
          </pre>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-gray-600">
            {VIDEO_SCRIPT_FULL.production.requirements.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-gray-500">
            Fichiers générés : {VIDEO_SCRIPT_FULL.production.outputFiles.join(", ")}
          </p>
        </section>
      </div>
    </div>
  );
}
