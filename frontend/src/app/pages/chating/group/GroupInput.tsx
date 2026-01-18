"use client";

import { useSearchParams } from "next/navigation";
import React, { useState, useRef, useEffect } from "react";
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
  const textareaRef = useRef<any>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"; // Reset tinggi
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`; // Sesuaikan dengan scroll height
      textareaRef.current.style.width = "auto"; // Reset lebar
      textareaRef.current.style.width = `${textareaRef.current.scrollWidth}px`; // Sesuaikan dengan scroll width
    }
  }, [message]); // Update saat message berubah

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
    <div className="fixed bottom-0 left-0 w-full px-4 py-2 bg-white shadow">
      <div className="flex max-w-2xl mx-auto gap-3 flex-col">
        {/* Textarea input */}
        <div className="relative w-full">
          <div className="relative flex items-center border rounded-lg">
            {/* Area input yang bisa diketik */}
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="w-full pl-10 px-4 py-2 rounded-lg resize-none overflow-hidden focus:outline-none focus:border-transparent"
              rows={1}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              disabled={loading}
            />

            {/* Tombol kirim dengan margin untuk memberi jarak */}
            {message.trim().length > 0 && (
              <button
                onClick={handleSend}
                disabled={loading}
                className="absolute bottom-2 right-2 rounded bg-black px-1 py-1 text-white sm:w-auto mt-2 mr-2"
              >
                {loading ? (
                  "Sending..."
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
                    />
                  </svg>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
