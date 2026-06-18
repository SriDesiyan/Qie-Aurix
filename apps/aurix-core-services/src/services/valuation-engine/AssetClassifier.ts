/**
 * AurixValuationEngine — AssetClassifier
 *
 * Classifies individual assets into risk tiers and exposure categories
 * based on their valuation, volatility, and chain context.
 *
 * The risk classification pattern categorizes assets by assigning tiers
 * based on price stability, liquidity, and market depth. In Aurix, this concept
 * is applied to any ERC-20 asset in a user's portfolio, producing
 * a classification used by the protection and resilience engines.
 *
 * This is purely risk classification for financial resilience purposes.
 */

import type { PortfolioAsset } from "./WalletHealthAnalyzer";

// ── Types ─────────────────────────────────────────────────────────────────────

export type RiskTier =
  | "TIER_1_SAFE"       // Stablecoins, QUSDC — minimal risk
  | "TIER_2_LOW"        // Low-volatility blue-chips (BTC, ETH)
  | "TIER_3_MODERATE"   // Mid-cap assets with moderate volatility
  | "TIER_4_HIGH"       // High-volatility alts
  | "TIER_5_EXTREME";   // Micro-caps, unlisted tokens

export type ExposureCategory =
  | "STABLE_RESERVE"    // Part of the QUSDC/stablecoin emergency reserve
  | "CORE_HOLDING"      // Primary portfolio holdings
  | "SPECULATIVE"       // High-risk, high-reward bets
  | "LOCKED_VAULT"      // Time-locked in Family Vault or Policy Vault
  | "YIELD_BEARING";    // APR-generating positions (lending, staking)

export interface AssetClassification {
  tokenId:       string;
  symbol:        string;
  riskTier:      RiskTier;
  exposure:      ExposureCategory;
  maxSafeWeight: number;  // maximum recommended portfolio weight (basis points)
  riskScore:     number;  // 0 (safe) – 100 (extreme)
  tierRationale: string;
  aurixAction:   "HOLD" | "REDUCE" | "ELIMINATE" | "INCREASE";
}

// ── Classification thresholds ─────────────────────────────────────────────────

const TIER_THRESHOLDS = {
  TIER_1_SAFE:     { maxVol: 0.02, maxRisk: 5,  maxWeight: 8000 },
  TIER_2_LOW:      { maxVol: 0.20, maxRisk: 25, maxWeight: 4000 },
  TIER_3_MODERATE: { maxVol: 0.45, maxRisk: 55, maxWeight: 2000 },
  TIER_4_HIGH:     { maxVol: 0.70, maxRisk: 80, maxWeight: 1000 },
  TIER_5_EXTREME:  { maxVol: 1.00, maxRisk: 100, maxWeight: 300 },
};

// ── AssetClassifier ───────────────────────────────────────────────────────────

export class AssetClassifier {

  /**
   * Classify a single portfolio asset into a risk tier and exposure category.
   */
  static classify(asset: PortfolioAsset): AssetClassification {
    const tier     = this._assignTier(asset);
    const exposure = this._assignExposure(asset);
    const riskScore = this._computeRiskScore(asset, tier);
    const maxWeight = TIER_THRESHOLDS[tier].maxWeight;
    const action    = this._recommendAction(tier, riskScore, asset.isLocked);

    return {
      tokenId:       asset.tokenId,
      symbol:        asset.symbol,
      riskTier:      tier,
      exposure,
      maxSafeWeight: maxWeight,
      riskScore,
      tierRationale: this._explain(asset, tier),
      aurixAction:   action,
    };
  }

  /**
   * Classify a full portfolio and return an exposure summary.
   */
  static classifyPortfolio(assets: PortfolioAsset[]): {
    classifications: AssetClassification[];
    overallRiskScore: number;
    dominantTier: RiskTier;
    eliminationTargets: string[];
    increaseTargets: string[];
  } {
    const classifications = assets.map(a => this.classify(a));
    const total = assets.reduce((s, a) => s + a.valueUsd, 0);

    // Value-weighted overall risk score
    const overallRiskScore = total > 0
      ? Math.round(assets.reduce((s, a, i) =>
          s + (a.valueUsd / total) * classifications[i].riskScore, 0))
      : 0;

    // Most represented tier by value
    const tierValues: Record<RiskTier, number> = {
      TIER_1_SAFE: 0, TIER_2_LOW: 0, TIER_3_MODERATE: 0,
      TIER_4_HIGH: 0, TIER_5_EXTREME: 0,
    };
    assets.forEach((a, i) => {
      tierValues[classifications[i].riskTier] += a.valueUsd;
    });
    const dominantTier = (Object.entries(tierValues)
      .sort(([, a], [, b]) => b - a)[0][0]) as RiskTier;

    return {
      classifications,
      overallRiskScore,
      dominantTier,
      eliminationTargets: classifications.filter(c => c.aurixAction === "ELIMINATE").map(c => c.symbol),
      increaseTargets:    classifications.filter(c => c.aurixAction === "INCREASE").map(c => c.symbol),
    };
  }

  // ── Private helpers ──────────────────────────────────────────────────────────

  private static _assignTier(a: PortfolioAsset): RiskTier {
    if (a.isStable || a.volatility <= 0.02) return "TIER_1_SAFE";
    if (a.volatility <= 0.20)               return "TIER_2_LOW";
    if (a.volatility <= 0.45)               return "TIER_3_MODERATE";
    if (a.volatility <= 0.70)               return "TIER_4_HIGH";
    return "TIER_5_EXTREME";
  }

  private static _assignExposure(a: PortfolioAsset): ExposureCategory {
    if (a.isLocked)           return "LOCKED_VAULT";
    if (a.isStable)           return "STABLE_RESERVE";
    if (a.apr > 0.03)         return "YIELD_BEARING";
    if (a.volatility > 0.5)   return "SPECULATIVE";
    return "CORE_HOLDING";
  }

  private static _computeRiskScore(a: PortfolioAsset, tier: RiskTier): number {
    const base = TIER_THRESHOLDS[tier].maxRisk;
    const volatilityAdj = a.volatility * 20;
    const lockedBonus   = a.isLocked ? -10 : 0;
    return Math.max(0, Math.min(100, Math.round(base + volatilityAdj + lockedBonus)));
  }

  private static _recommendAction(
    tier:     RiskTier,
    risk:     number,
    isLocked: boolean,
  ): AssetClassification["aurixAction"] {
    if (isLocked)            return "HOLD";
    if (tier === "TIER_1_SAFE") return "INCREASE";
    if (risk > 75)           return "ELIMINATE";
    if (risk > 50)           return "REDUCE";
    return "HOLD";
  }

  private static _explain(a: PortfolioAsset, tier: RiskTier): string {
    const tierNames: Record<RiskTier, string> = {
      TIER_1_SAFE:     "Tier 1 — Safe (stablecoin/minimal volatility)",
      TIER_2_LOW:      "Tier 2 — Low risk (blue-chip, <20% volatility)",
      TIER_3_MODERATE: "Tier 3 — Moderate risk (mid-cap, 20–45% volatility)",
      TIER_4_HIGH:     "Tier 4 — High risk (alt-coin, 45–70% volatility)",
      TIER_5_EXTREME:  "Tier 5 — Extreme risk (micro-cap, >70% volatility)",
    };
    return `${a.symbol}: ${tierNames[tier]}`;
  }
}
