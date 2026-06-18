// ─────────────────────────────────────────────────────────────────────────────
// QIE Aurix — Financial Resilience Score Engine
// Computes a 0–1000 Resilience Score from a financial profile.
// Each sub-score is independently explainable.
// ─────────────────────────────────────────────────────────────────────────────

import type { FinancialProfile, ResilienceScore, SubScore, ScoreLabel } from "@aurix/core";
import { FINANCIAL_SCORE_WEIGHTS, SCORE_THRESHOLDS } from "@aurix/core";

// ── Sub-score calculators ─────────────────────────────────────────────────────

function scoreAssetStability(profile: FinancialProfile): SubScore {
  const { totalValueUsd, stablecoinRatio, lendingPositions } = profile;

  // Penalize concentrated lending risk
  const worstHealthFactor = lendingPositions.length > 0
    ? Math.min(...lendingPositions.map((p) => p.healthFactor))
    : 2.0;

  const healthScore   = Math.min(worstHealthFactor / 2.0, 1.0) * 40;
  const stabilityBase = Math.min(totalValueUsd / 10_000, 1.0) * 30;
  const stableBonus   = stablecoinRatio * 30;

  const value = Math.round(healthScore + stabilityBase + stableBonus);

  let reason = "Portfolio appears stable";
  if (worstHealthFactor < 1.2) reason = "Critical lending health factor — liquidation risk";
  else if (worstHealthFactor < 1.5) reason = "Lending position approaching unsafe territory";
  else if (stablecoinRatio < 0.10) reason = "Very low stablecoin allocation";
  else if (totalValueUsd < 1000) reason = "Small portfolio — limited resilience buffer";

  return { value, maxValue: 100, label: "Asset Stability", reason, weight: FINANCIAL_SCORE_WEIGHTS.assetStability };
}

function scoreRecoveryReadiness(profile: FinancialProfile): SubScore {
  const { recoveryReadiness } = profile;

  let value = 0;
  if (recoveryReadiness.hasRecoveryVault) value += 60;
  if (recoveryReadiness.vaultBalanceUsd > 500) value += 20;
  if (recoveryReadiness.vaultBalanceUsd > 2000) value += 10;

  // Freshness bonus
  const daysSinceVerified = (Date.now() / 1000 - recoveryReadiness.lastVerifiedAt) / 86400;
  if (daysSinceVerified < 30) value += 10;

  value = Math.min(value, 100);

  const reason = !recoveryReadiness.hasRecoveryVault
    ? "No recovery vault configured — mis-transferred funds cannot be recovered"
    : recoveryReadiness.vaultBalanceUsd < 500
      ? "Recovery vault balance is low"
      : daysSinceVerified > 90
        ? "Recovery vault not verified recently"
        : "Recovery protection is active and healthy";

  return { value, maxValue: 100, label: "Recovery Readiness", reason, weight: FINANCIAL_SCORE_WEIGHTS.recoveryReadiness };
}

function scoreContractIntegrity(profile: FinancialProfile): SubScore {
  // Base score — would be enriched by actual SafetyAuditAnchor data
  // For MVP: inferred from lending position age and tx history
  const hasLending = profile.lendingPositions.length > 0;
  const avgLendingAge = hasLending
    ? profile.lendingPositions.reduce((acc, p) => acc + (p.healthFactor > 1.5 ? 1 : 0), 0) / profile.lendingPositions.length
    : 0;

  const value = Math.round(60 + avgLendingAge * 25 + (hasLending ? 15 : 0));
  const capped = Math.min(value, 100);

  const reason = capped > 80
    ? "Active contracts appear healthy with no known vulnerabilities"
    : "Limited contract interaction history — integrity assessment partial";

  return { value: capped, maxValue: 100, label: "Contract Integrity", reason, weight: FINANCIAL_SCORE_WEIGHTS.contractIntegrity };
}

function scoreStablecoinBuffer(profile: FinancialProfile): SubScore {
  const ratio = profile.stablecoinRatio;

  // Optimal range: 15–40% stable
  let value: number;
  if (ratio < 0.05)       value = 10;
  else if (ratio < 0.10)  value = 30;
  else if (ratio < 0.15)  value = 55;
  else if (ratio < 0.40)  value = 90 + Math.round((ratio - 0.15) / 0.25 * 10);  // peak
  else if (ratio < 0.60)  value = 80;  // over-conservative
  else                    value = 60;  // too stable, low growth

  value = Math.min(value, 100);

  const reason = ratio < 0.05
    ? "Critically low stablecoin buffer — high volatility exposure"
    : ratio < 0.10
      ? "Low stablecoin buffer — recommend QUSDC allocation"
      : ratio > 0.60
        ? "Portfolio is over-conservative — consider productive allocation"
        : "Stablecoin buffer is within healthy range";

  return { value, maxValue: 100, label: "Stablecoin Buffer", reason, weight: FINANCIAL_SCORE_WEIGHTS.stablecoinBuffer };
}

function scoreChainBreadth(profile: FinancialProfile): SubScore {
  const { chainSpread } = profile;
  const activeChains = chainSpread.filter((c) => c.valueUsd > 10).length;

  let value: number;
  if (activeChains === 0) value = 0;
  else if (activeChains === 1) value = 40;
  else if (activeChains === 2) value = 70;
  else if (activeChains === 3) value = 88;
  else value = 100;

  const reason = activeChains === 0
    ? "No chain activity detected"
    : activeChains === 1
      ? "Assets concentrated on a single chain — consider multi-chain spread"
      : `Active on ${activeChains} chains — good resilience spread`;

  return { value, maxValue: 100, label: "Chain Breadth", reason, weight: FINANCIAL_SCORE_WEIGHTS.chainBreadth };
}

// ── Composite score ───────────────────────────────────────────────────────────

export function computeResilienceScore(profile: FinancialProfile): ResilienceScore {
  const assetStability    = scoreAssetStability(profile);
  const recoveryReadiness = scoreRecoveryReadiness(profile);
  const contractIntegrity = scoreContractIntegrity(profile);
  const stablecoinBuffer  = scoreStablecoinBuffer(profile);
  const chainBreadth      = scoreChainBreadth(profile);

  const total = Math.round(
    (assetStability.value    * assetStability.weight    +
     recoveryReadiness.value * recoveryReadiness.weight +
     contractIntegrity.value * contractIntegrity.weight +
     stablecoinBuffer.value  * stablecoinBuffer.weight  +
     chainBreadth.value      * chainBreadth.weight) * 10  // scale to 1000
  );

  const label = resolveScoreLabel(total);

  return {
    total,
    assetStability,
    recoveryReadiness,
    contractIntegrity,
    stablecoinBuffer,
    chainBreadth,
    label,
    trend: "STABLE",
    computedAt: Math.floor(Date.now() / 1000),
  };
}

export function resolveScoreLabel(total: number): ScoreLabel {
  for (const [label, range] of Object.entries(SCORE_THRESHOLDS)) {
    if (total >= range.min && total <= range.max) return label as ScoreLabel;
  }
  return "MODERATE";
}

// ── Protection coverage estimate ──────────────────────────────────────────────

export function computeProtectionCoverage(score: ResilienceScore, guardianActive: boolean): number {
  const base = Math.round((score.total / 1000) * 70);
  return guardianActive ? Math.min(base + 17, 100) : base;
}
