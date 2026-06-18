# QIE Aurix — Smart Contract Security Audit (Version 2)

This report details a complete security and design verification of the active Solidity smart contracts in the QIE Aurix monorepo. 

---

## 1. Audit Methodology

Every Solidity file in the `apps/aurix-contracts/contracts/` directory has been checked against the following criteria:
1. **Signature Verification & Cryptographic Correctness**
2. **Replay Attack Resistance**
3. **Access Controls & Authorization Bounds**
4. **Ownership Transfer Safety**
5. **Emergency Pause Implementations (`Pausable`)**
6. **Reentrancy Protection**
7. **Integer & Mathematical Integrity**
8. **Input Validation Parameters**
9. **Event Coverage & Observability**
10. **Target Integrations (QIE Pass & Domains)**

---

## 2. Itemized Contract Audits

### Contract: [TrustProfileRegistry.sol](file:///d:/QIE%20Aurix/qie-aurix/apps/aurix-contracts/contracts/TrustProfileRegistry.sol)
*Stores per-user Trust Profile commitments and optimization weights.*

- **Signature Verification**: Enforced on `commitProfile()`. Recovers address using `ECDSA.recover` over the packed message hash (`msg.sender, commitment, ipfsCid, score, trustScore, nonce`). Verifies recovered address is an authorized oracle. (Passed)
- **Replay Protection**: Prevents signature reuse by hashing the user's sequential `nonces[msg.sender]` and incrementing the nonce upon successful execution. (Passed)
- **Access Control**: Administrative setters restricted using `onlyAdmin`. Monitoring score updates and allocation adjustments restricted using `onlyOracle`. (Passed)
- **Ownership Transfer**: Implemented via `transferAdmin()`. Checks for non-zero address inputs. (Passed)
- **Pause Mechanisms**: Inherits OpenZeppelin's `Pausable`. Mutation endpoints protected with `whenNotPaused`. (Passed)
- **Reentrancy Protection**: State-only modifications. No token or ETH transfers occur, rendering reentrancy impossible. (Passed)
- **Input Validation**: Verifies `commitment != bytes32(0)`. During weight recommendations, ensures array lengths are matched and cumulative basis points sum to exactly 10,000 (100%). (Passed)
- **Ecosystem Checks**: Enforces that the user holds a registered QIE Pass: `IERC721(qiePassContract).balanceOf(msg.sender) > 0`. (Passed)
- **Event Coverage**: Complete. Emits `ProfileRegistered`, `ProfileUpdated`, `GuardianModeToggled`, `OracleAuthorized`, and `WeightsUpdated`.
- **Security Score**: **9.5 / 10**

---

### Contract: [ResiliencePolicyVault.sol](file:///d:/QIE%20Aurix/qie-aurix/apps/aurix-contracts/contracts/ResiliencePolicyVault.sol)
*Manages user stablecoin reserves and monitors pluggable trigger conditions.*

- **Signature Verification**: N/A (Admin/Oracle mutations or user-initiated withdrawals).
- **Access Control**: Critical functions restricted via `onlyAdmin`, `onlyOracle`, and `policyExists`. (Passed)
- **Ownership Transfer**: Implemented via `transferAdmin()`. Checks for non-zero address inputs. (Passed)
- **Pause Mechanisms**: Inherits OpenZeppelin's `Pausable` with `whenNotPaused` checks on deposits, locks, and withdrawals. (Passed)
- **Reentrancy Protection**: Enforces `nonReentrant` modifiers on all methods transferring funds or modifying state. (Passed)
- **Accidental Recovery Integration**: Implements `recoverAccidentalTokens()`. Verifies that claims are set to `VERIFIED` and targeted to `address(this)` on the `AurixRecoveryGate` contract. Triggers pull release using `notifyReleased` prior to executing safe ERC-20 transfers. (Passed)
- **Input Validation**: Enforces non-zero balances on deposit and withdrawal amounts. (Passed)
- **Ecosystem Checks**: Integrates with QUSDC ERC-20 contract for reserves management. (Passed)
- **Event Coverage**: Complete. Emits `PolicyCreated`, `ReserveDeposited`, `EmergencyLockActivated`, `EmergencyLockReleased`, `ReserveWithdrawn`, `ConditionRegistered`, and `ConditionTriggered`.
- **Design Gaps**: The previous audit flagged that condition contracts registered in `registerCondition` could not be removed. The patch report claimed to resolve this, but **no `unregisterCondition` function actually exists** in the code. Legally registered conditions remain permanent.
- **Security Score**: **8.5 / 10** (Deduction for lack of condition unregistration).

---

### Contract: [AurixRecoveryGate.sol](file:///d:/QIE%20Aurix/qie-aurix/apps/aurix-contracts/contracts/AurixRecoveryGate.sol)
*Implements decentralized signature-proof recovery for accidental transfers.*

- **Signature Verification**: Verifies claimant signature on `submitClaim()` and `submitClaimWithTxProof()` utilizing `ECDSA.recover` over packed parameters. (Passed)
- **Replay Protection**: Marks claim IDs as used in `_usedClaimIds` to prevent double submissions. (Passed)
- **Deduplication Check**: Links recovery claims to origin transaction hashes via `recoveredByTxHash` mapping to ensure no single transfer is reclaimed twice. (Passed)
- **Access Control**: Verification changes locked behind `onlyVerifier` (oracle nodes) and administrative configurations locked behind `onlyAdmin`. (Passed)
- **Ownership Transfer**: Safe `transferAdmin` checking for non-zero destination addresses. (Passed)
- **Pause Mechanisms**: Enforces standard `Pausable` hooks on submission and verification pipelines. (Passed)
- **Reentrancy Protection**: Uses `nonReentrant` on claim creation and release notifications. (Passed)
- **Integer Safety & Math**: Math logic correctly computes non-intentional reserves: `amount <= balanceOf(targetContract) - intentionalDeposits`. Legitimate deposits cannot be withdrawn by accident claims. (Passed)
- **Event Coverage**: Excellent. Emits `ClaimSubmitted`, `ClaimVerified`, `ClaimReleased`, `ClaimRejected`, `IntentionalDepositMarked`, and `TxHashClaimed`.
- **Security Score**: **9.5 / 10**

---

### Contract: [FamilyVaultController.sol](file:///d:/QIE%20Aurix/qie-aurix/apps/aurix-contracts/contracts/FamilyVaultController.sol)
*Manages heir allocations, claim delays, and domain-anchored inheritance locks.*

- **Signature Verification**: N/A (Heirs request allocations on-chain via pass validation checks).
- **Access Control**: Administrative settings restricted with `onlyAdmin`, vault methods restricted with `onlyVaultOwner` and `vaultExists`. (Passed)
- **Ownership Transfer**: Enforces safe `transferAdmin` checking for zero address inputs. (Passed)
- **Pause Mechanisms**: Employs `Pausable` controls on vault generation, funding, and claims. (Passed)
- **Reentrancy Protection**: Uses `nonReentrant` on funding and heir claim payouts. (Passed)
- **Integer Safety & Math**: Limits total heir basis points allocation to <= 10,000 (100%), preventing overallocation math errors and vault insolvency. (Passed)
- **Ecosystem Checks**: Queries `IERC721(qiePassContract).balanceOf(msg.sender) > 0` before releasing any heir allocations. (Passed)
- **Event Coverage**: Complete. Emits `VaultCreated`, `VaultFunded`, `HeirAdded`, `VaultMadeClaimable`, and `HeirClaimed`.
- **Design Gaps**: Fails to implement actual domain ownership checks. The `createVault` method accepts a string parameter `domainName`, but **does not query any external QIE Domain registry contract** to verify if the creator owns the domain. Domain names can be registered arbitrarily on the controller.
- **Security Score**: **8.5 / 10** (Deduction for lack of QIE Domain integration verification).

---

### Contract: [SafetyAuditAnchor.sol](file:///d:/QIE%20Aurix/qie-aurix/apps/aurix-contracts/contracts/SafetyAuditAnchor.sol)
*Anchors AI oracle security auditing logs and integrity records on-chain.*

- **Signature Verification**: None. Relies entirely on the `authorizedAuditors` address mapping to authorize anchors, which lacks multi-signature verification or oracle signature validation.
- **Access Control**: Restricts anchoring to `onlyAuditor` and authorization to `onlyAdmin`. (Passed)
- **Ownership Transfer**: Implements `transferAdmin()`. However, **it does not validate if `newAdmin` is a zero address**, exposing the contract to accidental locking.
- **Pause Mechanisms**: **Lacks Pausable inheritance.** There is no emergency kill-switch or freeze command. If the auditor key is compromised, there is no way to prevent log spamming or malicious overwrites.
- **Integer Safety**: N/A (Standard state commits).
- **Event Coverage**: Good. Emits `AuditAnchored`, `PolicyIntegrityChecked`, `AuditRequested`, and `AuditRequestFulfilled`.
- **Security Score**: **7.0 / 10** (Deductions for lack of Pausable, lack of zero-address validation on admin transfers, and lack of signature verification on anchoring).

---

## 3. Summary Security Table

| Contract | Access Control | Reentrancy | Pausable | Signature Checks | Overall Score |
|:---|:---:|:---:|:---:|:---:|:---:|
| **TrustProfileRegistry** | Solid | N/A | Yes | Yes (Oracle) | **9.5 / 10** |
| **ResiliencePolicyVault** | Solid | Safe | Yes | N/A | **8.5 / 10** |
| **AurixRecoveryGate** | Solid | Safe | Yes | Yes (Claimant) | **9.5 / 10** |
| **FamilyVaultController** | Solid | Safe | Yes | N/A | **8.5 / 10** |
| **SafetyAuditAnchor** | Moderate | N/A | **No** | **No** | **7.0 / 10** |

---

## 4. Critical Recommendations

1. **Implement Pausable in SafetyAuditAnchor.sol**: Ensure that audit logs can be frozen if verification keys are compromised.
2. **Add QIE Domain Registry check**: Update `FamilyVaultController.sol` to fetch domain ownership from the official QIE Domains Registry prior to vault binding.
3. **Add zero-address validation**: Ensure `transferAdmin` in `SafetyAuditAnchor.sol` checks that the new admin is not `address(0)`.
4. **Implement unregisterCondition in ResiliencePolicyVault.sol**: Provide administrators the ability to prune obsolete or buggy triggers.
