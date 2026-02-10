"use client";

import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { gatedContentAbi } from "@/abi/GatedContent";
import { CONTRACT_ADDRESSES } from "@/config/contract";
import { useLight } from "@/context/LightContext";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const TIER_OPTIONS = [
  { id: 1, name: "Bronze", icon: "🥉", description: "Accessible to Bronze+ subscribers" },
  { id: 2, name: "Silver", icon: "🥈", description: "Accessible to Silver+ subscribers" },
  { id: 3, name: "Gold", icon: "🥇", description: "Exclusive to Gold subscribers" },
];

export default function CreatePostModal({ isOpen, onClose, onSuccess }: CreatePostModalProps) {
  const { address } = useAccount();
  const { isDark } = useLight();
  
  const [content, setContent] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [minTier, setMinTier] = useState(1);
  const [threshold, setThreshold] = useState(50);
  const [step, setStep] = useState<"form" | "confirm" | "success">("form");

  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  // For now, we'll use the content directly as contentHash
  // In production, you'd upload to IPFS first and use the hash
  // Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  // Generate mock IPFS hash
  const generateContentHash = (text: string, image?: File | null) => {
    // In production, upload image -> IPFS, get hash
    // Then upload metadata (text + imageHash) -> IPFS, get hash
    
    // For demo, we'll encode logic in the string:
    // ipfs://demo_[timestamp]_[text]_[hasImage]
    const imageFlag = image ? "_img" : "";
    return `ipfs://demo_${Date.now()}_${text.slice(0, 15).replace(/\s/g, '_')}${imageFlag}`;
  };

  const handleSubmit = () => {
    if (!content.trim() || !address) return;
    setStep("confirm");
  };

  const handleConfirm = async () => {
    if (!content.trim() || !address) return;

    const contentHash = generateContentHash(content, selectedImage);

    try {
      writeContract({
        address: CONTRACT_ADDRESSES.GatedContent,
        abi: gatedContentAbi,
        functionName: "createExclusivePost",
        args: [BigInt(minTier), contentHash, BigInt(threshold)],
      });
    } catch (err) {
      console.error("Create post error:", err);
    }
  };

  useEffect(() => {
    if (isSuccess) {
      setStep("success");
      setTimeout(() => {
        onSuccess?.();
        onClose();
        // Reset form
        setContent("");
        setSelectedImage(null);
        setImagePreview(null);
        setMinTier(1);
        setThreshold(50);
        setStep("form");
      }, 2000);
    }
  }, [isSuccess, onClose, onSuccess]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl max-w-lg w-full shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold">Create Exclusive Post</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {/* Success State */}
          {step === "success" && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Post Created!</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Your exclusive content is now live.
              </p>
            </div>
          )}

          {/* Confirm State */}
          {step === "confirm" && (
            <>
              <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-4 mb-6">
                <h3 className="font-semibold mb-2">Review Your Post</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4 whitespace-pre-wrap">{content}</p>
                {imagePreview && (
                  <div className="mb-4 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
                    <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover" />
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span>Min Tier: {TIER_OPTIONS[minTier - 1].name}</span>
                  <span>Vote Threshold: {threshold}</span>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">Transaction failed. Please try again.</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep("form")}
                  className="flex-1 py-3 rounded-xl font-semibold bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                >
                  Back
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={isPending || isConfirming}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {isPending ? "Confirm in Wallet..." : isConfirming ? "Creating..." : "Create Post"}
                </button>
              </div>
            </>
          )}

          {/* Form State */}
          {step === "form" && (
            <>
              {/* Content Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Content</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="What's on your mind? Share exclusive content with your subscribers..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 resize-none"
                />
                
                {/* Image Upload */}
                <div className="mt-3">
                  {imagePreview ? (
                    <div className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600">
                      <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover" />
                      <button
                        onClick={removeImage}
                        className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 rounded-full text-white transition"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <label className="flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition">
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Add an image (optional)</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Min Tier Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Minimum Tier Required</label>
                <div className="grid grid-cols-3 gap-2">
                  {TIER_OPTIONS.map((tier) => (
                    <button
                      key={tier.id}
                      onClick={() => setMinTier(tier.id)}
                      className={`p-3 rounded-xl border-2 text-center transition ${
                        minTier === tier.id
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-400"
                      }`}
                    >
                      <span className="text-2xl">{tier.icon}</span>
                      <p className="text-sm font-medium mt-1">{tier.name}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Vote Threshold */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  Vote Threshold for Public Release
                  <span className="font-normal text-gray-500 dark:text-gray-400"> ({threshold} votes)</span>
                </label>
                
                {/* 
                  Logic: 
                  Slider 1-10 -> Values 1-10 (Step 1)
                  Slider 11-29 -> Values 20-200 (Step 10)
                */}
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
                    backgroundImage: `linear-gradient(to right, #2563eb ${((threshold <= 10 ? threshold : 10 + (threshold - 10) / 10) - 1) / (29 - 1) * 100}%, transparent ${((threshold <= 10 ? threshold : 10 + (threshold - 10) / 10) - 1) / (29 - 1) * 100}%)`
                  }}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1</span>
                  <span>10</span>
                  <span>50</span>
                  <span>100</span>
                  <span>200</span>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
                <p className="text-sm">
                  📢 Once your post reaches <strong>{threshold} votes</strong>, it will become public and early voters will receive rewards!
                </p>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={!content.trim()}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
