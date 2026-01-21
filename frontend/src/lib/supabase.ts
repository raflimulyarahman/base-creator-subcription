import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database tables
export interface User {
  id: string;
  wallet_address: string;
  role: "user" | "creator" | "admin";
  handle?: string;
  name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Creator {
  id: string;
  user_id: string;
  handle: string;
  name?: string;
  profile_uri?: string;
  follower_count?: number;
  is_active: boolean;
  created_at: string;
}
