"use client";

interface StatusPillProps {
  status: "safe" | "warning" | "critical" | "info" | "gold" | "active" | "inactive";
  label: string;
}

export default function StatusPill({ status, label }: StatusPillProps) {
  const getColors = () => {
    switch (status) {
      case "safe":
      case "active":
        return { bg: "var(--color-safe-dim)", border: "rgba(16,185,129,0.3)", text: "var(--color-safe)" };
      case "warning":
        return { bg: "var(--color-amber-dim)", border: "rgba(245,158,11,0.3)", text: "var(--color-amber)" };
      case "critical":
        return { bg: "var(--color-critical-dim)", border: "rgba(244,63,94,0.3)", text: "var(--color-critical)" };
      case "gold":
        return { bg: "var(--color-gold-dim)", border: "rgba(223,180,67,0.3)", text: "var(--color-gold)" };
      case "inactive":
        return { bg: "rgba(255,255,255,0.02)", border: "rgba(255,255,255,0.05)", text: "var(--color-text-secondary)" };
      default:
        return { bg: "rgba(0,245,212,0.08)", border: "rgba(0,245,212,0.25)", text: "#00f5d4" };
    }
  };

  const theme = getColors();

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "4px 12px",
        borderRadius: "var(--radius-full)",
        fontSize: "0.6875rem",
        fontWeight: 700,
        letterSpacing: "0.05em",
        textTransform: "uppercase",
        background: theme.bg,
        border: `1px solid ${theme.border}`,
        color: theme.text,
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          background: theme.text,
        }}
      />
      {label}
    </span>
  );
}
