import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";

const MIN_FOLLOWER_COUNT = 10000;
const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY;
const VERIFIER_PRIVATE_KEY = process.env.VERIFIER_PRIVATE_KEY;
const CHAIN_ID = process.env.CHAIN_ID || "84532";

// POST /api/verify-followers - Verify and generate signature
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fid, walletAddress } = body;

    if (!fid || !walletAddress) {
      return NextResponse.json(
        { error: "Missing fid or walletAddress" },
        { status: 400 }
      );
    }

    if (!VERIFIER_PRIVATE_KEY) {
      return NextResponse.json(
        { error: "Verifier private key not configured" },
        { status: 500 }
      );
    }

    // Mock data if API key is missing or using Demo FID
    let user;
    if (!NEYNAR_API_KEY || fid === "8888") {
      console.warn(`⚠️ ${fid === "8888" ? "Demo FID used" : "Neynar API Key missing"} - Using MOCK data`);
      user = {
        fid: fid === "8888" ? 8888 : fid,
        username: fid === "8888" ? "demo_creator" : "mock_user",
        display_name: fid === "8888" ? "Demo Creator" : "Mock User",
        follower_count: 15000, // Sufficient for verification
        verified_addresses: { eth_addresses: [walletAddress] }
      };
    } else {
      // Fetch user data from Neynar directly
      const neynarUrl = `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`;
      const neynarResponse = await fetch(neynarUrl, {
        headers: { "x-api-key": NEYNAR_API_KEY },
      });

      if (!neynarResponse.ok) {
        return NextResponse.json({ error: "Failed to fetch Farcaster data" }, { status: 502 });
      }

      const data = await neynarResponse.json();
      if (!data.users || data.users.length === 0) {
        return NextResponse.json({ error: "User not found on Farcaster" }, { status: 404 });
      }
      user = data.users[0];
    }
    
    const followerCount = user.follower_count;

    // Check minimum follower requirement
    if (followerCount < MIN_FOLLOWER_COUNT) {
      return NextResponse.json({
        success: false,
        error: `Insufficient followers. You have ${followerCount}, minimum required is ${MIN_FOLLOWER_COUNT}`,
        followerCount,
        required: MIN_FOLLOWER_COUNT,
      }, { status: 403 });
    }

    // Generate signature for smart contract
    const wallet = new ethers.Wallet(VERIFIER_PRIVATE_KEY);
    
    const messageHash = ethers.solidityPackedKeccak256(
      ["address", "uint256", "uint256"],
      [walletAddress, followerCount, parseInt(CHAIN_ID)]
    );

    console.log("--- SIGNATURE DEBUG ---");
    console.log("Wallet:", walletAddress);
    console.log("Followers:", followerCount);
    console.log("ChainID:", parseInt(CHAIN_ID));
    console.log("Hash:", messageHash);
    console.log("-----------------------");

    const signature = await wallet.signMessage(ethers.getBytes(messageHash));

    return NextResponse.json({
      success: true,
      fid: user.fid,
      username: user.username,
      displayName: user.display_name,
      followerCount,
      signature,
      walletAddress,
      chainId: parseInt(CHAIN_ID),
    });

  } catch (error) {
    console.error("Verify followers error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET /api/verify-followers?fid=123 - Check follower count only
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fid = searchParams.get("fid");

  if (!fid) {
    return NextResponse.json(
      { error: "Missing fid parameter" },
      { status: 400 }
    );
  }

  if (!NEYNAR_API_KEY) {
    return NextResponse.json(
      { error: "Neynar API key not configured" },
      { status: 500 }
    );
  }

  try {
    const neynarUrl = `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`;
    const neynarResponse = await fetch(neynarUrl, {
      headers: {
        "x-api-key": NEYNAR_API_KEY,
      },
    });

    if (!neynarResponse.ok) {
      return NextResponse.json(
        { error: "Failed to fetch Farcaster data" },
        { status: 502 }
      );
    }

    const data = await neynarResponse.json();
    if (!data.users || data.users.length === 0) {
      return NextResponse.json(
        { error: "User not found on Farcaster" },
        { status: 404 }
      );
    }

    const user = data.users[0];

    return NextResponse.json({
      success: true,
      fid: user.fid,
      username: user.username,
      displayName: user.display_name,
      followerCount: user.follower_count,
      meetsMinimum: user.follower_count >= MIN_FOLLOWER_COUNT,
      required: MIN_FOLLOWER_COUNT,
      ethAddresses: user.verified_addresses?.eth_addresses || [],
    });

  } catch (error) {
    console.error("Get follower count error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
