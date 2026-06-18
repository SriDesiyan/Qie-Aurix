"use client";

import { Globe } from "lucide-react";

interface DomainBadgeProps {
  domain: string;
}

export default function DomainBadge({ domain }: DomainBadgeProps) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        padding: "6px 14px",
        borderRadius: "var(--radius-md)",
        background: "rgba(223, 180, 67, 0.05)",
        border: "1px solid rgba(223, 180, 67, 0.2)",
        color: "var(--color-gold)",
        fontSize: "0.8125rem",
        fontWeight: 600,
        fontFamily: "var(--font-mono, monospace)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        whiteSpace: "nowrap",
      }}
    >
      <Globe size={14} style={{ opacity: 0.8 }} />
      {domain}
    </span>
  );
}
