"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Sliders, ShieldCheck } from "lucide-react";

interface PolicyComposerProps {
  onSave?: (settings: { volatility: number; healthFactor: number; lockDays: number }) => void;
}

export default function PolicyComposer({ onSave }: PolicyComposerProps) {
  const [volatility, setVolatility] = useState(30);
  const [healthFactor, setHealthFactor] = useState(1.4);
  const [lockDays, setLockDays] = useState(90);

  return (
    <div className="aurix-card" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
        <Sliders size={20} style={{ color: "var(--color-gold)" }} />
        <h3>Policy Parameters</h3>
      </div>

      {/* Volatility Threshold */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
          <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-text-secondary)" }}>
            Volatility Shield Threshold
          </span>
          <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--color-gold)" }}>{volatility}% Drawdown</span>
        </div>
        <input
          type="range"
          min="10"
          max="80"
          step="5"
          value={volatility}
          onChange={(e) => setVolatility(Number(e.target.value))}
          style={{
            width: "100%",
            accentColor: "var(--color-gold)",
            height: "4px",
            background: "rgba(255,255,255,0.06)",
            borderRadius: "99px",
            cursor: "pointer",
          }}
        />
        <p style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", marginTop: "4px" }}>
          Automatically triggers QUSDC stable reserve swap if drawdown matches threshold.
        </p>
      </div>

      {/* Health Factor */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
          <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-text-secondary)" }}>
            Lending Guard Health Factor
          </span>
          <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--color-teal)" }}>{healthFactor.toFixed(1)} HF</span>
        </div>
        <input
          type="range"
          min="1.1"
          max="2.5"
          step="0.1"
          value={healthFactor}
          onChange={(e) => setHealthFactor(Number(e.target.value))}
          style={{
            width: "100%",
            accentColor: "var(--color-teal)",
            height: "4px",
            background: "rgba(255,255,255,0.06)",
            borderRadius: "99px",
            cursor: "pointer",
          }}
        />
        <p style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", marginTop: "4px" }}>
          Rebalances/repays active loans to avoid liquidation.
        </p>
      </div>

      {/* Lock Duration */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
          <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-text-secondary)" }}>
            Vault Emergency Time-Lock
          </span>
          <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "#a78bfa" }}>{lockDays} Days</span>
        </div>
        <input
          type="range"
          min="30"
          max="360"
          step="30"
          value={lockDays}
          onChange={(e) => setLockDays(Number(e.target.value))}
          style={{
            width: "100%",
            accentColor: "#a78bfa",
            height: "4px",
            background: "rgba(255,255,255,0.06)",
            borderRadius: "99px",
            cursor: "pointer",
          }}
        />
        <p style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", marginTop: "4px" }}>
          Time duration for locking the emergency vault reserve during warnings.
        </p>
      </div>

      <button
        id="save-policy-composer-btn"
        className="aurix-btn aurix-btn-gold"
        onClick={() => onSave && onSave({ volatility, healthFactor, lockDays })}
        style={{ width: "100%", marginTop: "8px" }}
      >
        <ShieldCheck size={16} /> Save Resilience Policy
      </button>
    </div>
  );
}
