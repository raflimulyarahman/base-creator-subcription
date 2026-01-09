"use client";

import NavbarChating from "@/components/ui/navbarchating";
import { ReactNode } from "react";

export default function NotifLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <div className="flex flex-col flex-1">
        <NavbarChating/>
        <main className="flex-1 w-full flex justify-center  pb-6">
          <div className="w-full ">{children}</div>
        </main>
      </div>
    </div>
  );
}
