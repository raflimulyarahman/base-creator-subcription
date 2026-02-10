
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  try {
    const body = await request.json();
    const { id_users } = body;

    // Check query param if body is empty (fallback)
    // But context sends body: { id_users }

    if (!id_users) {
        return NextResponse.json({ error: "Missing id_users" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", id_users)
      .eq("status", "Done");

    if (error) {
        console.error("Supabase Get Subscriptions Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Map to frontend expected format
    const mappedData = data.map(sub => ({
        id_subscribe: sub.id,
        id_creator: sub.creator_id,
        id_users: sub.user_id,
        type_subscribe: sub.tier_name,
        status_subscribe: sub.status
    }));

    return NextResponse.json({ data: mappedData });

  } catch (err) {
    console.error("Get Subscription API Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
