# QIE Aurix — Module Overview

This document reviews every active module in the Aurix repository.

---

## 1. On-Chain Contracts (`apps/aurix-contracts/`)
- **`TrustProfileRegistry`**: Anchors QIE Pass identities, maintains composite trust records, and houses target allocation weights.
- **`ResiliencePolicyVault`**: Manages stable reserves, lock times, and dynamically evaluates custom conditions.
- **`AurixRecoveryGate`**: Emits and validates claims proofs to recover accidentally transferred tokens.
- **`SafetyAuditAnchor`**: Tracks audit request IDs and registers IPFS reports.
- **`FamilyVaultController`**: Coordinates name registries on QIE Domains and handles heir release delay structures.

---

## 2. Core Service Layer (`apps/aurix-core-services/`)
- **`resilience-engine`**: Evaluates portfolio stability and suggests rebalancing actions.
- **`recovery-engine`**: Orchestrates state transitions for claims.
- **`protection-engine`**: Registers condition rules and evaluates trigger conditions.
- **`valuation-engine`**: Segment assets and checks exposure concentration.
- **`audit-engine`**: Audits active contracts for policy compliance.

---

## 3. Oracle Engine Layer (`apps/aurix-oracle/`)
- **`allocation_optimizer`**: Simulates correlation tables to maximize stable buffer weights.
- **`asset_valuator`**: Scores wallet liquidities.
- **`claim_verifier`**: Validates RPC transactions.
- **`protection_trigger`**: Simulates protection activations.
