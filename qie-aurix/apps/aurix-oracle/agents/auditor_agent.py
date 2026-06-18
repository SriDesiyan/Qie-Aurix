"""
QIE Aurix Oracle — Auditor Agent
Periodically checks protection policies for compliance and
generates an audit summary for anchoring to SafetyAuditAnchor.
"""

import time
from models.schemas import (
    AuditSummary, ContractAudit, AuditFinding, TrustProfile
)

# Known Aurix contract names for display
AURIX_CONTRACTS = [
    "TrustProfileRegistry",
    "ResiliencePolicyVault",
    "AurixRecoveryGate",
    "SafetyAuditAnchor",
    "FamilyVaultController",
]

def _audit_contract(
    contract_name: str,
    contract_address: str,
    profile: TrustProfile,
) -> ContractAudit:
    """
    Simulate a contract audit.
    In production: fetch bytecode, run static analysis, compare with known-good hash.
    """
    findings: list[AuditFinding] = []
    integrity = 95.0  # Start high, deduct for findings

    # Check if recovery gate is enabled
    if contract_name == "AurixRecoveryGate":
        if not profile.financial.recovery_readiness.has_recovery_vault:
            findings.append(AuditFinding(
                severity="MEDIUM",
                title="Recovery Gate Not Activated",
                description="AurixRecoveryGate exists but no recovery vault is linked for this user.",
            ))
            integrity -= 10

    # Check lending position health
    if contract_name == "ResiliencePolicyVault":
        for pos in profile.financial.lending_positions:
            if pos.health_factor < 1.5:
                findings.append(AuditFinding(
                    severity="HIGH",
                    title="Low Collateral Health Factor",
                    description=(
                        f"{pos.protocol} position has health factor {pos.health_factor:.2f}. "
                        "Policy vault may be exposed to undercollateralized lending risk."
                    ),
                ))
                integrity -= 15

    # Generic best practice check
    if profile.financial.stablecoin_ratio < 0.05:
        findings.append(AuditFinding(
            severity="LOW",
            title="Low Stablecoin Allocation",
            description="Portfolio stablecoin ratio is below 5%. Consider diversifying into QUSDC.",
        ))
        integrity -= 5

    return ContractAudit(
        contract_address=contract_address,
        contract_name=contract_name,
        integrity_score=max(integrity, 0.0),
        findings=findings,
        last_checked=int(time.time()),
    )


# ── Public API ────────────────────────────────────────────────────────────────

def run_audit(profile: TrustProfile, contract_addresses: dict[str, str] | None = None) -> AuditSummary:
    """
    Run a full audit of all Aurix contracts for the given user.
    contract_addresses: dict mapping contract name → address
    If not provided, uses placeholder addresses.
    """
    addresses = contract_addresses or {
        name: f"0x{'0' * 38}{i+1:02d}" for i, name in enumerate(AURIX_CONTRACTS)
    }

    audits: list[ContractAudit] = []
    for name in AURIX_CONTRACTS:
        addr = addresses.get(name, "0x" + "0" * 40)
        audits.append(_audit_contract(name, addr, profile))

    overall = sum(a.integrity_score for a in audits) / len(audits) if audits else 0.0

    return AuditSummary(
        address=profile.address,
        contracts_audited=audits,
        overall_integrity=round(overall, 1),
        ipfs_cid=None,   # populated after IPFS upload in production
        anchored_at=int(time.time()),
    )
