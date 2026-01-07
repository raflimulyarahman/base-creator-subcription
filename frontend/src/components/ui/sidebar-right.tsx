"use client";

import { useWallet } from "@/context/WalletContext";
import { useLight } from "@/context/LightContext";
import Image from "next/image";
import LogoBased from "../../../public/logobased.png";

export default function SidebarRight() {
  const { isDark } = useLight();
  const { role, isLoading } = useWallet();
  console.log(role, isLoading);

  return (
    <>
      <aside className="hidden md:block w-80 h-screen sticky top-0 flex-shrink-0">
        <div
          className={`w-full h-full overflow-y-auto transition-colors duration-300
            ${
              isDark
                ? "bg-gray-900 text-white shadow-none"
                : "bg-white text-black shadow-sm"
            }`}
        >
          <div className="w-full h-14 flex items-center font-bold px-6">
            <h1 className="font mono text-sm">Account Users</h1>
          </div>
          <div className="flex flex-col px-4 py-4 gap-3 h-[400px] overflow-y-auto">
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 transition cursor-pointer"
              >
                <Image
                  src={`https://i.pravatar.cc/150?img=${i + 1}`}
                  alt="User Avatar"
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">User {i + 1}</span>
                  <span className="text-xs text-gray-500">
                    user{i + 1}@mail.com
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}
