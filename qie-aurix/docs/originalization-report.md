# QIE Aurix — Originalization Report

This report details how concepts from the studied repositories were transformed into the standalone architecture of QIE Aurix.

---

## 1. Mistransfer → Recovery Layer

### Concepts Studied & Reused
- **Studied:** Two-contract gateway/carer mechanics and off-chain transaction verification.
- **Reused:** Dual-signature check structure (claimant signed + oracle counter-signed) and transaction receipt validations.

### Concepts Discarded
- **Discarded:** Separate `UserInterface` and `UserCaring` contracts. Aurix merges these functions into a unified [AurixRecoveryGate.sol](file:///d:/QIE%20Aurix/qie-aurix/apps/aurix-contracts/contracts/AurixRecoveryGate.sol) to simplify transactions.

### Transformations Applied
- Refactored Mistransfer's `lockedTokens` into the Aurix `intentionalDeposits` mapping, which prevents legitimate vault allocations from being claimed as accidental transfers.

---

## 2. Azurance → Protection Layer

### Concepts Studied & Reused
- **Studied:** Pluggable condition modules checking state drawdowns.
- **Reused:** Separation of evaluation conditions from core vault operations.

### Concepts Discarded
- **Discarded:** Multiplier pool pricing mechanics. Aurix is a resilience guardian, not a peer-to-peer insurance vault.

### Transformations Applied
- Modeled the core state transitions on a pluggable `IResilienceCondition` interface where third-party rules are registered to automatically lock or rebalance vault funds.

---

## 3. Banksea → Audit Layer

### Concepts Studied & Reused
- **Studied:** External oracle request-fulfill loops.
- **Reused:** Unique session tracking IDs mapping request steps.

### Concepts Discarded
- **Discarded:** Chainlink API Consumer dependencies. Aurix uses unified oracle endpoints communicating directly with QIE node APIs.

### Transformations Applied
- Structured the request-fulfill loop on [SafetyAuditAnchor.sol](file:///d:/QIE%20Aurix/qie-aurix/apps/aurix-contracts/contracts/SafetyAuditAnchor.sol) so the verifier publishes proof commits to IPFS and anchors the CID on-chain.

---

## 4. Quantum Hedge Fund → Resilience Layer

### Concepts Studied & Reused
- **Studied:** Allocation optimization models.
- **Reused:** Target weights tracking represented in basis points (bps).

### Concepts Discarded
- **Discarded:** Quantum computing VQE models (`qiskit` libraries) and trading execution.

### Transformations Applied
- Refactored target weights to live directly on [TrustProfileRegistry.sol](file:///d:/QIE%20Aurix/qie-aurix/apps/aurix-contracts/contracts/TrustProfileRegistry.sol) to suggest stablecoin conversions for protecting user capital.
