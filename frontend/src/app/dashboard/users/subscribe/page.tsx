"use client";
import { useLight } from "@/context/LightContext";
import ProtectedRoute from "@/utils/ProtectedRoute";
export default function SubcribePages() {
   const { isDark } = useLight();
  return (
    <ProtectedRoute allowedRoles={["Users"]}>
      <div className="w-full flex flex-col md:flex-col justify-center py-8">
          <div className="p-2 text-black flex flex-col py-2">
            <div className="absolute rounded-3xl" />
            <div className="relative flex justify-center rounded-3xl">
              <div className={`group flex flex-col w-full ${isDark ? "bg-gray-800" : "bg-white"} px-8 py-6 max-w-sm transition`}>
                <div className="flex items-center justify-center ">
                  <div
                    className="w-full h-16 rounded flex items-center justify-center"
                    style={{ backgroundColor: "#dda873ff" }}
                  >
                    <h1 className="text-black font-bold text-[20px] font-mono">
                      BRONZE
                    </h1>
                  </div>
                </div>
                <div className="flex flex-col items-center mt-4 space-y-2 text-center">
                <h2 className={`font-mono ${isDark ? "text-white" : "text-black"} font-semibold text-lg`}>$5 / 0.001 ETH</h2>
                <p className="font-mono text-sm text-gray-500">
                  Access to exclusive chats creator
                </p>
                </div>

                <div className="flex flex-col items-center mt-4">
                  <button className="font-mono mt-auto w-full text-white font-semibold py-3 rounded-xl bg-black hover:bg-gray-700 transition shadow-md">
                    Pay Now
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="p-2 text-black flex flex-col py-2">
            <div className="absolute rounded-3xl" />
            <div className="relative flex justify-center rounded-3xl">
            <div className={`group flex flex-col w-full ${isDark ? "bg-gray-800" : "bg-white"}  px-8 py-6 max-w-sm transition`}>
                <div className="flex items-center justify-center ">
                  <div
                    className="w-full h-16 rounded flex items-center justify-center"
                    style={{ backgroundColor: "#b0afafff" }}
                  >
                    <h1 className="ttext-black font-bold text-[20px] font-mono">
                      SILVER
                    </h1>
                  </div>
                </div>
                <div className="flex flex-col items-center mt-4 space-y-2 text-center">
                <h2 className={`font-mono ${isDark ? "text-white" : "text-black"} font-semibold text-lg`}>$10 / 0.003 ETH</h2>
                <p className="font-mono text-sm text-gray-500">
                  Access to exclusive chats creator
                </p>
                
                </div>

                <div className="flex flex-col items-center mt-4">
                  <button className="font-mono mt-auto w-full text-white font-semibold py-3 rounded-xl bg-black hover:bg-gray-700 transition shadow-md">
                    Pay Now
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="p-2 text-black flex flex-col py-2">
            <div className="absolute rounded-3xl" />
            <div className="relative flex justify-center rounded-3xl">
            <div className={`group flex flex-col w-full ${isDark ? "bg-gray-800" : "bg-white"}  px-8 py-6 max-w-sm transition`}>
                <div className="flex items-center justify-center ">
                  <div
                    className="w-full h-16 rounded flex items-center justify-center"
                    style={{ backgroundColor: "#DAA520" }}
                  >
                    <h1 className="text-white font-bold text-[20px] font-mono">
                      GOLD
                    </h1>
                  </div>
                </div>
                <div className="flex flex-col items-center mt-4 space-y-2 text-center">
                <h2 className={`font-mono ${isDark ? "text-white" : "text-black"} font-semibold text-lg`}>$35 / 0.015 ETH</h2>
                  <p className="font-mono text-sm text-gray-500">
                    Access to exclusive chats creator
                  </p>
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
     
    </ProtectedRoute>
  );
}
