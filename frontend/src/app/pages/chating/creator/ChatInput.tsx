"use client";

import { MessageChat, useMessageChat } from "@/context/MessageContext";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type Props = {
  onSend: (message: MessageChat) => void;
  currentUser: {
    id_users: string;
    first_name: string;
    last_name: string;
    foto: string | null | undefined;
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
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 py-3 pb-6 bg-white dark:bg-black shadow border-x border-gray-100 dark:border-gray-800 z-50">
      <div className="flex flex-col gap-3 w-full mx-auto">
        <div className="relative w-full">
          <div className="relative w-full bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center border border-gray-200 dark:border-gray-700">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Message ..."
              className="flex-1 pr-12 pl-4 rounded-xl py-3 resize-none focus:outline-none bg-transparent text-gray-900 dark:text-white placeholder-gray-500"
              rows={1}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              disabled={loading}
            />
            {message.trim().length > 0 && (
              <button
                onClick={handleSend}
                disabled={loading}
                className="absolute right-2 bottom-2 rounded-xl bg-blue-600 px-3 py-1.5 text-white shadow-sm hover:bg-blue-700 transition"
              >
                {loading ? (
                  "..."
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
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
