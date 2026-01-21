export const subscriptionManagerAbi = [
  {
    "type": "function",
    "name": "registerCreator",
    "inputs": [
      {
        "name": "_handle",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "_followerCount",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "_signature",
        "type": "bytes",
        "internalType": "bytes"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "subscribe",
    "inputs": [
      {
        "name": "_creator",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "_tierId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "getCreator",
    "inputs": [
      {
        "name": "creator",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "tuple",
        "internalType": "struct SubscriptionManager.Creator",
        "components": [
          { "name": "wallet", "type": "address", "internalType": "address" },
          { "name": "handle", "type": "string", "internalType": "string" },
          { "name": "tierIds", "type": "uint256", "internalType": "uint256" },
          { "name": "isActive", "type": "bool", "internalType": "bool" },
          { "name": "totalSubscribers", "type": "uint256", "internalType": "uint256" },
          { "name": "creatorIndex", "type": "uint256", "internalType": "uint256" },
          { "name": "followerCount", "type": "uint256", "internalType": "uint256" }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "hasActiveSubscription",
    "inputs": [
      { "name": "subscriber", "type": "address", "internalType": "address" },
      { "name": "creator", "type": "address", "internalType": "address" }
    ],
    "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getSubscriptionTier",
    "inputs": [
      { "name": "subscriber", "type": "address", "internalType": "address" },
      { "name": "creator", "type": "address", "internalType": "address" }
    ],
    "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getTierConfig",
    "inputs": [
      { "name": "creator", "type": "address", "internalType": "address" },
      { "name": "tier", "type": "uint256", "internalType": "uint256" }
    ],
    "outputs": [
      {
        "name": "",
        "type": "tuple",
        "internalType": "struct SubscriptionManager.TierConfig",
        "components": [
          { "name": "name", "type": "string", "internalType": "string" },
          { "name": "price", "type": "uint256", "internalType": "uint256" },
          { "name": "duration", "type": "uint256", "internalType": "uint256" },
          { "name": "isActive", "type": "bool", "internalType": "bool" },
          { "name": "metadataURI", "type": "string", "internalType": "string" },
          { "name": "maxSupply", "type": "uint256", "internalType": "uint256" },
          { "name": "minHoldTime", "type": "uint256", "internalType": "uint256" }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "configureTier",
    "inputs": [
      { "name": "_tierId", "type": "uint256", "internalType": "uint256" },
      { "name": "_price", "type": "uint256", "internalType": "uint256" },
      { "name": "_duration", "type": "uint256", "internalType": "uint256" },
      { "name": "_name", "type": "string", "internalType": "string" },
      { "name": "_metadataURI", "type": "string", "internalType": "string" },
      { "name": "_maxSupply", "type": "uint256", "internalType": "uint256" },
      { "name": "_minHoldTime", "type": "uint256", "internalType": "uint256" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "creators",
    "inputs": [{ "name": "", "type": "address", "internalType": "address" }],
    "outputs": [
      { "name": "wallet", "type": "address", "internalType": "address" },
      { "name": "handle", "type": "string", "internalType": "string" },
      { "name": "tierIds", "type": "uint256", "internalType": "uint256" },
      { "name": "isActive", "type": "bool", "internalType": "bool" },
      { "name": "totalSubscribers", "type": "uint256", "internalType": "uint256" },
      { "name": "creatorIndex", "type": "uint256", "internalType": "uint256" },
      { "name": "followerCount", "type": "uint256", "internalType": "uint256" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "event",
    "name": "CreatorRegistered",
    "inputs": [
      { "name": "creator", "type": "address", "indexed": true, "internalType": "address" },
      { "name": "handle", "type": "string", "indexed": false, "internalType": "string" },
      { "name": "creatorIndex", "type": "uint256", "indexed": true, "internalType": "uint256" }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "Subscribed",
    "inputs": [
      { "name": "creator", "type": "address", "indexed": true, "internalType": "address" },
      { "name": "subscriber", "type": "address", "indexed": true, "internalType": "address" },
      { "name": "tierId", "type": "uint256", "indexed": false, "internalType": "uint256" },
      { "name": "startDate", "type": "uint256", "indexed": false, "internalType": "uint256" },
      { "name": "renewalDate", "type": "uint256", "indexed": false, "internalType": "uint256" },
      { "name": "amount", "type": "uint256", "indexed": false, "internalType": "uint256" }
    ],
    "anonymous": false
  }
] as const;
