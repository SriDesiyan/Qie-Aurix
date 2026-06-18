// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title IResilienceCondition
 * @notice Interface for pluggable protection trigger conditions.
 *
 * Any contract implementing this interface can be registered as a trigger
 * in ResiliencePolicyVault. When evaluateConditions() is called, each
 * registered condition is checked — if the condition is met, it calls
 * back into the vault to activate the appropriate protection.
 *
 * Design pattern: checkTrigger(address vault, address user) triggers protection.
 *
 * This is NOT insurance. Conditions trigger financial DEFENSE actions.
 */
interface IResilienceCondition {
    /// @notice Check if this condition is met and trigger protection if so.
    /// @param vault The ResiliencePolicyVault address
    /// @param user  The user whose policy to evaluate
    function checkTrigger(address vault, address user) external;

    /// @notice Human-readable name for this condition (e.g. "Volatility Shield")
    function conditionName() external view returns (string memory);
}

/**
 * @title ResiliencePolicyVault
 * @author QIE Aurix Protocol
 * @notice Holds user protection policies and executes emergency vault actions.
 *
 * When Guardian Mode is activated, users deposit QUSDC into this vault
 * under a time-locked protection policy. The oracle can trigger defensive
 * actions (emergency lock, partial withdrawal) when risk thresholds are hit.
 *
 * Enhanced with a pluggable condition registry (IResilienceCondition):
 * conditions are separate contracts that check specific risk parameters
 * and call back into this vault when protection should activate.
 * This separates trigger logic from vault logic to allow pluggable resilience modules.
 */
contract ResiliencePolicyVault is ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ── Structs ──────────────────────────────────────────────────────────────

    struct ProtectionPolicy {
        address     owner;
        address     reserveToken;        // typically QUSDC
        uint256     reserveBalance;      // current deposited amount
        uint32      riskThreshold;       // score below which triggers activate (0–1000)
        uint64      lockUntil;           // emergency lock expiry
        bool        emergencyLocked;     // true when a defensive action is active
        bool        active;
        PolicyState state;               // current lifecycle state
    }

    /**
     * @notice Policy lifecycle states for the protection lifecycle.
     */
    enum PolicyState {
        Active,     // Normal operation — protections monitoring
        Locked,     // Emergency lock triggered — withdrawals blocked
        Settled     // Policy closed / funds withdrawn
    }

    // ── State ─────────────────────────────────────────────────────────────────

    mapping(address => ProtectionPolicy) private _policies;

    address public qusdcToken;
    address public admin;
    mapping(address => bool) public authorizedOracles;

    /// @dev Registered condition contracts for pluggable resilience checks
    IResilienceCondition[] private _conditions;
    mapping(address => bool) public registeredConditions;

    uint256 public totalReserves;

    // ── Events ────────────────────────────────────────────────────────────────

    event PolicyCreated(address indexed owner, uint256 depositAmount, uint32 riskThreshold);
    event ReserveDeposited(address indexed owner, uint256 amount);
    event EmergencyLockActivated(address indexed owner, uint64 lockUntil);
    event EmergencyLockReleased(address indexed owner);
    event ReserveWithdrawn(address indexed owner, uint256 amount);
    event ConditionRegistered(address indexed condition, string name);
    event ConditionTriggered(address indexed condition, address indexed user);

    // ── Errors ────────────────────────────────────────────────────────────────

    error Unauthorized();
    error PolicyNotFound();
    error PolicyAlreadyActive();
    error EmergencyLocked();
    error LockNotExpired();
    error InsufficientBalance();
    error ZeroAmount();

    // ── Modifiers ─────────────────────────────────────────────────────────────

    modifier onlyAdmin() {
        if (msg.sender != admin) revert Unauthorized();
        _;
    }

    modifier onlyOracle() {
        if (!authorizedOracles[msg.sender]) revert Unauthorized();
        _;
    }

    modifier policyExists(address user) {
        if (!_policies[user].active) revert PolicyNotFound();
        _;
    }

    // ── Constructor ───────────────────────────────────────────────────────────

    constructor(address _qusdcToken) {
        admin      = msg.sender;
        qusdcToken = _qusdcToken;
        authorizedOracles[msg.sender] = true;
    }

    // ── Policy Management ─────────────────────────────────────────────────────

    /**
     * @notice Create a protection policy with an initial QUSDC reserve deposit.
     * @param depositAmount   Amount of QUSDC to deposit as emergency reserve
     * @param riskThreshold   Resilience Score below which the oracle may trigger defense
     */
    function createPolicy(
        uint256 depositAmount,
        uint32  riskThreshold
    ) external nonReentrant {
        if (_policies[msg.sender].active) revert PolicyAlreadyActive();
        if (depositAmount == 0) revert ZeroAmount();

        IERC20(qusdcToken).safeTransferFrom(msg.sender, address(this), depositAmount);

        _policies[msg.sender] = ProtectionPolicy({
            owner:            msg.sender,
            reserveToken:     qusdcToken,
            reserveBalance:   depositAmount,
            riskThreshold:    riskThreshold,
            lockUntil:        0,
            emergencyLocked:  false,
            active:           true,
            state:            PolicyState.Active
        });

        totalReserves += depositAmount;
        emit PolicyCreated(msg.sender, depositAmount, riskThreshold);
    }

    /**
     * @notice Add more QUSDC to an existing policy's reserve.
     */
    function depositReserve(uint256 amount) external nonReentrant policyExists(msg.sender) {
        if (amount == 0) revert ZeroAmount();
        IERC20(qusdcToken).safeTransferFrom(msg.sender, address(this), amount);
        _policies[msg.sender].reserveBalance += amount;
        totalReserves += amount;
        emit ReserveDeposited(msg.sender, amount);
    }

    /**
     * @notice Oracle triggers emergency lock when risk score drops below threshold.
     * @param user       User whose policy to lock
     * @param lockDays   How many days to lock the reserve
     */
    function activateEmergencyLock(
        address user,
        uint16  lockDays
    ) external onlyOracle policyExists(user) {
        ProtectionPolicy storage p = _policies[user];
        p.emergencyLocked = true;
        p.lockUntil       = uint64(block.timestamp + uint256(lockDays) * 1 days);
        emit EmergencyLockActivated(user, p.lockUntil);
    }

    /**
     * @notice Release emergency lock after expiry.
     */
    function releaseEmergencyLock() external policyExists(msg.sender) {
        ProtectionPolicy storage p = _policies[msg.sender];
        if (!p.emergencyLocked) return;
        if (block.timestamp < p.lockUntil) revert LockNotExpired();
        p.emergencyLocked = false;
        p.lockUntil       = 0;
        emit EmergencyLockReleased(msg.sender);
    }

    /**
     * @notice Withdraw reserve when not locked.
     */
    function withdrawReserve(uint256 amount) external nonReentrant policyExists(msg.sender) {
        ProtectionPolicy storage p = _policies[msg.sender];
        if (p.emergencyLocked && block.timestamp < p.lockUntil) revert EmergencyLocked();
        if (amount > p.reserveBalance) revert InsufficientBalance();

        p.reserveBalance -= amount;
        totalReserves    -= amount;
        IERC20(qusdcToken).safeTransfer(msg.sender, amount);
        emit ReserveWithdrawn(msg.sender, amount);
    }

    // ── Views ─────────────────────────────────────────────────────────────────

    function getPolicy(address user) external view returns (ProtectionPolicy memory) {
        return _policies[user];
    }

    function isPolicyActive(address user) external view returns (bool) {
        return _policies[user].active;
    }

    function isEmergencyLocked(address user) external view returns (bool) {
        return _policies[user].emergencyLocked;
    }

    // ── Condition Registry ────────────────

    /**
     * @notice Register a new protection condition contract.
     *
     * Aurix supports a dynamic registry of conditions that can be
     * added/removed by the admin as new trigger types are developed.
     *
     * @param condition Address of an IResilienceCondition implementation
     */
    function registerCondition(address condition) external onlyAdmin {
        require(!registeredConditions[condition], "Condition already registered");
        registeredConditions[condition] = true;
        _conditions.push(IResilienceCondition(condition));
        emit ConditionRegistered(condition, IResilienceCondition(condition).conditionName());
    }

    /**
     * @notice Evaluate all registered conditions for a user.
     *
     * Evaluates conditions and triggers actions if protection rules are met.
     *
     * Each condition is called independently; a failure in one condition
     * does not prevent others from evaluating.
     *
     * @param user The user whose policy conditions to evaluate
     */
    function evaluateConditions(address user) external policyExists(user) {
        for (uint256 i = 0; i < _conditions.length; i++) {
            try _conditions[i].checkTrigger(address(this), user) {
                emit ConditionTriggered(address(_conditions[i]), user);
            } catch {
                // Condition failed silently — continue evaluating others
            }
        }
    }

    /**
     * @notice Get all registered condition contract addresses.
     */
    function getConditions() external view returns (address[] memory) {
        address[] memory addrs = new address[](_conditions.length);
        for (uint256 i = 0; i < _conditions.length; i++) {
            addrs[i] = address(_conditions[i]);
        }
        return addrs;
    }

    // ── Admin ─────────────────────────────────────────────────────────────────

    function setOracleAuthorization(address oracle, bool status) external onlyAdmin {
        authorizedOracles[oracle] = status;
    }

    function setQusdcToken(address token) external onlyAdmin {
        qusdcToken = token;
    }
}
