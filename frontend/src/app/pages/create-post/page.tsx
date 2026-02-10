"use client";

import { useEffect, useState, useRef } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { gatedContentAbi } from "@/abi/GatedContent";
import { useRouter } from "next/navigation";
import { useLight } from "@/context/LightContext";
import { usePosts } from "@/context/PostsContext";

const GATED_CONTENT_ADDRESS = process.env.NEXT_PUBLIC_GATED_CONTENT_ADDRESS as `0x${string}`;

const TIERS = [
  { id: 1, name: "Bronze", emoji: "🥉" },
  { id: 2, name: "Silver", emoji: "🥈" },
  { id: 3, name: "Gold", emoji: "🥇" },
];

export default function CreatePostPage() {
  const router = useRouter();
  const { isDark } = useLight();
  const { refreshPosts } = usePosts();
  
  const [content, setContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaPreview, setMediaPreview] = useState("");
  const [minTier, setMinTier] = useState(1);
  const [threshold, setThreshold] = useState(50);
  const [isPublic, setIsPublic] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const handleCreate = async () => {
    // Combine media and caption if both exist, or just use one
    // Format: "MediaURL \n\n Caption"
    // Use text input URL OR file input Blob URL
    const imageToUse = mediaUrl || mediaPreview;
    
    let finalContent = "";
    if (imageToUse) {
        finalContent += `${imageToUse}\n\n`;
    }
    finalContent += content;

    if (!finalContent.trim()) return;

    try {
      writeContract({
        address: GATED_CONTENT_ADDRESS,
        abi: gatedContentAbi,
        functionName: "createExclusivePost",
        args: [
            isPublic ? BigInt(0) : BigInt(minTier),
            finalContent,
            BigInt(threshold)
        ]
      });
    } catch (err) {
      console.error("Create post error:", err);
    }
  };

  // Redirect on success
  useEffect(() => {
    if (isSuccess) {
      refreshPosts(); // Update feed
      router.push("/"); // Back to home
    }
  }, [isSuccess, router, refreshPosts]);

  // Mock File Selection (For MVP, we just use URL input or mock "upload" to a preview)
  // In real app: Upload to IPFS/Supabase here
  // Helper to compress image
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 600;
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;

          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          // Compress to JPEG 70% quality
          const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
          resolve(dataUrl);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressedBase64 = await compressImage(file);
        setMediaPreview(compressedBase64);
      } catch (err) {
        console.error("Compression failed", err);
      }
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? "bg-black text-white" : "bg-white text-gray-900"} pb-24`}>
       {/* Header */}
       <div className={`sticky top-0 z-50 flex items-center justify-between px-4 py-4 ${isDark ? "bg-black/80 backdrop-blur-md" : "bg-white/80 backdrop-blur-md"}`}>
        <button 
          onClick={() => router.back()}
          className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h1 className="text-lg font-bold">New Post</h1>
        <button 
            onClick={handleCreate}
            disabled={(!content && !mediaUrl && !mediaPreview) || isPending || isConfirming}
            className="text-blue-500 font-bold disabled:text-gray-500 disabled:cursor-not-allowed"
        >
            {isPending ? "Posting..." : "Post"}
        </button>
       </div>

      <div className="max-w-xl mx-auto">
        
        {/* MEDIA UPLOAD AREA */}
        <div className="w-full aspect-[4/5] bg-gray-100 dark:bg-gray-900 relative mb-4 group overflow-hidden">
            {mediaPreview || mediaUrl ? (
                <>
                    <img 
                        src={mediaPreview || mediaUrl} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                    />
                    <button 
                        onClick={() => {
                            setMediaPreview("");
                            setMediaUrl("");
                        }}
                        className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                </>
            ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                     <button 
                        onClick={() => fileInputRef.current?.click()} // For file trigger
                        className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center mb-4 transition transform group-hover:scale-110"
                    >
                        <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                    </button>
                    <p className="font-medium">Add Photo or Video</p>
                    {/* Fallback URL input for MVP since we don't have real upload server yet */}
                    <input 
                        type="text" 
                        placeholder="Or paste image URL..."
                        value={mediaUrl}
                        onChange={(e) => setMediaUrl(e.target.value)}
                        className="mt-4 bg-transparent border-b border-gray-300 dark:border-gray-700 focus:border-blue-500 outline-none text-center text-sm w-3/4"
                    />
                </div>
            )}
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*,video/*"
                onChange={handleFileChange}
            />
        </div>

        {/* CAPTION AREA */}
        <div className="px-4 mb-6">
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write a caption..."
                className={`w-full py-2 bg-transparent border-none focus:ring-0 resize-none h-20 placeholder-gray-400 text-lg ${isDark ? "text-white" : "text-gray-900"}`}
            />
        </div>

        {/* SETTINGS TOGGLE */}
        <div className="px-4">
            <button 
                onClick={() => setShowSettings(!showSettings)}
                className={`flex items-center gap-2 text-sm font-semibold mb-4 ${showSettings ? "text-blue-500" : "text-gray-500"}`}
            >
                <svg className={`w-5 h-5 transition-transform ${showSettings ? "rotate-90" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                Post Settings
            </button>

            {/* SETTINGS CARD */}
            {showSettings && (
                <div className={`rounded-xl p-4 animate-in slide-in-from-top-2 overflow-hidden ${isDark ? "bg-gray-900" : "bg-gray-50 border border-gray-100"}`}>
                    
                    {/* Visibility */}
                    <div className="mb-6">
                        <label className="block text-xs font-bold mb-3 text-gray-500 uppercase tracking-wider">Who can see this?</label>
                        <div className="flex bg-gray-200 dark:bg-gray-800 rounded-lg p-1">
                            <button
                                onClick={() => setIsPublic(true)}
                                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition ${
                                    isPublic
                                        ? "bg-white dark:bg-gray-700 shadow-sm text-green-600"
                                        : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
                                }`}
                            >
                                🌍 Everyone
                            </button>
                            <button
                                onClick={() => setIsPublic(false)}
                                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition ${
                                    !isPublic
                                        ? "bg-white dark:bg-gray-700 shadow-sm text-purple-600"
                                        : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
                                }`}
                            >
                                🔒 Subscribers
                            </button>
                        </div>
                    </div>

                    {/* Tier Selection */}
                    {!isPublic && (
                        <div>
                            <label className="block text-xs font-bold mb-3 text-gray-500 uppercase tracking-wider">
                                Minimum Tier
                            </label>
                            <div className="grid grid-cols-3 gap-3 mb-6">
                                {TIERS.map((tier) => (
                                <button
                                    key={tier.id}
                                    onClick={() => setMinTier(tier.id)}
                                    className={`py-2 px-2 rounded-xl border-2 transition text-xs font-bold flex flex-col items-center gap-1 ${
                                    minTier === tier.id
                                        ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300"
                                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-500"
                                    }`}
                                >
                                    <span className="text-lg">{tier.emoji}</span>
                                    {tier.name}
                                </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Vote Threshold Slider */}
                    <div className="mb-2">
                        <label className="block text-xs font-bold mb-3 text-gray-500 uppercase tracking-wider">
                            Vote Threshold ({threshold} votes)
                        </label>
                        <input
                            type="range"
                            min="1"
                            max="29"
                            step="1"
                            value={threshold <= 10 ? threshold : 10 + (threshold - 10) / 10}
                            onChange={(e) => {
                                const val = Number(e.target.value);
                                if (val <= 10) {
                                    setThreshold(val);
                                } else {
                                    setThreshold((val - 9) * 10);
                                }
                            }}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                            style={{
                                backgroundImage: `linear-gradient(to right, #3b82f6 ${((threshold <= 10 ? threshold : 10 + (threshold - 10) / 10) - 1) / (29 - 1) * 100}%, transparent ${((threshold <= 10 ? threshold : 10 + (threshold - 10) / 10) - 1) / (29 - 1) * 100}%)`
                            }}
                        />
                         <div className="flex justify-between text-xs text-gray-400 mt-2 font-medium">
                            <span>1</span>
                            <span>10</span>
                            <span>50</span>
                            <span>100</span>
                            <span>200</span>
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* Error Message */}
        {error && (
            <div className="mx-4 mt-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-xl flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                {error.message.includes("User rejected") ? "Transaction rejected" : "Failed to create post"}
            </div>
        )}
      </div>
    </div>
  );
}
