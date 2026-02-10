"use client";

import { useState, useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt, useReadContract, useAccount } from "wagmi";
import { parseEther, formatEther } from "viem";
import { subscriptionManagerAbi } from "@/abi/SubscriptionManager";
import { CONTRACT_ADDRESSES } from "@/config/contract";
import { useLight } from "@/context/LightContext";
import TierCard from "./TierCard";

interface ConfigureTierModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Default tier configs
const DEFAULT_TIERS = [
  { id: 1, name: "Bronze", displayName: "Supporter", price: "0.001", duration: 30 },
  { id: 2, name: "Silver", displayName: "VIP Member", price: "0.005", duration: 30 },
  { id: 3, name: "Gold", displayName: "Super Fan", price: "0.01", duration: 30 },
];

export default function ConfigureTierModal({ isOpen, onClose }: ConfigureTierModalProps) {
  const { isDark } = useLight();
  const { address } = useAccount();
  const [selectedTier, setSelectedTier] = useState(1);
  const [tierName, setTierName] = useState("Supporter");
  const [tierPrice, setTierPrice] = useState("0.001");
  const [tierDuration, setTierDuration] = useState(30);
  const [savedTiers, setSavedTiers] = useState<{[key: number]: boolean}>({});

  // Read existing tier configs
  const { data: bronzeConfig } = useReadContract({
    address: CONTRACT_ADDRESSES.SubscriptionManager,
    abi: subscriptionManagerAbi,
    functionName: "getTierConfig",
    args: [address as `0x${string}`, BigInt(1)],
    query: { enabled: !!address }
  });

  const { data: silverConfig } = useReadContract({
    address: CONTRACT_ADDRESSES.SubscriptionManager,
    abi: subscriptionManagerAbi,
    functionName: "getTierConfig",
    args: [address as `0x${string}`, BigInt(2)],
    query: { enabled: !!address }
  });

  const { data: goldConfig } = useReadContract({
    address: CONTRACT_ADDRESSES.SubscriptionManager,
    abi: subscriptionManagerAbi,
    functionName: "getTierConfig",
    args: [address as `0x${string}`, BigInt(3)],
    query: { enabled: !!address }
  });

  // Write contract
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  // Load existing config when tier changes
  useEffect(() => {
    const configs: any = { 1: bronzeConfig, 2: silverConfig, 3: goldConfig };
    const config = configs[selectedTier];
    
    if (config && config.isActive) {
      setTierName(config.name || DEFAULT_TIERS[selectedTier - 1].displayName);
      setTierPrice(formatEther(config.price || BigInt(0)));
      setTierDuration(Number(config.duration) / 86400 || 30); // Convert seconds to days
      setSavedTiers(prev => ({ ...prev, [selectedTier]: true }));
    } else {
      // Load defaults
      const defaultTier = DEFAULT_TIERS[selectedTier - 1];
      setTierName(defaultTier.displayName);
      setTierPrice(defaultTier.price);
      setTierDuration(defaultTier.duration);
    }
  }, [selectedTier, bronzeConfig, silverConfig, goldConfig]);

  // Handle success
  useEffect(() => {
    if (isSuccess) {
      setSavedTiers(prev => ({ ...prev, [selectedTier]: true }));
    }
  }, [isSuccess, selectedTier]);

  const handleSave = () => {
    if (!address) return;

    const durationInSeconds = BigInt(tierDuration * 24 * 60 * 60); // Days to seconds
    const priceInWei = parseEther(tierPrice);

    writeContract({
      address: CONTRACT_ADDRESSES.SubscriptionManager,
      abi: subscriptionManagerAbi,
      functionName: "configureTier",
      args: [
        BigInt(selectedTier),
        priceInWei,
        durationInSeconds,
        tierName,
        "", // metadataURI - empty for now
        BigInt(0), // maxSupply - 0 = unlimited
        BigInt(0), // minHoldTime - 0 = no minimum
      ],
    });
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-lg rounded-2xl shadow-2xl ${isDark ? "bg-gray-900" : "bg-white"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Manage Membership Tiers
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Set up pricing for your subscribers
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tier Selection Tabs */}
        <div className="flex gap-2 p-4 border-b border-gray-100 dark:border-gray-800">
          {DEFAULT_TIERS.map((tier) => (
            <TierCard
              key={tier.id}
              tierId={tier.id}
              name={tier.name}
              isSelected={selectedTier === tier.id}
              isSaved={savedTiers[tier.id]}
              onClick={() => setSelectedTier(tier.id)}
            />
          ))}
        </div>

        {/* Configuration Form */}
        <div className="p-6 space-y-4">
          {/* Tier Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tier Name
            </label>
            <input
              type="text"
              value={tierName}
              onChange={(e) => setTierName(e.target.value)}
              placeholder="e.g., Supporter, VIP, Super Fan"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-blue focus:border-transparent transition"
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Price (ETH)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.001"
                min="0"
                value={tierPrice}
                onChange={(e) => setTierPrice(e.target.value)}
                className="w-full px-4 py-3 pr-16 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-blue focus:border-transparent transition"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium">
                ETH
              </span>
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Duration (Days)
            </label>
            <select
              value={tierDuration}
              onChange={(e) => setTierDuration(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-blue focus:border-transparent transition"
            >
              <option value={7}>7 days</option>
              <option value={30}>30 days (Monthly)</option>
              <option value={90}>90 days (Quarterly)</option>
              <option value={365}>365 days (Yearly)</option>
            </select>
          </div>

          {/* Info Box */}
          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              💡 Platform fee: 0.5% • You receive: 99.5% of subscription revenue
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-lg font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isPending || isConfirming}
            className="flex-1 py-3 px-4 rounded-lg font-medium text-white bg-brand-blue hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
          >
            {isPending || isConfirming ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Saving...
              </>
            ) : (
              <>Save Tier</>
            )}
          </button>
        </div>

        {/* Success Message */}
        {isSuccess && (
          <div className="mx-6 mb-6 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <p className="text-sm text-green-700 dark:text-green-300 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Tier configured successfully!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
