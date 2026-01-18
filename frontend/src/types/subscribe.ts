import { UUID } from "./uuid";

export interface Subscribe {
  id_subscribe: UUID;
  id_users: string;
  type_subscribe: string;
  subscribe: string;
  status_subscribe: string;
}

export type TierInfo = {
  addressCreator: string;
  tiersId: string;
  payTiers: string;
};

export type TierData = {
  name: string;
  price: number | bigint;
  duration: number;
  isActive: boolean;
};

export type SubscribePayload = {
  bronze: number;
  silver: number;
  gold: number;
};

export type AddressSubscribe = {
  id_subscribe: UUID;
  address: string;
};

export type SubscribeContextType = {
  subscribe: Subscribe | null;
  createSubscribe: (
    payload: Omit<Subscribe, "id_subscribe">,
  ) => Promise<Subscribe>;
  loading: boolean;
  success: boolean;
  setSuccess: React.Dispatch<React.SetStateAction<boolean>>;
  setSubscribe: React.Dispatch<React.SetStateAction<Subscribe | null>>;
  getSubscribeIdTier: (id_users: string) => Promise<AddressSubscribe | null>;
  paySubscribe: (payload: TierInfo) => Promise<TierInfo>;
  tiers: TierInfo[];
  setTiers: React.Dispatch<React.SetStateAction<TierInfo[]>>;
};
