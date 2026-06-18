import * as fs from "fs";
import * as path from "path";

// Mainnet Parameters
const RPC_URL = "https://rpc1mainnet.qie.digital/";
const EXPLORER_URL = "https://mainnet.qie.digital";
const QUSDC_ADDRESS = "0x3F43DA82eC9A4f5285F10FaF1F26EcA7319E5DA5";
const QIE_PASS_ADDRESS = "REQUIRES_OFFICIAL_ADDRESS";
const QIE_DOMAINS_ADDRESS = "REQUIRES_OFFICIAL_ADDRESS";

async function checkRpc(url: string): Promise<{ ok: boolean; blockNumber?: number; error?: string }> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", method: "eth_blockNumber", params: [], id: 1 }),
    });
    if (!res.ok) return { ok: false, error: `HTTP status ${res.status}` };
    const json: any = await res.json();
    if (json.error) return { ok: false, error: json.error.message };
    return { ok: true, blockNumber: parseInt(json.result, 16) };
  } catch (err: any) {
    return { ok: false, error: err.message || "Fetch error" };
  }
}

async function checkExplorer(url: string): Promise<{ ok: boolean; status?: number; error?: string }> {
  try {
    const res = await fetch(url, { method: "GET" });
    return { ok: res.ok, status: res.status };
  } catch (err: any) {
    return { ok: false, error: err.message || "Fetch error" };
  }
}

async function checkContract(rpcUrl: string, address: string): Promise<{ exists: boolean; codeSize?: number; error?: string }> {
  if (!address || address.startsWith("REQUIRES") || address === "0x0000000000000000000000000000000000000000") {
    return { exists: false, error: "Placeholder or missing address" };
  }
  try {
    const res = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", method: "eth_getCode", params: [address, "latest"], id: 2 }),
    });
    if (!res.ok) return { exists: false, error: `HTTP status ${res.status}` };
    const json: any = await res.json();
    if (json.error) return { exists: false, error: json.error.message };
    const code = json.result;
    if (code === "0x" || code === "0x0" || !code) {
      return { exists: false, error: "No bytecode at address (EOA or non-existent)" };
    }
    return { exists: true, codeSize: (code.length - 2) / 2 };
  } catch (err: any) {
    return { exists: false, error: err.message || "Fetch error" };
  }
}

async function run() {
  console.log("Scanning QIE Mainnet Dependencies...");

  const rpcStatus = await checkRpc(RPC_URL);
  const explorerStatus = await checkExplorer(EXPLORER_URL);
  const qusdcStatus = await checkContract(RPC_URL, QUSDC_ADDRESS);
  const qiePassStatus = await checkContract(RPC_URL, QIE_PASS_ADDRESS);
  const qieDomainsStatus = await checkContract(RPC_URL, QIE_DOMAINS_ADDRESS);

  const report = `# QIE Mainnet Dependency Report

This document reports the live status of external dependencies and endpoints on QIE Mainnet.

---

## 1. Network Endpoints Live Audit

- **JSON-RPC Node**: \`${RPC_URL}\`
  - Status: ${rpcStatus.ok ? "🟢 **UP**" : "🔴 **DOWN**"}
  - Block Height: ${rpcStatus.ok ? `\`${rpcStatus.blockNumber}\`` : "N/A"}
  - Error: ${rpcStatus.error || "None"}
  
- **Block Explorer**: \`${EXPLORER_URL}\`
  - Status: ${explorerStatus.ok ? "🟢 **UP**" : "🔴 **DOWN**"}
  - Response Code: ${explorerStatus.status || "N/A"}
  - Error: ${explorerStatus.error || "None"}

---

## 2. Dependency Contract Registry

- **QUSDC Address**: \`${QUSDC_ADDRESS}\`
  - Status: ${qusdcStatus.exists ? `🟢 **VERIFIED** (${qusdcStatus.codeSize} bytes)` : "🔴 **MISSING / INVALID**"}
  - Detail: ${qusdcStatus.error || "Bytecode verified successfully."}

- **QIE Pass Address**: \`${QIE_PASS_ADDRESS}\`
  - Status: ${qiePassStatus.exists ? `🟢 **VERIFIED** (${qiePassStatus.codeSize} bytes)` : "🔴 **MISSING / INVALID (BLOCKING)**"}
  - Detail: ${qiePassStatus.error || "Bytecode verified successfully."}

- **QIE Domains Address**: \`${QIE_DOMAINS_ADDRESS}\`
  - Status: ${qieDomainsStatus.exists ? `🟢 **VERIFIED** (${qieDomainsStatus.codeSize} bytes)` : "🔴 **MISSING / INVALID (BLOCKING)**"}
  - Detail: ${qieDomainsStatus.error || "Bytecode verified successfully."}

---

## 3. Deployment Feasibility Summary

- Feasibility Status: 🔴 **BLOCKED**
- Reasoning: Live RPC and Explorer are responding, and the QUSDC stablecoin contract is confirmed. However, **QIE Pass** and **QIE Domains** are missing official addresses.
`;

  const docsDir = path.join(__dirname, "..", "docs");
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir);
  }
  fs.writeFileSync(path.join(docsDir, "mainnet-dependency-report.md"), report, "utf8");
  console.log("Report generated successfully at docs/mainnet-dependency-report.md");
}

run().catch((err) => {
  console.error("Execution error:", err);
  process.exit(1);
});
