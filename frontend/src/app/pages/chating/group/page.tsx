"use client";

import ChatInputGroup from "@/app/pages/chating/group/GroupInput";
import { useChatGroup } from "@/context/GroupChatContext";
import { useLight } from "@/context/LightContext";
import { MessageChat } from "@/context/MessageContext";
import { useSearchParams } from "next/navigation";

export default function GroupChating() {
  const searchParams = useSearchParams();
  const chatGroupId = searchParams.get("chatGroupId");
  const { isDark } = useLight();
  const { chatGroups } = useChatGroup();

  // ✅ CONTOH CURRENT USER (AMBIL DARI CONTEXT / AUTH)
  const currentUser = {
    id_users: "1",
    first_name: "John",
    last_name: "Doe",
    foto: null,
  };

  // ✅ HANDLE SEND DI PAGE
  const handleSend = (message: MessageChat) => {
    console.log("Optimistic message:", message);
    // nanti bisa push ke state message list
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-4 flex flex-col gap-3 mb-28">
        {/* chat bubbles */}
      </div>

      <ChatInputGroup
        onSend={handleSend}
        currentUser={currentUser}
      />
    </div>
  );
}
