
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(request: NextRequest) {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    const body = await request.json();
    const { id_users } = body;

    if (!id_users) {
        return NextResponse.json([]);
    }

    // Fetch all chats where I am user1 OR user2
    const { data: chats, error } = await supabase
      .from("chat_personal")
      .select("*")
      .or(`user1_id.eq.${id_users},user2_id.eq.${id_users}`)
      .order("created_at", { ascending: false });

    if (error) {
        console.error("Fetch Chats Error:", error);
        return NextResponse.json([]);
    }

    if (!chats || chats.length === 0) return NextResponse.json([]);

    // Collect all 'other' user IDs to fetch their profiles
    const otherUserIds = chats.map(c => c.user1_id === id_users ? c.user2_id : c.user1_id);
    
    // Fetch profiles for these users
    const { data: users, error: userError } = await supabase
      .from("users")
      .select("*")
      .in("wallet_address", otherUserIds); // Assuming IDs are wallet addresses, based on previous context

    // Map profiles
    const userMap = new Map();
    if (users) {
        users.forEach(u => userMap.set(u.wallet_address, u));
        // Fallback: also index by `id` if they use that
        users.forEach(u => userMap.set(u.id, u));
    }

    // Format response
    const formattedChats = chats.map(chat => {
        const otherId = chat.user1_id === id_users ? chat.user2_id : chat.user1_id;
        const otherUser = userMap.get(otherId) || { username: "Unknown", first_name: "User", foto: null };
        
        return {
            id_chat_personal: chat.id,
            id_users1: chat.user1_id,
            id_users2: chat.user2_id,
            otherUser: {
                id_users: otherUser.id || otherId,
                username: otherUser.handle || otherUser.wallet_address?.slice(0,6),
                first_name: otherUser.name || otherUser.first_name || "User",
                last_name: "",
                foto: otherUser.avatar_url,
            }
        };
    });

    return NextResponse.json(formattedChats);

  } catch (err) {
    console.error("API Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
