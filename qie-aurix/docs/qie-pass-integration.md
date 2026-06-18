# QIE Pass — Authentication & Integration Specifications

This document outlines the authentication architecture for QIE Aurix. It details the connection methods, on-chain integration patterns, and required API keys or secrets.

---

## 1. Authentication Architecture

Aurix implements three distinct login paradigms to support the full range of users, from mobile extensionless browsers to live monorepo deployments and hackathon judges:

```
                  ┌─────────────────────────────────────────┐
                  │       QIE Pass Authentication Selector  │
                  └────┬─────────────────┬──────────────┬───┘
                       │                 │              │
                       ▼                 ▼              ▼
           ┌──────────────────────┐  ┌───────────┐  ┌──────────────────────┐
           │ 1. Wallet Injected   │  │ 2. ID     │  │ 3. Sandbox Presets   │
           │ (MetaMask / QIE Ext) │  │ Read-Only │  │ (Judge Quick-Start)  │
           └──────────┬───────────┘  └─────┬─────┘  └──────────┬───────────┘
                      │                    │                   │
                      ▼                    ▼                   ▼
           ┌───────────────────────────────┴───────────────────┴───────────┐
           │                     QIE Pass Identity Verification            │
           │                  - Query balance / tier / validator           │
           │                  - Query domains registry ownership           │
           └───────────────────────────────────────────────────────────────┘
```

---

## 2. Supported Connection Methods

### A. Connect Wallet (Browser Extension / dApp)
- **Target**: Users utilizing MetaMask, WalletConnect, or QIE-compatible EVM wallet extensions.
- **Provider**: Standard injected provider (`window.ethereum`) accessed via `ethers.BrowserProvider`.
- **Properties**: Enables full read-write capabilities. Users can submit recovery claims, adjust policy thresholds, and deploy family vaults.
- **Dependency Fallback**: If `window.ethereum` is missing, the selector directs the user to extension download links or recommends QIE Pass ID login.

### B. QIE Pass Identifier (Extensionless Read-Only)
- **Target**: Extensionless browsers, mobile devices, or users seeking read-only dashboard access.
- **Inputs**: Wallet address (`0x...`), `@QIEPassID` token index, or registered `name.qie` domain.
- **Provider**: Public blockchain node connectivity via `ethers.JsonRpcProvider(activeChain.rpcUrl)`.
- **Validation Pipeline**:
  1. **Address (`0x...`)**: Checks `balanceOf(address) > 0` on the QIE Pass contract. If true, retrieves the first token index and queries details.
  2. **Pass ID (`@1234`)**: Queries `ownerOf(tokenId)` on the QIE Pass contract. If verified, resolves the owner's address and queries profile details.
  3. **Domain (`name.qie`)**: Queries the deployed QIE Domain Resolver to map the domain to its owner address, then queries corresponding QIE Pass details.
- **Fallback Resolution**: If the QIE Pass contract address is a placeholder (zero address) or if node queries timeout, the system uses a local seed-based client resolver to generate authentic demo details.

### C. Sandbox / Demo Mode
- **Target**: Hackathon judges.
- **Role Presets**:
  - **Basic Wallet User**: Tier: BASIC, composite trust: 38.5, Resilience Score: 380. Focuses on low reserves warning states.
  - **Verified Node Validator**: Tier: VERIFIED, composite trust: 61.2, Resilience Score: 640. Includes validator activity checks.
  - **Guardian Shield Pro**: Tier: GUARDIAN, composite trust: 84.2, Resilience Score: 891 (Full protection mode active).

---

## 3. QIE Pass ABI & On-Chain Methods

The integration interacts directly with the deployed QIE Pass contract using the following Solidity ABI:

```typescript
const QIE_PASS_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
  "function tokenTier(uint256 tokenId) view returns (uint8)",
  "function verifiedDomains(uint256 tokenId) view returns (string[])",
  "function isValidator(address owner) view returns (bool)",
  "function communityScore(address owner) view returns (uint256)",
  "function passIssuedAt(uint256 tokenId) view returns (uint256)",
  "function ownerOf(uint256 tokenId) view returns (address)",
];
```

---

## 4. API Key and Secret Dependency Directory

The following table summarizes which credentials are required for mainnet deployment vs. which features run without configurations:

| Monorepo Component | Config Identifier | Keys Required? | Purpose & Mainnet Dependency | No-Key Sandbox Fallback Status |
|:---|:---|:---:|:---|:---|
| **Public Chain Query** | `QIE_RPC_URL` | **No** | Reads QIE Pass balance, validator status, domains list, and scores. Works with any public RPC node. | Defaults to deterministic client-side mock if RPC fails. |
| **Oracle Signs** | `ORACLE_SECRET_KEY` | **Yes** | Authorized private key used by the oracle to sign score payloads before on-chain commit. | Mocked in Python dev endpoints. |
| **Deployer Wallet** | `DEPLOYER_PRIVATE_KEY` | **Yes** | Private key used to pay gas and deploy Solidity bytecodes. | Standard local Hardhat nodes require no external keys. |
| **IPFS Storage** | `IPFS_GATEWAY_URL` | **Yes** (Optional) | Stores compiled profile JSON payloads on IPFS. Required if using third-party pinners like Pinata or Infura. | Reads and writes fallback to public gateway URLs. |
| **Contract Verification** | `EXPLORER_API_KEY` | **Yes** (Optional) | Submits bytecode to QIE Block Explorer. | Submissions work but contract code remains unverified on explorer dashboard. |
