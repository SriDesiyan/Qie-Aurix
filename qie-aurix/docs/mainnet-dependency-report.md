# QIE Mainnet Dependency Report

This document reports the live status of external dependencies and endpoints on QIE Mainnet.

---

## 1. Network Endpoints Live Audit

- **JSON-RPC Node**: `https://rpc1mainnet.qie.digital/`
  - Status: 🟢 **UP**
  - Block Height: `8655547`
  - Error: None
  
- **Block Explorer**: `https://mainnet.qie.digital`
  - Status: 🟢 **UP**
  - Response Code: 200
  - Error: None

---

## 2. Dependency Contract Registry

- **QUSDC Address**: `0x3F43DA82eC9A4f5285F10FaF1F26EcA7319E5DA5`
  - Status: 🟢 **VERIFIED** (6096 bytes)
  - Detail: Bytecode verified successfully.

- **QIE Pass Address**: `REQUIRES_OFFICIAL_ADDRESS`
  - Status: 🔴 **MISSING / INVALID (BLOCKING)**
  - Detail: Placeholder or missing address

- **QIE Domains Address**: `REQUIRES_OFFICIAL_ADDRESS`
  - Status: 🔴 **MISSING / INVALID (BLOCKING)**
  - Detail: Placeholder or missing address

---

## 3. Deployment Feasibility Summary

- Feasibility Status: 🔴 **BLOCKED**
- Reasoning: Live RPC and Explorer are responding, and the QUSDC stablecoin contract is confirmed. However, **QIE Pass** and **QIE Domains** are missing official addresses.
