"use client";

import { useLight } from "@/context/LightContext";
import { useUsers } from "@/context/UsersContext";
import { useEffect, useState } from "react";
import Image from "next/image";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
  const { isDark } = useLight();
  const { user, updateProfileUsers } = useUsers();
  
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const DEFAULT_AVATAR = "/11789135.png";

  useEffect(() => {
    if (user && isOpen) {
      // Handle legacy first/last name vs new single name field
      const fullName = user.name || (user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : "") || "";
      setName(fullName);
      setUsername(user.username || user.handle || ""); // handle legacy handle field
      setAvatarUrl(user.avatar_url || user.foto || "");
    }
  }, [user, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setIsLoading(true);
    setError("");

    try {
      // Create FormData to match the existing context signature
      // The context will now convert this to JSON for the API, but we keep signature for now
      const formData = new FormData();
      
      // Split name back to first/last for compatibility if needed, 
      // but ideally we just use 'name' in the API. using first_name as full name carrier for now
      formData.append("first_name", name); 
      formData.append("last_name", ""); 
      formData.append("username", username);
      formData.append("avatar_url", avatarUrl);
      
      // Dummy file to satisfy legacy checks if any, though our updated context ignores it for API calls
      // formData.append("foto", new File([""], "filename"));
      
      // We need to pass a File object for 'foto' to satisfy TypeScript if the context expects it
      // But our updated updateProfileUsers only uses it for contract calls (which we skipped)
      // For the API call, it uses avatar_url from the body we constructed in context
      
      // However, looking at the context implementation:
      // const fotoFile = formData.get("foto") as File;
      // It tries to acccess .name on it. So we must provide a dummy file.
      formData.append("foto", new File([""], "placeholder.png"));

      const res = await updateProfileUsers(user.id as any, formData);
      
      if (res) {
        onClose();
      } else {
        setError("Failed to update profile");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className={`${isDark ? "bg-gray-800 text-white" : "bg-white text-gray-900"} rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden`}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold">Edit Profile</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-100 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Avatar Preview & URL Input */}
          <div className="flex flex-col items-center gap-4 mb-4">
            <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-200 border-2 border-gray-300">
              <Image 
                src={avatarUrl || DEFAULT_AVATAR} 
                alt="Avatar Preview" 
                fill 
                className="object-cover"
                unoptimized
                onError={(e) => {
                  // Fallback to default if URL is invalid
                  const target = e.target as HTMLImageElement;
                  target.src = DEFAULT_AVATAR;
                }}
              />
            </div>
            
            <div className="w-full">
              <label className="block text-sm font-medium mb-1">Avatar Image URL</label>
              <input
                type="text"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/my-photo.jpg"
                className={`w-full px-4 py-2 rounded-xl border ${isDark ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"} focus:ring-2 focus:ring-blue-500`}
              />
              <p className="text-xs text-gray-500 mt-1">Paste a direct link to an image (JPG/PNG)</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full px-4 py-2 rounded-xl border ${isDark ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"} focus:ring-2 focus:ring-blue-500`}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Username (Handle)</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`w-full px-4 py-2 rounded-xl border ${isDark ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"} focus:ring-2 focus:ring-blue-500`}
              required
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 py-2.5 rounded-xl font-semibold ${isDark ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-200 hover:bg-gray-300"}`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-semibold hover:bg-blue-700 disabled:bg-gray-400"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
