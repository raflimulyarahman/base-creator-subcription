"use client";

import { useLight } from "@/context/LightContext";
import Image from "next/image";

export default function CreatorPages() {
  const { isDark } = useLight();

  return (
    <div
      className={`min-h-screen ${
        isDark ? "bg-black text-white" : "bg-transparant text-gray-900"
      }`}
    >
      {/* SEARCH HEADER */}
      <div
        className={`
          sticky top-0 z-20
          border-b
          ${isDark ? "border-gray-800 bg-black" : "border-gray-200"}
        `}
      >
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search creator, post, or group..."
              className={`
                w-full
                rounded-xl
                px-12 py-3
                text-sm
                focus:outline-none
                focus:ring-2
                ${
                  isDark
                    ? "bg-gray-900 bg-gray-800 text-white placeholder-gray-400 focus:ring-blue-500"
                    : "bg-gray-100 bg-white text-gray-900 placeholder-gray-500 focus:ring-blue-500"
                }
              `}
            />

            {/* ICON */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Creator list */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Creator Card */}
          <button className="flex items-center gap-4 p-4 rounded-xl  hover:border-blue-500 hover:bg-blue-50 transition text-left">
            <img
              src="https://i.pravatar.cc/150?img=12"
              alt="creator"
              className="w-12 h-12 rounded-full object-cover"
            />

            <div className="flex-1">
              <h3 className="font-mono text-sm font-semibold">epacrypt</h3>
              <p className="text-xs text-gray-500">@epacrypt</p>
            </div>

            <span className="text-xs px-3 py-1 rounded-full bg-blue-600 text-white">
              Select
            </span>
          </button>

          {/* Creator Card */}
          <button className="flex items-center gap-4 p-4 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition text-left">
            <img
              src="https://i.pravatar.cc/150?img=32"
              alt="creator"
              className="w-12 h-12 rounded-full object-cover"
            />

            <div className="flex-1">
              <h3 className="font-mono text-sm font-semibold">cryptolab</h3>
              <p className="text-xs text-gray-500">@cryptolab</p>
            </div>

            <span className="text-xs px-3 py-1 rounded-full bg-blue-600 text-white">
              Select
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
