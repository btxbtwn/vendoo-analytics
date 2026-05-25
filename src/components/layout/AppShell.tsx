"use client";

import React from "react";

interface AppShellProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  header: React.ReactNode;
}

export default function AppShell({
  children,
  sidebar,
  header,
}: AppShellProps) {
  return (
    <div
      className="min-h-screen relative"
      style={{
        backgroundColor: "var(--color-bg-primary)",
      }}
    >
      {sidebar}
      <main
        className="min-w-0 overflow-x-hidden pb-[calc(env(safe-area-inset-bottom)+5.5rem)] md:pb-8 w-full"
        style={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div className="flex-1">{children}</div>
      </main>
    </div>
  );
}
