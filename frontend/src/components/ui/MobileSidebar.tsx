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
                  href="/pages/regist"
                  onClick={onClose}
                  className="group flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-200 transition"
                >
                  <div className="rounded-full bg-gray-200 p-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      className="size-4 text-black"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z"
                      />
                    </svg>
                  </div>
                  <span className="text-xs font-semibold">Regist Creators</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/pages/creator"
                  onClick={onClose}
                  className="group flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-200 transition"
                >
                  <div className="rounded-full bg-gray-200 p-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      className="size-4 text-black"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z"
                      />
                    </svg>
                  </div>

                  <span className="text-xs font-semibold">
                    Subscribe Creator
                  </span>
                </Link>
              </li>

              <Link
                href="/pages/profile"
                onClick={onClose}
                className="group flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-200 transition cursor-pointer"
              >
                <div className="rounded-full bg-gray-200 p-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="size-4 text-black"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                    />
                  </svg>
                </div>
                <span className="text-xs font-semibold">Profile</span>
              </Link>
            </>
          ) : null}

          {/* ================= CREATOR ================= */}
          {role === "Creators" ? (
            <>
              <li>
                <Link
                  href="/pages/subscribe"
                  onClick={onClose}
                  className="group flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-200 transition"
                >
                  <div className="rounded-full bg-gray-200 p-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      className="size-4 text-black"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z"
                      />
                    </svg>
                  </div>
                  <span className="text-xs font-semibold">Make Subscribe</span>
                </Link>
              </li>

              <li>
                <Link
                  href="/pages/creator"
                  onClick={onClose}
                  className="group flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-200 transition"
                >
                  <div className="rounded-full bg-gray-200 p-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="size-4 text-black"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
                      />
                    </svg>
                  </div>
                  <span className="text-xs font-semibold">Make Group</span>
                </Link>
                <Link
                  href="/pages/profile"
                  onClick={onClose}
                  className="group flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-200 transition cursor-pointer"
                >
                  <div className="rounded-full bg-gray-200 p-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="size-4 text-black"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                      />
                    </svg>
                  </div>
                  <span className="text-xs font-semibold">Profile</span>
                </Link>
              </li>
            </>
          ) : null}
        </ul>
      </div>
    </div>
  );
}
