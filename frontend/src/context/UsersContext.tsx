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
type UUID = string;
export interface User {
  id_users: UUID;
  address: { address: string };
  first_name: string;
  last_name: string;
  role: string;
}

export type UsersContextType = {
  user: User | null;
  usersAll: User[];
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setUsersAll: React.Dispatch<React.SetStateAction<User[]>>;
  fetchUserById: (userId: UUID) => Promise<User | null>;
  fetchUsersAll: () => Promise<User[]>;
  updateProfileUsers: (
    userId: UUID,
    formData: FormData
  ) => Promise<User | null>;
};

const UsersContext = createContext<UsersContextType | null>(null);

export function UsersProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [usersAll, setUsersAll] = useState<User[]>([]);
  const { userId, accessToken, sendRefreshToken } = useWallet();
  const { writeContractAsync } = useWriteContract();
  console.log(usersAll, "users");

  // fetch to requst id_users
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
          sendRefreshToken
        );
        console.log(res, "fetchid users");

        if (!res.ok) {
          console.log(`Fetch failed with status: ${res.status}`);
          return null;
        }
        const data = await res.json();
        return data?.data ?? null;
      } catch (err) {
        console.error("Error fetching user:", err);
        return null;
      }
    },
    [accessToken, sendRefreshToken]
  );

  // fetch to requst all users
  const fetchUsersAll = useCallback(async () => {
    try {
      if (!accessToken) return [];

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
        sendRefreshToken
      );
      return res.data;
    } catch (err) {
      console.error("Error fetching users:", err);
      return [];
    }
  }, [accessToken, sendRefreshToken]);

  // update user profile and wagmi register creator
  const updateProfileUsers = async (
    id: UUID,
    formData: FormData
  ): Promise<User | null> => {
    if (!accessToken || !sendRefreshToken) return null;

    try {

      const fullName = formData.get("first_name") + " " + formData.get("last_name");

      const username = formData.get("username") as string;
      const fotoFile = formData.get("foto") as File;
      const res = await writeContractAsync({
        address: CONTRACT_ADDRESSES.SubscriptionManager,
        abi: subscriptionManagerAbi,
        functionName: "registerCreator",
        args: [fullName, username, fotoFile],
      });

      if (res) {
      const data = await fetchWithAuth(
        `http://localhost:8000/api/users/${id}`,
        {
          method: "PUT",
          body: formData, // formData tidak perlu content-type, browser akan set otomatis
          credentials: "include",
        },
        accessToken,
        sendRefreshToken
      );

        console.log(data, "update profile");
      return data?.data ?? data ?? null;
      }
      return null;
    } catch (err) {
      console.error("updateProfileUsers error:", err);
      return null;
    }
  };

  //UseEffect GetUser Id
  useEffect(() => {
    const fetchData = async () => {
      if (!userId) {
        setUser(null);
        return;
      }

      const userData = await fetchUserById(userId);
      setUser(userData);
    };

    fetchData();
  }, [userId, accessToken, fetchUserById]);

  //UseEffect GetUser All
  useEffect(() => {
    if (accessToken) {
      fetchUsersAll()
        .then((users) => {
          console.log("Users fetched and updated:", users);
          setUsersAll(users);
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      console.log("No access token available.");
    }
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
