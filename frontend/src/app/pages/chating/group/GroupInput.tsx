"use client";

import ModalContentExlusive from "@/components/Modal/ModalContentExlusive";
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

export default function ChatInputGroup({
  onSend,
  currentUser,
}: Props) {

  const [message, setMessage] = useState("");
  const { createMessageChat, loading } = useMessageChat();
  const searchParams = useSearchParams();
  const chatId = searchParams.get("chatGroupId"); // ⬅️ ini group
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [openModalContent, setOpenModalContent] = useState(false);

  const handleModalCloseExlusive = () => setOpenModalContent(false);
  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height =
      textareaRef.current.scrollHeight + "px";
  }, [message]);

  const handleSend = async () => {
    if (!message.trim() || !chatId) return;

    const optimisticMessage: MessageChat = {
      id_message: crypto.randomUUID(),
      id_personal_chat: chatId,
      id_users: currentUser.id_users,
      message: message.trim(),
      date: new Date().toISOString(),
      user: currentUser,
    };

    onSend(optimisticMessage);
    setMessage("");

    await createMessageChat({
      id_personal_chat: chatId,
      id_users: currentUser.id_users,
      message: optimisticMessage.message,
    });
  };

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-2xl bg-white shadow px-4 py-2 border-x border-gray-100 dark:border-gray-800">
      <div className="w-full mx-auto">
        <div className="flex items-center gap-2 bg-gray-200 rounded-xl px-3">
          <button
            onClick={() => setOpenModalContent(true)}
            type="button"
            className="flex items-center justify-center text-gray-600 hover:text-black transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-7 h-7"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
          </button>
          <div className="relative flex-1">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Message ..."
              rows={1}
              disabled={loading}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              className="
        w-full
        px-4
        py-3
        pr-12
        rounded-xl
        bg-gray-200
        resize-none
        overflow-hidden
        focus:outline-none
      "
            />
            {message.trim() && (
              <button
                onClick={handleSend}
                disabled={loading}
                className="
      absolute
      right-2
      bottom-2
      flex
      items-center
      justify-center
      bg-black
      text-white
      rounded
      p-1.5
      hover:bg-gray-800
      transition
    "
              >
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
                    d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12
           59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
                  />
                </svg>
              </button>
            )}
          </div>
          {openModalContent && (
            <ModalContentExlusive onCloseContentExlusive={handleModalCloseExlusive} />
          )}
        </div>
      </div>
    </div>
  );
}

