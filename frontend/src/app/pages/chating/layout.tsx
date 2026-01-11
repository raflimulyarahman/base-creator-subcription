"use client";

import "@/app/globals.css";
import NavbarChating from "@/components/ui/navbarchating";
import { ReactNode } from "react";

export default function ChatingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden">
      {/* NAVBAR */}
      <NavbarChating />

      {/* CONTENT */}
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
