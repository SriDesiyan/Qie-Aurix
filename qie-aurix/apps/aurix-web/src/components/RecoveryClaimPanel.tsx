"use client";

import { motion } from "framer-motion";
import { ArrowRight, Lock, CheckCircle2, AlertTriangle, Play, Check } from "lucide-react";

interface Claim {
  claim_id: string;
  token_symbol: string;
  amount: string;
  target_contract: string;
  status: string;
  submitted_at: number;
}

interface ClaimsProps {
  claims: Claim[];
  onRelease?: (claimId: string) => void;
}

export default function RecoveryClaimPanel({ claims, onRelease }: ClaimsProps) {
  const getStatusDetails = (status: string) => {
    switch (status) {
      case "RELEASED":
        return { color: "#10b981", bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.25)", icon: CheckCircle2, text: "Released" };
      case "VERIFIED":
        return { color: "#00f5d4", bg: "rgba(0,245,212,0.08)", border: "rgba(0,245,212,0.25)", icon: Play, text: "Ready to Claim" };
      case "PENDING":
        return { color: "#f59e0b", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.25)", icon: AlertTriangle, text: "Oracle Verifying" };
      default:
        return { color: "#ef4444", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.25)", icon: Lock, text: "Rejected" };
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
      {claims.map((claim, idx) => {
        const details = getStatusDetails(claim.status);
        const Icon = details.icon;

        return (
          <motion.div
            key={claim.claim_id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.08 }}
            style={{
              padding: "16px 20px",
              background: "rgba(255, 255, 255, 0.01)",
              border: `1px solid ${claim.status === "VERIFIED" ? "rgba(0, 245, 212, 0.2)" : "rgba(255, 255, 255, 0.03)"}`,
              borderRadius: "var(--radius-md)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "16px",
            }}
          >
            {/* Left Info */}
            <div style={{ display: "flex", flex: 1, flexDirection: "column", minWidth: "200px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                <span style={{ fontSize: "1rem", fontWeight: 700, color: "var(--color-text-primary)" }}>
                  {claim.amount} {claim.token_symbol}
                </span>
                <span
                  style={{
                    fontSize: "0.625rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    padding: "3px 8px",
                    borderRadius: "var(--radius-full)",
                    background: details.bg,
                    border: `1px solid ${details.border}`,
                    color: details.color,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <Icon size={10} /> {details.text}
                </span>
              </div>
              <div style={{ display: "flex", gap: "12px", fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                <span>Contract: <strong style={{ color: "var(--color-text-secondary)" }}>{claim.target_contract}</strong></span>
                <span>ID: <code style={{ fontFamily: "monospace" }}>{claim.claim_id.slice(0, 8)}...</code></span>
              </div>
            </div>

            {/* Right Action */}
            <div>
              {claim.status === "VERIFIED" && onRelease && (
                <button
                  id={`claim-release-action-${claim.claim_id}`}
                  className="aurix-btn aurix-btn-teal"
                  onClick={() => onRelease(claim.claim_id)}
                  style={{ fontSize: "0.8125rem", padding: "8px 18px" }}
                >
                  Release Funds <ArrowRight size={14} />
                </button>
              )}
              {claim.status === "PENDING" && (
                <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", fontStyle: "italic" }}>
                  Awaiting multi-signature...
                </span>
              )}
              {claim.status === "RELEASED" && (
                <span style={{ fontSize: "0.75rem", color: "var(--color-safe)", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "4px" }}>
                  Claim Transferred <Check size={14} />
                </span>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
