"use client";

import Image from "next/image";
import Link from "next/link";
import { useLight } from "@/context/LightContext";
import { useWallet } from "@/context/WalletContext";
import { useUsers } from "@/context/UsersContext";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import ModalCreateSubscribe from "../Modal/ModalCreateSubscribe";

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
  const { role } = useWallet();
  const { user } = useUsers();
  const [openModal, setOpenModal] = useState(false);
  const [openModalSub, setOpenModalSub] = useState(false);

  const handleCloseModal = () => setOpenModal(false);
  const handleCloseModalSub = () => setOpenModalSub(false);
  // useEffect(() => {
  //   console.log("Sidebar role:", role);
  // }, [role]);

  if (!open) return null;
  const DEFAULT_AVATAR =
    "https://img.freepik.com/vektor-gratis/ilustrasi-kera-gaya-nft-digambar-tangan_23-2149622021.jpg";

  return (
    <div
      className="fixed inset-0 z-50 flex md:hidden bg-black/30"
      onClick={onClose} // klik overlay close
    >
      <div
        className={`w-72 ${isDark ? "bg-black" : "bg-white"} h-full shadow-lg`}
        onClick={(e) => e.stopPropagation()} // klik di sidebar jangan close
      >
        {/* Header */}
        <div
          className={`w-full h-52 ${
            isDark ? "bg-gray-800" : "bg-blue-100"
          } flex py-8`}
        >
          <div className="px-4 w-full flex flex-col">
            <Image
              src={user?.foto?.trim() || DEFAULT_AVATAR}
              alt="User Avatar"
              width={90}
              height={90}
              unoptimized
              className="rounded-full object-cover mb-3"
            />
            <h1 className="font-mono text-lg font-semibold mb-1">
              {user?.username}
            </h1>
            <h3 className="font-mono text-4xl md:text-5xl font-bold tracking-tight">
              US$0
            </h3>
          </div>
        </div>

        {/* Menu */}
        <ul className="mt-4 space-y-1">
          {/* USER */}
          {role === "Users" && (
            <>
              <li>
                <button
                  onClick={() => setOpenModal(true)}
                  className="group flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-200 transition"
                >
                  <div className="rounded-full bg-gray-200 p-2">
                    {/* SVG icon */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-4 h-4 text-black"
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
                </button>
              </li>
              <li>
                <Link
                  href="/pages/profile"
                  className="group flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-200 transition"
                >
                  <div className="rounded-full bg-gray-200 p-2">
                    {/* SVG icon */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-4 h-4 text-black"
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
                  <span className="text-xs font-semibold">View Profile</span>
                </Link>
              </li>
            </>
          )}

          {/* CREATOR */}
          {role === "Creators" && (
            <>
              <li>
                <button
                  onClick={() => setOpenModalSub(true)}
                  className="group flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-200 transition"
                >
                  <div className="rounded-full bg-gray-200 p-2">
                    {/* SVG icon */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-4 h-4 text-black"
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
                  <span className="text-xs font-semibold">Make Subscribe</span>
                </button>
              </li>
              <li>
                <Link
                  href="/pages/profile"
                  className="group flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-200 transition"
                >
                  <div className="rounded-full bg-gray-200 p-2">
                    {/* SVG icon */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-4 h-4 text-black"
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
                  <span className="text-xs font-semibold">View Profile</span>
                </Link>
              </li>
            </>
          )}
        </ul>

        {openModal && <ModalRegistration onClose={handleCloseModal} />}

        {openModalSub && (
          <ModalCreateSubscribe onCloseSub={handleCloseModalSub} />
        )}
      </div>
    </div>
  );
}
