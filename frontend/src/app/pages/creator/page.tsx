"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useWallet } from "@/context/WalletContext";
import { useLight } from "@/context/LightContext";
import { subscriptionManagerAbi } from "@/abi/SubscriptionManager";
import { supabase } from "@/lib/supabase";

const SUBSCRIPTION_MANAGER_ADDRESS = process.env.NEXT_PUBLIC_SUBSCRIPTION_MANAGER_ADDRESS as `0x${string}`;

export default function CreatorRegistrationPage() {
  const router = useRouter();
  const { address } = useAccount();
  const { role, setRole } = useWallet();
  const { isDark } = useLight();
  
  const [handle, setHandle] = useState("");
  const [fid, setFid] = useState("");
  const [step, setStep] = useState<"input" | "verifying" | "signing" | "success" | "error">("input");
  const [error, setError] = useState("");
  const [verificationData, setVerificationData] = useState<{
    followerCount: number;
    signature: string;
    username: string;
  } | null>(null);

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  // Already a creator check
  if (role === "creator") {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? "bg-black" : "bg-gray-50"}`}>
        <div className={`rounded-2xl p-8 max-w-md text-center border ${isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100 shadow-xl"}`}>
          <h1 className="text-2xl font-bold text-green-500 mb-4">✓ Already Registered</h1>
          <p className={`${isDark ? "text-gray-400" : "text-gray-600"} mb-6`}>You are already registered as a creator!</p>
          <button
            onClick={() => router.push("/pages/profile")}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
          >
            Go to Profile
          </button>
        </div>
      </div>
    );
  }

  // Verify followers via API
  const handleVerify = async () => {
    if (!fid || !address) {
      setError("Please enter your Farcaster FID");
      return;
    }

    setStep("verifying");
    setError("");

    try {
      const response = await fetch("/api/verify-followers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fid, walletAddress: address }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Verification failed");
        setStep("error");
        return;
      }

      if (!data.success) {
        setError(data.error || "Insufficient followers");
        setStep("error");
        return;
      }

      setVerificationData({
        followerCount: data.followerCount,
        signature: data.signature,
        username: data.username,
      });
      setHandle(data.username); // Use Farcaster username as handle
      setStep("signing");
    } catch (err) {
      console.error("Verification error:", err);
      setError("Failed to verify followers. Please try again.");
      setStep("error");
    }
  };

  // Register on-chain
  const handleRegister = async () => {
    if (!verificationData || !handle) return;

    try {
      console.log("--- CONTRACT CALL DEBUG ---");
      console.log("Handle:", handle);
      console.log("Followers:", verificationData.followerCount);
      console.log("Signature:", verificationData.signature);
      console.log("Address (msg.sender):", address);
      console.log("---------------------------");

      writeContract({
        address: SUBSCRIPTION_MANAGER_ADDRESS,
        abi: subscriptionManagerAbi,
        functionName: "registerCreator",
        args: [handle, BigInt(verificationData.followerCount), verificationData.signature as `0x${string}`],
      });
    } catch (err) {
      console.error("Registration error:", err);
      setError("Failed to submit transaction");
      setStep("error");
    }
  };

  // Update Supabase after successful tx
  const handleSuccess = async () => {
    if (!address) return;
    
    try {
      await supabase
        .from("users")
        .update({ role: "creator", handle })
        .eq("wallet_address", address.toLowerCase());
      
      setRole("creator");
      setStep("success");
    } catch (err) {
      console.error("Supabase update error:", err);
    }
  };

  // Effect for transaction success
  if (isSuccess && step === "signing") {
    handleSuccess();
  }

  return (
    <div className={`min-h-screen py-12 px-4 transition-colors duration-300 ${isDark ? "bg-black" : "bg-gray-50"}`}>
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className={`text-3xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>Become a Creator</h1>
          <p className={`${isDark ? "text-gray-400" : "text-gray-500"}`}>Register to start earning from your content</p>
        </div>

        {/* Card */}
        <div className={`rounded-2xl p-6 transition-colors duration-300 ${
            isDark 
                ? "bg-black border border-gray-800" 
                : "bg-white shadow-xl border border-gray-100"
        }`}>
          {step === "input" && (
            <>
              <div className="mb-6">
                <label className={`block text-sm font-bold mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  Farcaster FID
                </label>
                <input
                  type="text"
                  value={fid}
                  onChange={(e) => setFid(e.target.value)}
                  placeholder="Enter your Farcaster FID (e.g., 12345)"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition
                    ${isDark 
                        ? "bg-gray-900 border-gray-700 text-white placeholder-gray-600" 
                        : "bg-white border-gray-200 text-gray-900 placeholder-gray-400"
                    }`}
                />
                <p className={`mt-2 text-xs font-medium ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                  Minimum 10,000 followers required
                </p>
              </div>

              <button
                onClick={handleVerify}
                disabled={!fid || !address}
                className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
              >
                Verify Followers
              </button>
            </>
          )}

          {step === "verifying" && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className={isDark ? "text-gray-400" : "text-gray-600"}>Verifying your Farcaster account...</p>
            </div>
          )}

          {step === "signing" && verificationData && (
            <>
              <div className={`border rounded-xl p-4 mb-6 ${isDark ? "bg-green-900/20 border-green-800" : "bg-green-50 border-green-200"}`}>
                <h3 className={`font-semibold mb-2 ${isDark ? "text-green-400" : "text-green-800"}`}>✓ Verification Passed</h3>
                <p className={`text-sm ${isDark ? "text-green-300" : "text-green-700"}`}>
                  @{verificationData.username} • {verificationData.followerCount.toLocaleString()} followers
                </p>
              </div>

              <div className="mb-6">
                <label className={`block text-sm font-bold mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  Creator Handle
                </label>
                <input
                  type="text"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition
                    ${isDark 
                        ? "bg-gray-900 border-gray-700 text-white" 
                        : "bg-white border-gray-200 text-gray-900"
                    }`}
                />
              </div>

              <button
                onClick={handleRegister}
                disabled={isPending || isConfirming || !handle}
                className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 transition disabled:bg-gray-400 shadow-lg shadow-blue-500/20"
              >
                {isPending ? "Confirm in Wallet..." : isConfirming ? "Registering..." : "Register as Creator"}
              </button>
            </>
          )}

          {step === "success" && (
            <div className="text-center py-8">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isDark ? "bg-green-900/30 text-green-400" : "bg-green-100 text-green-600"}`}>
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className={`text-2xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>Welcome, Creator!</h2>
              <p className={`mb-6 ${isDark ? "text-gray-400" : "text-gray-600"}`}>You are now registered on the platform.</p>
              <button
                onClick={() => router.push("/pages/profile")}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-500/20"
              >
                Set Up Your Profile
              </button>
            </div>
          )}

          {step === "error" && (
            <div className="text-center py-8">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isDark ? "bg-red-900/30 text-red-400" : "bg-red-100 text-red-600"}`}>
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className={`text-xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>Verification Failed</h2>
              <p className={`mb-6 ${isDark ? "text-red-400" : "text-red-600"}`}>{error}</p>
              <button
                onClick={() => { setStep("input"); setError(""); }}
                className={`px-6 py-3 rounded-xl font-bold transition
                    ${isDark 
                        ? "bg-gray-800 text-white hover:bg-gray-700" 
                        : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                    }`}
              >
                Try Again
              </button>
            </div>
          )}
        </div>

        {/* Back link */}
        <div className="text-center mt-6">
          <button
            onClick={() => router.back()}
            className={`transition font-medium ${isDark ? "text-gray-500 hover:text-white" : "text-gray-400 hover:text-gray-900"}`}
          >
            ← Back
          </button>
        </div>
      </div>
    </div>
  );
}
