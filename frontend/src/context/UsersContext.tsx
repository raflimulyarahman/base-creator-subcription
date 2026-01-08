"use client";
import { useWallet } from "@/context/WalletContext";
import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";

type UUID = string;

interface User {
  id: UUID;
  address: string;
  role: string;
}

type UsersContextType = {
  user: User | null;
  usersAll: User[];
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setUsersAll: React.Dispatch<React.SetStateAction<User[]>>;
  fetchUserById: (userId: UUID) => Promise<User | null>;
  fetchUsersAll: () => Promise<User[]>;
    updateProfileUsers: (userId: UUID) => Promise<User | null>;
};

const UsersContext = createContext<UsersContextType | null>(null);

export function UsersProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [usersAll, setUsersAll] = useState<User[]>([]);
  const { userId, accessToken } = useWallet();

  const fetchUserById = async (userId: UUID): Promise<User | null> => {
    try {
      const res = await fetch(`http://localhost:8000/api/users/${userId}`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });

      if (!res.ok) throw new Error("Failed to fetch user");
      const data = await res.json();
      return data.data ?? data;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  const fetchUsersAll = async (): Promise<User[]> => {
    try {
      const res = await fetch("http://localhost:8000/api/users", {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });

        console.log("fetchUsersAll status:", res.status);
      const data = await res.json();
      return data.data ?? [];
    } catch (err) {
      console.error(err);
      return [];
    }
  };

    const updateProfileUsers = async (userId: UUID, formData: FormData): Promise<User | null> => {
        try {
            const res = await fetch(`http://localhost:8000/api/users/${userId}`, {
                credentials: "include",
                method: "PUT",
                headers: {
                    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
                },
                body: formData,
            });

            const text = await res.text(); // read raw response

            if (!res.ok) throw new Error(`Failed to update user: ${res.status}`);
            const data = JSON.parse(text);
            return data.data ?? null;
        } catch (err) {
            console.error(err);
            return null;
        }
    };




  // 🔹 fetch current user
  useEffect(() => {
    if (!userId) {
      setUser(null);
      return;
    }

    fetchUserById(userId).then(setUser);
  }, [userId, accessToken]);

  // 🔹 fetch all users
  useEffect(() => {
    fetchUsersAll().then(setUsersAll);
  }, [accessToken]);

  return (
    <UsersContext.Provider
      value={{
        user,
        usersAll,
        setUser,
        setUsersAll,
        fetchUserById,
        fetchUsersAll,
              updateProfileUsers
      }}
    >
      {children}
    </UsersContext.Provider>
  );
}

export const useUsers = () => {
  const ctx = useContext(UsersContext);
  if (!ctx) {
    throw new Error("useUsers must be used within UsersProvider");
  }
  return ctx;
};
