import { UUID } from "./uuid";

export interface User {
  id?: string;
  id_users?: UUID; 
  address?: { address: string };
  wallet_address?: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  handle?: string;
  username?: string;
  role?: string;
  foto?: string;
  avatar_url?: string;
}

export type UsersContextType = {
  user: User | null;
  usersAll: User[];
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setUsersAll: React.Dispatch<React.SetStateAction<User[]>>;
  profileUser: User | null;
  setProfileUser: React.Dispatch<React.SetStateAction<User | null>>;
  fetchUserById: (userId: UUID) => Promise<User | null>;
  fetchUsersAll: () => Promise<User[]>;
  updateProfileUsers: (
    userId: UUID,
    formData: FormData,
  ) => Promise<User | null>;
  getProfileUserById: (id: string) => Promise<User | null>;
};
