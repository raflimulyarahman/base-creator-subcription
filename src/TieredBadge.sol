// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║                           TIERED BADGE (ERC-1155)                            ║
 * ╠══════════════════════════════════════════════════════════════════════════════╣
 * ║  OVERVIEW                                                                     ║
 * ║  ────────                                                                     ║
 * ║  Contract ini adalah NFT badge untuk subscription tiers.                      ║
 * ║  Setiap subscriber mendapat badge yang merepresentasikan tier mereka.         ║
 * ║                                                                               ║
 * ║  🎯 KENAPA ERC-1155 (bukan ERC-721)?                                          ║
 * ║  ─────────────────────────────────────                                        ║
 * ║  ┌─────────────────────────────────────────────────────────────────────────┐  ║
 * ║  │ ERC-721:                                                                │  ║
 * ║  │   - 1 contract = 1 jenis NFT                                            │  ║
 * ║  │   - Setiap token UNIK (id berbeda)                                      │  ║
 * ║  │   - Gas mahal untuk banyak jenis token                                  │  ║
 * ║  │                                                                         │  ║
 * ║  │ ERC-1155:                                                               │  ║
 * ║  │   - 1 contract = BANYAK jenis token                                     │  ║
 * ║  │   - Token ID bisa mewakili "kelas" (Bronze, Silver, Gold)               │  ║
 * ║  │   - Batch operations = hemat gas                                        │  ║
 * ║  │   - Cocok untuk game items, badges, membership cards                    │  ║
 * ║  └─────────────────────────────────────────────────────────────────────────┘  ║
 * ║                                                                               ║
 * ║  📦 TOKEN ID STRUCTURE                                                        ║
 * ║  ─────────────────────                                                        ║
 * ║  Kita encode 2 informasi dalam 1 angka (tokenId):                             ║
 * ║                                                                               ║
 * ║      tokenId = creatorIndex * 1000 + tierLevel                                ║
 * ║                                                                               ║
 * ║  Contoh untuk Creator #5:                                                     ║
 * ║  ┌─────────────┬──────────┬─────────────────────────────┐                     ║
 * ║  │    Tier     │ Token ID │       Calculation           │                     ║
 * ║  ├─────────────┼──────────┼─────────────────────────────┤                     ║
 * ║  │   Bronze    │   5001   │  5 * 1000 + 1 = 5001        │                     ║
 * ║  │   Silver    │   5002   │  5 * 1000 + 2 = 5002        │                     ║
 * ║  │   Gold      │   5003   │  5 * 1000 + 3 = 5003        │                     ║
 * ║  └─────────────┴──────────┴─────────────────────────────┘                     ║
 * ║                                                                               ║
 * ║  Reverse lookup (dari tokenId ke creator/tier):                               ║
 * ║    creatorIndex = tokenId / 1000    → 5003 / 1000 = 5                         ║
 * ║    tierLevel    = tokenId % 1000    → 5003 % 1000 = 3                         ║
 * ║                                                                               ║
 * ║  🔒 SOULBOUND (Non-Transferable) DESIGN                                       ║
 * ║  ──────────────────────────────────────                                       ║
 * ║  Badge TIDAK bisa di-transfer atau dijual.                                    ║
 * ║                                                                               ║
 * ║  Kenapa?                                                                      ║
 * ║  1. Badge = bukti subscription PERSONAL                                       ║
 * ║  2. Kalau bisa dijual, orang bisa beli badge bekas = bypass payment           ║
 * ║  3. Contoh: Soulbound tokens (SBT) seperti Proof of Attendance                ║
 * ║                                                                               ║
 * ║  Implementation:                                                              ║
 * ║  - Override _update() untuk block transfer                                    ║
 * ║  - Allow mint (from = 0) dan burn (to = 0)                                    ║
 * ║  - Block transfer biasa (from != 0 && to != 0)                                ║
 * ║                                                                               ║
 * ║  🏆 LOYALTY BONUS SYSTEM                                                      ║
 * ║  ────────────────────────                                                     ║
 * ║  Semakin lama hold badge, semakin besar bonus!                                ║
 * ║                                                                               ║
 * ║  ┌─────────────────────┬───────────────┐                                      ║
 * ║  │   Hold Duration     │ Bonus Points  │                                      ║
 * ║  ├─────────────────────┼───────────────┤                                      ║
 * ║  │   < 30 days         │      0        │                                      ║
 * ║  │   30-90 days        │     10        │                                      ║
 * ║  │   90-180 days       │     25        │                                      ║
 * ║  │   180-365 days      │     50        │                                      ║
 * ║  │   > 365 days        │    100        │                                      ║
 * ║  └─────────────────────┴───────────────┘                                      ║
 * ║                                                                               ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */
contract TieredBadge is ERC1155, Ownable {
    using Strings for uint256;

    /*//////////////////////////////////////////////////////////////
                               CONSTANTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @dev Tier level constants
     *
     * 💡 KENAPA CONSTANTS?
     * - Nilai langsung di-embed dalam bytecode
     * - Gak butuh storage slot = hemat gas
     * - Immutable = aman dari perubahan
     *
     * 📊 TIER HIERARCHY:
     * Bronze (1) < Silver (2) < Gold (3)
     *
     * Higher tier = more benefits:
     * - Access ke lebih banyak content
     * - Voting power lebih besar
     * - Exclusive perks
     */
    uint256 public constant TIER_BRONZE = 1;
    uint256 public constant TIER_SILVER = 2;
    uint256 public constant TIER_GOLD = 3;

    /// @dev Multiplier untuk token ID calculation
    /// tokenId = creatorIndex * CREATOR_MULTIPLIER + tier
    uint256 public constant CREATOR_MULTIPLIER = 1000;

    /// @dev Loyalty bonus thresholds (dalam seconds)
    uint256 public constant LOYALTY_30_DAYS = 30 days;
    uint256 public constant LOYALTY_90_DAYS = 90 days;
    uint256 public constant LOYALTY_180_DAYS = 180 days;
    uint256 public constant LOYALTY_365_DAYS = 365 days;

    /*//////////////////////////////////////////////////////////////
                                STRUCTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @dev Tier struct menyimpan konfigurasi setiap tier
     *
     * 📦 FIELDS EXPLAINED:
     *
     * ┌─────────────────────────────────────────────────────────────────┐
     * │ Field        │ Type    │ Purpose                               │
     * ├─────────────────────────────────────────────────────────────────┤
     * │ name         │ string  │ Display name ("Bronze", "Silver")     │
     * │ price        │ uint256 │ Subscription price dalam wei          │
     * │ metadataURI  │ string  │ IPFS URI untuk badge artwork          │
     * │ maxSupply    │ uint256 │ Limit badges (0 = unlimited)          │
     * │ currentSupply│ uint256 │ Berapa yang sudah di-mint             │
     * │ minHoldTime  │ uint256 │ Minimum hold sebelum upgrade          │
     * └─────────────────────────────────────────────────────────────────┘
     *
     * 💡 USE CASES:
     * - maxSupply: Limited edition badges (first 100 subscribers)
     * - minHoldTime: Prevent pump-and-dump (harus hold 30 hari sebelum upgrade)
     */
    struct Tier {
        string name; // "Bronze", "Silver", "Gold"
        uint256 price; // Price dalam wei
        string metadataURI; // IPFS URI untuk artwork/metadata
        uint256 maxSupply; // Max badges (0 = unlimited)
        uint256 currentSupply; // Current minted count
        uint256 minHoldTime; // Min hold sebelum bisa upgrade (seconds)
    }

    /*//////////////////////////////////////////////////////////////
                                STORAGE
    //////////////////////////////////////////////////////////////*/

    /**
     * @dev Address SubscriptionManager yang authorized untuk mint/burn
     *
     * 🔐 ACCESS CONTROL:
     * Hanya SubscriptionManager yang bisa:
     * - mintBadge() saat user subscribe
     * - burn() saat user cancel/upgrade
     *
     * Ini prevent:
     * - Random minting free badges
     * - Unauthorized burning
     */
    address public subscriptionManager;

    /**
     * @dev Creator address => list of tier token IDs
     *
     * 📊 EXAMPLE:
     * creatorTiers[0xCreator] = [1001, 1002, 1003]
     *                           Bronze Silver Gold
     *
     * 💡 USE CASE:
     * - Frontend fetch semua tiers creator sekaligus
     * - Iterate untuk check user balances
     */
    mapping(address => uint256[]) public creatorTiers;

    /**
     * @dev tokenId => Tier data
     *
     * 📊 EXAMPLE:
     * tierData[1001] = Tier{name: "Bronze", price: 0.001 ether, ...}
     * tierData[1002] = Tier{name: "Silver", price: 0.005 ether, ...}
     */
    mapping(uint256 => Tier) public tierData;

    /**
     * @dev tokenId => user address => mint timestamp
     *
     * 📊 EXAMPLE:
     * mintTimestamps[1001][0xUser] = 1704067200 (timestamp)
     *
     * 💡 USE CASE:
     * - Calculate hold duration untuk loyalty bonus
     * - Check minHoldTime untuk upgrade eligibility
     */
    mapping(uint256 => mapping(address => uint256)) public mintTimestamps;

    /**
     * @dev creatorIndex => creator address (reverse lookup)
     *
     * 💡 USE CASE:
     * Dari tokenId, kita bisa dapat creator address:
     * 1. creatorIndex = tokenId / 1000
     * 2. creatorAddress = creatorByIndex[creatorIndex]
     */
    mapping(uint256 => address) public creatorByIndex;

    /**
     * @dev creator address => creatorIndex
     */
    mapping(address => uint256) public creatorIndex;

    /**
     * @dev Base URI untuk metadata fallback
     */
    string private _baseTokenURI;

    /*//////////////////////////////////////////////////////////////
                                EVENTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @dev Events untuk off-chain indexing dan frontend updates
     *
     * 💡 KENAPA EVENTS PENTING?
     * 1. Frontend bisa listen real-time (WebSocket)
     * 2. The Graph bisa index untuk query cepat
     * 3. Audit trail yang immutable
     * 4. Lebih murah dari storage
     *
     * 📊 indexed keyword:
     * - Max 3 indexed per event
     * - Indexed = bisa di-filter dalam query
     */
    event BadgeMinted(
        address indexed to,
        address indexed creator,
        uint256 indexed tokenId,
        uint256 tier
    );

    event BadgeBurned(
        address indexed from,
        address indexed creator,
        uint256 indexed tokenId,
        uint256 tier
    );

    event BadgeUpgraded(
        address indexed user,
        address indexed creator,
        uint256 fromTier,
        uint256 toTier
    );

    event TierCreated(
        address indexed creator,
        uint256 indexed tokenId,
        string name,
        uint256 price
    );

    event SubscriptionManagerUpdated(
        address indexed oldManager,
        address indexed newManager
    );

    /*//////////////////////////////////////////////////////////////
                                ERRORS
    //////////////////////////////////////////////////////////////*/

    /**
     * @dev Custom errors (Solidity 0.8.4+)
     *
     * 💰 GAS COMPARISON:
     * require("Not authorized") = ~200+ gas per character for string
     * error NotAuthorized()     = ~24 gas fixed
     *
     * 📊 SAVINGS:
     * "Not authorized" = 14 chars × 200 = 2800 gas
     * NotAuthorized()  = 24 gas
     * Savings: ~2776 gas per revert!
     */
    error NotAuthorized();
    error InvalidTier();
    error TransferNotAllowed();
    error ZeroAddress();
    error TierNotConfigured();
    error MaxSupplyReached();
    error MinHoldTimeNotMet();
    error CannotDowngrade();
    error TierAlreadyExists();

    /*//////////////////////////////////////////////////////////////
                               MODIFIERS
    //////////////////////////////////////////////////////////////*/

    /**
     * @dev Restrict function ke SubscriptionManager only
     *
     * 🔐 SECURITY PATTERN:
     * Modifier dieksekusi SEBELUM function body.
     * Kalau check fail, function gak jalan sama sekali.
     *
     * _; artinya "lanjut ke function body"
     */
    modifier onlySubscriptionManager() {
        if (msg.sender != subscriptionManager) revert NotAuthorized();
        _;
    }

    /**
     * @dev Validate tier value (1, 2, atau 3)
     */
    modifier validTier(uint256 tier) {
        if (tier < TIER_BRONZE || tier > TIER_GOLD) revert InvalidTier();
        _;
    }

    /*//////////////////////////////////////////////////////////////
                              CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    /**
     * @dev Initialize contract
     *
     * @param baseURI_ Default base URI untuk metadata
     *
     * 💡 CONSTRUCTOR EXECUTION:
     * - Jalan SEKALI saat deploy
     * - msg.sender = deployer
     * - Set initial state
     */
    constructor(string memory baseURI_) ERC1155(baseURI_) Ownable(msg.sender) {
        _baseTokenURI = baseURI_;
    }

    /*//////////////////////////////////////////////////////////////
                           ADMIN FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @dev Set SubscriptionManager address
     *
     * @param manager Address SubscriptionManager contract
     *
     * ⚠️ CRITICAL:
     * Ini harus di-call setelah deploy SubscriptionManager!
     * Salah set = badge bisa di-mint sembarangan
     *
     * 🔄 DEPLOYMENT ORDER:
     * 1. Deploy TieredBadge
     * 2. Deploy SubscriptionManager(badge address)
     * 3. badge.setSubscriptionManager(manager address)
     */
    function setSubscriptionManager(address manager) external onlyOwner {
        if (manager == address(0)) revert ZeroAddress();

        address oldManager = subscriptionManager;
        subscriptionManager = manager;

        emit SubscriptionManagerUpdated(oldManager, manager);
    }

    /**
     * @dev Update base URI untuk metadata fallback
     */
    function setBaseURI(string memory newBaseURI) external onlyOwner {
        _baseTokenURI = newBaseURI;
    }

    /**
     * @dev Register creator dan set creator index
     *
     * @param creator Creator address
     * @param index Unique creator index
     *
     * 💡 Called by SubscriptionManager saat registerCreator()
     */
    function registerCreator(
        address creator,
        uint256 index
    ) external onlySubscriptionManager {
        if (creator == address(0)) revert ZeroAddress();

        creatorByIndex[index] = creator;
        creatorIndex[creator] = index;
    }

    /**
     * @dev Create tier configuration untuk creator
     *
     * @param creator Creator address
     * @param tier Tier level (1/2/3)
     * @param name Tier name ("Bronze", "Silver", "Gold")
     * @param price Price dalam wei
     * @param metadataURI IPFS URI untuk artwork
     * @param maxSupply Max supply (0 = unlimited)
     * @param minHoldTime Min hold time sebelum upgrade
     *
     * 💡 Called by SubscriptionManager saat configureTier()
     */
    function createTier(
        address creator,
        uint256 tier,
        string memory name,
        uint256 price,
        string memory metadataURI,
        uint256 maxSupply,
        uint256 minHoldTime
    ) external onlySubscriptionManager validTier(tier) {
        uint256 index = creatorIndex[creator];
        if (index == 0) revert NotAuthorized();

        uint256 tokenId = _calculateTokenId(index, tier);

        // Check tier doesn't already exist
        if (bytes(tierData[tokenId].name).length > 0) {
            revert TierAlreadyExists();
        }

        tierData[tokenId] = Tier({
            name: name,
            price: price,
            metadataURI: metadataURI,
            maxSupply: maxSupply,
            currentSupply: 0,
            minHoldTime: minHoldTime
        });

        creatorTiers[creator].push(tokenId);

        emit TierCreated(creator, tokenId, name, price);
    }

    /*//////////////////////////////////////////////////////////////
                         MINT & BURN FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @dev Mint badge untuk subscriber (sesuai PDF brief)
     *
     * @param _creator Creator address
     * @param _tierId Tier level (1/2/3)
     *
     * 🔄 FLOW:
     * 1. User call subscribe() di SubscriptionManager
     * 2. SubscriptionManager verify payment
     * 3. SubscriptionManager call mintBadge()
     * 4. Badge di-mint ke user
     *
     * ⚠️ CHECKS:
     * - Only SubscriptionManager bisa call
     * - Tier harus valid (1/2/3)
     * - Max supply belum reached
     */
    function mintBadge(
        address _creator,
        uint256 _tierId
    ) external onlySubscriptionManager validTier(_tierId) {
        uint256 index = creatorIndex[_creator];
        if (index == 0) revert NotAuthorized();

        uint256 tokenId = _calculateTokenId(index, _tierId);
        Tier storage tier = tierData[tokenId];

        // Check tier is configured
        if (bytes(tier.name).length == 0) revert TierNotConfigured();

        // Check max supply
        if (tier.maxSupply > 0 && tier.currentSupply >= tier.maxSupply) {
            revert MaxSupplyReached();
        }

        // Get subscriber address from SubscriptionManager
        // Note: In real implementation, pass subscriber as parameter
        // For now, we assume msg.sender will forward the correct recipient
        address subscriber = tx.origin; // ⚠️ Will be replaced with proper param

        // Update supply
        tier.currentSupply++;

        // Record mint timestamp untuk loyalty calculation
        mintTimestamps[tokenId][subscriber] = block.timestamp;

        // Mint badge
        _mint(subscriber, tokenId, 1, "");

        emit BadgeMinted(subscriber, _creator, tokenId, _tierId);
    }

    /**
     * @dev Mint badge dengan explicit recipient
     *
     * @param to Recipient address
     * @param _creator Creator address
     * @param _tierId Tier level
     */
    function mintBadgeTo(
        address to,
        address _creator,
        uint256 _tierId
    ) external onlySubscriptionManager validTier(_tierId) {
        if (to == address(0)) revert ZeroAddress();

        uint256 index = creatorIndex[_creator];
        if (index == 0) revert NotAuthorized();

        uint256 tokenId = _calculateTokenId(index, _tierId);
        Tier storage tier = tierData[tokenId];

        // Check tier is configured
        if (bytes(tier.name).length == 0) revert TierNotConfigured();

        // Check max supply
        if (tier.maxSupply > 0 && tier.currentSupply >= tier.maxSupply) {
            revert MaxSupplyReached();
        }

        // Update supply
        tier.currentSupply++;

        // Record mint timestamp
        mintTimestamps[tokenId][to] = block.timestamp;

        // Mint badge
        _mint(to, tokenId, 1, "");

        emit BadgeMinted(to, _creator, tokenId, _tierId);
    }

    /**
     * @dev Burn badge saat cancel/upgrade
     *
     * @param from User address
     * @param _creator Creator address
     * @param _tierId Tier level
     */
    function burnBadge(
        address from,
        address _creator,
        uint256 _tierId
    ) external onlySubscriptionManager validTier(_tierId) {
        uint256 index = creatorIndex[_creator];
        uint256 tokenId = _calculateTokenId(index, _tierId);

        // Update supply
        tierData[tokenId].currentSupply--;

        // Clear mint timestamp
        delete mintTimestamps[tokenId][from];

        // Burn badge
        _burn(from, tokenId, 1);

        emit BadgeBurned(from, _creator, tokenId, _tierId);
    }

    /**
     * @dev Upgrade badge dari tier rendah ke tinggi (sesuai PDF brief)
     *
     * @param _creator Creator address
     * @param _fromTier Current tier (yang akan di-burn)
     * @param _toTier Target tier (yang akan di-mint)
     *
     * 🔄 UPGRADE FLOW:
     * 1. Check _toTier > _fromTier (no downgrade!)
     * 2. Check minHoldTime sudah terpenuhi
     * 3. Burn badge lama
     * 4. Mint badge baru
     *
     * ⚠️ BUSINESS RULES:
     * - Hanya bisa UPGRADE, gak bisa downgrade
     * - Harus hold tier sebelumnya selama minHoldTime
     * - User bayar selisih harga di SubscriptionManager
     */
    function upgradeBadge(
        address _creator,
        uint256 _fromTier,
        uint256 _toTier
    ) external onlySubscriptionManager validTier(_fromTier) validTier(_toTier) {
        // Validate upgrade direction
        if (_toTier <= _fromTier) revert CannotDowngrade();

        uint256 index = creatorIndex[_creator];
        if (index == 0) revert NotAuthorized();

        uint256 fromTokenId = _calculateTokenId(index, _fromTier);
        uint256 toTokenId = _calculateTokenId(index, _toTier);

        // Get subscriber from tx.origin (will be replaced with proper param)
        address subscriber = tx.origin;

        // Check min hold time
        Tier storage fromTier = tierData[fromTokenId];
        uint256 holdDuration = block.timestamp -
            mintTimestamps[fromTokenId][subscriber];
        if (holdDuration < fromTier.minHoldTime) revert MinHoldTimeNotMet();

        // Check target tier is configured
        Tier storage toTier = tierData[toTokenId];
        if (bytes(toTier.name).length == 0) revert TierNotConfigured();

        // Check max supply
        if (toTier.maxSupply > 0 && toTier.currentSupply >= toTier.maxSupply) {
            revert MaxSupplyReached();
        }

        // Update supplies
        fromTier.currentSupply--;
        toTier.currentSupply++;

        // Update timestamp for new tier
        delete mintTimestamps[fromTokenId][subscriber];
        mintTimestamps[toTokenId][subscriber] = block.timestamp;

        // Burn old, mint new
        _burn(subscriber, fromTokenId, 1);
        _mint(subscriber, toTokenId, 1, "");

        emit BadgeUpgraded(subscriber, _creator, _fromTier, _toTier);
    }

    /*//////////////////////////////////////////////////////////////
                          VIEW FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @dev Get tier level user untuk creator tertentu (sesuai PDF brief)
     *
     * @param _user User address
     * @param _creator Creator address
     * @return uint256 Tier level (0 jika tidak punya badge)
     *
     * 💡 LOGIC:
     * Check balance untuk setiap tier (3, 2, 1).
     * Return tier tertinggi yang dimiliki.
     * Return 0 jika tidak punya badge sama sekali.
     */
    function getTierLevel(
        address _user,
        address _creator
    ) external view returns (uint256) {
        uint256 index = creatorIndex[_creator];
        if (index == 0) return 0;

        // Check dari tier tertinggi dulu
        for (uint256 tier = TIER_GOLD; tier >= TIER_BRONZE; tier--) {
            uint256 tokenId = _calculateTokenId(index, tier);
            if (balanceOf(_user, tokenId) > 0) {
                return tier;
            }
        }

        return 0; // Tidak punya badge
    }

    /**
     * @dev Calculate loyalty bonus berdasarkan hold duration (sesuai PDF brief)
     *
     * @param _holdDuration Hold duration dalam seconds
     * @return uint256 Bonus points
     *
     * 🏆 BONUS TIERS:
     * ┌─────────────────────┬───────────────┐
     * │   Hold Duration     │ Bonus Points  │
     * ├─────────────────────┼───────────────┤
     * │   < 30 days         │      0        │
     * │   30-90 days        │     10        │
     * │   90-180 days       │     25        │
     * │   180-365 days      │     50        │
     * │   > 365 days        │    100        │
     * └─────────────────────┴───────────────┘
     *
     * 💡 USE CASES:
     * - Discount untuk renewal
     * - Extra voting power
     * - Special badge appearance
     */
    function calculateLoyaltyBonus(
        uint256 _holdDuration
    ) public pure returns (uint256) {
        if (_holdDuration >= LOYALTY_365_DAYS) {
            return 100; // 1+ year = max bonus
        } else if (_holdDuration >= LOYALTY_180_DAYS) {
            return 50; // 6 months+
        } else if (_holdDuration >= LOYALTY_90_DAYS) {
            return 25; // 3 months+
        } else if (_holdDuration >= LOYALTY_30_DAYS) {
            return 10; // 1 month+
        } else {
            return 0; // < 1 month
        }
    }

    /**
     * @dev Get user's loyalty bonus untuk creator tertentu
     *
     * @param _user User address
     * @param _creator Creator address
     * @return bonus Loyalty bonus points
     * @return holdDuration How long user has held the badge
     */
    function getUserLoyaltyBonus(
        address _user,
        address _creator
    ) external view returns (uint256 bonus, uint256 holdDuration) {
        uint256 index = creatorIndex[_creator];
        if (index == 0) return (0, 0);

        // Find user's current tier
        for (uint256 tier = TIER_GOLD; tier >= TIER_BRONZE; tier--) {
            uint256 tokenId = _calculateTokenId(index, tier);
            if (balanceOf(_user, tokenId) > 0) {
                uint256 mintTime = mintTimestamps[tokenId][_user];
                if (mintTime > 0) {
                    holdDuration = block.timestamp - mintTime;
                    bonus = calculateLoyaltyBonus(holdDuration);
                    return (bonus, holdDuration);
                }
            }
        }

        return (0, 0);
    }

    /**
     * @dev Get metadata URI untuk token
     *
     * @param tokenId Token ID
     * @return Full URI ke metadata JSON
     *
     * 📦 METADATA STRUCTURE (di IPFS):
     * {
     *   "name": "Gold Subscriber - Creator XYZ",
     *   "description": "Gold tier subscriber badge",
     *   "image": "ipfs://QmXxx.../gold.png",
     *   "attributes": [
     *     { "trait_type": "Tier", "value": "Gold" },
     *     { "trait_type": "Creator", "value": "0x..." }
     *   ]
     * }
     */
    function uri(uint256 tokenId) public view override returns (string memory) {
        // Check if tier has custom URI
        if (bytes(tierData[tokenId].metadataURI).length > 0) {
            return tierData[tokenId].metadataURI;
        }

        // Fallback to base URI
        return
            string(
                abi.encodePacked(_baseTokenURI, tokenId.toString(), ".json")
            );
    }

    /**
     * @dev Calculate token ID dari creator index dan tier
     */
    function calculateTokenId(
        uint256 _creatorIndex,
        uint256 tier
    ) external pure returns (uint256) {
        return _calculateTokenId(_creatorIndex, tier);
    }

    /**
     * @dev Extract creator index dari token ID
     */
    function getCreatorFromTokenId(
        uint256 tokenId
    ) external pure returns (uint256) {
        return tokenId / CREATOR_MULTIPLIER;
    }

    /**
     * @dev Extract tier dari token ID
     */
    function getTierFromTokenId(
        uint256 tokenId
    ) external pure returns (uint256) {
        return tokenId % CREATOR_MULTIPLIER;
    }

    /**
     * @dev Get all tier token IDs untuk creator
     */
    function getCreatorTiers(
        address creator
    ) external view returns (uint256[] memory) {
        return creatorTiers[creator];
    }

    /**
     * @dev Get tier data
     */
    function getTierData(uint256 tokenId) external view returns (Tier memory) {
        return tierData[tokenId];
    }

    /*//////////////////////////////////////////////////////////////
                         INTERNAL FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @dev Internal helper untuk calculate token ID
     */
    function _calculateTokenId(
        uint256 _creatorIndex,
        uint256 tier
    ) internal pure returns (uint256) {
        return _creatorIndex * CREATOR_MULTIPLIER + tier;
    }

    /*//////////////////////////////////////////////////////////////
                       SOULBOUND OVERRIDES
    //////////////////////////////////////////////////////////////*/

    /**
     * @dev Override _update untuk block transfers (SOULBOUND)
     *
     * 🔒 SOULBOUND IMPLEMENTATION:
     *
     * _update() is called on EVERY token movement:
     * - Mint: from = address(0), to = recipient
     * - Burn: from = holder, to = address(0)
     * - Transfer: from = sender, to = recipient
     *
     * Kita BLOCK transfer biasa, hanya allow mint & burn.
     *
     * ┌──────────────────────────────────────────────────────┐
     * │  Operation  │  from      │  to        │  Allowed?   │
     * ├──────────────────────────────────────────────────────┤
     * │  Mint       │  0x0       │  user      │  ✅ YES     │
     * │  Burn       │  user      │  0x0       │  ✅ YES     │
     * │  Transfer   │  user A    │  user B    │  ❌ NO      │
     * └──────────────────────────────────────────────────────┘
     */
    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values
    ) internal virtual override {
        // Allow minting (from = zero) and burning (to = zero)
        // Block all other transfers
        if (from != address(0) && to != address(0)) {
            revert TransferNotAllowed();
        }

        super._update(from, to, ids, values);
    }

    /**
     * @dev Override setApprovalForAll untuk block approvals
     *
     * Kalau badge gak bisa transfer, approval juga gak perlu.
     * Ini prevent user dari accidentally approve marketplace.
     *
     * Exception: Allow SubscriptionManager untuk burn operations.
     */
    function setApprovalForAll(
        address operator,
        bool approved
    ) public virtual override {
        // Only allow SubscriptionManager to be approved
        if (operator != subscriptionManager) {
            revert TransferNotAllowed();
        }
        super.setApprovalForAll(operator, approved);
    }
}
