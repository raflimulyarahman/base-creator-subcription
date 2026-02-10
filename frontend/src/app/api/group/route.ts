
import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ 
    groupChat: { id: "mock_group_1", name: "Mock Group" },
    admin: { id: "mock_admin_1" },
    members: [] 
  });
}
