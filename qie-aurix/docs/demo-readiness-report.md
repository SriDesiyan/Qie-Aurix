# QIE Aurix — Demo Readiness Report

This report evaluates the presentation flow of QIE Aurix for hackathon pitches and live video demonstrations.

---

## 1. Demo Flow Step-by-Step Verification

The ideal pitch flow has been verified against the current interface state:

```
  ┌──────────────────────┐      ┌──────────────────────┐      ┌──────────────────────┐
  │ 1. Connect QIE Pass  ├─────►│  2. Trust Profile    ├─────►│ 3. Resilience Score  │
  └──────────────────────┘      └──────────────────────┘      └──────────────────────┘
                                                                          │
  ┌──────────────────────┐      ┌──────────────────────┐      ┌───────────▼──────────┐
  │ 6. Protection Plan   │◄─────┼  5. Guardian Mode    │◄─────┼  4. Risk Detection   │
  └──────────┬───────────┘      └──────────────────────┘      └──────────────────────┘
             │
  ┌──────────▼──────────┐      ┌──────────────────────┐      ┌──────────────────────┐
  │  7. Recovery Layer   ├─────►│  8. Family Vault     ├─────►│  9. Audit Layer      │
  └──────────────────────┘      └──────────────────────┘      └──────────────────────┘
```

### 1. Connect QIE Pass
- **Action**: Click "🔑 Connect QIE Pass" on the Landing Page.
- **Result**: Simulates reading credentials, displaying "✓ QIE Pass Linked: TRUSTED" (or another tier based on the seed) and showing the "Enter Dashboard" button. (Verified)

### 2. Trust Profile & 3. Resilience Score
- **Action**: Enter the dashboard.
- **Result**: Displays the radar Trust Graph (84.2 composite score) and the circular Guardian Gauge (743 composite score) representing overall financial health. (Verified)

### 4. Risk Detection
- **Action**: Review the right-side "Risk Warnings" panel.
- **Result**: Displays two warnings: "Low Stablecoin Buffer" and "No Family Vault". (Verified)

### 5. Guardian Mode & 6. Protection Plan
- **Action**: Click "⚡ Activate Guardian Mode" in the center panel.
- **Result**: Sequentially deploys four steps (Emergency Reserve, Family Vault, Recovery Gate, and Risk Monitoring) with green ticks. The coverage meter updates from 52% to 87% and the Resilience Score rises from 743 to 801. (Verified)

### 7. Recovery Layer
- **Action**: Navigate to the Recovery tab and fill out the transfer details.
- **Result**: Simulates registering a claim. Displays a timeline showing verifying states. (Verified)

### 8. Family Vault
- **Action**: Navigate to the Family tab and click "Deploy Legacy Vault".
- **Result**: Displays the active vault list and updates it with the new domain. (Verified)

### 9. Audit Layer
- **Action**: Navigate to the Audit tab and click "Run Safety Audit".
- **Result**: Displays a progress bar ("Scanning Nodes...") and lists the integrity scores of the contract set. (Verified)

---

## 2. Presentation Scoring

- **Demo Clarity**: **9.5 / 10**
  - Clean layout, simple navigation links, and explanatory tips make it easy for judges to follow the progression.
- **Demo Impact**: **9.0 / 10**
  - Clicking "Activate Guardian Mode" provides immediate visual feedback as the gauge updates.
- **Judge Memorability**: **9.5 / 10**
  - Features such as the 3D WebGL Pacman maze core, radar graph, and floating chatbot make the application memorable.
