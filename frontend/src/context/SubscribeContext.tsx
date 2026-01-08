import { useWallet } from "@/context/WalletContext";
import { createContext, useContext, useState } from "react";

type UUID = string;

export interface Subscribe {
    id: UUID;
    id_users: string;
    type_subscribe: string;
    subscribe: string;
    status_subscribe: string;
}

type SubscribeContextType = {
    subscribe: Subscribe | null;
    createSubscribe: () => Promise<void>;
    loading: boolean;
    success: boolean;
};

const SubscribeContext = createContext<SubscribeContextType | undefined>(undefined);

export const SubscribeProvider = ({ children }: { children: React.ReactNode }) => {
    const [subscribe, setSubscribe] = useState<Subscribe | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
   
    const { accessToken } = useWallet();

    const createSubscribe = async (Subscribe: Subscribe) => {
        try {
            setLoading(true);

            const res = await fetch("http://localhost:8000/api/subscribe", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
                },
                body: Subscribe,
            });

            if (!res.ok) {
                throw new Error("Failed to create subscribe");
            }

            const data: Subscribe = await res.json();
            setSubscribe(data);
            setSuccess(true);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SubscribeContext.Provider
            value={{
                subscribe,
                createSubscribe,
                loading,
                success,
            }}
        >
            {children}
        </SubscribeContext.Provider>
    );
};

export const useSubscribe = () => {
    const context = useContext(SubscribeContext);
    if (!context) {
        throw new Error("useSubscribe must be used within SubscribeProvider");
    }
    return context;
};
