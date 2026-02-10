# 📜 Deployed Smart Contracts - Base Sepolia

Deployment date: January 28, 2026 (Deployed with Auto-Verification)

## Contract Addresses (LATEST)

| Contract                | Address                                      | Explorer                                                                                            |
| ----------------------- | -------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| **TieredBadge**         | `0x14305550831c3707b5e014E3ceE08747aDe71ac4` | [View on BaseScan](https://sepolia.basescan.org/address/0x14305550831c3707b5e014E3ceE08747aDe71ac4) |
| **SubscriptionManager** | `0x13127807Ef2E0392e0f57e09e8b11608737E48E8` | [View on BaseScan](https://sepolia.basescan.org/address/0x13127807Ef2E0392e0f57e09e8b11608737E48E8) |
| **GatedContent**        | `0x57EEbE6499C62BB32129b73b7Bb9B90453eE39Af` | [View on BaseScan](https://sepolia.basescan.org/address/0x57EEbE6499C62BB32129b73b7Bb9B90453eE39Af) |

## Network Information

- **Network**: Base Sepolia Testnet
- **Chain ID**: 84532
- **RPC URL**: https://sepolia.base.org
- **Block Explorer**: https://sepolia.basescan.org

## ABI Files

ABIs tersedia di folder `abi/`:

- `abi/TieredBadge.json`
- `abi/SubscriptionManager.json`
- `abi/GatedContent.json`

## Usage Example

### JavaScript/TypeScript (ethers.js v6)

```javascript
import { ethers } from "ethers";
import TieredBadgeABI from "./abi/TieredBadge.json";
import SubscriptionManagerABI from "./abi/SubscriptionManager.json";
import GatedContentABI from "./abi/GatedContent.json";

const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");

// Contract instances
const tieredBadge = new ethers.Contract(
  "0x14305550831c3707b5e014E3ceE08747aDe71ac4",
  TieredBadgeABI,
  provider,
);

const subscriptionManager = new ethers.Contract(
  "0x13127807Ef2E0392e0f57e09e8b11608737E48E8",
  SubscriptionManagerABI,
  provider,
);

const gatedContent = new ethers.Contract(
  "0x57EEbE6499C62BB32129b73b7Bb9B90453eE39Af",
  GatedContentABI,
  provider,
);
```

### React Hook Example

```typescript
import { useContract } from "wagmi";
import SubscriptionManagerABI from "./abi/SubscriptionManager.json";

function useSubscriptionManager() {
  return useContract({
    address: "0x13127807Ef2E0392e0f57e09e8b11608737E48E8",
    abi: SubscriptionManagerABI,
  });
}
```

## Contract Structure

```
┌─────────────────────────────┐
│   SubscriptionManager       │
│   (Main Entry Point)        │
└─────────┬──────────┬────────┘
          │          │
          │          │
    ┌─────▼────┐  ┌──▼──────────┐
    │ TieredBadge│  │ GatedContent│
    │ (ERC1155)  │  │ (Access)    │
    └───────────┘  └─────────────┘
```

## Quick Start

### 1. Register as Creator

```javascript
const signer = await provider.getSigner();
const subManager = subscriptionManager.connect(signer);

// Get signature from backend first
const { signature, followerCount } = await fetch(
  "/api/get-creator-signature",
).then((r) => r.json());

// Register
await subManager.registerCreator("myhandle", followerCount, signature);
```

### 2. Configure Tier

```javascript
await subManager.configureTier(
  1, // TIER_BRONZE
  ethers.parseEther("0.01"), // price
  30 * 24 * 60 * 60, // duration (30 days)
  "Bronze Tier",
  "ipfs://metadata-uri",
  1000, // maxSupply
  0, // minHoldTime
);
```

### 3. Subscribe

```javascript
await subManager.subscribe(
  creatorAddress,
  1, // TIER_BRONZE
  { value: ethers.parseEther("0.01") },
);
```

### 4. Check Access

```javascript
const hasAccess = await gatedContent.checkAccess(
  creatorAddress,
  subscriberAddress,
  postId,
);
```

## Important Notes

### Signature Verification

SubscriptionManager menggunakan backend signature untuk verify follower count.

**Development Mode:**

```javascript
// Disable signature requirement untuk testing
await subscriptionManager.setSignatureRequired(false);
```

**Production Mode:**

```javascript
// Backend harus provide valid signature
const signature = await backend.signCreatorRegistration(
  userAddress,
  followerCount,
);
```

Refer to `SIGNATURE_GUIDE.md` for detailed signature implementation.

### Minimum Requirements

- **Follower Count**: 10,000 (MIN_FOLLOWER_COUNT)
- **Handle Length**: 3-32 characters
- **Platform Fee**: 0.5% (50 bps)

## Contract Features

### TieredBadge

- ERC-1155 soulbound badges
- 3 tier levels: Bronze (1), Silver (2), Gold (3)
- Loyalty bonus based on hold duration
- Non-transferable (soulbound)

### SubscriptionManager

- Creator registration with follower verification
- 3-tier subscription system
- Automatic revenue distribution (99.5% creator, 0.5% platform)
- Subscription renewal and upgrades
- Withdraw functionality

### GatedContent

- Per-post access control
- Tier-based content gating
- Creator ownership verification
- Integration with SubscriptionManager

## Environment Variables

```bash
# Frontend .env
NEXT_PUBLIC_TIERED_BADGE_ADDRESS=0x14305550831c3707b5e014E3ceE08747aDe71ac4
NEXT_PUBLIC_SUBSCRIPTION_MANAGER_ADDRESS=0x13127807Ef2E0392e0f57e09e8b11608737E48E8
NEXT_PUBLIC_GATED_CONTENT_ADDRESS=0x57EEbE6499C62BB32129b73b7Bb9B90453eE39Af
NEXT_PUBLIC_CHAIN_ID=84532
NEXT_PUBLIC_RPC_URL=https://sepolia.base.org
```

## Support

For issues or questions:

1. Check `SIGNATURE_GUIDE.md` for signature issues
2. Check `FIX_INVALID_SIGNATURE.md` for debugging
3. Review contract source in `src/` folder
