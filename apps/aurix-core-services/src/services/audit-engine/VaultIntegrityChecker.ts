/**
 * AurixAuditEngine — VaultIntegrityChecker
 *
 * Checks the integrity of all Aurix vaults for a given user:
 *   - ResiliencePolicyVault: reserve balance, lock state
 *   - FamilyVaultController: heir count, balance thresholds
 *   - AurixRecoveryGate:     pending claim count, stale claims
 *   - SafetyAuditAnchor:     last anchor recency
 *   - TrustProfileRegistry:  guardian mode consistency
 *
 * Original Aurix implementation — no source project mapped.
 * Concept: OracleSentry vault health monitoring.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export interface VaultSnapshot {
  name:           string;   // Aurix vault/contract name
  address:        string;
  balanceUsd:     number;
  isHealthy:      boolean;
  healthScore:    number;   // 0–100
  issues:         string[];
  lastChecked:    number;   // unix ms
}

export interface VaultReport {
  owner:          string;
  snapshots:      VaultSnapshot[];
  overallScore:   number;   // 0–100 average
  criticalCount:  number;
  auditedAt:      number;
}

export interface RawVaultData {
  policyVault: {
    active:          boolean;
    reserveBalance:  number;   // USD
    emergencyLocked: boolean;
    lockExpiry:      number;
  };
  familyVault: {
    exists:        boolean;
    balance:       number;   // USD
    heirCount:     number;
    timeLockDays:  number;
  };
  recoveryGate: {
    pendingClaims:  number;
    oldestClaimAge: number;   // seconds
  };
  auditAnchor: {
    lastAnchorAge:  number;   // seconds since last anchor
    anchorCount:    number;
  };
  profileRegistry: {
    guardianActive: boolean;
    trustScore:     number;
  };
}

// ── Thresholds ────────────────────────────────────────────────────────────────
const MIN_FAMILY_BALANCE_USD = 100;
const MAX_STALE_ANCHOR_SECS  = 7 * 24 * 3600;   // 7 days
const MAX_CLAIM_AGE_SECS     = 30 * 24 * 3600;  // 30 days

// ── VaultIntegrityChecker ─────────────────────────────────────────────────────

export class VaultIntegrityChecker {

  static check(owner: string, data: RawVaultData): VaultReport {
    const snapshots: VaultSnapshot[] = [
      this._checkPolicyVault(data.policyVault),
      this._checkFamilyVault(data.familyVault),
      this._checkRecoveryGate(data.recoveryGate),
      this._checkAuditAnchor(data.auditAnchor),
      this._checkProfileRegistry(data.profileRegistry),
    ];

    const overallScore   = Math.round(snapshots.reduce((s, v) => s + v.healthScore, 0) / snapshots.length);
    const criticalCount  = snapshots.filter(v => !v.isHealthy).length;

    return { owner, snapshots, overallScore, criticalCount, auditedAt: Date.now() };
  }

  private static _checkPolicyVault(d: RawVaultData["policyVault"]): VaultSnapshot {
    const issues: string[] = [];
    if (!d.active) issues.push("No active protection policy");
    if (d.reserveBalance < 50) issues.push(`Reserve below $50 minimum (current: $${d.reserveBalance.toFixed(2)})`);
    if (d.emergencyLocked && d.lockExpiry < Date.now() / 1000) issues.push("Emergency lock expired — call release");
    const score = Math.max(0, 100 - issues.length * 30);
    return {
      name: "Resilience Policy Vault", address: "",
      balanceUsd: d.reserveBalance, isHealthy: issues.length === 0,
      healthScore: score, issues, lastChecked: Date.now(),
    };
  }

  private static _checkFamilyVault(d: RawVaultData["familyVault"]): VaultSnapshot {
    const issues: string[] = [];
    if (!d.exists) issues.push("No Family Vault configured — heirs cannot access funds");
    if (d.exists && d.heirCount === 0) issues.push("Family Vault has no designated heirs");
    if (d.exists && d.balance < MIN_FAMILY_BALANCE_USD) issues.push(`Family Vault balance is below $${MIN_FAMILY_BALANCE_USD}`);
    const score = Math.max(0, 100 - issues.length * 25);
    return {
      name: "Family Vault", address: "",
      balanceUsd: d.balance, isHealthy: issues.length === 0,
      healthScore: score, issues, lastChecked: Date.now(),
    };
  }

  private static _checkRecoveryGate(d: RawVaultData["recoveryGate"]): VaultSnapshot {
    const issues: string[] = [];
    if (d.pendingClaims > 5) issues.push(`${d.pendingClaims} pending recovery claims — review for resolution`);
    if (d.oldestClaimAge > MAX_CLAIM_AGE_SECS) issues.push("Oldest pending claim is over 30 days old — may need manual review");
    const score = Math.max(0, 100 - issues.length * 20);
    return {
      name: "Recovery Gate", address: "",
      balanceUsd: 0, isHealthy: issues.length === 0,
      healthScore: score, issues, lastChecked: Date.now(),
    };
  }

  private static _checkAuditAnchor(d: RawVaultData["auditAnchor"]): VaultSnapshot {
    const issues: string[] = [];
    if (d.anchorCount === 0) issues.push("No audit anchors found — run first audit");
    if (d.lastAnchorAge > MAX_STALE_ANCHOR_SECS) {
      const days = Math.round(d.lastAnchorAge / 86400);
      issues.push(`Last audit anchor was ${days} days ago — run fresh audit`);
    }
    const score = Math.max(0, 100 - issues.length * 20);
    return {
      name: "Safety Audit Anchor", address: "",
      balanceUsd: 0, isHealthy: issues.length === 0,
      healthScore: score, issues, lastChecked: Date.now(),
    };
  }

  private static _checkProfileRegistry(d: RawVaultData["profileRegistry"]): VaultSnapshot {
    const issues: string[] = [];
    if (!d.guardianActive) issues.push("Guardian Mode is not active — full protection not engaged");
    if (d.trustScore < 500) issues.push(`Trust score (${d.trustScore}/1000) is below recommended minimum of 500`);
    const score = Math.max(0, 100 - issues.length * 25);
    return {
      name: "Trust Profile Registry", address: "",
      balanceUsd: 0, isHealthy: issues.length === 0,
      healthScore: score, issues, lastChecked: Date.now(),
    };
  }
}
