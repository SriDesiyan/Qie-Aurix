# Demo Mode Verification Report — QIE Aurix

This report details the audit of Demo / Sandbox mode behaviors and visual indicators inside the QIE Aurix app.

---

## 1. Demo Mode Entry & Initialization

Demo mode can be accessed via two core entry points:
1. Clicking **"Explore Demo"** on the landing page header. This executes `setDemoMode()` and navigates to the dashboard `/dashboard`.
2. Logging in via the **Sandbox** tab inside `AuthSelector.tsx` (selecting presets such as "Basic Wallet User", "Verified Node Validator", or "Guardian Shield Pro").

Upon execution, the centralized store registers:
- `authMode` $\rightarrow$ `"DEMO"`
- `networkMode` $\rightarrow$ `"TESTNET"`
- `sessionSource` $\rightarrow$ `"demo"`
- `address` $\rightarrow$ Mapped to the chosen preset (defaults to the Guardian Shield Pro preset).
- `identity` $\rightarrow$ Loaded with simulated stats and token allocations.

---

## 2. UI Presentation & Badges

- The dashboard top network badge correctly displays `QIE TESTNET` using the bright mint/teal theme (`#00f5d4`).
- No mainnet or live production labels are displayed anywhere in the header.
- The sidebar displays `"QIE Testnet"` as the active connection network.

---

## 3. Dynamic Mode Switching

If a user is currently exploring in `DEMO` mode, they can disconnect via the sidebar `"Disconnect Wallet"` button, which redirects to the landing page and prompts them to connect with a real QIE Pass. Selecting QIE Pass login correctly wipes the demo mock cache, registers their active mainnet identity, and updates the top network badge immediately to `QIE MAINNET` in gold.

---

## 4. Audit Finding Summary

- **Demo Activation Verification**: PASS
- **Testnet Network Badge**: PASS
- **Sandbox Presets Execution**: PASS
- **Network Mode Switch Cleanup**: PASS
- **Overall Status**: **PASS**
