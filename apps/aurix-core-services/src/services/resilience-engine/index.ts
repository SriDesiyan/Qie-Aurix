/**
 * AurixResilienceEngine — Public API
 *
 * Entry point for the resilience engine. Exposes the two core functions:
 *   - optimize()   → compute safe allocation weights
 *   - rebalance()  → generate step-by-step rebalancing plan
 */

export { AllocationOptimizer }   from "./AllocationOptimizer";
export { ResilienceRebalancer }  from "./ResilienceRebalancer";
export type {
  AssetDataPoint,
  AllocationWeight,
  AllocationResult,
} from "./AllocationOptimizer";
export type {
  RebalanceStep,
  RebalancePlan,
} from "./ResilienceRebalancer";
