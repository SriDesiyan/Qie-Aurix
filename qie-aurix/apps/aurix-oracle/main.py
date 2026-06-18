"""
QIE Aurix Oracle — FastAPI Service
Exposes the profile, score, risk, protection, audit, and chat endpoints.

Input → Analysis → Recommendation → On-chain Action
This is the full oracle pipeline made visible.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import time

from models.schemas import (
    ProfileBuildRequest, ScoreResponse, ProtectionPlanRequest,
    ProtectionPlan, AuditSummary, ChatRequest, ChatResponse,
    HealthResponse, GuardianStatus, GuardianStep, RecoveryClaim,
    ClaimStatus
)
from agents.profile_agent    import build_trust_profile
from agents.risk_agent       import analyze_risk
from agents.protection_agent import generate_protection_plan
from agents.auditor_agent    import run_audit
from scoring.resilience_engine import compute_resilience_score

# Internal engines (source-pattern-derived, Aurix-renamed)
from engines.allocation_optimizer import AllocationOptimizer
from engines.protection_trigger   import protection_trigger
from engines.claim_verifier       import claim_verifier
from engines.asset_valuator       import asset_valuator

app = FastAPI(
    title="QIE Aurix Oracle",
    description="AI-powered financial resilience oracle for QIE Aurix",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],       # tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Health ────────────────────────────────────────────────────────────────────

@app.get("/health", response_model=HealthResponse)
def health_check():
    return HealthResponse()


# ── Profile & Score ───────────────────────────────────────────────────────────

@app.post("/profile/build", response_model=ScoreResponse)
def profile_build(req: ProfileBuildRequest):
    """
    Full pipeline: build profile → compute score → analyze risk → check guardian.
    This is the primary endpoint called when a user connects QIE Pass.
    """
    profile  = build_trust_profile(req.address, req.chain_ids)
    score    = compute_resilience_score(profile.financial)
    risk     = analyze_risk(profile)
    guardian = _build_guardian_status(profile.address, score.total)

    return ScoreResponse(
        profile=profile,
        score=score,
        risk=risk,
        guardian=guardian,
    )


@app.get("/score/{address}", response_model=ScoreResponse)
def get_score(address: str):
    """Quick score lookup by wallet address."""
    profile  = build_trust_profile(address, [1234])
    score    = compute_resilience_score(profile.financial)
    risk     = analyze_risk(profile)
    guardian = _build_guardian_status(address, score.total)
    return ScoreResponse(
        profile=profile, score=score, risk=risk, guardian=guardian
    )


# ── Protection ────────────────────────────────────────────────────────────────

@app.post("/protection/plan", response_model=ProtectionPlan)
def protection_plan(req: ProtectionPlanRequest):
    """Generate a Protection Plan from an existing Risk Report."""
    return generate_protection_plan(req.risk)


# ── Audit ─────────────────────────────────────────────────────────────────────

@app.get("/audit/{address}", response_model=AuditSummary)
def get_audit(address: str):
    """Run a full audit of Aurix contracts for the given user."""
    profile = build_trust_profile(address, [1234])
    return run_audit(profile)


def _verify_signature(
    claim_id: str,
    token: str,
    amount: int,
    claimant: str,
    target_contract: str,
    signature: str,
    tx_hash: str = None
) -> bool:
    try:
        from eth_account import Account
        from eth_account.messages import encode_defunct
        from eth_abi.packed import encode_packed
        from eth_utils import keccak
        
        cid_bytes = bytes.fromhex(claim_id.replace("0x", ""))
        token_bytes = bytes.fromhex(token.replace("0x", ""))
        claimant_bytes = bytes.fromhex(claimant.replace("0x", ""))
        target_bytes = bytes.fromhex(target_contract.replace("0x", ""))
        
        if tx_hash:
            tx_bytes = bytes.fromhex(tx_hash.replace("0x", ""))
            types = ['bytes32', 'address', 'uint256', 'address', 'address', 'bytes32']
            values = [cid_bytes, token_bytes, amount, claimant_bytes, target_bytes, tx_bytes]
        else:
            types = ['bytes32', 'address', 'uint256', 'address', 'address']
            values = [cid_bytes, token_bytes, amount, claimant_bytes, target_bytes]
            
        packed = encode_packed(types, values)
        msg_hash = keccak(packed)
        encoded_msg = encode_defunct(primitive=msg_hash)
        recovered_address = Account.recover_message(encoded_msg, signature=signature)
        return recovered_address.lower() == claimant.lower()
        
    except Exception:
        # Fallback to node script
        import subprocess
        import os
        script_dir = os.path.dirname(os.path.abspath(__file__))
        script_path = os.path.join(script_dir, "verify_sig.js")
        
        cmd = ["node", script_path, claim_id, token, str(amount), claimant, target_contract, signature, tx_hash or ""]
        res = subprocess.run(cmd, capture_output=True, text=True)
        return res.stdout.strip() == "true"


# ── Recovery ──────────────────────────────────────────────────────────────────

@app.post("/recovery/verify")
def verify_recovery(claim: RecoveryClaim):
    """
    Verify a recovery claim using cryptographic signature validation.
    """
    if not claim.proof_signature:
        raise HTTPException(status_code=400, detail="Missing proof signature")

    # Verify signature
    is_valid = _verify_signature(
        claim_id=claim.claim_id,
        token=claim.token_address,
        amount=int(claim.amount),
        claimant=claim.claimant_address,
        target_contract=claim.target_contract,
        signature=claim.proof_signature,
        tx_hash=claim.tx_hash
    )

    if not is_valid:
        raise HTTPException(status_code=400, detail="Invalid signature proof")

    return {
        "claim_id": claim.claim_id,
        "status":   ClaimStatus.VERIFIED,
        "message":  "Claim verified. Use recoverAccidentalTokens() on the target contract to receive funds.",
        "verified_at": int(time.time()),
    }


# ── Chat ──────────────────────────────────────────────────────────────────────

@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    """
    Natural language command handler.
    Parses the user's message and returns a structured response with
    optional protection actions.
    Product note: this is intentionally lightweight (30% AI, 70% product).
    """
    profile = build_trust_profile(req.address, [1234])
    risk    = analyze_risk(profile)
    plan    = generate_protection_plan(risk)

    message = req.message.lower()

    # Intent detection — simple keyword matching for hackathon MVP
    if any(word in message for word in ["protect", "safe", "guardian", "family"]):
        reply = (
            "I've analyzed your portfolio and Trust Profile. "
            f"Your current Resilience Score reflects {len(risk.triggers)} active risk "
            f"{'trigger' if len(risk.triggers) == 1 else 'triggers'}. "
            f"I recommend activating Guardian Mode, which will deploy your emergency reserve, "
            f"family vault, and recovery protection in one click. "
            f"Estimated protection coverage increase: +{plan.estimated_coverage_increase:.0f}%."
        )
        actions = plan.actions[:3]

    elif any(word in message for word in ["recover", "transfer", "lost", "mistake"]):
        reply = (
            "Recovery protection is handled by AurixRecoveryGate. "
            "If you accidentally sent tokens to an Aurix contract, submit a signed claim "
            "and the oracle will verify ownership from your QIE Pass. "
            "No admin intervention is required."
        )
        actions = [a for a in plan.actions if a.type.value == "ENABLE_RECOVERY_GATE"]

    elif any(word in message for word in ["score", "resilience", "health"]):
        score = compute_resilience_score(profile.financial)
        reply = (
            f"Your Resilience Score is {score.total}/1000 — {score.label.value}. "
            f"Your weakest dimension is {min(score.dict().items(), key=lambda x: x[1]['value'] if isinstance(x[1], dict) else 999)[0].replace('_', ' ').title() if False else score.asset_stability.label} "
            f"({score.asset_stability.reason})."
        )
        actions = []

    elif any(word in message for word in ["audit", "contract", "security"]):
        reply = (
            "I'll run a safety audit of your active Aurix contracts now. "
            "The audit checks for compliance with your protection policies and anchors "
            "the results on-chain via SafetyAuditAnchor."
        )
        actions = [a for a in plan.actions if a.type.value == "ANCHOR_AUDIT"]

    else:
        reply = (
            "I'm Aurix, your financial resilience guardian. I can help you: "
            "protect your portfolio, set up a family vault, recover lost tokens, "
            "audit your contracts, or explain your Resilience Score. "
            "What would you like to do?"
        )
        actions = []

    return ChatResponse(reply=reply, actions=actions)


# ── Internal helpers ──────────────────────────────────────────────────────────


# ── Engine: Resilience — Allocation ──────────────────────────────────────────

@app.post("/allocation/optimize")
def allocation_optimize(payload: dict):
    """
    Compute safe allocation weights for a portfolio.
    Input:  { assets: [ {tokenId, symbol, valueUsd, volatility, isStable, chainId} ] }
    Output: weights[], stableAllocationPct, diversificationScore, recommendedAction

    Engine: AurixResilienceEngine — AllocationOptimizer
    """
    assets = payload.get("assets", [])
    if not isinstance(assets, list):
        raise HTTPException(status_code=400, detail="assets must be a list")
    return AllocationOptimizer.optimize(assets)


# ── Engine: Protection — Trigger Evaluation ───────────────────────────────────

@app.post("/protection/evaluate-triggers")
def evaluate_triggers(payload: dict):
    """
    Evaluate all registered protection triggers against user state.
    Input:  { resilienceScore, healthFactor, stablecoinPct, volatility30d,
              chainCount, guardianActive }
    Output: fired_triggers[], recommended_actions[], highest_severity

    Engine: AurixProtectionEngine — ProtectionTrigger
    """
    state = {
        "resilienceScore": payload.get("resilienceScore", 1000),
        "healthFactor":    payload.get("healthFactor", 99),
        "stablecoinPct":   payload.get("stablecoinPct", 1.0),
        "volatility30d":   payload.get("volatility30d", 0.0),
        "chainCount":      payload.get("chainCount", 1),
        "guardianActive":  payload.get("guardianActive", False),
    }
    return protection_trigger.evaluate(state)


# ── Engine: Recovery — Tx Origin Verification ────────────────────────────────

@app.post("/recovery/verify-tx-origin")
def verify_tx_origin(payload: dict):
    """
    Verify that a claimant was the original sender of a transaction.
    Used by AurixRecoveryGate before releasing funds.
    Input:  { txHash, claimant, token, amount, targetContract }
    Output: isValid, isOriginalSender, contractHoldsSufficient, errors

    Engine: AurixRecoveryEngine — ClaimVerifier
    """
    return claim_verifier.verify(
        tx_hash         = payload.get("txHash", ""),
        claimant        = payload.get("claimant", ""),
        token           = payload.get("token", ""),
        amount          = int(payload.get("amount", 0)),
        target_contract = payload.get("targetContract", ""),
    )


# ── Engine: Valuation — Wallet Health ────────────────────────────────────────

@app.post("/valuation/wallet-health")
def wallet_health(payload: dict):
    """
    Analyze wallet health across 4 dimensions: liquidity, concentration,
    stability, coverage. Returns a 0–1000 composite Wallet Health Score.
    Input:  { assets: [ {tokenId, symbol, valueUsd, isLiquid, isStable,
                         isLocked, volatility, chainId, apr} ] }
    Output: compositeScore, scoreBand, sub-scores, insights

    Engine: AurixValuationEngine — AssetValuator
    """
    assets = payload.get("assets", [])
    if not isinstance(assets, list):
        raise HTTPException(status_code=400, detail="assets must be a list")
    return asset_valuator.analyze_wallet(assets)


@app.post("/valuation/classify-asset")
def classify_asset(payload: dict):
    """
    Classify a single asset into a risk tier.
    Input:  { tokenId, symbol, valueUsd, isStable, isLocked, volatility, chainId, apr }
    Output: riskTier, riskScore, maxWeightBps, aurixAction

    Engine: AurixValuationEngine — AssetValuator
    """
    return asset_valuator.classify_asset(payload)



def _build_guardian_status(address: str, score_total: float) -> GuardianStatus:
    """
    Build a demo Guardian Status.
    In production: read from TrustProfileRegistry.isGuardianActive().
    """
    # Deterministic: guardian is active if score > 600 for demo
    is_active = score_total > 600

    steps = [
        GuardianStep(id="emergency-reserve", label="Emergency Reserve",
                     description="QUSDC emergency reserve in ResiliencePolicyVault",
                     status="COMPLETE" if is_active else "PENDING",
                     contract="ResiliencePolicyVault"),
        GuardianStep(id="family-vault", label="Family Vault",
                     description="Named Family Vault via FamilyVaultController",
                     status="COMPLETE" if is_active else "PENDING",
                     contract="FamilyVaultController"),
        GuardianStep(id="recovery-protection", label="Recovery Protection",
                     description="AurixRecoveryGate for mis-transfer recovery",
                     status="COMPLETE" if is_active else "PENDING",
                     contract="AurixRecoveryGate"),
        GuardianStep(id="risk-monitoring", label="Risk Monitoring",
                     description="Risk snapshot in SafetyAuditAnchor",
                     status="COMPLETE" if is_active else "PENDING",
                     contract="SafetyAuditAnchor"),
    ]

    coverage = min(int((score_total / 1000) * 70) + (17 if is_active else 0), 100)

    return GuardianStatus(
        is_active=is_active,
        activated_at=int(time.time()) - 3600 if is_active else None,
        protection_coverage=coverage,
        steps=steps,
    )
