"use client";
import { subscriptionManagerAbi } from "@/abi/SubscriptionManager";
import { CONTRACT_ADDRESSES } from "@/config/contract";
import { useWallet } from "@/context/WalletContext";
import { fetchWithAuth } from "@/store/fetchWithAuth";
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { createPublicClient, http } from "viem";
import { baseSepolia } from "viem/chains";
import { useWriteContract } from "wagmi";

type UUID = string;

export interface Subscribe {
  id_subscribe: UUID;
  id_users: string;
  type_subscribe: string;
  subscribe: string;
  status_subscribe: string;
}

export type TierInfo = {
  id: bigint;
  name: string;
  price: bigint;
  duration: bigint;
  isActive: boolean;
};

type AddressSubscribe = {
  id_subscribe: UUID;
  address: string;
};

type SubscribeContextType = {
  subscribe: Subscribe | null;
  createSubscribe: (payload: Omit<Subscribe, "id_subscribe">) => Promise<Subscribe>;
  loading: boolean;
  success: boolean;
  setSuccess: React.Dispatch<React.SetStateAction<boolean>>;
  setSubscribe: React.Dispatch<React.SetStateAction<Subscribe | null>>;
  getSubscribeIdTier: (id_users: string) => Promise<AddressSubscribe | null>;
  tiers: TierInfo[]; // 🔥 Simpan tiers di state
  setTiers: React.Dispatch<React.SetStateAction<TierInfo[]>>;
};

const SubscribeContext = createContext<SubscribeContextType | undefined>(undefined);

export const SubscribeProvider = ({ children }: { children: React.ReactNode }) => {
  const { writeContractAsync } = useWriteContract();
  const [subscribe, setSubscribe] = useState<Subscribe | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { accessToken, sendRefreshToken } = useWallet();

  const [tiers, setTiers] = useState<TierInfo[]>([]); // 🔥 state tiers

  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http(baseSepolia.rpcUrls.default.http[0]),
  });

  const createSubscribe = async (payload: Omit<Subscribe, "id_subscribe">): Promise<Subscribe> => {
    setLoading(true);
    try {
      await writeContractAsync({
        address: CONTRACT_ADDRESSES.SubscriptionManager,
        abi: subscriptionManagerAbi,
        functionName: "configureTiers",
        args: [
          BigInt("100000000000000"),
          BigInt("500000000000000"),
          BigInt("1000000000000000"),
        ],
      });

      const data: Subscribe = {
        id_subscribe: crypto.randomUUID(),
        ...payload,
      };

      setSubscribe(data);
      setSuccess(true);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const getSubscribeIdTier = useCallback(
    async (id_users: string): Promise<AddressSubscribe | null> => {
      console.log('getSubscribeIdTier called with:', id_users);
      try {
        const data = await fetchWithAuth(
          `http://localhost:8000/api/address/${id_users}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
            },
          },
          accessToken,
          sendRefreshToken
        );

        const tierIds = [1n, 2n, 3n];

        // 🔥 Read tiers dari kontrak
        const tierData: TierInfo[] = await Promise.all(
          tierIds.map(async (id) => {
            const tier = await publicClient.readContract({
              address: CONTRACT_ADDRESSES.SubscriptionManager,
              abi: subscriptionManagerAbi,
              functionName: "getTierConfig",
              args: [data.data?.address, id],
            });

            return {
              id,
              name: tier.name,
              price: tier.price,
              duration: tier.duration,
              isActive: tier.isActive,
            };
          })
        );

        setTiers(tierData); 

        return { id_subscribe: crypto.randomUUID(), address: data.data?.address };
      } catch (err) {
        console.error("Error in getSubscribeIdTier:", err);
        return null;
      }
    },
    [accessToken, sendRefreshToken, publicClient]
  );

  const value = useMemo(
    () => ({
      subscribe,
      createSubscribe,
      success,
      loading,
      setSuccess,
      setSubscribe,
      getSubscribeIdTier,
      tiers, 
      setTiers,
    }),
    [subscribe, success, loading, getSubscribeIdTier, tiers]
  );

  return <SubscribeContext.Provider value={value}>{children}</SubscribeContext.Provider>;
};

export const useSubscribe = () => {
  const context = useContext(SubscribeContext);
  if (!context) throw new Error("useSubscribe must be used within SubscribeProvider");
  return context;
};
