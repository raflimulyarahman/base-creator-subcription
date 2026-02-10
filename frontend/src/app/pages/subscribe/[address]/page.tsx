"use client";

import { useState, useEffect, use } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useReadContract } from "wagmi";
import { formatEther } from "viem";
import { subscriptionManagerAbi } from "@/abi/SubscriptionManager";
import { useLight } from "@/context/LightContext";
import { useRouter } from "next/navigation";
import { useUsers } from "@/context/UsersContext";

const SUBSCRIPTION_MANAGER_ADDRESS = process.env.NEXT_PUBLIC_SUBSCRIPTION_MANAGER_ADDRESS as `0x${string}`;

interface TierConfig {
  name: string;
  price: bigint;
  duration: bigint;
  isActive: boolean;
  metadataURI: string;
  maxSupply: bigint;
  minHoldTime: bigint;
}

const TIER_NAMES = ["Bronze", "Silver", "Gold"];
const TIER_ICONS = ["🥉", "🥈", "🥇"];

export default function SubscribePage({ params }: { params: Promise<{ address: string }> }) {
  // Params are now a Promise in Next.js 15+ (if applicable), but standard usage is often direct or awaited.
  // To be safe with latest Next.js app dir patterns:
  const resolvedParams = use(params);
  const creatorAddress = resolvedParams.address as `0x${string}`;

  const router = useRouter();
  const { isDark } = useLight();
  const { address } = useAccount();
  const { user } = useUsers(); // Current logged in user (verify if needed)
  
  const [selectedTier, setSelectedTier] = useState<number | null>(null);
  const [tiers, setTiers] = useState<(TierConfig | null)[]>([null, null, null]);
  
  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  // Read tier configs
  const { data: tier1 } = useReadContract({
    address: SUBSCRIPTION_MANAGER_ADDRESS,
    abi: subscriptionManagerAbi,
    functionName: "getTierConfig",
    args: [creatorAddress, BigInt(1)],
  });

  const { data: tier2 } = useReadContract({
    address: SUBSCRIPTION_MANAGER_ADDRESS,
    abi: subscriptionManagerAbi,
    functionName: "getTierConfig",
    args: [creatorAddress, BigInt(2)],
  });

  const { data: tier3 } = useReadContract({
    address: SUBSCRIPTION_MANAGER_ADDRESS,
    abi: subscriptionManagerAbi,
    functionName: "getTierConfig",
    args: [creatorAddress, BigInt(3)],
  });

  useEffect(() => {
    setTiers([tier1 as TierConfig, tier2 as TierConfig, tier3 as TierConfig]);
  }, [tier1, tier2, tier3]);

  const handleSubscribe = async () => {
    if (selectedTier === null || !address) return;

    const tier = tiers[selectedTier];
    if (!tier) return;

    try {
      writeContract({
        address: SUBSCRIPTION_MANAGER_ADDRESS,
        abi: subscriptionManagerAbi,
        functionName: "subscribe",
        args: [creatorAddress, BigInt(selectedTier + 1)],
        value: tier.price,
      });
    } catch (err) {
      console.error("Subscribe error:", err);
    }
  };

  // Redirect on success
  useEffect(() => {
    if (isSuccess) {
      setTimeout(() => {
        router.push("/pages/profile"); // Or back to creator profile
      }, 2000);
    }
  }, [isSuccess, router]);

  return (
    <div className={`min-h-screen ${isDark ? "bg-black text-white" : "bg-white text-gray-900"} pb-12`}>
      {/* Header */}
      <div className={`sticky top-0 z-50 flex items-center justify-between px-4 py-4 border-b ${isDark ? "bg-black border-gray-800" : "bg-white border-gray-100"}`}>
        <button 
          onClick={() => router.back()}
          className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h1 className="text-lg font-bold">Subscribe to Creator</h1>
        <div className="w-8"></div>
       </div>

      <div className="max-w-md mx-auto px-4 py-8">
        <div className="text-center mb-8">
            <div className={`w-20 h-20 mx-auto rounded-full mb-4 flex items-center justify-center text-3xl ${isDark ? "bg-gray-800" : "bg-gray-100"}`}>
                👤
            </div>
            <h2 className="text-xl font-bold mb-1">Support this Creator</h2>
            <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                Address: {creatorAddress.slice(0, 6)}...{creatorAddress.slice(-4)}
            </p>
        </div>

        {/* Success State */}
        {isSuccess && (
          <div className="text-center py-12 animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-2">Subscribed Successfully!</h3>
            <p className="text-gray-500 mb-8">Your membership badge has been minted.</p>
            <button 
                onClick={() => router.push("/pages/profile")}
                className="bg-gray-100 text-gray-900 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition"
            >
                View My Profile
            </button>
          </div>
        )}

        {/* Tier Selection */}
        {!isSuccess && (
          <>
            <div className="space-y-4 mb-8">
              {tiers.map((tier, index) => {
                const isActive = tier?.isActive;
                const price = tier?.price || BigInt(0);
                
                return (
                  <button
                    key={index}
                    onClick={() => isActive && setSelectedTier(index)}
                    disabled={!isActive}
                    className={`w-full p-5 rounded-2xl border-2 transition-all relative overflow-hidden group ${
                      selectedTier === index
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : isActive
                        ? "border-gray-200 dark:border-gray-800 hover:border-blue-300 hover:shadow-md bg-white dark:bg-gray-900"
                        : "border-gray-100 dark:border-gray-800 opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-900"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="text-3xl filter drop-shadow-sm">{TIER_ICONS[index]}</span>
                        <div className="text-left">
                          <p className={`font-bold text-lg ${isDark ? "text-white" : "text-gray-900"}`}>
                            {tier?.name || TIER_NAMES[index]}
                          </p>
                          <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                            {tier ? `${Number(tier.duration) / 86400} days access` : "Duration N/A"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold text-lg ${isDark ? "text-white" : "text-gray-900"}`}>
                          {formatEther(price)} ETH
                        </p>
                        {!isActive && (
                            <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-600">
                                Unavailable
                            </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Error Display */}
            {writeError && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3">
                 <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p className="text-sm text-red-600 dark:text-red-400">
                  {writeError.message.includes("insufficient")
                    ? "Insufficient wallet balance to subscribe."
                    : "Transaction failed. Please try again."}
                </p>
              </div>
            )}

            {/* Subscribe Button */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-black border-t border-gray-100 dark:border-gray-800 md:relative md:border-none md:bg-transparent md:p-0">
                <button
                onClick={handleSubscribe}
                disabled={selectedTier === null || isPending || isConfirming}
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30"
                >
                {isPending
                    ? "Confirm in Wallet..."
                    : isConfirming
                    ? "Processing..."
                    : selectedTier !== null
                    ? `Pay ${formatEther(tiers[selectedTier]?.price || BigInt(0))} ETH`
                    : "Select a Plan"}
                </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
