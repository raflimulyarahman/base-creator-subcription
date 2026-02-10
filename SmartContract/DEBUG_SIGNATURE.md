# 🐛 Debug Signature Verification Issue

## Checklist - Pastikan Ini Sama Persis:

### 1. ✅ Verifier Address

**Di Smart Contract:**

```solidity
// Cek verifier address yang tersimpan di contract
address public verifier;
```

**Di Backend:**

```javascript
// Address ini HARUS sama dengan yang di contract
const signerAddress = signer.address;
console.log("Backend Signer Address:", signerAddress);
```

### 2. ✅ Message Format

**Di Smart Contract (Line 206-208):**

```solidity
bytes32 messageHash = keccak256(
    abi.encodePacked(msg.sender, _followerCount, block.chainid)
);
```

**Di Backend HARUS:**

```javascript
// SALAH ❌ - Ini akan gagal:
const messageHash = ethers.solidityPackedKeccak256(
  ["address", "uint256"], // Kurang chainId!
  [userAddress, followerCount],
);

// BENAR ✅ - Harus include chainId:
const messageHash = ethers.solidityPackedKeccak256(
  ["address", "uint256", "uint256"], // address, followerCount, chainId
  [userAddress, followerCount, 84532], // 84532 = Base Sepolia chainId
);
```

### 3. ✅ Signing Method

**Di Smart Contract (Line 209):**

```solidity
bytes32 signedHash = messageHash.toEthSignedMessageHash();
// Ini sama dengan: keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash))
```

**Di Backend HARUS:**

```javascript
// SALAH ❌ - Raw sign tanpa prefix:
const signature = await signer.signMessage(messageHash);

// BENAR ✅ - Sign dengan ethers yang otomatis tambah prefix:
const signature = await signer.signMessage(ethers.getBytes(messageHash));
```

## 🔧 Backend Code Yang Benar:

```javascript
const ethers = require("ethers");

async function signCreatorRegistration(userAddress, followerCount) {
  const VERIFIER_PRIVATE_KEY = process.env.VERIFIER_PRIVATE_KEY;
  const signer = new ethers.Wallet(VERIFIER_PRIVATE_KEY);

  const chainId = 84532; // Base Sepolia

  console.log("=== SIGNING DEBUG ===");
  console.log("Signer Address:", signer.address);
  console.log("User Address:", userAddress);
  console.log("Follower Count:", followerCount);
  console.log("Chain ID:", chainId);

  // 1. Hash message sama persis dengan contract
  const messageHash = ethers.solidityPackedKeccak256(
    ["address", "uint256", "uint256"],
    [userAddress, followerCount, chainId],
  );

  console.log("Message Hash:", messageHash);

  // 2. Sign dengan ethers (otomatis tambah "\x19Ethereum Signed Message:\n32")
  const signature = await signer.signMessage(ethers.getBytes(messageHash));

  console.log("Signature:", signature);
  console.log("===================");

  return {
    signature,
    followerCount,
    signerAddress: signer.address,
    messageHash,
  };
}

module.exports = { signCreatorRegistration };
```

## 🧪 Testing Script:

Buat file ini untuk test di backend:

```javascript
// test-signature.js
const { ethers } = require("ethers");

async function testSignature() {
  // Data dari backend
  const VERIFIER_PRIVATE_KEY = "YOUR_BACKEND_PRIVATE_KEY";
  const signer = new ethers.Wallet(VERIFIER_PRIVATE_KEY);

  const userAddress = "0x1234..."; // Address user yang mau register
  const followerCount = 10000;
  const chainId = 84532; // Base Sepolia

  console.log("\n=== BACKEND SIGNING ===");
  console.log("Verifier Address:", signer.address);

  // Sign
  const messageHash = ethers.solidityPackedKeccak256(
    ["address", "uint256", "uint256"],
    [userAddress, followerCount, chainId],
  );

  const signature = await signer.signMessage(ethers.getBytes(messageHash));

  console.log("Message Hash:", messageHash);
  console.log("Signature:", signature);

  // Recover untuk verify
  const ethSignedMessageHash = ethers.hashMessage(ethers.getBytes(messageHash));
  const recovered = ethers.recoverAddress(ethSignedMessageHash, signature);

  console.log("Recovered Address:", recovered);
  console.log(
    "Match:",
    recovered.toLowerCase() === signer.address.toLowerCase() ? "✅" : "❌",
  );

  return {
    verifierAddress: signer.address,
    userAddress,
    followerCount,
    chainId,
    signature,
    messageHash,
  };
}

testSignature()
  .then((result) => {
    console.log("\n=== COPY THIS TO SMART CONTRACT ===");
    console.log("Verifier address di contract:", result.verifierAddress);
    console.log("\nCall registerCreator dengan:");
    console.log("- handle: 'myhandle'");
    console.log("- followerCount:", result.followerCount);
    console.log("- signature:", result.signature);
  })
  .catch(console.error);
```

## 📋 Verification Checklist:

Kasih tau saya hasil dari ini:

1. **Verifier address di contract:**

```bash
# Run di Remix/Hardhat console
subscriptionManager.verifier()
```

2. **Signer address di backend:**

```javascript
console.log(signer.address);
```

3. **ChainId yang dipakai:**

```javascript
// Di backend
console.log(chainId); // Harus 84532 untuk Base Sepolia

// Di contract
console.log(block.chainid); // Harus 84532
```

4. **Format signature dari backend:**

```javascript
console.log("Signature length:", signature.length); // Harus 132 (0x + 130 chars)
console.log("Signature:", signature); // Harus mulai dengan 0x
```

## 🚨 Common Issues:

### Issue 1: Wrong ChainId

```javascript
// SALAH ❌
const chainId = 1; // Mainnet
const chainId = 8453; // Base Mainnet

// BENAR ✅
const chainId = 84532; // Base Sepolia
```

### Issue 2: Wrong Parameter Order

```javascript
// SALAH ❌
solidityPackedKeccak256(
  ["uint256", "address", "uint256"],
  [followerCount, userAddress, chainId],
);

// BENAR ✅
solidityPackedKeccak256(
  ["address", "uint256", "uint256"],
  [userAddress, followerCount, chainId],
);
```

### Issue 3: Verifier Not Set

```javascript
// Cek di contract apakah verifier address sudah di-set
const verifier = await subscriptionManager.verifier();
console.log("Verifier:", verifier);

// Kalau 0x000..., berarti belum di-set
if (verifier === ethers.ZeroAddress) {
  await subscriptionManager.setVerifier(backendSignerAddress);
}
```

## 📤 Apa Yang Saya Butuhkan:

Tolong kasih info:

1. **Backend signer address** (public address dari private key yang sign)
2. **Verifier address di contract** (hasil dari `subscriptionManager.verifier()`)
3. **Signature yang dihasilkan** (contoh signature dari backend)
4. **Error message** (exact error dari revert, misal "InvalidSignature", "VerifierNotSet", dll)
5. **ChainId** yang dipakai di backend

Dengan info ini saya bisa debug exact nya dimana masalahnya!
