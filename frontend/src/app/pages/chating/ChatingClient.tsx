"use client";

import { useChatPersonal } from "@/context/ChatPersonalContext";
import { useChatGroup } from "@/context/GroupChatContext";
import { useLight } from "@/context/LightContext";
import { useSubscribe } from "@/context/SubscribeContext";
import { useWallet } from "@/context/WalletContext";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function ChatingClient() {
  const { isDark } = useLight();
  const { userId } = useWallet();
  const { chatGroups } = useChatGroup();
  const { getAllChatPersonal } = useChatPersonal();
  const { getSubscribeIdUsers, subscribedata } = useSubscribe();
  const [chattAll, setAllPersonal] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"groups" | "messages">("groups");

  console.log(chatGroups, "members");

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
        await getSubscribeIdUsers(userId);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [userId, activeTab]);

  return (
    <div className="w-full h-[calc(100vh-80px)] md:h-full flex flex-col">
      {/* Tab Navigation */}
      <div className="px-6 md:px-8 py-2">
        <div className="flex space-x-4 mb-2">
          <button
            className={`font-semibold text-base px-3 py-1 rounded-full transition ${
              activeTab === "groups"
              ? "text-black bg-gray-200 border border-gray-300 dark:bg-gray-800 dark:text-white dark:border-gray-700"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("groups")}
          >
            Group
          </button>
          <button
            className={`font-semibold text-base px-3 py-1 rounded-full transition ${
              activeTab === "messages"
              ? "text-black bg-gray-200 border border-gray-300 dark:bg-gray-800 dark:text-white dark:border-gray-700"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("messages")}
          >
            Creator
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto min-h-0 pb-20">
        {activeTab === "groups" && (
          <div className="h-full">
            {chatGroups.length > 0 ? (
              <div className="flex flex-col">
                {chatGroups.map((group) => (
                  <Link
                    key={group.id_group_chat}
                    href={`/pages/chating/group?chatGroupId=${group.id_group_chat}`}
                    className="
            flex w-full items-center justify-between md:px-8 px-6 p-2
            hover:bg-gray-100 dark:hover:bg-gray-200
            transition cursor-pointer
          "
                  >
                    {/* Left section: Image + Info */}
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      <Image
                        src={group.foto || "/images/default-group.png"}
                        alt={group.name_group}
                        width={48}
                        height={48}
                        unoptimized
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="flex flex-col px-2 min-w-0">
                        <h3
                          className={`font-semibold text-base truncate ${isDark ? "text-white" : "text-gray-900"
                            }`}
                        >
                          {group.name_group}
                        </h3>
                        <p className="text-xs font-semibold text-gray-500 truncate">
                          @{group.members?.[0]?.username || "Unknown Creator"}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
                <div className="flex flex-col items-center justify-center w-full h-full gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-12 h-12 text-gray-400"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                  </svg>
                  <p className="text-gray-400 text-sm font-bold text-center">
                    No Group found.
                  </p>
                </div>
            )}
          </div>

        )}

        {activeTab === "messages" && (
          <div className="h-full"> 
            <h3 className="px-8 pb-2 text-sm font-bold text-gray-500">Subscribed Creators</h3>
            {subscribedata && subscribedata.length > 0 ? (
              <div className="flex flex-col">
                {(() => {
                  // Deduplicate subscriptions by id_creator
                  const uniqueSubs = Array.from(
                    new Map(
                      subscribedata
                        .filter((sub) => sub.status_subscribe === "Done")
                        .map((sub) => [sub.id_creator, sub])
                    ).values()
                  );

                  return uniqueSubs.map((sub: any) => {
                    return (
                      <Link
                        key={sub.id_subscribe}
                        href={`/pages/search/${sub.id_creator}`} // Navigate to profile to Chat/Subscribe
                        className="
            flex w-full items-center justify-between md:px-8 px-6 p-2
            hover:bg-gray-100 dark:hover:bg-gray-200
            transition cursor-pointer
          "
                      >
                        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                          {/* Placeholder Avatar since sub data doesn't have profile info yet */}
                          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xl">
                            {sub.id_creator.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="flex flex-col px-2 min-w-0">
                            <h3
                              className={`font-semibold text-base truncate ${
                                isDark ? "text-white" : "text-gray-900"
                              }`}
                            >
                              Creator {sub.id_creator.slice(0, 6)}...
                            </h3>
                            <p
                              className={`text-sm ${
                                sub.type_subscribe === "Gold"
                                  ? "text-yellow-600"
                                  : "text-gray-500"
                              } truncate font-medium`}
                            >
                              {sub.type_subscribe} Tier
                            </p>
                          </div>
                        </div>
                      </Link>
                    );
                  });
                })()}
              </div>
            ) : (
                <div className="flex flex-col items-center justify-center w-full h-full gap-2">
                  <p className="text-gray-400 text-sm font-bold text-center">
                    You haven't subscribed to any creators yet.
                  </p>
                </div>
            )}
            
            {/* Divider */}
            <div className="border-t border-gray-200 dark:border-gray-700 my-4 mx-8"></div>
            
             <h3 className="px-8 pb-2 text-sm font-bold text-gray-500">Active Chats</h3>
            {chattAll.length > 0 ? (
              <div className="flex flex-col">
                {chattAll.map((chat: any) => {
                  const otherUser = chat.otherUser;
                  return (
                    <Link
                      key={chat.id_chat_personal}
                      href={`/pages/chating/creator?chatId=${chat.id_chat_personal}`}
                      className="
            flex w-full items-center justify-between md:px-8 px-6 p-2
            hover:bg-gray-100 dark:hover:bg-gray-200
            transition cursor-pointer
          "
                    >
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                        <Image
                          src={
                            otherUser?.foto ||
                            "/11789135.png"
                          }
                          alt={otherUser?.first_name || "User"}
                          width={48}
                          height={48}
                          unoptimized
                          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover flex-shrink-0"
                        />
                        <div className="flex flex-col px-2 min-w-0">
                          <h3
                            className={`font-semibold text-base truncate ${isDark ? "text-white" : "text-gray-900"
                              }`}
                          >
                            {otherUser?.first_name || "User"} {otherUser?.last_name || ""}
                          </h3>
                          <p className="text-sm text-gray-500 truncate">
                            @{otherUser?.username}
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
                <div className="px-8 text-gray-400 text-sm">
                   No active chats. Start one from a Creator's profile!
                </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
