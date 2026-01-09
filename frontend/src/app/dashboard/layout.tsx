"use client";

import ButtonNavigator from "@/components/ui/button-navigation";
import Loading from "@/components/ui/loading";
import Navbar from "@/components/ui/navbar";
import SidebarLeft from "@/components/ui/sidebar-left";
import SidebarRight from "@/components/ui/sidebar-right";
import { useWallet } from "@/context/WalletContext";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { role, isLoading } = useWallet();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !role) {
      router.replace("/signin");
    }
  }, [role, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading />
      </div>
    );
  }

  if (!role) return null;

  const hideNavbar = pathname.startsWith("/dashboard/users/chating");
  const hideNavigator = pathname.startsWith("/dashboard/users/chating");

  return (
    <div className="flex min-h-screen">
      <SidebarLeft />
      <div className="flex flex-col flex-1">
        {!hideNavbar && <Navbar />}

        <main className="flex-1 w-full flex justify-center pb-6">
          <div className="w-full">{children}</div>
        </main>
      </div>
      <SidebarRight />
      {!hideNavigator && <ButtonNavigator />}
    </div>
  );
}
