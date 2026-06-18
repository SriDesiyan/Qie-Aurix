"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, RefreshCw, FileCheck2, ArrowUpRight } from "lucide-react";
import RecoveryClaimPanel from "../../../components/RecoveryClaimPanel";
import StatusPill from "../../../components/StatusPill";

const MOCK_CLAIMS = [
  {
    claim_id: "0xabc123",
    token_symbol: "QUSDC",
    amount: "500.00",
    target_contract: "ResiliencePolicyVault",
    status: "PENDING",
    submitted_at: Date.now() / 1000 - 3600,
  },
  {
    claim_id: "0xdef456",
    token_symbol: "QIE",
    amount: "1200.00",
    target_contract: "FamilyVaultController",
    status: "VERIFIED",
    submitted_at: Date.now() / 1000 - 86400,
  },
];

export default function RecoveryPage() {
  const [claims, setClaims] = useState(MOCK_CLAIMS);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ tokenAddress: "", amount: "", targetContract: "", signature: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1500));
    setSubmitting(false);
    setSubmitted(true);
    setClaims((prev) => [
      {
        claim_id: `0x${Math.random().toString(16).slice(2, 8)}`,
        token_symbol: "QUSDC",
        amount: form.amount,
        target_contract: form.targetContract || "ResiliencePolicyVault",
        status: "PENDING",
        submitted_at: Date.now() / 1000,
      },
      ...prev,
    ]);
  };

  const handleRelease = (claimId: string) => {
    setClaims((prev) =>
      prev.map((c) => (c.claim_id === claimId ? { ...c, status: "RELEASED" } : c))
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Title */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2>Recovery Portal</h2>
          <p style={{ marginTop: "4px" }}>
            Reclaim assets that were accidentally transferred to Aurix system contracts.
          </p>
        </div>
        <StatusPill status="safe" label="Recovery Gateway Active" />
      </motion.div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "24px" }} className="grid-2">
        {/* Claim Form */}
        <motion.div className="aurix-card" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h3 style={{ marginBottom: "20px" }}>Submit Recovery Request</h3>

          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.form key="form" onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", display: "block", marginBottom: "6px", fontWeight: 600 }}>
                    Token Contract Address
                  </label>
                  <input
                    id="recovery-token-address"
                    className="aurix-input"
                    value={form.tokenAddress}
                    onChange={(e) => setForm({ ...form, tokenAddress: e.target.value })}
                    placeholder="0x..."
                    required
                  />
                </div>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <label style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", display: "block", marginBottom: "6px", fontWeight: 600 }}>
                      Amount to Recover
                    </label>
                    <input
                      id="recovery-amount"
                      className="aurix-input"
                      value={form.amount}
                      onChange={(e) => setForm({ ...form, amount: e.target.value })}
                      placeholder="0.00"
                      type="number"
                      required
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", display: "block", marginBottom: "6px", fontWeight: 600 }}>
                      Target System Contract
                    </label>
                    <select
                      id="recovery-target-contract"
                      className="aurix-input"
                      value={form.targetContract}
                      onChange={(e) => setForm({ ...form, targetContract: e.target.value })}
                      required
                      style={{ cursor: "pointer", height: "46px" }}
                    >
                      <option value="">Select contract...</option>
                      <option value="ResiliencePolicyVault">ResiliencePolicyVault</option>
                      <option value="FamilyVaultController">FamilyVaultController</option>
                      <option value="AurixRecoveryGate">AurixRecoveryGate</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", display: "block", marginBottom: "6px", fontWeight: 600 }}>
                    Claimant Wallet Signature
                  </label>
                  <input
                    id="recovery-signature"
                    className="aurix-input"
                    value={form.signature}
                    onChange={(e) => setForm({ ...form, signature: e.target.value })}
                    placeholder="0x..."
                    required
                  />
                </div>

                <div style={{ padding: "12px 14px", background: "rgba(6, 182, 212, 0.05)", border: "1px solid rgba(6, 182, 212, 0.15)", borderRadius: "var(--radius-md)", fontSize: "0.75rem", color: "var(--color-cyan)" }}>
                  💡 Ownership payload builds as: <code style={{ fontFamily: "monospace" }}>keccak256(claimId, token, amount, claimant, target)</code>
                </div>

                <button
                  id="submit-recovery-claim-btn"
                  type="submit"
                  className="aurix-btn aurix-btn-gold"
                  disabled={submitting}
                  style={{ width: "100%", marginTop: "8px" }}
                >
                  {submitting ? "Submitting Proof..." : "Verify & Submit Claim"}
                </button>
              </motion.form>
            ) : (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: "center", padding: "40px 0" }}>
                <div style={{ display: "flex", justifyItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                  <div style={{ width: 60, height: 60, borderRadius: "50%", background: "var(--color-safe-dim)", border: "1px solid rgba(16,185,129,0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-safe)" }}>
                    <FileCheck2 size={30} />
                  </div>
                </div>
                <h3 style={{ color: "var(--color-safe)", marginBottom: "8px" }}>Claim Registered</h3>
                <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", marginBottom: "20px" }}>
                  The oracle verifiers are currently processing the transaction receipt to release the funds.
                </p>
                <button className="aurix-btn aurix-btn-outline" onClick={() => setSubmitted(false)}>Submit another</button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Dynamic Timeline instructions and existing claims */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Timeline explainer */}
          <motion.div className="aurix-card" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h3 style={{ marginBottom: "18px" }}>Recovery Process</h3>
            {[
              { step: 1, title: "Anchor Claim", desc: "Construct and sign an accidental-transfer proof payload with your QIE Pass.", icon: "📝" },
              { step: 2, title: "Multi-Signature Verifying", desc: "The decentralized oracle validates the transaction receipt off-chain.", icon: "🔍" },
              { step: 3, title: "Permissionless Claim", desc: "Unlock and transfer the tokens directly back into your address.", icon: "💰" },
            ].map((s) => (
              <div key={s.step} style={{ display: "flex", gap: "14px", marginBottom: "16px" }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: "var(--color-gold-dim)", border: "1px solid rgba(223,180,67,0.25)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.9rem", flexShrink: 0,
                }}>
                  {s.icon}
                </div>
                <div>
                  <h4 style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--color-text-primary)", marginBottom: "2px" }}>{s.title}</h4>
                  <p style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)", lineHeight: 1.4 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Active claims panel */}
          <motion.div className="aurix-card" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <h3 style={{ marginBottom: "16px" }}>Active Submissions</h3>
            <RecoveryClaimPanel claims={claims} onRelease={handleRelease} />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
