import { UUID } from "./uuid";

export interface Subscribe {
  id_subscribe: UUID;
  id_creator: string;
  id_users: string;
  id_token: number;
  type_subscribe: string;
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
  duration: number | bigint;
  isActive: boolean;
  id?: bigint;
};

export type SubscribePayload = {
  bronze: number;
  silver: number;
  gold: number;
};

export type AddressSubscribe = {
  id_subscribe: UUID;
  address: string;
  tiers: TierData[];
};

export type PaySubscribePayload = {
  id_creator: string;
  id_users: string;
  type_subscribe: string;
  tiersId: bigint;
  price: bigint;
  addressCreator: string;
  userAddress: string;
};

export type SubscribeContextType = {
  subscribe: Subscribe | null;
  createSubscribe: (payload: SubscribePayload) => Promise<any>;
  loading: boolean;
  success: boolean;
  setSuccess: React.Dispatch<React.SetStateAction<boolean>>;
  setSubscribe: React.Dispatch<React.SetStateAction<Subscribe | null>>;
  getSubscribeIdTier: (id_users: string) => Promise<AddressSubscribe | null>;
  paySubscribe: (payload: PaySubscribePayload) => Promise<{ tokenId: bigint | null }>;
  tiers: TierData[];
  setTiers: React.Dispatch<React.SetStateAction<TierData[]>>;
  getSubscribeIdUsers: (id_users: string) => Promise<Subscribe | null>;
  getSubscribeUserIdProfile: (id_users: string) => Promise<Subscribe[]>;
  subscribedata: Subscribe[];
  setSubscribedata: React.Dispatch<React.SetStateAction<Subscribe[]>>;
  subUsersId: Subscribe[] | undefined;
  setSubUsersId: React.Dispatch<React.SetStateAction<Subscribe[] | undefined>>;
};

