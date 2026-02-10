import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  try {
    const body = await request.json();
    console.log("SUBSCRIBE API BODY:", body);
    
    // Structure from SubscribeContext: { subscibe: { id_creator, id_users, type_subscribe } }
    // Note: 'subscibe' typo in context, handle it carefully
    const { id_creator, id_users, type_subscribe } = body.subscibe || body; 

    if (!id_creator || !id_users || !type_subscribe) {
        console.error("Missing fields:", { id_creator, id_users, type_subscribe });
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("subscriptions")
      .insert({
        creator_id: id_creator,
        user_id: id_users,
        tier_name: type_subscribe,
        status: "Done"
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase Subscription Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);

  } catch (err) {
    console.error("Subscription API Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
