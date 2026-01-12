"use client";


import React, { ReactNode, useState } from "react"; // <-- add React here
import ButtonNavigator from "@/components/ui/button-navigation";
import Navbar from "@/components/ui/navbar";
import SidebarLeft from "@/components/ui/sidebar-left";
import SidebarRight from "@/components/ui/sidebar-right";
import { usePathname } from "next/navigation";
import MobileSidebar from "@/components/ui/MobileSidebar";
import Loading from "@/components/ui/loading";
import { useWallet } from "@/context/WalletContext";

export default function ClientShell({ children }: { children: ReactNode }) {
  const { isLoading } = useWallet();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Followed"); // move this above early return
  const pathname = usePathname();

  // Hooks are always called in the same order now

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
        {!hideNavbar && (
          <Navbar
            onOpenSidebar={() => setOpen(true)}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        )}
        <MobileSidebar open={open} onClose={() => setOpen(false)} />
        <main className="flex-1 w-full flex justify-center pb-6">
          <div className="w-full">
            {React.isValidElement(children)
              ? React.cloneElement(children as React.ReactElement<{ activeTab?: string }>, { activeTab })
              : children}
          </div>
        </main>
      </div>
      <SidebarRight />
      {!hideNavigator && <ButtonNavigator />}
    </div>
  );
}
