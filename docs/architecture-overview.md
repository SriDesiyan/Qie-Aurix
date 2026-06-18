# QIE Aurix — Architecture Overview

QIE Aurix is a standalone decentralized financial resilience ecosystem built on top of the QIE blockchain network.

---

## 1. System Topology

```
             ┌─────────────────────────┐
             │    QIE Pass Identity    │  (Root identity validation)
             └────────────┬────────────┘
                          │
                          ▼
             ┌─────────────────────────┐
             │      Trust Profile      │  (Trust composite scoring)
             └────────────┬────────────┘
                          │
                          ▼
             ┌─────────────────────────┐
             │    Resilience Engine    │  (Volatility rebalancing)
             └────────────┬────────────┘
                          │
                          ▼
             ┌─────────────────────────┐
             │   Protection Policies   │  (Pluggable trigger checks)
             └────────────┬────────────┘
                          │
                          ▼
             ┌─────────────────────────┐
             │   On-Chain Execution    │  (Safety locks & recovery gates)
             └─────────────────────────┘
```

---

## 2. Platform Modules

### 1. Root Identity Layer (`TrustProfileRegistry.sol`)
- Anchors cryptographic identity proofs mapped to QIE Pass tokens.

### 2. Resilience Allocation Module (`ResiliencePolicyVault.sol`)
- Deploys stable reserves and enforces time-locks.

### 3. Claim Recovery Gate (`AurixRecoveryGate.sol`)
- Coordinates accidental token reclaims.

### 4. Integrity Auditor (`SafetyAuditAnchor.sol`)
- Commits audit logs on-chain.

### 5. Heir Allocation Module (`FamilyVaultController.sol`)
- Configures designated heirs and inheritance conditions.
