"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, ToggleLeft, ToggleRight, Sparkles, AlertCircle } from "lucide-react";
import PolicyComposer from "../../../components/PolicyComposer";
import StatusPill from "../../../components/StatusPill";
import DEXIcon from "../../../components/icons/DEXIcon";
import LendingIcon from "../../../components/icons/LendingIcon";
import RecoveryLayerIcon from "../../../components/icons/RecoveryLayerIcon";
import FamilyVaultIcon from "../../../components/icons/FamilyVaultIcon";

const INITIAL_POLICIES = [
  { id: "volatility-shield", name: "Volatility Shield", desc: "Swap a percentage of volatile assets to QUSDC stablecoins when drawdown exceeds target threshold.", icon: <DEXIcon size={24} />, active: true, threshold: "30% drawdown" },
  { id: "lending-guard",     name: "Lending Guard",     desc: "Initiate dynamic rebalancing checks and repayments when position Health Factor drops below threshold.", icon: <LendingIcon size={24} />, active: true, threshold: "HF < 1.4" },
  { id: "recovery-guard",    name: "Recovery Guard",    desc: "Maintain constant funding reserves inside the recovery gate to ensure claims verification operations.", icon: <RecoveryLayerIcon size={24} />, active: false, threshold: "$500 minimum" },
  { id: "family-protect",    name: "Family Protection", desc: "Release alert feeds to heir addresses if the named vault balance drops below the minimum limit.", icon: <FamilyVaultIcon size={24} />, active: false, threshold: "$1,000 minimum" },
];

export default function PolicyPage() {
  const [policies, setPolicies] = useState(INITIAL_POLICIES);
  const [saving, setSaving] = useState<string | null>(null);

  const togglePolicy = async (id: string) => {
    setSaving(id);
    await new Promise((r) => setTimeout(r, 800));
    setPolicies((prev) =>
      prev.map((p) => (p.id === id ? { ...p, active: !p.active } : p))
    );
    setSaving(null);
  };

  const handleSavePolicy = (settings: { volatility: number; healthFactor: number; lockDays: number }) => {
    setPolicies((prev) =>
      prev.map((p) => {
        if (p.id === "volatility-shield") {
          return { ...p, threshold: `${settings.volatility}% drawdown` };
        }
        if (p.id === "lending-guard") {
          return { ...p, threshold: `HF < ${settings.healthFactor.toFixed(1)}` };
        }
        return p;
      })
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Title */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2>Protection Policies</h2>
          <p style={{ marginTop: "4px" }}>
            Configure and customize automated protection triggers monitored by the verifier oracle.
          </p>
        </div>
        <StatusPill status="safe" label="Policy Enforcer Active" />
      </motion.div>

      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "24px" }} className="grid-2">
        {/* Active Policies List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {policies.map((policy, idx) => (
            <motion.div
              key={policy.id}
              className="aurix-card"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              style={{ borderColor: policy.active ? "rgba(16, 185, 129, 0.25)" : "var(--color-border)" }}
              id={`policy-${policy.id}`}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px", flex: 1 }}>
                  {/* Icon */}
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "10px",
                      background: policy.active ? "var(--color-safe-dim)" : "rgba(255,255,255,0.01)",
                      border: `1px solid ${policy.active ? "rgba(16,185,129,0.3)" : "var(--color-border)"}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.45rem",
                      color: policy.active ? "var(--color-safe)" : "var(--color-text-muted)",
                      flexShrink: 0,
                    }}
                  >
                    {policy.icon}
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                      <span style={{ fontWeight: 700, fontSize: "0.9375rem" }}>{policy.name}</span>
                      {policy.active ? (
                        <span style={{ fontSize: "0.625rem", color: "var(--color-safe)", fontWeight: 700 }}>● ENFORCED</span>
                      ) : (
                        <span style={{ fontSize: "0.625rem", color: "var(--color-text-muted)", fontWeight: 700 }}>INACTIVE</span>
                      )}
                    </div>
                    <p style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)", lineHeight: 1.4, marginBottom: "6px" }}>{policy.desc}</p>
                    <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                      Rule Threshold: <strong style={{ color: "var(--color-gold)" }}>{policy.threshold}</strong>
                    </span>
                  </div>
                </div>

                {/* Toggle control */}
                <div style={{ flexShrink: 0 }}>
                  <AnimatePresence mode="wait">
                    {saving === policy.id ? (
                      <motion.span key="saving" style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        Saving...
                      </motion.span>
                    ) : (
                      <motion.button
                        key="btn"
                        id={`toggle-policy-${policy.id}`}
                        onClick={() => togglePolicy(policy.id)}
                        style={{ background: "none", border: "none", cursor: "pointer", display: "flex", color: policy.active ? "var(--color-safe)" : "var(--color-text-muted)" }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {policy.active ? <ToggleRight size={36} /> : <ToggleLeft size={36} />}
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Policy Composer Configurator */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <PolicyComposer onSave={handleSavePolicy} />

          {/* Tips Info Card */}
          <motion.div className="aurix-card aurix-card-teal" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
              <AlertCircle size={18} style={{ color: "var(--color-teal)", flexShrink: 0, marginTop: "2px" }} />
              <div>
                <h4 style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--color-text-primary)", marginBottom: "4px" }}>Active Enforcer Info</h4>
                <p style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)", lineHeight: 1.4 }}>
                  All updates to policy thresholds require verification. The oracle nodes enforce these rules on-chain via the policy vault checks.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
