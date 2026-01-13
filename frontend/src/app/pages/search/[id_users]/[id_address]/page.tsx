"use client";
import ToastSuccess from "@/components/ui/Toast";
import { useLight } from "@/context/LightContext";
import { useSubscribe } from "@/context/SubscribeContext";
import { useUsers } from "@/context/UsersContext";
import ProtectedRoute from "@/store/ProtectedRoute";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function PaySubPages() {
  const { isDark } = useLight();
  const router = useRouter();
  const [showToast, setShowToast] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { user } = useUsers();
  const { createSubscribe } = useSubscribe();
  const totalCards = 3;
  console.log(user);
  const bronzePlan = {
    type_subscribe: "BRONZE",
    id_users: user ? user.id_users : null,
    status_subscribe: "Active",
    subscribe: "1 Month",
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? totalCards - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === totalCards - 1 ? 0 : prev + 1));
  };

    useEffect(() => {
        const getSubscribe = async () => {

        }
    })

  const handleSubscribe = async () => {
    if (!user) return;

    try {
      const res = await createSubscribe(bronzePlan);
      console.log("Subscribe success:", res);
      setShowToast(true);
      router.push("/dashboard");
    } catch (err) {
      console.error("Error subscribing:", err);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["Users"]}>
      <div className="justify-center items-center">
        <ToastSuccess
          show={showToast}
          onClose={() => setShowToast(false)}
          message="Successfully Pay Subscribe"
        />
      </div>
      <div className="relative w-full max-w-md mx-auto overflow-hidden py-10">
        <div className="relative h-96">
          <div
            className={`absolute inset-0 transition-transform duration-500 ${
              currentIndex === 0
                ? "translate-x-0"
                : currentIndex === 1
                ? "-translate-x-full"
                : "translate-x-full"
            }`}
          >
            <div className="p-2 text-black flex flex-col py-2">
              <div className="absolute rounded-3xl" />
              <div className="relative flex justify-center rounded-3xl">
                <div
                  className={`group flex flex-col w-full ${
                    isDark ? "bg-gray-800" : "bg-white"
                  } px-8 py-6 max-w-sm transition`}
                >
                  <div className="flex items-center justify-center ">
                    <div
                      className="w-full h-16 rounded flex items-center justify-center"
                      style={{ backgroundColor: "#dda873ff" }}
                    >
                      <h1 className="text-black font-bold text-[20px] font-mono">
                        {bronzePlan.type_subscribe}
                      </h1>
                    </div>
                  </div>
                  <div className="flex flex-col items-center mt-4 space-y-2 text-center">
                    <h2
                      className={`font-mono ${
                        isDark ? "text-white" : "text-black"
                      } font-semibold text-lg`}
                    >
                      $5 / 0.001 ETH
                    </h2>
                    <p className="font-mono text-sm text-gray-500">
                      Access to bronze creator
                    </p>
                    <p className="font-mono text-sm text-gray-500">
                      * Access general group chat *
                    </p>

                    <h2
                      className={`font-mono ${
                        isDark ? "text-white" : "text-black"
                      } font-semibold text-lg`}
                    >
                      1 Month
                    </h2>
                  </div>

                  <div className="flex flex-col items-center mt-4">
                    <button
                      onClick={handleSubscribe}
                      className="font-mono mt-auto w-full text-white font-semibold py-3 rounded-xl bg-black hover:bg-gray-700 transition shadow-md"
                    >
                      Pay Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            className={`absolute inset-0 transition-transform duration-500 ${
              currentIndex === 1
                ? "translate-x-0"
                : currentIndex === 0
                ? "-translate-x-full"
                : "translate-x-full"
            }`}
          >
            <div className="p-2 text-black flex flex-col py-2">
              <div className="absolute rounded-3xl" />
              <div className="relative flex justify-center rounded-3xl">
                <div
                  className={`group flex flex-col w-full ${
                    isDark ? "bg-gray-800" : "bg-white"
                  }  px-8 py-6 max-w-sm transition`}
                >
                  <div className="flex items-center justify-center ">
                    <div
                      className="w-full h-16 rounded flex items-center justify-center"
                      style={{ backgroundColor: "#b0afafff" }}
                    >
                      <h1 className="text-black font-bold text-[20px] font-mono">
                        SILVER
                      </h1>
                    </div>
                  </div>
                  <div className="flex flex-col items-center mt-4 space-y-2 text-center">
                    <h2
                      className={`font-mono ${
                        isDark ? "text-white" : "text-black"
                      } font-semibold text-lg`}
                    >
                      $10 / 0.003 ETH
                    </h2>
                    <p className="font-mono text-sm text-gray-500">
                      Access to silver creator
                    </p>
                    <p className="font-mono text-sm text-gray-500">
                      * Access general group chat *
                    </p>
                    <p className="font-mono text-sm text-gray-500">
                      * NFT Reward *
                    </p>

                    <h2
                      className={`font-mono ${
                        isDark ? "text-white" : "text-black"
                      } font-semibold text-lg`}
                    >
                      1 Month
                    </h2>
                  </div>

                  <div className="flex flex-col items-center mt-4">
                    <button className="font-mono mt-auto w-full text-white font-semibold py-3 rounded-xl bg-black hover:bg-gray-700 transition shadow-md">
                      Pay Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            className={`absolute inset-0 transition-transform duration-500 ${
              currentIndex === 2
                ? "translate-x-0"
                : currentIndex === 1
                ? "-translate-x-full"
                : "translate-x-full"
            }`}
          >
            <div className="p-2 text-black flex flex-col py-2">
              <div className="absolute rounded-3xl" />
              <div className="relative flex justify-center rounded-3xl">
                <div
                  className={`group flex flex-col w-full ${
                    isDark ? "bg-gray-800" : "bg-white"
                  }  px-8 py-6 max-w-sm transition`}
                >
                  <div className="flex items-center justify-center ">
                    <div
                      className="w-full h-16 rounded flex items-center justify-center"
                      style={{ backgroundColor: "#DAA520" }}
                    >
                      <h1 className="text-black font-bold text-[20px] font-mono">
                        GOLD
                      </h1>
                    </div>
                  </div>
                  <div className="flex flex-col items-center mt-4 space-y-2 text-center">
                    <h2
                      className={`font-mono ${
                        isDark ? "text-white" : "text-black"
                      } font-semibold text-lg`}
                    >
                      $35 / 0.015 ETH
                    </h2>
                    <p className="font-mono text-sm text-gray-500">
                      Access to gold creator
                    </p>
                    <p className="font-mono text-sm text-gray-500">
                      * Access general group chat *
                    </p>
                    <p className="font-mono text-sm text-gray-500">
                      * NFT Reward *
                    </p>
                    <p className="font-mono text-sm text-gray-500">
                      * Talk to the creator or DM Creator *
                    </p>

                    <h2
                      className={`font-mono ${
                        isDark ? "text-white" : "text-black"
                      } font-semibold text-lg`}
                    >
                      1 Month
                    </h2>
                  </div>

                  <div className="flex flex-col items-center mt-4">
                    <button className="font-mono mt-auto w-full text-white font-semibold py-3 rounded-xl bg-black hover:bg-gray-700 transition shadow-md">
                      Pay Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

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
    </ProtectedRoute>
  );
}
