# QIE Aurix — AI-Powered Decentralized Financial Resilience Guardian

> **"One Identity. One AI Guardian. Continuous Financial Protection Across Chains."**

QIE Aurix is a standalone decentralized financial resilience ecosystem built natively for the QIE blockchain network. It constructs a living Trust Profile from QIE Pass credentials, calculates a multi-dimensional Resilience Score, and deploys custom protection policies to defend user capital automatically.

---

## Technical Architecture

```
                 ┌────────────────────────────────┐
                 │       QIE Pass Identity        │  (Root identity layer)
                 └───────────────┬────────────────┘
                                 │
                                 ▼
                 ┌────────────────────────────────┐
                 │         Trust Profile          │  (Trust Graph composite)
                 └───────────────┬────────────────┘
                                 │
                                 ▼
                 ┌────────────────────────────────┐
                 │       Resilience Engine        │  (FastAPI Oracle Service)
                 └───────────────┬────────────────┘
                                 │
                                 ▼
                 ┌────────────────────────────────┐
                 │      Protection Policies       │  (Pluggable trigger checks)
                 └───────────────┬────────────────┘
                                 │
                                 ▼
                 ┌────────────────────────────────┐
                 │       On-Chain Execution       │  (Safety locks & recovery gates)
                 └────────────────────────────────┘
```

---

## Active Product Modules

### 1. Smart Contracts (`apps/aurix-contracts/`)
- **`TrustProfileRegistry`**: Anchors Pass identifiers, composite trust records, and weights.
- **`ResiliencePolicyVault`**: Manages stable reserves, lock times, and evaluates custom conditions.
- **`AurixRecoveryGate`**: Emits and validates claims proofs to recover accidentally transferred tokens.
- **`SafetyAuditAnchor`**: Tracks audit request IDs and registers IPFS reports.
- **`FamilyVaultController`**: Coordinates name registries on QIE Domains and heir release delays.

### 2. Core Service Layer (`apps/aurix-core-services/`)
- **`resilience-engine`**: Evaluates portfolio stability and suggests rebalancing actions.
- **`recovery-engine`**: Orchestrates state transitions for claims.
- **`protection-engine`**: Registers condition rules and evaluates trigger conditions.
- **`valuation-engine`**: Segments assets and checks exposure concentration.
- **`audit-engine`**: Audits active contracts for policy compliance.

### 3. Oracle Engine Layer (`apps/aurix-oracle/`)
- **`allocation_optimizer`**: Portfolio stablecoin buffer rebalancer.
- **`asset_valuator`**: Wallet health analyzer.
- **`claim_verifier`**: Transaction origin verifier.
- **`protection_trigger`**: Rules simulator.

---

## Quick Start Guide

### 1. Web Frontend
```bash
cd apps/aurix-web
npm install
npm run dev
# → Port http://localhost:3000
```

### 2. Oracle API
```bash
cd apps/aurix-oracle
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
# → docs: http://localhost:8000/docs
```

### 3. Smart Contracts Compilation
```bash
cd apps/aurix-contracts
npm install
npx hardhat compile
```
