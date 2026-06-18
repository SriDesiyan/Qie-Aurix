"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import WalletLogin from "./WalletLogin";
import QiePassLogin from "./QiePassLogin";
import { type QiePassIdentity } from "@aurix/core";
import { KeyRound, ShieldAlert, Sparkles, Terminal } from "lucide-react";
import { useSession } from "../../context/SessionContext";

interface AuthSelectorProps {
  onAuthSuccess: (address: string, identity: QiePassIdentity) => void;
}

type AuthTab = "wallet" | "identifier" | "sandbox";

export default function AuthSelector({ onAuthSuccess }: AuthSelectorProps) {
  const [activeTab, setActiveTab] = useState<AuthTab>("wallet");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { setDemoMode, setMainnetMode } = useSession();

  const handleSuccess = (address: string, identity: QiePassIdentity) => {
    setErrorMessage(null);
    
    // Set centralized session network & auth mode
    if (activeTab === "sandbox") {
      setDemoMode(address, identity);
    } else if (activeTab === "identifier") {
      setMainnetMode(address, identity, "qiepass");
    } else if (activeTab === "wallet") {
      setMainnetMode(address, identity, "wallet");
    }

    onAuthSuccess(address, identity);
  };

  const handleError = (message: string) => {
    setErrorMessage(message);
  };

  const handleSandboxSelect = (role: "basic" | "validator" | "guardian") => {
    let address = "";
    let identity: QiePassIdentity;

    if (role === "basic") {
      address = "0xbasic7a4b000000000000000000000000000c912";
      identity = {
        address,
        passTokenId: "1234",
        tier: "BASIC",
        verifiedDomains: [],
        isValidator: false,
        communityScore: 35,
        passIssuedAt: Math.floor(Date.now() / 1000) - 90 * 86400,
      };
    } else if (role === "validator") {
      address = "0xvalidator7a4b0000000000000000000000000c912";
      identity = {
        address,
        passTokenId: "4321",
        tier: "VERIFIED",
        verifiedDomains: ["validator.aurix.qie"],
        isValidator: true,
        communityScore: 78,
        passIssuedAt: Math.floor(Date.now() / 1000) - 270 * 86400,
      };
    } else {
      address = "0x7a4bc9120000000000000000000000000000c912";
      identity = {
        address,
        passTokenId: "1024",
        tier: "GUARDIAN",
        verifiedDomains: ["family.aurix.qie", "vault.aurix.qie"],
        isValidator: true,
        communityScore: 98,
        passIssuedAt: Math.floor(Date.now() / 1000) - 540 * 86400,
      };
    }

    handleSuccess(address, identity);
  };

  return (
    <div
      style={{
        background: "rgba(30, 41, 59, 0.4)",
        backdropFilter: "blur(24px)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        padding: "24px",
        width: "100%",
        maxWidth: "460px",
        boxShadow: "var(--shadow-card)",
      }}
    >
      {/* Tabs list selector */}
      <div
        style={{
          display: "flex",
          background: "rgba(0,0,0,0.25)",
          borderRadius: "var(--radius-md)",
          padding: "4px",
          marginBottom: "20px",
        }}
      >
        {[
          { id: "wallet", label: "Wallet", icon: KeyRound },
          { id: "identifier", label: "QIE Pass ID", icon: Sparkles },
          ...(process.env.NEXT_PUBLIC_MODE === "production" ? [] : [{ id: "sandbox", label: "Sandbox", icon: Terminal }]),
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as AuthTab);
                setErrorMessage(null);
              }}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                padding: "10px 4px",
                background: isSelected ? "rgba(255, 255, 255, 0.05)" : "transparent",
                border: "none",
                borderRadius: "var(--radius-sm)",
                color: isSelected ? "var(--color-gold)" : "var(--color-text-secondary)",
                cursor: "pointer",
                fontSize: "0.78rem",
                fontWeight: isSelected ? 700 : 500,
                transition: "all 0.2s ease",
              }}
            >
              <Icon size={13} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Connection status notifications */}
      <AnimatePresence mode="wait">
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              padding: "10px 14px",
              background: "rgba(239, 68, 68, 0.08)",
              border: "1px solid rgba(239, 68, 68, 0.25)",
              color: "var(--color-critical)",
              borderRadius: "var(--radius-md)",
              fontSize: "0.78rem",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <ShieldAlert size={14} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs panels */}
      <div style={{ minHeight: "180px", display: "flex", alignItems: "center" }}>
        <AnimatePresence mode="wait">
          {activeTab === "wallet" && (
            <motion.div
              key="wallet-tab"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              style={{ width: "100%" }}
            >
              <WalletLogin onSuccess={handleSuccess} onError={handleError} />
            </motion.div>
          )}

          {activeTab === "identifier" && (
            <motion.div
              key="identifier-tab"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              style={{ width: "100%" }}
            >
              <QiePassLogin onSuccess={handleSuccess} onError={handleError} />
            </motion.div>
          )}

          {activeTab === "sandbox" && process.env.NEXT_PUBLIC_MODE !== "production" && (
            <motion.div
              key="sandbox-tab"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%" }}
            >
              <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", marginBottom: "8px", textAlign: "center" }}>
                Select a preset role to simulate full dashboard access instantly:
              </div>

              {[
                { id: "basic", label: "Basic Wallet User", desc: "No domains, 35 community score, 380 Resilience", color: "rgba(255,255,255,0.02)", border: "var(--color-border)", text: "var(--color-text-secondary)" },
                { id: "validator", label: "Verified Node Validator", desc: "1 domain, active validator, 640 Resilience", color: "rgba(0, 245, 212, 0.03)", border: "rgba(0, 245, 212, 0.15)", text: "var(--color-teal)" },
                { id: "guardian", label: "Guardian Shield Pro", desc: "2 domains, active node, 890 Resilience (Full Mode)", color: "rgba(223, 180, 67, 0.04)", border: "rgba(223, 180, 67, 0.2)", text: "var(--color-gold)" },
              ].map((role) => (
                <button
                  key={role.id}
                  onClick={() => handleSandboxSelect(role.id as any)}
                  className="aurix-btn w-full"
                  id={`sandbox-role-${role.id}`}
                  style={{
                    background: role.color,
                    border: `1px solid ${role.border}`,
                    padding: "12px 16px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    height: "auto",
                    textAlign: "left",
                    transition: "all 0.2s ease",
                  }}
                >
                  <span style={{ fontWeight: 700, fontSize: "0.85rem", color: role.text, marginBottom: "2px" }}>
                    {role.label}
                  </span>
                  <span style={{ fontSize: "0.7rem", color: "var(--color-text-muted)" }}>
                    {role.desc}
                  </span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
