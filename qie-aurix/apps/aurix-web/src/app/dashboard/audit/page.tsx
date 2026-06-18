"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, ShieldAlert, Sparkles, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import AuditRing from "../../../components/AuditRing";
import StatusPill from "../../../components/StatusPill";

const MOCK_AUDIT = {
  overall_integrity: 88.4,
  anchored_at: Date.now() / 1000 - 1800,
  contracts_audited: [
    {
      contract_name: "TrustProfileRegistry",
      contract_address: "0x0001...aaaa",
      integrity_score: 96,
      findings: [{ severity: "INFO", title: "Single Authorized Oracle active", description: "Configured with one active oracle endpoint. Consider adding a backup verifier." }],
    },
    {
      contract_name: "ResiliencePolicyVault",
      contract_address: "0x0002...bbbb",
      integrity_score: 84,
      findings: [
        { severity: "LOW", title: "Low stablecoin ratio trigger", description: "The policy profile stablecoin allocation buffer has dropped below optimal target." },
      ],
    },
    {
      contract_name: "AurixRecoveryGate",
      contract_address: "0x0003...cccc",
      integrity_score: 91,
      findings: [],
    },
    {
      contract_name: "SafetyAuditAnchor",
      contract_address: "0x0004...dddd",
      integrity_score: 95,
      findings: [],
    },
    {
      contract_name: "FamilyVaultController",
      contract_address: "0x0005...eeee",
      integrity_score: 82,
      findings: [{ severity: "MEDIUM", title: "Unverified Heir Identity detected", description: "An assigned heir has no registered QIE Pass. Verified credentials required to unlock claims." }],
    },
  ],
};

export default function AuditPage() {
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [expanded, setExpanded] = useState<string | null>(null);

  const runAudit = async () => {
    setRunning(true);
    setProgress(0);
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((r) => setTimeout(r, 100));
      setProgress(i);
    }
    setRunning(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Title */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2>Security Audit Panel</h2>
          <p style={{ marginTop: "4px" }}>
            On-chain contract integrity logs anchored via SafetyAuditAnchor.
          </p>
        </div>
        <button
          id="run-audit-btn"
          className="aurix-btn aurix-btn-gold"
          onClick={runAudit}
          disabled={running}
          style={{ padding: "10px 22px", fontSize: "0.875rem" }}
        >
          {running ? "Scanning Nodes..." : "🔍 Run Safety Audit"}
        </button>
      </motion.div>

      {/* Interactive Scan Progress */}
      {running && (
        <motion.div className="aurix-card" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "0.8125rem", color: "var(--color-text-secondary)" }}>
            <span>Deploying audit queries to QIE Testnet nodes...</span>
            <span>{progress}%</span>
          </div>
          <div className="progress-track" style={{ height: "8px" }}>
            <motion.div
              className="progress-fill"
              style={{ background: "var(--color-teal)", width: `${progress}%` }}
            />
          </div>
        </motion.div>
      )}

      {/* Main Stats Header */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "24px" }} className="grid-2">
        {/* Audit Ring Visual Card */}
        <motion.div className="aurix-card aurix-card-gold" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ display: "flex", flexDirection: "column", justifyItems: "center" }}>
          <div style={{ margin: "20px 0" }}>
            <AuditRing score={MOCK_AUDIT.overall_integrity} isScanning={running} />
          </div>
          <div style={{ textAlign: "center", marginTop: "12px" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Last Audited: 30 minutes ago</span>
          </div>
        </motion.div>

        {/* Report Overview Panel */}
        <motion.div className="aurix-card" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h3>System Status</h3>
            <StatusPill status="safe" label="Compliant" />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--color-border)", paddingBottom: "10px" }}>
              <span style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>Contracts Monitored</span>
              <span style={{ fontSize: "0.875rem", fontWeight: 700 }}>{MOCK_AUDIT.contracts_audited.length} Active</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--color-border)", paddingBottom: "10px" }}>
              <span style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>Policy Compliance</span>
              <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--color-safe)" }}>92% Compliant</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "4px" }}>
              <span style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>IPFS Report Anchor CID</span>
              <code style={{ fontSize: "0.75rem", color: "var(--color-gold)", fontFamily: "monospace" }}>bafybeicn7qie...</code>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Contract Breakdown List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {MOCK_AUDIT.contracts_audited.map((contract, idx) => (
          <motion.div
            key={contract.contract_name}
            className="aurix-card"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 + idx * 0.08 }}
            style={{ cursor: "pointer", borderColor: expanded === contract.contract_name ? "rgba(255,255,255,0.12)" : "var(--color-border)" }}
            onClick={() => setExpanded(expanded === contract.contract_name ? null : contract.contract_name)}
            id={`audit-contract-${contract.contract_name.toLowerCase()}`}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                {/* Score Indicator */}
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "10px",
                    background: "rgba(255, 255, 255, 0.02)",
                    border: "1px solid var(--color-border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "var(--font-display)",
                    fontWeight: 800,
                    color: contract.integrity_score >= 90 ? "var(--color-safe)" : "var(--color-gold)",
                  }}
                >
                  {contract.integrity_score}
                </div>
                <div>
                  <h4 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--color-text-primary)" }}>{contract.contract_name}</h4>
                  <code style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", fontFamily: "monospace" }}>{contract.contract_address}</code>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                {contract.findings.length === 0 ? (
                  <span style={{ fontSize: "0.6875rem", color: "var(--color-safe)", fontWeight: 700, textTransform: "uppercase" }}>✓ No Findings</span>
                ) : (
                  <span style={{ fontSize: "0.6875rem", color: "var(--color-amber)", fontWeight: 700, textTransform: "uppercase" }}>⚠️ {contract.findings.length} Warning</span>
                )}
                {expanded === contract.contract_name ? <ChevronUp size={16} style={{ color: "var(--color-text-muted)" }} /> : <ChevronDown size={16} style={{ color: "var(--color-text-muted)" }} />}
              </div>
            </div>

            {/* Findings details expanded drawer */}
            <AnimatePresence>
              {expanded === contract.contract_name && contract.findings.length > 0 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  style={{ overflow: "hidden", marginTop: "16px" }}
                >
                  {contract.findings.map((f, fIdx) => (
                    <div
                      key={fIdx}
                      style={{
                        padding: "14px",
                        background: "rgba(0, 0, 0, 0.15)",
                        border: "1px solid rgba(255,255,255,0.01)",
                        borderRadius: "var(--radius-md)",
                        borderLeft: `3px solid ${f.severity === "MEDIUM" ? "var(--color-amber)" : "var(--color-text-muted)"}`,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                        <span style={{ fontSize: "0.6875rem", color: "var(--color-amber)", fontWeight: 800 }}>{f.severity}</span>
                        <strong style={{ fontSize: "0.8125rem", color: "var(--color-text-primary)" }}>{f.title}</strong>
                      </div>
                      <p style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)", lineHeight: 1.4 }}>{f.description}</p>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
