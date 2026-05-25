"use client";

import { useEffect, useRef, useState } from "react";

function defer() {
  return new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
}

export function useChartReady() {
  const [ready, setReady] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      setReady(true);
      return;
    }

    if (el.offsetWidth > 0 && el.offsetHeight > 0) {
      defer().then(() => setReady(true));
      return;
    }

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
          observer.disconnect();
          defer().then(() => setReady(true));
          return;
        }
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, ready };
}
