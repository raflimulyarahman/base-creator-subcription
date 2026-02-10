import { createClient } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  
  // Use simple anon client for GET (Public Read)
  // We avoid passing the custom Auth header here to prevent potential client initialization errors with invalid tokens
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", params.id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  
  // Create authenticated client
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.replace("Bearer ", "");
  
  console.log(`[API PUT] Update User: ${params.id}`);
  
  // Custom Auth Check: Since we use Wallet Address -> ID mapping, the token IS the ID (from WalletContext)
  // We must verify the claim matches the target.
  if (!token || token !== params.id) {
      console.warn(`[API PUT] Unauthorized: Token ${token} does not match Target ${params.id}`);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Use Service Role to bypass RLS, because our custom "Token is ID" auth scheme isn't recognized by Supabase Auth
  const keyToUse = supabaseServiceRoleKey || supabaseAnonKey;
  if (!supabaseServiceRoleKey) {
      console.warn("[API PUT] WARNING: SUPABASE_SERVICE_ROLE_KEY not set. RLS might block this update.");
  }

  const supabase = createClient(supabaseUrl, keyToUse, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    }
  });

  try {
    const body = await request.json();
    console.log("[API PUT] Body:", JSON.stringify(body));
    const { name, username, avatar_url } = body;

    const { data, error } = await supabase
      .from("users")
      .update({ name, handle: username, avatar_url })
      .eq("id", params.id)
      .select();

    if (error) {
      console.error("[API PUT] Supabase Update Error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!data || data.length === 0) {
        console.warn("[API PUT] No records updated. User not found or RLS blocked.");
        return NextResponse.json({ error: "User not found or permission denied" }, { status: 404 });
    }

    console.log("[API PUT] Update Success:", data[0]);
    return NextResponse.json({ data: data[0] });
  } catch (err) {
    console.error("[API PUT] Unexpected Error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
