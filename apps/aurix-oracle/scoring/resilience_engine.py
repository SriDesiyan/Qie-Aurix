"""
QIE Aurix Oracle — Resilience Scoring Engine
Computes the 0–1000 Resilience Score from a financial profile.
Python port of the TypeScript score engine in packages/aurix-score.
"""

import time
from models.schemas import (
    FinancialProfile, ResilienceScore, SubScore, ScoreLabel
)

# Weights must sum to 1.0
WEIGHTS = {
    "asset_stability":    0.30,
    "recovery_readiness": 0.25,
    "contract_integrity": 0.20,
    "stablecoin_buffer":  0.15,
    "chain_breadth":      0.10,
}


def _score_asset_stability(fp: FinancialProfile) -> SubScore:
    health_factors = [p.health_factor for p in fp.lending_positions]
    worst_hf = min(health_factors) if health_factors else 2.0
    health_score = min(worst_hf / 2.0, 1.0) * 40
    stability    = min(fp.total_value_usd / 10_000, 1.0) * 30
    stable_bonus = fp.stablecoin_ratio * 30
    value        = round(health_score + stability + stable_bonus)

    if worst_hf < 1.2:
        reason = "Critical lending health factor — liquidation risk"
    elif worst_hf < 1.5:
        reason = "Lending position approaching unsafe territory"
    elif fp.stablecoin_ratio < 0.10:
        reason = "Low stablecoin allocation"
    elif fp.total_value_usd < 1000:
        reason = "Small portfolio — limited resilience buffer"
    else:
        reason = "Portfolio appears stable"

    return SubScore(
        value=min(value, 100),
        max_value=100,
        label="Asset Stability",
        reason=reason,
        weight=WEIGHTS["asset_stability"],
    )


def _score_recovery_readiness(fp: FinancialProfile) -> SubScore:
    rr = fp.recovery_readiness
    value = 0
    if rr.has_recovery_vault:             value += 60
    if rr.vault_balance_usd > 500:        value += 20
    if rr.vault_balance_usd > 2000:       value += 10
    days = (time.time() - rr.last_verified_at) / 86400
    if days < 30:                          value += 10

    if not rr.has_recovery_vault:
        reason = "No recovery vault — mis-transferred funds cannot be recovered"
    elif rr.vault_balance_usd < 500:
        reason = "Recovery vault balance is low"
    elif days > 90:
        reason = "Recovery vault not verified recently"
    else:
        reason = "Recovery protection is active and healthy"

    return SubScore(
        value=min(value, 100),
        max_value=100,
        label="Recovery Readiness",
        reason=reason,
        weight=WEIGHTS["recovery_readiness"],
    )


def _score_contract_integrity(fp: FinancialProfile) -> SubScore:
    has_lending = len(fp.lending_positions) > 0
    healthy     = sum(1 for p in fp.lending_positions if p.health_factor > 1.5)
    ratio       = (healthy / len(fp.lending_positions)) if has_lending else 0.0
    value       = round(60 + ratio * 25 + (15 if has_lending else 0))

    reason = (
        "Active contracts appear healthy with no known vulnerabilities"
        if value > 80
        else "Limited contract interaction history — integrity assessment partial"
    )
    return SubScore(
        value=min(value, 100),
        max_value=100,
        label="Contract Integrity",
        reason=reason,
        weight=WEIGHTS["contract_integrity"],
    )


def _score_stablecoin_buffer(fp: FinancialProfile) -> SubScore:
    r = fp.stablecoin_ratio
    if r < 0.05:       value = 10
    elif r < 0.10:     value = 30
    elif r < 0.15:     value = 55
    elif r < 0.40:     value = int(90 + (r - 0.15) / 0.25 * 10)
    elif r < 0.60:     value = 80
    else:              value = 60

    if r < 0.05:
        reason = "Critically low stablecoin buffer — high volatility exposure"
    elif r < 0.10:
        reason = "Low stablecoin buffer — recommend QUSDC allocation"
    elif r > 0.60:
        reason = "Portfolio is over-conservative — consider productive allocation"
    else:
        reason = "Stablecoin buffer is within healthy range"

    return SubScore(
        value=min(value, 100),
        max_value=100,
        label="Stablecoin Buffer",
        reason=reason,
        weight=WEIGHTS["stablecoin_buffer"],
    )


def _score_chain_breadth(fp: FinancialProfile) -> SubScore:
    active = [c for c in fp.chain_spread if c.value_usd > 10]
    n = len(active)
    if n == 0:   value = 0
    elif n == 1: value = 40
    elif n == 2: value = 70
    elif n == 3: value = 88
    else:        value = 100

    if n == 0:
        reason = "No chain activity detected"
    elif n == 1:
        reason = f"Assets concentrated on {active[0].chain_name} — consider multi-chain spread"
    else:
        reason = f"Active on {n} chains — good resilience spread"

    return SubScore(
        value=value,
        max_value=100,
        label="Chain Breadth",
        reason=reason,
        weight=WEIGHTS["chain_breadth"],
    )


def _resolve_label(total: float) -> ScoreLabel:
    if total <= 200: return ScoreLabel.CRITICAL
    if total <= 400: return ScoreLabel.WEAK
    if total <= 600: return ScoreLabel.MODERATE
    if total <= 800: return ScoreLabel.STRONG
    return ScoreLabel.GUARDIAN


# ── Public API ────────────────────────────────────────────────────────────────

def compute_resilience_score(fp: FinancialProfile) -> ResilienceScore:
    """Compute the full Resilience Score from a financial profile."""
    a = _score_asset_stability(fp)
    r = _score_recovery_readiness(fp)
    c = _score_contract_integrity(fp)
    s = _score_stablecoin_buffer(fp)
    b = _score_chain_breadth(fp)

    total = round(
        (a.value * a.weight +
         r.value * r.weight +
         c.value * c.weight +
         s.value * s.weight +
         b.value * b.weight) * 10
    )

    return ResilienceScore(
        total=total,
        asset_stability=a,
        recovery_readiness=r,
        contract_integrity=c,
        stablecoin_buffer=s,
        chain_breadth=b,
        label=_resolve_label(total),
        trend="STABLE",
        computed_at=int(time.time()),
    )
