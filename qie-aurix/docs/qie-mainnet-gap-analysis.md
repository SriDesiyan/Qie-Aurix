# QIE Mainnet Gap Analysis Report

This report inventories all mock integrations, placeholder configurations, and stub APIs identified within the QIE Aurix monorepo and presents a migration path to full mainnet activation.

---

## 1. Inventory of Current Gaps & Mocks

### A. Fake QIE Pass Integrations & Mock DIDs
- **Current State**: 
  - `QiePassConnector.ts` catches contract read errors and automatically returns a mock pass profile (`mockQiePass()`).
  - `profile_agent.py` constructs a fake DID profile (`_mock_qie_pass()`) using a deterministic seed derived from the wallet address.
- **Risk Level**: **CRITICAL** (User identity can be spoofed or bypassed).
- **Fix Strategy**: Enforce strict contract calls to the deployed QIE Pass contract. Throw connection errors on failure instead of fallback returns.

### B. Placeholder Contract Addresses
- **Current State**: 
  - `qie-addresses.ts` sets all ecosystem dependency contract addresses (QIE Pass, QUSDC, QIE Domains, etc.) to `"0x0000000000000000000000000000000000000000"`.
  - `deploy-all.ts` deploys contracts pointing to placeholder tokens `0x0000000000000000000000000000000000000001` and `0x0000000000000000000000000000000000000002`.
- **Risk Level**: **HIGH** (Contracts point to non-existent code on-chain, causing all execution to fail).
- **Fix Strategy**: Declare official mainnet addresses inside a dedicated settings file and pass them as constructor parameters during deployment.

### C. Simulated Wallet & Lending Data
- **Current State**: 
  - `profile_agent.py` simulates USD values, borrow rates, health factors, and DEX swap slippages inside `_mock_financial_profile()`.
- **Risk Level**: **CRITICAL** (Resilience scores and rebalancing recommendations are calculated on simulated parameters).
- **Fix Strategy**: Integrate public RPC client queries and indexing subgraphs to fetch live balance sheets.

### D. Mock Oracle Outputs & Stub APIs
- **Current State**: 
  - `claim_verifier.py` simulates valid transaction origins using simple address string lengths if the RPC node fails or is empty.
  - `_check_balance()` always returns `True`, pretending the target contract holds sufficient funds.
- **Risk Level**: **HIGH** (The oracle could verify claims for tokens that do not exist or belong to different accounts).
- **Fix Strategy**: Remove simulated fallback blocks. Require valid RPC connections and revert transactions if node calls fail.

### E. Test-only & Localhost Configs
- **Current State**: 
  - `.env.example` defaults to `http://localhost:8000` for oracle access.
  - `hardhat.config.ts` fallback RPC is `https://rpc.qie-testnet.example.com` and fallback chain ID is `1234`.
- **Risk Level**: **MEDIUM** (Prone to local dev leakage in production).
- **Fix Strategy**: Validate environment fields during build/deploy operations.

---

## 2. Technical Blockers Checklist

1. `[ ]` Obtain official mainnet deployed addresses for the QIE Pass identity NFT.
2. `[ ]` Configure production IPFS gateway API credentials to write and read signed reports.
3. `[ ]` Set up active RPC nodes pointing to the official QIE Mainnet RPC (`https://rpc-main1.qiblockchain.online`).
4. `[ ]` Deploy the contracts and verify the contract bytecode on the QIE explorer.
