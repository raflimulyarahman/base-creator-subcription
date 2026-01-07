// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./TieredBadge.sol";
import "./SubscriptionManager.sol";

/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║                              GATED CONTENT                                    ║
 * ╠══════════════════════════════════════════════════════════════════════════════╣
 * ║  OVERVIEW                                                                     ║
 * ║  ────────                                                                     ║
 * ║  Contract ini handle exclusive content dan viral conversion mechanism.        ║
 * ║  Fitur utama: gated access, voting, dan viral conversion.                     ║
 * ║                                                                               ║
 * ║  🎯 CORE CONCEPT: VIRAL CONVERSION                                            ║
 * ║  ─────────────────────────────────                                            ║
 * ║                                                                               ║
 * ║    ┌─────────────┐     ┌─────────────┐     ┌─────────────┐                    ║
 * ║    │  Exclusive  │────▶│ Engagement  │────▶│   Viral     │                    ║
 * ║    │   Content   │     │  (Voting)   │     │ Conversion  │                    ║
 * ║    └─────────────┘     └─────────────┘     └─────────────┘                    ║
 * ║           │                   │                   │                           ║
 * ║           ▼                   ▼                   ▼                           ║
 * ║    Only subscribers     Subscribers vote    Content goes                      ║
 * ║    can access           to make public      PUBLIC! 🎉                        ║
 * ║                                                                               ║
 * ║  💡 WHY THIS MATTERS:                                                         ║
 * ║  ─────────────────────                                                        ║
 * ║  1. Subscribers feel OWNERSHIP                                                ║
 * ║     - "Saya yang bantu content ini viral!"                                    ║
 * ║                                                                               ║
 * ║  2. Social Proof on-chain                                                     ║
 * ║     - "100 orang vote untuk content ini"                                      ║
 * ║                                                                               ║
 * ║  3. Incentivizes Engagement                                                   ║
 * ║     - Passive viewer → Active participant                                     ║
 * ║                                                                               ║
 * ║  4. Early Supporter Rewards                                                   ║
 * ║     - First voters dapat bonus/recognition                                    ║
 * ║                                                                               ║
 * ║  🏆 VIRAL SCORE SYSTEM                                                        ║
 * ║  ────────────────────                                                         ║
 * ║  Setiap post punya viralScore yang naik berdasarkan:                          ║
 * ║  - Votes received                                                             ║
 * ║  - Voter tier (Gold vote > Bronze vote)                                       ║
 * ║  - Engagement speed                                                           ║
 * ║                                                                               ║
 * ║  📦 CONTENT STORAGE                                                           ║
 * ║  ─────────────────                                                            ║
 * ║  Contract HANYA store IPFS hash (CID).                                        ║
 * ║  Actual content disimpan di IPFS, bukan on-chain.                             ║
 * ║                                                                               ║
 * ║  Kenapa?                                                                      ║
 * ║  - On-chain storage = ~20,000 gas per 32 bytes                                ║
 * ║  - 1MB image = ~625,000 × 20,000 = 12.5 billion gas!                          ║
 * ║  - Impossible dan mahal banget                                                ║
 * ║                                                                               ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */
contract GatedContent is Ownable {
    /*//////////////////////////////////////////////////////////////
                               STRUCTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @dev ExclusivePost struct (sesuai PDF brief)
     *
     * 📦 FIELDS EXPLAINED:
     *
     * ┌────────────────────────────────────────────────────────────────────────┐
     * │ Field               │ Type    │ Purpose                               │
     * ├────────────────────────────────────────────────────────────────────────┤
     * │ postId              │ uint256 │ Unique post identifier                │
     * │ creator             │ address │ Creator yang posting                  │
     * │ minTierRequired     │ uint256 │ Min tier untuk access (1/2/3)         │
     * │ contentHash         │ string  │ IPFS CID (QmXxx... atau bafyxxx...)   │
     * │ createdAt           │ uint256 │ Timestamp creation                    │
     * │ isPublic            │ bool    │ Sudah public atau masih exclusive     │
     * │ viralScore          │ uint256 │ Score berdasarkan engagement          │
     * │ conversionThreshold │ uint256 │ Votes needed untuk go public          │
     * │ currentVotes        │ uint256 │ Current vote count                    │
     * └────────────────────────────────────────────────────────────────────────┘
     *
     * 💡 viralScore vs currentVotes:
     * - currentVotes = raw vote count
     * - viralScore = weighted score (Gold vote = 3 points, Silver = 2, Bronze = 1)
     */
    struct ExclusivePost {
        uint256 postId;
        address creator;
        uint256 minTierRequired;
        string contentHash; // IPFS hash
        uint256 createdAt;
        bool isPublic;
        uint256 viralScore; // Weighted engagement score
        uint256 conversionThreshold;
        uint256 currentVotes;
    }

    /**
     * @dev VoterInfo untuk track voter details
     *
     * 💡 USE CASES:
     * - Prevent double voting
     * - Track voting order untuk early supporter rewards
     * - Store voter tier saat vote (untuk weighted scoring)
     */
    struct VoterInfo {
        bool hasVoted;
        uint256 voteOrder; // 1st, 2nd, 3rd voter etc
        uint256 votedAt; // Timestamp
        uint256 tierAtVote; // Tier voter saat vote
        uint256 rewardClaimed; // Reward yang sudah di-claim
    }

    /**
     * @dev EarlyVoterReward untuk distribusi rewards
     */
    struct EarlyVoterReward {
        address voter;
        uint256 rewardAmount;
        bool claimed;
    }

    /*//////////////////////////////////////////////////////////////
                               CONSTANTS
    //////////////////////////////////////////////////////////////*/

    /// @dev Tier vote weights (untuk viralScore calculation)
    uint256 public constant BRONZE_VOTE_WEIGHT = 1;
    uint256 public constant SILVER_VOTE_WEIGHT = 2;
    uint256 public constant GOLD_VOTE_WEIGHT = 3;

    /// @dev Early voter reward slots (top N voters dapat reward)
    uint256 public constant EARLY_VOTER_SLOTS = 3;

    /// @dev Reward percentage dari creator's earnings (dalam basis points)
    uint256 public constant EARLY_VOTER_REWARD_BPS = 100; // 1%

    /*//////////////////////////////////////////////////////////////
                                STORAGE
    //////////////////////////////////////////////////////////////*/

    /// @dev Reference ke contracts lain
    TieredBadge public immutable badge;
    SubscriptionManager public immutable subscriptionManager;

    /// @dev Post counter (juga jadi post ID)
    uint256 public postCount;

    /// @dev postId => ExclusivePost data (sesuai PDF brief)
    mapping(uint256 => ExclusivePost) public exclusivePosts;

    /// @dev creator => postIds (sesuai PDF brief)
    mapping(address => uint256[]) public creatorPosts;

    /// @dev subscriber => postId => voted (sesuai PDF brief)
    mapping(address => mapping(uint256 => bool)) public votes;

    /// @dev postId => voter address => VoterInfo (extended voting info)
    mapping(uint256 => mapping(address => VoterInfo)) public voterInfo;

    /// @dev postId => array of voter addresses (untuk iterate)
    mapping(uint256 => address[]) public postVoters;

    /// @dev postId => EarlyVoterReward[] (rewards untuk distribusi)
    mapping(uint256 => EarlyVoterReward[]) public earlyVoterRewards;

    /// @dev Total rewards pool per post
    mapping(uint256 => uint256) public postRewardPool;

    /*//////////////////////////////////////////////////////////////
                                EVENTS
    //////////////////////////////////////////////////////////////*/

    event PostCreated(
        uint256 indexed postId,
        address indexed creator,
        uint256 minTierRequired,
        uint256 conversionThreshold,
        string contentHash
    );

    event VoteCast(
        uint256 indexed postId,
        address indexed voter,
        uint256 voteOrder,
        uint256 voterTier,
        uint256 viralScore,
        uint256 currentVotes
    );

    /**
     * @dev Event sesuai PDF brief
     */
    event PostWentPublic(
        uint256 indexed postId,
        uint256 timestamp,
        uint256 totalVotes,
        uint256 finalViralScore
    );

    event VoterRewardDistributed(
        uint256 indexed postId,
        address indexed voter,
        uint256 rewardAmount
    );

    event RewardClaimed(
        uint256 indexed postId,
        address indexed voter,
        uint256 amount
    );

    event PostDeleted(uint256 indexed postId, address indexed creator);

    /*//////////////////////////////////////////////////////////////
                                ERRORS
    //////////////////////////////////////////////////////////////*/

    error NotCreator();
    error NotSubscribed();
    error InsufficientTier();
    error AlreadyVoted();
    error PostNotFound();
    error AlreadyPublic();
    error InvalidThreshold();
    error Unauthorized();
    error NoRewardToClaim();
    error RewardAlreadyClaimed();

    /*//////////////////////////////////////////////////////////////
                             CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    /**
     * @dev Initialize dengan references ke contracts lain
     *
     * @param _badge Address TieredBadge contract
     * @param _subscriptionManager Address SubscriptionManager contract
     *
     * 🔄 DEPLOYMENT ORDER:
     * 1. Deploy TieredBadge
     * 2. Deploy SubscriptionManager
     * 3. Deploy GatedContent(badge, manager)
     * 4. badge.setSubscriptionManager(manager)
     */
    constructor(
        address _badge,
        address _subscriptionManager
    ) Ownable(msg.sender) {
        badge = TieredBadge(_badge);
        subscriptionManager = SubscriptionManager(_subscriptionManager);
    }

    /*//////////////////////////////////////////////////////////////
                         CREATOR FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @dev Create exclusive post (sesuai PDF brief)
     *
     * @param _minTier Minimum tier untuk access (1=Bronze, 2=Silver, 3=Gold)
     * @param _contentHash IPFS CID untuk content
     * @param _threshold Votes needed untuk go public
     * @return uint256 Post ID
     *
     * 🔄 FLOW:
     * 1. Validate caller is registered creator
     * 2. Validate parameters
     * 3. Create post
     * 4. Store in mappings
     * 5. Emit event
     *
     * 💡 IPFS HASH FORMATS:
     * - CIDv0: "QmXxx..." (46 chars, base58)
     * - CIDv1: "bafyxxx..." (variable, base32)
     *
     * 📊 THRESHOLD RECOMMENDATIONS:
     * ┌─────────────────────────────────────────────────────────────┐
     * │ Content Type      │ Recommended Threshold │ Rationale      │
     * ├─────────────────────────────────────────────────────────────┤
     * │ Teaser/Preview    │ 5-10 votes            │ Easy viral     │
     * │ Regular Content   │ 20-50 votes           │ Medium effort  │
     * │ Premium Content   │ 50-100 votes          │ High exclusivity│
     * │ Ultra Exclusive   │ 100+ votes            │ Very exclusive │
     * └─────────────────────────────────────────────────────────────┘
     */
    function createExclusivePost(
        uint256 _minTier,
        string memory _contentHash,
        uint256 _threshold
    ) external returns (uint256) {
        // Check caller is registered creator
        SubscriptionManager.Creator memory creator = subscriptionManager
            .getCreator(msg.sender);
        if (creator.wallet == address(0)) revert NotCreator();

        // Validate parameters
        if (_minTier < 1 || _minTier > 3) revert InsufficientTier();
        if (_threshold == 0) revert InvalidThreshold();

        // Create post
        postCount++;
        uint256 postId = postCount;

        exclusivePosts[postId] = ExclusivePost({
            postId: postId,
            creator: msg.sender,
            minTierRequired: _minTier,
            contentHash: _contentHash,
            createdAt: block.timestamp,
            isPublic: false,
            viralScore: 0,
            conversionThreshold: _threshold,
            currentVotes: 0
        });

        // Track creator's posts
        creatorPosts[msg.sender].push(postId);

        emit PostCreated(
            postId,
            msg.sender,
            _minTier,
            _threshold,
            _contentHash
        );

        return postId;
    }

    /**
     * @dev Delete post (creator only)
     *
     * @param postId Post ID to delete
     */
    function deletePost(uint256 postId) external {
        ExclusivePost storage post = exclusivePosts[postId];
        if (post.creator == address(0)) revert PostNotFound();
        if (post.creator != msg.sender) revert Unauthorized();

        // Clear post data
        delete exclusivePosts[postId];

        emit PostDeleted(postId, msg.sender);
    }

    /**
     * @dev Add to reward pool (bisa di-call oleh creator atau anyone)
     *
     * @param postId Post ID
     */
    function fundRewardPool(uint256 postId) external payable {
        ExclusivePost storage post = exclusivePosts[postId];
        if (post.creator == address(0)) revert PostNotFound();

        postRewardPool[postId] += msg.value;
    }

    /*//////////////////////////////////////////////////////////////
                        SUBSCRIBER FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @dev Vote untuk public release (sesuai PDF brief)
     *
     * @param _postId Post ID to vote for
     *
     * 🔄 FLOW:
     * 1. Check post exists
     * 2. Check not already public
     * 3. Check voter has access (tier check)
     * 4. Check hasn't voted before
     * 5. Record vote dengan weighted score
     * 6. Check threshold → convert to public if reached
     *
     * 🏆 VIRAL SCORE CALCULATION:
     * - Bronze voter = +1 point
     * - Silver voter = +2 points
     * - Gold voter   = +3 points
     *
     * This incentivizes higher tier subscribers to vote,
     * karena vote mereka lebih "berharga".
     */
    function voteForPublicRelease(uint256 _postId) external {
        ExclusivePost storage post = exclusivePosts[_postId];

        // Validations
        if (post.creator == address(0)) revert PostNotFound();
        if (post.isPublic) revert AlreadyPublic();
        if (votes[msg.sender][_postId]) revert AlreadyVoted();

        // Check voter has sufficient tier
        if (!hasAccess(msg.sender, _postId)) revert InsufficientTier();

        // Get voter's tier
        uint256 voterTier = badge.getTierLevel(msg.sender, post.creator);

        // Calculate vote weight
        uint256 voteWeight = _getVoteWeight(voterTier);

        // Record vote (sesuai PDF brief)
        votes[msg.sender][_postId] = true;

        // Increment counters
        uint256 voteOrder = post.currentVotes + 1;
        post.currentVotes = voteOrder;
        post.viralScore += voteWeight;

        // Store detailed voter info
        voterInfo[_postId][msg.sender] = VoterInfo({
            hasVoted: true,
            voteOrder: voteOrder,
            votedAt: block.timestamp,
            tierAtVote: voterTier,
            rewardClaimed: 0
        });

        postVoters[_postId].push(msg.sender);

        emit VoteCast(
            _postId,
            msg.sender,
            voteOrder,
            voterTier,
            post.viralScore,
            post.currentVotes
        );

        // Check if threshold reached (sesuai PDF brief)
        if (post.currentVotes >= post.conversionThreshold) {
            _convertToPublic(_postId);
        }
    }

    /**
     * @dev Claim voter reward
     *
     * @param postId Post ID
     */
    function claimVoterReward(uint256 postId) external {
        ExclusivePost storage post = exclusivePosts[postId];
        if (post.creator == address(0)) revert PostNotFound();
        if (!post.isPublic) revert PostNotFound(); // Only after viral

        VoterInfo storage info = voterInfo[postId][msg.sender];
        if (!info.hasVoted) revert NoRewardToClaim();

        // Check if early voter
        if (info.voteOrder > EARLY_VOTER_SLOTS) revert NoRewardToClaim();

        // Find reward
        EarlyVoterReward[] storage rewards = earlyVoterRewards[postId];
        for (uint i = 0; i < rewards.length; i++) {
            if (rewards[i].voter == msg.sender) {
                if (rewards[i].claimed) revert RewardAlreadyClaimed();

                uint256 amount = rewards[i].rewardAmount;
                rewards[i].claimed = true;
                info.rewardClaimed = amount;

                // Transfer reward
                (bool success, ) = msg.sender.call{value: amount}("");
                require(success, "Transfer failed");

                emit RewardClaimed(postId, msg.sender, amount);
                return;
            }
        }

        revert NoRewardToClaim();
    }

    /*//////////////////////////////////////////////////////////////
                          VIEW FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @dev Check apakah user bisa access post (sesuai PDF brief)
     *
     * @param _user User address
     * @param _postId Post ID
     * @return bool True jika bisa access
     *
     * 📋 ACCESS RULES:
     * 1. Post sudah public → anyone can access
     * 2. User adalah creator → always access
     * 3. User punya active subscription + tier >= minTierRequired → access
     * 4. Otherwise → no access
     */
    function hasAccess(
        address _user,
        uint256 _postId
    ) public view returns (bool) {
        ExclusivePost storage post = exclusivePosts[_postId];
        if (post.creator == address(0)) return false;

        // Public posts = everyone can access
        if (post.isPublic) return true;

        // Creator always has access
        if (_user == post.creator) return true;

        // Check subscription
        bool hasActiveSub = subscriptionManager.hasActiveSubscription(
            _user,
            post.creator
        );
        if (!hasActiveSub) return false;

        // Check tier level
        uint256 userTier = badge.getTierLevel(_user, post.creator);
        return userTier >= post.minTierRequired;
    }

    /**
     * @dev Get post details
     */
    function getPost(
        uint256 postId
    ) external view returns (ExclusivePost memory) {
        return exclusivePosts[postId];
    }

    /**
     * @dev Get all posts by creator
     */
    function getCreatorPosts(
        address creator
    ) external view returns (uint256[] memory) {
        return creatorPosts[creator];
    }

    /**
     * @dev Get voter info
     */
    function getVoterInfo(
        uint256 postId,
        address voter
    ) external view returns (VoterInfo memory) {
        return voterInfo[postId][voter];
    }

    /**
     * @dev Get all voters for a post
     */
    function getPostVoters(
        uint256 postId
    ) external view returns (address[] memory) {
        return postVoters[postId];
    }

    /**
     * @dev Get early voters (top N)
     */
    function getEarlyVoters(
        uint256 postId
    ) external view returns (address[] memory) {
        address[] storage allVoters = postVoters[postId];
        uint256 count = allVoters.length < EARLY_VOTER_SLOTS
            ? allVoters.length
            : EARLY_VOTER_SLOTS;

        address[] memory early = new address[](count);
        for (uint256 i = 0; i < count; i++) {
            early[i] = allVoters[i];
        }

        return early;
    }

    /**
     * @dev Get voting progress
     */
    function getVotingProgress(
        uint256 postId
    )
        external
        view
        returns (
            uint256 currentVotes,
            uint256 threshold,
            uint256 viralScore,
            uint256 percentComplete
        )
    {
        ExclusivePost storage post = exclusivePosts[postId];
        currentVotes = post.currentVotes;
        threshold = post.conversionThreshold;
        viralScore = post.viralScore;

        if (threshold == 0) {
            percentComplete = 0;
        } else {
            percentComplete = (currentVotes * 100) / threshold;
            if (percentComplete > 100) percentComplete = 100;
        }
    }

    /**
     * @dev Get early voter rewards
     */
    function getEarlyVoterRewards(
        uint256 postId
    ) external view returns (EarlyVoterReward[] memory) {
        return earlyVoterRewards[postId];
    }

    /*//////////////////////////////////////////////////////////////
                        INTERNAL FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @dev Convert post to public (sesuai PDF brief)
     *
     * 🎉 VIRAL CONVERSION!
     *
     * 🔄 FLOW:
     * 1. Set post as public
     * 2. Distribute voter rewards
     * 3. Emit event
     */
    function _convertToPublic(uint256 _postId) internal {
        ExclusivePost storage post = exclusivePosts[_postId];
        post.isPublic = true;

        // Distribute rewards to early voters (sesuai PDF brief)
        _distributeVoterRewards(_postId);

        emit PostWentPublic(
            _postId,
            block.timestamp,
            post.currentVotes,
            post.viralScore
        );
    }

    /**
     * @dev Distribute rewards to early voters (sesuai PDF brief)
     *
     * @param _postId Post ID
     *
     * 🏆 REWARD DISTRIBUTION:
     * - Top 3 voters share the reward pool
     * - Distribution: 1st = 50%, 2nd = 30%, 3rd = 20%
     *
     * 💡 REWARD POOL SOURCE:
     * - Could be funded by creator
     * - Or from platform incentives
     * - Or from portion of subscription fees
     */
    function _distributeVoterRewards(uint256 _postId) internal {
        address[] storage allVoters = postVoters[_postId];
        uint256 rewardPool = postRewardPool[_postId];

        if (rewardPool == 0 || allVoters.length == 0) {
            return;
        }

        // Distribution percentages (in basis points)
        uint256[3] memory shares = [uint256(5000), 3000, 2000]; // 50%, 30%, 20%

        uint256 voterCount = allVoters.length < EARLY_VOTER_SLOTS
            ? allVoters.length
            : EARLY_VOTER_SLOTS;

        for (uint256 i = 0; i < voterCount; i++) {
            address voter = allVoters[i];
            uint256 rewardAmount = (rewardPool * shares[i]) / 10000;

            earlyVoterRewards[_postId].push(
                EarlyVoterReward({
                    voter: voter,
                    rewardAmount: rewardAmount,
                    claimed: false
                })
            );

            emit VoterRewardDistributed(_postId, voter, rewardAmount);
        }
    }

    /**
     * @dev Get vote weight based on tier
     *
     * @param tier Voter's tier
     * @return weight Vote weight
     *
     * 🏆 WEIGHTS:
     * - Bronze (1) = 1 point
     * - Silver (2) = 2 points
     * - Gold (3) = 3 points
     */
    function _getVoteWeight(uint256 tier) internal pure returns (uint256) {
        if (tier == 3) return GOLD_VOTE_WEIGHT;
        if (tier == 2) return SILVER_VOTE_WEIGHT;
        return BRONZE_VOTE_WEIGHT;
    }

    /*//////////////////////////////////////////////////////////////
                        BATCH VIEW FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @dev Get multiple posts in one call
     */
    function getPosts(
        uint256[] calldata postIds
    ) external view returns (ExclusivePost[] memory) {
        ExclusivePost[] memory result = new ExclusivePost[](postIds.length);
        for (uint256 i = 0; i < postIds.length; i++) {
            result[i] = exclusivePosts[postIds[i]];
        }
        return result;
    }

    /**
     * @dev Check access for multiple posts
     */
    function hasAccessBatch(
        address user,
        uint256[] calldata postIds
    ) external view returns (bool[] memory) {
        bool[] memory result = new bool[](postIds.length);
        for (uint256 i = 0; i < postIds.length; i++) {
            result[i] = hasAccess(user, postIds[i]);
        }
        return result;
    }
}
