# QIE Aurix — Mainnet Readiness Audit & Report

This report provides a comprehensive, itemized audit of the QIE Aurix codebase prior to any mainnet deployment. It assesses the security, logic, configuration, and integration readiness of all system components.

---

## 1. Executive Summary

- **Mainnet Readiness Score**: **35 / 100**
- **Final Recommendation**: **NEEDS MAJOR WORK**

While the functional flow, mathematical engines, and frontend visual aesthetics are highly polished, the smart contracts contain multiple **CRITICAL** logic and security vulnerabilities (such as bypassable oracle scores, unchecked heir allocations, unused identity layers, and a broken token recovery mechanism). Additionally, the backend oracle and frontend connectors rely heavily on mock fallbacks that would bypass safety checks in a production environment. 

Deploying the codebase in its current state to any mainnet environment would result in **immediate loss of user funds, oracle spoofing, and system failure**.

---

## 2. Itemized Verification Checklist

### 1. Hardcoded Testnet Addresses
- **Finding**: **HIGH**
- **Details**: 
  - `apps/aurix-contracts/deploy/deploy-all.ts` hardcodes `QIE_PASS_PLACEHOLDER = "0x0000000000000000000000000000000000000001"` and `QUSDC_PLACEHOLDER = "0x0000000000000000000000000000000000000002"`.
  - `packages/aurix-core/src/constants/qie-addresses.ts` sets `PASS`, `DEX`, `LEND`, `QUSDC`, `DOMAINS`, `BRIDGE`, and `WALLET` to `0x0000000000000000000000000000000000000000`.
- **Status**: **FAILED**. These must be replaced with real QIE mainnet contract addresses before deployment.

### 2. Mock APIs
- **Finding**: **CRITICAL**
- **Details**:
  - `apps/aurix-oracle/main.py` exposes `/recovery/verify` which automatically approves *any* claim that passes a non-empty signature string, bypassing signature and origin checks entirely.
  - `/profile/build` and `_build_guardian_status` deterministic helpers mock the step completion status based on an arbitrary score criteria (`score_total > 600`) instead of querying live registry state on-chain.
- **Status**: **FAILED**. Replace mock handlers with real contract-state query endpoints and signature verifiers.

### 3. Mock Wallet Data
- **Finding**: **HIGH**
- **Details**:
  - `apps/aurix-oracle/agents/profile_agent.py` generates deterministic mock financial balances, chain spreads, and dex activities inside `_mock_financial_profile` based on a hash of the wallet address.
- **Status**: **FAILED**. Must be replaced with real on-chain indexing calls (e.g. QIE indexer, RPC queries).

### 4. Mock QIE Pass Data
- **Finding**: **CRITICAL**
- **Details**:
  - `apps/aurix-oracle/agents/profile_agent.py` generates mock tiers ("BASIC", "VERIFIED", "TRUSTED", "GUARDIAN") and domains inside `_mock_qie_pass`.
  - `apps/aurix-web/src/lib/qie/QiePassConnector.ts` has a silent fallback: if the pass contract address is a placeholder *or* if the contract call fails, it silently returns mock credentials (`mockQiePass`), hiding RPC failures and allowing unauthenticated users to access the UI.
- **Status**: **FAILED**. Contract failures must revert/show errors, and mock logic must be removed.

### 5. Mock Lending Positions
- **Finding**: **HIGH**
- **Details**:
  - `apps/aurix-oracle/agents/profile_agent.py` mocks lending position data for `QIELend` with simulated supply/borrow USD and health factors.
- **Status**: **FAILED**. Replace with live queries to the QIELend protocol contracts.

### 6. Placeholder RPC URLs
- **Finding**: **MEDIUM**
- **Details**:
  - `apps/aurix-contracts/hardhat.config.ts` hardcodes `"https://rpc.qie-testnet.example.com"` as a fallback URL.
  - `packages/aurix-core/src/chain/ChainAdapter.ts` defines `rpcUrl: "https://rpc.qie-testnet.example.com"` for QIE_TESTNET_ADAPTER.
- **Status**: **FAILED**. Must be replaced with production-ready node endpoints.

### 7. TODO Markers
- **Finding**: **LOW**
- **Details**:
  - `packages/aurix-core/src/chain/ChainAdapter.ts` (Line 79): `// TODO: replace with real QIE mainnet chain ID`.
- **Status**: **FAILED**. The active chain ID is currently mapped to `1` (which conflicts with Ethereum Mainnet).

### 8. Debug Code
- **Finding**: **LOW**
- **Details**:
  - There is no major debug code left in smart contracts, but `apps/aurix-oracle/engines/claim_verifier.py` uses simulated fallbacks for address lengths when `rpc_url` is empty.
- **Status**: **PASSED WITH WARNINGS**.

### 9. Console Logs
- **Finding**: **LOW**
- **Details**:
  - Only deployment scripts (`deploy-all.ts`) contain console logging, which is standard.
- **Status**: **PASSED**.

### 10. Unverified Contracts
- **Finding**: **MEDIUM**
- **Details**:
  - Hardhat configuration (`hardhat.config.ts`) has no plugins or configurations for verifying smart contracts on the QIE Block Explorer.
- **Status**: **FAILED**. Add verification setup to ensure public trust and transparency.

### 11. Missing Access Control
- **Finding**: **CRITICAL**
- **Details**:
  - `FamilyVaultController.sol` allows *any* user to call `createVault` with *any* QIE Domain name, without checking whether the user actually owns that domain in the QIE Domain Registry.
  - `TrustProfileRegistry.sol` exposes `commitProfile` publicly. Users can write their own scores (`resilienceScore` up to `1000`, `trustScore` up to `100`) directly on-chain, bypassing the authorized oracle altogether.
- **Status**: **FAILED**.

### 12. Missing Pause Mechanisms
- **Finding**: **HIGH**
- **Details**:
  - None of the smart contracts (`ResiliencePolicyVault`, `FamilyVaultController`, `AurixRecoveryGate`, `TrustProfileRegistry`) contain a pause mechanism (`Pausable`). In the event of an exploit, funds cannot be frozen.
- **Status**: **FAILED**.

### 13. Missing Ownership Checks
- **Finding**: **HIGH**
- **Details**:
  - `ResiliencePolicyVault.sol` and `FamilyVaultController.sol` do not contain ownership transfer or admin changing methods. The deployer key remains permanently hardcoded as `admin`.
- **Status**: **FAILED**.

### 14. Missing Signature Verification
- **Finding**: **CRITICAL**
- **Details**:
  - `TrustProfileRegistry.sol` does not verify an oracle signature on `commitProfile()`.
  - `FamilyVaultController.sol` does not verify QIE Pass ownership or signature before allowing heirs to claim.
  - `AurixRecoveryGate.sol` has a redundant signature check in `submitClaim` where `msg.sender` signs for themselves, adding no security.
- **Status**: **FAILED**.

### 15. Missing Validation
- **Finding**: **CRITICAL**
- **Details**:
  - `FamilyVaultController.sol` allows an owner to add heirs whose total `allocationBps` exceeds 10,000 (100%), which will cause runtime token exhaustion and prevent some heirs from claiming.
  - `AurixRecoveryGate.sol` has a severe validation math error:
    `amount > intentional + balanceOf(target) - intentional` simplifies to `amount > balanceOf(target)`, rendering the `intentionalDeposits` protection entirely ineffective.
- **Status**: **FAILED**.

---

## 3. Contract-by-Contract Audit Reports

### Contract: [AurixRecoveryGate.sol](file:///d:/QIE%20Aurix/qie-aurix/apps/aurix-contracts/contracts/AurixRecoveryGate.sol)
* **Ready for Mainnet?** **NO**
* **Why?**
  1. **Calculation Loophole (CRITICAL)**: The conditional check `if (amount > intentional + IERC20(token).balanceOf(targetContract) - intentional)` simplifies mathematically to `amount > balanceOf(targetContract)`. The subtraction of `intentional` deposits is cancelled out. This permits claimants to steal deliberate vault reserves under the guise of an accidental transfer claim.
  2. **Execution Failure (CRITICAL)**: The release code calls `safeTransferFrom(c.targetContract, c.claimant, c.amount)`. However, target contracts (like `ResiliencePolicyVault` or `FamilyVaultController`) have no allowance or interface permissions to grant approval to the `AurixRecoveryGate` contract. Every recovery attempt will fail with a transaction revert.
* **Required Fixes**:
  1. Fix the deposit comparison: `if (amount > IERC20(token).balanceOf(targetContract) - intentional)`.
  2. Modify the vault/controller contracts to support a dedicated administrative withdrawal/transfer interface restricted to the `AurixRecoveryGate` contract, rather than using standard `safeTransferFrom`.

### Contract: [ResiliencePolicyVault.sol](file:///d:/QIE%20Aurix/qie-aurix/apps/aurix-contracts/contracts/ResiliencePolicyVault.sol)
* **Ready for Mainnet?** **NO**
* **Why?**
  1. **Permanent Admin Locking (HIGH)**: The contract contains no method to transfer the admin role (`admin = msg.sender`). If the deployer key is compromised, there is no way to revoke access or update oracle endpoints.
  2. **Immutable Condition Registry (HIGH)**: Conditions can be registered via `registerCondition` but cannot be unregistered. If a condition contract is found to have a bug or is deprecated, it will run forever.
  3. **No Emergency Pause (HIGH)**: The contract does not implement a pause pattern, leaving deposited QUSDC vulnerable to exploits without a kill-switch.
* **Required Fixes**:
  1. Implement a `transferAdmin(address newAdmin)` function.
  2. Implement an `unregisterCondition(address condition)` function.
  3. Integrate OpenZeppelin's `Pausable` and restrict deposits/withdrawals using `whenNotPaused`.

### Contract: [FamilyVaultController.sol](file:///d:/QIE%20Aurix/qie-aurix/apps/aurix-contracts/contracts/FamilyVaultController.sol)
* **Ready for Mainnet?** **NO**
* **Why?**
  1. **Identity Omission (CRITICAL)**: The `qiePassContract` address is stored but **never queried**. Heirs can claim their allocations without holding a QIE Pass, violating the primary protocol design.
  2. **Unchecked Allocation Limit (HIGH)**: The `addHeir` function does not track the cumulative sum of allocation percentages. If the sum exceeds 100%, later heir claims will fail due to contract token exhaustion. If the sum is less than 100%, residual funds remain permanently trapped in the contract.
  3. **Domain Spoofing (HIGH)**: Users can create vaults using any QIE Domain string. There is no on-chain check to verify that the creator actually owns the specified domain in the QIE Domain Registry.
  4. **No Ownership Transfer (HIGH)**: The `admin` role is immutable and cannot be updated.
* **Required Fixes**:
  1. Query `qiePassContract.balanceOf(msg.sender) > 0` before allowing an heir to claim.
  2. Add validation: track cumulative `totalAllocationBps` and require that it equals exactly `10000` (100%) before the vault can be marked as `claimable` or funded.
  3. Query the external QIE Domain contract to verify domain ownership before allowing domain-to-vault mapping.
  4. Add a `transferAdmin` function.

### Contract: [TrustProfileRegistry.sol](file:///d:/QIE%20Aurix/qie-aurix/apps/aurix-contracts/contracts/TrustProfileRegistry.sol)
* **Ready for Mainnet?** **NO**
* **Why?**
  1. **Unauthenticated Score Updates (CRITICAL)**: The `commitProfile` function is public and accepts `score` and `trustScore` arguments directly. A user can call this function and set their own resilience score to `1000` (highest safety tier) and trust score to `100`. This completely bypasses the risk checks performed by the oracle.
  2. **Unused Pass Verification (HIGH)**: `qiePassContract` is configured but never queried to verify the user actually holds an identity NFT.
* **Required Fixes**:
  1. Restrict profile registration: require the user to provide an ECDSA signature of the score payload signed by an authorized oracle, and verify the signature on-chain using `ECDSA.recover`.
  2. Enforce QIE Pass verification check inside `commitProfile`.

### Contract: [SafetyAuditAnchor.sol](file:///d:/QIE%20Aurix/qie-aurix/apps/aurix-contracts/contracts/SafetyAuditAnchor.sol)
* **Ready for Mainnet?** **YES** (with minor notes)
* **Why?**
  - The contract acts as a storage anchor. Access controls (`onlyAuditor`) are correctly set up and restricted. The contract successfully implements ownership transfer via `transferAdmin`.
* **Required Fixes**:
  - Add an emergency pause switch to prevent log pollution/spamming if an auditor key is compromised.

---

## 4. Environment and Deployment Audit

### Environment Variables (`.env.example`)
- **Warning**: The default `NEXT_PUBLIC_ORACLE_URL` is configured to `http://localhost:8000`. This will fail on mainnet if users query from outside the local server network.
- **Warning**: No configuration checks exist to prevent deploying with a blank `DEPLOYER_PRIVATE_KEY` or `ORACLE_SECRET_KEY` set to `change-me-in-production`.

### Deployment Script (`deploy-all.ts`)
- **Warning**: Smart contracts are deployed using hardcoded address placeholders for dependencies (`QIE_PASS_PLACEHOLDER`, `QUSDC_PLACEHOLDER`). If this script is run directly on mainnet, contracts will point to non-existent addresses.

---

## 5. Mainnet Readiness Scoring

| Category | Score | Findings Summary |
|---|---|---|
| **Smart Contract Security** | 20 / 100 | Critical mathematical logic bugs and access control bypasses. |
| **Identity & QIE Integration** | 10 / 100 | Identity contracts are defined but never queried or verified on-chain. |
| **Oracle & API Reliability** | 40 / 100 | Relies on simulated endpoints and bypasses signature checks for claims. |
| **DevOps & Configs** | 60 / 100 | Lacks network safety guards, contract verification scripts, and release checks. |
| **Overall Score** | **35 / 100** | **NEEDS MAJOR WORK** |

---

## 6. Recommended Action Plan

To achieve mainnet readiness, the following actions must be taken:

1. **Security Patching (Smart Contracts)**:
   - Rewrite `TrustProfileRegistry.sol` to enforce oracle signature verification for score submissions.
   - Fix `FamilyVaultController.sol` to perform domain ownership checks and verify QIE Pass balances for heirs.
   - Correct the mathematical validation error in `AurixRecoveryGate.sol` for intentional deposits.
   - Implement ownership transfer functions and pause mechanisms across all contracts.

2. **Oracle Alignment**:
   - Replace FastAPI deterministic mockup data with live query clients communicating with QIE chain nodes and RPCs.
   - Enforce cryptographic verification on the `/recovery/verify` endpoint.

3. **Deployment Safety**:
   - Update `deploy-all.ts` to require real mainnet contract addresses as inputs rather than zero address placeholders.
   - Add contract verification tasks to the Hardhat workflow.
