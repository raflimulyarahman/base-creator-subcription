import { Request, Response } from "express";
import { ethers } from "ethers";

const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY;
const VERIFIER_PRIVATE_KEY = process.env.VERIFIER_PRIVATE_KEY;
const CHAIN_ID = process.env.CHAIN_ID || "84532"; // Base Sepolia default

const MIN_FOLLOWER_COUNT = 10000;

interface NeynarUser {
  fid: number;
  follower_count: number;
  username: string;
  display_name: string;
  verified_addresses?: {
    eth_addresses?: string[];
  };
}

interface NeynarResponse {
  users: NeynarUser[];
}

/**
 * Verify a user's Farcaster follower count and generate a signature for on-chain verification
 * POST /api/verify-followers
 * Body: { fid: number, walletAddress: string }
 */
export const verifyFollowers = async (req: Request, res: Response) => {
  try {
    const { fid, walletAddress } = req.body;

    // Validate inputs
    if (!fid || !walletAddress) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: fid and walletAddress",
      });
    }

    if (!NEYNAR_API_KEY) {
      return res.status(500).json({
        success: false,
        error: "Server misconfigured: NEYNAR_API_KEY not set",
      });
    }

    if (!VERIFIER_PRIVATE_KEY) {
      return res.status(500).json({
        success: false,
        error: "Server misconfigured: VERIFIER_PRIVATE_KEY not set",
      });
    }

    // Fetch user data from Neynar API
    const neynarUrl = `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`;
    const neynarResponse = await fetch(neynarUrl, {
      headers: {
        "x-api-key": NEYNAR_API_KEY,
      },
    });

    if (!neynarResponse.ok) {
      return res.status(502).json({
        success: false,
        error: `Neynar API error: ${neynarResponse.status}`,
      });
    }

    const data: NeynarResponse = await neynarResponse.json();

    if (!data.users || data.users.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Farcaster user not found",
      });
    }

    const user = data.users[0];
    const followerCount = user.follower_count;

    // Check if follower count meets minimum
    if (followerCount < MIN_FOLLOWER_COUNT) {
      return res.status(403).json({
        success: false,
        error: `Insufficient followers. Required: ${MIN_FOLLOWER_COUNT}, Current: ${followerCount}`,
        followerCount,
        required: MIN_FOLLOWER_COUNT,
      });
    }

    // Verify wallet address is associated with Farcaster account (optional extra check)
    const ethAddresses = user.verified_addresses?.eth_addresses || [];
    const walletVerified = ethAddresses.some(
      (addr) => addr.toLowerCase() === walletAddress.toLowerCase()
    );

    // Generate signature
    // Message format: keccak256(abi.encodePacked(walletAddress, followerCount, chainId))
    const wallet = new ethers.Wallet(VERIFIER_PRIVATE_KEY);
    
    const messageHash = ethers.solidityPackedKeccak256(
      ["address", "uint256", "uint256"],
      [walletAddress, followerCount, parseInt(CHAIN_ID)]
    );

    const signature = await wallet.signMessage(ethers.getBytes(messageHash));

    return res.status(200).json({
      success: true,
      fid: user.fid,
      username: user.username,
      displayName: user.display_name,
      followerCount,
      walletVerified,
      signature,
      messageHash,
      chainId: parseInt(CHAIN_ID),
      verifierAddress: wallet.address,
    });
  } catch (error) {
    console.error("Error in verifyFollowers:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

/**
 * Check follower count without generating signature (public info)
 * GET /api/verify-followers/:fid
 */
export const getFollowerCount = async (req: Request, res: Response) => {
  try {
    const { fid } = req.params;

    if (!fid) {
      return res.status(400).json({
        success: false,
        error: "Missing FID parameter",
      });
    }

    if (!NEYNAR_API_KEY) {
      return res.status(500).json({
        success: false,
        error: "Server misconfigured: NEYNAR_API_KEY not set",
      });
    }

    const neynarUrl = `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`;
    const neynarResponse = await fetch(neynarUrl, {
      headers: {
        "x-api-key": NEYNAR_API_KEY,
      },
    });

    if (!neynarResponse.ok) {
      return res.status(502).json({
        success: false,
        error: `Neynar API error: ${neynarResponse.status}`,
      });
    }

    const data: NeynarResponse = await neynarResponse.json();

    if (!data.users || data.users.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Farcaster user not found",
      });
    }

    const user = data.users[0];

    return res.status(200).json({
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
    console.error("Error in getFollowerCount:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};
