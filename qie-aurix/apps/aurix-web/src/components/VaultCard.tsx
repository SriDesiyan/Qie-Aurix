"use client";

import { motion } from "framer-motion";
import { ShieldAlert, ArrowUpRight, ShieldCheck, Clock, Users } from "lucide-react";

interface Heir {
  address: string;
  allocation_pct: number;
  claim_delay_days: number;
  qie_pass_verified: boolean;
}

interface VaultProps {
  domainName: string;
  balanceUsd: number;
  timeLockDays: number;
  heirs: Heir[];
  onFund?: (amount: string) => void;
}

export default function VaultCard({ domainName, balanceUsd, timeLockDays, heirs, onFund }: VaultProps) {
  return (
    <motion.div
      className="aurix-card aurix-card-gold"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      style={{ width: "100%" }}
    >
      {/* Header Info */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
        <div>
          <span
            style={{
              fontSize: "0.6875rem",
              background: "rgba(223,180,67,0.12)",
              color: "var(--color-gold)",
              border: "1px solid rgba(223,180,67,0.25)",
              padding: "4px 10px",
              borderRadius: "var(--radius-full)",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Family Vault
          </span>
          <h3 style={{ marginTop: "10px", fontSize: "1.25rem", color: "var(--color-text-primary)" }}>
            🏠 {domainName}
          </h3>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "1.875rem", fontWeight: 800, color: "var(--color-text-primary)", lineHeight: 1 }}>
            ${balanceUsd.toLocaleString()}
          </div>
          <span style={{ fontSize: "0.6875rem", color: "var(--color-text-muted)" }}>Active QUSDC Balance</span>
        </div>
      </div>

      {/* Lock / Stats Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "12px",
          marginBottom: "20px",
        }}
      >
        <div style={{ background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.02)", padding: "10px 14px", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", gap: "10px" }}>
          <Clock size={16} style={{ color: "var(--color-gold)" }} />
          <div>
            <span style={{ display: "block", fontSize: "0.625rem", color: "var(--color-text-muted)" }}>TIME LOCK</span>
            <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--color-text-primary)" }}>{timeLockDays} Days</span>
          </div>
        </div>
        <div style={{ background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.02)", padding: "10px 14px", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", gap: "10px" }}>
          <Users size={16} style={{ color: "#00f5d4" }} />
          <div>
            <span style={{ display: "block", fontSize: "0.625rem", color: "var(--color-text-muted)" }}>DESIGNATED HEIRS</span>
            <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--color-text-primary)" }}>{heirs.length} Assigned</span>
          </div>
        </div>
      </div>

      {/* Heirs Allocation Breakdown */}
      <h4 style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "10px" }}>
        Designated Heir Distributions
      </h4>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" }}>
        {heirs.map((heir, idx) => (
          <div
            key={idx}
            style={{
              padding: "10px 14px",
              background: "rgba(0, 0, 0, 0.15)",
              border: "1px solid rgba(255, 255, 255, 0.01)",
              borderRadius: "var(--radius-md)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <span style={{ fontFamily: "monospace", fontSize: "0.8125rem", color: "var(--color-text-primary)" }}>{heir.address}</span>
              <div style={{ display: "flex", gap: "8px", marginTop: "2px", alignItems: "center" }}>
                {heir.qie_pass_verified ? (
                  <span style={{ fontSize: "0.625rem", color: "#00f5d4", display: "flex", alignItems: "center", gap: "2px" }}>
                    <ShieldCheck size={10} /> QIE Pass Verified
                  </span>
                ) : (
                  <span style={{ fontSize: "0.625rem", color: "var(--color-amber)", display: "flex", alignItems: "center", gap: "2px" }}>
                    <ShieldAlert size={10} /> Identity Unverified
                  </span>
                )}
                <span style={{ fontSize: "0.625rem", color: "var(--color-text-muted)" }}>· {heir.claim_delay_days}d delay</span>
              </div>
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "1.125rem", fontWeight: 800, color: "var(--color-gold)" }}>
              {heir.allocation_pct}%
            </div>
          </div>
        ))}
      </div>

      {/* Funding Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const target = e.currentTarget.elements.namedItem("amount") as HTMLInputElement;
          if (onFund && target) {
            onFund(target.value);
            target.value = "";
          }
        }}
        style={{ display: "flex", gap: "8px" }}
      >
        <input
          name="amount"
          className="aurix-input"
          placeholder="Fund QUSDC amount..."
          type="number"
          style={{ flex: 1 }}
          required
        />
        <button type="submit" className="aurix-btn aurix-btn-gold" style={{ fontSize: "0.8125rem", padding: "8px 16px" }}>
          Fund <ArrowUpRight size={14} />
        </button>
      </form>
    </motion.div>
  );
}
