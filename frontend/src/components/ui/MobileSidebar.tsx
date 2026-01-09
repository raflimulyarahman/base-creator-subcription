"use client";
import Image from "next/image";
import Link from "next/link";
import { useLight } from "@/context/LightContext";

import { useWallet } from "@/context/WalletContext";
export default function MobileSidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;
  const { isDark } = useLight();
  const { role } = useWallet();
  return (
    <div className="fixed inset-0 z-50 flex md:hidden">
      {/* Sidebar kiri */}
      <div
        className={`w-75 ${isDark ? "bg-black" : "bg-white"} h-full shadow-lg`}
      >
        <div
          className={`w-full h-52 ${
            isDark ? "bg-gray-800" : "bg-blue-100"
          } flex py-8`}
        >
          <div className="px-4 w-full flex flex-col">
            <Image
              src="https://img.freepik.com/vektor-gratis/ilustrasi-kera-gaya-nft-digambar-tangan_23-2149622021.jpg"
              alt="User Avatar"
              width={90}
              height={90}
              className="rounded-full object-cover mb-3"
            />

            <h1 className="font-mono text-lg font-semibold mb-1">epacrypt</h1>

            <h3 className="font-mono text-4xl md:text-5xl font-bold tracking-tight">
              US$0
            </h3>
          </div>
        </div>

        <ul className="mt-4 space-y-1">
          {/* ================= USER ================= */}
          {role === "Users" ? (
            <>
              <li>
                <Link
                  href="/dashboard/users/creator"
                  onClick={onClose}
                  className="group flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-200 transition"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5 text-gray-700 group-hover:text-blue-500"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6v12m6-6H6"
                    />
                  </svg>
                  <span className="font-mono text-sm font-semibold">
                    Subscribe Creator
                  </span>
                </Link>
              </li>

              <li className="group flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-200 transition cursor-pointer">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5 text-gray-700 group-hover:text-blue-500"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M18 9a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM6 9a3 3 0 1 1 6 0 3 3 0 0 1-6 0Zm12 8.25c0-2.485-2.239-4.5-5-4.5s-5 2.015-5 4.5"
                  />
                </svg>
                <span className="font-mono text-sm font-semibold">
                  Invite Friends
                </span>
              </li>
                 <li className="group flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-200 transition cursor-pointer">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5 text-gray-700 group-hover:text-blue-500"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M18 9a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM6 9a3 3 0 1 1 6 0 3 3 0 0 1-6 0Zm12 8.25c0-2.485-2.239-4.5-5-4.5s-5 2.015-5 4.5"
                  />
                </svg>
                <span className="font-mono text-sm font-semibold">
                  Profile
                </span>
              </li>
            </>
          ) : null}

          {/* ================= CREATOR ================= */}
          {role === "Creators" ? (
            <>
              <li>
                <Link
                  href="/dashboard/users/subscribe"
                  onClick={onClose}
                  className="group flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-200 transition"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5 text-gray-700 group-hover:text-blue-500"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6v12m6-6H6"
                    />
                  </svg>
                  <span className="font-mono text-sm font-semibold">
                    Make Subscribe
                  </span>
                </Link>
              </li>

              <li>
                <Link
                  href="/dashboard/creator/settings"
                  onClick={onClose}
                  className="group flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-200 transition"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5 text-gray-700 group-hover:text-blue-500"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10.5 6h3m-3 12h3m-6.364-9.364l2.121 2.121m4.243 4.243l2.121 2.121M6 12h12"
                    />
                  </svg>
                  <span className="font-mono text-sm font-semibold">
                    Make Group
                  </span>
                </Link>
              </li>
            </>
          ) : null}
        </ul>
      </div>
    </div>
  );
}
