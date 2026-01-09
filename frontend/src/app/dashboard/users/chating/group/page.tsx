"use client";

import { useLight } from "@/context/LightContext";
import Image from "next/image";

export default function GroupChating() {
  const { isDark } = useLight();

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-4 flex flex-col gap-3 mb-28">
        {/* Creator Message */}
        <div className="flex items-start gap-2">
          <Image
            src="https://img.freepik.com/vektor-gratis/ilustrasi-kera-gaya-nft-digambar-tangan_23-2149622021.jpg"
            alt="Creator Avatar"
            width={40}
            height={40}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <p className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-800"}`}>AI Creator</p>
            <div className={`max-w-[70vw] px-4 py-2 rounded-xl ${isDark ? "bg-gray-700 text-white" : "bg-gray-200 text-gray-900"} rounded-bl-none mt-1`}>
              Hello! How can I help you today?
            </div>
            <span className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>10:15 AM</span>
          </div>
        </div>

        {/* Vote Bubble */}
        <div className="flex items-start gap-2">
          <Image
            src="https://img.freepik.com/vektor-gratis/ilustrasi-kera-gaya-nft-digambar-tangan_23-2149622021.jpg"
            alt="Creator Avatar"
            width={40}
            height={40}
            className="w-10 h-10 rounded-full object-cover"
          />

          {/* Content */}
          <div className="flex flex-col">
            <div
              className={`max-w-[70vw] px-4 py-3 rounded-xl mt-1 ${isDark ? "bg-gray-700 text-white" : "bg-gray-200 text-gray-900"
                }`}
            >
              <p className="font-semibold text-sm md:text-base mb-2">
                Which feature should we prioritize next?
              </p>

              <div className="flex flex-col gap-2 mb-3">
                {["Improve AI accuracy", "New UI design", "Add notifications"].map(
                  (option, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between w-full"
                    >
                      <button
                        className={`flex-1 text-left px-3 py-2 rounded-md border ${isDark
                          ? "border-gray-600 hover:bg-gray-600"
                          : "border-gray-300 hover:bg-gray-300"
                          } transition`}
                      >
                        {option}
                      </button>
                      <span className="ml-2 text-xs text-gray-500">1</span>
                    </div>
                  )
                )}
              </div>

              <button className="w-full bg-blue-500 text-white py-2 rounded-full font-semibold hover:bg-blue-600 transition">
                Vote
              </button>
            </div>

            {/* Jam di bawah bubble */}
            <span
              className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-500"
                }`}
            >
              10:17 AM
            </span>
          </div>
        </div>


        {/* User Message */}
        <div className="flex justify-end items-start gap-2">
          <div className="flex flex-col items-end">
            <p className={`text-sm font-semibold ${isDark ? "text-white" : "text-blue-600"}`}>You</p>
            <div className="max-w-[70vw] px-4 py-2 mt-1 rounded-xl bg-blue-500 text-white rounded-br-none">
              I think we should prioritize improving AI accuracy.
            </div>
            <span className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>10:17 AM</span>
          </div>
          <Image
            src="https://img.freepik.com/vektor-gratis/ilustrasi-kera-gaya-nft-digambar-tangan_23-2149622021.jpg"
            alt="Your Avatar"
            width={40}
            height={40}
            className="w-10 h-10 rounded-full object-cover"
          />
        </div>

        {/* Another Creator Message */}

      </div>

      {/* Input Box - Fixed Bottom */}
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
