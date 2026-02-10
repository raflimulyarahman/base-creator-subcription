
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY!;

export async function POST(request: NextRequest) {
  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
  
  try {
    const body = await request.json();
    const { id_personal_chat, id_users, message } = body;

    if (!id_personal_chat || !id_users || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Insert into 'messages' table
    // Assuming table 'messages' has columns: chat_id, sender_id, content
    const { data, error } = await supabase
      .from("messages")
      .insert({
        chat_id: id_personal_chat,
        sender_id: id_users,
        content: message,
      })
      .select()
      .single();

    if (error) {
        console.error("Supabase Insert Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Map back to frontend expectation
    const mappedMessage = {
        id_message: data.id,
        id_personal_chat: data.chat_id,
        id_users: data.sender_id,
        message: data.content,
        date: data.created_at,
        user: null // Fetched separately or handled by optimistic update
    };

    return NextResponse.json(mappedMessage);

  } catch (err) {
    console.error("API Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
