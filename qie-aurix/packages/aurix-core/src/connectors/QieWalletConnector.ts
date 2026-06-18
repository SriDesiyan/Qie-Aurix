import { ethers } from "ethers";

export class QieWalletConnector {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;

  /**
   * Retrieves the currently active window injected provider.
   * Prioritizes window.qie (QIE Wallet) over window.ethereum (MetaMask).
   */
  static getActiveProvider(): any | null {
    if (typeof window === "undefined") return null;
    return window.qie || window.ethereum || null;
  }

  /**
   * Checks if any compatible Web3 wallet is installed.
   */
  static isWalletInstalled(): boolean {
    return !!this.getActiveProvider();
  }

  /**
   * Checks if QIE Wallet is installed specifically.
   */
  static isQieWalletInstalled(): boolean {
    if (typeof window === "undefined") return false;
    return !!window.qie;
  }

  /**
   * Checks if MetaMask (or general window.ethereum) is installed.
   */
  static isMetaMaskInstalled(): boolean {
    if (typeof window === "undefined") return false;
    return !!window.ethereum;
  }

  /**
   * Connects to the injected wallet provider.
   * If a preference is provided, it tries to connect to that provider first.
   */
  async connect(preferred?: "qie" | "metamask"): Promise<{ address: string; provider: ethers.BrowserProvider }> {
    if (typeof window === "undefined") {
      throw new Error("Cannot connect to wallet in a non-browser environment.");
    }

    let rawProvider: any = null;
    if (preferred === "qie") {
      rawProvider = window.qie;
    } else if (preferred === "metamask") {
      rawProvider = window.ethereum;
    }

    if (!rawProvider) {
      rawProvider = QieWalletConnector.getActiveProvider();
    }

    if (!rawProvider) {
      throw new Error("No Web3 wallet detected. Please install MetaMask or QIE Wallet.");
    }

    try {
      this.provider = new ethers.BrowserProvider(rawProvider as ethers.Eip1193Provider);
      // Request accounts
      await this.provider.send("eth_requestAccounts", []);
      this.signer = await this.provider.getSigner();
      const address = await this.signer.getAddress();
      return { address, provider: this.provider };
    } catch (err: any) {
      throw new Error(err.message || "Failed to connect to injected wallet.");
    }
  }

  /**
   * Disconnects the wallet references.
   */
  disconnect(): void {
    this.provider = null;
    this.signer = null;
  }

  /**
   * Returns the current signer.
   */
  getSigner(): ethers.Signer | null {
    return this.signer;
  }

  /**
   * Returns the current provider.
   */
  getProvider(): ethers.BrowserProvider | null {
    return this.provider;
  }
}

declare global {
  interface Window {
    ethereum?: any;
    qie?: any;
  }
}
