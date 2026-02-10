"use client";

import { subscriptionManagerAbi } from "@/abi/SubscriptionManager";
import { CONTRACT_ADDRESSES } from "@/config/contract";
import { useWallet } from "@/context/WalletContext";
import { fetchWithAuth } from "@/store/fetchWithAuth";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useWriteContract } from "wagmi";

import { User, UsersContextType, UUID } from "@/types";

const UsersContext = createContext<UsersContextType | null>(null);

export function UsersProvider({ children }: { children: ReactNode }) {
  const { userId, accessToken, sendRefreshToken, setRole } = useWallet();
  const [user, setUser] = useState<User | null>(null);
  const [usersAll, setUsersAll] = useState<User[]>([]);
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const { writeContractAsync } = useWriteContract();
  const fetchUserById = useCallback(
    async (userId: string) => {
      if (!userId) return null;

      try {
        const res = await fetchWithAuth(
          `/api/users/${userId}`,
          {
            credentials: "include",
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
        return res.data?.data ?? res.data ?? null;
      } catch (err) {
        console.error("fetchUserById error:", err);
        return null;
      }
    },
    [accessToken, sendRefreshToken],
  );

  const fetchUsersAll = useCallback(async () => {
    // Attempt fetch even without token (for public feed)
    try {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      
      if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
      }

      const res = await fetchWithAuth(
        "/api/users",
        {
          credentials: "include",
          headers,
        },
        accessToken,
        sendRefreshToken,
      );
      return res.data ?? [];
    } catch (err) {
      console.error("fetchUsersAll error:", err);
      // Fallback - maybe return empty or handle error
      return [];
    }
  }, [accessToken, sendRefreshToken]);

  const updateProfileUsers = async (
    id: UUID,
    formData: FormData,
  ): Promise<User | null> => {
    if (!accessToken || !sendRefreshToken) return null;
    try {
      const fullName =
        (formData.get("first_name") + " " + formData.get("last_name")).trim();
      const username = formData.get("username") as string;
      const fotoFile = formData.get("foto") as File;
      console.log(fotoFile?.name, "ini file");
      
      // Removed smart contract registration from here - should be in registerCreator flow only
      // If user is just updating profile, we don't register them as creator again

      // Backend update (Next.js API)
      const data = await fetchWithAuth(
        `/api/users/${id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            name: fullName,
            username: username,
            avatar_url: formData.get("avatar_url"), // Use URL for now as per plan
          }),
          headers: {
            "Content-Type": "application/json", // Changed to JSON for Next.js API
          },
          credentials: "include",
        },
        accessToken,
        sendRefreshToken,
      );

      const updatedUser = data?.data ?? null;
      console.log("updateProfileUsers: updatedUser", updatedUser);
      
      setUser(updatedUser);
      return updatedUser;
    } catch (err) {
      console.error("updateProfileUsers error:", err);
      return null;
    }
  };

  const getProfileUserById = useCallback(
    async (id: string) => {
      try {
        const data = await fetchWithAuth(
          `/api/users/${id}`,
          {
            credentials: "include",
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
        return data?.data ?? null;
      } catch (err) {
        console.error("getProfileUserById error:", err);
        return null;
      }
    },
    [accessToken, sendRefreshToken],
  );

  // Sync user on userId change
  useEffect(() => {
    if (!userId) return setUser(null);
    fetchUserById(userId).then(setUser);
  }, [userId, fetchUserById]);

  useEffect(() => {
    fetchUsersAll().then(setUsersAll);
  }, [fetchUsersAll]);

  return (
    <UsersContext.Provider
      value={{
        user,
        usersAll,
        setUser,
        setUsersAll,
        fetchUserById,
        fetchUsersAll,
        updateProfileUsers,
        profileUser,
        getProfileUserById,
        setProfileUser,
      }}
    >
      {children}
    </UsersContext.Provider>
  );
}

export const useUsers = () => {
  const ctx = useContext(UsersContext);
  if (!ctx) throw new Error("useUsers must be used within UsersProvider");
  return ctx;
};
