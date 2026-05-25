"use client";

import { useCallback, useEffect, useState } from "react";

export function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const saved = localStorage.getItem("vendoo-theme") as "light" | "dark" | null;
    const html = document.documentElement;
    if (saved) {
      html.setAttribute("data-theme", saved);
      setTheme(saved);
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const initial = prefersDark ? "dark" : "light";
      html.setAttribute("data-theme", initial);
      setTheme(initial);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    const html = document.documentElement;
    const current = html.getAttribute("data-theme") as "light" | "dark" | null;
    const next = current === "light" ? "dark" : "light";
    html.setAttribute("data-theme", next);
    localStorage.setItem("vendoo-theme", next);
    setTheme(next);
  }, []);

  return { theme, toggleTheme };
}
