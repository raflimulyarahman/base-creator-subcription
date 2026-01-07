"use client";
import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/context/WalletContext";

interface Props {
  children: ReactNode;
  allowedRoles: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: Props) {
  const { role, isLoading } = useWallet();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !allowedRoles.includes(role || "")) {
      router.replace("/dashboard"); // redirect kalau tidak sesuai
    }
  }, [role, isLoading, allowedRoles, router]);

  if (isLoading || !allowedRoles.includes(role || ""))
    return <div>Loading...</div>;

  return <>{children}</>;
}
