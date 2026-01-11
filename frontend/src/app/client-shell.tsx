"use client";

import ButtonNavigator from "@/components/ui/button-navigation";
import Navbar from "@/components/ui/navbar";
import SidebarLeft from "@/components/ui/sidebar-left";
import SidebarRight from "@/components/ui/sidebar-right";
import { usePathname } from "next/navigation";
import { ReactNode, useState } from "react";
import MobileSidebar from "@/components/ui/MobileSidebar";
import Loading from "@/components/ui/loading";
import { useWallet } from "@/context/WalletContext";

export default function ClientShell({ children }: { children: ReactNode }) {
  const { isLoading } = useWallet();
  const [open, setOpen] = useState(false);
  //const router = useRouter();
  const pathname = usePathname();
  console.log(isLoading, "loading");
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading />
      </div>
    );
  }

  const hideNavbar = pathname.startsWith("/pages/chating");
  const hideNavigator = pathname.startsWith("/pages/chating");
  return (
    <div className="flex min-h-screen">
      <SidebarLeft />
      <div className="flex flex-col flex-1">
        {!isLoading && !hideNavbar && (
          <Navbar onOpenSidebar={() => setOpen(true)} />
        )}
        <MobileSidebar open={open} onClose={() => setOpen(false)} />
        <main className="flex-1 w-full flex justify-center pb-6">
          <div className="w-full">{children}</div>
        </main>
      </div>
      <SidebarRight />
      {!hideNavigator && <ButtonNavigator />}
    </div>
  );
}
