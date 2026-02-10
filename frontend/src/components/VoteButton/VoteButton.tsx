"use client";

import { useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { gatedContentAbi } from "@/abi/GatedContent";
import { CONTRACT_ADDRESSES } from "@/config/contract";

interface VoteButtonProps {
  postId: bigint;
  currentVotes: number;
  threshold: number;
  isPublic: boolean;
  onVoteSuccess?: () => void;
}

export default function VoteButton({
  postId,
  currentVotes,
  threshold,
  isPublic,
  onVoteSuccess,
}: VoteButtonProps) {
  const { address } = useAccount();

  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  // Check if user already voted
  const { data: voterInfoData } = useReadContract({
    address: CONTRACT_ADDRESSES.GatedContent,
    abi: gatedContentAbi,
    functionName: "voterInfo",
    args: address ? [postId, address] : undefined,
  });

  const hasVoted = voterInfoData?.[0];

  useEffect(() => {
    if (isSuccess && onVoteSuccess) {
      onVoteSuccess();
    }
  }, [isSuccess, onVoteSuccess]);

  const progressPercent = Math.min((currentVotes / threshold) * 100, 100);

  const handleVote = async () => {
    if (!address || hasVoted) return;

    try {
      writeContract({
        address: CONTRACT_ADDRESSES.GatedContent,
        abi: gatedContentAbi,
        functionName: "voteForPublicRelease",
        args: [postId],
      });
    } catch (err) {
      console.error("Vote error:", err);
    }
  };

  // Already public
  if (isPublic) {
    return (
      <div className="flex items-center gap-2 text-green-600">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        <span className="font-medium">Public</span>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Progress Bar */}
      <div className="mb-2">
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">
          <span>{currentVotes} votes</span>
          <span>{threshold} needed</span>
        </div>
        <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all duration-500 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Vote Button */}
      <button
        onClick={handleVote}
        disabled={!address || hasVoted || isPending || isConfirming || isSuccess}
        className={`w-full py-2.5 px-4 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 ${
          hasVoted || isSuccess
            ? "bg-green-100 text-green-700 border border-green-200 cursor-default dark:bg-green-900/20 dark:border-green-800 dark:text-green-400"
            : isPending || isConfirming
            ? "bg-gray-100 text-gray-500 cursor-wait dark:bg-gray-800 dark:text-gray-400"
            : "bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98] shadow-lg shadow-blue-500/20"
        }`}
      >
        {hasVoted || isSuccess ? (
          <>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Voted
          </>
        ) : isPending ? (
          "Confirming..."
        ) : isConfirming ? (
          "Processing..."
        ) : (
          "Vote for Public Release"
        )}
      </button>

      {/* Early Voter Badge */}
      {currentVotes < 10 && !hasVoted && !isPublic && (
        <p className="text-[10px] text-center text-gray-400 mt-2 font-medium">
          Early voter rewards available
        </p>
      )}

      {error && (
        <p className="text-xs text-center text-red-500 mt-2">
          Vote failed. Please try again.
        </p>
      )}
    </div>
  );
}
