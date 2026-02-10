
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ 
    chat: { id_chat_personal: "mock_chat" },
    otherUser: { name: "Mock User" }
  });
}
