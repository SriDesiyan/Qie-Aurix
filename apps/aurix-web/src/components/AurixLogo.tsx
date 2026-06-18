"use client";

import { motion } from "framer-motion";

interface LogoProps {
  variant?: "emblem" | "wordmark" | "badge";
  size?: number;
  glow?: boolean;
}

export default function AurixLogo({ variant = "wordmark", size = 40, glow = true }: LogoProps) {
  // Shield emblem path with dynamic geometric symmetry and an "A" / Vault crest motif.
  const emblemSvg = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        filter: glow ? "drop-shadow(0 0 8px rgba(223,180,67,0.35))" : "none",
        transition: "filter 0.3s ease",
      }}
    >
      {/* Outer Shield Outline */}
      <path
        d="M50 12 C62 12, 82 17, 85 24 C87 31, 85 64, 50 88 C15 64, 13 31, 15 24 C18 17, 38 12, 50 12 Z"
        stroke="url(#goldGradient)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Inner Vault / Crest Lines */}
      <path
        d="M50 24 L72 42 L65 47 L50 34 L35 47 L28 42 L50 24 Z"
        fill="url(#goldGradient)"
      />
      {/* The Central "A" Motif */}
      <path
        d="M50 36 L68 64 H57 L50 49 L43 64 H32 L50 36 Z"
        fill="url(#goldGradient)"
      />
      {/* Lower Protective Seal */}
      <path
        d="M42 54 H58 L50 68 L42 54 Z"
        fill="url(#tealGradient)"
      />
      {/* Definitions for Premium Gradients */}
      <defs>
        <linearGradient id="goldGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffd875" />
          <stop offset="50%" stopColor="#dfb443" />
          <stop offset="100%" stopColor="#b38e2d" />
        </linearGradient>
        <linearGradient id="tealGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00f5d4" />
          <stop offset="100%" stopColor="#00b4d8" />
        </linearGradient>
      </defs>
    </svg>
  );

  if (variant === "emblem") {
    return emblemSvg;
  }

  if (variant === "badge") {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: size * 1.5,
          height: size * 1.5,
          borderRadius: "30%",
          background: "linear-gradient(135deg, rgba(223, 180, 67, 0.15), rgba(7, 14, 37, 0.4))",
          border: "1px solid rgba(223, 180, 67, 0.25)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.5), inset 0 2px 8px rgba(255,255,255,0.05)",
        }}
      >
        {emblemSvg}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      {emblemSvg}
      <div style={{ display: "flex", flexDirection: "column", justifyItems: "center" }}>
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: `${size * 0.42}px`,
            letterSpacing: "-0.01em",
            lineHeight: 1.1,
            color: "var(--color-text-primary)",
          }}
        >
          QIE <span className="text-gold-gradient">Aurix</span>
        </span>
        <span
          style={{
            fontSize: `${size * 0.18}px`,
            color: "var(--color-text-secondary)",
            letterSpacing: "0.08em",
            fontWeight: 500,
            textTransform: "uppercase",
            lineHeight: 1,
            marginTop: "1px",
          }}
        >
          Resilience Guardian
        </span>
      </div>
    </div>
  );
}
