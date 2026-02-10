"use client";

export const dynamic = "force-dynamic";

import { MessageChat, useMessageChat } from "@/context/MessageContext";
import { useWallet } from "@/context/WalletContext";
import { useUsers } from "@/context/UsersContext";
import { useLight } from "@/context/LightContext";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, Suspense } from "react";
import ChatInput from "./ChatInput";
import MessageBubble from "@/components/Message/MessageBubble";

function CreatorChatContent() {
  const searchParams = useSearchParams();
  const chatId = searchParams.get("chatId");
  const { getMessagesByChatId } = useMessageChat();
  const { userId } = useWallet();
  const { user } = useUsers();
  const { isDark } = useLight();

  const [messages, setMessages] = useState<MessageChat[]>([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!chatId) return;
    setLoading(true);
    (async () => {
      try {
        const data = await getMessagesByChatId(chatId);
        if (data) setMessages(data);
      } finally {
        setLoading(false);
      }
    })();
  }, [chatId, getMessagesByChatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Current User Identity
  const currentUser = {
    id_users: userId || "",
    first_name: user?.first_name || "Me",
    last_name: user?.last_name || "",
    foto: user?.foto || user?.avatar_url || null,
  };

  return (
    <div className={`flex flex-col h-full ${isDark ? "bg-black" : "bg-white"}`}>
      {/* CHAT LIST */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-4 pt-20 flex flex-col gap-2 mb-20 scrollbar-hide">
        {loading ? (
          <div className="flex justify-center items-center h-full text-gray-500">Loading messages...</div>
        ) : messages.length ? (
          messages.map((msg) => (
            <MessageBubble 
              key={msg.id_message || Math.random()} 
              message={msg} 
              isOwnMessage={msg.id_users === userId} 
            />
          ))
        ) : (
          <p className="text-center text-gray-400 mt-4">No messages yet.</p>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* CHAT INPUT */}
      <ChatInput
        currentUser={currentUser}
        onSend={(newMessage) => {
          setMessages((prev) => [...prev, newMessage]);
        }}
      />
    </div>
  );
}

export default function CreatorChating() {
  return (
    <Suspense fallback={<div>Loading chat...</div>}>
      <CreatorChatContent />
    </Suspense>
  );
}
