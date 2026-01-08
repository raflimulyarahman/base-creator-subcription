"use client";

import { useWallet } from "@/context/WalletContext";
import ProtectedRoute from "@/utils/ProtectedRoute";
import Dashboard from "./users/page";

export default function DashboardPage() {
  const { role, isLoading } = useWallet();

  if (isLoading) return <div>Loading...</div>;
  if (!role) return null;

  // Hanya allow akses untuk role yang sesuai
  if (role === "Creators") {
    return (
      <ProtectedRoute allowedRoles={["Creators"]}>
        <Dashboard />
      </ProtectedRoute>
    );
  }

  if (role === "Users") {
    return (
      <ProtectedRoute allowedRoles={["Users"]}>
        <Dashboard />
      </ProtectedRoute>
    );
  }

  return <div>Access Denied</div>;
}
