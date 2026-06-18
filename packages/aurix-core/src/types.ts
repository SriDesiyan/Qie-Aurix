// ─────────────────────────────────────────────────────────────────────────────
// QIE Aurix — Core Types
// All shared data structures across the monorepo
// ─────────────────────────────────────────────────────────────────────────────

// ── QIE Identity ─────────────────────────────────────────────────────────────

export interface QiePassIdentity {
  address: string;
  passTokenId: string;
  tier: "BASIC" | "VERIFIED" | "TRUSTED" | "GUARDIAN";
  verifiedDomains: string[];          // e.g. ["family.aurix.qie"]
  isValidator: boolean;
  communityScore: number;             // 0–100
  passIssuedAt: number;               // unix timestamp
}

// ── Trust Profile ─────────────────────────────────────────────────────────────

export interface TrustProfile {
  address: string;
  qiePass: QiePassIdentity;
  financial: FinancialProfile;
  trustGraph: TrustGraph;
  builtAt: number;                    // unix timestamp
  version: string;                    // profile schema version
}

export interface FinancialProfile {
  totalValueUsd: number;
  stablecoinRatio: number;            // 0–1
  chainSpread: ChainActivity[];
  lendingPositions: LendingPosition[];
  dexActivity: DexActivity;
  recoveryReadiness: RecoveryReadiness;
}

export interface ChainActivity {
  chainId: number;
  chainName: string;
  valueUsd: number;
  txCount: number;
  lastActivityAt: number;
}

export interface LendingPosition {
  protocol: string;
  supplyUsd: number;
  borrowUsd: number;
  healthFactor: number;               // >1.5 healthy, <1.2 at risk
  collateralToken: string;
}

export interface DexActivity {
  totalSwapsLast30d: number;
  volumeUsd: number;
  preferredPairs: string[];
  avgSlippage: number;
}

export interface RecoveryReadiness {
  hasRecoveryVault: boolean;
  vaultBalanceUsd: number;
  lastVerifiedAt: number;
}

// ── QIE Trust Graph (new axis) ────────────────────────────────────────────────

export interface TrustGraph {
  identityTrust: number;              // 0–100: QIE Pass tier + verification depth
  validatorParticipation: number;     // 0–100: staking / validator activity
  communityContribution: number;      // 0–100: governance, contributions
  onChainReliability: number;         // 0–100: tx success rate, wallet age, consistency
  composite: number;                  // 0–100: weighted composite
  tier: TrustTier;
}

export type TrustTier = "UNVERIFIED" | "BASIC" | "VERIFIED" | "TRUSTED" | "GUARDIAN";

// ── Resilience Score ──────────────────────────────────────────────────────────

export interface ResilienceScore {
  total: number;                      // 0–1000
  assetStability: SubScore;
  recoveryReadiness: SubScore;
  contractIntegrity: SubScore;
  stablecoinBuffer: SubScore;
  chainBreadth: SubScore;
  label: ScoreLabel;
  trend: "IMPROVING" | "STABLE" | "DECLINING";
  computedAt: number;
}

export interface SubScore {
  value: number;                      // 0–100
  maxValue: number;
  label: string;
  reason: string;
  weight: number;
}

export type ScoreLabel = "CRITICAL" | "WEAK" | "MODERATE" | "STRONG" | "GUARDIAN";

// ── Risk Report ───────────────────────────────────────────────────────────────

export interface RiskReport {
  address: string;
  triggers: RiskTrigger[];
  overallRisk: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  generatedAt: number;
}

export interface RiskTrigger {
  id: string;
  label: string;
  severity: "INFO" | "WARNING" | "HIGH" | "CRITICAL";
  description: string;
  affectedScore: keyof ResilienceScore;
  recommendedAction: string;
}

// ── Protection Plan ───────────────────────────────────────────────────────────

export interface ProtectionPlan {
  address: string;
  actions: ProtectionAction[];
  estimatedCoverageIncrease: number;  // percentage points
  generatedAt: number;
}

export interface ProtectionAction {
  id: string;
  type: ProtectionActionType;
  title: string;
  reason: string;
  estimatedGasUsd: number;
  estimatedImpact: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status: "PENDING" | "EXECUTING" | "COMPLETE" | "FAILED";
  txHash?: string;
}

export type ProtectionActionType =
  | "SWAP_TO_QUSDC"
  | "ACTIVATE_EMERGENCY_VAULT"
  | "SET_FAMILY_VAULT"
  | "ENABLE_RECOVERY_GATE"
  | "ANCHOR_AUDIT"
  | "REBALANCE_LENDING";

// ── Guardian Mode ─────────────────────────────────────────────────────────────

export interface GuardianStatus {
  isActive: boolean;
  activatedAt?: number;
  protectionCoverage: number;         // 0–100 percent
  steps: GuardianStep[];
}

export interface GuardianStep {
  id: string;
  label: string;
  description: string;
  status: "PENDING" | "EXECUTING" | "COMPLETE";
  txHash?: string;
  contract?: string;
}

// ── Family Vault ──────────────────────────────────────────────────────────────

export interface FamilyVault {
  vaultId: string;
  domainName: string;                 // e.g. "family.aurix.qie"
  ownerAddress: string;
  heirs: HeirDesignation[];
  balanceUsd: number;
  timeLockDays: number;
  isDeployed: boolean;
  deployedAt?: number;
  contractAddress?: string;
}

export interface HeirDesignation {
  address: string;
  qiePassVerified: boolean;
  allocationPercent: number;
  claimDelay: number;                 // seconds
}

// ── Recovery ─────────────────────────────────────────────────────────────────

export interface RecoveryClaim {
  claimId: string;
  claimantAddress: string;
  tokenAddress: string;
  tokenSymbol: string;
  amount: string;
  targetContract: string;
  proofSignature: string;
  status: "PENDING" | "VERIFIED" | "RELEASED" | "REJECTED";
  submittedAt: number;
}

// ── Audit ────────────────────────────────────────────────────────────────────

export interface AuditSummary {
  address: string;
  contractsAudited: ContractAudit[];
  overallIntegrity: number;           // 0–100
  ipfsCid?: string;
  anchoredAt: number;
}

export interface ContractAudit {
  contractAddress: string;
  contractName: string;
  integrityScore: number;
  findings: AuditFinding[];
  lastChecked: number;
}

export interface AuditFinding {
  severity: "INFO" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  title: string;
  description: string;
}
