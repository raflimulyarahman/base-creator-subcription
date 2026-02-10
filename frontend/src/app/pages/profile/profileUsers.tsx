"use client";

import { useLight } from "@/context/LightContext";
import { useSubscribe } from "@/context/SubscribeContext";
import { useUsers } from "@/context/UsersContext";
import ProtectedRoute from "@/store/ProtectedRoute";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import EditProfileModal from "@/components/Profile/EditProfileModal";
import { usePosts } from "@/context/PostsContext"; // Added import
import PostCard from "@/components/PostCard/PostCard"; // Added import

// ...

// Simple Thumbnail Component for Grid
const PostThumbnail = ({ post }: { post: any }) => {
    // Parse content (simplified logic from PostCard)
    const rawContent = post.contentHash.includes("demo_")
    ? post.contentHash.replace("ipfs://demo_", "").split("_").slice(1).join(" ").replace(/[^\w\s.,?!]/g, "")
    : post.contentHash;

    let mediaUrl = "";
    let caption = rawContent;

    if (rawContent.includes("\n\n")) {
        const parts = rawContent.split("\n\n");
        if (parts[0].startsWith("http") || parts[0].startsWith("blob:") || parts[0].startsWith("ipfs")) {
            mediaUrl = parts[0];
            caption = parts.slice(1).join("\n\n");
        }
    }

    return (
        <div className="aspect-square bg-gray-100 dark:bg-gray-800 relative group overflow-hidden cursor-pointer border border-gray-200 dark:border-gray-700">
            {mediaUrl ? (
                <img src={mediaUrl} alt="Post" className="w-full h-full object-cover" />
            ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                    <p className="text-sm text-center line-clamp-4 text-gray-700 dark:text-gray-300 font-medium leading-relaxed">
                        {caption}
                    </p>
                </div>
            )}
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
    );
};

export default function ProfileUsers() {
  const { isDark } = useLight();
  const { user } = useUsers();
  const { subUsersId } = useSubscribe();
  const { posts } = usePosts(); // Get posts
  console.log(subUsersId);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Post");
  const tabs = ["Post", "Assert", "Cast", "Replies", "Badge"];
  const DEFAULT_AVATAR = "/11789135.png";

  // Filter posts for my profile
  const filteredPosts = posts.filter(post => {
    const myAddress = (user?.wallet_address || (user as any)?.address?.address || "").toLowerCase();
    const postCreator = post.creator.toLowerCase();
    return myAddress && postCreator === myAddress;
  });

  const tabContent: Record<string, React.ReactNode> = {
    Post: (
      <div className="grid grid-cols-3 gap-0.5 md:gap-1">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <PostThumbnail key={post.postId.toString()} post={post} />
          ))
        ) : (
          <div className="col-span-3 text-center py-10 text-gray-500">
            No posts yet.
          </div>
        )}
      </div>
    ),
    Assert: <></>,
    Cast: <></>,
    Replies: <></>,
    Badge: (
      <div>
        {subUsersId?.map((badge: any) => (
          <div key={badge.id_subscribe}>
            <p>{badge.id_token}</p>
          </div>
        ))
        }
      </div >
    )
  };

  return (
    <ProtectedRoute allowedRoles={["Users", "Creators", "Consumers", "user", "creator", "admin"]}>
      <div className="w-full md:px-8 py-4 px-2">
        {/* HEADER */}
        <div className="flex items-center justify-between w-full mb-4">
          <div className="flex items-center gap-4">
            <Image
              src={user?.avatar_url || user?.foto?.trim() || DEFAULT_AVATAR}
              alt="User Avatar"
              width={60}
              height={60}
              unoptimized
              className="rounded-full object-cover"
              style={{ width: "60px", height: "60px" }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = DEFAULT_AVATAR;
              }}
            />
          </div>

            <Link 
              href="/pages/profile/edit"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition dark:bg-black dark:text-white dark:border-gray-800 dark:hover:bg-gray-900"
            >
              Edit Profile
            </Link>
          
          <div className="flex gap-2">
          </div>
        </div>

        {/* USER INFO */}
        <div className="space-y-2 text-gray-900 dark:text-white">
          <h1 className="text-lg font-semibold">
            {user
              ? user.name || (user.first_name || user.last_name ? `${user.first_name || ""} ${user.last_name || ""}`.trim() : user.username || user.handle || "Guest")
              : "Loading..."}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">@{user?.username || user?.handle || "username"}</p>

          <div className="flex gap-4">
            <p className="text-sm">
              <b>100</b> Following
            </p>
            <p className="text-sm">
              <b>100</b> Followers
            </p>
          </div>
        </div>

        {/* TABS */}
        <div className="py-2">
          <div className="flex gap-6 mb-4 border-b border-gray-100 dark:border-gray-800">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 text-sm font-medium transition-colors relative ${
                  activeTab === tab
                    ? "text-black dark:text-white"
                    : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-300"
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black dark:bg-white rounded-full" />
                )}
              </button>
            ))}
          </div>

          <div>{tabContent[activeTab]}</div>
        </div>
        
      </div>
    </ProtectedRoute>
  );
}
