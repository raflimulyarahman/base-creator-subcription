import { useWallet } from "@/context/WalletContext";
import { createContext, useContext, useState } from "react";
import { subscriptionManagerAbi } from "@/abi/SubscriptionManager";
import { useWriteContract } from "wagmi";
import { CONTRACT_ADDRESSES } from "@/config/contract";
type UUID = string;

export interface Subscribe {
  id_subscribe: UUID;
  id_users: string;
  type_subscribe: string;
  subscribe: string;
  status_subscribe: string;
}

type SubscribeContextType = {
  subscribe: Subscribe | null;
  createSubscribe: (payload: Omit<Subscribe, "id">) => Promise<Subscribe>;
  loading: boolean;
  success: boolean;
  setSuccess: React.Dispatch<React.SetStateAction<boolean>>;
  setSubscribe: React.Dispatch<React.SetStateAction<Subscribe | null>>;
};

const SubscribeContext = createContext<SubscribeContextType | undefined>(
  undefined
);

export const SubscribeProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { writeContractAsync } = useWriteContract();
  const [subscribe, setSubscribe] = useState<Subscribe | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  //const { accessToken } = useWallet();

   // creator create subscribe
  const createSubscribe = async (
    payload: Omit<Subscribe, "id_subscribe">
  ): Promise<Subscribe> => {
    setLoading(true);
    try {
      const res = await writeContractAsync({
        address: CONTRACT_ADDRESSES.SubscriptionManager,
        abi: subscriptionManagerAbi,
        functionName: "configureTiers",
        args: [
          BigInt("100000000000000"), // bronze
          BigInt("500000000000000"), // silver
          BigInt("1000000000000000"), // gold
        ],
      });
      console.log(res);
      const data: Subscribe = {
        id_subscribe: "dummy-id", 
        ...payload,
      };
      setSubscribe(data);
      setSuccess(true);
      return data; 
    } finally {
      setLoading(false);
    }
  };

  return (
    <SubscribeContext.Provider
      value={{
        subscribe,
        createSubscribe,
        success,
        loading,
        setSuccess,
        setSubscribe,
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
