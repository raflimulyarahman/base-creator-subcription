import { MessageChat } from "@/context/MessageContext";
import { useLight } from "@/context/LightContext";
import Image from "next/image";

interface MessageBubbleProps {
  message: MessageChat;
  isOwnMessage: boolean;
}

export default function MessageBubble({ message, isOwnMessage }: MessageBubbleProps) {
  const { isDark } = useLight();
  
  // Format date
  let timeString = "";
  try {
      const date = new Date(message.date);
      timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (e) {
      timeString = "--:--";
  }

  const userAvatar = message.user?.foto || message.user?.avatar_url || "/11789135.png";
  const senderName = message.user?.name || message.user?.first_name || message.user?.username || "Unknown";

  return (
    <div className={`flex w-full ${isOwnMessage ? "justify-end" : "justify-start"} mb-4`}>
      {/* Avatar for other users */}
      {!isOwnMessage && (
        <div className="flex-shrink-0 mr-2 mt-auto">
          <Image
            src={userAvatar}
            alt="Avatar"
            width={32}
            height={32}
            className="rounded-full w-8 h-8 object-cover border border-gray-200 dark:border-gray-700"
            unoptimized
          />
        </div>
      )}

      {/* Bubble */}
      <div 
        className={`max-w-[75%] px-4 py-2 rounded-2xl shadow-sm relative ${
          isOwnMessage 
            ? "bg-blue-600 text-white rounded-br-none" 
            : `${isDark ? "bg-gray-800 text-gray-100" : "bg-white text-gray-800"} border border-gray-100 dark:border-gray-700 rounded-bl-none`
        }`}
      >
        {/* Name for others in groups */}
        {!isOwnMessage && (
            <p className={`text-[10px] font-bold mb-0.5 opacity-70 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                {senderName}
            </p>
        )}
        
        <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
          {message.message}
        </p>
        
        <span className={`text-[10px] block text-right mt-1 opacity-70 ${
            isOwnMessage ? "text-blue-100" : "text-gray-400"
        }`}>
            {timeString}
        </span>
      </div>
    </div>
  );
}
