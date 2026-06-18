// ─────────────────────────────────────────────────────────────────────────────
// QIE Aurix — Chain Adapter
// Abstracts blockchain network configuration so the product can move chains
// by changing a single adapter. No hard-coded chain IDs anywhere else.
// ─────────────────────────────────────────────────────────────────────────────

import {
  QIE_MAINNET_CHAIN_ID,
  QIE_MAINNET_RPC_URL,
  QIE_MAINNET_EXPLORER_URL,
  QUSDC_MAINNET_ADDRESS,
  QIE_PASS_ADDRESS,
  QIE_DOMAINS_ADDRESS
} from "../constants/qie-network";
import mainnetAddresses from "../constants/qie-mainnet.json";

export interface QIEContractMap {
  pass:    string;
  dex:     string;
  lend:    string;
  qusdc:   string;
  domains: string;
  bridge:  string;
}

export interface AurixContractMap {
  trustProfileRegistry:   string;
  resiliencePolicyVault:  string;
  aurixRecoveryGate:      string;
  safetyAuditAnchor:      string;
  familyVaultController:  string;
}

export interface ChainAdapter {
  name:              string;
  displayName:       string;
  chainId:           number;
  rpcUrl:            string;
  explorerUrl:       string;
  nativeCurrency:    { name: string; symbol: string; decimals: number };
  qieContracts:      QIEContractMap;
  aurixContracts:    AurixContractMap;
  blockTimeMs:       number;
  isTestnet:         boolean;
}

// ─── Placeholder contract map (all zeros, filled per environment) ─────────────

const ZERO = "0x0000000000000000000000000000000000000000";

const PLACEHOLDER_QIE_CONTRACTS: QIEContractMap = {
  pass:    ZERO,
  dex:     ZERO,
  lend:    ZERO,
  qusdc:   ZERO,
  domains: ZERO,
  bridge:  ZERO,
};

const PLACEHOLDER_AURIX_CONTRACTS: AurixContractMap = {
  trustProfileRegistry:   process.env.NEXT_PUBLIC_TRUST_PROFILE_REGISTRY   ?? ZERO,
  resiliencePolicyVault:  process.env.NEXT_PUBLIC_RESILIENCE_POLICY_VAULT  ?? ZERO,
  aurixRecoveryGate:      process.env.NEXT_PUBLIC_AURIX_RECOVERY_GATE      ?? ZERO,
  safetyAuditAnchor:      process.env.NEXT_PUBLIC_SAFETY_AUDIT_ANCHOR      ?? ZERO,
  familyVaultController:  process.env.NEXT_PUBLIC_FAMILY_VAULT_CONTROLLER  ?? ZERO,
};

const MAINNET_AURIX_CONTRACTS: AurixContractMap = {
  trustProfileRegistry:   process.env.NEXT_PUBLIC_TRUST_PROFILE_REGISTRY   ?? mainnetAddresses.TrustProfileRegistry,
  resiliencePolicyVault:  process.env.NEXT_PUBLIC_RESILIENCE_POLICY_VAULT  ?? mainnetAddresses.ResiliencePolicyVault,
  aurixRecoveryGate:      process.env.NEXT_PUBLIC_AURIX_RECOVERY_GATE      ?? mainnetAddresses.AurixRecoveryGate,
  safetyAuditAnchor:      process.env.NEXT_PUBLIC_SAFETY_AUDIT_ANCHOR      ?? mainnetAddresses.SafetyAuditAnchor,
  familyVaultController:  process.env.NEXT_PUBLIC_FAMILY_VAULT_CONTROLLER  ?? mainnetAddresses.FamilyVaultController,
};

// ─── QIE Testnet Adapter ───────────────────────────────────────────────────────

export const QIE_TESTNET_ADAPTER: ChainAdapter = {
  name:         "qie-testnet",
  displayName:  "QIE Testnet",
  chainId:      Number(process.env.NEXT_PUBLIC_QIE_CHAIN_ID ?? 1234),
  rpcUrl:       process.env.QIE_RPC_URL ?? "https://rpc.qie-testnet.example.com",
  explorerUrl:  process.env.QIE_EXPLORER_URL ?? "https://explorer.qie-testnet.example.com",
  nativeCurrency: { name: "QIE", symbol: "QIE", decimals: 18 },
  qieContracts:   PLACEHOLDER_QIE_CONTRACTS,
  aurixContracts: PLACEHOLDER_AURIX_CONTRACTS,
  blockTimeMs:    3000,
  isTestnet:      true,
};

const MAINNET_QIE_CONTRACTS: QIEContractMap = {
  pass:    QIE_PASS_ADDRESS,
  dex:     ZERO,
  lend:    ZERO,
  qusdc:   QUSDC_MAINNET_ADDRESS,
  domains: QIE_DOMAINS_ADDRESS,
  bridge:  ZERO,
};

// ─── QIE Mainnet Adapter ─────────────────────────────────────────────

export const QIE_MAINNET_ADAPTER: ChainAdapter = {
  name:         "qie-mainnet",
  displayName:  "QIEMainnet",
  chainId:      QIE_MAINNET_CHAIN_ID,
  rpcUrl:       QIE_MAINNET_RPC_URL,
  explorerUrl:  QIE_MAINNET_EXPLORER_URL,
  nativeCurrency: { name: "QIE", symbol: "QIE", decimals: 18 },
  qieContracts:   MAINNET_QIE_CONTRACTS,
  aurixContracts: MAINNET_AURIX_CONTRACTS,
  blockTimeMs:    3000,
  isTestnet:      false,
};

// ─── Active chain (swap this one export to change networks) ───────────────────

export const activeChain: ChainAdapter =
  typeof process !== "undefined" && process.env.NEXT_PUBLIC_MODE === "production"
    ? QIE_MAINNET_ADAPTER
    : QIE_TESTNET_ADAPTER;

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getExplorerTxUrl(txHash: string): string {
  return `${activeChain.explorerUrl}/tx/${txHash}`;
}

export function getExplorerAddressUrl(address: string): string {
  return `${activeChain.explorerUrl}/address/${address}`;
}

export function isZeroAddress(address: string): boolean {
  return address === ZERO;
}
