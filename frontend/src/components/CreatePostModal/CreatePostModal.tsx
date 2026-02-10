"use client";

import { useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { gatedContentAbi } from "@/abi/GatedContent";

const GATED_CONTENT_ADDRESS = process.env.NEXT_PUBLIC_GATED_CONTENT_ADDRESS as `0x${string}`;

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const TIERS = [
  { id: 1, name: "Bronze", emoji: "🥉" },
  { id: 2, name: "Silver", emoji: "🥈" },
  { id: 3, name: "Gold", emoji: "🥇" },
];

export default function CreatePostModal({ isOpen, onClose, onSuccess }: CreatePostModalProps) {
  const [content, setContent] = useState("");
  const [minTier, setMinTier] = useState(1);
  const [isPublic, setIsPublic] = useState(false);
  const [viralScore, setViralScore] = useState("0");

  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const handleCreate = async () => {
    if (!content) return;

    try {
      writeContract({
        address: GATED_CONTENT_ADDRESS,
        abi: gatedContentAbi,
        functionName: "createExclusivePost",
        args: [
            isPublic ? BigInt(0) : BigInt(minTier),
            content,
            BigInt(100) // Default threshold
        ]
      });
    } catch (err) {
      console.error("Create post error:", err);
    }
  };

  // Close on success
  if (isSuccess) {
    onSuccess();
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl max-w-lg w-full mx-4 p-6 shadow-2xl relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold text-gray-900 mb-6">Create New Post</h2>

        <div className="space-y-4">
          {/* Content Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind? (Exclusive content goes here)"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 h-32 resize-none"
            />
          </div>

          {/* Visibility Toggle */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsPublic(!isPublic)}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                isPublic
                  ? "bg-green-100 text-green-700 border-2 border-green-500"
                  : "bg-gray-100 text-gray-500 border-2 border-transparent"
              }`}
            >
              🌍 Public
            </button>
            <button
              onClick={() => setIsPublic(false)}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                !isPublic
                  ? "bg-purple-100 text-purple-700 border-2 border-purple-500"
                  : "bg-gray-100 text-gray-500 border-2 border-transparent"
              }`}
            >
              🔒 Exclusive
            </button>
          </div>

          {/* Tier Selection (Only if Exclusive) */}
          {!isPublic && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Tier Required
              </label>
              <div className="grid grid-cols-3 gap-3">
                {TIERS.map((tier) => (
                  <button
                    key={tier.id}
                    onClick={() => setMinTier(tier.id)}
                    className={`py-2 px-3 rounded-lg border-2 transition text-sm font-semibold flex items-center justify-center gap-2 ${
                      minTier === tier.id
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 hover:border-gray-300 text-gray-600"
                    }`}
                  >
                    <span>{tier.emoji}</span>
                    {tier.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
              {error.message.includes("User rejected") ? "Transaction rejected" : "Failed to create post"}
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleCreate}
            disabled={!content || isPending || isConfirming}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed mt-4"
          >
            {isPending
              ? "Confirm in Wallet..."
              : isConfirming
              ? "Posting..."
              : "Post Content"}
          </button>
        </div>
      </div>
    </div>
  );
}
