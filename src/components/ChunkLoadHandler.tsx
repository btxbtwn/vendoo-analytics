"use client";

import { useEffect } from "react";

const CHUNK_ERROR_PATTERNS = [
  "ChunkLoadError",
  "Failed to load chunk",
  "Loading chunk",
  "Loading CSS chunk",
  "Missing chunk",
  "Failed to fetch dynamically imported module",
  "Importing a module script failed",
];

const RECOVERY_GUARD_KEY = "vendoo-analytics:asset-recovery-at";
const RECOVERY_WINDOW_MS = 60_000;

function isChunkErrorMessage(message: string | null | undefined): boolean {
  if (!message) {
    return false;
  }

  return CHUNK_ERROR_PATTERNS.some((pattern) => message.includes(pattern));
}

function readMessage(value: unknown): string | null {
  if (typeof value === "string") {
    return value;
  }

  if (value instanceof Error) {
    return value.message;
  }

  if (
    typeof value === "object" &&
    value !== null &&
    "message" in value &&
    typeof value.message === "string"
  ) {
    return value.message;
  }

  return null;
}

function hasRecentRecoveryAttempt(): boolean {
  const raw = window.sessionStorage.getItem(RECOVERY_GUARD_KEY);

  if (!raw) {
    return false;
  }

  const lastAttempt = Number.parseInt(raw, 10);

  if (Number.isNaN(lastAttempt)) {
    window.sessionStorage.removeItem(RECOVERY_GUARD_KEY);
    return false;
  }

  return Date.now() - lastAttempt < RECOVERY_WINDOW_MS;
}

function markRecoveryAttempt(): void {
  window.sessionStorage.setItem(RECOVERY_GUARD_KEY, String(Date.now()));
}

function buildRecoveryUrl(): string {
  const url = new URL(window.location.href);
  url.searchParams.set("_refresh", String(Date.now()));
  return url.toString();
}

function isPwaCache(cacheName: string): boolean {
  return (
    cacheName.includes("workbox") ||
    cacheName.includes("next-pwa") ||
    cacheName.includes("next-static") ||
    cacheName.includes("static-js-assets")
  );
}

async function resetCachedRuntimeState(): Promise<void> {
  if ("serviceWorker" in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.allSettled(
      registrations.map((registration) => registration.unregister()),
    );
  }

  if ("caches" in window) {
    const cacheNames = await window.caches.keys();
    await Promise.allSettled(
      cacheNames
        .filter((cacheName) => isPwaCache(cacheName))
        .map((cacheName) => window.caches.delete(cacheName)),
    );
  }
}

async function recoverFromStaleAssets(reason: string): Promise<void> {
  if (hasRecentRecoveryAttempt()) {
    console.error(
      "Stale asset recovery already attempted recently. Manual refresh may still be required.",
      reason,
    );
    return;
  }

  markRecoveryAttempt();
  console.warn("Stale asset detected. Clearing cached runtime state.", reason);
  await resetCachedRuntimeState();
  window.location.replace(buildRecoveryUrl());
}

export function ChunkLoadHandler() {
  useEffect(() => {
    const maybeRecover = (message: string | null) => {
      if (message && isChunkErrorMessage(message)) {
        void recoverFromStaleAssets(message).catch((error) => {
          console.error("Failed to recover from stale assets.", error);
        });
      }
    };

    const handleChunkError = (event: ErrorEvent) => {
      maybeRecover(readMessage(event.error) ?? event.message);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      maybeRecover(readMessage(event.reason));
    };

    const clearStaleServiceWorkers = async () => {
      if (!("serviceWorker" in navigator)) {
        return;
      }

      const registrations = await navigator.serviceWorker.getRegistrations();

      if (registrations.length === 0) {
        return;
      }

      const response = await fetch("/sw.js", {
        method: "HEAD",
        cache: "no-store",
      });

      if (!response.ok) {
        console.warn(
          "Found registered service workers, but /sw.js is unavailable. Clearing stale registrations.",
        );
        await resetCachedRuntimeState();
      }
    };

    window.addEventListener("error", handleChunkError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    void clearStaleServiceWorkers().catch((error) => {
      console.error("Failed to clear stale service workers.", error);
    });

    return () => {
      window.removeEventListener("error", handleChunkError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, []);

  return null;
}
