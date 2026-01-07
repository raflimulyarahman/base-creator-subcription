"use client";

import { useWallet } from "@/context/WalletContext";
import { useLight } from "@/context/LightContext";
import Image from "next/image";
import LogoBased from "../../../public/logobased.png";
import { useUsers } from "@/context/UsersContext";

export default function SidebarRight() {
  const { isDark } = useLight();
  const { role, isLoading } = useWallet();
  const { usersAll } = useUsers();
  console.log(usersAll);

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
            {usersAll.map((user, i) => (
              <div
                key={user.id_users}
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
                  <span className="font-mono text-sm font-semibold">
                    {user.first_name || user.last_name
                      ? `${user.first_name ?? ""} ${
                          user.last_name ?? ""
                        }`.trim()
                      : `${user.address?.address.slice(
                          0,
                          6
                        )}...${user.address?.address.slice(-4)}`}
                  </span>

                  <span className="font-mono text-xs text-gray-500">
                    {user.role?.role}
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
