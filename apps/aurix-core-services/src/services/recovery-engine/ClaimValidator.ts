/**
 * AurixRecoveryEngine — ClaimValidator
 *
 * Validates recovery claims before they are submitted to AurixRecoveryGate.
 *
 * The two-stage validation pattern distinguishes intentional deposits from
 * accidental ones, using on-chain transaction receipts to establish original
 * ownership.
 *
 * Aurix implementation:
 * - Instead of Chainlink Functions for off-chain tx lookup, the oracle
 *   service performs the tx receipt fetch and returns a validation token
 * - The "intentional vs accidental" distinction is preserved through
 *   the `intentionalDeposits` mapping added to AurixRecoveryGate
 * - Claim deduplication uses txHash + claimant, preventing double-claims
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export interface RawClaim {
  claimId:        string;   // bytes32 hex
  txHash:         string;   // the accidental transfer tx hash
  token:          string;   // ERC-20 token address
  amount:         string;   // amount in base units (string to avoid BigInt issues)
  targetContract: string;   // Aurix contract that received the tokens
  claimant:       string;   // wallet address of the rightful owner
}

export type ValidationStatus = "VALID" | "INVALID" | "DUPLICATE" | "INSUFFICIENT_BALANCE";

export interface ValidationResult {
  status:         ValidationStatus;
  claimId:        string;
  claimant:       string;
  isOriginalSender: boolean;
  contractHoldsSufficient: boolean;
  isDuplicate:    boolean;
  errors:         string[];
  validatedAt:    number;
}

// ── Validation rules ──────────────────────────────────────────────────────────

const AURIX_CONTRACT_NAMES: Record<string, string> = {
  TrustProfileRegistry:   "Trust Profile Registry",
  ResiliencePolicyVault:  "Resilience Policy Vault",
  AurixRecoveryGate:      "Recovery Gate",
  SafetyAuditAnchor:      "Safety Audit Anchor",
  FamilyVaultController:  "Family Vault Controller",
};

// ── ClaimValidator ────────────────────────────────────────────────────────────

export class ClaimValidator {

  /**
   * Perform pre-submission validation of a recovery claim.
   *
   * Checks (in order of the two-pass validation pattern):
   *   1. Claim fields are well-formed (non-zero, correct format)
   *   2. claimId is not already used (deduplication)
   *   3. Claimant is the original sender of the tx (origin proof)
   *   4. Target contract holds sufficient balance to cover the claim
   */
  static validate(
    claim:            RawClaim,
    knownClaimIds:    Set<string>,
    isOriginalSender: boolean,
    contractBalance:  bigint,
  ): ValidationResult {
    const errors: string[] = [];

    // Field validation
    if (!claim.claimId || !claim.claimId.startsWith("0x")) {
      errors.push("Claim ID must be a valid bytes32 hex string");
    }
    if (!claim.txHash || !claim.txHash.startsWith("0x") || claim.txHash.length !== 66) {
      errors.push("Transaction hash must be a valid 32-byte hex string");
    }
    if (!claim.token || !claim.token.startsWith("0x")) {
      errors.push("Token must be a valid ERC-20 address");
    }
    if (!claim.amount || BigInt(claim.amount) === 0n) {
      errors.push("Claim amount must be greater than zero");
    }
    if (!claim.targetContract || !claim.targetContract.startsWith("0x")) {
      errors.push("Target contract must be a valid address");
    }
    if (!claim.claimant || !claim.claimant.startsWith("0x")) {
      errors.push("Claimant must be a valid wallet address");
    }

    // Deduplication check
    const isDuplicate = knownClaimIds.has(claim.claimId);
    if (isDuplicate) {
      errors.push(`Claim ${claim.claimId} has already been submitted`);
    }

    // Origin proof check
    if (!isOriginalSender) {
      errors.push("Oracle could not confirm claimant was the original sender of the transaction");
    }

    // Balance check
    const claimAmount = BigInt(claim.amount || 0);
    const contractHoldsSufficient = contractBalance >= claimAmount;
    if (!contractHoldsSufficient) {
      errors.push(
        `Contract balance (${contractBalance.toString()}) is insufficient to cover claim amount (${claim.amount})`
      );
    }

    const status: ValidationStatus =
      errors.length === 0       ? "VALID"
      : isDuplicate             ? "DUPLICATE"
      : !contractHoldsSufficient ? "INSUFFICIENT_BALANCE"
      : "INVALID";

    return {
      status,
      claimId:       claim.claimId,
      claimant:      claim.claimant,
      isOriginalSender,
      contractHoldsSufficient,
      isDuplicate,
      errors,
      validatedAt: Math.floor(Date.now() / 1000),
    };
  }

  /**
   * Describe the target Aurix contract in user-facing language.
   * Ensures no internal contract names leak to the UI.
   */
  static describeTarget(contractAddress: string, contractName?: string): string {
    if (contractName && AURIX_CONTRACT_NAMES[contractName]) {
      return `Aurix ${AURIX_CONTRACT_NAMES[contractName]}`;
    }
    return `Aurix Contract (${contractAddress.slice(0, 8)}...${contractAddress.slice(-4)})`;
  }
}
