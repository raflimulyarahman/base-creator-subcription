
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY!;

export async function POST(request: NextRequest) {
  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  try {
    const body = await request.json();
    const { id_personal_chat } = body;

    if (!id_personal_chat) {
        return NextResponse.json({ messages: [] });
    }

    // Fetch messages for this chat (Raw query, no join to avoid FK missing errors)
    const { data: messagesData, error } = await supabase
      .from("messages")
      .select("*")
      .eq("chat_id", id_personal_chat)
      .order("created_at", { ascending: true });

    if (error) {
        console.error("Supabase Fetch Error:", error);
        return NextResponse.json({ messages: [] });
    }

    if (!messagesData || messagesData.length === 0) {
        return NextResponse.json({ messages: [] });
    }

    // Manual Join: Fetch senders
    const senderIds = Array.from(new Set(messagesData.map((m: any) => m.sender_id)));
    
    // Attempt to fetch users by wallet_address (assuming sender_id is wallet) or id
    // Since we don't know for sure which column sender_id matches, we can try matching wallet_address first
    // Note: User's schema for 'users' typically has 'wallet_address'.
    const { data: usersData, error: userError } = await supabase
        .from("users")
        .select("*")
        .in("wallet_address", senderIds);

    const userMap = new Map();
    if (usersData) {
        usersData.forEach((u: any) => userMap.set(u.wallet_address, u));
    }

    // Map to frontend structure
    const messages = messagesData.map((msg: any) => {
        const user = userMap.get(msg.sender_id);
        return {
            id_message: msg.id,
            id_personal_chat: msg.chat_id,
            id_users: msg.sender_id,
            message: msg.content,
            date: msg.created_at,
            user: user 
                ? {
                    id_users: user.id,
                    first_name: user.name || user.first_name || "User",
                    last_name: "",
                    foto: user.avatar_url,
                    username: user.handle
                  } 
                : null
        };
    });

    return NextResponse.json({ messages });

  } catch (err) {
    console.error("API Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
