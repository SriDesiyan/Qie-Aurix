"use client";

import { motion } from "framer-motion";

interface RingProps {
  score: number;
  isScanning?: boolean;
}

export default function AuditRing({ score, isScanning = false }: RingProps) {
  const getThemeColor = (val: number) => {
    if (val >= 90) return "#10b981"; // Safe Green
    if (val >= 75) return "#dfb443"; // Gold
    if (val >= 60) return "#f59e0b"; // Amber
    return "#f43f5e"; // Rose
  };

  const color = getThemeColor(score);

  return (
    <div
      style={{
        position: "relative",
        width: "160px",
        height: "160px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto",
      }}
    >
      {/* Outer Pulse/Radar Ring */}
      <motion.div
        animate={isScanning ? { scale: [1, 1.4], opacity: [0.3, 0] } : { scale: [1, 1.15, 1], opacity: [0.15, 0.3, 0.15] }}
        transition={{
          duration: isScanning ? 1.2 : 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          border: `2px solid ${color}`,
          pointerEvents: "none",
        }}
      />

      {/* Middle Concentric Ring */}
      <div
        style={{
          position: "absolute",
          width: "124px",
          height: "124px",
          borderRadius: "50%",
          border: "1px dashed rgba(255, 255, 255, 0.05)",
          animation: "spin-slow 12s linear infinite",
        }}
      />

      {/* Inner Central Value */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        style={{
          width: "100px",
          height: "100px",
          borderRadius: "50%",
          background: "rgba(3, 6, 18, 0.9)",
          border: `2px solid ${color}50`,
          boxShadow: `0 0 24px ${color}15, inset 0 2px 8px rgba(255,255,255,0.02)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          zIndex: 5,
        }}
      >
        <span style={{ fontSize: "0.6rem", fontWeight: 700, color: "var(--color-text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
          Integrity
        </span>
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "2.125rem",
            fontWeight: 800,
            color: color,
            lineHeight: 1,
          }}
        >
          {score}
        </span>
        <span style={{ fontSize: "0.55rem", color: "var(--color-text-muted)" }}>/100</span>
      </motion.div>
    </div>
  );
}
