"use client";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { useAccount, useAccountEffect, useSignMessage } from "wagmi";

export type UserRole = "Creators" | "Users" | null;
type UUID = string;

type WalletContextType = {
  address?: string;
  accessToken: string | null; // tambahkan ini
  isConnected: boolean;
  role: UserRole;
  userId: UUID | null;
  isLoading: boolean;
  logout: () => Promise<void>;
};

const WalletContext = createContext<WalletContextType>({
  address: undefined,
  accessToken: null,
  isConnected: false,
  role: null,
  userId: null,
  isLoading: true,
  logout: async () => {},
});

export function WalletProvider({ children }: { children: ReactNode }) {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();

  const [role, setRole] = useState<UserRole>(null);
  const [userId, setUserId] = useState<UUID | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const hasTriedLogin = useRef(false);

  const restoreSession = async (): Promise<boolean> => {
    try {
      const res = await fetch("http://localhost:8000/api/signin/session", {
        credentials: "include",
      });
      const data = await res.json();

      if (data?.role && data?.userId) {
        setRole(data.role);
        setUserId(data.userId);
        setAccessToken(data.accessToken);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const autoLogin = useCallback(async () => {
    if (!isConnected || !address || hasTriedLogin.current) return;

    hasTriedLogin.current = true;

    try {
      const nonceRes = await fetch("http://localhost:8000/api/signin/nonce", {
        credentials: "include",
      });

      const { nonce } = await nonceRes.json();
      if (!nonce) throw new Error("No nonce");

      const signature = await signMessageAsync({ message: nonce });

      const loginRes = await fetch("http://localhost:8000/api/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ address, signature }),
      });

      if (!loginRes.ok) throw new Error("Login failed");

      const loginData = await loginRes.json();
      console.log("[WalletProvider] loginData:", loginData);
      setRole(loginData.user?.role ?? null);
      setUserId(loginData.user?.userId ?? null);
      setAccessToken(loginData?.accessToken ?? null);

      //await restoreSession();
    } catch (err) {
      console.error("[WalletProvider] autoLogin failed", err);
      setRole(null);
      setUserId(null);
      hasTriedLogin.current = false;
    }
  }, [isConnected, address, signMessageAsync]);

  const logout = async () => {
    try {
      await fetch("http://localhost:8000/api/signin/logout", {
        method: "POST",
        credentials: "include",
      });
    } finally {
      setRole(null);
      setUserId(null);
      hasTriedLogin.current = false;
    }
  };

  useAccountEffect({
    onDisconnect() {
      logout();
    },
  });

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const hasSession = await restoreSession();
      if (!hasSession) await autoLogin();
      setIsLoading(false);
    })();
  }, [isConnected, address, autoLogin]);

  return (
    <WalletContext.Provider
      value={{
        address,
        isConnected,
        role,
        userId,
        accessToken,
        isLoading,
        logout,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export const useWallet = () => useContext(WalletContext);
