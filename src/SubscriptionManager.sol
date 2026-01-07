// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./TieredBadge.sol";

/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║                         SUBSCRIPTION MANAGER                                  ║
 * ╠══════════════════════════════════════════════════════════════════════════════╣
 * ║  OVERVIEW                                                                     ║
 * ║  ────────                                                                     ║
 * ║  Contract ini adalah "BRAIN" dari subscription system.                        ║
 * ║  Menangani semua logic bisnis: payment, subscription state, earnings.         ║
 * ║                                                                               ║
 * ║  🎯 RESPONSIBILITIES:                                                         ║
 * ║  ────────────────────                                                         ║
 * ║  1. Register creators (dengan handle unik)                                    ║
 * ║  2. Define subscription tiers & pricing                                       ║
 * ║  3. Accept payments (ETH)                                                     ║
 * ║  4. Track active subscriptions                                                ║
 * ║  5. Control badge minting & upgrading                                         ║
 * ║  6. Handle creator withdrawals                                                ║
 * ║                                                                               ║
 * ║  🔄 USER FLOWS:                                                               ║
 * ║  ──────────────                                                               ║
 * ║                                                                               ║
 * ║  CREATOR FLOW:                                                                ║
 * ║  ┌──────────────────────────────────────────────────────────────────────┐     ║
 * ║  │  1. registerCreator("handle", basePrice)                             │     ║
 * ║  │  2. configureTier(tier, price, duration, name)  ← untuk setiap tier  │     ║
 * ║  │  3. Terima subscribers                                               │     ║
 * ║  │  4. withdraw() ← ambil earnings                                      │     ║
 * ║  └──────────────────────────────────────────────────────────────────────┘     ║
 * ║                                                                               ║
 * ║  FAN FLOW:                                                                    ║
 * ║  ┌──────────────────────────────────────────────────────────────────────┐     ║
 * ║  │  1. subscribe(creator, tierId) + send ETH                            │     ║
 * ║  │  2. Get badge NFT                                                    │     ║
 * ║  │  3. Access gated content                                             │     ║
 * ║  │  4. renewSubscription(creator) ← sebelum expired                     │     ║
 * ║  │  5. upgradeSubscription(creator, newTier) ← naik tier                │     ║
 * ║  └──────────────────────────────────────────────────────────────────────┘     ║
 * ║                                                                               ║
 * ║  💰 PAYMENT FLOW:                                                             ║
 * ║  ─────────────────                                                            ║
 * ║                                                                               ║
 * ║    User pays 0.01 ETH                                                         ║
 * ║           │                                                                   ║
 * ║           ▼                                                                   ║
 * ║    ┌─────────────────┐                                                        ║
 * ║    │ Platform Fee 5% │───▶ 0.0005 ETH → Platform                              ║
 * ║    └────────┬────────┘                                                        ║
 * ║             │                                                                 ║
 * ║             ▼                                                                 ║
 * ║    ┌─────────────────┐                                                        ║
 * ║    │  Creator 95%    │───▶ 0.0095 ETH → Creator Revenue                       ║
 * ║    └─────────────────┘                                                        ║
 * ║                                                                               ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */
contract SubscriptionManager is Ownable {
    /*//////////////////////////////////////////////////////////////
                               STRUCTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @dev Creator struct (sesuai PDF brief)
     *
     * 📦 FIELDS EXPLAINED:
     *
     * ┌───────────────────────────────────────────────────────────────────┐
     * │ Field            │ Type    │ Purpose                             │
     * ├───────────────────────────────────────────────────────────────────┤
     * │ wallet           │ address │ Creator's wallet address            │
     * │ handle           │ string  │ Unique username ("@alice")          │
     * │ tierIds          │ uint256 │ Bitmask of configured tiers         │
     * │ isActive         │ bool    │ Is creator still active?            │
     * │ totalSubscribers │ uint256 │ Total subscriber count              │
     * │ creatorIndex     │ uint256 │ Unique index for token ID           │
     * │ basePrice        │ uint256 │ Base price (for reference)          │
     * └───────────────────────────────────────────────────────────────────┘
     *
     * 💡 tierIds sebagai bitmask:
     * Bit 0 = unused, Bit 1 = Bronze, Bit 2 = Silver, Bit 3 = Gold
     * tierIds = 7 (binary: 0111) = semua tier configured
     */
    struct Creator {
        address wallet;
        string handle;
        uint256 tierIds; // Bitmask of configured tiers
        bool isActive;
        uint256 totalSubscribers; // Total subscriber count
        uint256 creatorIndex; // Unique index for token ID calculation
        uint256 basePrice; // Base price reference
    }

    /**
     * @dev Subscription struct (sesuai PDF brief)
     *
     * 📦 FIELDS EXPLAINED:
     *
     * ┌───────────────────────────────────────────────────────────────────┐
     * │ Field       │ Type    │ Purpose                                  │
     * ├───────────────────────────────────────────────────────────────────┤
     * │ subscriber  │ address │ Subscriber's wallet address              │
     * │ tierId      │ uint256 │ Current tier level (1/2/3)               │
     * │ startDate   │ uint256 │ When subscription started                │
     * │ renewalDate │ uint256 │ When subscription expires                │
     * │ isActive    │ bool    │ Is subscription currently active?        │
     * └───────────────────────────────────────────────────────────────────┘
     *
     * 💡 Date handling:
     * - Timestamps dalam seconds sejak Unix epoch (1 Jan 1970)
     * - block.timestamp = waktu sekarang
     * - renewalDate > block.timestamp = masih aktif
     */
    struct Subscription {
        address subscriber;
        uint256 tierId;
        uint256 startDate;
        uint256 renewalDate; // Expiration date
        bool isActive;
    }

    /**
     * @dev Tier configuration struct
     *
     * 📦 FIELDS EXPLAINED:
     *
     * ┌───────────────────────────────────────────────────────────────────┐
     * │ Field       │ Type    │ Purpose                                  │
     * ├───────────────────────────────────────────────────────────────────┤
     * │ name        │ string  │ Display name ("Bronze", "Silver")        │
     * │ price       │ uint256 │ Price dalam wei                          │
     * │ duration    │ uint256 │ Subscription duration dalam seconds      │
     * │ isActive    │ bool    │ Is tier accepting new subs?              │
     * │ metadataURI │ string  │ IPFS URI untuk badge artwork             │
     * │ maxSupply   │ uint256 │ Max badges (0 = unlimited)               │
     * │ minHoldTime │ uint256 │ Min hold sebelum upgrade                 │
     * └───────────────────────────────────────────────────────────────────┘
     */
    struct TierConfig {
        string name;
        uint256 price;
        uint256 duration;
        bool isActive;
        string metadataURI;
        uint256 maxSupply;
        uint256 minHoldTime;
    }

    /*//////////////////////////////////////////////////////////////
                               CONSTANTS
    //////////////////////////////////////////////////////////////*/

    /// @dev Tier level constants
    uint256 public constant TIER_BRONZE = 1;
    uint256 public constant TIER_SILVER = 2;
    uint256 public constant TIER_GOLD = 3;

    /*//////////////////////////////////////////////////////////////
                                STORAGE
    //////////////////////////////////////////////////////////////*/

    /// @dev Reference ke TieredBadge contract
    TieredBadge public immutable badge;

    /// @dev Counter untuk unique creator index
    uint256 public creatorCount;

    /// @dev Platform fee dalam basis points (100 = 1%)
    uint256 public platformFeeBps = 500; // 5% default

    /// @dev Platform fee recipient
    address public feeRecipient;

    /// @dev Total platform fees collected
    uint256 public pendingPlatformFees;

    /**
     * @dev creator address => Creator struct (sesuai PDF brief)
     */
    mapping(address => Creator) public creators;

    /**
     * @dev handle => creator address (untuk uniqueness check)
     */
    mapping(string => address) public handleToCreator;

    /**
     * @dev creatorIndex => creator address (reverse lookup)
     */
    mapping(uint256 => address) public creatorByIndex;

    /**
     * @dev creator address => subscriber address => Subscription (sesuai PDF brief)
     */
    mapping(address => mapping(address => Subscription)) public subscriptions;

    /**
     * @dev creator address => revenue (sesuai PDF brief)
     */
    mapping(address => uint256) public creatorRevenue;

    /**
     * @dev creator address => pending withdraw amount
     */
    mapping(address => uint256) public pendingWithdraw;

    /**
     * @dev creator address => tier => TierConfig
     */
    mapping(address => mapping(uint256 => TierConfig)) public tierConfigs;

    /*//////////////////////////////////////////////////////////////
                                EVENTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @dev Events sesuai PDF brief
     */
    event CreatorRegistered(
        address indexed creator,
        string handle,
        uint256 indexed creatorIndex
    );

    event TierConfigured(
        address indexed creator,
        uint256 indexed tier,
        string name,
        uint256 price,
        uint256 duration
    );

    event Subscribed(
        address indexed creator,
        address indexed subscriber,
        uint256 tierId,
        uint256 startDate,
        uint256 renewalDate,
        uint256 amount
    );

    event SubscriptionRenewed(
        address indexed creator,
        address indexed subscriber,
        uint256 newRenewalDate
    );

    event SubscriptionUpgraded(
        address indexed creator,
        address indexed subscriber,
        uint256 oldTier,
        uint256 newTier
    );

    event SubscriptionCancelled(
        address indexed creator,
        address indexed subscriber
    );

    event ContentUnlocked(
        address indexed creator,
        uint256 postId,
        address indexed subscriber
    );

    event Withdrawn(address indexed creator, uint256 amount);

    event PlatformFeesWithdrawn(address indexed recipient, uint256 amount);

    /*//////////////////////////////////////////////////////////////
                                ERRORS
    //////////////////////////////////////////////////////////////*/

    error CreatorAlreadyRegistered();
    error HandleAlreadyTaken();
    error CreatorNotFound();
    error CreatorNotActive();
    error TierNotConfigured();
    error AlreadySubscribed();
    error NotSubscribed();
    error InsufficientPayment();
    error InvalidTier();
    error CannotDowngrade();
    error SameTier();
    error NothingToWithdraw();
    error WithdrawFailed();
    error SubscriptionExpired();
    error HandleTooShort();
    error HandleTooLong();

    /*//////////////////////////////////////////////////////////////
                              MODIFIERS
    //////////////////////////////////////////////////////////////*/

    /**
     * @dev Ensure caller is a registered active creator
     */
    modifier onlyCreator() {
        if (!creators[msg.sender].isActive) revert CreatorNotActive();
        _;
    }

    /**
     * @dev Validate tier value (1, 2, or 3)
     */
    modifier validTier(uint256 tier) {
        if (tier < TIER_BRONZE || tier > TIER_GOLD) revert InvalidTier();
        _;
    }

    /*//////////////////////////////////////////////////////////////
                             CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    /**
     * @dev Initialize contract dengan TieredBadge address
     *
     * @param _badge Address TieredBadge contract
     * @param _feeRecipient Address untuk receive platform fees
     *
     * 🔄 DEPLOYMENT ORDER:
     * 1. Deploy TieredBadge
     * 2. Deploy SubscriptionManager(badge, feeRecipient)
     * 3. badge.setSubscriptionManager(this)
     */
    constructor(address _badge, address _feeRecipient) Ownable(msg.sender) {
        badge = TieredBadge(_badge);
        feeRecipient = _feeRecipient;
    }

    /*//////////////////////////////////////////////////////////////
                         CREATOR FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @dev Register sebagai creator (sesuai PDF brief)
     *
     * @param _handle Unique username/handle
     * @param _basePrice Base price untuk reference
     *
     * 💡 HANDLE RULES:
     * - Must be unique
     * - 3-32 characters
     * - Setelah diambil, gak bisa diubah
     *
     * 🔄 FLOW:
     * 1. Validate handle unik dan valid
     * 2. Increment creator counter
     * 3. Store creator data
     * 4. Register di TieredBadge
     * 5. Emit event
     */
    function registerCreator(
        string memory _handle,
        uint256 _basePrice
    ) external {
        // Check not already registered
        if (creators[msg.sender].wallet != address(0)) {
            revert CreatorAlreadyRegistered();
        }

        // Validate handle
        bytes memory handleBytes = bytes(_handle);
        if (handleBytes.length < 3) revert HandleTooShort();
        if (handleBytes.length > 32) revert HandleTooLong();
        if (handleToCreator[_handle] != address(0)) revert HandleAlreadyTaken();

        // Increment counter
        creatorCount++;

        // Store creator data
        creators[msg.sender] = Creator({
            wallet: msg.sender,
            handle: _handle,
            tierIds: 0,
            isActive: true,
            totalSubscribers: 0,
            creatorIndex: creatorCount,
            basePrice: _basePrice
        });

        // Store handle mapping
        handleToCreator[_handle] = msg.sender;
        creatorByIndex[creatorCount] = msg.sender;

        // Register in badge contract
        badge.registerCreator(msg.sender, creatorCount);

        emit CreatorRegistered(msg.sender, _handle, creatorCount);
    }

    /**
     * @dev Configure tier pricing dan settings
     *
     * @param tier Tier level (1=Bronze, 2=Silver, 3=Gold)
     * @param price Price dalam wei
     * @param duration Duration dalam seconds
     * @param name Tier name ("Bronze Supporter")
     * @param metadataURI IPFS URI untuk badge artwork
     * @param maxSupply Max badges (0 = unlimited)
     * @param minHoldTime Min hold sebelum upgrade
     *
     * 💰 PRICING TIPS:
     * - Bronze: 0.001 ETH = 1e15 wei
     * - Silver: 0.005 ETH = 5e15 wei
     * - Gold:   0.01 ETH  = 1e16 wei
     *
     * ⏱️ DURATION TIPS:
     * - 30 days  = 2592000 seconds
     * - 90 days  = 7776000 seconds
     * - 365 days = 31536000 seconds
     */
    function configureTier(
        uint256 tier,
        uint256 price,
        uint256 duration,
        string memory name,
        string memory metadataURI,
        uint256 maxSupply,
        uint256 minHoldTime
    ) external onlyCreator validTier(tier) {
        // Store tier config
        tierConfigs[msg.sender][tier] = TierConfig({
            name: name,
            price: price,
            duration: duration,
            isActive: true,
            metadataURI: metadataURI,
            maxSupply: maxSupply,
            minHoldTime: minHoldTime
        });

        // Update tierIds bitmask
        creators[msg.sender].tierIds |= (1 << tier);

        // Create tier in badge contract
        badge.createTier(
            msg.sender,
            tier,
            name,
            price,
            metadataURI,
            maxSupply,
            minHoldTime
        );

        emit TierConfigured(msg.sender, tier, name, price, duration);
    }

    /**
     * @dev Deactivate tier (stop accepting new subs)
     *
     * @param tier Tier level to deactivate
     */
    function deactivateTier(uint256 tier) external onlyCreator validTier(tier) {
        tierConfigs[msg.sender][tier].isActive = false;
    }

    /**
     * @dev Withdraw creator earnings
     *
     * 🔐 PULL PATTERN:
     * Creator harus claim sendiri, contract tidak push otomatis.
     *
     * Kenapa Pull Pattern lebih aman?
     * - Avoid stuck funds kalau recipient adalah contract yang revert
     * - User has control over when to receive
     * - CEI pattern lebih mudah diimplement
     *
     * 🔄 FLOW:
     * 1. Check ada balance
     * 2. Reset balance to 0 (BEFORE transfer!)
     * 3. Transfer ETH
     * 4. Emit event
     */
    function withdraw() external onlyCreator {
        uint256 amount = pendingWithdraw[msg.sender];
        if (amount == 0) revert NothingToWithdraw();

        // CEI Pattern: Effects before Interactions
        pendingWithdraw[msg.sender] = 0;

        // Transfer
        (bool success, ) = msg.sender.call{value: amount}("");
        if (!success) revert WithdrawFailed();

        emit Withdrawn(msg.sender, amount);
    }

    /*//////////////////////////////////////////////////////////////
                        SUBSCRIBER FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @dev Subscribe ke creator (sesuai PDF brief)
     *
     * @param _creator Creator address
     * @param _tierId Tier level (1/2/3)
     *
     * 🔄 FLOW:
     * 1. Validate creator exists & active
     * 2. Validate tier configured & active
     * 3. Check payment sufficient
     * 4. Check not already subscribed
     * 5. Calculate fees
     * 6. Credit creator
     * 7. Mint badge
     * 8. Store subscription
     * 9. Emit event
     *
     * ⚠️ IMPORTANT:
     * - msg.value harus >= tier price
     * - User hanya bisa punya 1 tier per creator
     * - Kalau sudah subscribe, harus upgrade bukan subscribe lagi
     */
    function subscribe(
        address _creator,
        uint256 _tierId
    ) external payable validTier(_tierId) {
        Creator storage creatorData = creators[_creator];

        // Validate creator
        if (creatorData.wallet == address(0)) revert CreatorNotFound();
        if (!creatorData.isActive) revert CreatorNotActive();

        // Validate tier
        TierConfig storage tier = tierConfigs[_creator][_tierId];
        if (!tier.isActive) revert TierNotConfigured();

        // Check payment
        if (msg.value < tier.price) revert InsufficientPayment();

        // Check not already subscribed (aktif)
        Subscription storage existingSub = subscriptions[_creator][msg.sender];
        if (existingSub.isActive && existingSub.renewalDate > block.timestamp) {
            revert AlreadySubscribed();
        }

        // Calculate fees
        uint256 platformFee = (msg.value * platformFeeBps) / 10000;
        uint256 creatorAmount = msg.value - platformFee;

        // Credit platform & creator
        pendingPlatformFees += platformFee;
        creatorRevenue[_creator] += creatorAmount;
        pendingWithdraw[_creator] += creatorAmount;

        // Update subscriber count
        if (!existingSub.isActive) {
            creatorData.totalSubscribers++;
        }

        // Calculate dates
        uint256 startDate = block.timestamp;
        uint256 renewalDate = block.timestamp + tier.duration;

        // Mint badge
        badge.mintBadgeTo(msg.sender, _creator, _tierId);

        // Store subscription
        subscriptions[_creator][msg.sender] = Subscription({
            subscriber: msg.sender,
            tierId: _tierId,
            startDate: startDate,
            renewalDate: renewalDate,
            isActive: true
        });

        emit Subscribed(
            _creator,
            msg.sender,
            _tierId,
            startDate,
            renewalDate,
            msg.value
        );
    }

    /**
     * @dev Renew subscription (sesuai PDF brief)
     *
     * @param _creator Creator address
     *
     * 🔄 FLOW:
     * 1. Check subscription exists
     * 2. Check payment sufficient
     * 3. Extend renewalDate
     *
     * ⏱️ EXTENSION LOGIC:
     * - Kalau belum expired: renewalDate += duration
     * - Kalau sudah expired: renewalDate = now + duration
     */
    function renewSubscription(address _creator) external payable {
        Creator storage creatorData = creators[_creator];
        if (creatorData.wallet == address(0)) revert CreatorNotFound();

        Subscription storage sub = subscriptions[_creator][msg.sender];
        if (!sub.isActive) revert NotSubscribed();

        TierConfig storage tier = tierConfigs[_creator][sub.tierId];
        if (msg.value < tier.price) revert InsufficientPayment();

        // Calculate fees
        uint256 platformFee = (msg.value * platformFeeBps) / 10000;
        uint256 creatorAmount = msg.value - platformFee;

        // Credit
        pendingPlatformFees += platformFee;
        creatorRevenue[_creator] += creatorAmount;
        pendingWithdraw[_creator] += creatorAmount;

        // Extend renewalDate
        if (sub.renewalDate > block.timestamp) {
            // Not expired: add to current
            sub.renewalDate += tier.duration;
        } else {
            // Expired: start fresh
            sub.renewalDate = block.timestamp + tier.duration;
        }

        emit SubscriptionRenewed(_creator, msg.sender, sub.renewalDate);
    }

    /**
     * @dev Upgrade subscription ke tier lebih tinggi
     *
     * @param _creator Creator address
     * @param _newTierId New tier level (harus lebih tinggi)
     *
     * 💰 PRICING:
     * User bayar selisih harga tier baru - tier lama.
     *
     * Example:
     * - Bronze = 0.001 ETH
     * - Gold   = 0.01 ETH
     * - Upgrade Bronze → Gold = 0.01 - 0.001 = 0.009 ETH
     */
    function upgradeSubscription(
        address _creator,
        uint256 _newTierId
    ) external payable validTier(_newTierId) {
        Creator storage creatorData = creators[_creator];
        if (creatorData.wallet == address(0)) revert CreatorNotFound();

        Subscription storage sub = subscriptions[_creator][msg.sender];
        if (!sub.isActive) revert NotSubscribed();
        if (sub.renewalDate <= block.timestamp) revert SubscriptionExpired();

        // Validate upgrade
        if (_newTierId <= sub.tierId) revert CannotDowngrade();
        if (_newTierId == sub.tierId) revert SameTier();

        // Check new tier is configured
        TierConfig storage newTier = tierConfigs[_creator][_newTierId];
        if (!newTier.isActive) revert TierNotConfigured();

        // Calculate price difference
        TierConfig storage oldTier = tierConfigs[_creator][sub.tierId];
        uint256 priceDiff = newTier.price - oldTier.price;
        if (msg.value < priceDiff) revert InsufficientPayment();

        // Calculate fees
        uint256 platformFee = (msg.value * platformFeeBps) / 10000;
        uint256 creatorAmount = msg.value - platformFee;

        // Credit
        pendingPlatformFees += platformFee;
        creatorRevenue[_creator] += creatorAmount;
        pendingWithdraw[_creator] += creatorAmount;

        uint256 oldTierId = sub.tierId;

        // Upgrade badge
        badge.upgradeBadge(_creator, sub.tierId, _newTierId);

        // Update subscription (keep same renewalDate)
        sub.tierId = _newTierId;

        emit SubscriptionUpgraded(_creator, msg.sender, oldTierId, _newTierId);
    }

    /**
     * @dev Cancel subscription
     *
     * @param creator Creator address
     *
     * ⚠️ NO REFUND:
     * Cancellation tidak memberikan refund.
     * User sudah bayar untuk period tertentu.
     */
    function cancelSubscription(address creator) external {
        Creator storage creatorData = creators[creator];
        if (creatorData.wallet == address(0)) revert CreatorNotFound();

        Subscription storage sub = subscriptions[creator][msg.sender];
        if (!sub.isActive) revert NotSubscribed();

        // Burn badge
        badge.burnBadge(msg.sender, creator, sub.tierId);

        // Update subscription
        sub.isActive = false;
        sub.renewalDate = block.timestamp;

        // Update subscriber count
        creatorData.totalSubscribers--;

        emit SubscriptionCancelled(creator, msg.sender);
    }

    /*//////////////////////////////////////////////////////////////
                          VIEW FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @dev Check access untuk gated content (sesuai PDF brief)
     *
     * @param _creator Creator address
     * @param _subscriber Subscriber address
     * @param _postId Post ID (untuk future use)
     * @return bool True jika punya akses
     *
     * 💡 ACCESS LOGIC:
     * - User adalah creator sendiri → always true
     * - User punya active subscription yang belum expired → true
     * - Otherwise → false
     *
     * 📝 NOTE:
     * _postId untuk future implementation di GatedContent
     * yang bisa check minimum tier requirement per post.
     */
    function checkAccess(
        address _creator,
        address _subscriber,
        uint256 _postId
    ) external view returns (bool) {
        // Suppress unused variable warning
        _postId;

        // Creator always has access
        if (_subscriber == _creator) return true;

        // Check subscription
        Subscription storage sub = subscriptions[_creator][_subscriber];
        return sub.isActive && sub.renewalDate > block.timestamp;
    }

    /**
     * @dev Check if user has active subscription
     */
    function hasActiveSubscription(
        address user,
        address creator
    ) external view returns (bool) {
        Subscription storage sub = subscriptions[creator][user];
        return sub.isActive && sub.renewalDate > block.timestamp;
    }

    /**
     * @dev Get user's subscription tier (0 if not subscribed)
     */
    function getSubscriptionTier(
        address user,
        address creator
    ) external view returns (uint256) {
        Subscription storage sub = subscriptions[creator][user];
        if (!sub.isActive || sub.renewalDate <= block.timestamp) {
            return 0;
        }
        return sub.tierId;
    }

    /**
     * @dev Get subscription details
     */
    function getSubscription(
        address creator,
        address subscriber
    ) external view returns (Subscription memory) {
        return subscriptions[creator][subscriber];
    }

    /**
     * @dev Get creator info
     */
    function getCreator(
        address creator
    ) external view returns (Creator memory) {
        return creators[creator];
    }

    /**
     * @dev Get creator by handle
     */
    function getCreatorByHandle(
        string memory handle
    ) external view returns (address) {
        return handleToCreator[handle];
    }

    /**
     * @dev Get tier config
     */
    function getTierConfig(
        address creator,
        uint256 tier
    ) external view returns (TierConfig memory) {
        return tierConfigs[creator][tier];
    }

    /**
     * @dev Get creator's total revenue
     */
    function getCreatorRevenue(
        address creator
    ) external view returns (uint256) {
        return creatorRevenue[creator];
    }

    /**
     * @dev Get creator's pending withdraw amount
     */
    function getPendingWithdraw(
        address creator
    ) external view returns (uint256) {
        return pendingWithdraw[creator];
    }

    /*//////////////////////////////////////////////////////////////
                          ADMIN FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @dev Update platform fee
     *
     * @param newFeeBps New fee in basis points (100 = 1%)
     * Max 10% (1000 bps)
     */
    function setPlatformFee(uint256 newFeeBps) external onlyOwner {
        require(newFeeBps <= 1000, "Fee too high");
        platformFeeBps = newFeeBps;
    }

    /**
     * @dev Update fee recipient
     */
    function setFeeRecipient(address newRecipient) external onlyOwner {
        require(newRecipient != address(0), "Invalid address");
        feeRecipient = newRecipient;
    }

    /**
     * @dev Withdraw platform fees
     */
    function withdrawPlatformFees() external onlyOwner {
        uint256 amount = pendingPlatformFees;
        require(amount > 0, "Nothing to withdraw");

        pendingPlatformFees = 0;

        (bool success, ) = feeRecipient.call{value: amount}("");
        require(success, "Withdraw failed");

        emit PlatformFeesWithdrawn(feeRecipient, amount);
    }

    /**
     * @dev Deactivate creator (admin only)
     */
    function deactivateCreator(address creator) external onlyOwner {
        creators[creator].isActive = false;
    }
}
