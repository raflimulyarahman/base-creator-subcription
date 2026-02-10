"use client";

import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import { useAccount, useReadContract, useReadContracts } from "wagmi";
import { gatedContentAbi } from "@/abi/GatedContent";
import { CONTRACT_ADDRESSES } from "@/config/contract";

export interface Post {
  postId: bigint;
  creator: `0x${string}`;
  minTierRequired: bigint;
  contentHash: string;
  createdAt: bigint;
  isPublic: boolean;
  viralScore: bigint;
  conversionThreshold: bigint;
  currentVotes: bigint;
}

interface PostsContextType {
  posts: Post[];
  loading: boolean;
  error: string | null;
  refreshPosts: () => void;
  getPostById: (postId: bigint) => Post | undefined;
}

const PostsContext = createContext<PostsContextType | undefined>(undefined);

export function PostsProvider({ children }: { children: React.ReactNode }) {
  const { address } = useAccount();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Read total post count from contract
  const { data: postCount, refetch: refetchPostCount } = useReadContract({
    address: CONTRACT_ADDRESSES.GatedContent,
    abi: gatedContentAbi,
    functionName: "postCount",
  });

  // Generate post IDs to fetch (last 20 posts for now)
  const postIds = useMemo(() => {
    if (!postCount) return [];
    const count = Number(postCount);
    const ids: bigint[] = [];
    // Get last 20 posts or all if less
    const start = Math.max(1, count - 19);
    for (let i = count; i >= start; i--) {
      ids.push(BigInt(i));
    }
    return ids;
  }, [postCount]);

  // Fetch all posts
  const { data: postsData, refetch: refetchPosts } = useReadContracts({
    contracts: postIds.map((id) => ({
      address: CONTRACT_ADDRESSES.GatedContent,
      abi: gatedContentAbi,
      functionName: "getPost",
      args: [id],
    })),
  });

  // Process posts data
  React.useEffect(() => {
    if (postsData) {
      const processedPosts: Post[] = [];
      postsData.forEach((result, index) => {
        if (result.status === "success" && result.result) {
          const post = result.result as any;
          // Only include valid posts (non-zero creator address)
          if (post.creator !== "0x0000000000000000000000000000000000000000") {
            processedPosts.push({
              postId: post.postId,
              creator: post.creator,
              minTierRequired: post.minTierRequired,
              contentHash: post.contentHash,
              createdAt: post.createdAt,
              isPublic: post.isPublic,
              viralScore: post.viralScore,
              conversionThreshold: post.conversionThreshold,
              currentVotes: post.currentVotes,
            });
          }
        }
      });
      setPosts(processedPosts);
    }
  }, [postsData]);

  const refreshPosts = useCallback(() => {
    refetchPostCount();
    refetchPosts();
  }, [refetchPostCount, refetchPosts]);

  const getPostById = useCallback(
    (postId: bigint) => {
      return posts.find((p) => p.postId === postId);
    },
    [posts]
  );

  const value = useMemo(
    () => ({
      posts,
      loading,
      error,
      refreshPosts,
      getPostById,
    }),
    [posts, loading, error, refreshPosts, getPostById]
  );

  return (
    <PostsContext.Provider value={value}>
      {children}
    </PostsContext.Provider>
  );
}

export function usePosts() {
  const context = useContext(PostsContext);
  if (!context) {
    throw new Error("usePosts must be used within a PostsProvider");
  }
  return context;
}
