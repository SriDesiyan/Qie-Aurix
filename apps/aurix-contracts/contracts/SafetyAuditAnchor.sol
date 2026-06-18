// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title SafetyAuditAnchor
 * @author QIE Aurix Protocol
 * @notice Stores on-chain anchors for AI-generated audit reports.
 *
 * The Aurix oracle periodically audits user protection policies and
 * publishes a report to IPFS. The IPFS CID and a hash of the report
 * contents are stored here, creating a tamper-evident audit trail.
 *
 * Enhanced with an oracle request-fulfill pattern:
 * the oracle registers a pending audit request on-chain, completes the
 * analysis off-chain, then calls back to fulfill with the result.
 * This creates a fully traceable audit round with on-chain request IDs.
 * Design pattern: requestAudit() → fulfillAuditRequest() → anchorAudit().
 *
 * Anyone can verify that the off-chain report matches the on-chain anchor.
 */
contract SafetyAuditAnchor {

    // ── Structs ──────────────────────────────────────────────────────────────

    struct AuditRecord {
        bytes32  contentHash;       // keccak256 of the full audit JSON
        string   ipfsCid;           // IPFS CID of the audit report
        uint256  overallIntegrity;  // 0–100 score
        uint64   anchoredAt;        // unix timestamp
        uint32   auditVersion;      // increments per user
        bool     flagged;           // true if critical findings exist
    }

    struct PolicyIntegrityRecord {
        bytes32  policyHash;        // hash of the policy parameters at audit time
        uint64   checkedAt;
        bool     compliant;
    }

    /**
     * @notice Pending audit request registered before the oracle begins analysis.
     *
     * The oracle requests an audit round by emitting a request ID,
     * then calls fulfillAuditRequest() when the analysis is complete.
     */
    struct AuditRequest {
        address  user;          // wallet address being audited
        uint64   requestedAt;   // when the request was registered
        bool     fulfilled;     // true after fulfillAuditRequest() is called
    }

    // ── State ─────────────────────────────────────────────────────────────────

    /// @dev user address → latest audit record
    mapping(address => AuditRecord) private _audits;

    /// @dev user address → policy contract address → integrity record
    mapping(address => mapping(address => PolicyIntegrityRecord)) private _policyIntegrity;

    /// @dev requestId → pending audit request session tracker
    mapping(bytes32 => AuditRequest) public pendingAuditRequests;

    mapping(address => bool) public authorizedAuditors;
    address public admin;
    uint256 public totalAuditsAnchored;

    // ── Events ────────────────────────────────────────────────────────────────

    event AuditAnchored(address indexed user, string ipfsCid, uint256 integrity, bool flagged);
    event PolicyIntegrityChecked(address indexed user, address indexed policy, bool compliant);
    event AuditRequested(bytes32 indexed requestId, address indexed user, uint64 requestedAt);
    event AuditRequestFulfilled(bytes32 indexed requestId, address indexed user);

    // ── Errors ────────────────────────────────────────────────────────────────

    error Unauthorized();
    error AuditNotFound();

    // ── Modifiers ─────────────────────────────────────────────────────────────

    modifier onlyAdmin() {
        if (msg.sender != admin) revert Unauthorized();
        _;
    }

    modifier onlyAuditor() {
        if (!authorizedAuditors[msg.sender]) revert Unauthorized();
        _;
    }

    // ── Constructor ───────────────────────────────────────────────────────────

    constructor() {
        admin = msg.sender;
        authorizedAuditors[msg.sender] = true;
    }

    // ── Audit Management ──────────────────────────────────────────────────────

    /**
     * @notice Anchor a new audit report for a user.
     * @param user             Address of the audited user
     * @param contentHash      keccak256 of the full audit report JSON
     * @param ipfsCid          IPFS CID of the report
     * @param overallIntegrity Overall integrity score 0–100
     * @param flagged          Whether critical findings were detected
     */
    function anchorAudit(
        address user,
        bytes32 contentHash,
        string calldata ipfsCid,
        uint256 overallIntegrity,
        bool    flagged
    ) external onlyAuditor {
        AuditRecord storage r = _audits[user];
        r.contentHash      = contentHash;
        r.ipfsCid          = ipfsCid;
        r.overallIntegrity = overallIntegrity;
        r.anchoredAt       = uint64(block.timestamp);
        r.auditVersion    += 1;
        r.flagged          = flagged;

        totalAuditsAnchored++;
        emit AuditAnchored(user, ipfsCid, overallIntegrity, flagged);
    }

    /**
     * @notice Record a policy integrity check result.
     */
    function recordPolicyIntegrity(
        address user,
        address policyContract,
        bytes32 policyHash,
        bool    compliant
    ) external onlyAuditor {
        _policyIntegrity[user][policyContract] = PolicyIntegrityRecord({
            policyHash: policyHash,
            checkedAt:  uint64(block.timestamp),
            compliant:  compliant
        });
        emit PolicyIntegrityChecked(user, policyContract, compliant);
    }

    /**
     * @notice Verify that an off-chain report matches the on-chain anchor.
     * @param user         User address
     * @param reportJson   The full report JSON string to verify
     * @return             True if the report matches the stored content hash
     */
    function verifyAuditContent(address user, string calldata reportJson) external view returns (bool) {
        AuditRecord storage r = _audits[user];
        if (r.anchoredAt == 0) revert AuditNotFound();
        bytes32 computedHash = keccak256(abi.encodePacked(reportJson));
        return computedHash == r.contentHash;
    }

    // ── Views ─────────────────────────────────────────────────────────────────

    function getLatestAudit(address user) external view returns (AuditRecord memory) {
        return _audits[user];
    }

    function getPolicyIntegrity(
        address user,
        address policyContract
    ) external view returns (PolicyIntegrityRecord memory) {
        return _policyIntegrity[user][policyContract];
    }

    function hasAudit(address user) external view returns (bool) {
        return _audits[user].anchoredAt > 0;
    }

    // ── Oracle Request-Fulfill Loop ─────────────────

    /**
     * @notice Register an audit request on-chain before the oracle begins analysis.
     *
     * In Aurix, the oracle registers the request on-chain first,
     * creating a traceable audit round with a unique request ID.
     *
     * @param user        Address to audit
     * @param requestId   Unique bytes32 ID for this audit round (generated off-chain)
     */
    function requestAudit(
        address user,
        bytes32 requestId
    ) external onlyAuditor {
        require(!pendingAuditRequests[requestId].fulfilled, "RequestId already fulfilled");
        require(pendingAuditRequests[requestId].requestedAt == 0, "RequestId already exists");
        pendingAuditRequests[requestId] = AuditRequest({
            user:        user,
            requestedAt: uint64(block.timestamp),
            fulfilled:   false
        });
        emit AuditRequested(requestId, user, uint64(block.timestamp));
    }

    /**
     * @notice Fulfill a pending audit request with the analysis result.
     *
     * In Aurix, this is called by the oracle after analysis is complete,
     * anchoring the result atomically.
     *
     * @param requestId       The request ID from requestAudit()
     * @param contentHash     keccak256 of the audit report JSON
     * @param ipfsCid         IPFS CID of the full report
     * @param overallIntegrity 0–100 integrity score
     * @param flagged          Whether critical findings exist
     */
    function fulfillAuditRequest(
        bytes32 requestId,
        bytes32 contentHash,
        string calldata ipfsCid,
        uint256 overallIntegrity,
        bool    flagged
    ) external onlyAuditor {
        AuditRequest storage req = pendingAuditRequests[requestId];
        require(req.requestedAt > 0, "Request not found");
        require(!req.fulfilled, "Already fulfilled");

        req.fulfilled = true;
        emit AuditRequestFulfilled(requestId, req.user);

        // Anchor the result
        AuditRecord storage r = _audits[req.user];
        r.contentHash      = contentHash;
        r.ipfsCid          = ipfsCid;
        r.overallIntegrity = overallIntegrity;
        r.anchoredAt       = uint64(block.timestamp);
        r.auditVersion    += 1;
        r.flagged          = flagged;

        totalAuditsAnchored++;
        emit AuditAnchored(req.user, ipfsCid, overallIntegrity, flagged);
    }

    // ── Admin ─────────────────────────────────────────────────────────────

    function setAuditorAuthorization(address auditor, bool status) external onlyAdmin {
        authorizedAuditors[auditor] = status;
    }

    function transferAdmin(address newAdmin) external onlyAdmin {
        admin = newAdmin;
    }
}
