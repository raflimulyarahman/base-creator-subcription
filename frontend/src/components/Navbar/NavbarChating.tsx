"use client";
import { useLight } from "@/context/LightContext";
import { usePathname, useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useChatPersonal } from "@/context/ChatPersonalContext";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { useWallet } from "@/context/WalletContext";
import ModalMakeGroup from "../Modal/ModalCreateGRoup";
export default function NavbarChating() {
  const searchParams = useSearchParams(); // <-- hook client
  const chatId = searchParams.get("chatId"); // <-- dapat query param
  const { isDark, toggle } = useLight();
  const { userId } = useWallet();
  const router = useRouter();
  const pathname = usePathname();
  const isCreatorChat = pathname === "/pages/chating/creator";
  const isCreatorGroup = pathname === "/pages/chating/group";
  const [otherUser, setOtherUser] = useState<any>(null);
  const { getHeaderPersonalChat } = useChatPersonal();
  const menuRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false); // Menyimpan status menu (terbuka/tutup)

  const [openModalMakeGroup, setOpenModalMakeGroup] = useState(false);
  const toggleMenu = () => {
    setIsOpen(!isOpen); // Toggle status menu
  };

  const handleModalGroup = () => setOpenModalMakeGroup(true);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!chatId) return;

    (async () => {
      const data = await getHeaderPersonalChat(chatId);
      setOtherUser(data);
    })();
  }, [chatId]);
  return (
    <nav
      className={`w-full h-16 transition-colors duration-300
      ${isDark ? "bg-black text-white" : "bg-transparent text-black"}
      md:bg-transparent`}
    >
      <div className="h-full flex items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-gray-100 transition"
            aria-label="Back"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1"
              stroke="currentColor"
              className="size-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5 8.25 12l7.5-7.5"
              />
            </svg>
          </button>
        </div>

        <div className="flex w-full items-center justify-center gap-3">
          <ul className="flex gap-4 text-sm font-medium">
            {isCreatorChat ? (
              <div className="flex items-center gap-3">
                <Image
                  src={
                    (userId === otherUser?.chatRoom.id_users1
                      ? otherUser?.chatRoom.user2?.foto
                      : otherUser?.chatRoom.user1?.foto) ||
                    "https://img.freepik.com/vektor-gratis/ilustrasi-kera-gaya-nft-digambar-tangan_23-2149622021.jpg"
                  }
                  alt="Creator Avatar"
                  width={40}
                  height={40}
                  unoptimized
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex flex-col">
                  <h1
                    className={`font-semibold text-sm md:text-base ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {userId === otherUser?.chatRoom.id_users1
                      ? otherUser?.chatRoom.user2?.username
                      : otherUser?.chatRoom.user1?.username}
                  </h1>
                  <span className="text-xs text-green-500">Online</span>
                </div>
              </div>
            ) : isCreatorGroup ? (
              <div className="flex items-center gap-3">
                <Image
                  src="https://img.freepik.com/vektor-gratis/ilustrasi-kera-gaya-nft-digambar-tangan_23-2149622021.jpg"
                  alt="Group Avatar"
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex flex-col">
                  <h1
                    className={`font-semibold text-sm md:text-base ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Creator Group
                  </h1>
                  <span className="text-xs text-blue-500">
                    12 members • Active
                  </span>
                </div>
              </div>
            ) : (
              <button
                className="
      font-mono
      font-bold
      text-lg
      hover:text-blue-500
      transition
      focus:outline-none
    "
              >
                Chat
              </button>
            )}
          </ul>
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

          <button onClick={toggleMenu} className="rounded-lg p-2 transition">
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
                d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z"
              />
            </svg>
          </button>
        </div>
        {/* Menu Dropdown */}
        {isOpen && (
          <div
            ref={menuRef}
            className="absolute right-0 mt-2 w-48 sm:w-56 lg:w-64 bg-white shadow-lg border-gray-200 border-2 rounded-lg"
          >
            <ul>
              <button
                onClick={handleModalGroup}
                className="py-2 px-4 text-sm sm:text-base font-bold hover:bg-gray-200 cursor-pointer"
              >
                Make Group
              </button>
            </ul>
          </div>
        )}

        {openModalMakeGroup && (
          <ModalMakeGroup
            onCloseMakeGroup={() => setOpenModalMakeGroup(false)}
          />
        )}
      </div>
    </nav>
  );
}
