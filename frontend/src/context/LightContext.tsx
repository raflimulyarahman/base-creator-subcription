"use client";

import { createContext, useContext, useEffect, useState } from "react";

type LightContextType = {
  isDark: boolean;
  toggle: () => void;
};

const LightContext = createContext<LightContextType | null>(null);

export function LightProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return document.documentElement.classList.contains("dark");
  });

  useEffect(() => {
    const html = document.documentElement;

    if (isDark) {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }

    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  const toggle = () => setIsDark((v) => !v);

  return (
    <LightContext.Provider value={{ isDark, toggle }}>
      {children}
    </LightContext.Provider>
  );
}

export const useLight = () => {
  const ctx = useContext(LightContext);
  if (!ctx) throw new Error("useLight must be used inside LightProvider");
  return ctx;
};
