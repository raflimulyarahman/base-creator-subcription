"use client";

import ChatInputGroup from "@/app/pages/chating/group/GroupInput";
import { useLight } from "@/context/LightContext";
import { MessageChat, useMessageChat } from "@/context/MessageContext";
import { useWallet } from "@/context/WalletContext";
import { useUsers } from "@/context/UsersContext";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import MessageBubble from "@/components/Message/MessageBubble";

export default function GroupChating() {
  const searchParams = useSearchParams();
  const chatGroupId = searchParams.get("chatGroupId");
  const { isDark } = useLight();
  const { userId } = useWallet();
  const { user } = useUsers();
  const { getMessagesByChatId } = useMessageChat();
  
  const [messages, setMessages] = useState<MessageChat[]>([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Helper: Get Current User Identity
  const currentUser = {
    id_users: userId || "",
    first_name: user?.first_name || "Me",
    last_name: user?.last_name || "",
    foto: user?.foto || user?.avatar_url || null,
  };

  // Fetch Messages
  useEffect(() => {
    if (!chatGroupId) return;

    const fetchMessages = async () => {
      setLoading(true);
      try {
        const data = await getMessagesByChatId(chatGroupId);
        if (data) {
          setMessages(data);
        }
      } catch (error) {
        console.error("Failed to load messages", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
    
    // Optional: Polling setup could go here
  }, [chatGroupId, getMessagesByChatId]);

  // Handle Send (Optimistic Update)
  const handleSend = (newMessage: MessageChat) => {
    console.log("Sending:", newMessage);
    setMessages((prev) => [...prev, newMessage]);
  };

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className={`flex flex-col h-screen ${isDark ? "bg-black" : "bg-white"}`}>
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-4 flex flex-col gap-2 mb-24 md:mb-28 scrollbar-hide">
        {loading ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 opacity-60">
             <p>No messages yet. Say hi!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble 
              key={msg.id_message || Math.random().toString()} 
              message={msg}
              isOwnMessage={msg.id_users === userId}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <ChatInputGroup
        onSend={handleSend}
        currentUser={currentUser}
      />
    </div>
  );
}
