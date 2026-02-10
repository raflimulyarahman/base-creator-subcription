
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ 
    id_group_chat: "mock", 
    name_group: "Mock Group",
    members: [] 
  });
}
