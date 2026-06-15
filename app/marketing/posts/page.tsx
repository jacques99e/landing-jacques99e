"use client";

import Link from "next/link";
import { useState } from "react";
import { SOCIAL_POSTS_30 } from "@/lib/marketing-package";

export default function MarketingPostsPage() {
  const [copied, setCopied] = useState<number | null>(null);

  const copy = async (day: number, text: string, cta: string) => {
    const full = `${text}\n\n👉 ${cta}`;
    await navigator.clipboard.writeText(full);
    setCopied(day);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#FFF8F0] px-4 py-12 font-[system-ui,sans-serif] text-[#1A1A1A]">
      <div className="mx-auto max-w-3xl">
        <Link href="/marketing" className="text-sm text-[#075E54] underline">
          ← Package marketing
        </Link>
        <h1 className="mt-4 text-3xl font-bold text-[#075E54]">30 posts réseaux sociaux</h1>
        <p className="mt-2 text-sm text-gray-600">
          Calendrier 30 jours — cliquez « Copier » pour coller sur WhatsApp, Instagram, Facebook,
          LinkedIn ou TikTok.
        </p>

        <ul className="mt-8 space-y-4">
          {SOCIAL_POSTS_30.map((post) => (
            <li
              key={post.day}
              className="rounded-2xl border border-[#075E54]/10 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-full bg-[#075E54] px-2 py-0.5 font-bold text-white">
                  J{post.day}
                </span>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 font-medium">
                  {post.channel}
                </span>
                <span className="rounded-full bg-amber-50 px-2 py-0.5 text-amber-800">
                  {post.format}
                </span>
                <span className="text-gray-500">{post.theme}</span>
              </div>
              <pre className="mt-3 whitespace-pre-wrap font-sans text-sm leading-relaxed">
                {post.text}
              </pre>
              {post.hashtags ? (
                <p className="mt-2 text-xs text-[#075E54]">{post.hashtags}</p>
              ) : null}
              <p className="mt-2 break-all text-xs text-gray-500">CTA : {post.cta}</p>
              <button
                type="button"
                onClick={() => void copy(post.day, post.text, post.cta)}
                className="mt-3 rounded-lg bg-[#FF6F00] px-4 py-2 text-xs font-semibold text-white"
              >
                {copied === post.day ? "✓ Copié" : "Copier le post"}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
