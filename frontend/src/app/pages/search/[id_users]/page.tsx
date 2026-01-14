"use client";

import { useLight } from "@/context/LightContext";
import { useUsers } from "@/context/UsersContext";
import ProtectedRoute from "@/store/ProtectedRoute";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import Modal from "@/components/ui/ModalSubscribe";
import { useSubscribe } from "@/context/SubscribeContext";

export default function ProfilePages() {
  const { isDark } = useLight();
  const params = useParams();
  const id_users = params.id_users;

  const { profileUser, setProfileUser, getProfileUserById } = useUsers();
  const { getSubscribeIdTier } = useSubscribe();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Post");
  const tabs = ["Post", "Assert", "Cast", "Replies", "Badge"];

  // Fetch profile user
  useEffect(() => {
    if (!id_users) return;

    const getIdUsers = async () => {
      const userData = await getProfileUserById(id_users);
      setProfileUser(userData);
    };
    getIdUsers();
  }, [id_users, getProfileUserById]);


  const tabContent: Record<string, React.ReactNode> = {
    Post: <div><h1>This is post</h1></div>,
    Assert: <div><h1>This is assert</h1></div>,
    Cast: <div><h1>This is cast</h1></div>,
    Replies: <div><h1>This is replies</h1></div>,
    Badge: <div><h1>This is badge</h1></div>,
  };

  return (
    <ProtectedRoute allowedRoles={["Users", "Creators"]}>
      <div className="w-full md:px-8 py-4 px-2">
        {/* Header: Avatar + Buttons */}
        <div className="flex items-center justify-between w-full mb-4">
          <div className="flex items-center gap-4">
            <Image
              src={profileUser?.foto || "/placeholder.png"}
              alt="User Avatar"
              width={60}
              height={60}
              className="rounded-full object-cover"
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <button className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition">
                {/* Example SVG */}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.068.157 2.148.279 3.238.364.466.037.893.281 1.153.671L12 21l2.652-3.978c.26-.39.687-.634 1.153-.67 1.09-.086 2.17-.208 3.238-.365 1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                </svg>
              </button>

              <button className="flex-1 px-6 py-3 text-sm font-semibold bg-blue-300 rounded-xl shadow-lg hover:scale-105 transition">
                Following
              </button>
            </div>

            {/* Subscribe Button */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full px-6 py-3 text-sm font-semibold bg-blue-300 rounded-xl shadow-lg hover:scale-105 transition"
            >
              Subscribe
            </button>
          </div>
        </div>

        {/* Name + Username */}
        <div className="space-y-2">
          <div className="flex flex-col items-start">
            <h1 className="text-lg font-sarif font-semibold">{profileUser?.first_name} {profileUser?.last_name}</h1>
            <h1 className="font-sarif text-sm text-gray-600">{profileUser?.username}</h1>
          </div>

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
                  className={`py-2 font-sans text-base font-semibold ${activeTab === tab
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
        {isModalOpen && (
          <Modal onClose={() => setIsModalOpen(false)}>
            <p className="text-center text-lg font-semibold">Subscription successful!</p>
          </Modal>
        )}
      </div>
    </ProtectedRoute>
  );
}
