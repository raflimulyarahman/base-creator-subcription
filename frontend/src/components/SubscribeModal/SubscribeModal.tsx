"use client";

import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useReadContract } from "wagmi";
import { formatEther, parseEther } from "viem";
import { subscriptionManagerAbi } from "@/abi/SubscriptionManager";

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

interface SubscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
  creatorAddress: `0x${string}`;
  creatorHandle?: string;
}

const TIER_NAMES = ["Bronze", "Silver", "Gold"];
const TIER_COLORS = ["bg-amber-600", "bg-gray-400", "bg-yellow-500"];
const TIER_ICONS = ["🥉", "🥈", "🥇"];

export default function SubscribeModal({
  isOpen,
  onClose,
  creatorAddress,
  creatorHandle,
}: SubscribeModalProps) {
  const { address } = useAccount();
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

  useEffect(() => {
    if (isSuccess) {
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  }, [isSuccess, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl max-w-md w-full mx-4 p-6 shadow-2xl"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            Subscribe to {creatorHandle || "Creator"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Success State */}
        {isSuccess && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Subscribed!</h3>
            <p className="text-gray-600">Your badge has been minted.</p>
          </div>
        )}

        {/* Tier Selection */}
        {!isSuccess && (
          <>
            <div className="space-y-3 mb-6">
              {tiers.map((tier, index) => {
                const isActive = tier?.isActive;
                const price = tier?.price || BigInt(0);
                
                return (
                  <button
                    key={index}
                    onClick={() => isActive && setSelectedTier(index)}
                    disabled={!isActive}
                    className={`w-full p-4 rounded-xl border-2 transition-all ${
                      selectedTier === index
                        ? "border-blue-500 bg-blue-50"
                        : isActive
                        ? "border-gray-200 hover:border-gray-300"
                        : "border-gray-100 opacity-50 cursor-not-allowed"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{TIER_ICONS[index]}</span>
                        <div className="text-left">
                          <p className="font-semibold text-gray-900">
                            {tier?.name || TIER_NAMES[index]}
                          </p>
                          <p className="text-sm text-gray-500">
                            {tier ? `${Number(tier.duration) / 86400} days` : "30 days"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">
                          {formatEther(price)} ETH
                        </p>
                        {!isActive && (
                          <p className="text-xs text-red-500">Not available</p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Error Display */}
            {writeError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">
                  {writeError.message.includes("insufficient")
                    ? "Insufficient balance"
                    : "Transaction failed. Please try again."}
                </p>
              </div>
            )}

            {/* Subscribe Button */}
            <button
              onClick={handleSubscribe}
              disabled={selectedTier === null || isPending || isConfirming}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isPending
                ? "Confirm in Wallet..."
                : isConfirming
                ? "Processing..."
                : selectedTier !== null
                ? `Subscribe for ${formatEther(tiers[selectedTier]?.price || BigInt(0))} ETH`
                : "Select a Tier"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
