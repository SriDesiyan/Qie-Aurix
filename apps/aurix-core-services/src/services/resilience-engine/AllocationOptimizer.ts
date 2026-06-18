/**
 * AurixResilienceEngine — AllocationOptimizer
 *
 * Computes safe allocation weights for a user's portfolio to maximize
 * financial resilience. The weighting logic is inspired by portfolio
 * optimization theory: assets are scored by their contribution to
 * stability, then normalized to a 10,000 basis-point weight sum so the
 * output can be consumed directly by on-chain rebalancing logic.
 *
 * Design pattern: three-phase pipeline
 *   1. Collect asset price/volatility data
 *   2. Score each asset for resilience contribution
 *   3. Normalize weights and return allocation recommendations
 *
 * This is optimization for SAFETY, not yield.
 * Stablecoins (QUSDC) are systematically over-weighted.
 * Volatile assets are systematically under-weighted.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AssetDataPoint {
  tokenId:    string;
  symbol:     string;
  valueUsd:   number;
  volatility: number;   // 30-day price volatility, 0.0 – 1.0
  isStable:   boolean;  // true for QUSDC and other stablecoins
  chainId:    number;
}

export interface AllocationWeight {
  tokenId:       string;
  symbol:        string;
  weightBps:     number;  // basis points: sum must equal 10_000
  safetyScore:   number;  // 0–100 contribution to resilience
  reasoning:     string;
}

export interface AllocationResult {
  weights:              AllocationWeight[];
  stableAllocationPct:  number;   // % in stablecoins
  diversificationScore: number;   // 0–100
  recommendedAction:    string;
  computedAt:           number;   // unix timestamp
}

// ── Safety scoring coefficients ───────────────────────────────────────────────

const STABLE_BASE_WEIGHT   = 4_000;  // stablecoins start at 40% of total
const VOLATILE_PENALTY     = 0.65;   // volatile asset weight multiplied by this
const MIN_STABLE_PCT       = 0.15;   // force at least 15% in stablecoins
const MULTI_CHAIN_BONUS    = 0.05;   // 5% resilience bonus per additional chain

// ── AllocationOptimizer ───────────────────────────────────────────────────────

export class AllocationOptimizer {

  /**
   * Compute safe allocation weights from a list of asset data points.
   *
   * Algorithm (three-phase, adapted from portfolio optimization patterns):
   *   Phase 1: Raw score each asset (stability, value, volatility)
   *   Phase 2: Compute proportional weights summing to 10,000 bps
   *   Phase 3: Enforce minimum stable floor, normalize again
   */
  static optimize(assets: AssetDataPoint[]): AllocationResult {
    if (assets.length === 0) {
      return {
        weights:              [],
        stableAllocationPct:  0,
        diversificationScore: 0,
        recommendedAction:    "No assets detected. Connect QIE Pass to begin.",
        computedAt:           Math.floor(Date.now() / 1000),
      };
    }

    const totalValue = assets.reduce((sum, a) => sum + a.valueUsd, 0);
    if (totalValue === 0) {
      return this._zeroValueResult(assets);
    }

    // Phase 1: Score each asset
    const rawScores = assets.map(a => ({
      ...a,
      rawScore: this._scoreAsset(a, totalValue),
    }));

    const totalRaw = rawScores.reduce((s, a) => s + a.rawScore, 0);

    // Phase 2: Proportional weights (10,000 bps)
    let weights: AllocationWeight[] = rawScores.map(a => ({
      tokenId:     a.tokenId,
      symbol:      a.symbol,
      weightBps:   Math.round((a.rawScore / totalRaw) * 10_000),
      safetyScore: Math.round(Math.min(a.rawScore / totalRaw * 100, 100)),
      reasoning:   this._explain(a),
    }));

    // Phase 3: Enforce minimum stable floor
    weights = this._enforceStableFloor(weights, assets);

    // Normalize to exactly 10,000
    weights = this._normalize(weights);

    const stableWeight = weights
      .filter(w => assets.find(a => a.tokenId === w.tokenId)?.isStable)
      .reduce((s, w) => s + w.weightBps, 0);

    const stableAllocationPct = stableWeight / 100;

    return {
      weights,
      stableAllocationPct,
      diversificationScore: this._diversificationScore(assets, weights),
      recommendedAction:    this._recommendAction(stableAllocationPct),
      computedAt:           Math.floor(Date.now() / 1000),
    };
  }

  // ── Private helpers ──────────────────────────────────────────────────────────

  private static _scoreAsset(a: AssetDataPoint, totalValue: number): number {
    const valueShare   = a.valueUsd / totalValue;
    const stabilityMod = a.isStable ? 1.5 : (1 - a.volatility * VOLATILE_PENALTY);
    return Math.max(valueShare * stabilityMod * 100, 0.01);
  }

  private static _enforceStableFloor(
    weights: AllocationWeight[],
    assets:  AssetDataPoint[],
  ): AllocationWeight[] {
    const stableIds   = new Set(assets.filter(a => a.isStable).map(a => a.tokenId));
    const stableBps   = weights.filter(w => stableIds.has(w.tokenId)).reduce((s, w) => s + w.weightBps, 0);
    const floorBps    = Math.round(MIN_STABLE_PCT * 10_000);

    if (stableBps >= floorBps || stableIds.size === 0) return weights;

    const deficit     = floorBps - stableBps;
    const nonStable   = weights.filter(w => !stableIds.has(w.tokenId));
    const totalNonBps = nonStable.reduce((s, w) => s + w.weightBps, 0);

    return weights.map(w => {
      if (stableIds.has(w.tokenId)) {
        return { ...w, weightBps: w.weightBps + Math.round(deficit / stableIds.size) };
      }
      const reduction = Math.round((w.weightBps / (totalNonBps || 1)) * deficit);
      return { ...w, weightBps: Math.max(w.weightBps - reduction, 0) };
    });
  }

  private static _normalize(weights: AllocationWeight[]): AllocationWeight[] {
    const total = weights.reduce((s, w) => s + w.weightBps, 0);
    if (total === 0 || total === 10_000) return weights;
    const diff  = 10_000 - total;
    // Apply diff to largest weight
    const maxIdx = weights.reduce((mi, w, i) => w.weightBps > weights[mi].weightBps ? i : mi, 0);
    return weights.map((w, i) => i === maxIdx ? { ...w, weightBps: w.weightBps + diff } : w);
  }

  private static _diversificationScore(assets: AssetDataPoint[], weights: AllocationWeight[]): number {
    const chains   = new Set(assets.map(a => a.chainId)).size;
    const herfindahl = weights.reduce((s, w) => s + Math.pow(w.weightBps / 10_000, 2), 0);
    // Herfindahl: 1 = fully concentrated, 0 = perfectly diversified
    const baseScore = Math.round((1 - herfindahl) * 80);
    const chainBonus = Math.round(Math.min((chains - 1) * MULTI_CHAIN_BONUS * 100, 20));
    return Math.min(baseScore + chainBonus, 100);
  }

  private static _explain(a: AssetDataPoint & { rawScore: number }): string {
    if (a.isStable)            return `${a.symbol} is a stablecoin — weighted up for resilience`;
    if (a.volatility > 0.6)   return `${a.symbol} has high volatility (${(a.volatility * 100).toFixed(0)}%) — weighted down`;
    if (a.volatility < 0.2)   return `${a.symbol} has low volatility — good resilience contribution`;
    return `${a.symbol} has moderate volatility — balanced allocation`;
  }

  private static _recommendAction(stablePct: number): string {
    if (stablePct < 10) return "CRITICAL: Swap assets to QUSDC immediately — stablecoin buffer dangerously low";
    if (stablePct < 20) return "Increase QUSDC allocation to at least 20% for adequate protection";
    if (stablePct < 40) return "Stablecoin buffer is adequate. Consider adding cross-chain diversification.";
    return "Allocation is well-balanced for financial resilience.";
  }

  private static _zeroValueResult(assets: AssetDataPoint[]): AllocationResult {
    return {
      weights: assets.map(a => ({ tokenId: a.tokenId, symbol: a.symbol, weightBps: 0, safetyScore: 0, reasoning: "Zero portfolio value" })),
      stableAllocationPct:  0,
      diversificationScore: 0,
      recommendedAction:    "Portfolio value is zero. Fund your wallet to begin resilience optimization.",
      computedAt:           Math.floor(Date.now() / 1000),
    };
  }
}
