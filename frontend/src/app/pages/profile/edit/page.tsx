"use client";

import { useLight } from "@/context/LightContext";
import { useUsers } from "@/context/UsersContext";
import { useWallet } from "@/context/WalletContext";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function EditProfilePage() {
  const router = useRouter();
  const { isDark } = useLight();
  const { user, updateProfileUsers } = useUsers();
  const { isLoading: isAuthLoading } = useWallet();
  
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const DEFAULT_AVATAR = "/11789135.png";

  useEffect(() => {
    if (user) {
      // Handle legacy first/last name vs new single name field
      const fullName = user.name || (user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : "") || "";
      setName(fullName);
      setUsername(user.username || user.handle || ""); // handle legacy handle field
      setAvatarUrl(user.avatar_url || user.foto || "");
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setIsLoading(true);
    setError("");

    try {
      const formData = new FormData();
      
      formData.append("first_name", name); 
      formData.append("last_name", ""); 
      formData.append("username", username);
      formData.append("avatar_url", avatarUrl);
      
      // Dummy file
      formData.append("foto", new File([""], "placeholder.png"));

      const res = await updateProfileUsers(user.id as any, formData);
      
      if (res) {
        router.push("/pages/profile");
      } else {
        alert("Failed to update profile. Server rejected the request.\n\nPossible cause: Missing 'SUPABASE_SERVICE_ROLE_KEY' in .env.local");
        setError("Failed to update profile. Check server logs.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthLoading || (!user && !error)) {
      return (
          <div className={`min-h-screen flex items-center justify-center ${isDark ? "bg-black text-white" : "bg-white text-gray-900"}`}>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
      );
  }

  return (
    <div className={`min-h-screen ${isDark ? "bg-black text-white" : "bg-white text-gray-900"} pb-12`}>
        {/* Header */}
       <div className={`sticky top-0 z-50 flex items-center justify-between px-4 py-4 border-b ${isDark ? "bg-black border-gray-800" : "bg-white border-gray-100"}`}>
        <button 
          onClick={() => router.back()}
          className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h1 className="text-lg font-bold">Edit Profile</h1>
        <div className="w-8"></div>
       </div>

      <div className="max-w-md mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Avatar Preview & URL Input */}
          <div className="flex flex-col items-center gap-6 mb-6">
            <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-200 border-4 border-gray-100 dark:border-gray-800 shadow-xl">
              <Image 
                src={avatarUrl || DEFAULT_AVATAR} 
                alt="Avatar Preview" 
                fill 
                className="object-cover"
                unoptimized
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = DEFAULT_AVATAR;
                }}
              />
            </div>
            
            <div className="w-full">
              <label className="block text-sm font-bold mb-2 uppercase tracking-wide text-gray-500">Avatar Image URL</label>
              <input
                type="text"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/my-photo.jpg"
                className={`w-full px-4 py-3 rounded-xl border ${isDark ? "bg-gray-900 border-gray-700 focus:border-blue-500" : "bg-gray-50 border-gray-200 focus:border-blue-500"} outline-none transition`}
              />
              <p className="text-xs text-gray-500 mt-2">Paste a direct link to an image (JPG/PNG)</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2 uppercase tracking-wide text-gray-500">Display Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border ${isDark ? "bg-gray-900 border-gray-700 focus:border-blue-500" : "bg-gray-50 border-gray-200 focus:border-blue-500"} outline-none transition`}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2 uppercase tracking-wide text-gray-500">Username (@)</label>
            <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">@</span>
                <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 rounded-xl border ${isDark ? "bg-gray-900 border-gray-700 focus:border-blue-500" : "bg-gray-50 border-gray-200 focus:border-blue-500"} outline-none transition`}
                required
                />
            </div>
          </div>

          <div className="pt-6">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 transition"
            >
              {isLoading ? "Saving changes..." : "Save Profile"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className={`w-full mt-3 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition ${isDark ? "text-gray-400" : "text-gray-500"}`}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
