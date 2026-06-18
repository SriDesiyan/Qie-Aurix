# Network Mode Verification Report — QIE Aurix

This report details the audit of the centralized network mode state and badge rendering behavior in the QIE Aurix web application.

---

## 1. Current Session State Logic

The application coordinates authentication and network environments via a unified React Context provider (`SessionProvider`) declared in [SessionContext.tsx](file:///d:/QIE%20Aurix/qie-aurix/apps/aurix-web/src/context/SessionContext.tsx).

The state fields are defined as:
- `authMode`: `DEMO` | `QIE_PASS` | `WALLET` | `UNAUTHENTICATED`
- `networkMode`: `TESTNET` | `MAINNET`
- `sessionSource`: `demo` | `qiepass` | `wallet` | `none`
- `address`: `string | null`
- `identity`: `QiePassIdentity | null`

---

## 2. Storage and Persistence

Session information is persisted directly within the browser's `localStorage` across refreshes using five core keys:
1. `aurix_auth_mode`
2. `aurix_network_mode`
3. `aurix_session_source`
4. `aurix_address`
5. `aurix_identity` (stored as serialized JSON)

Upon initialization, the `SessionProvider` performs a client-side mount check within a React `useEffect` callback, checking these localStorage keys and dynamically restoring the correct session state. This method ensures deterministic updates and prevents Next.js hydration mismatch errors between the pre-rendered server state and browser states.

---

## 3. Badge Rendering & Emojis Verification

The network badge rendered in the header panel of [layout.tsx (Dashboard)](file:///d:/QIE%20Aurix/qie-aurix/apps/aurix-web/src/app/dashboard/layout.tsx) pulls directly from the context:

- **Source of Truth**: Read from the provider hook `getActiveNetworkLabel()` which returns `"QIE MAINNET"` or `"QIE TESTNET"` dynamically.
- **Dynamic CSS Styling**:
  - `TESTNET` (Demo mode) uses a light green/teal background (`rgba(0, 245, 212, 0.08)`), matching border (`rgba(0, 245, 212, 0.25)`), and teal text (`#00f5d4`).
  - `MAINNET` (QIE Pass & Wallet logins) uses a premium gold background (`rgba(223, 180, 67, 0.08)`), matching border (`rgba(223, 180, 67, 0.25)`), and gold text (`var(--color-gold)`).
- **Hardcoding Check**: There are no hardcoded network strings inside layout files, ensuring the UI stays in sync.

---

## 4. Login and Logout Flow Responsiveness

- **Login**: Whenever `AuthSelector.tsx` resolves authentication, it calls `setDemoMode(...)` or `setMainnetMode(...)` matching the active tab. The state shifts immediately, triggering an instant, dynamic re-render of the network badge.
- **Logout**: Clicking the `"Disconnect Wallet"` button in the sidebar footer calls `clearSession()`, which removes all localStorage keys and reloads the window to the landing page `/`, wiping active session states.

---

## 5. Audit Finding Summary

- **Storage Verification**: PASS
- **Dynamic Badge Updates**: PASS
- **Persistence Across Refresh**: PASS
- **Hardcoding Removal**: PASS
- **Overall Status**: **PASS**
