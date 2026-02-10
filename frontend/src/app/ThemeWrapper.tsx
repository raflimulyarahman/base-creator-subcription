"use client";

import { useLight } from "@/context/LightContext";
import { useEffect, useState } from "react";

export default function ThemeWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isDark } = useLight();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by rendering a consistent server state initially
  // or by deferring the theme-specific class application.
  // Here we'll render content but with a default theme (or generic) until mounted
  // OR just use suppression if we want to risk flash.
  // Cleanest way to avoid error:
  if (!mounted) {
      return <div className="min-h-screen bg-white text-black">{children}</div>;
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-300 
      ${isDark ? "bg-black text-white" : "bg-white text-black"}`}
    >
      {children}
    </div>
  );
}
