import { useWallet } from "@/context/WalletContext";
import { fetchWithAuth } from "@/store/fetchWithAuth";
import { useSearchParams } from "next/navigation";
import {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  useEffect,
} from "react";

import { ChatGroup, ChatGroupContextType } from "@/types";

const ChatGroupContext = createContext<ChatGroupContextType | undefined>(
  undefined,
);

export const ChatGroupProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { accessToken, sendRefreshToken, userId } = useWallet();
  const [chatGroups, setChatGroups] = useState<any[]>([]);
  const [headerchatGroups, setheaderchatGroups] = useState<{
    group: ChatGroup | null;
    members: any[];
  }>({
    group: null,
    members: [],
  });
  const searchParams = useSearchParams();
  const chatGroupId = searchParams.get("chatGroupId");

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
            method: "POST",
            body: formData,
            credentials: "include",
          },
          accessToken,
          sendRefreshToken,
        );

        console.log("Response data:", data); 

        if (data) {
          const { groupChat, admin, members } = data;

          const updatedMembers = members?.map((member) => ({
            ...member,
            user: member.user || { username: "Unknown Creator" }, 
          }));

          const updatedGroup = {
            ...groupChat,
            admin, 
            members: updatedMembers,
          };

          console.log(updatedGroup);
          setChatGroups((prev) => {
            const updatedGroups = [updatedGroup, ...prev];
            return updatedGroups; 
          });

          setSuccess(true);
          return updatedGroup; 
        }
      } catch (error) {
        console.error("Error creating group chat:", error);
        setSuccess(false);
      } finally {
        setLoading(false);
      }
      return null;
    },
    [accessToken, sendRefreshToken],
  );

  const getChatGroup = useCallback(
    async (id_users: string) => {
      try {
        const groups = await fetchWithAuth(
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

        setChatGroups((prev) => {
          const map = new Map(prev.map((g) => [g.id_group_chat, g]));
          groups.forEach((g) => map.set(g.id_group_chat, g));
          return Array.from(map.values());
        });

        setChatGroups(groups);
        return groups;
      } catch (err) {
        console.error("Error fetching chat group:", err);
        setChatGroups([]);
        return [];
      }
    },
    [accessToken, sendRefreshToken],
  );

  const getChatGroupId = useCallback(
    async (id_group_chat: string) => {
      try {
        const response = await fetchWithAuth(
          `http://localhost:8000/api/group/${id_group_chat}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              ...(accessToken
                ? { Authorization: `Bearer ${accessToken}` }
                : {}),
            },
          },
          accessToken,
          sendRefreshToken,
        );
        console.log(response, "Group data fetched successfully");

        return response; 
      } catch (e) {
        console.error("Error fetching group: ", e);
      }
    },
    [accessToken, sendRefreshToken], 
  );

  useEffect(() => {
    if (userId && chatGroupId) {
      const fetchGroupData = async () => {
        try {
          const headerGroup = await getChatGroupId(chatGroupId);
          setheaderchatGroups(headerGroup);
        } catch (error) {
          console.error("Error fetching group data:", error);
        }
      };
      fetchGroupData();
    }
  }, [userId, chatGroupId, getChatGroupId]);

  useEffect(() => {
    if (userId && chatGroups.length === 0) {
      const fetchGroups = async () => {
        await getChatGroup(userId);
      };

      fetchGroups();
    }
  }, [userId, chatGroups.length, getChatGroup]);

  const value = useMemo(
    () => ({
      createChatGroup,
      getChatGroup,
      headerchatGroups,
      chatGroups,
      loading,
      success,
    }),
    [
      createChatGroup,
      getChatGroup,
      headerchatGroups,
      chatGroups,
      loading,
      success,
    ],
  );

  return (
    <ChatGroupContext.Provider value={value}>
      {children}
    </ChatGroupContext.Provider>
  );
};

export const useChatGroup = () => {
  const context = useContext(ChatGroupContext);
  if (!context)
    throw new Error("useChatGroup must be used within ChatGroupProvider");
  return context;
};
