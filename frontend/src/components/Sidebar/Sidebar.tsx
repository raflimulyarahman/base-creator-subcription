"use client";

import { useLight } from "@/context/LightContext";
import { useUsers } from "@/context/UsersContext";
import { useWallet } from "@/context/WalletContext";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import CreatePostModal from "../CreatePost/CreatePostModal";
import ConfigureTierModal from "../ConfigureTier/ConfigureTierModal";
import { useReadContract } from "wagmi";
import { formatEther } from "viem";
import { subscriptionManagerAbi } from "@/abi/SubscriptionManager";

// Dynamic import modal client-only
const ModalRegistration = dynamic(() => import("../Modal/ModalRegistration"), {
  ssr: false,
});

export default function SidebarPages({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { isDark } = useLight();
  const { role, address } = useWallet();
  const { user } = useUsers();
  const [openModal, setOpenModal] = useState(false);
  const [openCreatePost, setOpenCreatePost] = useState(false);
  const [openConfigureTier, setOpenConfigureTier] = useState(false);

  const handleCloseModal = () => setOpenModal(false);

  const DEFAULT_AVATAR = "/11789135.png";
  const [imgSrc, setImgSrc] = useState(DEFAULT_AVATAR);
  
  // Update imgSrc when user changes
  useEffect(() => {
    // Prioritize avatar_url (Supabase) -> foto (Legacy) -> Default
    const avatar = user?.avatar_url || user?.foto;
    if (avatar?.trim()) {
      setImgSrc(avatar.trim());
    } else {
      setImgSrc(DEFAULT_AVATAR);
    }
  }, [user?.avatar_url, user?.foto]);

  // Fetch real balance from contract
  const { data: balanceData } = useReadContract({
    address: process.env.NEXT_PUBLIC_SUBSCRIPTION_MANAGER_ADDRESS as `0x${string}` || "0x13127807Ef2E0392e0f57e09e8b11608737E48E8",
    abi: subscriptionManagerAbi,
    functionName: "pendingWithdraw",
    args: address ? [address] : undefined,
    query: {
        enabled: !!address,
    }
  });

  const formattedBalance = balanceData 
    ? parseFloat(formatEther(balanceData as bigint)).toFixed(4) 
    : "0.00";

  // Early return AFTER all hooks
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex bg-black/30"
      onClick={onClose} // klik overlay close
    >
      <div
        className={`w-72 ${isDark ? "bg-black" : "bg-white"} h-full shadow-lg`}
        onClick={(e) => e.stopPropagation()} // klik di sidebar jangan close
      >
        {/* Header */}
        <div
          className={`w-full h-52 ${
            isDark ? "bg-gray-800" : "bg-blue-900"
          } flex`}
        >
          <div className="px-4 py-4 w-full flex flex-col">
            <Image
              src={imgSrc}
              alt="User Avatar"
              width={90}
              height={90}
              unoptimized
              className="rounded-full object-cover" // Added object-cover
              style={{ width: "80px", height: "80px" }}
              onError={() => setImgSrc(DEFAULT_AVATAR)}
            />

            <h1 className="text-lg font-semibold mb-2 mt-4 text-white">
              {user?.username || "Guest"}
            </h1>
            <div className="mt-4">
              <p className="text-xs text-blue-200 dark:text-gray-400 font-medium uppercase tracking-wider mb-1">
                Total Balance (Claimable)
              </p>
              <h3 className="text-3xl font-bold tracking-tight text-white">
                {formattedBalance} ETH
              </h3>
            </div>
          </div>
        </div>

        {/* Menu */}
        <ul className="mt-4 space-y-1">
          {/* HOME */}
          <li>
            <a
              href="/"
              className="group flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition"
            >
              <div className="rounded-full bg-gray-200 dark:bg-gray-700 p-2 group-hover:bg-gray-300 dark:group-hover:bg-gray-600 transition">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-4 h-4 text-black dark:text-gray-100"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                  />
                </svg>
              </div>
              <span className="text-xs font-semibold text-black dark:text-white">Home</span>
            </a>
          </li>

          {/* USER */}
          {role === "user" && (
            <>
              <li>
                <Link
                  href="/pages/creator"
                  className="group flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition"
                >
                  <div className="rounded-full p-2 bg-gray-200 dark:bg-gray-700 group-hover:bg-gray-300 dark:group-hover:bg-gray-600 transition">
                    {/* SVG icon */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-4 h-4 text-black dark:text-gray-100"
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
                  <span className="text-xs font-semibold text-black dark:text-white">Become Creator</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/pages/profile"
                  className="group flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition"
                >
                  <div className="rounded-full bg-gray-200 dark:bg-gray-700 p-2 group-hover:bg-gray-300 dark:group-hover:bg-gray-600 transition">
                    {/* SVG icon */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-4 h-4 text-black dark:text-gray-100"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-black dark:text-white">View Profile</span>
                </Link>
              </li>
            </>
          )}

          {/* CREATOR */}
          {role === "creator" && (
            <>
              <li>
                <Link
                  href="/pages/create-post"
                  className="group flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition"
                >
                  <div className="rounded-full p-2 bg-blue-100 dark:bg-blue-900/50 group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-4 h-4 text-blue-600 dark:text-blue-400"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">Create Post</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/pages/creator/tiers"
                  className="group flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition"
                >
                  <div className="rounded-full p-2 bg-yellow-100 dark:bg-yellow-900/50 group-hover:bg-yellow-200 dark:group-hover:bg-yellow-800 transition">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-4 h-4 text-yellow-600 dark:text-yellow-400"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.43l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-yellow-600 dark:text-yellow-400">Manage Tiers</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/pages/profile"
                  className="group flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition"
                >
                  <div className="rounded-full bg-gray-200 dark:bg-gray-700 p-2 group-hover:bg-gray-300 dark:group-hover:bg-gray-600 transition">
                    {/* SVG icon */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-4 h-4 text-black dark:text-gray-100"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-black dark:text-white">View Profile</span>
                </Link>
              </li>
            </>
          )}
        </ul>

      </div>
    </div>
  );
}
