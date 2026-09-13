"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { persistUtm } from "../lib/utm";

function Capture() {
  const search = useSearchParams();
  useEffect(() => {
    persistUtm(search);
  }, [search]);
  return null;
}

export function UtmCapture() {
  return (
    <Suspense fallback={null}>
      <Capture />
    </Suspense>
  );
}
