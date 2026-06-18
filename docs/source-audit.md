# QIE Aurix — Source Audit Report

This document inventories the reference points, structures, and libraries from the four initial hackathon repositories studied during the design of QIE Aurix.

---

## Imported Repositories Audited

### 1. Mistransfer (`mistransfer-main/`)
- **Studied Concepts:** Accidental transfer claim structures, oracle verification flow, and locked token maps.
- **Imported Code references:** Refactored into [AurixRecoveryGate.sol](file:///d:/QIE%20Aurix/qie-aurix/apps/aurix-contracts/contracts/AurixRecoveryGate.sol) and `recovery-engine` typescript helper modules.
- **Cleanup Status:** All internal code comments referencing "Mistransfer" are to be sanitized.

### 2. Azurance (`azurance-contract-main/`)
- **Studied Concepts:** Pluggable condition vaults and oracle-triggered locks.
- **Imported Code references:** Refactored into [ResiliencePolicyVault.sol](file:///d:/QIE%20Aurix/qie-aurix/apps/aurix-contracts/contracts/ResiliencePolicyVault.sol) and `protection-engine` typescript trigger registries.
- **Cleanup Status:** All internal comments referencing "Azurance" or "IAzuranceCondition" are to be sanitized.

### 3. Banksea (`banksea-chainlink-api-demo-main/`)
- **Studied Concepts:** Chainlink API client callback loops and risk tiering rules.
- **Imported Code references:** Refactored into [SafetyAuditAnchor.sol](file:///d:/QIE%20Aurix/qie-aurix/apps/aurix-contracts/contracts/SafetyAuditAnchor.sol) and `valuation-engine` risk classifications.
- **Cleanup Status:** All internal comments referencing "Banksea" or "APIConsumer" are to be sanitized.

### 4. Quantum Hedge Fund (`smart-contracts-main/`, `api-main/`)
- **Studied Concepts:** Weight-based asset rebalancing allocations and correlation models.
- **Imported Code references:** Refactored into [TrustProfileRegistry.sol](file:///d:/QIE%20Aurix/qie-aurix/apps/aurix-contracts/contracts/TrustProfileRegistry.sol) and `resilience-engine` weight suggestions.
- **Cleanup Status:** All internal comments referencing "Quantum Hedge Fund" or "QHF" are to be sanitized.

---

## Action Plan
- Remove all original comments.
- Substitute legacy placeholders with Aurix terminology.
- Establish clean, standalone code signatures.
