/**
 * AurixAuditEngine — AuditHistoryStore
 *
 * Maintains an ordered, immutable audit event log per user.
 * Each event records a point-in-time snapshot of the user's
 * protection state — keyed by block number for on-chain verifiability.
 *
 * Events can be anchored to SafetyAuditAnchor.sol via an IPFS CID
 * to create a tamper-evident audit trail.
 *
 * Original Aurix implementation.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export type AuditEventType =
  | "POLICY_CREATED"
  | "POLICY_VALIDATED"
  | "VAULT_INTEGRITY_CHECK"
  | "GUARDIAN_MODE_ACTIVATED"
  | "EMERGENCY_LOCK_TRIGGERED"
  | "CLAIM_SUBMITTED"
  | "CLAIM_RELEASED"
  | "REBALANCE_EXECUTED"
  | "ANCHOR_CREATED"
  | "SCORE_SNAPSHOT";

export interface AuditEvent {
  id:          string;   // uuid-style
  owner:       string;
  type:        AuditEventType;
  blockNumber: number;
  data:        Record<string, unknown>;
  ipfsCid:     string | null;   // set after on-chain anchoring
  createdAt:   number;          // unix ms
}

// ── AuditHistoryStore ─────────────────────────────────────────────────────────

export class AuditHistoryStore {
  private store: Map<string, AuditEvent[]> = new Map();

  /**
   * Record a new audit event for a user.
   */
  record(
    owner:       string,
    type:        AuditEventType,
    blockNumber: number,
    data:        Record<string, unknown>,
  ): AuditEvent {
    const event: AuditEvent = {
      id:          this._generateId(),
      owner:       owner.toLowerCase(),
      type,
      blockNumber,
      data,
      ipfsCid:     null,
      createdAt:   Date.now(),
    };

    const key = owner.toLowerCase();
    if (!this.store.has(key)) this.store.set(key, []);
    this.store.get(key)!.push(event);

    return event;
  }

  /**
   * Attach an IPFS CID to a previously recorded event (after on-chain anchoring).
   */
  attachCid(eventId: string, owner: string, ipfsCid: string): boolean {
    const events = this.store.get(owner.toLowerCase());
    if (!events) return false;
    const ev = events.find(e => e.id === eventId);
    if (!ev) return false;
    ev.ipfsCid = ipfsCid;
    return true;
  }

  /**
   * Get all audit events for a user, newest first.
   */
  getHistory(owner: string, limit = 50): AuditEvent[] {
    return (this.store.get(owner.toLowerCase()) ?? [])
      .slice()
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, limit);
  }

  /**
   * Get events of a specific type for a user.
   */
  getByType(owner: string, type: AuditEventType): AuditEvent[] {
    return (this.store.get(owner.toLowerCase()) ?? []).filter(e => e.type === type);
  }

  /**
   * Get anchored events only (those with an IPFS CID).
   */
  getAnchored(owner: string): AuditEvent[] {
    return (this.store.get(owner.toLowerCase()) ?? []).filter(e => e.ipfsCid !== null);
  }

  /**
   * Summary stats for a user's audit history.
   */
  getSummary(owner: string): { total: number; anchored: number; lastEvent: AuditEvent | null } {
    const events  = this.store.get(owner.toLowerCase()) ?? [];
    const anchored = events.filter(e => e.ipfsCid !== null).length;
    const sorted   = events.slice().sort((a, b) => b.createdAt - a.createdAt);
    return { total: events.length, anchored, lastEvent: sorted[0] ?? null };
  }

  private _generateId(): string {
    return `audit-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }
}

// Singleton instance for use across the oracle service
export const auditHistoryStore = new AuditHistoryStore();
