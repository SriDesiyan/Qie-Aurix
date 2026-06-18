# Network Mode Fix Report — QIE Aurix Session State Resolution

This report details the resolution of the bug where the application's top network badge remained stuck on `TESTNET` even after a successful `QIE Pass` or `Wallet` mainnet login.

---

## 1. Root Cause Analysis

Previously, the web application did not track or serialize the *authentication source/channel* used during login. When a user connected via `QIE Pass` or a standard EVM `Wallet`, the system only saved the user's `aurix_address` and `aurix_identity` fields in `localStorage`. 

The topbar network badge in [layout.tsx](file:///d:/QIE%20Aurix/qie-aurix/apps/aurix-web/src/app/dashboard/layout.tsx) was hardcoded to render `QIE Testnet` with static styling. There was no centralized session model capable of distinguishing between:
- A sandbox/mock **Demo** session (which should display `QIE TESTNET`).
- A production **QIE Pass ID** or **Web3 Wallet** session (which should dynamically switch to `QIE MAINNET`).

---

## 2. Centralized Session State Model

We introduced a custom React Context provider `SessionProvider` that holds the source of truth for the entire user session.

### The State Schema
- `authMode`: `DEMO` | `QIE_PASS` | `WALLET` | `UNAUTHENTICATED`
- `networkMode`: `TESTNET` | `MAINNET`
- `sessionSource`: `demo` | `qiepass` | `wallet` | `none`
- `address`: `string | null` (active user address)
- `identity`: `QiePassIdentity | null` (resolved QIE Pass descriptor metadata)
- `isMainnetActive`: Derived boolean (`networkMode === "MAINNET"`)
- `isDemoActive`: Derived boolean (`authMode === "DEMO"`)

### State Mutation Triggers
- **Demo Mode**: Triggered by clicking `"Explore Demo"` or select roles under the Sandbox tab. Sets `networkMode` to `TESTNET`.
- **QIE Pass / Wallet Mode**: Triggered by completing cryptography validation via a real ID resolver or wallet. Sets `networkMode` to `MAINNET`.
- **Reset/Logout Mode**: Triggered by clicking `"Disconnect Wallet"`. Clears states, local storage, and reloads to the landing page `/`.

---

## 3. Files Modified

| File | Change Type | Description |
| :--- | :--- | :--- |
| [SessionContext.tsx](file:///d:/QIE%20Aurix/qie-aurix/apps/aurix-web/src/context/SessionContext.tsx) | **[NEW]** | Created React Context, provider component, and custom `useSession()` hook. |
| [layout.tsx](file:///d:/QIE%20Aurix/qie-aurix/apps/aurix-web/src/app/layout.tsx) | **[MODIFY]** | Wrapped the app layout tree with the `<SessionProvider>`. |
| [AuthSelector.tsx](file:///d:/QIE%20Aurix/qie-aurix/apps/aurix-web/src/components/auth/AuthSelector.tsx) | **[MODIFY]** | Refactored `handleSuccess` to invoke `setDemoMode` or `setMainnetMode` based on selected login tabs. |
| [page.tsx](file:///d:/QIE%20Aurix/qie-aurix/apps/aurix-web/src/app/page.tsx) | **[MODIFY]** | Assigned `setDemoMode` to the landing page "Explore Demo" CTA button. |
| [layout.tsx (Dashboard)](file:///d:/QIE%20Aurix/qie-aurix/apps/aurix-web/src/app/dashboard/layout.tsx) | **[MODIFY]** | Bound sidebar/header to dynamic state. Styled badge reactively (Gold for Mainnet, Teal for Testnet). Added "Disconnect Wallet" action. |
| [page.tsx (Dashboard Overview)](file:///d:/QIE%20Aurix/qie-aurix/apps/aurix-web/src/app/dashboard/page.tsx) | **[MODIFY]** | Loaded on-chain identity and active modes reactively from context. |
| [page.tsx (Security Audit)](file:///d:/QIE%20Aurix/qie-aurix/apps/aurix-web/src/app/dashboard/audit/page.tsx) | **[MODIFY]** | Bound the scan text nodes to display the dynamic network name. |

---

## 4. Behavior Comparison (Before vs. After)

| Action / Flow | Behavior Before | Behavior After |
| :--- | :--- | :--- |
| **Demo / Sandbox Login** | Loaded default dashboard mock address. Topbar badge read `QIE Testnet`. | Loads `DEMO` state on `TESTNET`. Badge displays `QIE TESTNET` styled in green/teal. |
| **QIE Pass Login** | Resolved pass identity but topbar badge stayed statically on `QIE Testnet`. | Switches state to `QIE_PASS` on `MAINNET`. Badge changes to `QIE MAINNET` in premium gold styling. |
| **EVM Wallet Login** | Connected wallet but topbar badge stayed on `QIE Testnet`. | Switches state to `WALLET` on `MAINNET`. Badge changes to `QIE MAINNET` in gold. |
| **Page Refresh** | Re-read address/identity but defaulted badge back to `QIE Testnet`. | Deterministically loads active state from serialized storage, preserving `MAINNET` or `TESTNET` badge styling. |
| **Disconnect / Logout** | No option existed. Users had to manually wipe local storage to reset. | "Disconnect Wallet" button in sidebar footer deletes all states, keys, and routes back to `/`. |

---

## 5. Verification Check

All routes and components compile successfully. Visual layouts render with responsive fonts and correct color schemes.
