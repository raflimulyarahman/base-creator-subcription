
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY!;

export async function POST(request: NextRequest) {
  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  try {
    const body = await request.json();
    const { id_users1, id_users2 } = body;

    if (!id_users1 || !id_users2) {
      return NextResponse.json({ error: "Missing user IDs" }, { status: 400 });
    }

    // Check if chat already exists (in either direction)
    const { data: existingChat, error: fetchError } = await supabase
      .from("chat_personal")
      .select("*")
      .or(`and(user1_id.eq.${id_users1},user2_id.eq.${id_users2}),and(user1_id.eq.${id_users2},user2_id.eq.${id_users1})`)
      .maybeSingle();

    if (existingChat) {
        return NextResponse.json({ 
            data: {
                id_chat_personal: existingChat.id,
                id_users1: existingChat.user1_id,
                id_users2: existingChat.user2_id
            }
        });
    }

    // If not, create new one
    const { data: newChat, error: insertError } = await supabase
      .from("chat_personal")
      .insert({
        user1_id: id_users1,
        user2_id: id_users2
      })
      .select()
      .single();

    if (insertError) {
        console.error("Create Chat Error:", insertError);
        return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ 
        data: {
            id_chat_personal: newChat.id,
            id_users1: newChat.user1_id,
            id_users2: newChat.user2_id
        }
    });

  } catch (err) {
    console.error("API Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
