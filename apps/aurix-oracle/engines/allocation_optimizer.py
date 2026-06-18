"""
AurixResilienceEngine — AllocationOptimizer (Python)

Computes safe portfolio allocation weights for Aurix users.

Engineering pattern:
  - Three-phase pipeline: price fetch → optimization → result
  - Weight normalization to 10,000 basis points
  - Classical allocation logic (classical math only)

Aurix implementation:
  - Optimizes for SAFETY, not yield or profit
  - Stablecoins (QUSDC) are systematically over-weighted
  - Volatile assets are penalized proportional to volatility
  - Output is a ranked allocation recommendation for the user
"""

from typing import List, Dict, Any
import math


# ── Safety scoring constants ──────────────────────────────────────────────────

STABLE_WEIGHT_BOOST    = 1.5    # stablecoins get 1.5x their value share
VOLATILE_PENALTY       = 0.65   # volatile assets: weight * this factor
MIN_STABLE_BPS         = 1500   # floor: at least 15% in stablecoins
TOTAL_BPS              = 10_000


# ── AllocationOptimizer ───────────────────────────────────────────────────────

class AllocationOptimizer:
    """
    Three-phase allocation optimizer for financial resilience.

    Input:  List of asset dicts with tokenId, symbol, valueUsd,
            volatility (0.0–1.0), isStable (bool), chainId
    Output: Dict with weights (list of {tokenId, symbol, weightBps}),
            stableAllocationPct, diversificationScore, recommendedAction
    """

    @staticmethod
    def optimize(assets: List[Dict[str, Any]]) -> Dict[str, Any]:
        if not assets:
            return {
                "weights": [],
                "stableAllocationPct": 0,
                "diversificationScore": 0,
                "recommendedAction": "No assets detected. Connect QIE Pass to begin.",
                "computedAt": AllocationOptimizer._now()
            }

        total_value = sum(a.get("valueUsd", 0) for a in assets)
        if total_value <= 0:
            return AllocationOptimizer._zero_result(assets)

        # Phase 1: Score each asset
        raw_scores = [
            AllocationOptimizer._score_asset(a, total_value)
            for a in assets
        ]
        total_raw = sum(raw_scores) or 1.0

        # Phase 2: Proportional weights (10,000 bps)
        weights = []
        for i, asset in enumerate(assets):
            bps = round((raw_scores[i] / total_raw) * TOTAL_BPS)
            weights.append({
                "tokenId":   asset.get("tokenId", ""),
                "symbol":    asset.get("symbol", ""),
                "weightBps": bps,
                "safetyScore": round(min((raw_scores[i] / total_raw) * 100, 100)),
                "reasoning": AllocationOptimizer._explain(asset),
            })

        # Phase 3: Enforce minimum stable floor
        weights = AllocationOptimizer._enforce_stable_floor(weights, assets)

        # Normalize to exactly 10,000 bps
        weights = AllocationOptimizer._normalize(weights)

        stable_bps = sum(
            w["weightBps"] for w, a in zip(weights, assets) if a.get("isStable")
        )
        stable_pct = stable_bps / 100.0

        return {
            "weights": weights,
            "stableAllocationPct": stable_pct,
            "diversificationScore": AllocationOptimizer._diversification_score(assets, weights),
            "recommendedAction": AllocationOptimizer._recommend(stable_pct),
            "computedAt": AllocationOptimizer._now(),
        }

    # ── Private helpers ───────────────────────────────────────────────────────

    @staticmethod
    def _score_asset(asset: Dict[str, Any], total_value: float) -> float:
        value_share  = asset.get("valueUsd", 0) / total_value
        is_stable    = asset.get("isStable", False)
        volatility   = asset.get("volatility", 0.5)
        stability    = STABLE_WEIGHT_BOOST if is_stable else (1 - volatility * VOLATILE_PENALTY)
        return max(value_share * stability * 100, 0.01)

    @staticmethod
    def _enforce_stable_floor(
        weights: List[Dict[str, Any]],
        assets:  List[Dict[str, Any]],
    ) -> List[Dict[str, Any]]:
        stable_ids  = {a.get("tokenId") for a in assets if a.get("isStable")}
        stable_bps  = sum(w["weightBps"] for w in weights if w["tokenId"] in stable_ids)
        deficit     = MIN_STABLE_BPS - stable_bps
        if deficit <= 0 or not stable_ids:
            return weights

        non_stable  = [w for w in weights if w["tokenId"] not in stable_ids]
        total_ns    = sum(w["weightBps"] for w in non_stable) or 1

        result = []
        for w in weights:
            if w["tokenId"] in stable_ids:
                result.append({**w, "weightBps": w["weightBps"] + deficit // len(stable_ids)})
            else:
                reduction = round((w["weightBps"] / total_ns) * deficit)
                result.append({**w, "weightBps": max(w["weightBps"] - reduction, 0)})
        return result

    @staticmethod
    def _normalize(weights: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        total = sum(w["weightBps"] for w in weights)
        if total == TOTAL_BPS or total == 0:
            return weights
        diff     = TOTAL_BPS - total
        max_idx  = max(range(len(weights)), key=lambda i: weights[i]["weightBps"])
        result   = list(weights)
        result[max_idx] = {**result[max_idx], "weightBps": result[max_idx]["weightBps"] + diff}
        return result

    @staticmethod
    def _diversification_score(
        assets:  List[Dict[str, Any]],
        weights: List[Dict[str, Any]],
    ) -> int:
        chains     = len({a.get("chainId", 1) for a in assets})
        hhi        = sum(math.pow(w["weightBps"] / TOTAL_BPS, 2) for w in weights)
        base_score = round((1 - hhi) * 80)
        chain_bonus = min((chains - 1) * 5, 20)
        return min(base_score + chain_bonus, 100)

    @staticmethod
    def _recommend(stable_pct: float) -> str:
        if stable_pct < 10:
            return "CRITICAL: Swap assets to QUSDC immediately — stablecoin buffer dangerously low"
        if stable_pct < 20:
            return "Increase QUSDC allocation to at least 20% for adequate protection"
        if stable_pct < 40:
            return "Stablecoin buffer is adequate. Consider cross-chain diversification."
        return "Allocation is well-balanced for financial resilience."

    @staticmethod
    def _explain(asset: Dict[str, Any]) -> str:
        if asset.get("isStable"):
            return f"{asset.get('symbol')} is a stablecoin — weighted up for resilience"
        vol = asset.get("volatility", 0.5)
        if vol > 0.6:
            return f"{asset.get('symbol')} has high volatility ({vol*100:.0f}%) — weighted down"
        return f"{asset.get('symbol')} has moderate volatility — balanced allocation"

    @staticmethod
    def _zero_result(assets: List[Dict[str, Any]]) -> Dict[str, Any]:
        return {
            "weights": [{"tokenId": a.get("tokenId"), "symbol": a.get("symbol"), "weightBps": 0} for a in assets],
            "stableAllocationPct": 0,
            "diversificationScore": 0,
            "recommendedAction": "Portfolio value is zero. Fund your wallet to begin.",
            "computedAt": AllocationOptimizer._now(),
        }

    @staticmethod
    def _now() -> int:
        import time
        return int(time.time())
