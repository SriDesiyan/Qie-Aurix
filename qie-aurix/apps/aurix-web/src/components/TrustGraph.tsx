"use client";

import { motion } from "framer-motion";
import { UserCheck, Shield, Users, Network } from "lucide-react";

interface GraphProps {
  identityTrust: number;
  validatorParticipation: number;
  communityContribution: number;
  onChainReliability: number;
  composite: number;
}

export default function TrustGraph({
  identityTrust,
  validatorParticipation,
  communityContribution,
  onChainReliability,
  composite,
}: GraphProps) {
  const nodes = [
    { label: "Identity", value: identityTrust, icon: UserCheck, color: "#00f5d4", angle: 45 },
    { label: "Validator", value: validatorParticipation, icon: Shield, color: "#dfb443", angle: 135 },
    { label: "Community", value: communityContribution, icon: Users, color: "#06b6d4", angle: 225 },
    { label: "Reliability", value: onChainReliability, icon: Network, color: "#a78bfa", angle: 315 },
  ];

  return (
    <div
      style={{
        position: "relative",
        height: "260px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        maxWidth: "400px",
        margin: "0 auto",
      }}
    >
      {/* Connected Lines SVG Layer */}
      <svg
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
      >
        {nodes.map((node, i) => {
          const radius = 95;
          const rad = (node.angle * Math.PI) / 180;
          const x2 = 200 + radius * Math.cos(rad);
          const y2 = 130 + radius * Math.sin(rad);

          return (
            <g key={i}>
              {/* Pulsing connection line */}
              <line
                x1="200"
                y1="130"
                x2={x2}
                y2={y2}
                stroke={node.color}
                strokeWidth="1.5"
                strokeOpacity="0.25"
                strokeDasharray="4 4"
              />
              {/* Luminous particle traveling down the line */}
              <motion.circle
                r="3"
                fill={node.color}
                initial={{ cx: 200, cy: 130 }}
                animate={{ cx: x2, cy: y2 }}
                transition={{
                  duration: 2 + i * 0.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{ filter: `drop-shadow(0 0 4px ${node.color})` }}
              />
            </g>
          );
        })}
      </svg>

      {/* Central Identity / Pass Node */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        style={{
          width: "90px",
          height: "90px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(7, 14, 37, 0.95) 0%, rgba(2, 4, 10, 0.95) 100%)",
          border: "2px solid rgba(0, 245, 212, 0.4)",
          boxShadow: "0 0 30px rgba(0, 245, 212, 0.25), inset 0 2px 8px rgba(255,255,255,0.05)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10,
          cursor: "pointer",
        }}
      >
        <span style={{ fontSize: "0.625rem", fontWeight: 700, color: "var(--color-text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>QIE Pass</span>
        <span style={{ fontFamily: "var(--font-display)", fontSize: "1.45rem", fontWeight: 800, color: "#00f5d4", lineHeight: 1.1 }}>
          {composite.toFixed(0)}
        </span>
        <span style={{ fontSize: "0.55rem", color: "var(--color-text-muted)" }}>COMPOSITE</span>
      </motion.div>

      {/* Connected Subnodes */}
      {nodes.map((node, i) => {
        const radius = 95;
        const rad = (node.angle * Math.PI) / 180;
        const left = `calc(50% + ${radius * Math.cos(rad)}px)`;
        const top = `calc(50% + ${radius * Math.sin(rad)}px)`;
        const Icon = node.icon;

        return (
          <motion.div
            key={node.label}
            whileHover={{ y: -3 }}
            style={{
              position: "absolute",
              left,
              top,
              transform: "translate(-50%, -50%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              zIndex: 5,
            }}
          >
            {/* Small Node Icon */}
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "50%",
                background: "rgba(3, 6, 18, 0.85)",
                border: `1.5px solid ${node.color}50`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: node.color,
                boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
                cursor: "pointer",
              }}
            >
              <Icon size={18} />
            </div>

            {/* Score Label Under Node */}
            <span
              style={{
                fontSize: "0.6875rem",
                color: "var(--color-text-secondary)",
                fontWeight: 600,
                marginTop: "4px",
                background: "rgba(2, 4, 10, 0.85)",
                padding: "2px 8px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid rgba(255,255,255,0.03)",
                whiteSpace: "nowrap",
              }}
            >
              {node.label}: <strong style={{ color: node.color }}>{node.value}</strong>
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}
