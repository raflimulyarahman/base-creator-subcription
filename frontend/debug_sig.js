const { ethers } = require("ethers");

async function main() {
    // Verifier PK from env
    const pk = "0x9c3403baaebea4bbb355c7e44083900c7092eb9452fa310d403b708bbaf4d7ac";
    const wallet = new ethers.Wallet(pk);
    console.log("Verifier Address:", wallet.address);

    // Test Data
    const userAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"; // Test user
    const followerCount = 15000;
    const chainId = 84532;
    const handle = "testhandle";

    console.log(`\nGenerating signature for:`);
    console.log(`User: ${userAddress}`);
    console.log(`Followers: ${followerCount}`);
    console.log(`ChainID: ${chainId}`);

    // Mimic Backend Logic
    const messageHash = ethers.solidityPackedKeccak256(
        ["address", "uint256", "uint256"],
        [userAddress, followerCount, chainId]
    );
    console.log("Message Hash:", messageHash);

    const signature = await wallet.signMessage(ethers.getBytes(messageHash));
    console.log("Signature:", signature);

    // Print cast command for easy testing
    console.log(`\nRun this cast command to test:`);
    console.log(`cast call 0x9a354B57b5e5F942BE86b0C0c4646D9906EeA7Ab "registerCreator(string,uint256,bytes)" "${handle}" ${followerCount} ${signature} --from ${userAddress} --rpc-url https://sepolia.base.org`);
    
    // Check hash with cast
    console.log(`\nEnsure hash matches cast:`);
    console.log(`cast keccak $(cast abi-encode "packed(address,uint256,uint256)" ${userAddress} ${followerCount} ${chainId})`);
}

main().catch(console.error);
