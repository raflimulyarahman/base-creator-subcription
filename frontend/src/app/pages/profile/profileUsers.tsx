"use client";

import { useState } from "react";
import Image from "next/image";
import { useLight } from "@/context/LightContext";
import ProtectedRoute from "@/store/ProtectedRoute";
import { useUsers } from "@/context/UsersContext";
export default function ProfileUsers() {
  const { isDark } = useLight();
  const { user } = useUsers();
  const [activeTab, setActiveTab] = useState("Post");
  const tabs = ["Post", "Assert", "Cast", "Replies", "Badge"];
  const DEFAULT_AVATAR =
    "https://img.freepik.com/vektor-gratis/ilustrasi-kera-gaya-nft-digambar-tangan_23-2149622021.jpg";

  const tabContent: Record<string, React.ReactNode> = {
    Post: <h1>this post</h1>,
    Assert: <h1>this assert</h1>,
    Cast: <h1>this cast</h1>,
    Replies: <h1>this replies</h1>,
    Badge: <h1>this badge</h1>,
  };

  return (
    <ProtectedRoute allowedRoles={["Users", "Creators"]}>
      <div className="w-full md:px-8 py-4 px-2">
        {/* HEADER */}
        <div className="flex items-center justify-between w-full mb-4">
          <div className="flex items-center gap-4">
            <Image
              src={user?.foto?.trim() || DEFAULT_AVATAR}
              alt="User Avatar"
              width={60}
              height={60}
              unoptimized
              className="rounded-full object-cover"
            />
          </div>

          <button className="px-6 py-3 text-sm font-semibold bg-blue-300 rounded-xl shadow-lg hover:scale-105 transition">
            Edit Profile
          </button>
        </div>

        {/* USER INFO */}
        <div className="space-y-2">
          <h1 className="text-lg font-semibold">
            {user
              ? user.first_name?.trim() || user.last_name?.trim()
                ? `${user.first_name} ${user.last_name}`.trim()
                : user.username
              : "Loading..."}
          </h1>
          <p className="text-sm text-gray-500">{user.username}</p>

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
        <div className="py-4">
          <div className="flex gap-4 mb-4">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 font-semibold ${
                  activeTab === tab
                    ? `border-b-2 ${
                        isDark ? "border-white text-white" : "border-black"
                      }`
                    : "text-gray-400"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div>{tabContent[activeTab]}</div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
