# QIE Pass Login Verification Report — QIE Aurix

This report details the end-to-end verification of the QIE Pass authentication and network transition flows.

---

## 1. Login Entry Point

The QIE Pass login flow is initiated in [QiePassLogin.tsx](file:///d:/QIE%20Aurix/qie-aurix/apps/aurix-web/src/components/auth/QiePassLogin.tsx). Users can enter:
- A public EVM address (`0x...`)
- A `@QIE Pass ID` (`@1024`)
- A QIE Domain name (`name.qie`)

Once parsed, the connector contract retrieves the identity, token tier, and verified domains from the on-chain QIE Pass NFT registry, returning a `QiePassIdentity` object to the parent container.

---

## 2. Session & Network State Transition

Upon successful on-chain validation, the `AuthSelector.tsx` callback executes:

```typescript
setMainnetMode(address, identity, "qiepass");
```

This triggers state changes in the `SessionProvider`:
- `authMode` is updated to `"QIE_PASS"`.
- `networkMode` is updated to `"MAINNET"`.
- `sessionSource` is updated to `"qiepass"`.
- User `address` and `identity` metadata are registered.
- Data is written to `localStorage` for cross-refresh retention.

No sandbox presets or fallback mock addresses are used; the active session references the real user's registered QIE Pass data.

---

## 3. UI Response Verification

The moment `setMainnetMode` is triggered:
- The topbar network badge updates from any default or previous values to `QIE MAINNET`.
- The badge styling transitions to the gold theme (`var(--color-gold)`).
- The sidebar displays the resolved address (truncated).
- Subpages (Overview, Audit, Policies) read `isMainnetActive` reactively and display active mainnet metrics instead of sandbox options.

---

## 4. Audit Finding Summary

- **Session Type Identification**: PASS
- **Mainnet Force Activation**: PASS
- **Identity Override Validation**: PASS
- **Instant UI Refresh**: PASS
- **Overall Status**: **PASS**
