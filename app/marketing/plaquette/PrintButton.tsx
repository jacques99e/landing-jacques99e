"use client";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-lg bg-[#FF6F00] px-4 py-2 text-sm font-semibold text-white shadow"
    >
      Imprimer / PDF
    </button>
  );
}
