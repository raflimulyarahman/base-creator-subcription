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
import { useAccount, useSignMessage, useAccountEffect } from "wagmi";

export type UserRole = "Creators" | "Users" | null;
type UUID = string;

type WalletContextType = {
  address?: string;
  accessToken: string | null;
  refreshToken: string | null;
  isConnected: boolean;
  role: UserRole;
  userId: UUID | null;
  isLoading: boolean;
  logout: () => Promise<void>;
  sendRefreshToken: () => Promise<string | null>;
};

const WalletContext = createContext<WalletContextType>({
  address: undefined,
  accessToken: null,
  refreshToken: null,
  isConnected: false,
  role: null,
  userId: null,
  isLoading: true,
  logout: async () => {},
  sendRefreshToken: async () => null,
});

export function WalletProvider({ children }: { children: ReactNode }) {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();

  const [role, setRole] = useState<UserRole>(null);
  const [userId, setUserId] = useState<UUID | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const hasTriedLogin = useRef(false);

  const restoreSession = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch("http://localhost:8000/api/signin/session", {
        credentials: "include",
      });
      const data = await res.json();
      if (data?.role && data?.userId) {
        setRole(data.role);
        setUserId(data.userId);
        setAccessToken(data.accessToken);
        setRefreshToken(data.refreshToken);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  const autoLogin = useCallback(async () => {
    if (!isConnected || !address || !signMessageAsync || hasTriedLogin.current)
      return;
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
      setRole(loginData.user?.role ?? null);
      setUserId(loginData.user?.userId ?? null);
      setAccessToken(loginData?.accessToken ?? null);
      setRefreshToken(loginData?.refreshToken ?? null);
    } catch (err) {
      console.error("[WalletProvider] autoLogin failed", err);
      setRole(null);
      setUserId(null);
      hasTriedLogin.current = false;
    }
  }, [address, isConnected, signMessageAsync]);

  const logout = useCallback(async () => {
    try {
      await fetch("http://localhost:8000/api/signin/logout", {
        method: "POST",
        credentials: "include",
      });
    } finally {
      setRole(null);
      setUserId(null);
      setAccessToken(null);
      setRefreshToken(null);
      hasTriedLogin.current = false;
    }
  }, []);

  const sendRefreshToken = useCallback(async (): Promise<string | null> => {
    try {
      const res = await fetch("http://localhost:8000/api/signin/refresh", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to refresh token");
      const data = await res.json();
      setAccessToken(data.accessToken ?? null);
      setRefreshToken(data.refreshToken ?? null);
      return data.accessToken;
    } catch (err) {
      console.error("Refresh token error:", err);
      return null;
    }
  }, []);

  useAccountEffect({ onDisconnect: logout });

  useEffect(() => {
    setIsLoading(true);
    (async () => {
      const hasSession = await restoreSession();
      if (!hasSession) await autoLogin();
      setIsLoading(false);
    })();
  }, [restoreSession, autoLogin]);

  return (
    <WalletContext.Provider
      value={{
        address,
        isConnected,
        role,
        userId,
        accessToken,
        refreshToken,
        isLoading,
        logout,
        sendRefreshToken,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export const useWallet = () => useContext(WalletContext);
