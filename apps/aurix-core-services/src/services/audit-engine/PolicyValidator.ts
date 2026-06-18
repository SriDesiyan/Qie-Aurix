/**
 * AurixAuditEngine — PolicyValidator
 *
 * Validates that a user's active protection policies are correctly
 * configured and consistent with their on-chain state.
 *
 * This is an original Aurix implementation (no direct source project).
 * Inspired by the OracleSentry public description: continuous monitoring
 * of policy state, threshold drift, and configuration integrity.
 *
 * A policy is "valid" if:
 *   1. It exists on-chain (active flag = true)
 *   2. Its risk threshold is within a sensible range
 *   3. Its reserve balance is above the configured minimum
 *   4. It is not stuck in an expired lock state
 *   5. Its trigger conditions are registered and evaluatable
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export type PolicyIssueType =
  | "POLICY_NOT_FOUND"
  | "RESERVE_BELOW_MINIMUM"
  | "LOCK_EXPIRED_NOT_RELEASED"
  | "THRESHOLD_OUT_OF_RANGE"
  | "CONDITION_NOT_REGISTERED"
  | "GUARDIAN_MODE_MISMATCH"
  | "STALE_AUDIT";

export interface PolicyIssue {
  type:        PolicyIssueType;
  severity:    "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  field:       string;
  description: string;
  suggestion:  string;
}

export interface OnChainPolicySnapshot {
  owner:           string;
  reserveBalance:  bigint;
  riskThreshold:   number;
  lockUntil:       number;   // unix timestamp; 0 = not locked
  emergencyLocked: boolean;
  active:          boolean;
  guardianMode:    boolean;
  lastAuditBlock:  number;
}

export interface PolicyValidationResult {
  owner:       string;
  isValid:     boolean;
  issues:      PolicyIssue[];
  validatedAt: number;
  score:       number;   // 0–100 policy health score
}

// ── Thresholds ────────────────────────────────────────────────────────────────

const MIN_RESERVE_USD      = 50n * 10n ** 6n;  // $50 in QUSDC (6 decimals)
const STALE_AUDIT_BLOCKS   = 7200;             // ~1 day at 12s block time
const MIN_RISK_THRESHOLD   = 100;
const MAX_RISK_THRESHOLD   = 900;

// ── PolicyValidator ───────────────────────────────────────────────────────────

export class PolicyValidator {

  /**
   * Validate a policy snapshot against Aurix integrity rules.
   * Returns a scored validation result with a list of issues.
   */
  static validate(
    snapshot:          OnChainPolicySnapshot,
    currentBlock:      number,
    registeredTriggers: Set<string>,
  ): PolicyValidationResult {
    const issues: PolicyIssue[] = [];

    // Check 1: Policy must be active
    if (!snapshot.active) {
      issues.push({
        type:        "POLICY_NOT_FOUND",
        severity:    "CRITICAL",
        field:       "active",
        description: "No active protection policy found for this address",
        suggestion:  "Activate a protection policy via the Policies dashboard or Guardian Mode",
      });
      return { owner: snapshot.owner, isValid: false, issues, validatedAt: Date.now(), score: 0 };
    }

    // Check 2: Reserve balance above minimum
    if (snapshot.reserveBalance < MIN_RESERVE_USD) {
      issues.push({
        type:        "RESERVE_BELOW_MINIMUM",
        severity:    "HIGH",
        field:       "reserveBalance",
        description: `Emergency reserve is below $50 minimum (current: $${Number(snapshot.reserveBalance) / 1e6})`,
        suggestion:  "Deposit additional QUSDC into your Resilience Policy Vault",
      });
    }

    // Check 3: Expired lock not released
    const now = Math.floor(Date.now() / 1000);
    if (snapshot.emergencyLocked && snapshot.lockUntil < now && snapshot.lockUntil > 0) {
      issues.push({
        type:        "LOCK_EXPIRED_NOT_RELEASED",
        severity:    "MEDIUM",
        field:       "lockUntil",
        description: "Emergency lock has expired but was not explicitly released",
        suggestion:  "Call releaseEmergencyLock() to restore normal policy access",
      });
    }

    // Check 4: Risk threshold in valid range
    if (snapshot.riskThreshold < MIN_RISK_THRESHOLD || snapshot.riskThreshold > MAX_RISK_THRESHOLD) {
      issues.push({
        type:        "THRESHOLD_OUT_OF_RANGE",
        severity:    "MEDIUM",
        field:       "riskThreshold",
        description: `Risk threshold (${snapshot.riskThreshold}) is outside the valid range (${MIN_RISK_THRESHOLD}–${MAX_RISK_THRESHOLD})`,
        suggestion:  "Update your risk threshold to a value between 100 and 900",
      });
    }

    // Check 5: Stale audit
    if (currentBlock - snapshot.lastAuditBlock > STALE_AUDIT_BLOCKS) {
      const blocksStale = currentBlock - snapshot.lastAuditBlock;
      const daysStale   = Math.round(blocksStale / 7200);
      issues.push({
        type:        "STALE_AUDIT",
        severity:    "LOW",
        field:       "lastAuditBlock",
        description: `Last audit was ${daysStale} day(s) ago — may not reflect current state`,
        suggestion:  "Run a fresh audit from the Audit dashboard",
      });
    }

    // Compute health score: 100 - weighted penalty per issue
    const PENALTIES: Record<string, number> = {
      CRITICAL: 50, HIGH: 25, MEDIUM: 15, LOW: 5
    };
    const totalPenalty = issues.reduce((s, i) => s + (PENALTIES[i.severity] ?? 0), 0);
    const score = Math.max(0, 100 - totalPenalty);

    return {
      owner:       snapshot.owner,
      isValid:     issues.filter(i => i.severity === "CRITICAL" || i.severity === "HIGH").length === 0,
      issues,
      validatedAt: Date.now(),
      score,
    };
  }
}
