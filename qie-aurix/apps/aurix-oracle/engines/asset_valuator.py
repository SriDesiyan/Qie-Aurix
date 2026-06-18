"""
AurixValuationEngine — AssetValuator (Python)

Computes wallet health scores and asset exposure classifications
from on-chain portfolio data.

Engineering pattern:
  - request/fulfill pattern
  - Volatility/stability asset metrics as risk classification input
  - Oracle request ID tracking per valuation round

Aurix implementation:
  - Runs as an oracle service endpoint
  - Classifies ERC-20 assets by volatility/stability tier
  - Produces a Wallet Health Score (0–1000) as input for the
    Resilience Score calculation
  - Purely risk classification for financial resilience
"""

from typing import List, Dict, Any
import math
import time


# ── Risk tiers (mirrors TS AssetClassifier) ───────────────────────────────────

TIER_THRESHOLDS = {
    "TIER_1_SAFE":     {"max_vol": 0.02, "max_risk": 5,  "max_weight_bps": 8000},
    "TIER_2_LOW":      {"max_vol": 0.20, "max_risk": 25, "max_weight_bps": 4000},
    "TIER_3_MODERATE": {"max_vol": 0.45, "max_risk": 55, "max_weight_bps": 2000},
    "TIER_4_HIGH":     {"max_vol": 0.70, "max_risk": 80, "max_weight_bps": 1000},
    "TIER_5_EXTREME":  {"max_vol": 1.00, "max_risk": 100,"max_weight_bps": 300},
}

# Sub-score weights for composite Wallet Health Score
W_LIQUIDITY     = 0.30
W_CONCENTRATION = 0.25
W_STABILITY     = 0.30
W_COVERAGE      = 0.15


# ── AssetValuator ─────────────────────────────────────────────────────────────

class AssetValuator:
    """
    Analyzes a portfolio and returns:
      1. Wallet Health Score (0–1000)
      2. Per-asset risk tier classifications
      3. Exposure analysis (stable, core, speculative, locked, yield)
      4. Actionable insights
    """

    @staticmethod
    def analyze_wallet(assets: List[Dict[str, Any]]) -> Dict[str, Any]:
        if not assets:
            return {
                "compositeScore": 0,
                "scoreBand": "CRITICAL",
                "liquidityScore": 0,
                "concentrationScore": 0,
                "stabilityScore": 0,
                "coverageScore": 0,
                "totalValueUsd": 0,
                "insights": ["No portfolio data found. Connect QIE Pass to begin."],
                "analyzedAt": int(time.time()),
            }

        total     = sum(a.get("valueUsd", 0) for a in assets)
        liquid    = sum(a.get("valueUsd", 0) for a in assets if a.get("isLiquid") and not a.get("isLocked"))
        stable    = sum(a.get("valueUsd", 0) for a in assets if a.get("isStable"))
        chains    = len({a.get("chainId", 1) for a in assets})

        liq_score  = round((liquid / total * 100)) if total > 0 else 0
        conc_score = AssetValuator._concentration_score(assets, total)
        stab_score = round((stable / total * 100)) if total > 0 else 0
        cov_score  = AssetValuator._coverage_score(chains, assets)

        composite = round(
            (liq_score  * W_LIQUIDITY +
             conc_score * W_CONCENTRATION +
             stab_score * W_STABILITY +
             cov_score  * W_COVERAGE) * 10
        )
        composite = min(composite, 1000)

        return {
            "compositeScore":     composite,
            "scoreBand":          AssetValuator._score_band(composite),
            "liquidityScore":     liq_score,
            "concentrationScore": conc_score,
            "stabilityScore":     stab_score,
            "coverageScore":      cov_score,
            "totalValueUsd":      total,
            "liquidValueUsd":     liquid,
            "stableValueUsd":     stable,
            "chainCount":         chains,
            "assetCount":         len(assets),
            "insights":           AssetValuator._insights(liq_score, conc_score, stab_score, cov_score),
            "analyzedAt":         int(time.time()),
        }

    @staticmethod
    def classify_asset(asset: Dict[str, Any]) -> Dict[str, Any]:
        """Classify a single asset into a risk tier."""
        vol  = asset.get("volatility", 0.5)
        is_stable = asset.get("isStable", False)

        if is_stable or vol <= 0.02:
            tier = "TIER_1_SAFE"
        elif vol <= 0.20:
            tier = "TIER_2_LOW"
        elif vol <= 0.45:
            tier = "TIER_3_MODERATE"
        elif vol <= 0.70:
            tier = "TIER_4_HIGH"
        else:
            tier = "TIER_5_EXTREME"

        risk_score = min(round(TIER_THRESHOLDS[tier]["max_risk"] + vol * 20), 100)
        if asset.get("isLocked"):
            risk_score = max(risk_score - 10, 0)

        action = (
            "INCREASE" if tier == "TIER_1_SAFE" else
            "ELIMINATE" if risk_score > 75 else
            "REDUCE"    if risk_score > 50 else
            "HOLD"
        )

        return {
            "tokenId":       asset.get("tokenId"),
            "symbol":        asset.get("symbol"),
            "riskTier":      tier,
            "riskScore":     risk_score,
            "maxWeightBps":  TIER_THRESHOLDS[tier]["max_weight_bps"],
            "aurixAction":   action,
        }

    @staticmethod
    def _concentration_score(assets: List[Dict[str, Any]], total: float) -> int:
        if total == 0:
            return 0
        hhi = sum(math.pow(a.get("valueUsd", 0) / total, 2) for a in assets)
        return round((1 - hhi) * 100)

    @staticmethod
    def _coverage_score(chain_count: int, assets: List[Dict[str, Any]]) -> int:
        base = min(40 + (chain_count - 1) * 20, 100)
        locked_ratio = sum(1 for a in assets if a.get("isLocked")) / len(assets) if assets else 0
        penalty = 20 if locked_ratio > 0.8 else 0
        return max(base - penalty, 0)

    @staticmethod
    def _score_band(score: int) -> str:
        if score < 200: return "CRITICAL"
        if score < 400: return "POOR"
        if score < 600: return "FAIR"
        if score < 800: return "GOOD"
        return "EXCELLENT"

    @staticmethod
    def _insights(liq: int, conc: int, stab: int, cov: int) -> List[str]:
        tips = []
        if liq  < 30: tips.append("Low liquidity — most assets are locked or illiquid")
        if conc < 40: tips.append("High concentration risk — portfolio dominated by one asset")
        if stab < 20: tips.append("Stablecoin allocation is very low — increase QUSDC position")
        if cov  < 60: tips.append("Single-chain exposure — bridge assets for resilience")
        if not tips:  tips.append("Portfolio health looks good. Activate Guardian Mode for full protection.")
        return tips


# Singleton
asset_valuator = AssetValuator()
