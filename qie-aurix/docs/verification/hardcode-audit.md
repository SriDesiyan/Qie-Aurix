# Code Audit for Hardcoded Values Report — QIE Aurix

This report details a complete code search of the repository to identify hardcoded network strings, stale constants, or components ignoring the central session state.

---

## 1. Search Query Results & Audit Logs

We searched the entire `apps/aurix-web/src` workspace for key phrases that could imply static, hardcoded network labels or mock overrides.

### A. Search for `TESTNET` / `Mainnet` Badge Overrides
- **Previous Hardcoding**:
  - `apps/aurix-web/src/app/dashboard/layout.tsx` hardcoded `QIE Testnet` inside the header.
  - `apps/aurix-web/src/app/dashboard/audit/page.tsx` hardcoded `Deploying audit queries to QIE Testnet nodes...`.
- **Audit Result**: Completed removal of both. The badge inside `layout.tsx` pulls from `getActiveNetworkLabel()`. The audit scanning alerts pull from `{getActiveNetworkLabel()}` dynamically.

### B. Fallback / Mock Address Overrides
- **Audit Result**: All layouts and pages fall back safely to mock profiles only when `identity` is null or `isDemoActive` is true. Once a real user logs in via `QIE Pass` or `Wallet`, the context overwrites the local storage keys, and the page elements display their real address and identity tier reactively.

---

## 2. Hardcoded Values Verification Summary

No components bypass or ignore the central state provider. All UI indicators read from `useSession()`.

---

## 3. Audit Finding Summary

- **Hardcoded Labels Removal**: PASS
- **Stale Constants Check**: PASS
- **Central State Compliance**: PASS
- **Mock/Real Overrides Separation**: PASS
- **Overall Status**: **PASS**
