"use client";
import { useLight } from "@/context/LightContext";
import { useWallet } from "@/context/WalletContext";
import ProtectedRoute from "@/utils/ProtectedRoute";
import Image from "next/image";
export default function Dashboard() {
  const { isDark } = useLight();
  const { role } = useWallet();
  return (
    <ProtectedRoute allowedRoles={["Users","Creators"]}>
      <div className="w-full">
        <div className="grid grid-cols-1">
           {role === "Users" ? (
          <div className={`relative p-2 ${isDark ? "text-white" : "text-black"} flex flex-col`}>
            <div className="absolute rounded-3xl" />
            <div className="relative flex justify-center">
              <div className="group flex flex-col w-full max-w-sm transition">
                <div className="flex items-center justify-center ">
                  <div className="flex items-center justify-center w-32 h-32 group-hover:scale-105 transition-transform">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="w-20 h-20"
                    >
                      <path
                        d="M7 14C7 11.1911 7 9.78661 7.67412 8.77772C7.96596 8.34096 8.34096 7.96596 8.77772 7.67412C9.78661 7 11.1911 7 14 7C16.8089 7 18.2134 7 19.2223 7.67412C19.659 7.96596 20.034 8.34096 20.3259 8.77772C21 9.78661 21 11.1911 21 14C21 16.8089 21 18.2134 20.3259 19.2223C20.034 19.659 19.659 20.034 19.2223 20.3259C18.2134 21 16.8089 21 14 21C11.1911 21 9.78661 21 8.77772 20.3259C8.34096 20.034 7.96596 19.659 7.67412 19.2223C7 18.2134 7 16.8089 7 14Z"
                          stroke="currentColor"
                      />
                      <path
                        d="M7 18C4.79086 18 3 16.2091 3 14V10.5C3 7.21252 3 5.56878 3.90796 4.46243C4.07418 4.25989 4.25989 4.07418 4.46243 3.90796C5.56878 3 7.21252 3 10.5 3H14C16.2091 3 18 4.79086 18 7"
                          stroke="currentColor"
                      />
                      <path
                        d="M15.0834 12.3162C16.3392 13.0412 16.967 13.4037 16.9984 13.942C17.0006 13.9808 17.0006 14.0196 16.9984 14.0583C16.967 14.5966 16.3392 14.9591 15.0834 15.6841C13.8277 16.4091 13.1998 16.7716 12.7179 16.5296C12.6833 16.5122 12.6497 16.4928 12.6172 16.4715C12.1667 16.1752 12.1667 15.4502 12.1667 14.0002C12.1667 12.5502 12.1667 11.8252 12.6172 11.5289C12.6497 11.5075 12.6833 11.4881 12.7179 11.4707C13.1998 11.2287 13.8277 11.5912 15.0834 12.3162Z"
                          stroke="currentColor"
                      />
                    </svg>
                  </div>
                </div>

                {/* Title */}
                  <h3 className="font-mono text-center text-xl font-bold mb-2">
                    123 People Join Creator
                  </h3>

                {/* Description */}
                <p className="font-mono text-center text-sm text-gray-500 mb-4">
                  Manage and submit creator profiles
                </p>

                {/* Action */}
                <button className={`font-mono mt-auto w-full text-white font-semibold py-3 rounded-xl ${isDark ? "bg-gray-900" : "bg-black"} hover:bg-gray-800 transition shadow-md`}>
                  Join Creator
                </button>
              </div>
            </div>
          </div>
        ) : null}
        </div>

        <div className="grid grid-cols-1 py-4">
          <div className={`w-full  mx-auto ${ isDark ? "bg-gray-900" : "bg-white" } md:rounded-2xl md:w-3/5`}>
            <div className="flex items-center px-4 py-3">
              <Image
                src="https://i.pravatar.cc/40?img=1"
                alt="Avatar"
                width={40}
                height={40}
                className="rounded-full object-cover"
              />
              <div className="ml-3 flex-1">
                <h3 className="font-mono font-bold text-sm">John Doe</h3>
              </div>
              <button className="text-gray-500 font-bold text-xl">⋯</button>
            </div>
            <div className="font-mono py-4 px-4">
              Hallow
            </div>

            <div className="relative w-full h-72">
              <Image
                src="https://i.pravatar.cc/500?img=1"
                alt="Post"
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 500px"
              />
            </div>

            <div className="flex items-center justify-between px-4 py-8">
              <div className="flex gap-8">
                <button className="text-gray-700 hover:text-red-500 transition">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                  </svg>
                </button>
                <button className="flex items-center text-gray-700 hover:text-blue-500 transition">
                  <svg
                    className="size-6"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M3 15v4m6-6v6m6-4v4m6-6v6M3 11l6-5 6 5 5.5-5.5"
                    />
                  </svg>

                  <span className="ml-1">$70</span>
                </button>
                <button className="text-gray-700 hover:text-green-500 transition">
                  <svg className="size-6" viewBox="0 0 24 24" fill="none">
                    <g transform="rotate(45 12 12)">
                      <path
                        d="M8.4223 9.15539C9.9834 6.0332 10.7639 4.47211 12 4.47211C13.2361 4.47211 14.0166 6.0332 15.5777 9.15539L18.0292 14.0584C19.7382 17.4763 20.5927 19.1853 19.776 20.1872C18.9594 21.1891 17.1132 20.6968 13.4209 19.7122L13.0307 19.6081C12.5183 19.4715 12.2621 19.4032 12 19.4032C11.7379 19.4032 11.4817 19.4715 10.9694 19.6081L10.5792 19.7122C6.88682 20.6968 5.04065 21.1891 4.224 20.1872C3.40735 19.1853 4.26183 17.4763 5.9708 14.0584L8.4223 9.15539Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        fill="none"
                      />
                      <path
                        d="M12 14.0975L12 19.3975"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </g>
                  </svg>  
                </button>

              </div>
              <button className="text-gray-700 hover:text-gray-900 transition">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>

              </button>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
