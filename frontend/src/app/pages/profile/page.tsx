"use client";

import { useLight } from "@/context/LightContext";
import { useUsers } from "@/context/UsersContext";
import ProtectedRoute from "@/store/ProtectedRoute";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ProfilePages() {
  const { isDark } = useLight();
  const router = useRouter();
  const { user, setUser, updateProfileUsers } = useUsers();
  //const [showToast, setShowToast] = useState(false);
  const tabs = ["Post", "Assert", "Cast", "Replies", "Badge"];
  const [activeTab, setActiveTab] = useState("Post"); // Set default to 'Faucet'

  const tabContent: Record<string, React.ReactNode> = {
    Post: (
      <div>
        <h1>this post</h1>
      </div>
    ),
    Assert: (
      <div>
        <h1>this assert</h1>
      </div>
    ),
    Cast: (
      <div>
        <h1>this cast</h1>
      </div>
    ),
    Replies: (
      <div>
        <h1>this replies</h1>
      </div>
    ),
    Badge: (
      <div>
        <h1>this badge</h1>
      </div>
    ),
  };

  return (
    <ProtectedRoute allowedRoles={["Users", "Creators"]}>
      <div className="w-full md:px-8 py-4 px-2">
        <div className="flex items-center justify-between w-full mb-4">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <Image
              src="https://img.freepik.com/vektor-gratis/ilustrasi-kera-gaya-nft-digambar-tangan_23-2149622021.jpg"
              alt="User Avatar"
              width={60}
              height={60}
              className="rounded-full object-cover"
            />
          </div>

          {/* Tombol Edit Profile */}
          <button className="px-6 text-black font-sarif py-3 text-sm font-semibold bg-blue-300 rounded-xl shadow-lg transform hover:scale-105 hover:shadow-2xl transition duration-300 ease-in-out">
            Edit Profile
          </button>
        </div>
        <div className="space-y-2">
          {/* Name and Username Section */}
          <div className="flex flex-col items-start">
            <h1 className="text-lg font-sarif font-semibold">Base Indonesia</h1>
            <h1 className="font-sarif  text-sm text-gray-600">base.eth.base</h1>
          </div>

          {/* Stats Section (Following & Followers) */}
          <div className="flex">
            <div className="flex flex-row items-start">
              <p className="font-sarif  text-sm font-semibold px-1">100</p>
              <p className="font-sarif text-sm text-gray-500">Following</p>
            </div>
            <div className="flex flex-row">
              <p className="font-sarif text-sm font-semibold px-1">100</p>
              <p className="font-sarif text-sm text-gray-500">Followers</p>
            </div>
          </div>

          {/* Buttons Section */}
          <div className="flex flex-row space-x-4 w-full">
            <button className="font-sarif flex-1 px-6 py-3 text-sm font-semibold text-white bg-blue-800 rounded-lg shadow-md hover:scale-105 transition duration-300">
              View Earnings
            </button>
            <button className="font-sarif text-black flex-1 px-6 py-3 text-sm font-semibold bg-blue-400 rounded-lg shadow-md hover:scale-105 transition duration-300">
              Share
            </button>
          </div>
        </div>

        <div className="tab-container py-4">
          <div className="flex flex-col">
            {/* Tab Navigation */}
            <div className="flex gap-4 mb-4">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  className={`py-2 font-mono text-md font-semibold ${
                    activeTab === tab
                      ? `border-b-3 border-black-500 ${
                          isDark ? "text-white" : "text-black"
                        }`
                      : "text-gray-400"
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="rounded-lg">{tabContent[activeTab]}</div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
