/**
 * AurixValuationEngine — WalletHealthAnalyzer
 *
 * Computes a composite Wallet Health Score from on-chain portfolio data.
 *
 * The oracle-driven asset valuation loop runs off-chain in the oracle service
 * to periodically analyze portfolio risk metrics and calculate scores.
 *
 * Four sub-scores are computed (each 0–100):
 *   1. Liquidity Score     — how much is in liquid, accessible assets
 *   2. Concentration Score — inverse of Herfindahl concentration index
 *   3. Stability Score     — proportion of stablecoins + low-volatility assets
 *   4. Coverage Score      — how well-covered the portfolio is across chains
 *
 * Combined → Wallet Health Score (0–1000)
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export interface PortfolioAsset {
  tokenId:      string;
  symbol:       string;
  valueUsd:     number;
  isLiquid:     boolean;   // can be sold/swapped within 1 block
  isStable:     boolean;
  isLocked:     boolean;   // time-locked in a vault
  volatility:   number;    // 0.0–1.0
  chainId:      number;
  apr:          number;    // 0.0–1.0 (for yield-bearing assets)
}

export interface WalletHealthBreakdown {
  liquidityScore:     number;   // 0–100
  concentrationScore: number;   // 0–100
  stabilityScore:     number;   // 0–100
  coverageScore:      number;   // 0–100
  compositeScore:     number;   // 0–1000 (weighted)
  totalValueUsd:      number;
  liquidValueUsd:     number;
  stableValueUsd:     number;
  lockedValueUsd:     number;
  chainCount:         number;
  assetCount:         number;
  scoreBand:          "CRITICAL" | "POOR" | "FAIR" | "GOOD" | "EXCELLENT";
  insights:           string[];
}

// ── Sub-score weights ─────────────────────────────────────────────────────────
const W_LIQUIDITY     = 0.30;
const W_CONCENTRATION = 0.25;
const W_STABILITY     = 0.30;
const W_COVERAGE      = 0.15;

// ── WalletHealthAnalyzer ──────────────────────────────────────────────────────

export class WalletHealthAnalyzer {

  /**
   * Compute a full wallet health breakdown from a list of portfolio assets.
   *
   * Evaluates portfolio data to produce Aurix's composite Wallet Health Score.
   */
  static analyze(assets: PortfolioAsset[]): WalletHealthBreakdown {
    if (assets.length === 0) {
      return this._emptyResult();
    }

    const total     = assets.reduce((s, a) => s + a.valueUsd, 0);
    const liquid    = assets.filter(a => a.isLiquid && !a.isLocked).reduce((s, a) => s + a.valueUsd, 0);
    const stable    = assets.filter(a => a.isStable).reduce((s, a) => s + a.valueUsd, 0);
    const locked    = assets.filter(a => a.isLocked).reduce((s, a) => s + a.valueUsd, 0);
    const chains    = new Set(assets.map(a => a.chainId));

    const liquidityScore     = total > 0 ? Math.round((liquid / total) * 100) : 0;
    const concentrationScore = this._concentrationScore(assets, total);
    const stabilityScore     = total > 0 ? Math.round((stable / total) * 100) : 0;
    const coverageScore      = this._coverageScore(assets, chains.size);

    const composite = Math.round(
      (liquidityScore     * W_LIQUIDITY     +
       concentrationScore * W_CONCENTRATION +
       stabilityScore     * W_STABILITY     +
       coverageScore      * W_COVERAGE) * 10
    );

    return {
      liquidityScore,
      concentrationScore,
      stabilityScore,
      coverageScore,
      compositeScore:  Math.min(composite, 1000),
      totalValueUsd:   total,
      liquidValueUsd:  liquid,
      stableValueUsd:  stable,
      lockedValueUsd:  locked,
      chainCount:      chains.size,
      assetCount:      assets.length,
      scoreBand:       this._scoreBand(composite),
      insights:        this._generateInsights(liquidityScore, concentrationScore, stabilityScore, coverageScore, total, locked),
    };
  }

  private static _concentrationScore(assets: PortfolioAsset[], total: number): number {
    if (total === 0 || assets.length === 0) return 0;
    // Herfindahl-Hirschman Index: sum of squared shares
    const hhi = assets.reduce((s, a) => s + Math.pow(a.valueUsd / total, 2), 0);
    // HHI of 1.0 = fully concentrated (score 0), 0 = perfectly spread (score 100)
    return Math.round((1 - hhi) * 100);
  }

  private static _coverageScore(assets: PortfolioAsset[], chainCount: number): number {
    // Multi-chain presence: 1 chain = 40, 2 = 65, 3 = 85, 4+ = 100
    const chainBase  = Math.min(Math.round(40 + (chainCount - 1) * 20), 100);
    // Penalize if > 80% locked
    const lockRatio  = assets.filter(a => a.isLocked).length / assets.length;
    const lockPenalty = lockRatio > 0.8 ? 20 : 0;
    return Math.max(chainBase - lockPenalty, 0);
  }

  private static _scoreBand(composite: number): WalletHealthBreakdown["scoreBand"] {
    if (composite < 200) return "CRITICAL";
    if (composite < 400) return "POOR";
    if (composite < 600) return "FAIR";
    if (composite < 800) return "GOOD";
    return "EXCELLENT";
  }

  private static _generateInsights(
    liq: number, conc: number, stab: number, cov: number,
    total: number, locked: number
  ): string[] {
    const insights: string[] = [];
    if (liq  < 30) insights.push("Low liquidity — most assets are locked or illiquid");
    if (conc < 40) insights.push("High concentration risk — portfolio dominated by one asset");
    if (stab < 20) insights.push("Stablecoin allocation is very low — consider increasing QUSDC position");
    if (cov  < 60) insights.push("Single-chain exposure — bridge assets for resilience");
    if (locked / (total || 1) > 0.5) insights.push("Over 50% of portfolio is locked — ensure vault access is properly configured");
    if (insights.length === 0) insights.push("Portfolio health looks good. Activate Guardian Mode to maintain protection.");
    return insights;
  }

  private static _emptyResult(): WalletHealthBreakdown {
    return {
      liquidityScore: 0, concentrationScore: 0, stabilityScore: 0, coverageScore: 0,
      compositeScore: 0, totalValueUsd: 0, liquidValueUsd: 0, stableValueUsd: 0,
      lockedValueUsd: 0, chainCount: 0, assetCount: 0, scoreBand: "CRITICAL",
      insights: ["No portfolio data found. Connect QIE Pass to begin analysis."],
    };
  }
}
