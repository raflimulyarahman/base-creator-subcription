"use client";

import { useState, useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt, useReadContract, useAccount } from "wagmi";
import { parseEther, formatEther } from "viem";
import { subscriptionManagerAbi } from "@/abi/SubscriptionManager";
import { CONTRACT_ADDRESSES } from "@/config/contract";
import { useLight } from "@/context/LightContext";
import TierCard from "@/components/ConfigureTier/TierCard";
import { useRouter } from "next/navigation";

// Default tier configs
const DEFAULT_TIERS = [
  { id: 1, name: "Bronze", displayName: "Supporter", price: "0.001", duration: 30 },
  { id: 2, name: "Silver", displayName: "VIP Member", price: "0.005", duration: 30 },
  { id: 3, name: "Gold", displayName: "Super Fan", price: "0.01", duration: 30 },
];

export default function ManageTiersPage() {
  const router = useRouter();
  const { isDark } = useLight();
  const { address } = useAccount();
  const [selectedTier, setSelectedTier] = useState(1);
  const [tierName, setTierName] = useState("Supporter");
  const [tierPrice, setTierPrice] = useState("0.001");
  const [tierDuration, setTierDuration] = useState(30);

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

  // Helper to get active status
  const getIsActive = (tierId: number) => {
    if (tierId === 1) return (bronzeConfig as any)?.isActive;
    if (tierId === 2) return (silverConfig as any)?.isActive;
    if (tierId === 3) return (goldConfig as any)?.isActive;
    return false;
  };

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
    } else {
      // Load defaults
      const defaultTier = DEFAULT_TIERS[selectedTier - 1];
      setTierName(defaultTier.displayName);
      setTierPrice(defaultTier.price);
      setTierDuration(defaultTier.duration);
    }
  }, [selectedTier, bronzeConfig, silverConfig, goldConfig]);

  // Handle success (Removed savedTiers update)
  useEffect(() => {
    if (isSuccess) {
      // Maybe trigger a refetch or toast? For now just rely on wagmi auto-refetch
    }
  }, [isSuccess]);

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

  return (
    <div className={`min-h-screen ${isDark ? "bg-black text-white" : "bg-white text-gray-900"} pb-24`}>
       {/* Header */}
       <div className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-4 border-b ${isDark ? "bg-black border-gray-800" : "bg-white border-gray-100"}`}>
        <button 
          onClick={() => router.back()}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h1 className="text-lg font-bold">Membership Tiers</h1>
        <div className="w-8"></div>
       </div>

      <div className="max-w-xl mx-auto px-4 py-6 pt-24">
        
        {/* Tier Selection Tabs */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {DEFAULT_TIERS.map((tier) => (
            <TierCard
              key={tier.id}
              tierId={tier.id}
              name={tier.name}
              isSelected={selectedTier === tier.id}
              isSaved={getIsActive(tier.id)}
              onClick={() => setSelectedTier(tier.id)}
            />
          ))}
        </div>

        {/* Configuration Form */}
        <div className={`rounded-2xl p-6 ${isDark ? "bg-gray-900" : "bg-gray-50 border border-gray-100"}`}>
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                Configure {DEFAULT_TIERS[selectedTier - 1].name} Tier
                {getIsActive(selectedTier) && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Active</span>}
            </h3>
            
          {/* Tier Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-500 mb-2 uppercase tracking-wide">
              Display Name
            </label>
            <input
              type="text"
              value={tierName}
              onChange={(e) => setTierName(e.target.value)}
              placeholder="e.g., Supporter, VIP, Super Fan"
              className={`w-full px-4 py-3 rounded-xl border bg-transparent outline-none transition ${isDark ? "border-gray-700 focus:border-blue-500" : "border-gray-300 focus:border-blue-500"}`}
            />
          </div>

          {/* Price */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-500 mb-2 uppercase tracking-wide">
              Price (ETH)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.001"
                min="0"
                value={tierPrice}
                onChange={(e) => setTierPrice(e.target.value)}
                className={`w-full px-4 py-3 pr-16 rounded-xl border bg-transparent outline-none transition ${isDark ? "border-gray-700 focus:border-blue-500" : "border-gray-300 focus:border-blue-500"}`}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">
                ETH
              </span>
            </div>
          </div>

          {/* Duration */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-500 mb-2 uppercase tracking-wide">
              Duration
            </label>
            <select
              value={tierDuration}
              onChange={(e) => setTierDuration(Number(e.target.value))}
              className={`w-full px-4 py-3 rounded-xl border bg-transparent outline-none transition ${isDark ? "border-gray-700 focus:border-blue-500" : "border-gray-300 focus:border-blue-500"}`}
            >
              <option value={7}>7 days (Weekly)</option>
              <option value={30}>30 days (Monthly)</option>
              <option value={90}>90 days (Quarterly)</option>
              <option value={365}>365 days (Yearly)</option>
            </select>
          </div>

          <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-sm mb-6">
              💡 Platform fee: 0.5% • You receive: 99.5% of subscription revenue
          </div>

          <button
            onClick={handleSave}
            disabled={isPending || isConfirming}
            className="w-full py-4 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30"
          >
            {isPending || isConfirming ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Saving...
              </>
            ) : (
              <>Save Configuration</>
            )}
          </button>
        </div>

        {/* Success Message */}
        {isSuccess && (
          <div className="mt-6 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
            <div className="bg-green-100 dark:bg-green-800 rounded-full p-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
            </div>
            <span className="font-medium">Tier configured successfully!</span>
          </div>
        )}
      </div>
    </div>
  );
}
