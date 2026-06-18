"""
QIE Aurix Oracle — Protection Agent
Converts a Risk Report into a prioritized Protection Plan.
Each action includes a reason, impact estimate, and gas cost estimate.
"""

import time
import uuid
from models.schemas import (
    RiskReport, RiskTrigger, ProtectionPlan, ProtectionAction,
    ProtectionActionType, RiskSeverity
)

# Action templates keyed by recommended_action string
_ACTION_TEMPLATES: dict[str, dict] = {
    "SWAP_TO_QUSDC": {
        "type":             ProtectionActionType.SWAP_TO_QUSDC,
        "title":            "Swap Volatile Assets to QUSDC",
        "estimated_gas":    2.40,
        "estimated_impact": "Increases stablecoin buffer by ~15–20%, reducing volatility exposure",
        "priority":         "HIGH",
    },
    "ACTIVATE_EMERGENCY_VAULT": {
        "type":             ProtectionActionType.ACTIVATE_EMERGENCY_VAULT,
        "title":            "Activate Emergency Reserve Vault",
        "estimated_gas":    3.10,
        "estimated_impact": "Locks a QUSDC emergency reserve inaccessible during market panics",
        "priority":         "MEDIUM",
    },
    "SET_FAMILY_VAULT": {
        "type":             ProtectionActionType.SET_FAMILY_VAULT,
        "title":            "Deploy Family Vault",
        "estimated_gas":    4.80,
        "estimated_impact": "Creates a named vault with heir access — protects family finances",
        "priority":         "MEDIUM",
    },
    "ENABLE_RECOVERY_GATE": {
        "type":             ProtectionActionType.ENABLE_RECOVERY_GATE,
        "title":            "Enable Recovery Protection",
        "estimated_gas":    1.20,
        "estimated_impact": "Activates permissionless recovery for accidental token transfers",
        "priority":         "HIGH",
    },
    "ANCHOR_AUDIT": {
        "type":             ProtectionActionType.ANCHOR_AUDIT,
        "title":            "Anchor Safety Audit",
        "estimated_gas":    0.80,
        "estimated_impact": "Records tamper-evident audit snapshot on-chain for integrity tracking",
        "priority":         "LOW",
    },
    "REBALANCE_LENDING": {
        "type":             ProtectionActionType.REBALANCE_LENDING,
        "title":            "Rebalance Lending Position",
        "estimated_gas":    3.60,
        "estimated_impact": "Reduces liquidation risk by improving health factor above 1.8",
        "priority":         "CRITICAL",
    },
}

def _severity_to_priority(severity: RiskSeverity) -> str:
    return {
        RiskSeverity.CRITICAL: "CRITICAL",
        RiskSeverity.HIGH:     "HIGH",
        RiskSeverity.WARNING:  "MEDIUM",
        RiskSeverity.INFO:     "LOW",
    }.get(severity, "MEDIUM")


def _trigger_to_action(trigger: RiskTrigger) -> ProtectionAction | None:
    template = _ACTION_TEMPLATES.get(trigger.recommended_action)
    if not template:
        return None
    return ProtectionAction(
        id=str(uuid.uuid4())[:8],
        type=template["type"],
        title=template["title"],
        reason=trigger.description,
        estimated_gas_usd=template["estimated_gas"],
        estimated_impact=template["estimated_impact"],
        priority=_severity_to_priority(trigger.severity),
        status="PENDING",
    )


def _estimate_coverage_increase(actions: list[ProtectionAction]) -> float:
    """Rough coverage increase estimate based on action types."""
    coverage = 0.0
    for a in actions:
        if a.type == ProtectionActionType.SWAP_TO_QUSDC:          coverage += 8.0
        elif a.type == ProtectionActionType.ACTIVATE_EMERGENCY_VAULT: coverage += 5.0
        elif a.type == ProtectionActionType.SET_FAMILY_VAULT:      coverage += 6.0
        elif a.type == ProtectionActionType.ENABLE_RECOVERY_GATE:  coverage += 4.0
        elif a.type == ProtectionActionType.REBALANCE_LENDING:     coverage += 9.0
        elif a.type == ProtectionActionType.ANCHOR_AUDIT:          coverage += 2.0
    return min(coverage, 40.0)


# ── Public API ────────────────────────────────────────────────────────────────

def generate_protection_plan(risk: RiskReport) -> ProtectionPlan:
    """
    Convert a Risk Report into a prioritized Protection Plan.
    Actions are deduplicated by type and sorted by priority.
    """
    priority_order = {"CRITICAL": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3}
    seen_types: set[ProtectionActionType] = set()
    actions: list[ProtectionAction] = []

    for trigger in risk.triggers:
        action = _trigger_to_action(trigger)
        if action and action.type not in seen_types:
            seen_types.add(action.type)
            actions.append(action)

    # Always include audit anchor if not already present
    if ProtectionActionType.ANCHOR_AUDIT not in seen_types:
        tmpl = _ACTION_TEMPLATES["ANCHOR_AUDIT"]
        actions.append(ProtectionAction(
            id=str(uuid.uuid4())[:8],
            type=ProtectionActionType.ANCHOR_AUDIT,
            title=tmpl["title"],
            reason="Continuous integrity monitoring is recommended for all active users.",
            estimated_gas_usd=tmpl["estimated_gas"],
            estimated_impact=tmpl["estimated_impact"],
            priority="LOW",
            status="PENDING",
        ))

    actions.sort(key=lambda a: priority_order.get(a.priority, 99))

    return ProtectionPlan(
        address=risk.address,
        actions=actions,
        estimated_coverage_increase=_estimate_coverage_increase(actions),
        generated_at=int(time.time()),
    )
