"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { qiePassConnector, type ConnectionState } from "../lib/qie/QiePassConnector";
import AuthSelector from "../components/auth/AuthSelector";
import type { QiePassIdentity } from "@aurix/core";
import DynamicBackground from "../components/DynamicBackground";
import AurixLogo from "../components/AurixLogo";
import { Eye, Check, AlertTriangle } from "lucide-react";
import dynamic from "next/dynamic";
import AurixShieldIcon from "../components/icons/AurixShieldIcon";
import GuardianModeIcon from "../components/icons/GuardianModeIcon";
import RecoveryLayerIcon from "../components/icons/RecoveryLayerIcon";
import FamilyVaultIcon from "../components/icons/FamilyVaultIcon";
import { useSession } from "../context/SessionContext";

const ResilienceCore3D = dynamic(() => import("../components/ResilienceCore3D"), { ssr: false });

// Select 3 best feature cards as requested in landing page structure
const LANDING_FEATURES = [
  {
    icon: GuardianModeIcon,
    title: "Guardian Mode™",
    description: "Deploy emergency reserves, activate family vaults, and initialize security firewalls simultaneously in one click.",
    color: "var(--color-gold)",
  },
  {
    icon: RecoveryLayerIcon,
    title: "Accidental Recovery",
    description: "Reclaim assets sent to incorrect contract addresses permissionlessly using cryptographic signatures and oracle consensus.",
    color: "var(--color-teal)",
  },
  {
    icon: FamilyVaultIcon,
    title: "Multi-Heir Vaults",
    description: "Secure legacy assets behind customizable time-locks and allocation parameters mapped to verified QIE Pass IDs.",
    color: "#a78bfa",
  },
];

export default function LandingPage() {
  const [connState, setConnState] = useState<ConnectionState>({ status: "disconnected" });
  const { setDemoMode } = useSession();

  const handleAuthSuccess = (address: string, identity: QiePassIdentity) => {
    setConnState({ status: "connected", address, identity });
  };

  return (
    <main style={{ minHeight: "100vh", position: "relative", zIndex: 1, overflow: "hidden" }}>
      <DynamicBackground />

      {/* Header Bar */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "24px 40px",
          position: "relative",
          zIndex: 10,
        }}
      >
        <AurixLogo variant="wordmark" size={36} />
        {process.env.NEXT_PUBLIC_MODE !== "production" && (
          <Link
            href="/dashboard"
            id="demo-dashboard-btn"
            style={{ textDecoration: "none" }}
            onClick={() => setDemoMode()}
          >
            <button className="aurix-btn aurix-btn-outline" style={{ fontSize: "0.8125rem", padding: "10px 22px" }}>
              <Eye size={14} /> Explore Demo
            </button>
          </Link>
        )}
      </header>

      {/* Hero Section */}
      <section
        style={{
          padding: "100px 24px 60px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          position: "relative",
          zIndex: 5,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ maxWidth: "840px" }}
        >
          {/* Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 14px",
              borderRadius: "var(--radius-full)",
              background: "rgba(223, 180, 67, 0.06)",
              border: "1px solid rgba(223, 180, 67, 0.2)",
              color: "var(--color-gold)",
              fontSize: "0.75rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: "28px",
            }}
          >
            <AurixShieldIcon size={14} color="var(--color-gold)" /> Decentralized Financial Immune System
          </div>

          {/* Headline */}
          <h1
            style={{
              fontSize: "clamp(2.5rem, 5.5vw, 4rem)",
              lineHeight: 1.15,
              marginBottom: "20px",
              fontWeight: 800,
              letterSpacing: "-0.02em",
            }}
          >
            One Identity. One AI Guardian. <br />
            <span className="text-gold-gradient">Continuous Protection Across Chains.</span>
          </h1>

          {/* Mission Statement */}
          <p
            style={{
              fontSize: "1.15rem",
              color: "var(--color-text-secondary)",
              maxWidth: "640px",
              margin: "0 auto 40px",
              lineHeight: 1.6,
            }}
          >
            QIE Aurix acts as a silent guardian for your Web3 assets. Anchored on QIE Pass, it constructs a living Trust Profile and automatically executes defense measures when anomalies arise.
          </p>

          {/* CTA Area */}
          <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap", marginBottom: "60px" }}>
            <AnimatePresence mode="wait">
              {connState.status === "disconnected" && (
                <AuthSelector onAuthSuccess={handleAuthSuccess} />
              )}
              {connState.status === "connecting" && (
                <motion.button
                  key="connecting"
                  className="aurix-btn aurix-btn-gold"
                  disabled
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <span className="animate-spin-slow" style={{ display: "inline-block" }}>⟳</span>
                  &nbsp; Reading Pass Vault...
                </motion.button>
              )}
              {connState.status === "connected" && (
                <motion.div
                  key="connected"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}
                >
                  <div
                    style={{
                      background: "var(--color-safe-dim)",
                      border: "1px solid rgba(16,185,129,0.3)",
                      color: "var(--color-safe)",
                      padding: "8px 16px",
                      borderRadius: "var(--radius-full)",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <Check size={14} /> QIE Pass Linked: {connState.identity.tier}
                  </div>
                  <Link href="/dashboard" id="enter-dashboard-btn" style={{ textDecoration: "none" }}>
                    <motion.button
                      className="aurix-btn aurix-btn-teal"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Enter Dashboard →
                    </motion.button>
                  </Link>
                </motion.div>
              )}
              {connState.status === "no_pass" && (
                <motion.p key="no_pass" style={{ color: "var(--color-amber)", fontSize: "0.875rem", display: "inline-flex", alignItems: "center", gap: "6px" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <AlertTriangle size={14} /> QIE Pass required. Please initialize a registry profile to activate Aurix.
                </motion.p>
              )}
              {connState.status === "error" && (
                <motion.p key="error" style={{ color: "var(--color-critical)", fontSize: "0.875rem" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {connState.message}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Large Animated Visual Composition (Abstract Crest Concept) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 1 }}
          style={{
            position: "relative",
            width: "100%",
            maxWidth: "600px",
            height: "360px",
            margin: "0 auto 60px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {/* Concentric glowing outline circles */}
          <div
            style={{
              position: "absolute",
              width: "340px",
              height: "340px",
              borderRadius: "50%",
              border: "1px solid rgba(0, 245, 212, 0.05)",
              boxShadow: "0 0 100px rgba(0,245,212,0.03)",
              animation: "spin-slow 25s linear infinite",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: "260px",
              height: "260px",
              borderRadius: "50%",
              border: "1px dashed rgba(223, 180, 67, 0.08)",
              animation: "spin-slow 15s linear infinite reverse",
            }}
          />
          {/* Interactive 3D WebGL Pacman Maze Resilience Core */}
          <ResilienceCore3D />
        </motion.div>
      </section>

      {/* Flagship Features: 3 Cards Only */}
      <section style={{ padding: "0 24px 80px", maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 5 }}>
        <div className="grid-3">
          {LANDING_FEATURES.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                className="aurix-card"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.12 }}
                viewport={{ once: true }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    background: `${feature.color}10`,
                    border: `1px solid ${feature.color}25`,
                    color: feature.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "20px",
                  }}
                >
                  <Icon size={22} />
                </div>
                <h3 style={{ marginBottom: "10px", fontSize: "1.1rem" }}>{feature.title}</h3>
                <p style={{ fontSize: "0.875rem", lineHeight: 1.6, color: "var(--color-text-secondary)" }}>
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Credibility section showing protection, recovery, family vault, and audit */}
      <section style={{ padding: "0 24px 100px", maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 5 }}>
        <motion.div
          className="aurix-card aurix-card-teal"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ padding: "50px", textAlign: "center" }}
        >
          <h2 style={{ marginBottom: "14px", fontSize: "1.75rem" }}>
            Ecosystem <span className="text-teal-gradient">Continuity Pillars</span>
          </h2>
          <p style={{ color: "var(--color-text-secondary)", maxWidth: "600px", margin: "0 auto 40px", fontSize: "0.9375rem" }}>
            Aurix integrates deeply with the QIE chain environment, deploying modular anchors across vital components.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
            {[
              { title: "Continuous Protection", desc: "Monitored policies & emergency reserves", badge: "ResiliencePolicyVault" },
              { title: "Crypto Recovery", desc: "Accidental transaction claim gate", badge: "AurixRecoveryGate" },
              { title: "Legacy Vaults", desc: "Domain-anchored heir controllers", badge: "FamilyVaultController" },
              { title: "Tamper-Evident Audits", desc: "On-chain audit trails & anchors", badge: "SafetyAuditAnchor" },
            ].map((pillar) => (
              <div
                key={pillar.title}
                style={{
                  padding: "20px",
                  background: "rgba(0,0,0,0.3)",
                  border: "1px solid rgba(0, 245, 212, 0.1)",
                  borderRadius: "var(--radius-md)",
                  textAlign: "left",
                }}
              >
                <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--color-text-primary)", marginBottom: "4px" }}>
                  {pillar.title}
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", marginBottom: "12px" }}>
                  {pillar.desc}
                </div>
                <code style={{ fontSize: "0.6875rem", color: "var(--color-teal)", fontFamily: "monospace" }}>
                  {pillar.badge}
                </code>
              </div>
            ))}
          </div>
        </motion.div>
      </section>
    </main>
  );
}
