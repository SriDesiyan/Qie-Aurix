"use client";

import { motion } from "framer-motion";
import { ShieldCheck, RefreshCw, Layers, CircleDollarSign, Compass } from "lucide-react";

interface Metric {
  value: number;
  label: string;
  reason: string;
}

interface BreakdownProps {
  assetStability: Metric;
  recoveryReadiness: Metric;
  contractIntegrity: Metric;
  stablecoinBuffer: Metric;
  chainBreadth: Metric;
}

export default function ScoreBreakdownGrid({
  assetStability,
  recoveryReadiness,
  contractIntegrity,
  stablecoinBuffer,
  chainBreadth,
}: BreakdownProps) {
  const metrics = [
    { ...assetStability, icon: ShieldCheck, color: "#10b981" },
    { ...recoveryReadiness, icon: RefreshCw, color: "#00f5d4" },
    { ...contractIntegrity, icon: Layers, color: "#06b6d4" },
    { ...stablecoinBuffer, icon: CircleDollarSign, color: "#dfb443" },
    { ...chainBreadth, icon: Compass, color: "#a78bfa" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", width: "100%" }}>
      {metrics.map((metric, i) => {
        const Icon = metric.icon;

        return (
          <div
            key={metric.label}
            style={{
              padding: "14px 18px",
              background: "rgba(255, 255, 255, 0.01)",
              border: "1px solid rgba(255, 255, 255, 0.03)",
              borderRadius: "var(--radius-md)",
              transition: "all 0.25s ease",
            }}
          >
            {/* Header info */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "30px",
                    height: "30px",
                    borderRadius: "8px",
                    background: `${metric.color}10`,
                    border: `1px solid ${metric.color}25`,
                    color: metric.color,
                  }}
                >
                  <Icon size={16} />
                </div>
                <div>
                  <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--color-text-primary)" }}>{metric.label}</span>
                  <span style={{ display: "block", fontSize: "0.6875rem", color: "var(--color-text-muted)", marginTop: "1px" }}>{metric.reason}</span>
                </div>
              </div>
              <span style={{ fontSize: "0.875rem", fontWeight: 800, color: metric.color }}>{metric.value}</span>
            </div>

            {/* Progress Bar */}
            <div className="progress-track">
              <motion.div
                className="progress-fill"
                style={{ background: `linear-gradient(90deg, ${metric.color}75 0%, ${metric.color} 100%)` }}
                initial={{ width: 0 }}
                animate={{ width: `${metric.value}%` }}
                transition={{ duration: 1.2, delay: 0.2 + i * 0.1, ease: "easeOut" }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
