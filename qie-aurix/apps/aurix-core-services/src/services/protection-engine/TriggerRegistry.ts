/**
 * AurixProtectionEngine — TriggerRegistry
 *
 * A pluggable condition system for protection automation.
 *
 * The core architectural design decouples trigger logic from vault logic,
 * allowing any condition validator to evaluate safety states.
 *
 * Aurix implementation details:
 * - Triggers are evaluated by the oracle off-chain
 * - Each trigger has a name, evaluator function, and recommended action
 * - The registry is pluggable: new triggers are registered without modifying core
 * - Trigger IDs map 1:1 to ResiliencePolicyVault condition names
 *
 * This is protection AUTOMATION.
 * Triggers defend the user's financial position automatically.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export interface TriggerInput {
  address:         string;
  resilienceScore: number;      // 0–1000
  healthFactor:    number;      // lending health factor (e.g., 1.5)
  stablecoinPct:   number;      // 0.0 – 1.0
  volatility30d:   number;      // portfolio 30d volatility
  chainCount:      number;      // number of chains with >$10 balance
  guardianActive:  boolean;
}

export type TriggerSeverity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
export type ProtectionAction =
  | "ACTIVATE_EMERGENCY_LOCK"
  | "SWAP_TO_QUSDC"
  | "NOTIFY_HEIRS"
  | "ANCHOR_AUDIT"
  | "REBALANCE_PORTFOLIO"
  | "NONE";

export interface TriggerDefinition {
  id:                string;
  name:              string;
  description:       string;
  severity:          TriggerSeverity;
  recommendedAction: ProtectionAction;
  /** Returns true if this trigger's condition is met */
  evaluate:          (input: TriggerInput) => boolean;
  /** Human-readable explanation when trigger fires */
  explain:           (input: TriggerInput) => string;
}

export interface FiredTrigger {
  triggerId:         string;
  triggerName:       string;
  severity:          TriggerSeverity;
  recommendedAction: ProtectionAction;
  explanation:       string;
  firedAt:           number;
}

// ── Built-in triggers ─────────────────────────────────────────────────────────
// Built-in triggers monitor standard financial health variables:
//   VOLATILITY_SPIKE      → Portfolio volatility spikes
//   HEALTH_FACTOR         → Lending health factor drops
//   STABLECOIN_DEPLETION  → Stablecoin allocation levels
//   CHAIN_CONCENTRATION   → Single chain asset concentration

const BUILTIN_TRIGGERS: TriggerDefinition[] = [
  {
    id:          "RESILIENCE_SCORE_CRITICAL",
    name:        "Critical Resilience Score",
    description: "Resilience Score has dropped below the critical threshold of 300/1000",
    severity:    "CRITICAL",
    recommendedAction: "ACTIVATE_EMERGENCY_LOCK",
    evaluate: ({ resilienceScore }) => resilienceScore < 300,
    explain:  ({ resilienceScore }) =>
      `Resilience Score is ${resilienceScore}/1000 — emergency reserve lock recommended`,
  },
  {
    id:          "HEALTH_FACTOR_DANGER",
    name:        "Lending Health Factor Critical",
    description: "Lending position health factor has fallen below 1.2 — liquidation imminent",
    severity:    "CRITICAL",
    recommendedAction: "SWAP_TO_QUSDC",
    evaluate: ({ healthFactor }) => healthFactor > 0 && healthFactor < 1.2,
    explain:  ({ healthFactor }) =>
      `Health factor is ${healthFactor.toFixed(2)} — liquidation risk is critical. Immediate rebalancing required.`,
  },
  {
    id:          "HEALTH_FACTOR_WARNING",
    name:        "Lending Health Factor Low",
    description: "Health factor approaching danger zone",
    severity:    "HIGH",
    recommendedAction: "REBALANCE_PORTFOLIO",
    evaluate: ({ healthFactor }) => healthFactor >= 1.2 && healthFactor < 1.5,
    explain:  ({ healthFactor }) =>
      `Health factor is ${healthFactor.toFixed(2)} — approaching liquidation zone (threshold: 1.0)`,
  },
  {
    id:          "VOLATILITY_SPIKE",
    name:        "Portfolio Volatility Spike",
    description: "30-day portfolio volatility exceeds 60% — high market stress",
    severity:    "HIGH",
    recommendedAction: "SWAP_TO_QUSDC",
    evaluate: ({ volatility30d, stablecoinPct }) => volatility30d > 0.6 && stablecoinPct < 0.2,
    explain:  ({ volatility30d, stablecoinPct }) =>
      `Portfolio volatility is ${(volatility30d * 100).toFixed(0)}% with only ${(stablecoinPct * 100).toFixed(0)}% in stablecoins`,
  },
  {
    id:          "STABLECOIN_DEPLETION",
    name:        "Stablecoin Buffer Depleted",
    description: "QUSDC allocation has fallen below 5% — resilience buffer critically low",
    severity:    "HIGH",
    recommendedAction: "SWAP_TO_QUSDC",
    evaluate: ({ stablecoinPct }) => stablecoinPct < 0.05,
    explain:  ({ stablecoinPct }) =>
      `Stablecoin allocation is ${(stablecoinPct * 100).toFixed(1)}% — below the 5% safety minimum`,
  },
  {
    id:          "CHAIN_CONCENTRATION",
    name:        "Single-Chain Concentration",
    description: "All assets are on a single chain — chain failure would be catastrophic",
    severity:    "MEDIUM",
    recommendedAction: "REBALANCE_PORTFOLIO",
    evaluate: ({ chainCount }) => chainCount === 1,
    explain:  () =>
      "All assets are on a single chain. A chain outage or exploit would affect your entire portfolio.",
  },
  {
    id:          "GUARDIAN_INACTIVE_RISK",
    name:        "Guardian Mode Not Active",
    description: "Guardian Mode is not active despite a significant portfolio",
    severity:    "MEDIUM",
    recommendedAction: "NONE",
    evaluate: ({ guardianActive, resilienceScore }) => !guardianActive && resilienceScore < 600,
    explain:  ({ resilienceScore }) =>
      `Guardian Mode is inactive and Resilience Score is ${resilienceScore}/1000 — activate for full protection`,
  },
];

// ── TriggerRegistry ───────────────────────────────────────────────────────────

export class TriggerRegistry {
  private triggers: TriggerDefinition[] = [...BUILTIN_TRIGGERS];

  /**
   * Register a custom trigger. Custom triggers are appended after builtins.
   * Trigger IDs must be unique.
   */
  register(trigger: TriggerDefinition): void {
    if (this.triggers.some(t => t.id === trigger.id)) {
      throw new Error(`Trigger ${trigger.id} is already registered`);
    }
    this.triggers.push(trigger);
  }

  /**
   * Evaluate all registered triggers against the current state.
   * Returns only the triggers that have fired, sorted by severity.
   */
  evaluate(input: TriggerInput): FiredTrigger[] {
    const fired: FiredTrigger[] = this.triggers
      .filter(t => t.evaluate(input))
      .map(t => ({
        triggerId:         t.id,
        triggerName:       t.name,
        severity:          t.severity,
        recommendedAction: t.recommendedAction,
        explanation:       t.explain(input),
        firedAt:           Math.floor(Date.now() / 1000),
      }));

    return fired.sort((a, b) => this._severityOrder(a.severity) - this._severityOrder(b.severity));
  }

  getAllTriggers(): Omit<TriggerDefinition, "evaluate" | "explain">[] {
    return this.triggers.map(({ id, name, description, severity, recommendedAction }) =>
      ({ id, name, description, severity, recommendedAction })
    );
  }

  private _severityOrder(s: TriggerSeverity): number {
    return { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }[s];
  }
}

// Singleton for use throughout the oracle service
export const triggerRegistry = new TriggerRegistry();
