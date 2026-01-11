"use client";
import { useLight } from "@/context/LightContext";
import ProtectedRoute from "@/store/ProtectedRoute";

import { useSubscribe } from "@/context/SubscribeContext";

export default function SubscribePages() {
  const { isDark } = useLight();
  const { createSubscribe } = useSubscribe();
  return (
    <ProtectedRoute allowedRoles={["Creators"]}>
      <div className="mb-2 flex py-4 justify-center px-4">
        <div
          className={`w-full max-w-md rounded-xl p-6 shadow
            ${isDark ? "bg-gray-900 text-white" : "bg-white text-gray-900"}
          `}
        >
          <h1 className="text-xl font-bold mb-6 font-mono">
            Make Subscription
          </h1>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Bronze</label>
            <input
              type="text"
              placeholder="input Eth to Bronze ..."
              className={`w-full px-4 py-2 rounded-md border
                ${
                  isDark
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-300"
                }
                focus:outline-none focus:ring-2 focus:ring-blue-500
              `}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Silver</label>
            <input
              type="text"
              placeholder="input Eth to Silver"
              className={`w-full px-4 py-2 rounded-md border
                ${
                  isDark
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-300"
                }
                focus:outline-none focus:ring-2 focus:ring-blue-500
              `}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Gold</label>
            <input
              type="text"
              placeholder="input Eth to Gold"
              className={`w-full px-4 py-2 rounded-md border
                ${
                  isDark
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-300"
                }
                focus:outline-none focus:ring-2 focus:ring-blue-500
              `}
            />
          </div>

          {/* Submit */}
          <button
            onClick={createSubscribe}
            className="w-full bg-blue-800 text-white py-2 rounded-md
              font-semibold hover:bg-blue-700 transition"
          >
            Make Subscription
          </button>
        </div>
      </div>
    </ProtectedRoute>
  );
}
