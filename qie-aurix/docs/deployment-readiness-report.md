# QIE Aurix — Deployment Readiness Report

This report assesses the deployment readiness of the QIE Aurix smart contracts and oracle service. It inventories the configuration elements and lists blockers preventing mainnet launch.

---

## 1. Readiness Summary

| Deployment Component | Status | Details / Actions Required |
|:---|:---:|:---|
| **Deployment Scripts** | **READY** | Hardhat script `deploy-all.ts` compiles and successfully deploys the 5 core contracts. It requires replacing zero address placeholder inputs. |
| **Environment Variables** | **MISSING** | No production `.env` exists in the root directory. Dummy keys exist in `.env.example`. |
| **Contract Verification Scripts** | **MISSING** | `hardhat.config.ts` lacks block explorer keys and verification plugin settings for the QIE block explorer. |
| **Production Compiler Setup** | **READY** | Solidity compiler configured to Solidity v0.8.24 with Cancun EVM settings and 200 optimization runs enabled. |
| **RPC Node Configuration** | **BLOCKED** | Config defaults to a mock endpoint (`https://rpc.qie-testnet.example.com`). Active node connections are blocked until production nodes are configured. |
| **Chain Configuration** | **BLOCKED** | `ChainAdapter.ts` maps QIE Mainnet chain ID to `1`, which conflicts with Ethereum Mainnet. Mainnet adapter inherits testnet configuration options. |

---

## 2. Itemized Verification

### A. Environment Configuration (`.env`)
- **Required**: A secure production `.env` must be populated with:
  ```env
  DEPLOYER_PRIVATE_KEY="<actual_deployer_key>"
  ORACLE_SECRET_KEY="<actual_signer_key>"
  QIE_RPC_URL="https://rpc.qie.network"
  QIE_CHAIN_ID=7777 # (Replace with official QIE chain ID)
  ```
- **Current Status**: **MISSING**. Only `.env.example` exists.

### B. Deployment script details (`deploy-all.ts`)
- **Required**: Placeholders for dependencies must be replaced with the verified addresses:
  ```typescript
  const QIE_PASS_PLACEHOLDER  = "0xRealQiePassMainnetAddress";
  const QUSDC_PLACEHOLDER     = "0xRealQusdMainnetAddress";
  ```
- **Current Status**: **READY** (Pending replacement of inputs).

### C. Explorer Verification setup
- **Required**: Add the following to `hardhat.config.ts` network configs and custom chains:
  ```typescript
  etherscan: {
    apiKey: {
      qie: "none"
    },
    customChains: [
      {
        network: "qie",
        chainId: 7777, // (replace with official chain ID)
        urls: {
          apiURL: "https://explorer.qie.network/api",
          browserURL: "https://explorer.qie.network"
        }
      }
    ]
  }
  ```
- **Current Status**: **MISSING**.

### D. Chain Adapter Configuration (`ChainAdapter.ts`)
- **Required**: Set `chainId` on `QIE_MAINNET_ADAPTER` to the actual QIE Mainnet chain ID and configure it as the exported `activeChain`.
- **Current Status**: **BLOCKED** (Mapped to `1` and inactive).
