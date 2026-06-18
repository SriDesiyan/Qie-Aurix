/**
 * AurixResilienceEngine — ResilienceRebalancer
 *
 * Generates concrete rebalancing suggestions to move a user's portfolio
 * toward the target allocation produced by AllocationOptimizer.
 *
 * Each suggestion is an actionable step: "swap X of TokenA to QUSDC"
 * linked to the specific QIE DEX action type the frontend can execute.
 *
 * Pattern: mirrors the Vault.rebalance() two-pass approach (sell → buy),
 * adapted for Aurix's QIE DEX context instead of Uniswap V2.
 */

import type { AllocationResult, AllocationWeight, AssetDataPoint } from "./AllocationOptimizer";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface RebalanceStep {
  stepIndex:   number;
  action:      "SWAP_TO_QUSDC" | "SWAP_FROM_QUSDC" | "BRIDGE" | "HOLD";
  fromToken:   string;
  toToken:     string;
  amountUsd:   number;
  priority:    "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  reasoning:   string;
  estimatedGas: number;  // in USD
}

export interface RebalancePlan {
  steps:               RebalanceStep[];
  totalActionsNeeded:  number;
  estimatedTotalGas:   number;
  projectedStablePct:  number;   // after rebalance
  projectedScore:      number;   // projected Resilience Score improvement
  isRebalanceNeeded:   boolean;
}

// ── Gas estimates (demo values in USD) ────────────────────────────────────────

const GAS_SWAP    = 2.40;
const GAS_BRIDGE  = 5.80;
const TOLERANCE   = 200;   // 200 bps = 2% — don't suggest swaps below this

// ── ResilienceRebalancer ──────────────────────────────────────────────────────

export class ResilienceRebalancer {

  /**
   * Generate a step-by-step rebalancing plan.
   *
   * Two-pass approach (from Vault.rebalance() pattern):
   *   Pass 1: Identify over-allocated volatile assets → swap to QUSDC
   *   Pass 2: Distribute QUSDC to under-allocated stable positions
   */
  static generatePlan(
    current: AssetDataPoint[],
    target:  AllocationResult,
  ): RebalancePlan {
    const totalValue = current.reduce((s, a) => s + a.valueUsd, 0);
    if (totalValue === 0) {
      return { steps: [], totalActionsNeeded: 0, estimatedTotalGas: 0,
               projectedStablePct: 0, projectedScore: 0, isRebalanceNeeded: false };
    }

    // Current bps per token
    const currentBps = new Map<string, number>(
      current.map(a => [a.tokenId, Math.round((a.valueUsd / totalValue) * 10_000)])
    );

    const steps: RebalanceStep[] = [];

    // Pass 1: Sell over-allocated volatile assets
    for (const tw of target.weights) {
      const cur     = currentBps.get(tw.tokenId) ?? 0;
      const diff    = cur - tw.weightBps;
      const asset   = current.find(a => a.tokenId === tw.tokenId);
      if (!asset || diff <= TOLERANCE || asset.isStable) continue;

      const amountUsd = (diff / 10_000) * totalValue;
      steps.push({
        stepIndex:    steps.length,
        action:       "SWAP_TO_QUSDC",
        fromToken:    tw.symbol,
        toToken:      "QUSDC",
        amountUsd,
        priority:     asset.volatility > 0.5 ? "HIGH" : "MEDIUM",
        reasoning:    `${tw.symbol} is ${(diff / 100).toFixed(1)}% over target — reduce exposure to QUSDC`,
        estimatedGas: GAS_SWAP,
      });
    }

    // Pass 2: Buy under-allocated positions from stable buffer
    for (const tw of target.weights) {
      const cur     = currentBps.get(tw.tokenId) ?? 0;
      const diff    = tw.weightBps - cur;
      const asset   = current.find(a => a.tokenId === tw.tokenId);
      if (!asset || diff <= TOLERANCE || !asset.isStable) continue;

      const amountUsd = (diff / 10_000) * totalValue;
      steps.push({
        stepIndex:    steps.length,
        action:       "SWAP_FROM_QUSDC",
        fromToken:    "QUSDC",
        toToken:      tw.symbol,
        amountUsd,
        priority:     "LOW",
        reasoning:    `Increase ${tw.symbol} stable buffer by ${(diff / 100).toFixed(1)}%`,
        estimatedGas: GAS_SWAP,
      });
    }

    // Suggest bridging if all assets are on one chain
    const chains = new Set(current.map(a => a.chainId));
    if (chains.size === 1 && current.length > 0) {
      steps.push({
        stepIndex:    steps.length,
        action:       "BRIDGE",
        fromToken:    "QUSDC",
        toToken:      "QUSDC",
        amountUsd:    totalValue * 0.1,
        priority:     "MEDIUM",
        reasoning:    "All assets on one chain — bridge 10% to diversify chain risk",
        estimatedGas: GAS_BRIDGE,
      });
    }

    steps.sort((a, b) => this._priorityOrder(a.priority) - this._priorityOrder(b.priority));

    const totalGas = steps.reduce((s, st) => s + st.estimatedGas, 0);

    return {
      steps,
      totalActionsNeeded:  steps.length,
      estimatedTotalGas:   totalGas,
      projectedStablePct:  target.stableAllocationPct,
      projectedScore:      Math.min(target.diversificationScore * 10, 1000),
      isRebalanceNeeded:   steps.length > 0,
    };
  }

  private static _priorityOrder(p: RebalanceStep["priority"]): number {
    return { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }[p];
  }
}
