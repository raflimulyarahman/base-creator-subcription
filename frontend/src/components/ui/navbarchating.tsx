"use client";
import { useLight } from "@/context/LightContext";
import { usePathname, useRouter } from "next/navigation";
//import Image from "next/image";
export default function NavbarChating() {
    const { isDark, toggle } = useLight();
    const router = useRouter();
    const pathname = usePathname();
    return (
        <nav
            className={`w-full h-16 transition-colors duration-300
      ${isDark ? "bg-black text-white" : "bg-transparent text-black"}
      md:bg-transparent`}
        >
            <div className="h-full flex items-center justify-between px-4 md:px-6">
                <div className="flex items-center gap-3 md:hidden">
                    <button
                        onClick={() => router.back()}
                        className="p-2 rounded-lg hover:bg-gray-100 transition"
                        aria-label="Back"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="w-6 h-6"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15.75 19.5 8.25 12l7.5-7.5"
                            />
                        </svg>
                    </button>

                </div>


                <div className="flex w-full items-center justify-center gap-3 md:hidden">
                    <ul className="flex gap-4 text-sm font-medium">
                        {/* Hanya tampilkan Chat jika bukan di halaman Notification */}
                        {!pathname.startsWith("/dashboard/users/notif") && (
                            <button
                                className={`font-mono font-bold text-[20px] transition focus-visible:ring-0 focus:outline-none ${pathname.startsWith("/dashboard/users/chating")
                                    ? "text-blue-500"
                                    : isDark
                                        ? "text-white"
                                        : "text-black"
                                    }`}
                            >
                                Chat
                            </button>
                        )}

                        {/* Hanya tampilkan Notification jika bukan di halaman Chat */}
                        {!pathname.startsWith("/dashboard/users/chating") && (
                            <button
                                className={`font-mono font-bold text-[20px] transition focus-visible:ring-0 focus:outline-none ${pathname.startsWith("/dashboard/users/notif")
                                    ? "text-black"
                                    : isDark
                                        ? "text-white"
                                        : "text-black"
                                    }`}
                            >
                                Notification
                            </button>
                        )}
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
                    <button
                        onClick={toggle}
                        className="fixed bottom-24 animate-bounce right-4 bg-gray-300 shadow z-80 p-3 rounded-full bg-transition transition shadow-lg focus:outline-none"
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

                    <button className="rounded-lg p-2 transition">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
                        </svg>
                    </button>
                </div>
            </div>
        </nav>
    );
}
