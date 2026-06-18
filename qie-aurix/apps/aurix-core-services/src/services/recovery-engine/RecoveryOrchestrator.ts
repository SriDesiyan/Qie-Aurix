/**
 * AurixRecoveryEngine — RecoveryOrchestrator
 *
 * Manages the full recovery state machine for a claim lifecycle:
 *   PENDING → VERIFIED → RELEASED  (success path)
 *   PENDING → REJECTED             (failure path)
 *
 * This state machine is directly inspired by the two-contract design
 * in the original mis-transfer recovery system: one contract for the
 * user interface (claim submission) and one for execution (recovery).
 *
 * In Aurix, the two roles map to:
 *   - AurixRecoveryGate contract  →  on-chain state + execution
 *   - RecoveryOrchestrator (this) →  off-chain orchestration logic
 *
 * The orchestrator coordinates the oracle verification step and
 * manages the user-facing status updates without ever exposing
 * the internal implementation origin.
 */

import type { ValidationResult } from "./ClaimValidator";

// ── Types ─────────────────────────────────────────────────────────────────────

export type ClaimLifecycleState =
  | "AWAITING_SUBMISSION"
  | "PENDING"
  | "ORACLE_VERIFYING"
  | "VERIFIED"
  | "RELEASING"
  | "RELEASED"
  | "REJECTED";

export interface ClaimRecord {
  claimId:      string;
  claimant:     string;
  token:        string;
  amount:       string;
  txHash:       string;
  target:       string;
  state:        ClaimLifecycleState;
  validation:   ValidationResult | null;
  submittedAt:  number;
  verifiedAt:   number | null;
  releasedAt:   number | null;
  rejectionReason: string | null;
}

export interface OrchestratorEvent {
  claimId:   string;
  prevState: ClaimLifecycleState;
  nextState: ClaimLifecycleState;
  reason:    string;
  timestamp: number;
}

// ── RecoveryOrchestrator ──────────────────────────────────────────────────────

export class RecoveryOrchestrator {
  private claims:    Map<string, ClaimRecord> = new Map();
  private eventLog:  OrchestratorEvent[]      = [];

  /**
   * Register a new claim after pre-submission validation passes.
   */
  registerClaim(
    claimId:  string,
    claimant: string,
    token:    string,
    amount:   string,
    txHash:   string,
    target:   string,
  ): ClaimRecord {
    const record: ClaimRecord = {
      claimId,
      claimant,
      token,
      amount,
      txHash,
      target,
      state:           "PENDING",
      validation:      null,
      submittedAt:     Math.floor(Date.now() / 1000),
      verifiedAt:      null,
      releasedAt:      null,
      rejectionReason: null,
    };
    this.claims.set(claimId, record);
    this._logEvent(claimId, "AWAITING_SUBMISSION", "PENDING", "Claim submitted to AurixRecoveryGate");
    return record;
  }

  /**
   * Transition: PENDING → ORACLE_VERIFYING
   * Called when the oracle picks up the claim for verification.
   */
  markVerifying(claimId: string): void {
    this._transition(claimId, "PENDING", "ORACLE_VERIFYING",
      "Oracle is verifying tx origin and contract balance");
  }

  /**
   * Transition: ORACLE_VERIFYING → VERIFIED
   * Called when the oracle confirms the claim is valid.
   */
  markVerified(claimId: string, validation: ValidationResult): void {
    this._transition(claimId, "ORACLE_VERIFYING", "VERIFIED",
      "Oracle confirmed claim — funds ready to release");
    const r = this.claims.get(claimId);
    if (r) { r.validation = validation; r.verifiedAt = Math.floor(Date.now() / 1000); }
  }

  /**
   * Transition: VERIFIED → RELEASING → RELEASED
   * Called when the claimant calls releaseClaim() on-chain.
   */
  markReleased(claimId: string): void {
    this._transition(claimId, "VERIFIED", "RELEASING",
      "Claimant initiating on-chain release");
    this._transition(claimId, "RELEASING", "RELEASED",
      "Funds successfully returned to claimant");
    const r = this.claims.get(claimId);
    if (r) r.releasedAt = Math.floor(Date.now() / 1000);
  }

  /**
   * Transition: PENDING | ORACLE_VERIFYING → REJECTED
   * Called when the oracle determines the claim is invalid.
   */
  markRejected(claimId: string, reason: string): void {
    const r = this.claims.get(claimId);
    const prev = r?.state ?? "PENDING";
    this._transition(claimId, prev as ClaimLifecycleState, "REJECTED", reason);
    if (r) r.rejectionReason = reason;
  }

  getClaim(claimId: string): ClaimRecord | undefined {
    return this.claims.get(claimId);
  }

  getClaimsByAddress(address: string): ClaimRecord[] {
    return Array.from(this.claims.values())
      .filter(c => c.claimant.toLowerCase() === address.toLowerCase());
  }

  getEventLog(claimId: string): OrchestratorEvent[] {
    return this.eventLog.filter(e => e.claimId === claimId);
  }

  // ── Private helpers ──────────────────────────────────────────────────────────

  private _transition(
    claimId: string,
    from: ClaimLifecycleState,
    to:   ClaimLifecycleState,
    reason: string,
  ): void {
    const r = this.claims.get(claimId);
    if (!r) throw new Error(`Claim ${claimId} not found`);
    r.state = to;
    this._logEvent(claimId, from, to, reason);
  }

  private _logEvent(
    claimId:   string,
    prevState: ClaimLifecycleState,
    nextState: ClaimLifecycleState,
    reason:    string,
  ): void {
    this.eventLog.push({ claimId, prevState, nextState, reason, timestamp: Math.floor(Date.now() / 1000) });
  }
}
