# QIE Aurix — Mock Dependency Report

This report inventories all mock layers, simulated data feeds, and sandbox logic in the monorepo. It details their files, architectural impact, and strategies for production replacement.

---

## 1. Inventory of Mock Dependencies

### 1. Mock Wallet & Financial Profile Data
- **File Path**: [profile_agent.py](file:///d:/QIE%20Aurix/qie-aurix/apps/aurix-oracle/agents/profile_agent.py#L102-L146)
- **Impact**: **CRITICAL**. Computes deterministic token balances, chain activity, and DEX swaps using a hash seed derived from the user's wallet address. In production, this causes the oracle to score portfolios identically regardless of their actual balances, completely breaking risk profiling and rebalancing.
- **Replacement Strategy**: Query the QIE node explorer API or write RPC calls (`eth_getBalance` for native QIE and `balanceOf` for registered ERC-20 assets) using the user's wallet address.

### 2. Mock QIE Pass Identity Data
- **File Path**: [profile_agent.py](file:///d:/QIE%20Aurix/qie-aurix/apps/aurix-oracle/agents/profile_agent.py#L88-L100) and [QiePassConnector.ts](file:///d:/QIE%20Aurix/qie-aurix/apps/aurix-web/src/lib/qie/QiePassConnector.ts#L115-L127)
- **Impact**: **HIGH**. Deterministically assigns QIE Pass NFT levels ("BASIC", "VERIFIED", "TRUSTED", "GUARDIAN") and mock domains to any connected address. Bypasses actual NFT status checks, allowing unauthenticated users to use the UI.
- **Replacement Strategy**: Query the deployed QIE Pass contract on-chain using the `QIE_PASS_ABI` to call `balanceOf`, `tokenTier`, and `verifiedDomains` methods. Throw an error or redirect if the balance is zero.

### 3. Mock Lending Positions (QIELend)
- **File Path**: [profile_agent.py](file:///d:/QIE%20Aurix/qie-aurix/apps/aurix-oracle/agents/profile_agent.py#L120-L128)
- **Impact**: **HIGH**. Generates simulated health factors, supply sizes, and borrow details. The risk engine relies on these mock metrics to alert users about collateral risks.
- **Replacement Strategy**: Integrate the QIELend protocol's smart contract ABI (e.g. `LendingPool` or equivalent) to query `getUserAccountData(user)` directly using the RPC client.

### 4. Mock DEX Activity (QIEDex)
- **File Path**: [profile_agent.py](file:///d:/QIE%20Aurix/qie-aurix/apps/aurix-oracle/agents/profile_agent.py#L135-L140)
- **Impact**: **MEDIUM**. Generates simulated swaps count, trading volume, and slippage.
- **Replacement Strategy**: Call the QIE DEX subgraph or factory router to fetch active user trade history and current swap spreads.

### 5. Mock Domain Linkages
- **File Path**: [FamilyVaultController.sol](file:///d:/QIE%20Aurix/qie-aurix/apps/aurix-contracts/contracts/FamilyVaultController.sol) and [family/page.tsx](file:///d:/QIE%20Aurix/qie-aurix/apps/aurix-web/src/app/dashboard/family/page.tsx)
- **Impact**: **HIGH**. On-chain vault controller maps domain names as raw strings without verifying ownership. Frontend forms simulate transaction delays and add strings to array state without sending actual on-chain transactions.
- **Replacement Strategy**: Connect the frontend to `FamilyVaultController` using `ethers.BrowserProvider` to send active transactions. Implement external queries in the Solidity contract to call the QIE Domains resolver contract.

### 6. Mock Recovery Gate Transaction Proofs
- **File Path**: [claim_verifier.py](file:///d:/QIE%20Aurix/qie-aurix/apps/aurix-oracle/engines/claim_verifier.py#L93-L125) and [recovery/page.tsx](file:///d:/QIE%20Aurix/qie-aurix/apps/aurix-web/src/app/dashboard/recovery/page.tsx)
- **Impact**: **HIGH**. Reverts to a simple hex length verification `len(claimant) == 42 and len(tx_hash) == 66` if the RPC client is unconfigured or fails. Automatically returns `True` for contract balance checks. Frontend simulates claim registrations using React timeouts.
- **Replacement Strategy**: Wire the frontend forms to call `submitClaimWithTxProof` on the deployed recovery gate contract. In the Python oracle, force queries to the configured RPC node using `eth_getTransactionReceipt` and reject any claims if the RPC returns an error or empty result.

---

## 2. Summary Table of Mock Levels

| Feature Area | Impact Level | Implementation | Production Danger |
|:---|:---:|:---|:---|
| **Financial Activity** | **CRITICAL** | Hash-seed generator in python | Invalid risk profiles and scores |
| **QIE Pass NFT** | **HIGH** | React connector & Python simulator fallback | Unauthenticated access allowed |
| **QIELend positions** | **HIGH** | Static python structures | False liquidation alerts |
| **QIEDex activity** | **MEDIUM** | Static python structures | Hardcoded rebalancing recommendations |
| **Domain verification** | **HIGH** | String-key storage mapping | Domain spoofing on controller |
| **Recovery validation** | **HIGH** | Length checks & balance mocks | Unauthorized verified claims |
