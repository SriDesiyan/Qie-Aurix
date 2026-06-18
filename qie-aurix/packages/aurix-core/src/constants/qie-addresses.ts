// ─────────────────────────────────────────────────────────────────────────────
// QIE Aurix — QIE Ecosystem Contract Addresses
// All addresses are placeholders. Replace before mainnet deployment.
// ─────────────────────────────────────────────────────────────────────────────

export const QIE_ADDRESSES = {
  /** QIE Pass — Identity NFT / soulbound token */
  PASS:    "0x0000000000000000000000000000000000000000",
  /** QIE DEX — Protective swap router */
  DEX:     "0x0000000000000000000000000000000000000000",
  /** QIELend — Lending and borrowing protocol */
  LEND:    "0x0000000000000000000000000000000000000000",
  /** QUSDC — QIE stable protection asset */
  QUSDC:   "0x0000000000000000000000000000000000000000",
  /** QIE Domains — ENS-style domain registry */
  DOMAINS: "0x0000000000000000000000000000000000000000",
  /** QIE Bridge — Cross-chain asset bridge */
  BRIDGE:  "0x0000000000000000000000000000000000000000",
  /** QIE Wallet — Native wallet contract (if applicable) */
  WALLET:  "0x0000000000000000000000000000000000000000",
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Aurix Protocol Contract Addresses (filled after deployment)
// ─────────────────────────────────────────────────────────────────────────────

export const AURIX_ADDRESSES = {
  TRUST_PROFILE_REGISTRY:    process.env.NEXT_PUBLIC_TRUST_PROFILE_REGISTRY    ?? "0x0000000000000000000000000000000000000000",
  RESILIENCE_POLICY_VAULT:   process.env.NEXT_PUBLIC_RESILIENCE_POLICY_VAULT   ?? "0x0000000000000000000000000000000000000000",
  AURIX_RECOVERY_GATE:       process.env.NEXT_PUBLIC_AURIX_RECOVERY_GATE       ?? "0x0000000000000000000000000000000000000000",
  SAFETY_AUDIT_ANCHOR:       process.env.NEXT_PUBLIC_SAFETY_AUDIT_ANCHOR       ?? "0x0000000000000000000000000000000000000000",
  FAMILY_VAULT_CONTROLLER:   process.env.NEXT_PUBLIC_FAMILY_VAULT_CONTROLLER   ?? "0x0000000000000000000000000000000000000000",
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Score Thresholds
// ─────────────────────────────────────────────────────────────────────────────

export const SCORE_THRESHOLDS = {
  CRITICAL:  { min: 0,   max: 200 },
  WEAK:      { min: 201, max: 400 },
  MODERATE:  { min: 401, max: 600 },
  STRONG:    { min: 601, max: 800 },
  GUARDIAN:  { min: 801, max: 1000 },
} as const;

export const TRUST_TIER_THRESHOLDS = {
  UNVERIFIED: { min: 0,  max: 20  },
  BASIC:      { min: 21, max: 40  },
  VERIFIED:   { min: 41, max: 65  },
  TRUSTED:    { min: 66, max: 85  },
  GUARDIAN:   { min: 86, max: 100 },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Score Weights (must sum to 1.0)
// ─────────────────────────────────────────────────────────────────────────────

export const FINANCIAL_SCORE_WEIGHTS = {
  assetStability:     0.30,
  recoveryReadiness:  0.25,
  contractIntegrity:  0.20,
  stablecoinBuffer:   0.15,
  chainBreadth:       0.10,
} as const;

export const TRUST_GRAPH_WEIGHTS = {
  identityTrust:           0.35,
  validatorParticipation:  0.25,
  communityContribution:   0.25,
  onChainReliability:      0.15,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Guardian Mode Steps
// ─────────────────────────────────────────────────────────────────────────────

export const GUARDIAN_STEPS = [
  {
    id: "emergency-reserve",
    label: "Emergency Reserve",
    description: "Creating QUSDC emergency reserve in ResiliencePolicyVault",
    contract: "ResiliencePolicyVault",
  },
  {
    id: "family-vault",
    label: "Family Vault",
    description: "Deploying named Family Vault via FamilyVaultController",
    contract: "FamilyVaultController",
  },
  {
    id: "recovery-protection",
    label: "Recovery Protection",
    description: "Enabling AurixRecoveryGate for mis-transfer recovery",
    contract: "AurixRecoveryGate",
  },
  {
    id: "risk-monitoring",
    label: "Risk Monitoring",
    description: "Anchoring risk snapshot in SafetyAuditAnchor",
    contract: "SafetyAuditAnchor",
  },
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Oracle Configuration
// ─────────────────────────────────────────────────────────────────────────────

export const ORACLE_BASE_URL = process.env.NEXT_PUBLIC_ORACLE_URL ?? "http://localhost:8000";

// ─────────────────────────────────────────────────────────────────────────────
// QIE Domain Suffix
// ─────────────────────────────────────────────────────────────────────────────

export const QIE_DOMAIN_SUFFIX = ".aurix.qie";
