"use client";

import { useLight } from "@/context/LightContext";

interface TierCardProps {
  tierId: number;
  name: string;
  isSelected: boolean;
  isSaved?: boolean;
  onClick: () => void;
}

// Tier color schemes
const TIER_COLORS = {
  1: { // Bronze
    border: "border-orange-400",
    bg: "bg-orange-50 dark:bg-orange-900/20",
    text: "text-orange-700 dark:text-orange-400",
    icon: "🥉",
  },
  2: { // Silver
    border: "border-gray-400",
    bg: "bg-gray-100 dark:bg-gray-800",
    text: "text-gray-700 dark:text-gray-300",
    icon: "🥈",
  },
  3: { // Gold
    border: "border-yellow-500",
    bg: "bg-yellow-50 dark:bg-yellow-900/20",
    text: "text-yellow-700 dark:text-yellow-400",
    icon: "🥇",
  },
};

export default function TierCard({ tierId, name, isSelected, isSaved, onClick }: TierCardProps) {
  const { isDark } = useLight();
  const colors = TIER_COLORS[tierId as keyof typeof TIER_COLORS] || TIER_COLORS[1];

  return (
    <button
      onClick={onClick}
      className={`
        flex-1 p-3 rounded-xl border-2 transition-all duration-200
        ${isSelected 
          ? `${colors.border} ${colors.bg} ring-2 ring-offset-2 ring-offset-white dark:ring-offset-black ring-brand-blue`
          : `border-gray-200 dark:border-gray-700 hover:${colors.border}`
        }
      `}
    >
      <div className="flex flex-col items-center gap-1">
        <span className="text-2xl">{colors.icon}</span>
        <span className={`text-sm font-bold ${isSelected ? colors.text : 'text-gray-600 dark:text-gray-400'}`}>
          {name}
        </span>
        {isSaved && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
            Active
          </span>
        )}
      </div>
    </button>
  );
}
