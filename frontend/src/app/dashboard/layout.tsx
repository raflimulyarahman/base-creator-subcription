"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/context/WalletContext";
import Navbar from "@/components/ui/navbar";
import SidebarLeft from "@/components/ui/sidebar-left";
import SidebarRight from "@/components/ui/sidebar-right";
import ButtonNavigator from "@/components/ui/button-navigation";
import Loading from "@/components/ui/loading";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { role, isLoading } = useWallet();
  const router = useRouter();

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
  return (
    <div className="flex min-h-screen">
      <SidebarLeft />
      <div className="flex flex-col flex-1">
        <Navbar />
        <main className="flex-1 w-full flex justify-center  pb-6">
          <div className="w-full ">{children}</div>
        </main>
      </div>
      <SidebarRight />
      <ButtonNavigator />
    </div>
  );
}
