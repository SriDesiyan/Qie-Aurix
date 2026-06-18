"""
QIE Aurix Oracle — Risk Agent
Analyzes a Trust Profile and produces a labeled Risk Report.
Every trigger includes a human-readable reason — the AI explains itself.
"""

import time
from models.schemas import (
    TrustProfile, RiskReport, RiskTrigger, RiskSeverity
)


def _check_lending_health(profile: TrustProfile) -> list[RiskTrigger]:
    triggers = []
    for pos in profile.financial.lending_positions:
        if pos.health_factor < 1.2:
            triggers.append(RiskTrigger(
                id="lending_critical_health",
                label="Critical Lending Health",
                severity=RiskSeverity.CRITICAL,
                description=(
                    f"Your {pos.protocol} position has a health factor of "
                    f"{pos.health_factor:.2f} — liquidation is imminent below 1.0."
                ),
                recommended_action="REBALANCE_LENDING",
            ))
        elif pos.health_factor < 1.5:
            triggers.append(RiskTrigger(
                id="lending_at_risk",
                label="Lending Position At Risk",
                severity=RiskSeverity.HIGH,
                description=(
                    f"{pos.protocol} health factor {pos.health_factor:.2f} is "
                    "approaching the danger zone. Consider repaying or adding collateral."
                ),
                recommended_action="REBALANCE_LENDING",
            ))
    return triggers


def _check_stablecoin_buffer(profile: TrustProfile) -> list[RiskTrigger]:
    ratio = profile.financial.stablecoin_ratio
    if ratio < 0.05:
        return [RiskTrigger(
            id="low_stablecoin_buffer",
            label="Critically Low Stablecoin Buffer",
            severity=RiskSeverity.CRITICAL,
            description=(
                f"Only {ratio*100:.0f}% of your portfolio is in stablecoins. "
                "A market downturn could significantly reduce your net worth."
            ),
            recommended_action="SWAP_TO_QUSDC",
        )]
    elif ratio < 0.10:
        return [RiskTrigger(
            id="low_stablecoin_buffer",
            label="Low Stablecoin Buffer",
            severity=RiskSeverity.HIGH,
            description=(
                f"Stablecoin allocation is {ratio*100:.0f}%. "
                "Recommend increasing QUSDC holdings for volatility protection."
            ),
            recommended_action="SWAP_TO_QUSDC",
        )]
    return []


def _check_recovery_readiness(profile: TrustProfile) -> list[RiskTrigger]:
    rr = profile.financial.recovery_readiness
    if not rr.has_recovery_vault:
        return [RiskTrigger(
            id="missing_recovery_vault",
            label="No Recovery Protection",
            severity=RiskSeverity.HIGH,
            description=(
                "You have no Aurix recovery vault. If tokens are accidentally sent "
                "to a contract, recovery is impossible without one."
            ),
            recommended_action="ENABLE_RECOVERY_GATE",
        )]
    days_since = (time.time() - rr.last_verified_at) / 86400
    if days_since > 90:
        return [RiskTrigger(
            id="stale_recovery_vault",
            label="Recovery Vault Not Recently Verified",
            severity=RiskSeverity.WARNING,
            description=(
                f"Recovery vault was last verified {int(days_since)} days ago. "
                "Regular verification ensures funds remain recoverable."
            ),
            recommended_action="ENABLE_RECOVERY_GATE",
        )]
    return []


def _check_family_vault(profile: TrustProfile) -> list[RiskTrigger]:
    has_family_domain = any("family" in d for d in profile.qie_pass.verified_domains)
    if not has_family_domain:
        return [RiskTrigger(
            id="missing_family_vault",
            label="No Family Vault Protection",
            severity=RiskSeverity.WARNING,
            description=(
                "No family vault is configured. In the event of an emergency, "
                "your assets have no designated heir protection."
            ),
            recommended_action="SET_FAMILY_VAULT",
        )]
    return []


def _check_chain_concentration(profile: TrustProfile) -> list[RiskTrigger]:
    active = [c for c in profile.financial.chain_spread if c.value_usd > 10]
    if len(active) == 1:
        return [RiskTrigger(
            id="single_chain_concentration",
            label="Single-Chain Concentration",
            severity=RiskSeverity.WARNING,
            description=(
                f"All assets are on {active[0].chain_name}. "
                "A chain-specific incident could affect your entire portfolio."
            ),
            recommended_action="ACTIVATE_EMERGENCY_VAULT",
        )]
    return []


def _check_high_volatility_exposure(profile: TrustProfile) -> list[RiskTrigger]:
    # Flag if stablecoin is low AND lending health is borderline
    ratio = profile.financial.stablecoin_ratio
    has_risky_lending = any(p.health_factor < 1.8 for p in profile.financial.lending_positions)
    if ratio < 0.15 and has_risky_lending:
        return [RiskTrigger(
            id="high_volatility_exposure",
            label="High Volatility Exposure",
            severity=RiskSeverity.HIGH,
            description=(
                "Low stablecoin allocation combined with undercollateralized lending "
                "creates compounding downside risk during market volatility."
            ),
            recommended_action="SWAP_TO_QUSDC",
        )]
    return []


def _overall_risk(triggers: list[RiskTrigger]) -> str:
    severities = {t.severity for t in triggers}
    if RiskSeverity.CRITICAL in severities: return "CRITICAL"
    if RiskSeverity.HIGH     in severities: return "HIGH"
    if RiskSeverity.WARNING  in severities: return "MEDIUM"
    return "LOW"


# ── Public API ────────────────────────────────────────────────────────────────

def analyze_risk(profile: TrustProfile) -> RiskReport:
    """
    Analyze the Trust Profile for financial risk triggers.
    Returns a labeled Risk Report with explainable triggers.
    """
    triggers: list[RiskTrigger] = []
    triggers += _check_lending_health(profile)
    triggers += _check_stablecoin_buffer(profile)
    triggers += _check_recovery_readiness(profile)
    triggers += _check_family_vault(profile)
    triggers += _check_chain_concentration(profile)
    triggers += _check_high_volatility_exposure(profile)

    return RiskReport(
        address=profile.address,
        triggers=triggers,
        overall_risk=_overall_risk(triggers),
        generated_at=int(time.time()),
    )
