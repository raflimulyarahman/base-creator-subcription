"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAccount, useAccountEffect } from "wagmi";
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

  const [role, setRole] = useState<UserRole>(null);
  const [userId, setUserId] = useState<UUID | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Authenticate user when wallet connects
  const authenticateUser = useCallback(async () => {
    if (!address) {
      setRole(null);
      setUserId(null);
      setAccessToken(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const walletAddress = address.toLowerCase();
      
      // Try to find existing user
      const { data: existingUser, error: fetchError } = await supabase
        .from("users")
        .select("*")
        .eq("wallet_address", walletAddress)
        .single();

      if (existingUser && !fetchError) {
        // User exists
        console.log("[WalletProvider] User found:", existingUser.id);
        setRole(existingUser.role as UserRole);
        setUserId(existingUser.id);
        setAccessToken(existingUser.id);
      } else {
        // Create new user
        console.log("[WalletProvider] Creating new user for:", walletAddress);
        const { data: newUser, error: insertError } = await supabase
          .from("users")
          .insert({ wallet_address: walletAddress, role: "user" })
          .select()
          .single();

        if (insertError) {
          console.error("[WalletProvider] Failed to create user:", insertError);
          // Maybe user was created in parallel, try fetching again
          const { data: retryUser } = await supabase
            .from("users")
            .select("*")
            .eq("wallet_address", walletAddress)
            .single();
          
          if (retryUser) {
            setRole(retryUser.role as UserRole);
            setUserId(retryUser.id);
            setAccessToken(retryUser.id);
          }
        } else if (newUser) {
          console.log("[WalletProvider] User created:", newUser.id);
          setRole("user");
          setUserId(newUser.id);
          setAccessToken(newUser.id);
        }
      }
    } catch (err) {
      console.error("[WalletProvider] Auth error:", err);
      setRole(null);
      setUserId(null);
      setAccessToken(null);
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  // Logout - clear local state
  const logout = useCallback(async () => {
    setRole(null);
    setUserId(null);
    setAccessToken(null);
    setRefreshToken(null);
  }, []);

  // Handle wallet disconnect
  useAccountEffect({ onDisconnect: logout });

  // Refresh token
  const sendRefreshToken = useCallback(async (): Promise<string | null> => {
    await authenticateUser();
    return accessToken;
  }, [authenticateUser, accessToken]);

  // Authenticate when address changes
  useEffect(() => {
    authenticateUser();
  }, [authenticateUser]);

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
