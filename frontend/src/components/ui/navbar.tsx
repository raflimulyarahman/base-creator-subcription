"use client";
import Toast from "@/components/ui/toast";
import { useLight } from "@/context/LightContext";
import { useWallet } from "@/context/WalletContext";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import { useState } from "react";
export default function Navbar() {
  const { isDark, toggle } = useLight();
  const { role } = useWallet();
  const [showToast, setShowToast] = useState(false);
  console.log(isDark);

  const handleClick = () => {
    if (role === "Users") {
      setShowToast(true);
      return;
    }
  };

  return (
    <nav
      className={`w-full h-16 transition-colors duration-300
      ${isDark ? "bg-black text-white" : "bg-transparent text-black"}
      md:bg-transparent`}
    >
      <div className="justify-center items-center">
        <Toast
          show={showToast}
          onClose={() => setShowToast(false)}
          message="you are not accessed to this feature"
        />
      </div>
      <div className="h-full flex items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3 md:hidden">
          <Image
            src="https://i.pravatar.cc/150?img=1"
            alt="User Avatar"
            width={40}
            height={40}
            className="rounded-lg object-cover"
          />
        </div>
        <div className="flex w-full items-center justify-center gap-3 md:hidden">
          <ul className="flex gap-4 text-sm font-medium">
            <button className="font-mono font-bold text-sm hover:text-blue-500 transition focus-visible:ring-0 focus:outline-none">
              Trade
            </button>
            <button className="font-mono font-bold text-sm hover:text-blue-500 transition focus-visible:ring-0 focus:outline-none">
              Talk
            </button>
          </ul>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative hidden md:block w-72">
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg
                border border-gray-300 bg-white
                focus:outline-none focus:ring-2 focus:ring-blue-500
                transition"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-4">
          <ConnectButton.Custom>
            {({ account, mounted, openAccountModal }) => {
              if (!mounted || !account) return null;
              return (
                <button
                  onClick={openAccountModal}
                  title="Account"
                  className="rounded-lg p-2 transition hidden md:block">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="size-6"
                  >
                    <path
                      d="M3 6V17C3 18.8856 3 19.8284 3.58579 20.4142C4.17157 21 5.11438 21 7 21H17C18.8856 21 19.8284 21 20.4142 20.4142C21 19.8284 21 18.8856 21 17V12C21 10.1144 21 9.17157 20.4142 8.58579C19.8284 8 18.8856 8 17 8H7.82843C6.67474 8 6.0979 8 5.56035 7.84678C5.26506 7.7626 4.98044 7.64471 4.71212 7.49543C4.22367 7.22367 3.81578 6.81578 3 6ZM3 6C3 5.06812 3 4.60218 3.15224 4.23463C3.35523 3.74458 3.74458 3.35523 4.23463 3.15224C4.60218 3 5.06812 3 6 3H16"
                      stroke="currentColor"
                      strokeWidth="null"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>
                    <path
                      d="M18 14.5C18 15.3284 17.3284 16 16.5 16C15.6716 16 15 15.3284 15 14.5C15 13.6716 15.6716 13 16.5 13C17.3284 13 18 13.6716 18 14.5Z"
                      stroke="currentColor"
                      strokeWidth="null"
                    ></path>
                  </svg>
                </button>
              );
            }}
          </ConnectButton.Custom>

          <button
            onClick={toggle}
            className="fixed bottom-24 right-4 bg-gray-300 shadow z-80 p-3 rounded-full bg-transition transition shadow-lg focus:outline-none"
          >
            {isDark ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-6 h-6 text-gray-800"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-6 h-6 text-gray-800"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
                />
              </svg>
            )}
          </button>

          <button
            onClick={handleClick}
            className="rounded-lg p-2 transition">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 0 1 1.037-.443 48.282 48.282 0 0 0 5.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
              />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
}
