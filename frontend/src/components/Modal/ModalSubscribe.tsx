"use client";

import { useLight } from "@/context/LightContext";
import { useSubscribe } from "@/context/SubscribeContext";
import { useUsers } from "@/context/UsersContext";
import { useEffect, useState } from "react";

interface ModalProps {
  onClose: () => void;
  profileUser: any;
}

export default function ModalSubscribe({ onClose, profileUser }: ModalProps) {
  const { user } = useUsers();
  const { paySubscribe, tiers } = useSubscribe();
  const { isDark } = useLight();
  const [setUserSubscription] = useState<any>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  // Hanya tier aktif
  const activeTiers = tiers.filter((tier) => tier.isActive);
  const currentTier = activeTiers[currentIndex];
  // Jika tidak ada tier aktif, modal tidak tampil
  if (activeTiers.length === 0 || !currentTier) return null;
  console.log(currentTier.price, "price");
  const handleSubscribe = async () => {
    const creatorAddress = profileUser?.address?.address;
    const tierId = currentTier?.id;
    const price = currentTier?.price; // HARUS WEI

    if (!creatorAddress || tierId == null || !price) {
      console.error("Missing creator address, tier ID, or price");
      return;
    }

    try {
      const result = await paySubscribe({
        addressCreator: creatorAddress,
        tiersId: tierId.toString(),
        payTiers: price,
      });
      console.log(result);
    } catch (err) {
      console.error("Error subscribing:", err);
    }
  };

  const handlePrev = () =>
    setCurrentIndex((prev) => (prev === 0 ? activeTiers.length - 1 : prev - 1));
  const handleNext = () =>
    setCurrentIndex((prev) => (prev === activeTiers.length - 1 ? 0 : prev + 1));

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className={`relative w-80 p-6 rounded-xl shadow-lg ${
          isDark ? "bg-gray-900 text-white" : "bg-white text-black"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-2xl font-bold hover:text-red-500 transition"
          aria-label="Close modal"
        >
          ×
        </button>

        <div className="flex flex-col items-center justify-center text-center mt-4">
          <div className="w-full h-16 rounded flex items-center justify-center mb-4 bg-gray-200">
            <h1 className="text-black font-bold text-[20px] font-mono">
              {currentTier.name}
            </h1>
          </div>
          <h2 className="font-mono font-semibold text-[16px]">
            Price: {(Number(currentTier.price) / 1e18).toFixed(4)} ETH /{" "}
            {(Number(currentTier.duration) / 2_592_000).toFixed(1)} Month(s)
          </h2>

          <button
            onClick={() => handleSubscribe(currentTier.name)}
            className="mt-4 w-full py-3 rounded-xl bg-black text-white font-semibold hover:bg-gray-700 transition shadow-md"
          >
            Subscribe to {currentTier.name}
          </button>
        </div>

        {/* Navigation */}
        <button
          onClick={handlePrev}
          className="absolute top-1/2 left-2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 text-white flex items-center justify-center hover:bg-black/50"
        >
          &#8249;
        </button>
        <button
          onClick={handleNext}
          className="absolute top-1/2 right-2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 text-white flex items-center justify-center hover:bg-black/50"
        >
          &#8250;
        </button>
      </div>
    </div>
  );
}
