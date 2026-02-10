// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./SubscriptionManager.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

/**
 * @title SignatureDebugger
 * @notice Helper contract untuk debug signature issues
 */
contract SignatureDebugger {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    SubscriptionManager public subManager;

    constructor(address _subManager) {
        subManager = SubscriptionManager(_subManager);
    }

    /**
     * @notice Debug signature recovery
     * @param userAddress Address yang mau register
     * @param followerCount Follower count
     * @param signature Signature dari backend
     * @return messageHash Hash dari message
     * @return signedHash Hash setelah di-prefix
     * @return recoveredAddress Address yang recovered dari signature
     * @return expectedVerifier Verifier address di contract
     * @return isMatch Apakah match
     */
    function debugSignature(
        address userAddress,
        uint256 followerCount,
        bytes memory signature
    )
        external
        view
        returns (
            bytes32 messageHash,
            bytes32 signedHash,
            address recoveredAddress,
            address expectedVerifier,
            bool isMatch
        )
    {
        // 1. Hash message (sama seperti line 206-208)
        messageHash = keccak256(
            abi.encodePacked(userAddress, followerCount, block.chainid)
        );

        // 2. Add Ethereum Signed Message prefix (line 209)
        signedHash = messageHash.toEthSignedMessageHash();

        // 3. Recover address dari signature (line 214)
        recoveredAddress = signedHash.recover(signature);

        // 4. Get verifier dari contract (line 215)
        expectedVerifier = subManager.verifier();

        // 5. Check match
        isMatch = recoveredAddress == expectedVerifier;
    }

    /**
     * @notice Cek semua parameter registration
     */
    function debugRegistration(
        string memory handle,
        uint256 followerCount,
        bytes memory signature,
        address caller
    )
        external
        view
        returns (
            bool handleValid,
            bool handleAvailable,
            bool followerCountValid,
            bytes32 messageHash,
            address recoveredSigner,
            address expectedSigner,
            bool signatureValid,
            uint256 chainId
        )
    {
        // Check handle
        handleValid = bytes(handle).length >= 3 && bytes(handle).length <= 32;
        handleAvailable = subManager.handleToCreator(handle) == address(0);

        // Check follower count
        followerCountValid = followerCount >= subManager.MIN_FOLLOWER_COUNT();

        // Check signature
        messageHash = keccak256(
            abi.encodePacked(caller, followerCount, block.chainid)
        );
        bytes32 signedHash = messageHash.toEthSignedMessageHash();
        recoveredSigner = signedHash.recover(signature);
        expectedSigner = subManager.verifier();
        signatureValid = recoveredSigner == expectedSigner;

        chainId = block.chainid;
    }

    /**
     * @notice Generate message hash untuk testing
     */
    function getMessageHash(
        address userAddress,
        uint256 followerCount
    ) external view returns (bytes32) {
        return
            keccak256(
                abi.encodePacked(userAddress, followerCount, block.chainid)
            );
    }

    /**
     * @notice Get current chain ID
     */
    function getChainId() external view returns (uint256) {
        return block.chainid;
    }

    /**
     * @notice Get verifier address
     */
    function getVerifier() external view returns (address) {
        return subManager.verifier();
    }

    /**
     * @notice Recover address from signature
     */
    function recoverSigner(
        bytes32 messageHash,
        bytes memory signature
    ) external pure returns (address) {
        bytes32 signedHash = messageHash.toEthSignedMessageHash();
        return signedHash.recover(signature);
    }
}
