// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title TrustProfileRegistry
 * @author QIE Aurix Protocol
 * @notice Stores per-user Trust Profile commitments and resilience allocation weights on-chain.
 *
 * The actual Trust Profile is computed off-chain by the Aurix oracle and
 * stored as an IPFS content hash. This contract anchors the commitment
 * so that profile data can be verified for integrity.
 *
 * Enhanced with asset weight tracking — each user's resilience-optimized
 * allocation weights are stored as a batch-updateable struct array,
 * enabling the oracle to push rebalancing recommendations on-chain.
 * Design pattern: track asset allocation weights with lastUpdated staleness check.
 *
 * QIE Pass identity is the root of trust.
 */
contract TrustProfileRegistry {

    // ── Structs ──────────────────────────────────────────────────────────────

    struct ProfileRecord {
        address     owner;
        bytes32     profileCommitment;   // keccak256 of the off-chain profile JSON
        string      ipfsCid;             // IPFS CID of the full Trust Profile
        uint256     resilienceScore;     // 0–1000, last oracle-computed value
        uint256     trustComposite;      // 0–100, QIE Trust Graph composite
        uint32      version;             // increments on every update
        uint64      updatedAt;           // unix timestamp
        bool        guardianActive;      // whether Guardian Mode is enabled
    }

    /**
     * @notice Resilience-optimized allocation weight for a single asset.
     *
     * Mirrors the Weight struct pattern from oracle-driven allocation engines:
     * each asset is assigned a basis-point weight (sum = 10,000) computed
     * by the AurixResilienceEngine for safety-first portfolio balancing.
     */
    struct AssetWeight {
        uint256 index;          // position in the weights array
        address tokenAddress;   // ERC-20 token address
        string  symbol;         // human-readable symbol
        uint256 weightBps;      // allocation weight in basis points (sum = 10,000)
        uint64  setAt;          // unix timestamp when weight was set
    }

    // ── State ─────────────────────────────────────────────────────────────────

    /// @dev address → profile record
    mapping(address => ProfileRecord) private _profiles;

    /// @dev address → resilience allocation weights (oracle-driven, 10,000 bps total)
    mapping(address => AssetWeight[]) private _resilientWeights;

    /// @dev address → timestamp of last weight update
    mapping(address => uint64) public lastWeightUpdate;

    /// @dev QIE Pass contract address (set at construction, updatable by owner)
    address public qiePassContract;

    /// @dev Authorized oracle addresses allowed to push score updates
    mapping(address => bool) public authorizedOracles;

    address public admin;

    // ── Events ────────────────────────────────────────────────────────────────

    event ProfileRegistered(address indexed owner, string ipfsCid, uint256 resilienceScore);
    event ProfileUpdated(address indexed owner, uint256 newScore, uint32 version);
    event GuardianModeToggled(address indexed owner, bool active);
    event OracleAuthorized(address indexed oracle, bool status);
    event WeightsUpdated(address indexed owner, uint256 totalAssets, uint64 updatedAt);

    // ── Errors ────────────────────────────────────────────────────────────────

    error Unauthorized();
    error ProfileNotFound();
    error InvalidCommitment();

    // ── Modifiers ─────────────────────────────────────────────────────────────

    modifier onlyAdmin() {
        if (msg.sender != admin) revert Unauthorized();
        _;
    }

    modifier onlyOracle() {
        if (!authorizedOracles[msg.sender]) revert Unauthorized();
        _;
    }

    // ── Constructor ───────────────────────────────────────────────────────────

    constructor(address _qiePassContract) {
        admin           = msg.sender;
        qiePassContract = _qiePassContract;
        authorizedOracles[msg.sender] = true;
    }

    // ── Profile Management ────────────────────────────────────────────────────

    /**
     * @notice Register or update a Trust Profile for the caller.
     * @param commitment   keccak256 hash of the off-chain profile payload
     * @param ipfsCid      IPFS CID where the full profile JSON is stored
     * @param score        Resilience Score 0–1000 computed by oracle
     * @param trustScore   Trust Graph composite 0–100
     */
    function commitProfile(
        bytes32 commitment,
        string calldata ipfsCid,
        uint256 score,
        uint256 trustScore
    ) external {
        if (commitment == bytes32(0)) revert InvalidCommitment();

        ProfileRecord storage rec = _profiles[msg.sender];
        bool isNew = rec.owner == address(0);

        rec.owner               = msg.sender;
        rec.profileCommitment   = commitment;
        rec.ipfsCid             = ipfsCid;
        rec.resilienceScore     = score;
        rec.trustComposite      = trustScore;
        rec.version            += 1;
        rec.updatedAt           = uint64(block.timestamp);

        if (isNew) {
            emit ProfileRegistered(msg.sender, ipfsCid, score);
        } else {
            emit ProfileUpdated(msg.sender, score, rec.version);
        }
    }

    /**
     * @notice Oracle-pushed score update (does not require user signature).
     *         Used for continuous monitoring updates.
     */
    function pushScoreUpdate(
        address user,
        uint256 newScore,
        uint256 newTrustScore,
        bytes32 newCommitment
    ) external onlyOracle {
        ProfileRecord storage rec = _profiles[user];
        if (rec.owner == address(0)) revert ProfileNotFound();

        rec.resilienceScore   = newScore;
        rec.trustComposite    = newTrustScore;
        rec.profileCommitment = newCommitment;
        rec.version          += 1;
        rec.updatedAt         = uint64(block.timestamp);

        emit ProfileUpdated(user, newScore, rec.version);
    }

    /**
     * @notice Toggle Guardian Mode for the caller's profile.
     */
    function setGuardianMode(bool active) external {
        ProfileRecord storage rec = _profiles[msg.sender];
        if (rec.owner == address(0)) revert ProfileNotFound();
        rec.guardianActive = active;
        emit GuardianModeToggled(msg.sender, active);
    }

    // ── Views ─────────────────────────────────────────────────────────────────

    function getProfile(address user) external view returns (ProfileRecord memory) {
        return _profiles[user];
    }

    function hasProfile(address user) external view returns (bool) {
        return _profiles[user].owner != address(0);
    }

    function getResilienceScore(address user) external view returns (uint256) {
        return _profiles[user].resilienceScore;
    }

    function isGuardianActive(address user) external view returns (bool) {
        return _profiles[user].guardianActive;
    }

    // ── Allocation Weights ───────

    /**
     * @notice Oracle pushes a new set of resilience-optimized allocation weights.
     *         Weights must sum to exactly 10,000 basis points.
     *
     * Pattern: adapted from FundManager.decodeResult() batch weight update.
     *          The oracle decodes its optimization output and stores per-asset
     *          weights for use by the frontend and protection engine.
     *
     * @param user      Address to update weights for
     * @param tokens    ERC-20 token addresses in weight order
     * @param symbols   Human-readable symbols matching tokens
     * @param weightsBps Allocation weights in basis points (must sum to 10,000)
     */
    function updateResilientWeights(
        address          user,
        address[] calldata tokens,
        string[]  calldata symbols,
        uint256[] calldata weightsBps
    ) external onlyOracle {
        require(tokens.length == symbols.length && symbols.length == weightsBps.length,
                "Array length mismatch");

        // Verify weights sum to 10,000 bps
        uint256 total = 0;
        for (uint256 i = 0; i < weightsBps.length; i++) {
            total += weightsBps[i];
        }
        require(total == 10_000, "Weights must sum to 10,000 bps");

        // Replace existing weights
        delete _resilientWeights[user];
        for (uint256 i = 0; i < tokens.length; i++) {
            _resilientWeights[user].push(AssetWeight({
                index:        i,
                tokenAddress: tokens[i],
                symbol:       symbols[i],
                weightBps:    weightsBps[i],
                setAt:        uint64(block.timestamp)
            }));
        }

        lastWeightUpdate[user] = uint64(block.timestamp);
        emit WeightsUpdated(user, tokens.length, uint64(block.timestamp));
    }

    /**
     * @notice Get the resilience-optimized weights for a user.
     */
    function getResilientWeights(address user) external view returns (AssetWeight[] memory) {
        return _resilientWeights[user];
    }

    /**
     * @notice Check whether the weights are stale (older than 7 days).
     */
    function areWeightsStale(address user) external view returns (bool) {
        uint64 last = lastWeightUpdate[user];
        return last == 0 || (block.timestamp - last) > 7 days;
    }

    // ── Admin ─────────────────────────────────────────────────────────────────

    function setOracleAuthorization(address oracle, bool status) external onlyAdmin {
        authorizedOracles[oracle] = status;
        emit OracleAuthorized(oracle, status);
    }

    function setQiePassContract(address newPass) external onlyAdmin {
        qiePassContract = newPass;
    }

    function transferAdmin(address newAdmin) external onlyAdmin {
        admin = newAdmin;
    }
}
