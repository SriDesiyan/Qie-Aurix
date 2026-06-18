# QIE Aurix — Integration Map

This map outlines the flow of user interaction and contract integration across the core Aurix pillars.

---

## The Unified Resilience Flow

### 1. Identity Root & Profile Creation
- The user connects their **QIE Pass** wallet.
- The oracle reads pass credentials and builds a **Trust Profile** showing composite trust graph nodes.

### 2. Resilience Score Calculation
- The **Resilience Score** (0-1000) is calculated based on portfolio concentration and stablecoin buffers.
- Target asset allocation weights are pushed to the **TrustProfileRegistry** contract.

### 3. Policy Composition
- The user configures custom thresholds via the **PolicyComposer** interface.
- Rules are saved to **ResiliencePolicyVault** to define protection triggers.

### 4. Guardian Mode Activation
- Activating **Guardian Mode** initiates emergency reserve deposits, sets up recovery gates, and anchors initial audits on-chain.

### 5. On-Chain Protection & Auditing
- **SafetyAuditAnchor** tracks verifier checks.
- If thresholds trigger, the vault locks reserves automatically.
- **AurixRecoveryGate** facilitates the reclaim of accidental transfers.
