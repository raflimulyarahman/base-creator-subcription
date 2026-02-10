"use client";
import { useLight } from "@/context/LightContext";
import { useSubscribe } from "@/context/SubscribeContext";
import Toast from "@/components/Toast/Toast";
import { useUsers } from "@/context/UsersContext";
import { useWallet } from "@/context/WalletContext";
import Image from "next/image";
import { TierData } from "@/types";
import { useState } from "react";

interface ModalProps {
  onClose: () => void;
  profileUser: any;
  tiers?: TierData[];
}

export default function ModalSubscribe({ onClose, profileUser, tiers: propTiers }: ModalProps) {
  const { user } = useUsers();
    const { userId, address: userAddress } = useWallet();
    const { paySubscribe, tiers: contextTiers, loading, getSubscribeIdUsers } = useSubscribe();
    const tiers = propTiers || contextTiers;
    const { isDark } = useLight();
    const [toast, setToast] = useState<{
      show: boolean;
      message: string;
      type?: "success" | "error";
    }>({
      show: false,
      message: "",
      type: "success",
    });
    const [setUserSubscription] = useState<any>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    // Hanya tier aktif, diurutkan berdasarkan ID (1: Bronze, 2: Silver, 3: Gold)
    const activeTiers = tiers
      .filter((tier) => tier.isActive)
      .sort((a, b) => Number(a.id) - Number(b.id)); 
    console.log("Active Tiers:", activeTiers);
    const currentTier = activeTiers[currentIndex];
    // Jika tidak ada tier aktif, modal tidak tampil
    if (activeTiers.length === 0 || !currentTier) return null;
    console.log(userId, "price");
    const handleSubscribe = async () => {
      const id_creator = profileUser?.id_users || profileUser?.id;
      // Fallback to wallet_address if address.address is missing (e.g. for mock profiles)
      const addressCreator = profileUser?.address?.address || profileUser?.wallet_address;
      const id_users = userId;
      const price = currentTier.price;
      const tiersId = currentTier?.id;
      // Standardize tier name based on ID (regardless of what creator named it)
      let type_subscribe = "Bronze";
      if (Number(tiersId) === 2) type_subscribe = "Silver";
      if (Number(tiersId) === 3) type_subscribe = "Gold";
  
      if (
        !addressCreator ||
        !id_creator ||
        !id_users ||
        !type_subscribe ||
        !price ||
        !tiersId ||
        !userAddress
      ) {
        const errorMsg = `Missing Data: ${!addressCreator ? "[Creator Address] " : ""}${!tiersId ? "[Tier ID] " : ""}${!price ? "[Price] " : ""}${!id_creator ? "[Creator ID] " : ""}${!id_users ? "[User ID] " : ""}${!type_subscribe ? "[Tier Name] " : ""}${!userAddress ? "[Wallet Address] " : ""}`;
        console.error(errorMsg);
        setToast({ show: true, message: errorMsg, type: "error" });
        return;
      }
  
      try {
        const result = await paySubscribe({
          id_creator: id_creator,
          id_users: id_users,
          type_subscribe: type_subscribe,
          price: BigInt(price),
          tiersId: tiersId,
          addressCreator: addressCreator,
          userAddress: userAddress,
        });
        console.log(result);
        setToast({
          show: true,
          message: "Subscription Successful!",
          type: "success",
        });
        // Refresh subscription data to update UI (enable Chat button)
        await getSubscribeIdUsers(userId);
        setTimeout(onClose, 2000); 
      } catch (err: any) {
        console.error("Error subscribing:", err);
        setToast({
          show: true,
          message: err.message || "Subscription Failed",
          type: "error",
        });
      }
    };

  const silver = [
    {
      text: "Support the Creator",
      iconClass:
        "M12 .587l3.668 7.431 8.2 1.192-5.934 5.788 1.402 8.177L12 18.897l-7.336 3.858 1.402-8.177L.132 9.21l8.2-1.192L12 .587z",
    },
    {
      text: "Access to Member-only Community",
      iconClass:
        "M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155",
    },
    {
      text: "Access to Exlusive Member Comunity",
      iconClass:
        "M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155",
    },
    {
      text: "Early Updates From Creator",
      iconClass: "M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
    },
    {
      text: "Loyalty Badge Next to Your Name in Comments or Chat",
      iconClass:
        "M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z",
    },
  ];

  const gold = [
    {
      text: "Support the Creator & Get Badge (NFT)",
      iconClass:
        "M12 .587l3.668 7.431 8.2 1.192-5.934 5.788 1.402 8.177L12 18.897l-7.336 3.858 1.402-8.177L.132 9.21l8.2-1.192L12 .587z",
    },
    {
      text: "Access to Member-only Community",
      iconClass:
        "M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155",
    },
    {
      text: "Access to Exlusive Member Comunity",
      iconClass:
        "M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155",
    },
    {
      text: "Early Updates From Creator",
      iconClass: "M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
    },
    {
      text: "Loyalty Badge Next to Your Name in Comments or Chat",
      iconClass:
        "M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z",
    },
  ];

  const bronze = [
    {
      text: "Support the Creator",
      iconClass:
        "M12 .587l3.668 7.431 8.2 1.192-5.934 5.788 1.402 8.177L12 18.897l-7.336 3.858 1.402-8.177L.132 9.21l8.2-1.192L12 .587z",
    },
    {
      text: "Access to Member-only Community",
      iconClass:
        "M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155",
    },
    {
      text: "Early Updates From Creator",
      iconClass: "M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
    },
    {
      text: "Loyalty Badge Next to Your Name in Comments or Chat",
      iconClass:
        "M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z",
    },
  ];

  const getAccessText = (tierId: number | bigint) => {
    // Ensure we match number
    const id = Number(tierId);
    switch (id) {
      case 1: // Bronze
        return (
          <div className="mt-4 p-4 bg-gray-300 rounded-lg shadow-md max-w-md">
            <h2 className="text-base font-bold mb-3 px-6 text-left">
              Benefits
            </h2>
            <div className="px-6 text-sm text-gray-800 text-left">
              {bronze.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    className="w-6 h-6 text-blue-900 flex-shrink-0"
                  >
                    <path d={item.iconClass} />
                  </svg>
                  <p className="font-semibold">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        );
      case 2: // Silver
        return (
          <div className="mt-4 p-4 bg-gray-300 rounded-lg shadow-md max-w-md">
            <h2 className="text-base font-bold mb-3 px-6 text-left">
              Benefits
            </h2>
            <div className=" px-6 text-sm text-gray-800 text-left">
              {silver.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    className="w-6 h-6 text-blue-900 flex-shrink-0"
                  >
                    <path d={item.iconClass} />
                  </svg>
                  <p className="font-semibold">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        );
      case 3: // Gold
        return (
          <div className="mt-4 p-4 bg-gray-300 rounded-lg shadow-md max-w-md">
            <h2 className="text-base font-bold mb-3 px-6 text-left">
              Benefits
            </h2>
            <div className="px-6 text-sm text-gray-800 text-left">
              {gold.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    className="w-6 h-6 text-blue-900 flex-shrink-0"
                  >
                    <path d={item.iconClass} />
                  </svg>
                  <p className="font-semibold">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return "Tier tidak dikenal";
    }
  };

  const tierImages: Record<number, string> = {
    1: "/bronze.png", 
    2: "/silver.png",
    3: "/gold.png",
  };

  const tierImage =
    tierImages[Number(currentTier.id)] || "/default.png";

  const handlePrev = () =>
    setCurrentIndex((prev) => (prev === 0 ? activeTiers.length - 1 : prev - 1));
  const handleNext = () =>
    setCurrentIndex((prev) => (prev === activeTiers.length - 1 ? 0 : prev + 1));

  return (
    <div
      className="fixed inset-0 bg-gray-600/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-md max-h-[90vh] p-6 rounded-xl shadow-lg overflow-y-auto ${isDark ? "bg-gray-900 text-white" : "bg-white text-black"}`}
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
          <div className="w-full h-25 rounded-xl flex items-center justify-center mb-4 bg-blue-800 shadow-2xl">
            <div className="w-full h-16 rounded flex items-center justify-center py-4">
              <Image
                src={tierImage}
                alt={currentTier.name}
                width={120}
                height={120}
                className="py-2 object-contain"
              />
            </div>
          </div>

          <h2 className="font-bold text-[18px]">
            {(Number(currentTier.price) / 1e18).toFixed(4)} ETH / Month
          </h2>

          <div>
            <p className="mt-1 text-gray-700">
              {getAccessText(currentTier.id || 0)}
            </p>
          </div>

          <button
            onClick={() => handleSubscribe()}
            disabled={loading}
            className={`mt-4 w-full py-3 rounded-xl shadow-2xl text-white font-semibold transition shadow-md ${
              loading ? "bg-gray-500 cursor-not-allowed" : "bg-blue-900 hover:bg-gray-700"
            }`}
          >
            {loading ? "Processing..." : "Pay & Join Now!"}
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

        {toast.show && (
          <Toast
            message={toast.message}
            show={toast.show}
            type={toast.type}
            onClose={() =>
              setToast({ show: false, message: "", type: "success" })
            }
          />
        )}
      </div>
    </div>
  );
}
