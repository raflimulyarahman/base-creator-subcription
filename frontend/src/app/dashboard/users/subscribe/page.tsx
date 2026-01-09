"use client";
import { useLight } from "@/context/LightContext";
import ProtectedRoute from "@/utils/ProtectedRoute";
import ToastSuccess from "@/components/ui/toastSuccess";

export default function SubscribePages() {
  const { isDark } = useLight();
  return (
    <ProtectedRoute allowedRoles={["Creators"]}>
      <div className="mb-2 flex py-4 justify-center px-4">
        <div
          className={`w-full max-w-md rounded-xl p-6 shadow
            ${isDark ? "bg-gray-900 text-white" : "bg-white text-gray-900"}
          `}
        >
          <h1 className="text-xl font-bold mb-6 font-mono">
            Create Subscription
          </h1>

          {/* Package Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Package Name
            </label>
            <input
              type="text"
              placeholder="Premium Access"
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

          {/* Price */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Price (USD)
            </label>
            <input
              type="number"
              placeholder="10"
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

          {/* Duration */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Duration</label>
            <select
              className={`w-full px-4 py-2 rounded-md border
                ${
                  isDark
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-300"
                }
                focus:outline-none focus:ring-2 focus:ring-blue-500
              `}
            >
              <option value="1">1 Month</option>
              <option value="3">3 Months</option>
              <option value="6">6 Months</option>
              <option value="12">12 Months</option>
            </select>
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="What will subscribers get?"
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
