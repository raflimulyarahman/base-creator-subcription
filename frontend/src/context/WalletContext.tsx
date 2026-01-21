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
import { UUID, UserRole, WalletContextType } from "@/types";
import { supabase } from "@/lib/supabase";

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
  setRole: () => {},
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

  // Restore session from Supabase
  const restoreSession = useCallback(async (): Promise<boolean> => {
    if (!address) return false;
    
    try {
      // Check if user exists in Supabase
      const { data: user, error } = await supabase
        .from("users")
        .select("*")
        .eq("wallet_address", address.toLowerCase())
        .single();

      if (error || !user) {
        return false;
      }

      setRole(user.role as UserRole);
      setUserId(user.id);
      setAccessToken(user.id); // Using user.id as token for now
      return true;
    } catch {
      return false;
    }
  }, [address]);

  // Auto login with wallet signature
  const autoLogin = useCallback(async () => {
    if (!isConnected || !address || !signMessageAsync || hasTriedLogin.current)
      return;
    hasTriedLogin.current = true;

    try {
      // Generate nonce for signature
      const nonce = `Sign this message to authenticate with your wallet.\n\nNonce: ${Date.now()}`;
      
      // Request signature from user
      const signature = await signMessageAsync({ message: nonce });

      // Check if user exists
      const { data: existingUser } = await supabase
        .from("users")
        .select("*")
        .eq("wallet_address", address.toLowerCase())
        .single();

      if (existingUser) {
        // User exists, log them in
        setRole(existingUser.role as UserRole);
        setUserId(existingUser.id);
        setAccessToken(existingUser.id);
      } else {
        // Create new user
        const { data: newUser, error } = await supabase
          .from("users")
          .insert({
            wallet_address: address.toLowerCase(),
            role: "user",
          })
          .select()
          .single();

        if (error) throw error;

        setRole("user");
        setUserId(newUser.id);
        setAccessToken(newUser.id);
      }
    } catch (err) {
      console.error("[WalletProvider] autoLogin failed", err);
      setRole(null);
      setUserId(null);
      hasTriedLogin.current = false;
    }
  }, [address, isConnected, signMessageAsync]);

  // Logout - clear local state
  const logout = useCallback(async () => {
    setRole(null);
    setUserId(null);
    setAccessToken(null);
    setRefreshToken(null);
    hasTriedLogin.current = false;
  }, []);

  // Refresh token (not needed for Supabase, but keep for interface compatibility)
  const sendRefreshToken = useCallback(async (): Promise<string | null> => {
    // With Supabase, we just restore session
    await restoreSession();
    return accessToken;
  }, [restoreSession, accessToken]);

  useAccountEffect({ onDisconnect: logout });

  // Initialize auth on mount and address change
  useEffect(() => {
    setIsLoading(true);
    (async () => {
      const hasSession = await restoreSession();
      if (!hasSession && isConnected) {
        await autoLogin();
      }
      setIsLoading(false);
    })();
  }, [restoreSession, autoLogin, isConnected]);

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
        setRole,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export const useWallet = () => useContext(WalletContext);
