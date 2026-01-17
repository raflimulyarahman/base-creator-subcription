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
  const [chatDataGroup, setChatDataGroup] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"groups" | "messages">("groups"); // Active tab state

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
      {/* Tab Navigation */}
      <div className="px-4 md:px-8">
        <div className="flex space-x-4 mb-4">
          <button
            className={`font-semibold text-base ${
              activeTab === "groups"
                ? "text-blue-500 border-b-2 border-blue-500"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("groups")}
          >
            Group
          </button>
          <button
            className={`font-semibold text-base ${
              activeTab === "messages"
                ? "text-blue-500 border-b-2 border-blue-500"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("messages")}
          >
            Creator
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "groups" && (
        <div className="mt-2 px-4 md:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.isArray(chatDataGroup) && chatDataGroup.length > 0 ? (
              chatDataGroup.map((group) => (
                <div
                  key={group.id_group_chat}
                  className="flex items-center justify-between rounded-xl p-3 sm:p-4 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer min-h-[88px] sm:min-h-[104px]"
                >
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <Image
                      src={group.foto_group || "default_image_url_here"} // Fallback to default image if no foto_group is available
                      alt={group.name_group || "Default Group"}
                      width={48}
                      height={48}
                      unoptimized
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex flex-col px-2 min-w-0">
                      <h3
                        className={`font-semibold text-base truncate ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {group.name_group || "No Name Group"}
                      </h3>
                      <p className="text-xs font-semibold text-gray-500 truncate">
                        @{group.members?.[0]?.username || "Unknown Creator"}
                      </p>
                      <p className="text-xs font-semibold text-gray-500 truncate">
                        {group.members?.length || 0} Members
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No groups found.</p>
            )}
          </div>
        </div>
      )}

      {activeTab === "messages" && (
        <div className="mt-6 px-4 md:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {chattAll.length > 0 ? (
              chattAll.map((chat: any) => {
                const otherUser = chat.otherUser;
                return (
                  <Link
                    key={chat.id_chat_personal}
                    href={`/pages/chating/creator?chatId=${chat.id_personal_chat}`}
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
                      <div className="flex flex-col px-2 min-w-0">
                        <h3
                          className={`font-semibold text-base truncate ${
                            isDark ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {otherUser?.first_name || "User"}{" "}
                          {otherUser?.last_name || ""}
                        </h3>
                        <p className="text-sm text-gray-500 truncate">
                          @{otherUser?.username}
                        </p>
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
      )}
    </div>
  );
}
