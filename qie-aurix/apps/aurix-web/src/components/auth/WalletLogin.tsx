"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { qiePassConnector, type ConnectionState } from "../../lib/qie/QiePassConnector";
import { Wallet, QrCode, Link as LinkIcon, Info } from "lucide-react";

interface WalletLoginProps {
  onSuccess: (address: string, identity: any) => void;
  onError: (message: string) => void;
}

export default function WalletLogin({ onSuccess, onError }: WalletLoginProps) {
  const [connecting, setConnecting] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);

  const handleInjectedConnect = async (walletName: string) => {
    if (typeof window === "undefined" || !window.ethereum) {
      onError(`No Web3 provider detected. Please install ${walletName} or use QIE Pass ID login.`);
      return;
    }

    setConnecting(walletName);
    try {
      const result = await qiePassConnector.connect();
      if (result.status === "connected") {
        onSuccess(result.address, result.identity);
      } else if (result.status === "no_pass") {
        onError("No QIE Pass NFT detected in this wallet. Real QIE Pass required.");
      } else if (result.status === "error") {
        onError(result.message);
      }
    } catch (err: any) {
      onError(err.message || "Connection failed");
    } finally {
      setConnecting(null);
    }
  };

  const handleWalletConnect = async () => {
    setConnecting("WalletConnect");
    setShowQR(true);
  };

  const simulateQRScan = () => {
    // Simulate successful scan after a short delay
    setTimeout(() => {
      setShowQR(false);
      setConnecting(null);
      // Log in with a deterministic WalletConnect mock credentials for demo
      const address = "0xc10249876543210123456789abcdef0123456789";
      const identity = {
        address,
        passTokenId: "9988",
        tier: "TRUSTED" as const,
        verifiedDomains: ["trusted.aurix.qie"],
        isValidator: false,
        communityScore: 82,
        passIssuedAt: Math.floor(Date.now() / 1000) - 180 * 86400,
      };
      onSuccess(address, identity);
    }, 1500);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", width: "100%" }}>
      <AnimatePresence mode="wait">
        {!showQR ? (
          <motion.div
            key="buttons"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}
          >
            {/* MetaMask */}
            <button
              onClick={() => handleInjectedConnect("MetaMask")}
              disabled={connecting !== null}
              className="aurix-btn aurix-btn-outline w-full"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 20px",
                borderColor: "rgba(223, 180, 67, 0.25)",
                height: "auto",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <Wallet size={18} style={{ color: "var(--color-gold)" }} />
                <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>MetaMask</span>
              </div>
              <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                {connecting === "MetaMask" ? "Connecting..." : "Extension"}
              </span>
            </button>

            {/* QIE Wallet */}
            <button
              onClick={() => handleInjectedConnect("QIE Wallet")}
              disabled={connecting !== null}
              className="aurix-btn aurix-btn-outline w-full"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 20px",
                borderColor: "rgba(0, 245, 212, 0.25)",
                height: "auto",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <Wallet size={18} style={{ color: "var(--color-teal)" }} />
                <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>QIE Wallet</span>
              </div>
              <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                {connecting === "QIE Wallet" ? "Connecting..." : "Injected"}
              </span>
            </button>

            {/* WalletConnect */}
            <button
              onClick={handleWalletConnect}
              disabled={connecting !== null}
              className="aurix-btn aurix-btn-outline w-full"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 20px",
                borderColor: "rgba(255, 255, 255, 0.15)",
                height: "auto",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <QrCode size={18} style={{ color: "#a78bfa" }} />
                <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>WalletConnect</span>
              </div>
              <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                {connecting === "WalletConnect" ? "Opening..." : "QR / Mobile"}
              </span>
            </button>

            {/* Info panel */}
            <div style={{
              display: "flex",
              gap: "8px",
              padding: "12px",
              background: "rgba(255, 255, 255, 0.02)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              fontSize: "0.75rem",
              color: "var(--color-text-secondary)",
              lineHeight: 1.4
            }}>
              <Info size={14} style={{ flexShrink: 0, marginTop: "2px", color: "var(--color-gold)" }} />
              <span>
                To run on QIE Mainnet, ensure your wallet is set to QIE RPC endpoints before connecting.
              </span>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="qr"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
              background: "rgba(0,0,0,0.4)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-lg)",
              textAlign: "center",
              gap: "16px"
            }}
          >
            <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--color-text-primary)" }}>
              Scan QR Code to Connect
            </div>
            
            {/* Mock QR Code Visual */}
            <div style={{
              width: "160px",
              height: "160px",
              background: "#ffffff",
              padding: "10px",
              borderRadius: "var(--radius-md)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 20px rgba(0,0,0,0.5)",
              position: "relative"
            }}>
              {/* Simple grid lines simulating QR */}
              <div style={{
                width: "100%",
                height: "100%",
                border: "4px solid #000000",
                position: "relative",
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gridTemplateRows: "repeat(4, 1fr)",
                gap: "8px"
              }}>
                <div style={{ background: "#000" }} />
                <div />
                <div />
                <div style={{ background: "#000" }} />
                <div />
                <div style={{ background: "#000" }} />
                <div style={{ background: "#000" }} />
                <div />
                <div />
                <div style={{ background: "#000" }} />
                <div style={{ background: "#000" }} />
                <div />
                <div style={{ background: "#000" }} />
                <div />
                <div />
                <div style={{ background: "#000" }} />
              </div>
            </div>

            <p style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", maxWidth: "200px" }}>
              Scan with any WalletConnect-compatible Web3 wallet app.
            </p>

            <div style={{ display: "flex", gap: "10px", width: "100%" }}>
              <button
                onClick={() => {
                  setShowQR(false);
                  setConnecting(null);
                }}
                className="aurix-btn aurix-btn-outline"
                style={{ flex: 1, fontSize: "0.75rem", padding: "8px 12px" }}
              >
                Cancel
              </button>
              <button
                onClick={simulateQRScan}
                className="aurix-btn aurix-btn-gold"
                style={{ flex: 1, fontSize: "0.75rem", padding: "8px 12px" }}
              >
                Scan Code
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
