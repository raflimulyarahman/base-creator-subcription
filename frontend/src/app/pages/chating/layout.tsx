import NavbarChating from "@/components/Navbar/NavbarChating";
import { ReactNode, Suspense } from "react";

export default function ChatingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden">
      <Suspense fallback={<div className="h-16 bg-transparent" />}>
        <NavbarChating />
      </Suspense>
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
