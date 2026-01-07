"use client";
import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";

import { useWallet } from "@/context/WalletContext";

type UUID = string;

interface User {
    id: UUID;
    address: string;
    role: string;
}

type UsersContextType = {
    user: User | null;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    fetchUserById: (userId: UUID) => Promise<User | null>;
};

const UsersContext = createContext<UsersContextType | null>(null);

export function UsersProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const { userId, accessToken } = useWallet();
    console.log(userId, accessToken);
    const fetchUserById = async (userId: UUID) => {
    try {
        const res = await fetch(`http://localhost:8000/api/users/${userId}`, {
            method: "GET",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                ...(accessToken ? { "Authorization": `Bearer ${accessToken}` } : {}),
            },
        });

        if (!res.ok) throw new Error("Failed to fetch user");

        return await res.json();
    } catch (error) {
        console.error("Fetch user error:", error);
        return null;
    }
};


    useEffect(() => {
        if (!userId) {
            setUser(null);
            return;
        }

        const fetchUser = async () => {
            const res = await fetchUserById(userId);
            setUser(res);
        };

        fetchUser();
    }, [userId]);

    return (
        <UsersContext.Provider
            value={{
                user,
                setUser,
                fetchUserById,
            }}
        >
            {children}
        </UsersContext.Provider>
    );
}

export const useUsers = () => {
    const context = useContext(UsersContext);
    if (!context) {
        throw new Error("useUsers must be used within a UsersProvider");
    }
    return context;
};
