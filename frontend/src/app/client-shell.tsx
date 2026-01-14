"use client";
import MobileSidebar from "@/components/ui/MobileSidebar";
import ButtonNavigator from "@/components/ui/button-navigation";
import Loading from "@/components/ui/loading";
import Navbar from "@/components/Navbar/Navbar";
import SidebarLeft from "@/components/ui/sidebar-left";
import SidebarRight from "@/components/ui/sidebar-right";
import { useLight } from "@/context/LightContext"; // <-- ambil dark mode
import { useWallet } from "@/context/WalletContext";
import { usePathname } from "next/navigation";
import React, { ReactNode, useState } from "react";

export default function ClientShell({ children }: { children: ReactNode }) {
  const { isLoading } = useWallet();
  const { isDark } = useLight(); // <-- ambil dark mode
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Followed");
  const pathname = usePathname();

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
              ? React.cloneElement(
                children as React.ReactElement<{
                  activeTab?: string;
                  isDark?: boolean;
                }>,
                { activeTab, isDark } // <-- kirim isDark ke Home
              )
              : children}
          </div>
        </main>
      </div>
      <SidebarRight />
      {!hideNavigator && <ButtonNavigator />}
    </div>
  );
}
