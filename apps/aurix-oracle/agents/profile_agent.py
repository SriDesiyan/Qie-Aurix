"""
QIE Aurix Oracle — Profile Agent
Builds a Trust Profile from wallet address and chain data.
Uses mock on-chain data for the hackathon demo.
"""

import time
import random
from models.schemas import (
    TrustProfile, QiePassIdentity, FinancialProfile,
    ChainActivity, LendingPosition, DexActivity,
    RecoveryReadiness, TrustGraph, TrustTier
)


# ── Trust Graph computation ───────────────────────────────────────────────────

def _compute_identity_trust(qie_pass: QiePassIdentity) -> float:
    tier_map = {"BASIC": 30, "VERIFIED": 60, "TRUSTED": 80, "GUARDIAN": 100}
    base = tier_map.get(qie_pass.tier, 10)
    domain_bonus    = min(len(qie_pass.verified_domains) * 8, 20)
    validator_bonus = 15 if qie_pass.is_validator else 0
    community_bonus = round(qie_pass.community_score * 0.10)
    return min(base + domain_bonus + validator_bonus + community_bonus, 100.0)

def _compute_validator_score(epochs_active: int) -> float:
    if epochs_active == 0:  return 0.0
    if epochs_active < 5:   return 20.0
    if epochs_active < 20:  return 50.0
    if epochs_active < 50:  return 75.0
    return min(75.0 + (epochs_active - 50) * 0.5, 100.0)

def _compute_community_score(vote_count: int, forum_score: float) -> float:
    vote = min(vote_count * 5, 50)
    return min(vote + forum_score * 0.5, 100.0)

def _compute_reliability(wallet_age_days: int, tx_success_rate: float) -> float:
    age_score = min(wallet_age_days / 365 * 40, 40)
    tx_score  = tx_success_rate * 60
    return min(round(age_score + tx_score), 100.0)

def _build_trust_graph(
    qie_pass: QiePassIdentity,
    epochs_active: int,
    vote_count: int,
    forum_score: float,
    wallet_age_days: int,
    tx_success_rate: float,
) -> TrustGraph:
    id_trust    = _compute_identity_trust(qie_pass)
    validator   = _compute_validator_score(epochs_active)
    community   = _compute_community_score(vote_count, forum_score)
    reliability = _compute_reliability(wallet_age_days, tx_success_rate)

    composite = (
        id_trust    * 0.35 +
        validator   * 0.25 +
        community   * 0.25 +
        reliability * 0.15
    )
    composite = round(composite, 1)

    if composite <= 20:   tier = TrustTier.UNVERIFIED
    elif composite <= 40: tier = TrustTier.BASIC
    elif composite <= 65: tier = TrustTier.VERIFIED
    elif composite <= 85: tier = TrustTier.TRUSTED
    else:                 tier = TrustTier.GUARDIAN

    return TrustGraph(
        identity_trust=round(id_trust, 1),
        validator_participation=round(validator, 1),
        community_contribution=round(community, 1),
        on_chain_reliability=round(reliability, 1),
        composite=composite,
        tier=tier,
    )


# ── Mock data generation (deterministic per address) ─────────────────────────

def _seed_from_address(address: str) -> int:
    """Deterministic seed so same address always gives same demo values."""
    try:
        return int(address[2:10], 16)
    except Exception:
        return 42

def _mock_qie_pass(address: str, seed: int) -> QiePassIdentity:
    tiers = ["BASIC", "VERIFIED", "TRUSTED", "GUARDIAN"]
    tier  = tiers[seed % len(tiers)]
    domains = ["family.aurix.qie"] if seed % 2 == 0 else []
    return QiePassIdentity(
        address=address,
        pass_token_id=str(1000 + (seed % 9000)),
        tier=tier,
        verified_domains=domains,
        is_validator=(seed % 3 == 0),
        community_score=50 + (seed % 45),
        pass_issued_at=int(time.time()) - (seed % 730) * 86400,
    )

def _mock_financial_profile(seed: int) -> FinancialProfile:
    chains = [
        ChainActivity(chain_id=1234, chain_name="QIE Testnet",
                      value_usd=2000 + seed % 8000,
                      tx_count=50 + seed % 200,
                      last_activity=int(time.time()) - 3600),
        ChainActivity(chain_id=1,    chain_name="Ethereum",
                      value_usd=500 + seed % 3000,
                      tx_count=20 + seed % 100,
                      last_activity=int(time.time()) - 86400),
    ] if seed % 2 == 0 else [
        ChainActivity(chain_id=1234, chain_name="QIE Testnet",
                      value_usd=3500 + seed % 6000,
                      tx_count=80 + seed % 150,
                      last_activity=int(time.time()) - 7200),
    ]

    health = 1.3 + (seed % 10) * 0.08
    lending = [
        LendingPosition(
            protocol="QIELend",
            supply_usd=1000 + seed % 4000,
            borrow_usd=200  + seed % 1000,
            health_factor=round(health, 2),
            collateral_token="QUSDC",
        )
    ] if seed % 3 != 0 else []

    return FinancialProfile(
        total_value_usd=3000 + seed % 12000,
        stablecoin_ratio=round(0.10 + (seed % 30) / 100, 2),
        chain_spread=chains,
        lending_positions=lending,
        dex_activity=DexActivity(
            total_swaps_30d=seed % 40,
            volume_usd=500 + seed % 5000,
            preferred_pairs=["QIE/QUSDC", "ETH/QUSDC"],
            avg_slippage=round(0.1 + (seed % 5) * 0.1, 2),
        ),
        recovery_readiness=RecoveryReadiness(
            has_recovery_vault=(seed % 4 != 0),
            vault_balance_usd=300 + seed % 1200,
            last_verified_at=int(time.time()) - (seed % 60) * 86400,
        ),
    )


# ── Public API ────────────────────────────────────────────────────────────────

def build_trust_profile(address: str, chain_ids: list[int]) -> TrustProfile:
    """
    Build a Trust Profile for the given wallet address.
    For the hackathon demo, uses deterministic mock data.
    In production: fetch from QIE indexer, QIELend, QIE DEX APIs.
    """
    seed        = _seed_from_address(address)
    qie_pass    = _mock_qie_pass(address, seed)
    financial   = _mock_financial_profile(seed)

    epochs_active   = (seed % 3 == 0) and seed % 60 or 0
    vote_count      = seed % 20
    forum_score     = 40 + seed % 50
    wallet_age_days = 90 + seed % 900
    tx_success_rate = 0.85 + (seed % 15) / 100

    trust_graph = _build_trust_graph(
        qie_pass=qie_pass,
        epochs_active=epochs_active,
        vote_count=vote_count,
        forum_score=forum_score,
        wallet_age_days=wallet_age_days,
        tx_success_rate=tx_success_rate,
    )

    return TrustProfile(
        address=address,
        qie_pass=qie_pass,
        financial=financial,
        trust_graph=trust_graph,
        built_at=int(time.time()),
        version="1.0",
    )
