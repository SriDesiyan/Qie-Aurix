# Session State Architecture — QIE Aurix

This document explains the architecture of the centralized session and network state manager in the QIE Aurix web application.

---

## 1. Source of Truth

The single source of truth for the entire application session is the `SessionProvider` declared in [SessionContext.tsx](file:///d:/QIE%20Aurix/qie-aurix/apps/aurix-web/src/context/SessionContext.tsx).

The provider handles:
1. React state replication so that all layout and subpage components re-render immediately upon login, network switch, or logout.
2. Synchronous storage persistence (`localStorage`) so that page refreshes or cross-tab navigations preserve the correct session state deterministically.
3. Safe server-side rendering (SSR) bootstrapping, loading cached states during the hydration cycle without triggering mismatch warnings.

```
       +---------------------------------------------+
       |             SessionProvider                 |
       |  (Central React Context & LocalStorage)     |
       +----------------------+-+--------------------+
                              | |
             +----------------+ +----------------+
             |                                   |
             v                                   v
   +--------------------+              +--------------------+
   |   Landing Page /   |              |  Dashboard Layout  |
   |   Auth Selector    |              |  & Subpages        |
   | (Mutators/Actions) |              | (Reactive Readers) |
   +--------------------+              +--------------------+
```

---

## 2. Authentication Mode Handling

The application handles four authentication modes (`AuthMode`):

### A. `UNAUTHENTICATED` (Default State)
- **Session Source**: `none`
- **Address & Identity**: `null`
- **Derived Network**: `TESTNET`
- **User Interface**: Restricts access to dashboard views and prompts authentication via the landing page login selector.

### B. `DEMO` (Sandbox State)
- **Session Source**: `demo`
- **Address**: `0x7a4bc9120000000000000000000000000000c912` (or custom role address)
- **Identity**: Predefined mock profiles (Basic User, Node Validator, Guardian Shield)
- **Derived Network**: `TESTNET`
- **User Interface**: Allows exploration of dashboard cards, simulation of "Guardian Mode" activations, and safety audit dry-runs. Prevents mainnet-only interactions.

### C. `QIE_PASS` (Mainnet ID State)
- **Session Source**: `qiepass`
- **Address**: Real user address resolved from their `@QIE Pass ID` registry record.
- **Identity**: Verified on-chain credentials loaded dynamically from the QIE Pass NFT registry contract.
- **Derived Network**: `MAINNET`
- **User Interface**: Enables fully active live dashboard, showing mainnet parameters, audit reports, and active security triggers.

### D. `WALLET` (Direct Connection State)
- **Session Source**: `wallet`
- **Address**: Current active account connected via MetaMask, QIE Injected Wallet, or WalletConnect.
- **Identity**: Resolved identity from the QIE Pass contract linked to their public address.
- **Derived Network**: `MAINNET`
- **User Interface**: Real-time mainnet portfolio monitoring.

---

## 3. Network Mode Derivation

The network mode (`TESTNET` or `MAINNET`) is derived directly from the login method to guarantee that data corresponds to the appropriate environment:

1. **Demo & Sandbox Logins** $\rightarrow$ **`TESTNET`**
   - Renders the `QIE TESTNET` network badge styled in green/mint theme (`#00f5d4`).
   - Mocks the blockchain state so developers and judges can check features without spending real gas.
2. **QIE Pass ID & Web3 Wallet Logins** $\rightarrow$ **`MAINNET`**
   - Renders the `QIE MAINNET` network badge styled in corporate gold theme (`var(--color-gold)`).
   - Activates standard RPC checks against live contracts.

No individual view or component independently hardcodes or determines the active network mode; instead, they query the `networkMode` parameter or `getActiveNetworkLabel()` helper from the hook.

---

## 4. Key Context API Reference

Any client component can consume the API via:
```typescript
import { useSession } from "@/context/SessionContext";

const { 
  authMode, 
  networkMode, 
  isDemoActive, 
  address, 
  clearSession 
} = useSession();
```

### Hook API Methods
- `setDemoMode(address?, identity?)`: Sets the state context to demo mode on testnet.
- `setMainnetMode(address, identity, source)`: Sets the state context to mainnet for wallet/pass logins.
- `clearSession()`: Resets all storage slots and redirects the window back to `/`.
- `getActiveNetworkLabel()`: Yields the string `QIE TESTNET` or `QIE MAINNET` dynamically.
