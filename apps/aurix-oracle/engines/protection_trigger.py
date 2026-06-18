"""
AurixProtectionEngine — ProtectionTrigger (Python)

Evaluates all registered protection triggers against a user's
current financial state and returns which protections should activate.

Core evaluation logic:
  - Triggers are evaluated in Python as part of the oracle pipeline
  - Each trigger checks one specific financial resilience metric (e.g. Health Factor)
  - Multiple triggers can fire simultaneously, which are then aggregated
  - Output is an ordered list of recommended protection actions
  - Keeps the dashboard updated with real-time risk mitigation warnings
"""

from typing import List, Dict, Any, Callable
from dataclasses import dataclass, field
import time


# ── Trigger definition ────────────────────────────────────────────────────────

@dataclass
class TriggerDefinition:
    trigger_id:         str
    name:               str
    severity:           str   # CRITICAL | HIGH | MEDIUM | LOW
    recommended_action: str
    evaluate:           Callable[[Dict[str, Any]], bool]
    explain:            Callable[[Dict[str, Any]], str]


# ── Built-in triggers (mirrors TS TriggerRegistry) ───────────────────────────

BUILTIN_TRIGGERS: List[TriggerDefinition] = [
    TriggerDefinition(
        trigger_id="RESILIENCE_SCORE_CRITICAL",
        name="Critical Resilience Score",
        severity="CRITICAL",
        recommended_action="ACTIVATE_EMERGENCY_LOCK",
        evaluate=lambda s: s.get("resilienceScore", 1000) < 300,
        explain=lambda s: f"Resilience Score is {s.get('resilienceScore')}/1000 — emergency reserve lock recommended",
    ),
    TriggerDefinition(
        trigger_id="HEALTH_FACTOR_DANGER",
        name="Lending Health Factor Critical",
        severity="CRITICAL",
        recommended_action="SWAP_TO_QUSDC",
        evaluate=lambda s: 0 < s.get("healthFactor", 99) < 1.2,
        explain=lambda s: f"Health factor is {s.get('healthFactor', 0):.2f} — liquidation risk is critical",
    ),
    TriggerDefinition(
        trigger_id="HEALTH_FACTOR_WARNING",
        name="Lending Health Factor Low",
        severity="HIGH",
        recommended_action="REBALANCE_PORTFOLIO",
        evaluate=lambda s: 1.2 <= s.get("healthFactor", 99) < 1.5,
        explain=lambda s: f"Health factor is {s.get('healthFactor', 0):.2f} — approaching liquidation zone",
    ),
    TriggerDefinition(
        trigger_id="VOLATILITY_SPIKE",
        name="Portfolio Volatility Spike",
        severity="HIGH",
        recommended_action="SWAP_TO_QUSDC",
        evaluate=lambda s: s.get("volatility30d", 0) > 0.6 and s.get("stablecoinPct", 1) < 0.2,
        explain=lambda s: (
            f"Portfolio volatility is {s.get('volatility30d', 0)*100:.0f}% "
            f"with only {s.get('stablecoinPct', 0)*100:.0f}% in stablecoins"
        ),
    ),
    TriggerDefinition(
        trigger_id="STABLECOIN_DEPLETION",
        name="Stablecoin Buffer Depleted",
        severity="HIGH",
        recommended_action="SWAP_TO_QUSDC",
        evaluate=lambda s: s.get("stablecoinPct", 1) < 0.05,
        explain=lambda s: f"Stablecoin allocation is {s.get('stablecoinPct', 0)*100:.1f}% — below 5% safety minimum",
    ),
    TriggerDefinition(
        trigger_id="CHAIN_CONCENTRATION",
        name="Single-Chain Concentration",
        severity="MEDIUM",
        recommended_action="REBALANCE_PORTFOLIO",
        evaluate=lambda s: s.get("chainCount", 1) == 1,
        explain=lambda _: "All assets on one chain — chain outage would affect entire portfolio",
    ),
    TriggerDefinition(
        trigger_id="GUARDIAN_INACTIVE_RISK",
        name="Guardian Mode Not Active",
        severity="MEDIUM",
        recommended_action="NONE",
        evaluate=lambda s: not s.get("guardianActive", True) and s.get("resilienceScore", 1000) < 600,
        explain=lambda s: f"Guardian Mode is inactive and Resilience Score is {s.get('resilienceScore')}/1000",
    ),
]


# ── ProtectionTrigger ─────────────────────────────────────────────────────────

class ProtectionTrigger:
    """
    Evaluates all registered triggers against user state.

    Input:  User state dict with keys:
              resilienceScore (0–1000)
              healthFactor (float, >0; 0 means no lending)
              stablecoinPct (0.0–1.0)
              volatility30d (0.0–1.0)
              chainCount (int)
              guardianActive (bool)

    Output: Dict with:
              fired_triggers (list of triggered conditions)
              recommended_actions (deduplicated action list)
              highest_severity (CRITICAL|HIGH|MEDIUM|LOW|NONE)
    """

    def __init__(self):
        self.triggers: List[TriggerDefinition] = list(BUILTIN_TRIGGERS)

    def register(self, trigger: TriggerDefinition) -> None:
        """Register a custom trigger."""
        if any(t.trigger_id == trigger.trigger_id for t in self.triggers):
            raise ValueError(f"Trigger {trigger.trigger_id} already registered")
        self.triggers.append(trigger)

    def evaluate(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Evaluate all triggers, return fired triggers and deduped actions."""
        severity_order = {"CRITICAL": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3}

        fired = []
        for t in self.triggers:
            try:
                if t.evaluate(state):
                    fired.append({
                        "triggerId":         t.trigger_id,
                        "triggerName":       t.name,
                        "severity":          t.severity,
                        "recommendedAction": t.recommended_action,
                        "explanation":       t.explain(state),
                        "firedAt":           int(time.time()),
                    })
            except Exception:
                pass  # Never let a bad trigger crash the evaluation

        fired.sort(key=lambda f: severity_order.get(f["severity"], 99))

        # Deduplicate actions
        seen_actions: set = set()
        deduped_actions   = []
        for f in fired:
            action = f["recommendedAction"]
            if action != "NONE" and action not in seen_actions:
                seen_actions.add(action)
                deduped_actions.append(action)

        highest = fired[0]["severity"] if fired else "NONE"

        return {
            "fired_triggers":       fired,
            "recommended_actions":  deduped_actions,
            "highest_severity":     highest,
            "trigger_count":        len(fired),
            "evaluatedAt":          int(time.time()),
        }


# Singleton
protection_trigger = ProtectionTrigger()
