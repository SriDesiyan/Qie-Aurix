"""
QIE Aurix Oracle Service — Pydantic Schemas
All request/response models for the FastAPI service.
"""

from __future__ import annotations
from typing import Literal, Optional
from pydantic import BaseModel, Field
from enum import Enum


# ── Enums ─────────────────────────────────────────────────────────────────────

class ScoreLabel(str, Enum):
    CRITICAL = "CRITICAL"
    WEAK     = "WEAK"
    MODERATE = "MODERATE"
    STRONG   = "STRONG"
    GUARDIAN = "GUARDIAN"

class TrustTier(str, Enum):
    UNVERIFIED = "UNVERIFIED"
    BASIC      = "BASIC"
    VERIFIED   = "VERIFIED"
    TRUSTED    = "TRUSTED"
    GUARDIAN   = "GUARDIAN"

class RiskSeverity(str, Enum):
    INFO     = "INFO"
    WARNING  = "WARNING"
    HIGH     = "HIGH"
    CRITICAL = "CRITICAL"

class ClaimStatus(str, Enum):
    PENDING  = "PENDING"
    VERIFIED = "VERIFIED"
    RELEASED = "RELEASED"
    REJECTED = "REJECTED"

class ProtectionActionType(str, Enum):
    SWAP_TO_QUSDC          = "SWAP_TO_QUSDC"
    ACTIVATE_EMERGENCY_VAULT = "ACTIVATE_EMERGENCY_VAULT"
    SET_FAMILY_VAULT       = "SET_FAMILY_VAULT"
    ENABLE_RECOVERY_GATE   = "ENABLE_RECOVERY_GATE"
    ANCHOR_AUDIT           = "ANCHOR_AUDIT"
    REBALANCE_LENDING      = "REBALANCE_LENDING"


# ── QIE Identity ──────────────────────────────────────────────────────────────

class QiePassIdentity(BaseModel):
    address:          str
    pass_token_id:    str
    tier:             Literal["BASIC", "VERIFIED", "TRUSTED", "GUARDIAN"]
    verified_domains: list[str] = []
    is_validator:     bool = False
    community_score:  float = 0.0
    pass_issued_at:   int   = 0


# ── Trust Graph ───────────────────────────────────────────────────────────────

class TrustGraph(BaseModel):
    identity_trust:           float  # 0–100
    validator_participation:  float  # 0–100
    community_contribution:   float  # 0–100
    on_chain_reliability:     float  # 0–100
    composite:                float  # 0–100
    tier:                     TrustTier


# ── Financial Profile ─────────────────────────────────────────────────────────

class ChainActivity(BaseModel):
    chain_id:      int
    chain_name:    str
    value_usd:     float
    tx_count:      int
    last_activity: int

class LendingPosition(BaseModel):
    protocol:       str
    supply_usd:     float
    borrow_usd:     float
    health_factor:  float
    collateral_token: str

class DexActivity(BaseModel):
    total_swaps_30d: int
    volume_usd:      float
    preferred_pairs: list[str]
    avg_slippage:    float

class RecoveryReadiness(BaseModel):
    has_recovery_vault: bool
    vault_balance_usd:  float
    last_verified_at:   int

class FinancialProfile(BaseModel):
    total_value_usd:    float
    stablecoin_ratio:   float  # 0–1
    chain_spread:       list[ChainActivity]
    lending_positions:  list[LendingPosition]
    dex_activity:       DexActivity
    recovery_readiness: RecoveryReadiness


# ── Trust Profile (combined) ──────────────────────────────────────────────────

class TrustProfile(BaseModel):
    address:    str
    qie_pass:   QiePassIdentity
    financial:  FinancialProfile
    trust_graph: TrustGraph
    built_at:   int
    version:    str = "1.0"


# ── Sub-score ─────────────────────────────────────────────────────────────────

class SubScore(BaseModel):
    value:      float
    max_value:  float = 100.0
    label:      str
    reason:     str
    weight:     float


# ── Resilience Score ──────────────────────────────────────────────────────────

class ResilienceScore(BaseModel):
    total:               float  # 0–1000
    asset_stability:     SubScore
    recovery_readiness:  SubScore
    contract_integrity:  SubScore
    stablecoin_buffer:   SubScore
    chain_breadth:       SubScore
    label:               ScoreLabel
    trend:               Literal["IMPROVING", "STABLE", "DECLINING"] = "STABLE"
    computed_at:         int


# ── Risk ──────────────────────────────────────────────────────────────────────

class RiskTrigger(BaseModel):
    id:                 str
    label:              str
    severity:           RiskSeverity
    description:        str
    recommended_action: str

class RiskReport(BaseModel):
    address:      str
    triggers:     list[RiskTrigger]
    overall_risk: Literal["LOW", "MEDIUM", "HIGH", "CRITICAL"]
    generated_at: int


# ── Protection ────────────────────────────────────────────────────────────────

class ProtectionAction(BaseModel):
    id:                str
    type:              ProtectionActionType
    title:             str
    reason:            str
    estimated_gas_usd: float
    estimated_impact:  str
    priority:          Literal["LOW", "MEDIUM", "HIGH", "CRITICAL"]
    status:            Literal["PENDING", "EXECUTING", "COMPLETE", "FAILED"] = "PENDING"
    tx_hash:           Optional[str] = None

class ProtectionPlan(BaseModel):
    address:                        str
    actions:                        list[ProtectionAction]
    estimated_coverage_increase:    float
    generated_at:                   int


# ── Audit ─────────────────────────────────────────────────────────────────────

class AuditFinding(BaseModel):
    severity:    Literal["INFO", "LOW", "MEDIUM", "HIGH", "CRITICAL"]
    title:       str
    description: str

class ContractAudit(BaseModel):
    contract_address: str
    contract_name:    str
    integrity_score:  float
    findings:         list[AuditFinding]
    last_checked:     int

class AuditSummary(BaseModel):
    address:            str
    contracts_audited:  list[ContractAudit]
    overall_integrity:  float
    ipfs_cid:           Optional[str] = None
    anchored_at:        int


# ── Recovery ──────────────────────────────────────────────────────────────────

class RecoveryClaim(BaseModel):
    claim_id:         str
    claimant_address: str
    token_address:    str
    token_symbol:     str
    amount:           str
    target_contract:  str
    proof_signature:  str
    tx_hash:          Optional[str] = None
    status:           ClaimStatus = ClaimStatus.PENDING
    submitted_at:     int


# ── Guardian Mode ─────────────────────────────────────────────────────────────

class GuardianStep(BaseModel):
    id:          str
    label:       str
    description: str
    status:      Literal["PENDING", "EXECUTING", "COMPLETE"]
    tx_hash:     Optional[str] = None
    contract:    Optional[str] = None

class GuardianStatus(BaseModel):
    is_active:           bool
    activated_at:        Optional[int] = None
    protection_coverage: float  # 0–100
    steps:               list[GuardianStep]


# ── API Request / Response shapes ─────────────────────────────────────────────

class ProfileBuildRequest(BaseModel):
    address: str
    chain_ids: list[int] = [1234]

class ScoreResponse(BaseModel):
    profile:  TrustProfile
    score:    ResilienceScore
    risk:     RiskReport
    guardian: GuardianStatus

class ProtectionPlanRequest(BaseModel):
    address: str
    risk:    RiskReport

class ChatRequest(BaseModel):
    address: str
    message: str

class ChatResponse(BaseModel):
    reply:    str
    actions:  list[ProtectionAction] = []
    score_delta: Optional[float] = None

class HealthResponse(BaseModel):
    status:  str = "ok"
    version: str = "1.0.0"
    service: str = "aurix-oracle"
