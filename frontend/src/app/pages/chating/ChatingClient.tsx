"use client";

import { useChatPersonal } from "@/context/ChatPersonalContext";
import { useLight } from "@/context/LightContext";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useWallet } from "@/context/WalletContext";
import { useChatGroup } from "@/context/GroupChatContext";

export default function ChatingClient() {
  const { isDark } = useLight();
  const { userId } = useWallet();
  const { getChatGroup } = useChatGroup();
  const { getAllChatPersonal } = useChatPersonal();
  const [chattAll, setAllPersonal] = useState<any[]>([]);
  const [chatDataGroup, setChatDataGroup] = useState(null);
  console.log(chatDataGroup, "ini chat group");
  console.log(userId);
  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      try {
        const data = await getAllChatPersonal(userId);
        if (data) {
          setAllPersonal(data);
        } else {
          console.warn("No data received from getAllChatPersonal.");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [userId]);

  useEffect(() => {
    if (userId) {
      const fetchChat = async () => {
        const chat = await getChatGroup(userId);
        setChatDataGroup(chat); // Save the chat data in state
      };

      fetchChat();
    }
  }, [userId, getChatGroup]);

  return (
    <div className="w-screen py-2">
      {/* Creator Groups (optional static section) */}
      <div className="mt-2 px-4 md:px-8">
        <h2
          className={`text-md md:text-lg font-bold ${
            isDark ? "text-white" : "text-gray-900"
          } mb-3`}
        >
          Creator Groups
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* example static */}
          <div className="flex items-center justify-between rounded-xl p-3 sm:p-4 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer min-h-[88px] sm:min-h-[104px]">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <Image
                src="https://img.freepik.com/vektor-gratis/ilustrasi-kera-gaya-nft-digambar-tangan_23-2149622021.jpg"
                alt="Creator Group"
                width={48}
                height={48}
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover flex-shrink-0"
              />
              <div className="flex flex-col min-w-0">
                <h3
                  className={`font-semibold text-sm sm:text-base truncate ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  Creator Content Group
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 truncate">
                  Creator: Jakarta
                </p>
                <p className="text-xs text-gray-500 line-clamp-1">
                  Shared post you might like
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Direct Message Section */}
      <div className="mt-6 px-4 md:px-8">
        <h2
          className={`text-md md:text-lg font-bold ${
            isDark ? "text-white" : "text-gray-900"
          } mb-3`}
        >
          Direct Message With Creator
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {chattAll.length > 0 ? (
            chattAll.map((chat: any) => {
              const otherUser = chat.otherUser; // {id_users, first_name, last_name, foto}
              return (
                <Link
                  key={chat.id_chat_personal}
                  href={`/pages/chating/creator?chatId=${chat.id_personal_chat}`} // link ke halaman chat
                  className="flex items-center justify-between rounded-xl p-3 sm:p-4 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer min-h-[88px] sm:min-h-[104px]"
                >
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <Image
                      src={
                        otherUser?.foto ||
                        "https://img.freepik.com/vektor-gratis/ilustrasi-kera-gaya-nft-digambar-tangan_23-2149622021.jpg"
                      }
                      alt={otherUser?.first_name || "User"}
                      width={48}
                      height={48}
                      unoptimized
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex flex-col min-w-0">
                      <h3
                        className={`font-semibold text-sm sm:text-base truncate ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {otherUser?.first_name || "User"}{" "}
                        {otherUser?.last_name || ""}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500 truncate">
                        @{otherUser?.username}
                      </p>
                      {chat.lastMessage && (
                        <p className="text-xs text-gray-500 line-clamp-1">
                          {chat.lastMessage.message}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })
          ) : (
            <p className={`text-gray-400 ${isDark ? "text-gray-300" : ""}`}>
              Loading direct messages...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
