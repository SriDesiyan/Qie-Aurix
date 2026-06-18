/**
 * @aurix/core-services
 *
 * Internal engine layer for QIE Aurix.
 * Five engines, each extracted from proven patterns and rewritten
 * entirely around Aurix's financial resilience product concepts.
 *
 * Engines:
 *   resilience-engine  — safe portfolio allocation & rebalancing
 *   recovery-engine    — mis-transfer claim validation & state machine
 *   protection-engine  — pluggable trigger evaluation & action dispatch
 *   valuation-engine   — wallet health scoring & asset risk classification
 *   audit-engine       — policy validation, vault integrity, event log
 */

export * from "./services/resilience-engine";
export * from "./services/recovery-engine";
export * from "./services/protection-engine";
export * from "./services/valuation-engine";
export * from "./services/audit-engine";
