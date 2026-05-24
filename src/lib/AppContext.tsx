"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import type { TabDateFilter } from "./types";

interface AppContextValue {
  filter: TabDateFilter;
  setFilter: (filter: TabDateFilter) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [filter, setFilter] = useState<TabDateFilter>({
    preset: "7d",
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    to: new Date().toISOString().slice(0, 10),
  });

  return (
    <AppContext.Provider value={{ filter, setFilter }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppFilter() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppFilter must be used within AppProvider");
  return ctx;
}