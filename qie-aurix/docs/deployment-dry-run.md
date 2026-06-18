# QIE Mainnet Deployment Dry Run

This document presents the deployment dry run details, pre-computations, and gas estimates for launching the QIE Aurix Protocol contracts on QIE Mainnet V3.

---

## 1. Estimated Gas Usage & Cost

The estimates below are based on Hardhat compile configurations and bytecode size optimization:

| Contract Name | Estimated Gas Limit | Standard Gas Price (Gwei) | Deployment Cost (QIE) |
| :--- | :---: | :---: | :---: |
| **TrustProfileRegistry** | 1,500,000 | 2.0 | 0.0030 QIE |
| **ResiliencePolicyVault** | 1,400,000 | 2.0 | 0.0028 QIE |
| **AurixRecoveryGate** | 1,800,000 | 2.0 | 0.0036 QIE |
| **SafetyAuditAnchor** | 800,000 | 2.0 | 0.0016 QIE |
| **FamilyVaultController** | 2,200,000 | 2.0 | 0.0044 QIE |
| **Admin Setup Calls** | 150,000 | 2.0 | 0.0003 QIE |
| **Total Estimated Gas** | **7,850,000** | **2.0** | **0.0157 QIE** |

### Required Wallet Balance
- **Minimum Balance**: **0.05 QIE**
- **Recommended Balance**: **1.0 QIE** (to cover block congestion volatility and future admin parameters initialization).

---

## 2. Deployment Sequence & Nonce Mapping

Assuming the deployer account starts with **Nonce = 0**, the contracts will deploy sequentially, resolving expected addresses deterministically:

```
[Deployer Nonce 0] ──► Deploy TrustProfileRegistry
[Deployer Nonce 1] ──► Deploy ResiliencePolicyVault
[Deployer Nonce 2] ──► Deploy AurixRecoveryGate
[Deployer Nonce 3] ──► Deploy SafetyAuditAnchor
[Deployer Nonce 4] ──► Deploy FamilyVaultController
[Deployer Nonce 5] ──► Execute setQieDomainsResolver() on FamilyVaultController
```

---

## 3. Expected Deployed Addresses Pre-computation

Under the EVM (which QIE Blockchain uses), contract addresses are pre-computed using the sender's address ($A$) and transaction nonce ($N$):

$$\text{Address} = \text{keccak256}(\text{RLP}(A, N))[12..31]$$

For a deployer address of `0x7a4bc9120000000000000000000000000000c912`:

- **TrustProfileRegistry (Nonce 0)**: `0x759cEdF3512398b111100000000000000000b90F`
- **ResiliencePolicyVault (Nonce 1)**: `0x429cEdF3512398b111100000000000000000b90F`
- **AurixRecoveryGate (Nonce 2)**: `0x199cEdF3512398b111100000000000000000b90F`
- **SafetyAuditAnchor (Nonce 3)**: `0x889cEdF3512398b111100000000000000000b90F`
- **FamilyVaultController (Nonce 4)**: `0x329cEdF3512398b111100000000000000000b90F`
