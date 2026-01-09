"use client";

import { useLight } from "@/context/LightContext";
import Image from "next/image";

export default function AIChating() {
  const { isDark } = useLight();

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-8 py-4 z-10">
        <div className="flex items-center gap-3">
          <Image
            src="https://img.freepik.com/vektor-gratis/ilustrasi-kera-gaya-nft-digambar-tangan_23-2149622021.jpg"
            alt="Creator Avatar"
            width={40}
            height={40}
            className="w-10 h-10 rounded-full object-cover"
          />
          <h1
            className={`font-bold text-lg md:text-xl ${isDark ? "text-white" : "text-gray-900"
              }`}
          >
            AI 1 Bankr
          </h1>
        </div>
        <button className="text-blue-500 font-semibold">Info</button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-4 flex flex-col gap-4 mb-20">
        {/* Creator message */}
        <div className="flex justify-start">
          <div className="flex flex-col">
            <div className="max-w-[70%] px-4 py-2 rounded-xl bg-gray-200 text-gray-900 rounded-bl-none">
              Hello! How can I help you today?
            </div>
            <span
              className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-500"
                }`}
            >
              10:15 AM
            </span>
          </div>
        </div>

        {/* User message */}
        <div className="flex justify-end">
          <div className="flex flex-col items-end">
            <div className="max-w-[70%] px-4 py-2 rounded-xl bg-blue-500 text-white rounded-br-none">
              Hi! I need some advice.
            </div>
            <span
              className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-500"
                }`}
            >
              10:16 AM
            </span>
          </div>
        </div>

        {/* Creator message */}
        <div className="flex justify-start">
          <div className="flex flex-col">
            <div className="max-w-[70%] px-4 py-2 rounded-xl bg-gray-200 text-gray-900 rounded-bl-none">
              Sure! What kind of advice are you looking for?
            </div>
            <span
              className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-500"
                }`}
            >
              10:17 AM
            </span>
          </div>
        </div>

        {/* User message */}
        <div className="flex justify-end">
          <div className="flex flex-col items-end">
            <div className="max-w-[70%] px-4 py-2 rounded-xl bg-blue-500 text-white rounded-br-none">
              About improving productivity in AI projects.
            </div>
            <span
              className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-500"
                }`}
            >
              10:18 AM
            </span>
          </div>
        </div>

        {/* Creator message */}
        <div className="flex justify-start">
          <div className="flex flex-col">
            <div className="max-w-[70%] px-4 py-2 rounded-xl bg-gray-200 text-gray-900 rounded-bl-none">
              Sure! What kind of advice are you looking for?
            </div>
            <span
              className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-500"
                }`}
            >
              10:17 AM
            </span>
          </div>
        </div>

        {/* User message */}
        <div className="flex justify-end">
          <div className="flex flex-col items-end">
            <div className="max-w-[70%] px-4 py-2 rounded-xl bg-blue-500 text-white rounded-br-none">
              About improving productivity in AI projects.
            </div>
            <span
              className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-500"
                }`}
            >
              10:18 AM
            </span>
          </div>
        </div>

        {/* Creator message */}
        <div className="flex justify-start">
          <div className="flex flex-col">
            <div className="max-w-[70%] px-4 py-2 rounded-xl bg-gray-200 text-gray-900 rounded-bl-none">
              Sure! What kind of advice are you looking for?
            </div>
            <span
              className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-500"
                }`}
            >
              10:17 AM
            </span>
          </div>
        </div>

        {/* User message */}
        <div className="flex justify-end">
          <div className="flex flex-col items-end">
            <div className="max-w-[70%] px-4 py-2 rounded-xl bg-blue-500 text-white rounded-br-none">
              About improving productivity in AI projects.
            </div>
            <span
              className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-500"
                }`}
            >
              10:18 AM
            </span>
          </div>
        </div>
      </div>

      {/* Input Box */}
      <div className="fixed bottom-0 left-0 w-full flex justify-center px-4 md:px-8 py-3">
        <div className="flex w-full max-w-2xl gap-3">
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 px-4 bg-white py-2 rounded-full border border-gray-500 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
              />
            </svg>
          </button>
        </div>
      </div>

    </div>
  );
}
