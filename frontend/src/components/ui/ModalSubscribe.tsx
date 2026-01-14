import { useLight } from "@/context/LightContext";
import { useSubscribe } from "@/context/SubscribeContext";
import { useUsers } from "@/context/UsersContext";
import { useEffect, useState } from "react";

interface ModalProps {
    onClose: () => void;
}

export default function Modal({ onClose }: ModalProps) {
    const { user, profileUser } = useUsers();
    const { createSubscribe, getSubscribeIdTier, tiers } = useSubscribe();
    const { isDark } = useLight();

    const [setUserSubscription] = useState<any>(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Fetch user subscription when modal opens
   // Fetch subscription info
     useEffect(() => {
       const addressId = profileUser?.address?.id_address;
       if (!addressId) return;
   
       const getSubscribe = async () => {
         const userDataSub = await getSubscribeIdTier(addressId);
         console.log("Fetched userDataSub:", userDataSub);
       };
       getSubscribe();
     }, [profileUser?.address?.id_address]);


    const handleSubscribe = async (tierName: string) => {
        if (!user) return;
        try {
            await createSubscribe({
                id_users: user.id_users,
                type_subscribe: tierName,
                status_subscribe: "Active",
                subscribe: "1 Month",
            });
            alert(`Subscribed to ${tierName} plan!`);

            // Refresh subscription after subscribing
            const updatedSub = await getSubscribeIdTier(profileUser?.address?.id_address);
            setUserSubscription(updatedSub);
        } catch (err) {
            console.error(err);
        }
    };

    const handlePrev = () => setCurrentIndex((prev) => (prev === 0 ? tiers.length - 1 : prev - 1));
    const handleNext = () => setCurrentIndex((prev) => (prev === tiers.length - 1 ? 0 : prev + 1));

    const currentTier = tiers[currentIndex];

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-80 relative">
                {/* Current Plan Card */}
                <div className="flex flex-col items-center justify-center text-center">
                    <div
                        className="w-full h-16 rounded flex items-center justify-center mb-4 bg-gray-200"
                    >
                        <h1 className="text-black font-bold text-[20px] font-mono">
                            {currentTier?.name || "Loading..."}
                        </h1>
                    </div>
                    <h2 className={`font-mono font-semibold text-lg ${isDark ? "text-white" : "text-black"}`}>
                        Price: {currentTier?.price ? (Number(currentTier.price) / 1e18).toFixed(4) : "-"} ETH
                    </h2>
                    <p className={`font-mono text-sm ${isDark ? "text-white" : "text-gray-600"}`}>
                        Duration: {currentTier?.duration?.toString() || "-"} seconds
                    </p>
                    <button
                        onClick={() => handleSubscribe(currentTier.name)}
                        className="mt-4 w-full py-3 rounded-xl bg-black text-white font-semibold hover:bg-gray-700 transition shadow-md"
                    >
                        Subscribe to {currentTier?.name}
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

                {/* Close */}
                <button
                    onClick={onClose}
                    className="mt-4 px-4 py-2 bg-blue-300 rounded hover:bg-blue-400 w-full"
                >
                    Close
                </button>
            </div>
        </div>
    );
}
