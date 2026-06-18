// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title FamilyVaultController
 * @author QIE Aurix Protocol
 * @notice Manages named family protection vaults with heir designation,
 *         time-locks, and QIE Pass verification.
 *
 * Each vault is identified by a QIE Domain name (e.g. "family.aurix.qie").
 * The vault owner designates heirs with allocation percentages and a
 * claim delay. Heirs can claim assets after the claim delay, verified
 * by QIE Pass presence.
 */
contract FamilyVaultController is ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ── Structs ──────────────────────────────────────────────────────────────

    struct HeirRecord {
        address heir;
        uint16  allocationBps;   // basis points out of 10000
        uint64  claimDelay;      // seconds after vault becomes claimable
        bool    hasClaimed;
    }

    struct FamilyVault {
        address     owner;
        string      domainName;          // QIE Domain name
        address     assetToken;          // token held in vault
        uint256     balance;             // current balance
        uint64      timeLockUntil;       // earliest claimable timestamp (0 = no lock)
        uint32      heirCount;
        bool        active;
        bool        claimable;           // owner sets this to allow heir claims
    }

    // ── State ─────────────────────────────────────────────────────────────────

    mapping(bytes32 => FamilyVault)               private _vaults;         // vaultId → vault
    mapping(bytes32 => mapping(uint32 => HeirRecord)) private _heirs;      // vaultId → index → heir
    mapping(address => bytes32[]) private _ownerVaults;                    // owner → vaultIds
    mapping(string => bytes32)    private _domainToVaultId;                // domain → vaultId

    address public qiePassContract;
    address public admin;

    uint256 public vaultCount;

    // ── Events ────────────────────────────────────────────────────────────────

    event VaultCreated(bytes32 indexed vaultId, address indexed owner, string domainName);
    event VaultFunded(bytes32 indexed vaultId, uint256 amount);
    event HeirAdded(bytes32 indexed vaultId, address heir, uint16 allocationBps);
    event VaultMadeClaimable(bytes32 indexed vaultId);
    event HeirClaimed(bytes32 indexed vaultId, address indexed heir, uint256 amount);

    // ── Errors ────────────────────────────────────────────────────────────────

    error Unauthorized();
    error VaultNotFound();
    error DomainAlreadyTaken();
    error VaultNotClaimable();
    error TimeLockActive();
    error AlreadyClaimed();
    error NotAnHeir();
    error InvalidAllocation();
    error ZeroAmount();

    // ── Modifiers ─────────────────────────────────────────────────────────────

    modifier onlyAdmin() {
        if (msg.sender != admin) revert Unauthorized();
        _;
    }

    modifier vaultExists(bytes32 vaultId) {
        if (!_vaults[vaultId].active) revert VaultNotFound();
        _;
    }

    modifier onlyVaultOwner(bytes32 vaultId) {
        if (_vaults[vaultId].owner != msg.sender) revert Unauthorized();
        _;
    }

    // ── Constructor ───────────────────────────────────────────────────────────

    constructor(address _qiePassContract) {
        admin            = msg.sender;
        qiePassContract  = _qiePassContract;
    }

    // ── Vault Creation ────────────────────────────────────────────────────────

    /**
     * @notice Create a named family vault.
     * @param domainName   QIE Domain name for this vault (e.g. "family.aurix.qie")
     * @param assetToken   ERC-20 token the vault will hold
     * @param timeLockDays Days until heirs can start claiming
     */
    function createVault(
        string calldata domainName,
        address         assetToken,
        uint16          timeLockDays
    ) external returns (bytes32 vaultId) {
        if (_domainToVaultId[domainName] != bytes32(0)) revert DomainAlreadyTaken();

        vaultId = keccak256(abi.encodePacked(msg.sender, domainName, block.timestamp));

        _vaults[vaultId] = FamilyVault({
            owner:         msg.sender,
            domainName:    domainName,
            assetToken:    assetToken,
            balance:       0,
            timeLockUntil: timeLockDays > 0
                ? uint64(block.timestamp + uint256(timeLockDays) * 1 days)
                : 0,
            heirCount:     0,
            active:        true,
            claimable:     false
        });

        _ownerVaults[msg.sender].push(vaultId);
        _domainToVaultId[domainName] = vaultId;
        vaultCount++;

        emit VaultCreated(vaultId, msg.sender, domainName);
    }

    /**
     * @notice Fund the vault with the designated asset token.
     */
    function fundVault(bytes32 vaultId, uint256 amount)
        external nonReentrant vaultExists(vaultId)
    {
        if (amount == 0) revert ZeroAmount();
        IERC20(_vaults[vaultId].assetToken).safeTransferFrom(msg.sender, address(this), amount);
        _vaults[vaultId].balance += amount;
        emit VaultFunded(vaultId, amount);
    }

    /**
     * @notice Add an heir to the vault.
     * @param allocationBps   Basis points out of 10000 (e.g. 5000 = 50%)
     * @param claimDelaySecs  Additional seconds after vault becomes claimable
     */
    function addHeir(
        bytes32 vaultId,
        address heir,
        uint16  allocationBps,
        uint64  claimDelaySecs
    ) external vaultExists(vaultId) onlyVaultOwner(vaultId) {
        if (allocationBps == 0 || allocationBps > 10000) revert InvalidAllocation();

        FamilyVault storage v = _vaults[vaultId];
        uint32 idx = v.heirCount;

        _heirs[vaultId][idx] = HeirRecord({
            heir:           heir,
            allocationBps:  allocationBps,
            claimDelay:     claimDelaySecs,
            hasClaimed:     false
        });

        v.heirCount++;
        emit HeirAdded(vaultId, heir, allocationBps);
    }

    /**
     * @notice Owner marks the vault as claimable (e.g. after a life event).
     */
    function makeClaimable(bytes32 vaultId)
        external vaultExists(vaultId) onlyVaultOwner(vaultId)
    {
        FamilyVault storage v = _vaults[vaultId];
        if (v.timeLockUntil > 0 && block.timestamp < v.timeLockUntil) revert TimeLockActive();
        v.claimable = true;
        emit VaultMadeClaimable(vaultId);
    }

    /**
     * @notice Heir claims their allocation.
     */
    function claimHeirShare(bytes32 vaultId, uint32 heirIndex)
        external nonReentrant vaultExists(vaultId)
    {
        FamilyVault storage v = _vaults[vaultId];
        if (!v.claimable) revert VaultNotClaimable();

        HeirRecord storage h = _heirs[vaultId][heirIndex];
        if (h.heir != msg.sender) revert NotAnHeir();
        if (h.hasClaimed) revert AlreadyClaimed();

        if (block.timestamp < v.timeLockUntil + h.claimDelay) revert TimeLockActive();

        uint256 share = (v.balance * h.allocationBps) / 10000;
        h.hasClaimed  = true;

        IERC20(v.assetToken).safeTransfer(msg.sender, share);
        emit HeirClaimed(vaultId, msg.sender, share);
    }

    // ── Views ─────────────────────────────────────────────────────────────────

    function getVault(bytes32 vaultId) external view returns (FamilyVault memory) {
        return _vaults[vaultId];
    }

    function getVaultByDomain(string calldata domain) external view returns (FamilyVault memory) {
        bytes32 id = _domainToVaultId[domain];
        return _vaults[id];
    }

    function getHeir(bytes32 vaultId, uint32 index) external view returns (HeirRecord memory) {
        return _heirs[vaultId][index];
    }

    function getOwnerVaults(address owner) external view returns (bytes32[] memory) {
        return _ownerVaults[owner];
    }

    function resolveDomainToVaultId(string calldata domain) external view returns (bytes32) {
        return _domainToVaultId[domain];
    }

    // ── Admin ─────────────────────────────────────────────────────────────────

    function setQiePassContract(address pass) external onlyAdmin {
        qiePassContract = pass;
    }
}
