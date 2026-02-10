"use client";

import { useLight } from "@/context/LightContext";
import { usePosts, Post } from "@/context/PostsContext";
import { useUsers } from "@/context/UsersContext"; // Added import
import { useAccount, useReadContract } from "wagmi";
import Image from "next/image";
import Link from "next/link"; // Added import
import VoteButton from "@/components/VoteButton/VoteButton";
import { useEffect, useState } from "react";
import { gatedContentAbi } from "@/abi/GatedContent";
import { CONTRACT_ADDRESSES } from "@/config/contract";
import PostCard from "@/components/PostCard/PostCard";

// Placeholder avatar for creators without one
const DEFAULT_AVATAR = "/11789135.png";

// Static demo posts adapted to Post interface
const DEMO_POSTS: Post[] = [
  {
    postId: BigInt(101),
    creator: "0x1234567890123456789012345678901234567890",
    minTierRequired: BigInt(1),
    contentHash: "ipfs://demo_Nice_weather_today",
    createdAt: BigInt(Math.floor(Date.now() / 1000 - 3600)),
    isPublic: true,
    viralScore: BigInt(15),
    conversionThreshold: BigInt(50),
    currentVotes: BigInt(10),
  },
  {
    postId: BigInt(102),
    creator: "0x9876543210987654321098765432109876543210",
    minTierRequired: BigInt(2),
    contentHash: "ipfs://demo_Exclusive_Gold_Alpha_Tips",
    createdAt: BigInt(Math.floor(Date.now() / 1000 - 86400)),
    isPublic: false,
    viralScore: BigInt(45),
    conversionThreshold: BigInt(50),
    currentVotes: BigInt(42),
  },
];

export default function HomePages() {
  const { isDark } = useLight();
  const { posts, refreshPosts } = usePosts();
  const { usersAll } = useUsers();
  const [showDemo, setShowDemo] = useState(true);

  // Header handling is now in Navbar component
  // Removed duplicate sticky header that caused UI issues

  return (
    <div className={`w-full min-h-screen ${isDark ? "bg-black text-white" : "bg-white text-gray-900"}`}>
      <div className="flex flex-col pb-24 pt-0 md:pt-2 gap-0">
        
        {/* Contract posts */}
        {posts.map((post) => (
          <PostCard key={post.postId.toString()} post={post} />
        ))}

        {/* Demo posts if no contract posts */}
        {showDemo && posts.length === 0 && (
          <div className="flex flex-col gap-0 md:gap-4">
            <div className={`py-4 px-4 text-center text-xs ${isDark ? "text-gray-600" : "text-gray-400"}`}>
              Displaying demo content
            </div>
            {DEMO_POSTS.map((post) => (
              <PostCard key={post.postId.toString()} post={post} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!showDemo && posts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-sm">No posts yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
