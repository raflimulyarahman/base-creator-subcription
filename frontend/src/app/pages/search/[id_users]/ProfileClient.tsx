"use client";

import ModalSubscribe from "@/components/Modal/ModalSubscribe";
import Toast from "@/components/Toast/Toast";
import { useChatPersonal } from "@/context/ChatPersonalContext";
import { useLight } from "@/context/LightContext";
import { useSubscribe } from "@/context/SubscribeContext";
import { useUsers } from "@/context/UsersContext";
import { useWallet } from "@/context/WalletContext";
import ProtectedRoute from "@/store/ProtectedRoute";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { usePosts } from "@/context/PostsContext"; 
import PostCard from "@/components/PostCard/PostCard";
import { TierData } from "@/types";

// Helper to format address
const formatAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

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

interface Props {
  id_users: string;
}

export default function ProfileClientPages({ id_users }: Props) {
  const { isDark } = useLight();
  const router = useRouter();
  const { profileUser, setProfileUser, getProfileUserById, usersAll } = useUsers(); 
  const { subscribedata, getSubscribeIdTier } = useSubscribe(); // Removed tiers/setTiers
  const [viewedTiers, setViewedTiers] = useState<TierData[]>([]); // Computed locally
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { createChatPersonal } = useChatPersonal();
  const { userId } = useWallet();
  const [activeTab, setActiveTab] = useState("Post");
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type?: "success" | "error";
  }>({
    show: false,
    message: "",
    type: "success",
  });
  const { posts } = usePosts();
  const DEFAULT_AVATAR = "/11789135.png";

  // ... (keep constant tabs, chat check)
  const tabs = ["Post", "Assert", "Cast", "Replies", "Badge"];

  // Debugging Chat Access
  const cleanUserId = userId; 
  const cleanCreatorId = profileUser?.id_users || profileUser?.id;

  console.log("DEBUG CHAT ACCESS:", {
    userId: cleanUserId, 
    creatorId: cleanCreatorId, 
    subscribedata,
    hasGold: subscribedata?.some(s => s.type_subscribe === "Gold")
  });

  // Check if user can access chat
  const canAccessChat =
    Array.isArray(subscribedata) &&
    cleanUserId &&
    cleanCreatorId &&
    subscribedata.some(
      (sub) => {
        const isUserMatch = sub.id_users === cleanUserId;
        const isCreatorMatch = sub.id_creator === cleanCreatorId;
        const isStatusMatch = sub.status_subscribe === "Done";
                // Robust check for Gold or equivalent custom names (like Super Fan)
        const isGold = 
             sub.type_subscribe?.trim().toLowerCase() === "gold" || 
             sub.type_subscribe?.trim().toLowerCase() === "super fan";

        // console.log("Checking Sub:", sub, { isUserMatch, isCreatorMatch, isStatusMatch, isGold });

        return isUserMatch && isCreatorMatch && isStatusMatch && isGold;
      }
    );

  // Fetch profile user (Updated for address support)
  useEffect(() => {
    if (!id_users) return;

    const fetchUser = async () => {
        // Check if id_users acts as an address (starts with 0x and long enough)
        if (id_users.startsWith("0x") && id_users.length > 30) {
             const found = usersAll.find(u => 
                 (u.wallet_address || "").toLowerCase() === id_users.toLowerCase() ||
                 (u as any).address?.address?.toLowerCase() === id_users.toLowerCase()
             );

             if (found) {
                 setProfileUser(found);
             } else {
                 // Fallback user object
                 setProfileUser({
                     id_users: id_users,
                     username: formatAddress(id_users),
                     name: "Creator",
                     first_name: "Creator",
                     wallet_address: id_users,
                     avatar_url: DEFAULT_AVATAR,
                 } as any);
             }
        } else {
             const userData = await getProfileUserById(id_users);
             setProfileUser(userData);
        }
    };
    fetchUser();
  }, [id_users, usersAll, getProfileUserById, setProfileUser]);

  // Fetch Tiers for the profile user LOCALLY
  useEffect(() => {
    const fetchTiers = async () => {
        const address = profileUser?.wallet_address || (profileUser as any)?.address?.address;
        if (address) {
            try {
                const data = await getSubscribeIdTier(address);
                if (data?.tiers) {
                    setViewedTiers(data.tiers);
                }
            } catch (error) {
                console.error("Failed to fetch tiers:", error);
            }
        }
    };
    fetchTiers();
  }, [profileUser, getSubscribeIdTier]);

  // ... (keep address useEffect)
  
  // Filter posts for this profile
  const filteredPosts = posts.filter(post => {
    const creatorAddress = (profileUser?.wallet_address || profileUser?.address?.address || "").toLowerCase();
    const postCreator = post.creator.toLowerCase();
    return creatorAddress && postCreator === creatorAddress;
  });

  const handleSubscribeClick = () => {
    if (
      !viewedTiers ||
      viewedTiers.length === 0 ||
      viewedTiers.every((t) => t.isActive === false)
    ) {
      setToast({
        show: true,
        message: "Creator Not Set Subscribe!",
        type: "error", // <-- tambahkan ini
      });
      return;
    }
    setIsModalOpen(true);
  };

  const handleSetChatPersonal = async () => {
    if (!id_users || !userId) return;
    try {
      const chat = await createChatPersonal({
        id_users1: userId,
        id_users2: id_users,
      });
      router.push(`/pages/chating/creator?chatId=${chat.id_chat_personal}`);
    } catch (err) {
      console.error("Error opening chat:", err);
    }
  };

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
    Assert: (
      <div>
        <h1>This is assert</h1>
      </div>
    ),
    Cast: (
      <div>
        <h1>This is cast</h1>
      </div>
    ),
    Replies: (
      <div>
        <h1>This is replies</h1>
      </div>
    ),
    Badge: (
      <div>
        <h1>This is badge</h1>
      </div>
    ),
  };

  return (
    <ProtectedRoute allowedRoles={["Users", "Creators", "Consumers", "user", "creator", "admin"]}>
      <div className="w-full md:px-8 py-4 px-2">
        {/* Header */}
        <div className="flex items-center justify-between w-full mb-4">
          <div className="flex items-center gap-4">
            <Image
              src={profileUser?.avatar_url || profileUser?.foto || DEFAULT_AVATAR}
              alt="User Avatar"
              width={60}
              height={60}
              unoptimized
              className="rounded-full object-cover w-14 h-14"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = DEFAULT_AVATAR;
              }}
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={canAccessChat ? handleSetChatPersonal : undefined}
                disabled={!canAccessChat}
                className={`p-2 rounded-lg transition ${
                  canAccessChat
                    ? "bg-gray-600 hover:bg-gray-300 cursor-pointer"
                    : "bg-gray-400 cursor-not-allowed opacity-50"
                }`}
                title={
                  canAccessChat
                    ? "Chat"
                    : "Chat hanya tersedia untuk subscriber GOLD"
                }
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.068.157 2.148.279 3.238.364.466.037.893.281 1.153.671L12 21l2.652-3.978c.26-.39.687-.634 1.153-.67 1.09-.086 2.17-.208 3.238-.365 1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
                  />
                </svg>
              </button>

              <button className="flex-1 px-6 py-3 text-sm text-white font-semibold bg-blue-900 rounded-xl shadow-lg hover:scale-105 transition">
                Following
              </button>
            </div>

            <button
              onClick={
                subscribedata?.some(
                  (s) =>
                    s.id_creator === (profileUser?.id_users || profileUser?.id) &&
                    s.status_subscribe === "Done"
                )
                  ? undefined
                  : handleSubscribeClick
              }
              disabled={subscribedata?.some(
                (s) =>
                  s.id_creator === (profileUser?.id_users || profileUser?.id) &&
                  s.status_subscribe === "Done"
              )}
              className={`w-full px-6 py-3 text-sm font-semibold rounded-xl shadow-lg transition ${
                subscribedata?.some(
                  (s) =>
                    s.id_creator === (profileUser?.id_users || profileUser?.id) &&
                    s.status_subscribe === "Done"
                )
                  ? "bg-gray-500 text-gray-200 cursor-default"
                  : "bg-blue-900 text-white hover:scale-105"
              }`}
            >
              {subscribedata?.some(
                (s) =>
                  s.id_creator === (profileUser?.id_users || profileUser?.id) &&
                  s.status_subscribe === "Done"
              )
                ? "Subscribed"
                : "Subscribe"}
            </button>
          </div>
        </div>

        {/* Name + Username */}
        <div className="space-y-2">
          <h1 className="text-lg font-sarif font-semibold">
            {profileUser?.name || `${profileUser?.first_name || ""} ${profileUser?.last_name || ""}`.trim() || profileUser?.username}
          </h1>
          <h2 className="font-sarif text-sm text-gray-600">
            {profileUser?.username}
          </h2>

          {/* Stats */}
          <div className="flex gap-4">
            <div className="flex flex-row items-start">
              <p className="font-sarif text-sm font-semibold px-1">100</p>
              <p className="font-sarif text-sm text-gray-500">Following</p>
            </div>
            <div className="flex flex-row">
              <p className="font-sarif text-sm font-semibold px-1">100</p>
              <p className="font-sarif text-sm text-gray-500">Followers</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tab-container py-4">
          <div className="flex flex-col">
            <div className="flex gap-4 mb-4">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  className={`py-2 font-sans text-base font-semibold ${
                    activeTab === tab
                      ? `border-b-3 border-black-500 ${isDark ? "text-white" : "text-black"}`
                      : "text-gray-400"
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="rounded-lg">{tabContent[activeTab]}</div>
          </div>
        </div>

        {/* Modal */}
        {isModalOpen && profileUser && (
          <ModalSubscribe
            onClose={() => setIsModalOpen(false)}
            profileUser={profileUser} 
            tiers={viewedTiers}
          />
        )}

        {/* Toast */}
        {toast.show && (
          <Toast
            message={toast.message}
            show={toast.show}
            type={toast.type}
            onClose={() =>
              setToast({ show: false, message: "", type: "success" })
            }
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
