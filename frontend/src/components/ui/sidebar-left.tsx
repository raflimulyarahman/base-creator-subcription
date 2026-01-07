"use client";

import { useLight } from "@/context/LightContext";
import { useUsers } from "@/context/UsersContext";
import { useWallet } from "@/context/WalletContext";
import Image from "next/image";

export default function SidebarLeft() {
  const { isDark } = useLight();
  const { role } = useWallet();
  const { user } = useUsers();
  const shortAddress = (addr?: string) =>
    addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "";

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
          <div className="w-full h-10 flex items-center  font-bold p-6">
            <h1 className="font-mono py-2 px-6">Menu</h1>
            <button className="ml-auto md:hidden">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="size-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
                />
              </svg>
            </button>
          </div>

          <div className="w-full flex items-center p-3">
            <div
              className={`flex w-full gap-4 border-2 rounded-xl p-2 items-center transition
              ${
                isDark
                  ? "bg-gray-800 border-gray-700 hover:bg-gray-700"
                  : "bg-gray-100 border-gray-200 hover:bg-gray-200"
              }`}
            >
              <Image
                src="https://img.freepik.com/vektor-gratis/ilustrasi-kera-gaya-nft-digambar-tangan_23-2149622021.jpg"
                alt="Avatar"
                width={35}
                height={35}
                className="rounded-full object-cover"
              />
              <p className="text-sm font-bold">
                {user?.first_name || user?.last_name
                  ? `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim()
                  : shortAddress(user?.id_address)}
              </p>

              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className={`size-4 ml-auto ${
                  isDark ? "text-white" : "text-black"
                }`}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m8.25 4.5 7.5 7.5-7.5 7.5"
                />
              </svg>
            </div>
          </div>

          {role === "Creators" ? (
            <ul
              className={`space-y-2 text-sm  ${
                isDark ? "text-white" : "text-black"
              } font-mono font-bold px-4`}
            >
              <li className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-200 transition">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  className="size-5"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                  />
                </svg>

                <span className="text-sm font-medium">Home</span>
              </li>
              <li className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-200 transition">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="size-6"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
                  />
                </svg>
                <span className="text-sm font-medium">Talk</span>
              </li>
              <li className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-200 transition">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                  />
                </svg>
                <span className="text-sm font-medium">Profile</span>
              </li>
              <li className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-200 transition">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75"
                  />
                </svg>
                <span className="text-sm font-medium">Logout</span>
              </li>
            </ul>
          ) : role === "Users" ? (
            <ul
              className={`space-y-2 text-sm  ${
                isDark ? "text-white" : "text-black"
              } font-mono font-bold px-4`}
            >
              <li
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer ${
                  isDark ? "hover:bg-gray-800" : "hover:bg-gray-200"
                } transition`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="size-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                  />
                </svg>

                <span className="text-sm font-medium">Home</span>
              </li>
              <li
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer ${
                  isDark ? "hover:bg-gray-800" : "hover:bg-gray-200"
                } transition`}
              >
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
                    d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
                  />
                </svg>
                <span className="text-sm font-medium">Talk</span>
              </li>
              <li
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer ${
                  isDark ? "hover:bg-gray-800" : "hover:bg-gray-200"
                } transition`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                  />
                </svg>
                <span className="text-sm font-medium">Profile</span>
              </li>
              <li
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer ${
                  isDark ? "hover:bg-gray-800" : "hover:bg-gray-200"
                } transition`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75"
                  />
                </svg>
                <span className="text-sm font-medium">Logout</span>
              </li>
            </ul>
          ) : (
            <div>Role not defined</div>
          )}
        </div>
      </aside>
    </>
  );
}
