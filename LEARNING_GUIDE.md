# 🎓 Base Creator Subscriptions - Complete Learning Guide

> **Panduan belajar smart contract untuk Base Creator Subscriptions**  
> Dari pemula sampai paham sepenuhnya!

---

## 📚 Table of Contents

1. [Solidity Basics](#1-solidity-basics)
2. [ERC-1155 Deep Dive](#2-erc-1155-deep-dive)
3. [Contract Architecture](#3-contract-architecture)
4. [Security Patterns](#4-security-patterns)
5. [Flow Details](#5-flow-details)
6. [Testing & Deployment](#6-testing--deployment)

---

# 1. Solidity Basics

## 1.1 File Structure

```solidity
// SPDX-License-Identifier: MIT      // License (wajib)
pragma solidity ^0.8.20;              // Versi Solidity

import "@openzeppelin/...";           // Import library

contract MyContract {
    // State variables
    // Events
    // Errors
    // Modifiers
    // Constructor
    // Functions
}
```

## 1.2 Tipe Data Penting

| Tipe      | Contoh           | Penjelasan                |
| --------- | ---------------- | ------------------------- |
| `uint256` | `123`, `1 ether` | Angka positif (0 - 2^256) |
| `address` | `0x123...abc`    | Alamat wallet (20 bytes)  |
| `bool`    | `true`, `false`  | Boolean                   |
| `string`  | `"Hello"`        | Text                      |
| `bytes32` | `0xabc...`       | Data 32 bytes             |

## 1.3 Special Values

```solidity
msg.sender       // Address pemanggil
msg.value        // ETH yang dikirim (wei)
block.timestamp  // Waktu sekarang (seconds)
```

## 1.4 Wei & Ether

```solidity
1 ether = 1e18 wei = 1,000,000,000,000,000,000 wei

// Contoh:
0.001 ether = 1e15 wei
0.01 ether  = 1e16 wei
```

## 1.5 Mappings

```solidity
// Simple
mapping(address => uint256) public balances;

// Nested (sesuai PDF brief)
mapping(address => mapping(address => Subscription)) public subscriptions;
// subscriptions[creator][subscriber] = Subscription data
```

## 1.6 Structs

```solidity
// Sesuai PDF brief
struct Creator {
    address wallet;
    string handle;           // Username unik
    uint256 tierIds;         // Bitmask tiers
    bool isActive;
    uint256 totalSubscribers;// Counter subscribers
}
```

## 1.7 Function Types

```solidity
function publicFunc() public { }     // Siapa aja bisa call
function externalFunc() external { } // Hanya dari luar
function view() returns (...) { }    // Baca saja
function pure() { }                  // Tidak baca/tulis state
function payable() { }               // Bisa terima ETH
```

## 1.8 Custom Errors (Gas Efficient)

```solidity
// ❌ Old way (mahal)
require(amount > 0, "Amount must be > 0"); // ~200 gas/char

// ✅ New way (murah)
error InvalidAmount();
if (amount == 0) revert InvalidAmount(); // ~24 gas fixed
```

---

# 2. ERC-1155 Deep Dive

## 2.1 Kenapa ERC-1155?

| Feature            | ERC-721    | ERC-1155           |
| ------------------ | ---------- | ------------------ |
| Token per contract | 1 jenis    | Banyak jenis       |
| Batch operations   | ❌         | ✅                 |
| Gas efficiency     | Rendah     | Tinggi             |
| Use case           | Unique art | Game items, badges |

## 2.2 Token ID Strategy (Sesuai PDF Brief)

```
tokenId = creatorIndex × 1000 + tierLevel

Creator #5:
┌─────────┬──────────┐
│  Tier   │ Token ID │
├─────────┼──────────┤
│ Bronze  │   5001   │
│ Silver  │   5002   │
│ Gold    │   5003   │
└─────────┴──────────┘

Decode:
creatorIndex = 5001 / 1000 = 5
tierLevel    = 5001 % 1000 = 1
```

## 2.3 Soulbound Implementation

```solidity
function _update(...) internal override {
    // Allow: mint (from=0), burn (to=0)
    // Block: transfer (from!=0 && to!=0)
    if (from != address(0) && to != address(0)) {
        revert TransferNotAllowed();
    }
    super._update(...);
}
```

---

# 3. Contract Architecture

## 3.1 System Diagram

```
┌─────────────────────────────────────────────────────┐
│                    USER LAYER                        │
├─────────────────────────────────────────────────────┤
│                                                      │
│   CREATOR                        FAN                 │
│   ┌──────────────┐              ┌──────────────┐    │
│   │ register     │              │ subscribe    │    │
│   │ ("handle",   │              │ (creator,    │    │
│   │  basePrice)  │              │  tierId)     │    │
│   └──────┬───────┘              └──────┬───────┘    │
│          │                             │            │
│          └───────────┬─────────────────┘            │
│                      ▼                               │
│          ┌──────────────────────┐                   │
│          │ SUBSCRIPTION MANAGER │                   │
│          │ ──────────────────── │                   │
│          │ • handle (unique)    │                   │
│          │ • totalSubscribers   │                   │
│          │ • checkAccess()      │                   │
│          │ • creatorRevenue     │                   │
│          └──────────┬───────────┘                   │
│                     │                                │
│       ┌─────────────┴─────────────┐                 │
│       ▼                           ▼                 │
│  ┌────────────────┐     ┌────────────────────┐     │
│  │ TIERED BADGE   │     │ GATED CONTENT      │     │
│  │ ────────────── │     │ ────────────────── │     │
│  │ • Tier struct  │     │ • viralScore       │     │
│  │ • getTierLevel │◄────│ • voteForPublic    │     │
│  │ • loyaltyBonus │     │ • distributeRewards│     │
│  │ • soulbound    │     │                    │     │
│  └────────────────┘     └────────────────────┘     │
│                                                      │
└─────────────────────────────────────────────────────┘
```

## 3.2 Data Structures (Sesuai PDF Brief)

### Creator Struct

```solidity
struct Creator {
    address wallet;
    string handle;           // "@alice" - unique username
    uint256 tierIds;         // Bitmask configured tiers
    bool isActive;
    uint256 totalSubscribers;// Counter naik/turun
    uint256 creatorIndex;    // Untuk token ID
    uint256 basePrice;
}
```

### Subscription Struct

```solidity
struct Subscription {
    address subscriber;
    uint256 tierId;          // 1/2/3
    uint256 startDate;       // Timestamp mulai
    uint256 renewalDate;     // Timestamp expired
    bool isActive;
}
```

### ExclusivePost Struct

```solidity
struct ExclusivePost {
    uint256 postId;
    address creator;
    uint256 minTierRequired;
    string contentHash;      // IPFS CID
    uint256 createdAt;
    bool isPublic;
    uint256 viralScore;      // Weighted engagement
    uint256 conversionThreshold;
    uint256 currentVotes;
}
```

### Tier Struct

```solidity
struct Tier {
    string name;             // "Bronze", "Silver", "Gold"
    uint256 price;
    string metadataURI;      // IPFS untuk artwork
    uint256 maxSupply;       // Limit (0 = unlimited)
    uint256 currentSupply;
    uint256 minHoldTime;     // Minimum hold sebelum upgrade
}
```

---

# 4. Security Patterns

## 4.1 CEI Pattern (Critical!)

```solidity
function withdraw() external {
    // 1. CHECKS - Validasi
    uint256 amount = balances[msg.sender];
    require(amount > 0, "Nothing to withdraw");

    // 2. EFFECTS - Update state DULU
    balances[msg.sender] = 0;  // ← SEBELUM transfer!

    // 3. INTERACTIONS - External call TERAKHIR
    (bool success, ) = msg.sender.call{value: amount}("");
    require(success);
}
```

## 4.2 Pull Pattern

```solidity
// ❌ Push (dangerous)
function distribute() {
    for (user in users) {
        user.transfer(amount); // Bisa stuck!
    }
}

// ✅ Pull (safe)
function claim() {
    uint256 amount = rewards[msg.sender];
    rewards[msg.sender] = 0;
    msg.sender.transfer(amount);
}
```

## 4.3 Access Control

```solidity
modifier onlySubscriptionManager() {
    if (msg.sender != subscriptionManager) {
        revert NotAuthorized();
    }
    _;
}

function mint(...) external onlySubscriptionManager {
    // Only SubscriptionManager bisa call
}
```

---

# 5. Flow Details

## 5.1 Creator Registration (with Handle)

```
registerCreator("alice", 0.001 ether)
         │
         ▼
┌─────────────────────────────┐
│ 1. Check not registered     │
│ 2. Validate handle (3-32ch) │
│ 3. Check handle unique      │
│ 4. Increment creatorCount   │
│ 5. Store Creator data       │
│ 6. Map handle → address     │
│ 7. Register in badge        │
│ 8. Emit CreatorRegistered   │
└─────────────────────────────┘
```

## 5.2 Subscription & Badge Minting

```
subscribe(creator, tierId) + 0.01 ETH
         │
         ▼
┌─────────────────────────────┐
│ 1. Validate creator active  │
│ 2. Validate tier configured │
│ 3. Check payment >= price   │
│ 4. Check not subscribed     │
│ 5. Calculate fees (5%)      │
│ 6. Credit creator           │
│ 7. totalSubscribers++       │
│ 8. Mint badge via contract  │
│ 9. Store subscription       │
│10. Emit Subscribed          │
└─────────────────────────────┘
```

## 5.3 Viral Conversion (with viralScore)

```
voteForPublicRelease(postId)
         │
         ▼
┌─────────────────────────────┐
│ 1. Check post exists        │
│ 2. Check not public yet     │
│ 3. Check hasAccess (tier)   │
│ 4. Check not voted before   │
│ 5. Get voter tier           │
│ 6. Calculate vote weight:   │
│    Bronze=1, Silver=2, Gold=3│
│ 7. votes[user][post] = true │
│ 8. currentVotes++           │
│ 9. viralScore += weight     │
│10. Check threshold reached  │
│    → _convertToPublic()     │
│    → _distributeVoterRewards│
└─────────────────────────────┘
```

## 5.4 Loyalty Bonus

```solidity
function calculateLoyaltyBonus(uint256 holdDuration) returns (uint256) {
    if (holdDuration >= 365 days) return 100;
    if (holdDuration >= 180 days) return 50;
    if (holdDuration >= 90 days)  return 25;
    if (holdDuration >= 30 days)  return 10;
    return 0;
}
```

---

# 6. Testing & Deployment

## 6.1 Install Dependencies

```bash
cd base-creator-subscription

# OpenZeppelin
forge install OpenZeppelin/openzeppelin-contracts

# forge-std
forge install foundry-rs/forge-std
```

## 6.2 Run Tests

```bash
# All tests
forge test

# Verbose
forge test -vvv

# Specific test
forge test --match-test test_ViralConversion
```

## 6.3 Deploy to Base Sepolia

```bash
# Create .env
cp .env.example .env
# Edit with your PRIVATE_KEY

# Deploy
source .env
forge script script/Deploy.s.sol \
    --rpc-url $BASE_SEPOLIA_RPC_URL \
    --broadcast
```

---

## 📋 Summary: PDF Brief Compliance

| Feature                     | Contract            | Status |
| --------------------------- | ------------------- | ------ |
| `handle` in registerCreator | SubscriptionManager | ✅     |
| `totalSubscribers` counter  | SubscriptionManager | ✅     |
| `checkAccess()` function    | SubscriptionManager | ✅     |
| `creatorRevenue` mapping    | SubscriptionManager | ✅     |
| `Tier` struct               | TieredBadge         | ✅     |
| `getTierLevel()`            | TieredBadge         | ✅     |
| `calculateLoyaltyBonus()`   | TieredBadge         | ✅     |
| `creatorTiers` mapping      | TieredBadge         | ✅     |
| `viralScore`                | GatedContent        | ✅     |
| `_distributeVoterRewards()` | GatedContent        | ✅     |
| `PostWentPublic` event      | GatedContent        | ✅     |

---

> **Questions?** Ask anytime! 🚀
