# 🔍 Cara Debug InvalidSignature Error

## Step 1: Deploy SignatureDebugger

```bash
# Deploy helper contract
forge create src/SignatureDebugger.sol:SignatureDebugger \
  --constructor-args <SUBSCRIPTION_MANAGER_ADDRESS> \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY
```

## Step 2: Test Signature dengan Debugger

```javascript
// debug-signature.js
const { ethers } = require('ethers');

async function debugSignature() {
    const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");

    const debuggerABI = [
        "function debugSignature(address userAddress, uint256 followerCount, bytes signature) view returns (bytes32 messageHash, bytes32 signedHash, address recoveredAddress, address expectedVerifier, bool isMatch)",
        "function getChainId() view returns (uint256)",
        "function getVerifier() view returns (address)"
    ];

    const debugger = new ethers.Contract(
        "DEBUGGER_CONTRACT_ADDRESS",
        debuggerABI,
        provider
    );

    // Data yang sama dengan yang di-pass ke registerCreator
    const userAddress = "0x..."; // Address yang mau register
    const followerCount = 10000;
    const signature = "0x..."; // Signature dari backend

    console.log("\n=== DEBUGGING SIGNATURE ===\n");

    // 1. Cek chain ID
    const chainId = await debugger.getChainId();
    console.log("Chain ID:", chainId.toString());

    // 2. Cek verifier
    const verifier = await debugger.getVerifier();
    console.log("Expected Verifier:", verifier);

    // 3. Debug signature
    const result = await debugger.debugSignature(
        userAddress,
        followerCount,
        signature
    );

    console.log("\n=== HASIL DEBUG ===\n");
    console.log("Message Hash:", result.messageHash);
    console.log("Signed Hash:", result.signedHash);
    console.log("Recovered Address:", result.recoveredAddress);
    console.log("Expected Verifier:", result.expectedVerifier);
    console.log("Match:", result.isMatch ? "✅ YES" : "❌ NO");

    if (!result.isMatch) {
        console.log("\n⚠️  MASALAH DITEMUKAN:");
        console.log("Backend sign dengan address:", result.recoveredAddress);
        console.log("Contract expect address:", result.expectedVerifier);
        console.log("\nSOLUSI:");
        console.log("1. Update verifier di contract ke:", result.recoveredAddress);
        console.log("   await subscriptionManager.setVerifier('"+result.recoveredAddress+"')");
        console.log("\nATAU\n");
        console.log("2. Backend gunakan private key yang sesuai dengan:", result.expectedVerifier);
    }
}

debugSignature().catch(console.error);
```

## Step 3: Bandingkan Backend vs Contract

```javascript
// test-backend-signing.js
const { ethers } = require("ethers");

async function testBackendSigning() {
  // Setup signer (private key dari backend)
  const BACKEND_PRIVATE_KEY = process.env.VERIFIER_PRIVATE_KEY;
  const signer = new ethers.Wallet(BACKEND_PRIVATE_KEY);

  const userAddress = "0x..."; // Address yang mau register
  const followerCount = 10000;
  const chainId = 84532; // Base Sepolia

  console.log("\n=== BACKEND SIGNING TEST ===\n");
  console.log("Backend Signer Address:", signer.address);
  console.log("User Address:", userAddress);
  console.log("Follower Count:", followerCount);
  console.log("Chain ID:", chainId);

  // Hash message (HARUS sama dengan contract)
  const messageHash = ethers.solidityPackedKeccak256(
    ["address", "uint256", "uint256"],
    [userAddress, followerCount, chainId],
  );

  console.log("\nMessage Hash:", messageHash);

  // Sign message
  const signature = await signer.signMessage(ethers.getBytes(messageHash));
  console.log("Signature:", signature);

  // Verify locally
  const ethSignedMessageHash = ethers.hashMessage(ethers.getBytes(messageHash));
  const recovered = ethers.recoverAddress(ethSignedMessageHash, signature);

  console.log("\nRecovered Address:", recovered);
  console.log(
    "Match dengan Signer:",
    recovered === signer.address ? "✅" : "❌",
  );

  console.log("\n=== COPY INI ===");
  console.log("Verifier address yang BENAR:", signer.address);
  console.log("\nUpdate contract dengan:");
  console.log(
    "await subscriptionManager.setVerifier('" + signer.address + "')",
  );

  return {
    signerAddress: signer.address,
    signature,
    messageHash,
  };
}

testBackendSigning().catch(console.error);
```

## Quick Fix - Paling Sering:

### Solusi 1: Update Verifier Address

```javascript
// Contract expect address A, tapi backend sign dengan address B
// Fix: Update verifier di contract

const tx = await subscriptionManager.setVerifier(
  "BACKEND_SIGNER_ADDRESS", // Address dari backend private key
);
await tx.wait();
console.log("Verifier updated!");
```

### Solusi 2: Cek Backend Signing

Pastikan backend code seperti ini:

```javascript
async function signCreatorRegistration(userAddress, followerCount) {
  const signer = new ethers.Wallet(process.env.VERIFIER_PRIVATE_KEY);

  // ✅ PENTING: Chain ID harus 84532 untuk Base Sepolia
  const chainId = 84532;

  // ✅ PENTING: Urutan parameter: address, uint256, uint256
  const messageHash = ethers.solidityPackedKeccak256(
    ["address", "uint256", "uint256"],
    [userAddress, followerCount, chainId],
  );

  // ✅ PENTING: Sign dengan ethers.getBytes
  const signature = await signer.signMessage(ethers.getBytes(messageHash));

  return {
    signature,
    signerAddress: signer.address, // Kasih ke frontend untuk verify
    followerCount,
    chainId,
  };
}
```

## Checklist Cepat:

```bash
# 1. Cek verifier di contract
cast call <CONTRACT_ADDRESS> "verifier()" --rpc-url <RPC_URL>

# 2. Cek backend signer address
node -e "console.log(new ethers.Wallet(process.env.VERIFIER_PRIVATE_KEY).address)"

# 3. Bandingkan - harus SAMA!
```

## Error Masih Ada?

Tolong kasih info:

1. **Verifier address** di contract (hasil dari `verifier()`)
2. **Backend signer address** (dari `new ethers.Wallet(privateKey).address`)
3. **Signature** yang dihasilkan backend
4. **ChainId** yang dipakai backend

Kalau 2 address di atas tidak sama = masalahnya di situ!
