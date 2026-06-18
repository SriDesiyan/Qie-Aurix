# QIE Contract Address Requirements

This document specifies all external dependency smart contracts required by the QIE Aurix Protocol on QIE Mainnet.

---

## 1. Dependency Directory

| Dependency | Contract Name | Mainnet Address | ABI Status | Required Functions | Current Status |
| :--- | :--- | :--- | :---: | :--- | :---: |
| **QIE Pass** | `QiePass` | `REQUIRES_OFFICIAL_ADDRESS` | **VERIFIED** | `balanceOf(address)`, `tokenOfOwnerByIndex(address, uint256)`, `tokenTier(uint256)`, `verifiedDomains(uint256)`, `isValidator(address)`, `communityScore(address)`, `passIssuedAt(uint256)`, `ownerOf(uint256)` | 🔴 **BLOCKING** |
| **QIE Domains** | `QieDomains` | `REQUIRES_OFFICIAL_ADDRESS` | **VERIFIED** | `resolveDomain(string)` | 🔴 **BLOCKING** |
| **QUSDC** | `QUSDC` | `0x3F43DA82eC9A4f5285F10FaF1F26EcA7319E5DA5` | **VERIFIED** | `balanceOf(address)`, `transfer(address, uint256)`, `approve(address, uint256)`, `transferFrom(address, address, uint256)` | 🟢 **ACTIVE** |
| **QIE Bridge** | `QieBridge` | `0x0000000000000000000000000000000000000000` | **OPTIONAL** | N/A (Handled externally) | 🟡 **NON-BLOCKING** |
| **QIELend** | `QieLendPool` | `0x0000000000000000000000000000000000000000` | **OPTIONAL** | `getUserAccountData(address)` (Used by scoring system) | 🟡 **NON-BLOCKING** |
| **QIEDEX** | `QieDexRouter` | `0x0000000000000000000000000000000000000000` | **OPTIONAL** | `getAmountsOut(uint256, address[])` | 🟡 **NON-BLOCKING** |

---

## 2. Blocking Remediation Actions

To transition from dry run/demo fallbacks to complete production deployment on QIE Mainnet V3:
1. Obtain the official registered contract addresses for **QIE Pass V3** and **QIE Domains Registry** from the QIE core developer console.
2. Replace `REQUIRES_OFFICIAL_ADDRESS` in [qie-network.ts](file:///d:/QIE%20Aurix/qie-aurix/packages/aurix-core/src/constants/qie-network.ts) with the recovered hex addresses.
3. Deploy the contracts using `npx hardhat run deploy/qie-mainnet-deploy.ts --network qieMainnet`.
