"use client";

import React from "react";

interface HeaderProps {
  title: string;
  children?: React.ReactNode;
}

export default function Header({ title, children }: HeaderProps) {
  return (
    <header
      className="sticky top-0 z-40 shrink-0 hidden md:sticky"
      style={{
        height: "var(--header-height)",
        borderBottom: "1px solid var(--color-border)",
        backgroundColor: "transparent",
      }}
    >
      <div
        className="flex items-center justify-between h-full"
      >
        <h2
          className="font-semibold"
          style={{
            fontSize: "15px",
            color: "var(--color-text-primary)",
            letterSpacing: "var(--tracking-tight)",
          }}
        >
          {title}
        </h2>
        {children && (
          <div className="flex items-center gap-3">{children}</div>
        )}
      </div>
    </header>
  );
}
