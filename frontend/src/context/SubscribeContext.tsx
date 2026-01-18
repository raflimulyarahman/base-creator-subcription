"use client";

import { subscriptionManagerAbi } from "@/abi/SubscriptionManager";
import { CONTRACT_ADDRESSES } from "@/config/contract";
import { useWallet } from "@/context/WalletContext";
import { fetchWithAuth } from "@/store/fetchWithAuth";
import { createPublicClient, http } from "viem";
import { baseSepolia } from "viem/chains";
import { useWriteContract } from "wagmi";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import {
  Subscribe,
  SubscribePayload,
  AddressSubscribe,
  TierInfo,
  TierData,
  SubscribeContextType,
} from "@/types";

const SubscribeContext = createContext<SubscribeContextType | undefined>(
  undefined,
);

export const SubscribeProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { writeContractAsync } = useWriteContract();
  const [subscribe, setSubscribe] = useState<Subscribe | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { accessToken, sendRefreshToken } = useWallet();
  const [tiers, setTiers] = useState<TierInfo[]>([]);

  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http(baseSepolia.rpcUrls.default.http[0]),
  });

  const createSubscribe = async (
    payload: SubscribePayload,
  ): Promise<Subscribe> => {
    setLoading(true);
    try {
      const bronzeTier = BigInt(Math.round(payload.bronze * 1e18));
      const silverTier = BigInt(Math.round(payload.silver * 1e18));
      const goldTier = BigInt(Math.round(payload.gold * 1e18));

      await writeContractAsync({
        address: CONTRACT_ADDRESSES.SubscriptionManager,
        abi: subscriptionManagerAbi,
        functionName: "configureTiers",
        args: [bronzeTier, silverTier, goldTier],
      });

      // const data: Subscribe = {
      //   id_subscribe: crypto.randomUUID(),
      //   ...payload,
      // };

      // setSubscribe(res);
      // setSuccess(true);
      // return res;
    } catch (err) {
      console.error("Error creating subscription:", err);
      setSuccess(false);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const paySubscribe = async (payload: TierInfo): Promise<TierInfo> => {
    setLoading(true);
    try {
      const { addressCreator, tiersId } = payload;
      const tierIdNumber = Number(tiersId);

      const res = await writeContractAsync({
        address: CONTRACT_ADDRESSES.SubscriptionManager,
        abi: subscriptionManagerAbi,
        functionName: "subscribe",
        args: [addressCreator, tierIdNumber],
      });

      console.log(res);
      return payload;
    } catch (err) {
      console.error("Error subscribing:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getSubscribeIdTier = useCallback(
    async (id_users: string): Promise<AddressSubscribe | null> => {
      console.log("getSubscribeIdTier called with:", id_users);
      try {
        const data = await fetchWithAuth(
          `http://localhost:8000/api/address/${id_users}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              ...(accessToken
                ? { Authorization: `Bearer ${accessToken}` }
                : {}),
            },
          },
          accessToken,
          sendRefreshToken,
        );

        const tierIds = [1n, 2n, 3n];

        // 🔥 Read tiers dari kontrak
        const tierData: TierData[] = await Promise.all(
          tierIds.map(async (id) => {
            const tier = await publicClient.readContract({
              address: CONTRACT_ADDRESSES.SubscriptionManager,
              abi: subscriptionManagerAbi,
              functionName: "getTierConfig",
              args: [data.data?.address, id],
            });

            return {
              id,
              name: tier?.name,
              price: tier?.price,
              duration: tier?.duration,
              isActive: tier?.isActive,
            };
          }),
        );

        setTiers(tierData);

        return {
          id_subscribe: crypto.randomUUID(),
          address: data.data?.address,
        };
      } catch (err) {
        console.error("Error in getSubscribeIdTier:", err);
        return null;
      }
    },
    [accessToken, sendRefreshToken, publicClient],
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
      paySubscribe,
      setTiers,
    }),
    [subscribe, success, loading, tiers, paySubscribe, getSubscribeIdTier],
  );

  return (
    <SubscribeContext.Provider value={value}>
      {children}
    </SubscribeContext.Provider>
  );
};

export const useSubscribe = () => {
  const context = useContext(SubscribeContext);
  if (!context)
    throw new Error("useSubscribe must be used within SubscribeProvider");
  return context;
};
