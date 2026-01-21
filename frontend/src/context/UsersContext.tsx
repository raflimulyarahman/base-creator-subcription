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

import { User, UsersContextType } from "@/types";

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
          `http://localhost:8000/api/users/${userId}`,
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
    if (!accessToken) return [];
    try {
      const res = await fetchWithAuth(
        "http://localhost:8000/api/users",
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        },
        accessToken,
        sendRefreshToken,
      );
      return res.data ?? [];
    } catch (err) {
      console.error("fetchUsersAll error:", err);
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
        formData.get("first_name") + " " + formData.get("last_name");
      const username = formData.get("username") as string;
      const fotoFile = formData.get("foto") as File;
      console.log(fotoFile.name, "ini file");
      //Smart contract registration
      const res = await writeContractAsync({
        address: CONTRACT_ADDRESSES.SubscriptionManager,
        abi: subscriptionManagerAbi,
        functionName: "registerCreator",
        args: [fullName, username, fotoFile.name, 1000000000n],
      });

      if (!res) return null;

      // Backend update
      const data = await fetchWithAuth(
        `http://localhost:8000/api/users/${id}`,
        {
          method: "PUT",
          body: formData,
          credentials: "include",
        },
        accessToken,
        sendRefreshToken,
      );

      const updatedUser = data?.data ?? null;
      console.log("updateProfileUsers: updatedUser", updatedUser);
      console.log("updateProfileUsers: role from response", data?.role);

      // Set role baru di WalletContext
      if (data?.role) {
        const normalizedRole =
          data.role.toLowerCase() === "creators" ? "Creators" : "Users";
        console.log("updateProfileUsers: setting role to", normalizedRole);
        setRole(normalizedRole);
      }

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
          `http://localhost:8000/api/users/${id}`,
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
    if (accessToken) fetchUsersAll().then(setUsersAll);
  }, [accessToken, fetchUsersAll]);

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
