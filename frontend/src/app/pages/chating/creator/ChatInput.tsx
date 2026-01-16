"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useMessageChat, MessageChat } from "@/context/MessageContext";

type Props = {
  onSend: (message: MessageChat) => void;
  currentUser: {
    id_users: string;
    first_name: string;
    last_name: string;
    foto: string | null;
  };
};

export default function ChatInput({ onSend, currentUser }: Props) {
  const [message, setMessage] = useState("");
  const { createMessageChat, loading } = useMessageChat();
  const searchParams = useSearchParams();
  const chatId = searchParams.get("chatId");

  const handleSend = async () => {
    if (!message.trim() || !chatId) return;

    // 🔥 OPTIMISTIC MESSAGE (PAKAI FOTO DARI PAGE)
    const optimisticMessage: MessageChat = {
      id_message: crypto.randomUUID(),
      id_personal_chat: chatId,
      id_users: currentUser.id_users,
      message: message.trim(),
      date: new Date().toISOString(),
      user: {
        id_users: currentUser.id_users,
        first_name: currentUser.first_name,
        last_name: currentUser.last_name,
        foto: currentUser.foto,
      },
    };

    onSend(optimisticMessage);
    setMessage("");

    try {
      await createMessageChat({
        id_personal_chat: chatId,
        id_users: currentUser.id_users,
        message: optimisticMessage.message,
      });
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 w-full px-4 py-3 bg-white shadow">
      <div className="flex max-w-2xl mx-auto gap-3">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 rounded-full border focus:ring-2 focus:ring-blue-400"
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          disabled={loading}
        />
        <button
          onClick={handleSend}
          disabled={loading}
          className="px-4 py-2 rounded-full bg-blue-500 text-white"
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}
