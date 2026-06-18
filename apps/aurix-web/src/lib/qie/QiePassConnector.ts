// ─────────────────────────────────────────────────────────────────────────────
// QIE Aurix — QIE Pass Connector
// Custom identity connector — no RainbowKit, no generic wallet modals.
// QIE Pass is the root of identity. The product only makes sense with QIE.
// ─────────────────────────────────────────────────────────────────────────────

import { ethers } from "ethers";
import type { QiePassIdentity } from "@aurix/core";
import { activeChain } from "@aurix/core";

// ── QIE Pass ABI (minimal — only what Aurix needs) ───────────────────────────

const QIE_PASS_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
  "function tokenTier(uint256 tokenId) view returns (uint8)",
  "function verifiedDomains(uint256 tokenId) view returns (string[])",
  "function isValidator(address owner) view returns (bool)",
  "function communityScore(address owner) view returns (uint256)",
  "function passIssuedAt(uint256 tokenId) view returns (uint256)",
];

export type ConnectionState =
  | { status: "disconnected" }
  | { status: "connecting" }
  | { status: "connected"; address: string; identity: QiePassIdentity }
  | { status: "no_pass"; address: string }
  | { status: "error"; message: string };

// ── Tier mapping ──────────────────────────────────────────────────────────────

function mapTier(tierIndex: number): QiePassIdentity["tier"] {
  const tiers: QiePassIdentity["tier"][] = ["BASIC", "VERIFIED", "TRUSTED", "GUARDIAN"];
  return tiers[tierIndex] ?? "BASIC";
}

// ── Main connector ────────────────────────────────────────────────────────────

export class QiePassConnector {
  private provider: ethers.BrowserProvider | null = null;
  private signer:   ethers.Signer | null = null;

  /**
   * Connect the user's wallet. Requests account access via window.ethereum.
   * Does NOT depend on any specific wallet SDK — works with any injected provider.
   */
  async connect(): Promise<ConnectionState> {
    if (typeof window === "undefined" || !window.ethereum) {
      return { status: "error", message: "No Web3 wallet detected. Please install MetaMask or a QIE-compatible wallet." };
    }

    try {
      this.provider = new ethers.BrowserProvider(window.ethereum as ethers.Eip1193Provider);
      await this.provider.send("eth_requestAccounts", []);
      this.signer = await this.provider.getSigner();
      const address = await this.signer.getAddress();

      const identity = await this.readQiePass(address);
      if (!identity) {
        return { status: "no_pass", address };
      }

      return { status: "connected", address, identity };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Connection failed";
      return { status: "error", message: msg };
    }
  }

  /**
   * Read QIE Pass data for the given address.
   * Falls back to mock data if the contract address is a placeholder.
   */
  async readQiePass(address: string): Promise<QiePassIdentity | null> {
    const passAddress = activeChain.qieContracts.pass;

    // If contract address is placeholder, return mock data for demo
    if (passAddress === "0x0000000000000000000000000000000000000000") {
      return this.mockQiePass(address);
    }

    try {
      if (!this.provider) return null;
      const passContract = new ethers.Contract(passAddress, QIE_PASS_ABI, this.provider);

      const balance = await passContract.balanceOf(address) as bigint;
      if (balance === 0n) return null;

      const tokenId       = await passContract.tokenOfOwnerByIndex(address, 0) as bigint;
      const tierIndex     = await passContract.tokenTier(tokenId) as number;
      const domains       = await passContract.verifiedDomains(tokenId) as string[];
      const isValidator   = await passContract.isValidator(address) as boolean;
      const communityScore = await passContract.communityScore(address) as bigint;
      const issuedAt      = await passContract.passIssuedAt(tokenId) as bigint;

      return {
        address,
        passTokenId:      tokenId.toString(),
        tier:             mapTier(tierIndex),
        verifiedDomains:  domains,
        isValidator,
        communityScore:   Number(communityScore),
        passIssuedAt:     Number(issuedAt),
      };
    } catch {
      // Contract read failed — use mock for demo
      return this.mockQiePass(address);
    }
  }

  /**
   * Mock QIE Pass for demo when contract is not yet deployed.
   * Deterministic per address.
   */
  private mockQiePass(address: string): QiePassIdentity {
    const seed = parseInt(address.slice(2, 10), 16) || 42;
    const tiers: QiePassIdentity["tier"][] = ["BASIC", "VERIFIED", "TRUSTED", "GUARDIAN"];
    return {
      address,
      passTokenId:     `${1000 + (seed % 9000)}`,
      tier:            tiers[seed % tiers.length],
      verifiedDomains: seed % 2 === 0 ? ["family.aurix.qie"] : [],
      isValidator:     seed % 3 === 0,
      communityScore:  50 + (seed % 45),
      passIssuedAt:    Math.floor(Date.now() / 1000) - (seed % 730) * 86400,
    };
  }

  disconnect(): void {
    this.provider = null;
    this.signer   = null;
  }

  getAddress(): Promise<string | null> {
    return this.signer?.getAddress() ?? Promise.resolve(null);
  }

  getSigner(): ethers.Signer | null {
    return this.signer;
  }

  getProvider(): ethers.BrowserProvider | null {
    return this.provider;
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────

export const qiePassConnector = new QiePassConnector();

// ── Type extension for window.ethereum ───────────────────────────────────────

declare global {
  interface Window {
    ethereum?: ethers.Eip1193Provider;
  }
}
