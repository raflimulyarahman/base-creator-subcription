export const CONTRACT_ADDRESSES = {
  TieredBadge: process.env.NEXT_PUBLIC_TIERED_BADGE_ADDRESS as `0x${string}`,
  SubscriptionManager: process.env
    .NEXT_PUBLIC_SUBSCRIPTION_MANAGER_ADDRESS as `0x${string}`,
  GatedContent: process.env.NEXT_PUBLIC_GATED_CONTENT_ADDRESS as `0x${string}`,
};

Object.entries(CONTRACT_ADDRESSES).forEach(([key, value]) => {
  if (!value) throw new Error(`Missing contract address: ${key}`);
});
