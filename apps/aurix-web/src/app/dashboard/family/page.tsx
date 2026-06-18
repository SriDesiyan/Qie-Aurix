"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Plus, Users, ShieldCheck } from "lucide-react";
import VaultCard from "../../../components/VaultCard";
import StatusPill from "../../../components/StatusPill";

const MOCK_VAULTS = [
  {
    vault_id: "0xvault01",
    domain_name: "family.aurix.qie",
    balance_usd: 5200,
    time_lock_days: 180,
    is_deployed: true,
    heirs: [
      { address: "0xAlice...f9a2", allocation_pct: 60, claim_delay_days: 7, qie_pass_verified: true },
      { address: "0xBob...4c31", allocation_pct: 40, claim_delay_days: 14, qie_pass_verified: false },
    ],
  },
];

export default function FamilyPage() {
  const [vaults, setVaults] = useState(MOCK_VAULTS);
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState(false);
  const [form, setForm] = useState({ domainName: "", token: "QUSDC", timeLock: "180" });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    await new Promise((r) => setTimeout(r, 1600));
    setCreating(false);
    setCreated(true);
    setVaults((prev) => [
      {
        vault_id: `0xvault${Math.floor(Math.random() * 90 + 10)}`,
        domain_name: `${form.domainName || "new-vault"}.aurix.qie`,
        balance_usd: 0,
        time_lock_days: Number(form.timeLock),
        is_deployed: true,
        heirs: [],
      },
      ...prev,
    ]);
  };

  const handleFund = (amount: string) => {
    const value = parseFloat(amount);
    if (isNaN(value)) return;
    setVaults((prev) =>
      prev.map((v, i) => (i === 0 ? { ...v, balance_usd: v.balance_usd + value } : v))
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Title */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2>Family Vault Controller</h2>
          <p style={{ marginTop: "4px" }}>
            Establish named reserves mapped to your QIE Domains for emergency heir distributions.
          </p>
        </div>
        <StatusPill status="safe" label="Legacy Vault Controller Active" />
      </motion.div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "24px" }} className="grid-2">
        {/* Existing Vaults */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {vaults.map((v) => (
            <VaultCard
              key={v.vault_id}
              domainName={v.domain_name}
              balanceUsd={v.balance_usd}
              timeLockDays={v.time_lock_days}
              heirs={v.heirs}
              onFund={handleFund}
            />
          ))}
        </div>

        {/* Deploy New Vault */}
        <motion.div className="aurix-card" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
            <Plus size={20} style={{ color: "var(--color-gold)" }} />
            <h3>Deploy New Vault</h3>
          </div>

          <AnimatePresence mode="wait">
            {!created ? (
              <motion.form key="form" onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", display: "block", marginBottom: "6px", fontWeight: 600 }}>
                    QIE Domain Name prefix
                  </label>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <input
                      id="vault-domain-name"
                      className="aurix-input"
                      value={form.domainName}
                      onChange={(e) => setForm({ ...form, domainName: e.target.value })}
                      placeholder="family"
                      required
                      style={{ flex: 1 }}
                    />
                    <span style={{ color: "var(--color-gold)", fontWeight: 700, fontSize: "0.875rem" }}>
                      .aurix.qie
                    </span>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", display: "block", marginBottom: "6px", fontWeight: 600 }}>
                    Asset Token Type
                  </label>
                  <select id="vault-token" className="aurix-input" value={form.token} onChange={(e) => setForm({ ...form, token: e.target.value })} style={{ cursor: "pointer", height: "46px" }}>
                    <option value="QUSDC">QUSDC (Recommended)</option>
                    <option value="QIE">QIE</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", display: "block", marginBottom: "6px", fontWeight: 600 }}>
                    Release Time Lock (days)
                  </label>
                  <input
                    id="vault-time-lock"
                    className="aurix-input"
                    type="number"
                    value={form.timeLock}
                    onChange={(e) => setForm({ ...form, timeLock: e.target.value })}
                    min="30"
                    max="1000"
                    required
                  />
                </div>

                <div style={{ padding: "12px 14px", background: "rgba(223, 180, 67, 0.05)", border: "1px solid rgba(223, 180, 67, 0.15)", borderRadius: "var(--radius-md)", fontSize: "0.75rem", color: "var(--color-gold)", lineHeight: 1.4 }}>
                  💡 Heirs can claim their allocations after the lock duration expires and their identity is verified.
                </div>

                <button id="create-vault-btn" type="submit" className="aurix-btn aurix-btn-gold" style={{ width: "100%" }} disabled={creating}>
                  {creating ? "Deploying Vault..." : "Deploy Legacy Vault"}
                </button>
              </motion.form>
            ) : (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: "center", padding: "40px 0" }}>
                <div style={{ display: "flex", justifyItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                  <div style={{ width: 60, height: 60, borderRadius: "50%", background: "var(--color-safe-dim)", border: "1px solid rgba(16,185,129,0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-safe)" }}>
                    <ShieldCheck size={30} />
                  </div>
                </div>
                <h3 style={{ color: "var(--color-safe)", marginBottom: "8px" }}>Vault Deployed</h3>
                <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", marginBottom: "20px" }}>
                  Vault domain <strong style={{ color: "var(--color-gold)" }}>{form.domainName}.aurix.qie</strong> is now active.
                </p>
                <button className="aurix-btn aurix-btn-outline" onClick={() => setCreated(false)}>Create another</button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
