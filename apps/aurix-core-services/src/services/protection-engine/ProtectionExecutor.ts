/**
 * AurixProtectionEngine — ProtectionExecutor
 *
 * Converts fired triggers into concrete protection actions and
 * routes them to the correct Aurix system.
 *
 * The executor routes active dispatches:
 *   trigger fires → executor routes → contract function + oracle endpoint
 *
 * This is automated financial defense.
 */

import type { FiredTrigger, ProtectionAction } from "./TriggerRegistry";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ProtectionDispatch {
  action:            ProtectionAction;
  contractTarget:    string;   // which Aurix contract to call
  functionName:      string;   // which function on that contract
  params:            Record<string, unknown>;
  triggerIds:        string[]; // which triggers caused this dispatch
  urgency:           "IMMEDIATE" | "SCHEDULED" | "INFORMATIONAL";
  userMessage:       string;   // plain-language explanation for the user
}

export interface ExecutionPlan {
  address:    string;
  dispatches: ProtectionDispatch[];
  timestamp:  number;
}

// ── Action routing table ──────────────────────────────────────────────────────
// Maps each ProtectionAction to its contract + function target

const ACTION_ROUTES: Record<ProtectionAction, { contract: string; fn: string; urgency: ProtectionDispatch["urgency"] }> = {
  ACTIVATE_EMERGENCY_LOCK: {
    contract: "ResiliencePolicyVault",
    fn:       "activateEmergencyLock",
    urgency:  "IMMEDIATE",
  },
  SWAP_TO_QUSDC: {
    contract: "ResiliencePolicyVault",
    fn:       "initiateProtectiveSwap",
    urgency:  "IMMEDIATE",
  },
  NOTIFY_HEIRS: {
    contract: "FamilyVaultController",
    fn:       "notifyHeirs",
    urgency:  "SCHEDULED",
  },
  ANCHOR_AUDIT: {
    contract: "SafetyAuditAnchor",
    fn:       "anchorSnapshot",
    urgency:  "SCHEDULED",
  },
  REBALANCE_PORTFOLIO: {
    contract: "ResiliencePolicyVault",
    fn:       "initiateRebalance",
    urgency:  "SCHEDULED",
  },
  NONE: {
    contract: "",
    fn:       "",
    urgency:  "INFORMATIONAL",
  },
};

// ── ProtectionExecutor ────────────────────────────────────────────────────────

export class ProtectionExecutor {

  /**
   * Convert a list of fired triggers into a deduplicated execution plan.
   *
   * Deduplication: if multiple triggers recommend the same action,
   * merge them into a single dispatch (combining trigger IDs).
   * This ensures multiple warning signals collapse into a single transition.
   */
  static buildPlan(address: string, firedTriggers: FiredTrigger[]): ExecutionPlan {
    // Group triggers by recommended action
    const actionGroups = new Map<ProtectionAction, FiredTrigger[]>();
    for (const trigger of firedTriggers) {
      const action = trigger.recommendedAction;
      if (action === "NONE") continue;
      if (!actionGroups.has(action)) actionGroups.set(action, []);
      actionGroups.get(action)!.push(trigger);
    }

    const dispatches: ProtectionDispatch[] = [];

    for (const [action, triggers] of actionGroups) {
      const route = ACTION_ROUTES[action];
      if (!route.contract) continue;

      dispatches.push({
        action,
        contractTarget: route.contract,
        functionName:   route.fn,
        params:         this._buildParams(action, address, triggers),
        triggerIds:     triggers.map(t => t.triggerId),
        urgency:        route.urgency,
        userMessage:    this._buildMessage(action, triggers),
      });
    }

    // Sort: IMMEDIATE first
    dispatches.sort((a, b) => {
      const order = { IMMEDIATE: 0, SCHEDULED: 1, INFORMATIONAL: 2 };
      return order[a.urgency] - order[b.urgency];
    });

    return { address, dispatches, timestamp: Math.floor(Date.now() / 1000) };
  }

  private static _buildParams(
    action:   ProtectionAction,
    address:  string,
    triggers: FiredTrigger[],
  ): Record<string, unknown> {
    switch (action) {
      case "ACTIVATE_EMERGENCY_LOCK":
        return { user: address, lockDays: 7 };
      case "SWAP_TO_QUSDC":
        return { user: address, targetToken: "QUSDC", triggerCount: triggers.length };
      case "NOTIFY_HEIRS":
        return { owner: address, message: "Resilience score critical — please review vault access" };
      case "ANCHOR_AUDIT":
        return { user: address, reason: triggers.map(t => t.triggerName).join(", ") };
      case "REBALANCE_PORTFOLIO":
        return { user: address, urgency: triggers[0]?.severity ?? "MEDIUM" };
      default:
        return {};
    }
  }

  private static _buildMessage(action: ProtectionAction, triggers: FiredTrigger[]): string {
    const topTrigger = triggers[0];
    switch (action) {
      case "ACTIVATE_EMERGENCY_LOCK":
        return `Emergency reserve locked for 7 days — ${topTrigger?.explanation ?? "risk threshold exceeded"}`;
      case "SWAP_TO_QUSDC":
        return `Protective swap to QUSDC initiated — ${topTrigger?.explanation ?? "portfolio needs stabilization"}`;
      case "NOTIFY_HEIRS":
        return "Family vault heirs have been notified of a critical resilience event";
      case "ANCHOR_AUDIT":
        return "Safety audit anchored on-chain to record current protection state";
      case "REBALANCE_PORTFOLIO":
        return `Portfolio rebalancing scheduled — ${topTrigger?.explanation ?? "diversification needed"}`;
      default:
        return "Protection status monitored — no action required at this time";
    }
  }
}
