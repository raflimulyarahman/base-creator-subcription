import { useWallet } from "@/context/WalletContext";
import { fetchWithAuth } from "@/store/fetchWithAuth";
import {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
} from "react";

type UUID = string;

// Chat Group object
export interface ChatGroup {
  id_group_chat: UUID;
  id_users: string; // User ID of the creator or other relevant users
  name_group: string;
  foto: string; // Group's photo URL
}

// Context type
type ChatGroupContextType = {
  createChatGroup: (
    payload: Omit<ChatGroup, "id_group_chat">,
  ) => Promise<ChatGroup>;
  loading: boolean;
  success: boolean;
};

// Context
const ChatGroupContext = createContext<ChatGroupContextType | undefined>(
  undefined,
);

// Provider
export const ChatGroupProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { accessToken, sendRefreshToken } = useWallet();

  // Create Chat Group function wrapped in useCallback
  const createChatGroup = useCallback(
    async (formData: FormData): Promise<ChatGroup | null> => {
      if (!accessToken || !sendRefreshToken) return null;
      setLoading(true);
      setSuccess(false);

      try {
        const data = await fetchWithAuth(
          `http://localhost:8000/api/group/`,
          {
            method: "POST", // Change to POST for creating new chat group
            body: formData,
            credentials: "include",
          },
          accessToken,
          sendRefreshToken,
        );

        if (data) {
          setSuccess(true); // Set success to true on successful response
          return data.groupChat; // Assuming the response contains the groupChat object
        }
      } catch (error) {
        console.error("Error creating group chat:", error);
        setSuccess(false); // Set success to false if there's an error
      } finally {
        setLoading(false); // Always stop loading when done
      }
      return null;
    },
    [accessToken, sendRefreshToken],
  );

  const getChatGroup = useCallback(
    async (id_users: string) => {
      try {
        const chat = await fetchWithAuth(
          `http://localhost:8000/api/group/getHeaderGroup`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(accessToken
                ? { Authorization: `Bearer ${accessToken}` }
                : {}),
            },
            body: JSON.stringify({ id_users }),
          },
          accessToken,
          sendRefreshToken,
        );

        console.log(chat);

        return chat; // ✅ INI YANG KURANG
      } catch (err) {
        console.error("Error fetching chat header:", err);
        return null;
      }
    },
    [accessToken, sendRefreshToken],
  );

  const value = useMemo(
    () => ({
      createChatGroup,
      getChatGroup,
      loading,
      success,
    }),
    [createChatGroup, getChatGroup, loading, success], // Only memoize value when createChatGroup, loading, or success change
  );

  return (
    <ChatGroupContext.Provider value={value}>
      {children}
    </ChatGroupContext.Provider>
  );
};

// Hook
export const useChatGroup = () => {
  const context = useContext(ChatGroupContext);
  if (!context)
    throw new Error("useChatGroup must be used within ChatGroupProvider");
  return context;
};
