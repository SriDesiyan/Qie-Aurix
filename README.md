# QIE Aurix

### Financial Resilience Guardian for Web3

> **"One Identity. One Guardian. Continuous Financial Protection Across Chains."**

---

[![QIE Mainnet](https://img.shields.io/badge/Network-QIE_Mainnet-blue?style=for-the-badge&color=dfb443)](https://qie.digital)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/Oracle-FastAPI-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue?style=for-the-badge&logo=typescript)](https://typescriptlang.org)
[![Solidity](https://img.shields.io/badge/Smart_Contracts-Solidity-363636?style=for-the-badge&logo=solidity)](https://soliditylang.org)
[![Hardhat](https://img.shields.io/badge/Toolchain-Hardhat-fcf003?style=for-the-badge&logo=hardhat&logoColor=black)](https://hardhat.org)
[![Open Source](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](https://opensource.org/licenses/MIT)

QIE Aurix transforms fragmented Web3 finances into a secure, resilient, and recoverable ecosystem by combining identity, protection policies, recovery systems, trust scoring, and family vault security into a single platform.

---

## The Problem

Today's decentralized finance landscape is optimized for speculation, not longevity. Web3 users struggle with:

* **Asset Fragmentation**: Balances are spread across multiple protocols, chains, and layers with no unified overview.
* **Smart Contract Risks**: Users are exposed to liquidations, dynamic pool parameters, and vulnerabilities.
* **Wallet Security Concerns**: Private key management remains a single point of failure without automated fail-safes.
* **Mistaken Token Transfers**: Simple typing mistakes can lead to irreversible losses of capital when sent to incorrect contracts.
* **Lack of Recovery Mechanisms**: No native fallback options exist for retrieve operations on-chain.
* **No Family Inheritance Planning**: Passing digital assets to heirs requires sharing private keys, presenting high security risks.
* **No Unified Protection Layer**: Financial safeguards must be configured individually per dApp, rather than globally.

---

## Introducing QIE Aurix

QIE Aurix is a Financial Resilience Guardian designed to secure user capital throughout its entire lifecycle. The platform continuously evaluates the health of your portfolio and translates on-chain identity metrics into automated defense strategies.

Our system assesses five core pillars of financial resilience:

```
  ┌─────────────────────────────────────────────────────────────┐
  │                   Financial Resilience                      │
  └───────┬──────────────┬──────────────┬──────────────┬────────┘
          │              │              │              │
          ▼              ▼              ▼              ▼
    Identity Trust  Asset Stability  Recovery  Family Protection
```

---

## Core Features

### 🛡️ Trust Profile Engine
Builds a dynamic trust profile from verified QIE Pass metadata and historical on-chain parameters. It serves as the baseline identity layer for policy configurations.

### 📊 Resilience Score
Generates a real-time, transparent score from `0–1000` reflecting the user's exposure, contract health, recovery setups, and stablecoin buffers.

### ⚡ Guardian Mode™
A one-click dashboard trigger that deploys stablecoin vault reserves, activates legacy vaults, configures custom rebalancers, and secures the wallet's defensive perimeter.

### 🔄 Recovery Layer
A secure recovery gateway allowing claimants to retrieve accidentally transferred tokens from system vaults using multi-signature verifier consensus and cryptographic receipts.

### 🏠 Family Vaults
Coordinates legacy planning by locking assets under custom time-locks. Heirs can claim their allocations permissionlessly after verification of their QIE Pass ID.

### 🔍 Safety Audit Anchor
Anchors cryptographic hashes of security audits on-chain using the QIE Mainnet. Keeps an immutable record of system parameters and contract health.

### ⚙️ Protection Policies
Enables customized automation rules, such as swapping volatile tokens for QUSDC stablecoins when asset drawdowns exceed set thresholds.

---

## System Architecture

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
                  │       On-Chain Actions         │  (Safety locks & recovery gates)
                  └────────────────────────────────┘
```

The QIE Aurix ecosystem operates across four interconnected tiers:
1. **Frontend**: A sleek, premium dashboard built with Next.js 15, Framer Motion, and custom SVG iconography.
2. **AI Oracle**: A suite of autonomous agents running under Python/FastAPI to monitor metrics, audit nodes, and compute risk.
3. **Smart Contracts**: Secured Solidity code deployed on the QIE network to lock reserves, verify claims, and coordinate heirs.
4. **QIE Mainnet**: The foundation layer providing low-cost transactions, QIE Domains resolution, and secure identity anchorages.

---

## Smart Contracts

The contracts reside in `apps/aurix-contracts/contracts/` and are fully compiled for QIE Mainnet (Chain ID `1990`):

* **`TrustProfileRegistry`**: Registers user commitments, composite trust levels, and verification weights.
* **`ResiliencePolicyVault`**: Manages assets, configures time-locks, and executes rebalancing swaps.
* **`AurixRecoveryGate`**: Audits and verifies accidental transaction details, releasing locked tokens back to owners upon proof validation.
* **`FamilyVaultController`**: Coordinates name registries on QIE Domains and handles heir distribution configurations.
* **`SafetyAuditAnchor`**: Anchors IPFS audit hashes and logs system integrity records on-chain.

---

## Guardian Oracle

The backend oracle is composed of four specialized agents designed to audit portfolios and trigger protection rules:

| Agent Name | Description | Key Focus |
| :--- | :--- | :--- |
| **Profile Agent** | Evaluates identity and builds dynamic Trust Profiles. | Identity Trust |
| **Risk Agent** | Scans contracts and detects portfolio concentration anomalies. | Exposure Mitigation |
| **Protection Agent** | Coordinates and generates trigger execution files. | Swap & Lock Automation |
| **Auditor Agent** | Monitory script that audits on-chain contracts for sanity compliance. | Code Integrity |

---

## Built for the QIE Ecosystem

QIE Aurix is built natively for the QIE blockchain network, leveraging its decentralized infrastructure to enable automated financial safety:

* **QIE Mainnet**: Provides the high throughput, security, and sub-second execution speeds required for real-time risk responses.
* **QIE Pass**: Serves as the user identity core, verifying trust tiers and community scores without exposing sensitive private details.
* **QIE Domains**: Resolves named addresses (`name.qie`) for vault assignments.
* **QUSDC**: The primary stablecoin reserve used for policy hedging and family distributions.
* **QIEDex**: Executes instant asset conversions during policy triggers.
* **QIELend**: Integrates with lending protocols to monitor loan health factors and prevent liquidations.

---

## Technology Stack

### Frontend
* **Next.js 15** & **React 18** (App Router)
* **TypeScript** (Type safety)
* **Framer Motion** (Micro-animations and layout transitions)
* **Vanilla CSS** & **CSS Variables** (Curated custom styling system)

### Backend
* **FastAPI** (Python async routing)
* **Pydantic** (Data modeling)

### Blockchain
* **Solidity** (Smart contracts)
* **Hardhat** (Testing & compilation environment)
* **Ethers.js v6** (RPC client connections)

### Infrastructure
* **QIE Mainnet** (EVM compatibility layer)

---

## Demo Walkthrough

Try the core functionalities in order:

1. **Connect QIE Pass**: Authenticate using your QIE Pass address, ID, or `.qie` domain.
2. **Generate Trust Profile**: Evaluate your composite trust metrics and validator scores.
3. **Calculate Resilience Score**: Review your baseline exposure score (0–1000).
4. **Activate Guardian Mode**: Trigger the automated vault reserve allocations.
5. **Create Family Vault**: Map an inheritance profile with custom release delays.
6. **Run Safety Audit**: Anchor a system integrity report on-chain.
7. **Submit Recovery Request**: Test the accidental-transfer recovery flow.

---

## Repository Structure

```
qie-aurix/
├── apps/
│   ├── aurix-contracts/       # Solidity smart contracts and deployment scripts
│   ├── aurix-core-services/   # Shared typescript service modules (engines)
│   ├── aurix-oracle/          # Python FastAPI service & Oracle agents
│   └── aurix-web/             # Next.js frontend web dashboard
├── packages/
│   ├── aurix-core/            # Core constants, configurations, and adapters
│   └── aurix-score/           # Composite scoring libraries
├── docs/                      # Technical manuals, checklists, and reports
└── scripts/                   # Dependency scanners and utility scripts
```

---

## Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/SriDesiyan/Qie-Aurix.git
cd Qie-Aurix/qie-aurix
```

### 2. Install Workspace Dependencies
```bash
npm install
```

### 3. Start the Web Dashboard
```bash
npm run dev
# Dashboard launches at http://localhost:3000
```

### 4. Run the Oracle Service
Ensure you have Python 3.10+ installed:
```bash
cd apps/aurix-oracle
pip install -r requirements.txt
python main.py
# Oracle API launches at http://localhost:8000
```

### 5. Compile Smart Contracts
```bash
cd apps/aurix-contracts
npm install
npx hardhat compile
```

---

## Security Principles

* **Cryptographic Signatures**: All recovery requests require claimant wallet signatures verified by on-chain ECDSA checks.
* **Anti-Replay Protections**: Nonces are incorporated into policies to prevent transaction replication.
* **Role Controls**: Core admin actions and pause triggers are guarded by strict access controls.
* **Immutable Anchoring**: Audits are anchored via safety logs to prevent retro-active modification of scores.
* **Timelock Safe-guards**: Heir distributions are locked behind configurable release delay parameters.

---

## Roadmap

```
  Phase 1 ── Phase 2 ── Phase 3 ── Phase 4 ── Phase 5
  Personal    Family      DAO       Pools     Autonomous
```

* **Phase 1: Personal Financial Resilience**: Launch score engine and rebalancing policies.
* **Phase 2: Family Protection**: Multi-generational time-locked vaults mapped to QIE Pass IDs.
* **Phase 3: DAO Treasury Protection**: Multi-signature protection policies for institutional portfolios.
* **Phase 4: Community Resilience Pools**: Decentralized insurance models for pool insurance.
* **Phase 5: Autonomous Financial Guardians**: AI-powered real-time transaction firewalls.

---

## Why QIE Aurix Matters

While most DeFi platforms optimize for profits and yield, QIE Aurix optimizes for **survival, recovery, and resilience**. By introducing automated safety rails, we build a platform where users can secure their assets against unexpected drawdowns, transaction mistakes, and generational inheritance complexities.

---

## Team

### **TECH AVERIX**

* **Sri Desiyan V** (Team Lead)
* **College**: Chennai Institute of Technology
* **Event**: QIE Hackathon 2026

---

> **"We don't help users chase profits. We help them survive, recover, and thrive in Web3."**
