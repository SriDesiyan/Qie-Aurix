// ─────────────────────────────────────────────────────────────────────────────
// QIE Aurix — Score Color & Status Mapping
// Maps numeric scores to visual design tokens used throughout the UI
// ─────────────────────────────────────────────────────────────────────────────

import type { ScoreLabel, TrustTier } from "@aurix/core";

export interface ScoreVisual {
  label:       ScoreLabel;
  color:       string;      // CSS hex
  glow:        string;      // CSS rgba for glow effect
  background:  string;      // Card background gradient
  icon:        string;      // Emoji shorthand for quick display
}

export interface TrustVisual {
  tier:        TrustTier;
  color:       string;
  background:  string;
  icon:        string;
  label:       string;
}

// ── Resilience Score visuals ──────────────────────────────────────────────────

const SCORE_VISUALS: Record<ScoreLabel, ScoreVisual> = {
  CRITICAL: {
    label:      "CRITICAL",
    color:      "#ef4444",
    glow:       "rgba(239, 68, 68, 0.35)",
    background: "linear-gradient(135deg, rgba(239,68,68,0.12) 0%, rgba(220,38,38,0.06) 100%)",
    icon:       "🚨",
  },
  WEAK: {
    label:      "WEAK",
    color:      "#f97316",
    glow:       "rgba(249, 115, 22, 0.35)",
    background: "linear-gradient(135deg, rgba(249,115,22,0.12) 0%, rgba(234,88,12,0.06) 100%)",
    icon:       "⚠️",
  },
  MODERATE: {
    label:      "MODERATE",
    color:      "#f59e0b",
    glow:       "rgba(245, 158, 11, 0.35)",
    background: "linear-gradient(135deg, rgba(245,158,11,0.12) 0%, rgba(217,119,6,0.06) 100%)",
    icon:       "🔶",
  },
  STRONG: {
    label:      "STRONG",
    color:      "#22c55e",
    glow:       "rgba(34, 197, 94, 0.35)",
    background: "linear-gradient(135deg, rgba(34,197,94,0.12) 0%, rgba(21,128,61,0.06) 100%)",
    icon:       "✅",
  },
  GUARDIAN: {
    label:      "GUARDIAN",
    color:      "#f5c842",
    glow:       "rgba(245, 200, 66, 0.45)",
    background: "linear-gradient(135deg, rgba(245,200,66,0.15) 0%, rgba(234,179,8,0.08) 100%)",
    icon:       "🛡️",
  },
};

export function getScoreVisual(label: ScoreLabel): ScoreVisual {
  return SCORE_VISUALS[label];
}

export function getScoreVisualByValue(total: number): ScoreVisual {
  if (total <= 200) return SCORE_VISUALS.CRITICAL;
  if (total <= 400) return SCORE_VISUALS.WEAK;
  if (total <= 600) return SCORE_VISUALS.MODERATE;
  if (total <= 800) return SCORE_VISUALS.STRONG;
  return SCORE_VISUALS.GUARDIAN;
}

// ── Trust Tier visuals ────────────────────────────────────────────────────────

const TRUST_VISUALS: Record<TrustTier, TrustVisual> = {
  UNVERIFIED: {
    tier:       "UNVERIFIED",
    color:      "#6b7280",
    background: "rgba(107,114,128,0.15)",
    icon:       "⬜",
    label:      "Unverified",
  },
  BASIC: {
    tier:       "BASIC",
    color:      "#60a5fa",
    background: "rgba(96,165,250,0.15)",
    icon:       "🔵",
    label:      "Basic",
  },
  VERIFIED: {
    tier:       "VERIFIED",
    color:      "#a78bfa",
    background: "rgba(167,139,250,0.15)",
    icon:       "🟣",
    label:      "Verified",
  },
  TRUSTED: {
    tier:       "TRUSTED",
    color:      "#34d399",
    background: "rgba(52,211,153,0.15)",
    icon:       "🟢",
    label:      "Trusted",
  },
  GUARDIAN: {
    tier:       "GUARDIAN",
    color:      "#f5c842",
    background: "rgba(245,200,66,0.15)",
    icon:       "🛡️",
    label:      "Guardian",
  },
};

export function getTrustVisual(tier: TrustTier): TrustVisual {
  return TRUST_VISUALS[tier];
}

// ── Sub-score bar color ───────────────────────────────────────────────────────

export function getSubScoreColor(value: number): string {
  if (value >= 80) return "#22c55e";
  if (value >= 60) return "#f5c842";
  if (value >= 40) return "#f59e0b";
  if (value >= 20) return "#f97316";
  return "#ef4444";
}

// ── Risk severity color ───────────────────────────────────────────────────────

export function getRiskSeverityColor(severity: "INFO" | "WARNING" | "HIGH" | "CRITICAL"): string {
  switch (severity) {
    case "INFO":     return "#60a5fa";
    case "WARNING":  return "#f59e0b";
    case "HIGH":     return "#f97316";
    case "CRITICAL": return "#ef4444";
  }
}
