"use client";

import { useLight } from "@/context/LightContext";
import { Post, usePosts } from "@/context/PostsContext";
import { useUsers } from "@/context/UsersContext";
import { useAccount, useReadContract } from "wagmi";
import Image from "next/image";
import Link from "next/link";
import VoteButton from "@/components/VoteButton/VoteButton";
import { gatedContentAbi } from "@/abi/GatedContent";
import { CONTRACT_ADDRESSES } from "@/config/contract";

// Placeholder avatar for creators without one
const DEFAULT_AVATAR = "/11789135.png";

// Helper to format address
const formatAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// Helper to resolve profile link
const getProfileLink = (
  user: any,
  address: string,
  currentUserAddress?: string
) => {
  // If it's the current user, go to their main profile
  if (
    currentUserAddress &&
    address.toLowerCase() === currentUserAddress.toLowerCase()
  ) {
    return "/pages/profile";
  }

  // If we have a user ID, use standard profile
  const userId = user?.id_users || user?.id;
  if (userId) return `/pages/search/${userId}`;

  // Fallback: If no ID (e.g. contract only), use standard profile shell
  return `/pages/search/${address}`;
};

// Helper to format timestamp
const formatTime = (timestamp: bigint) => {
  const date = new Date(Number(timestamp) * 1000);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
};

// Tier badge component
const TierBadge = ({ tier }: { tier: number }) => {
  const badges = ["", "Bronze", "Silver", "Gold"];
  const colors = [
    "",
    "border-orange-200 text-orange-800 bg-orange-50",
    "border-gray-200 text-gray-800 bg-gray-50",
    "border-yellow-200 text-yellow-800 bg-yellow-50",
  ];

  if (tier === 0) return null;

  return (
    <span
      className={`text-[10px] font-medium border px-2 py-0.5 rounded-md ${
        colors[tier] || "bg-gray-100 text-gray-600"
      }`}
    >
      {badges[tier] || "Locked"}
    </span>
  );
};

interface PostCardProps {
  post: Post;
  showCreatorInfo?: boolean; // Option to hide creator info (e.g. on profile page)
}

export default function PostCard({
  post,
  showCreatorInfo = true,
}: PostCardProps) {
  const { isDark } = useLight();
  const { address } = useAccount();
  const { usersAll } = useUsers();
  const { refreshPosts } = usePosts();

  const creatorUser = usersAll.find((u) => {
    const uAddr = (
      u.wallet_address ||
      (u as any).address?.address ||
      (u as any).address ||
      ""
    )
      .toString()
      .toLowerCase();
    const pAddr = post.creator.toString().toLowerCase();
    return uAddr === pAddr && uAddr !== "";
  });

  // Check access for exclusive posts
  const { data: hasAccess } = useReadContract({
    address: CONTRACT_ADDRESSES.GatedContent,
    abi: gatedContentAbi,
    functionName: "hasAccess",
    args: [address as `0x${string}`, post.postId],
    query: {
      enabled: !!address && !post.isPublic,
    },
  });

  // Creator always has access to their own posts
  // Check both connected wallet (address) and logged-in user profile (usersAll/user)
  const isCreatorWallet = address && post.creator.toLowerCase() === address.toLowerCase();
  
  // NOTE: isCreatorProfile Logic removed as it was redundant/flawed (checking creator vs creator).
  // We rely on isCreatorWallet (current connected user vs creator).

  const canView =
    post.isPublic ||
    hasAccess ||
    isCreatorWallet;

  // Clean content hash and parse media
  const rawContent = post.contentHash.includes("demo_")
    ? post.contentHash
        .replace("ipfs://demo_", "")
        .split("_")
        .slice(1)
        .join(" ")
        .replace(/[^\w\s.,?!]/g, "")
    : post.contentHash;

  // Check for separated Media URL and Caption (New Format)
  let mediaUrl = "";
  let caption = rawContent;

  const parts = rawContent.split("\n\n");
  if (
    parts.length > 0 && 
    (parts[0].startsWith("http") ||
    parts[0].startsWith("blob:") ||
    parts[0].startsWith("ipfs") ||
    parts[0].startsWith("data:image"))
  ) {
    mediaUrl = parts[0];
    caption = parts.slice(1).join("\n\n");
  }

  // Legacy simulation check (keep for demo data support)
  if (!mediaUrl && post.contentHash.includes("_img")) {
    // Just a placeholder simulated flag
  }

  // Determine display name
  const displayName =
    creatorUser?.name ||
    creatorUser?.handle ||
    creatorUser?.username ||
    ((creatorUser as any)?.first_name
      ? `${(creatorUser as any).first_name} ${
          (creatorUser as any).last_name || ""
        }`.trim()
      : null) ||
    formatAddress(post.creator);

  return (
    <div
      className={`w-full mx-auto ${
        isDark ? "bg-black border-gray-800" : "bg-white border-gray-100"
      } border-b md:border-b-0 p-4`}
    >
      {/* Header */}
      {showCreatorInfo && (
        <div className="flex items-center gap-3 mb-3">
          <Link
            href={getProfileLink(
              creatorUser,
              post.creator,
              address?.toString()
            )}
          >
            <Image
              src={
                creatorUser?.avatar_url || creatorUser?.foto || DEFAULT_AVATAR
              }
              alt="Avatar"
              width={36}
              height={36}
              className="rounded-full object-cover w-9 h-9 border border-gray-200 dark:border-gray-700"
              unoptimized
            />
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Link
                href={getProfileLink(
                  creatorUser,
                  post.creator,
                  address?.toString()
                )}
                className="hover:underline"
              >
                <h3
                  className={`font-semibold text-sm ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  {displayName}
                </h3>
              </Link>
              <span className="text-xs text-gray-400">
                • {formatTime(post.createdAt)}
              </span>
            </div>
            <TierBadge tier={Number(post.minTierRequired)} />
          </div>
        </div>
      )}

      {/* Content */}
      <div className={`mb-3 ${isDark ? "text-gray-200" : "text-gray-800"}`}>
        {canView ? (
          <div>
            {mediaUrl && (
              <div className="rounded-lg overflow-hidden mb-3 border border-gray-100 dark:border-gray-800">
                <img
                  src={mediaUrl}
                  alt="Post Media"
                  className="w-full h-auto object-cover max-h-[500px]"
                  onError={(e) => {
                    // Fallback if broken
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            )}

            <p className="text-sm leading-relaxed whitespace-pre-wrap mb-2">
              {caption}
            </p>

            {/* Simulation Legacy */}
            {!mediaUrl && post.contentHash.includes("_img") && (
              <div className="rounded-lg overflow-hidden mt-2 border border-gray-100 dark:border-gray-800">
                <div className="w-full h-48 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <span className="text-xs text-gray-500">
                    Image Content Simulation
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 border border-gray-200 dark:border-gray-800 p-10 text-center shadow-inner">
            <div className="filter blur-md select-none opacity-40 space-y-3">
              <p className="w-3/4 mx-auto bg-gray-300 dark:bg-gray-700 h-4 rounded"></p>
              <p className="w-1/2 mx-auto bg-gray-300 dark:bg-gray-700 h-4 rounded"></p>
              <p className="w-2/3 mx-auto bg-gray-300 dark:bg-gray-700 h-4 rounded"></p>
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/30 dark:bg-black/30 backdrop-blur-[1px]">
               <div className="bg-white dark:bg-gray-800 p-3 rounded-full shadow-sm mb-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6 text-gray-500 dark:text-gray-400"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
                  />
                </svg>
               </div>
              <span className="font-semibold text-sm text-gray-600 dark:text-gray-300">
                Subscribers Only Content
              </span>
              <p className="text-xs text-gray-400 mt-1">Subscribe to unlock</p>
            </div>
          </div>
        )}
      </div>

      {/* Vote Section - Simplified */}
      <div className="mb-3">
        <VoteButton
          postId={post.postId}
          currentVotes={Number(post.currentVotes)}
          threshold={Number(post.conversionThreshold)}
          isPublic={post.isPublic}
          onVoteSuccess={refreshPosts}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-6 pt-2">
        <button className="text-gray-400 hover:text-red-500 transition flex items-center gap-1 group">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5 group-hover:scale-110 transition-transform"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
            />
          </svg>
        </button>
        <button className="text-gray-400 hover:text-blue-500 transition flex items-center gap-1 group">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5 group-hover:scale-110 transition-transform"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 4.556 4.03 8.25 9 8.25Z"
            />
          </svg>
        </button>
        <button className="text-gray-400 hover:text-green-500 transition group">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5 group-hover:scale-110 transition-transform"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z"
            />
          </svg>
        </button>
        <div className="ml-auto text-xs text-gray-400 font-medium">
          Score: {Number(post.viralScore)}
        </div>
      </div>
    </div>
  );
}
