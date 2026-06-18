// ─────────────────────────────────────────────────────────────────────────────
// QIE Aurix — QIE Trust Graph Engine
// Computes a 0–100 Trust Graph composite from QIE ecosystem signals.
// This is the second scoring axis — unique to QIE Aurix.
// ─────────────────────────────────────────────────────────────────────────────

import type { QiePassIdentity, TrustGraph, TrustTier } from "@aurix/core";
import { TRUST_GRAPH_WEIGHTS, TRUST_TIER_THRESHOLDS } from "@aurix/core";

// ── Input type for trust computation ──────────────────────────────────────────

export interface TrustSignals {
  qiePass:               QiePassIdentity;
  walletAgeSeconds:      number;
  txSuccessRate:         number;        // 0–1
  validatorEpochsActive: number;        // 0–N epochs participated
  governanceVoteCount:   number;        // lifetime votes
  forumActivityScore:    number;        // 0–100 from community index
}

// ── Dimension calculators ─────────────────────────────────────────────────────

function scoreIdentityTrust(pass: QiePassIdentity): number {
  const tierMap: Record<QiePassIdentity["tier"], number> = {
    BASIC:    30,
    VERIFIED: 60,
    TRUSTED:  80,
    GUARDIAN: 100,
  };
  const tierBase = tierMap[pass.tier] ?? 10;

  const domainBonus     = Math.min(pass.verifiedDomains.length * 8, 20);
  const validatorBonus  = pass.isValidator ? 15 : 0;
  const communityBonus  = Math.round(pass.communityScore * 0.10);

  return Math.min(tierBase + domainBonus + validatorBonus + communityBonus, 100);
}

function scoreValidatorParticipation(epochsActive: number): number {
  if (epochsActive === 0) return 0;
  if (epochsActive < 5)  return 20;
  if (epochsActive < 20) return 50;
  if (epochsActive < 50) return 75;
  return Math.min(75 + Math.round((epochsActive - 50) * 0.5), 100);
}

function scoreCommunityContribution(voteCount: number, forumScore: number): number {
  const voteScore  = Math.min(voteCount * 5, 50);
  const forum      = Math.round(forumScore * 0.50);
  return Math.min(voteScore + forum, 100);
}

function scoreOnChainReliability(
  walletAgeSeconds: number,
  txSuccessRate: number,
): number {
  const ageDays    = walletAgeSeconds / 86400;
  const ageScore   = Math.min(ageDays / 365 * 40, 40);     // max 40 pts for 1yr+
  const txScore    = Math.round(txSuccessRate * 60);         // max 60 pts
  return Math.min(Math.round(ageScore + txScore), 100);
}

// ── Composite ─────────────────────────────────────────────────────────────────

export function computeTrustGraph(signals: TrustSignals): TrustGraph {
  const identityTrust          = scoreIdentityTrust(signals.qiePass);
  const validatorParticipation = scoreValidatorParticipation(signals.validatorEpochsActive);
  const communityContribution  = scoreCommunityContribution(signals.governanceVoteCount, signals.forumActivityScore);
  const onChainReliability     = scoreOnChainReliability(signals.walletAgeSeconds, signals.txSuccessRate);

  const composite = Math.round(
    identityTrust          * TRUST_GRAPH_WEIGHTS.identityTrust          +
    validatorParticipation * TRUST_GRAPH_WEIGHTS.validatorParticipation  +
    communityContribution  * TRUST_GRAPH_WEIGHTS.communityContribution   +
    onChainReliability     * TRUST_GRAPH_WEIGHTS.onChainReliability
  );

  const tier = resolveTrustTier(composite);

  return {
    identityTrust,
    validatorParticipation,
    communityContribution,
    onChainReliability,
    composite,
    tier,
  };
}

export function resolveTrustTier(composite: number): TrustTier {
  for (const [tier, range] of Object.entries(TRUST_TIER_THRESHOLDS)) {
    if (composite >= range.min && composite <= range.max) return tier as TrustTier;
  }
  return "UNVERIFIED";
}

// ── Mock signal generator (for demo / oracle fallback) ────────────────────────

export function generateMockTrustSignals(address: string): TrustSignals {
  // Deterministic pseudo-random from address so the same address always
  // produces the same demo values
  const seed = parseInt(address.slice(2, 10), 16) || 42;
  const rand = (min: number, max: number) =>
    min + ((seed * 1103515245 + 12345) % (max - min + 1));

  return {
    qiePass: {
      address,
      passTokenId: `${rand(1000, 9999)}`,
      tier:        (["VERIFIED", "TRUSTED", "GUARDIAN"] as const)[seed % 3],
      verifiedDomains: seed % 2 === 0 ? ["family.aurix.qie"] : [],
      isValidator:     seed % 3 === 0,
      communityScore:  rand(50, 95),
      passIssuedAt:    Math.floor(Date.now() / 1000) - rand(86400 * 30, 86400 * 730),
    },
    walletAgeSeconds:      rand(86400 * 90, 86400 * 1000),
    txSuccessRate:         0.85 + (seed % 15) / 100,
    validatorEpochsActive: seed % 3 === 0 ? rand(10, 60) : 0,
    governanceVoteCount:   rand(2, 20),
    forumActivityScore:    rand(40, 90),
  };
}
