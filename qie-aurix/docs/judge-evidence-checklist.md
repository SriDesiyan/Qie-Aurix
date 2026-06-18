# QIE Aurix — Judge Evidence Checklist

This checklist contains the 10 verification checkpoints required for hackathon judges to validate the operational capabilities of QIE Aurix on QIE Mainnet.

---

## 1. Mainnet Evidence Checkpoints

- **[ ] Contract Address**
  - *Verification*: Confirm that contract addresses are deployed on Chain ID `1990`. 
  - *Evidence Location*: [deployments/qie-mainnet.json](file:///d:/QIE%20Aurix/qie-aurix/apps/aurix-contracts/deployments/qie-mainnet.json)
  
- **[ ] Explorer Verification**
  - *Verification*: Copy the contract addresses and paste them into the QIE Explorer.
  - *Explorer URL*: [https://mainnet.qie.digital](https://mainnet.qie.digital)

- **[ ] Wallet Connection**
  - *Verification*: Connect using MetaMask or QIE Wallet extension. Ensure the client is set to target the official QIEMainnet (Chain ID 1990).
  - *Code Reference*: [QieWalletConnector.ts](file:///d:/QIE%20Aurix/qie-aurix/packages/aurix-core/src/connectors/QieWalletConnector.ts)

- **[ ] QIE Pass Detection**
  - *Verification*: In production, verify that the logged-in wallet holds a QIE Pass NFT. In demo mode, select one of the sandbox role presets.
  - *Code Reference*: [QiePassLogin.tsx](file:///d:/QIE%20Aurix/qie-aurix/apps/aurix-web/src/components/auth/QiePassLogin.tsx)

- **[ ] Trust Profile Creation**
  - *Verification*: Connect an address to construct a living Trust Profile based on active transaction history.
  - *Code Reference*: [profile_agent.py](file:///d:/QIE%20Aurix/qie-aurix/apps/aurix-oracle/agents/profile_agent.py)

- **[ ] Guardian Mode Execution**
  - *Verification*: Toggle "Activate Guardian Mode" in the dashboard. Confirm that it executes steps sequentially and updates status.
  - *Code Reference*: [ResilienceCore3D.tsx](file:///d:/QIE%20Aurix/qie-aurix/apps/aurix-web/src/components/ResilienceCore3D.tsx)

- **[ ] Recovery Flow**
  - *Verification*: Submit an accidental transfer recovery claim using wallet signatures and verifier checks.
  - *Code Reference*: [AurixRecoveryGate.sol](file:///d:/QIE%20Aurix/qie-aurix/apps/aurix-contracts/contracts/AurixRecoveryGate.sol)

- **[ ] Family Vault Creation**
  - *Verification*: Setup a named family protection vault with customizable time-locks and heir allocation parameters.
  - *Code Reference*: [FamilyVaultController.sol](file:///d:/QIE%20Aurix/qie-aurix/apps/aurix-contracts/contracts/FamilyVaultController.sol)

- **[ ] Policy Creation**
  - *Verification*: Establish safety thresholds and backup parameters in the policy reserve vault.
  - *Code Reference*: [ResiliencePolicyVault.sol](file:///d:/QIE%20Aurix/qie-aurix/apps/aurix-contracts/contracts/ResiliencePolicyVault.sol)

- **[ ] Oracle Verification**
  - *Verification*: Verify that the oracle countersigns score payloads and claim submissions before committing them on-chain.
  - *Code Reference*: [main.py](file:///d:/QIE%20Aurix/qie-aurix/apps/aurix-oracle/main.py)
