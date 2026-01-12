"use client";

import { useLight } from "@/context/LightContext";
import Image from "next/image";
import Link from "next/link";
export default function Chating() {
  const { isDark } = useLight();
  return (
    <div className="w-screen py-2 md:py-8">
      <div className="mt-2 px-4 md:px-8">
        <h2
          className={`text-md md:text-lg font-bold ${
            isDark ? "text-white" : "text-gray-900"
          } mb-3`}
        >
          Creator Groups
        </h2>

        <div
          className="
    grid
    grid-cols-1
    sm:grid-cols-2
    lg:grid-cols-3
    gap-3
  "
        >
          <div
            className="
      flex items-center justify-between
      rounded-xl
      p-3 sm:p-4
      hover:bg-gray-100 dark:hover:bg-gray-800
      transition
      cursor-pointer
      min-h-[88px] sm:min-h-[104px]
    "
          >
            {/* LEFT */}
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <Image
                src="https://img.freepik.com/vektor-gratis/ilustrasi-kera-gaya-nft-digambar-tangan_23-2149622021.jpg"
                alt="Creator Group"
                width={48}
                height={48}
                className="
          w-12 h-12
          sm:w-14 sm:h-14
          rounded-full
          object-cover
          flex-shrink-0
        "
              />

              <div className="flex flex-col min-w-0">
                <h3
                  className={`
            font-semibold
            text-sm sm:text-base
            truncate
            ${isDark ? "text-white" : "text-gray-900"}
          `}
                >
                  Creator Content Group
                </h3>

                <p className="text-xs sm:text-sm text-gray-500 truncate">
                  Creator: Jakarta
                </p>

                <p className="text-xs text-gray-500 line-clamp-1">
                  Shared post you might like
                </p>
              </div>
            </div>

            {/* RIGHT ICON */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className={`
        w-4 h-4 sm:w-5 sm:h-5
        flex-shrink-0
        ${isDark ? "text-white" : "text-gray-400"}
      `}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m8.25 4.5 7.5 7.5-7.5 7.5"
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="mt-2 px-4 md:px-8 py-6">
        <h2
          className={`text-md md:text-lg font-bold ${
            isDark ? "text-white" : "text-gray-900"
          } mb-3`}
        >
          Direct Message With Creator
        </h2>

        <div
          className="
    grid
    grid-cols-1
    sm:grid-cols-2
    lg:grid-cols-3
    gap-3
  "
        >
          <div
            className="
      flex items-center justify-between
      rounded-xl
      p-3 sm:p-4
      hover:bg-gray-100 dark:hover:bg-gray-800
      transition
      cursor-pointer
      min-h-[88px] sm:min-h-[104px]
    "
          >
            {/* LEFT */}
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <Image
                src="https://img.freepik.com/vektor-gratis/ilustrasi-kera-gaya-nft-digambar-tangan_23-2149622021.jpg"
                alt="Creator Group"
                width={48}
                height={48}
                className="
          w-12 h-12
          sm:w-14 sm:h-14
          rounded-full
          object-cover
          flex-shrink-0
        "
              />

              <div className="flex flex-col min-w-0">
                <h3
                  className={`
            font-semibold
            text-sm sm:text-base
            truncate
            ${isDark ? "text-white" : "text-gray-900"}
          `}
                >
                  Direct Message With Creator
                </h3>

                <p className="text-xs sm:text-sm text-gray-500 truncate">
                  Creator: Jakarta
                </p>

                <p className="text-xs text-gray-500 line-clamp-1">
                  Shared post you might like
                </p>
              </div>
            </div>

            {/* RIGHT ICON */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className={`
        w-4 h-4 sm:w-5 sm:h-5
        flex-shrink-0
        ${isDark ? "text-white" : "text-gray-400"}
      `}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m8.25 4.5 7.5 7.5-7.5 7.5"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
