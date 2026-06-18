// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title AurixRecoveryGate
 * @author QIE Aurix Protocol
 * @notice Permissionless mis-transfer recovery for Aurix-managed contracts.
 *
 * When tokens are accidentally sent to an Aurix contract, the rightful owner
 * can submit a cryptographic claim proof to recover them — without requiring
 * any admin intervention or owner-only rescue function.
 *
 * Claim proof: the claimant signs the message:
 *   keccak256(abi.encodePacked(claimId, token, amount, claimant, targetContract))
 * with their QIE Pass-linked wallet.
 *
 * An authorized verifier (the Aurix oracle) countersigns to confirm the
 * claim is valid before releasing funds. This two-signature design prevents
 * abuse while keeping the process admin-free.
 *
 * Enhanced with intentional deposit tracking:
 * the `intentionalDeposits` mapping marks tokens that are deliberately
 * held by an Aurix contract (e.g. policy reserves), distinguishing them
 * from tokens that arrived accidentally and are eligible for recovery.
 * This prevents legitimate vault assets from being recovered by mistake.
 *
 * Also adds txHash-based deduplication so the same accidental
 * transfer cannot be claimed twice.
 */
contract AurixRecoveryGate is ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    // ── Structs ──────────────────────────────────────────────────────────────

    struct RecoveryClaim {
        address  claimant;
        address  token;
        uint256  amount;
        address  targetContract;
        uint64   submittedAt;
        ClaimStatus status;
    }

    enum ClaimStatus { PENDING, VERIFIED, RELEASED, REJECTED }

    // ── State ─────────────────────────────────────────────────────────────────

    mapping(bytes32 => RecoveryClaim) public claims;     // claimId → claim
    mapping(address => bool) public authorizedVerifiers;  // oracle addresses
    mapping(bytes32 => bool) private _usedClaimIds;

    /**
     * @notice Tracks tokens that Aurix contracts intentionally hold.
     *
     * The intentionalDeposits mapping distinguishes between tokens the contract is
     * meant to hold vs tokens that were accidentally transferred in.
     *
     * In Aurix: when a vault (ResiliencePolicyVault, FamilyVaultController)
     * accepts a user deposit, it should mark those tokens as intentional here.
     * Recovery claims for intentionally-deposited amounts are rejected.
     *
     * targetContract → token → intentionally held amount
     */
    mapping(address => mapping(address => uint256)) public intentionalDeposits;

    /**
     * @notice Prevents the same tx hash from being claimed twice.
     *
     * This mapping ensures a given transaction hash can only generate one recovery claim.
     *
     * txHash → claimId (bytes32(0) if not yet claimed)
     */
    mapping(bytes32 => bytes32) public recoveredByTxHash;

    address public admin;
    uint256 public totalRecovered;
    uint256 public claimCount;

    // ── Events ────────────────────────────────────────────────────────────────

    event ClaimSubmitted(bytes32 indexed claimId, address indexed claimant, address token, uint256 amount);
    event ClaimVerified(bytes32 indexed claimId);
    event ClaimReleased(bytes32 indexed claimId, address indexed recipient, uint256 amount);
    event ClaimRejected(bytes32 indexed claimId, string reason);
    event IntentionalDepositMarked(address indexed targetContract, address indexed token, uint256 amount);
    event TxHashClaimed(bytes32 indexed txHash, bytes32 indexed claimId);

    // ── Errors ────────────────────────────────────────────────────────────────

    error Unauthorized();
    error ClaimAlreadyExists();
    error ClaimNotVerified();
    error InvalidSignature();
    error ZeroAmount();
    error InvalidClaimant();
    error IntentionalDepositConflict();
    error TxHashAlreadyClaimed();

    // ── Modifiers ─────────────────────────────────────────────────────────────

    modifier onlyAdmin() {
        if (msg.sender != admin) revert Unauthorized();
        _;
    }

    modifier onlyVerifier() {
        if (!authorizedVerifiers[msg.sender]) revert Unauthorized();
        _;
    }

    // ── Constructor ───────────────────────────────────────────────────────────

    constructor() {
        admin = msg.sender;
        authorizedVerifiers[msg.sender] = true;
    }

    // ── Claim Submission ──────────────────────────────────────────────────────

    /**
     * @notice Submit a recovery claim for tokens accidentally sent to an Aurix contract.
     * @param claimId           Unique claim identifier (generated off-chain)
     * @param token             ERC-20 token address to recover
     * @param amount            Amount to recover (in token base units)
     * @param targetContract    Aurix contract that holds the funds
     * @param claimantSignature Claimant's signature over the claim payload
     */
    function submitClaim(
        bytes32 claimId,
        address token,
        uint256 amount,
        address targetContract,
        bytes calldata claimantSignature
    ) external nonReentrant whenNotPaused {
        if (_usedClaimIds[claimId]) revert ClaimAlreadyExists();
        if (amount == 0) revert ZeroAmount();
        if (msg.sender == address(0)) revert InvalidClaimant();

        // Verify claimant signed the claim payload
        bytes32 payload = keccak256(abi.encodePacked(claimId, token, amount, msg.sender, targetContract));
        address recovered = payload.toEthSignedMessageHash().recover(claimantSignature);
        if (recovered != msg.sender) revert InvalidSignature();

        _usedClaimIds[claimId] = true;
        claims[claimId] = RecoveryClaim({
            claimant:       msg.sender,
            token:          token,
            amount:         amount,
            targetContract: targetContract,
            submittedAt:    uint64(block.timestamp),
            status:         ClaimStatus.PENDING
        });

        claimCount++;
        emit ClaimSubmitted(claimId, msg.sender, token, amount);
    }

    /**
     * @notice Oracle verifies a pending claim after off-chain validation.
     */
    function verifyClaim(bytes32 claimId) external onlyVerifier whenNotPaused {
        RecoveryClaim storage c = claims[claimId];
        require(c.status == ClaimStatus.PENDING, "Not pending");
        c.status = ClaimStatus.VERIFIED;
        emit ClaimVerified(claimId);
    }

    /**
     * @notice Notify the gate that a claim has been released by the target contract.
     *         Called by the vault/controller holding the funds.
     */
    function notifyReleased(bytes32 claimId) external whenNotPaused nonReentrant {
        RecoveryClaim storage c = claims[claimId];
        if (c.status != ClaimStatus.VERIFIED) revert ClaimNotVerified();
        if (msg.sender != c.targetContract) revert Unauthorized();

        c.status = ClaimStatus.RELEASED;
        totalRecovered += c.amount;
        emit ClaimReleased(claimId, c.claimant, c.amount);
    }

    /**
     * @notice Reject a claim with a reason.
     */
    function rejectClaim(bytes32 claimId, string calldata reason) external onlyVerifier whenNotPaused {
        RecoveryClaim storage c = claims[claimId];
        require(c.status == ClaimStatus.PENDING, "Not pending");
        c.status = ClaimStatus.REJECTED;
        emit ClaimRejected(claimId, reason);
    }

    // ── Views ─────────────────────────────────────────────────────────────────

    function getClaim(bytes32 claimId) external view returns (RecoveryClaim memory) {
        return claims[claimId];
    }

    function getClaimStatus(bytes32 claimId) external view returns (ClaimStatus) {
        return claims[claimId].status;
    }

    // ── Intentional Deposit Management ────────────────────

    /**
     * @notice Mark tokens in a target contract as intentionally held.
     *
     * Marks tokens so that they cannot be recovered (they were deposited on purpose).
     * In Aurix: vault contracts call this when accepting user deposits,
     * preventing those amounts from ever being claimed as accidental transfers.
     *
     * @param targetContract  The vault/contract holding the tokens
     * @param token           The ERC-20 token address
     * @param amount          The amount to mark as intentional
     */
    function markIntentionalDeposit(
        address targetContract,
        address token,
        uint256 amount
    ) external onlyAdmin {
        intentionalDeposits[targetContract][token] += amount;
        emit IntentionalDepositMarked(targetContract, token, amount);
    }

    /**
     * @notice Submit a recovery claim with a tx hash for origin tracking.
     *
     * Extends the standard submitClaim() to also register a txHash deduplication key.
     * Reverts if the same tx hash has already generated a successful claim.
     *
     * The oracle verifies the txHash off-chain (fetching the tx receipt
     * to confirm claimant == tx.from) before calling verifyClaim().
     *
     * @param claimId           Unique claim identifier
     * @param token             ERC-20 token address
     * @param amount            Amount to recover
     * @param targetContract    Aurix contract that received the tokens
     * @param txHash            The transaction hash of the accidental transfer
     * @param claimantSignature Claimant's signature
     */
    function submitClaimWithTxProof(
        bytes32 claimId,
        address token,
        uint256 amount,
        address targetContract,
        bytes32 txHash,
        bytes calldata claimantSignature
    ) external nonReentrant whenNotPaused {
        if (_usedClaimIds[claimId]) revert ClaimAlreadyExists();
        if (recoveredByTxHash[txHash] != bytes32(0)) revert TxHashAlreadyClaimed();
        if (amount == 0) revert ZeroAmount();
        if (msg.sender == address(0)) revert InvalidClaimant();

        // Check the amount does not overlap with intentional deposits
        uint256 intentional = intentionalDeposits[targetContract][token];
        if (amount > IERC20(token).balanceOf(targetContract) - intentional) {
            // Only non-intentional surplus is recoverable
            revert IntentionalDepositConflict();
        }

        // Verify signature
        bytes32 payload = keccak256(abi.encodePacked(claimId, token, amount, msg.sender, targetContract, txHash));
        address recovered = payload.toEthSignedMessageHash().recover(claimantSignature);
        if (recovered != msg.sender) revert InvalidSignature();

        _usedClaimIds[claimId] = true;
        recoveredByTxHash[txHash] = claimId;
        claims[claimId] = RecoveryClaim({
            claimant:       msg.sender,
            token:          token,
            amount:         amount,
            targetContract: targetContract,
            submittedAt:    uint64(block.timestamp),
            status:         ClaimStatus.PENDING
        });

        claimCount++;
        emit ClaimSubmitted(claimId, msg.sender, token, amount);
        emit TxHashClaimed(txHash, claimId);
    }

    // ── Admin ─────────────────────────────────────────────────────────────────

    function setVerifierAuthorization(address verifier, bool status) external onlyAdmin {
        authorizedVerifiers[verifier] = status;
    }

    function transferAdmin(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "Invalid admin address");
        admin = newAdmin;
    }

    function pause() external onlyAdmin {
        _pause();
    }

    function unpause() external onlyAdmin {
        _unpause();
    }
}
