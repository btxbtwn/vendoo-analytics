"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] bg-background p-6 text-center">
      <div className="bg-card border border-border p-8 rounded-2xl max-w-md w-full">
        <div className="w-16 h-16 bg-danger/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-danger text-2xl">!</span>
        </div>
        <h2 className="text-xl font-bold text-foreground mb-4">Something went wrong!</h2>
        <p className="text-sm text-muted-foreground mb-6">
          {error.message || "We encountered an error loading your data."}
        </p>
        <button
          onClick={() => reset()}
          className="bg-accent text-white px-6 py-2.5 rounded-lg font-medium hover:bg-accent/90 transition-colors w-full"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
