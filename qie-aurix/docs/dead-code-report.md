# QIE Aurix — Dead Code Report

This report evaluates QIE Aurix repository code structures for unused modules, redundant contracts, or legacy helper utilities.

---

## Code Base Inventory Audit

### 1. Smart Contracts (`apps/aurix-contracts/contracts/`)
- [TrustProfileRegistry.sol](file:///d:/QIE%20Aurix/qie-aurix/apps/aurix-contracts/contracts/TrustProfileRegistry.sol) — **Active** (Stores trust scores & resilience weights).
- [ResiliencePolicyVault.sol](file:///d:/QIE%20Aurix/qie-aurix/apps/aurix-contracts/contracts/ResiliencePolicyVault.sol) — **Active** (Manages QUSDC emergency reserves & locks).
- [AurixRecoveryGate.sol](file:///d:/QIE%20Aurix/qie-aurix/apps/aurix-contracts/contracts/AurixRecoveryGate.sol) — **Active** (Executes accidental transfer claims).
- [SafetyAuditAnchor.sol](file:///d:/QIE%20Aurix/qie-aurix/apps/aurix-contracts/contracts/SafetyAuditAnchor.sol) — **Active** (Logs IPFS audit hashes).
- [FamilyVaultController.sol](file:///d:/QIE%20Aurix/qie-aurix/apps/aurix-contracts/contracts/FamilyVaultController.sol) — **Active** (Handles named family vaults).

*Recommendation:* Retain all 5 contracts. No dead or mock contracts found.

### 2. TypeScript Services (`apps/aurix-core-services/src/services/`)
- `resilience-engine/` — **Active** (Weight recommendations).
- `recovery-engine/` — **Active** (Verification helper).
- `protection-engine/` — **Active** (Condition registration).
- `valuation-engine/` — **Active** (Concentration checks).
- `audit-engine/` — **Active** (Policy checks).

*Recommendation:* All folders compile successfully and are actively imported by the core workspace interfaces.

### 3. Oracle Engines (`apps/aurix-oracle/engines/`)
- `allocation_optimizer.py` — **Active** (FastAPI `/allocation/optimize`).
- `asset_valuator.py` — **Active** (FastAPI `/valuation/wallet-health`).
- `claim_verifier.py` — **Active** (FastAPI `/recovery/verify-tx-origin`).
- `protection_trigger.py` — **Active** (FastAPI `/protection/evaluate-triggers`).

*Recommendation:* Retain all 4 modules.

---

## External Workspace Cleanup Recommendation
The downloaded reference folders located outside `qie-aurix` (such as `azurance/`, `banksea/`, `mistransfer/`, `Quantum Hedge Fund/`, and `Defi builder/`) are separate local workspace folders and are **not** referenced by Aurix. They can be safely deleted or ignored as they are not part of the active Git repository.
