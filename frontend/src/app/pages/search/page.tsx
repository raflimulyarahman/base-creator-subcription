"use client";

import { useLight } from "@/context/LightContext";
import { useUsers } from "@/context/UsersContext";
import Image from "next/image";
import { useState } from "react";

export default function SearchPages() {
  const { isDark } = useLight();
  const { usersAll } = useUsers();

  const [query, setQuery] = useState("");

  // Filter hanya saat query diisi
  const filteredCreators =
    query.trim() === ""
      ? []
      : usersAll?.filter((user) => {
          const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
          const username = user.username?.toLowerCase();

          return (
            user.role?.role === "Creators" &&
            (fullName.includes(query.toLowerCase()) ||
              username.includes(query.toLowerCase()))
          );
        });

  return (
    <div
      className={`min-h-screen ${
        isDark ? "bg-black text-white" : "bg-transparent text-gray-900"
      }`}
    >
      {/* SEARCH HEADER */}
      <div
        className={`sticky top-0 z-20 border-b ${
          isDark ? "border-gray-800 bg-black" : "border-gray-200 bg-white"
        }`}
      >
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search creator, post, or group..."
              className={`w-full rounded-xl px-12 py-3 text-sm border focus:outline-none focus:ring-2 ${
                isDark
                  ? "bg-gray-900 text-white placeholder-gray-400 focus:ring-blue-500 border-gray-700"
                  : "bg-gray-100 text-gray-900 placeholder-gray-500 focus:ring-blue-500 border-gray-200"
              }`}
            />

            {/* SEARCH ICON */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* RESULTS */}
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-2">
        {query.trim() !== "" &&
          (filteredCreators.length > 0 ? (
            filteredCreators.map((user) => (
              <div
                key={user.id_users}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer ${
                  isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"
                }`}
              >
                <Image
                  src={user.foto || "/avatar.png"}
                  alt={user.username}
                  width={48}
                  height={48}
                  unoptimized
                  className="rounded-full object-cover border border-gray-300"
                />

                <div>
                  <p className="font-semibold leading-tight">
                    {user.first_name} {user.last_name}
                  </p>
                  <p className="text-sm text-gray-500">{user.username}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-400">No creators found.</p>
          ))}
      </div>
    </div>
  );
}
