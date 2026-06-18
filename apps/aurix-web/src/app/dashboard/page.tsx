"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Sparkles, MessageSquare, Send, AlertOctagon, HelpCircle, CheckCircle2 } from "lucide-react";
import GuardianGauge from "../../components/GuardianGauge";
import TrustGraph from "../../components/TrustGraph";
import ScoreBreakdownGrid from "../../components/ScoreBreakdownGrid";
import ProtectionTimeline from "../../components/ProtectionTimeline";
import StatusPill from "../../components/StatusPill";

// Mock Data
const MOCK_SCORE = {
  total: 743,
  label: "STRONG",
  asset_stability:    { value: 78, label: "Asset Stability",   reason: "Lending configurations active & healthy" },
  recovery_readiness: { value: 72, label: "Recovery Readiness",reason: "AurixRecoveryGate deployed 18 days ago" },
  contract_integrity: { value: 90, label: "Contract Integrity", reason: "Zero warning logs on audited anchors" },
  stablecoin_buffer:  { value: 61, label: "Stablecoin Buffer",  reason: "Stable reserve within monitored bounds" },
  chain_breadth:      { value: 70, label: "Chain Breadth",      reason: "Asset risk diversified across 2 layers" },
};

const MOCK_TRUST = {
  identity_trust: 88,
  validator_participation: 72,
  community_contribution: 84,
  on_chain_reliability: 91,
  composite: 84.2,
  tier: "TRUSTED",
};

const MOCK_RISK = {
  triggers: [
    { id: "low_stablecoin", label: "Low Stablecoin Buffer", severity: "warning" as const, description: "QUSDC stable holdings below 15%." },
    { id: "missing_family", label: "No Family Vault", severity: "warning" as const, description: "No heir allocation designations found." },
  ],
  overall_risk: "MEDIUM",
};

const MOCK_TIMELINE = [
  { time: "10 mins ago", type: "AUDIT", message: "Audit Anchored", details: "SafetyAuditAnchor updated audit bafybei...", status: "completed" as const },
  { time: "2 hours ago", type: "KEY", message: "Domain Identity Registered", details: "Linked family.aurix.qie to trust profile", status: "completed" as const },
  { time: "Yesterday", type: "REBALANCE", message: "Rebalancer Recommendation", details: "Suggested swap: 8% volatile to QUSDC", status: "completed" as const },
];

const GUARDIAN_STEPS = [
  { id: "emergency-reserve",   label: "Emergency Reserve",   desc: "Depositing QUSDC vault reserve",  contract: "ResiliencePolicyVault" },
  { id: "family-vault",        label: "Family Vault",         desc: "Deploying legacy controllers",     contract: "FamilyVaultController" },
  { id: "recovery-protection", label: "Recovery Protection",  desc: "Activating mis-transfer gate",     contract: "AurixRecoveryGate" },
  { id: "risk-monitoring",     label: "Risk Monitoring",      desc: "Anchoring real-time snapshots",    contract: "SafetyAuditAnchor" },
];

export default function DashboardPage() {
  const [loaded, setLoaded] = useState(false);
  const [guardianActive, setGuardianActive] = useState(false);
  const [guardianStepsDone, setGuardianStepsDone] = useState<number>(-1);
  const [activating, setActivating] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "ai"; text: string }[]>([]);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoaded(true);
  }, []);

  const activateGuardian = async () => {
    if (activating || guardianActive) return;
    setActivating(true);
    for (let i = 0; i < GUARDIAN_STEPS.length; i++) {
      await new Promise((r) => setTimeout(r, 800));
      setGuardianStepsDone(i);
    }
    await new Promise((r) => setTimeout(r, 400));
    setGuardianActive(true);
    setActivating(false);
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const msg = chatInput.trim();
    setChatInput("");
    setChatMessages((prev) => [...prev, { role: "user", text: msg }]);
    
    await new Promise((r) => setTimeout(r, 700));
    let reply = "I am ready to help you analyze your portfolio. What security metrics would you like to review?";
    if (msg.toLowerCase().includes("protect") || msg.toLowerCase().includes("guardian")) {
      reply = "Resilience evaluation complete. Swapping a portion of volatile tokens to QUSDC and activating Guardian Mode is highly recommended to secure your assets.";
    } else if (msg.toLowerCase().includes("score")) {
      reply = "Your Resilience Score is 743. You can boost this score by establishing a stablecoin vault reserve.";
    }
    setChatMessages((prev) => [...prev, { role: "ai", text: reply }]);
    setTimeout(() => chatRef.current?.scrollTo({ top: 9999, behavior: "smooth" }), 100);
  };

  const finalScore = guardianActive ? Math.min(MOCK_SCORE.total + 58, 1000) : MOCK_SCORE.total;
  const scoreLabel = finalScore >= 800 ? "GUARDIAN" : "STRONG";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Row 1: Resilience score gauge, Guardian mode panel, Trust Graph */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr 1fr", gap: "24px" }} className="grid-3">
        
        {/* Score gauge Card */}
        <motion.div
          className={`aurix-card ${scoreLabel === "GUARDIAN" ? "aurix-card-gold" : ""}`}
          initial={{ opacity: 0, y: 15 }}
          animate={loaded ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          style={{ display: "flex", flexDirection: "column", justifyItems: "center" }}
        >
          <div style={{ marginBottom: "20px", display: "flex", justifyContent: "center" }}>
            <GuardianGauge score={finalScore} label={scoreLabel} size={190} />
          </div>
          <ScoreBreakdownGrid
            assetStability={MOCK_SCORE.asset_stability}
            recoveryReadiness={MOCK_SCORE.recovery_readiness}
            contractIntegrity={MOCK_SCORE.contract_integrity}
            stablecoinBuffer={MOCK_SCORE.stablecoin_buffer}
            chainBreadth={MOCK_SCORE.chain_breadth}
          />
        </motion.div>

        {/* Guardian mode center moment */}
        <motion.div
          className={`aurix-card ${guardianActive ? "aurix-card-gold" : ""}`}
          initial={{ opacity: 0, y: 15 }}
          animate={loaded ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}
        >
          <AnimatePresence mode="wait">
            {!guardianActive && !activating && (
              <motion.div key="inactive" style={{ width: "100%" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
                  <div style={{
                    width: "64px", height: "64px", borderRadius: "50%",
                    background: "rgba(223, 180, 67, 0.08)", border: "1px solid rgba(223, 180, 67, 0.25)",
                    display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-gold)",
                  }}>
                    <Shield size={32} />
                  </div>
                </div>
                <h3 style={{ marginBottom: "10px", fontSize: "1.35rem" }}>Guardian Mode™</h3>
                <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", marginBottom: "24px", lineHeight: 1.6 }}>
                  Initialize multi-layered asset safety protocols including stable reserves, domain-anchored heirs, and verified recovery gates.
                </p>

                <div style={{ background: "rgba(0,0,0,0.25)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", padding: "14px", marginBottom: "28px" }}>
                  <span style={{ fontSize: "0.6875rem", color: "var(--color-text-muted)", display: "block", marginBottom: "4px", fontWeight: 700, textTransform: "uppercase" }}>Current Protection Coverage</span>
                  <span style={{ fontFamily: "var(--font-display)", fontSize: "2.125rem", fontWeight: 800, color: "var(--color-amber)" }}>52%</span>
                </div>

                <button
                  id="activate-guardian-btn"
                  className="aurix-btn aurix-btn-guardian w-full"
                  onClick={activateGuardian}
                >
                  ⚡ Activate Guardian Mode
                </button>
              </motion.div>
            )}

            {activating && (
              <motion.div key="activating" style={{ width: "100%" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <h3 style={{ marginBottom: "20px", color: "var(--color-gold)", fontSize: "1.2rem" }}>Deploying Security Controls</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%" }}>
                  {GUARDIAN_STEPS.map((step, idx) => (
                    <div
                      key={step.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "10px 14px",
                        background: guardianStepsDone >= idx ? "var(--color-safe-dim)" : "rgba(255,255,255,0.01)",
                        borderRadius: "var(--radius-md)",
                        border: `1px solid ${guardianStepsDone >= idx ? "rgba(16,185,129,0.2)" : "var(--color-border)"}`,
                        textAlign: "left",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <span style={{ fontSize: "0.9rem", color: guardianStepsDone >= idx ? "var(--color-safe)" : "var(--color-text-muted)" }}>
                        {guardianStepsDone >= idx ? "✓" : "○"}
                      </span>
                      <div>
                        <div style={{ fontSize: "0.8125rem", fontWeight: 700, color: guardianStepsDone >= idx ? "var(--color-safe)" : "var(--color-text-secondary)" }}>
                          {step.label}
                        </div>
                        <div style={{ fontSize: "0.6875rem", color: "var(--color-text-muted)" }}>{step.contract}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {guardianActive && (
              <motion.div key="active" style={{ width: "100%" }} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
                  <div style={{
                    width: "72px", height: "72px", borderRadius: "50%",
                    background: "rgba(16, 185, 129, 0.08)", border: "2px solid rgba(16, 185, 129, 0.35)",
                    display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-safe)",
                    boxShadow: "0 0 32px rgba(16, 185, 129, 0.25)",
                  }}>
                    <CheckCircle2 size={36} />
                  </div>
                </div>
                <h3 className="text-gold-gradient" style={{ marginBottom: "6px", fontSize: "1.35rem" }}>Guardian Protected</h3>
                <span style={{ fontSize: "0.6875rem", color: "var(--color-safe)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Active Shield Enforcement</span>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center", margin: "20px 0" }}>
                  {GUARDIAN_STEPS.map((s) => (
                    <span key={s.id} style={{ fontSize: "0.65rem", padding: "4px 8px", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)", color: "var(--color-safe)", borderRadius: "var(--radius-sm)" }}>{s.label}</span>
                  ))}
                </div>

                <div style={{ background: "rgba(0,0,0,0.25)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", padding: "14px" }}>
                  <span style={{ fontSize: "0.6875rem", color: "var(--color-text-muted)", display: "block", marginBottom: "4px" }}>Coverage Level</span>
                  <span style={{ fontFamily: "var(--font-display)", fontSize: "2.125rem", fontWeight: 800, color: "var(--color-teal)" }}>87%</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Trust Profile Card */}
        <motion.div
          className="aurix-card"
          initial={{ opacity: 0, y: 15 }}
          animate={loaded ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
            <h3>Trust Graph</h3>
            <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", display: "flex", alignItems: "center", gap: "4px" }}><Sparkles size={12} style={{ color: "var(--color-gold)" }} /> verified pass</span>
          </div>
          <TrustGraph
            identityTrust={MOCK_TRUST.identity_trust}
            validatorParticipation={MOCK_TRUST.validator_participation}
            communityContribution={MOCK_TRUST.community_contribution}
            onChainReliability={MOCK_TRUST.on_chain_reliability}
            composite={MOCK_TRUST.composite}
          />
        </motion.div>
      </div>

      {/* Row 2: Left-side security timeline, Right-side floating risk summary panel */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "24px" }} className="grid-2">
        
        {/* Security Timeline */}
        <motion.div className="aurix-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h3 style={{ marginBottom: "20px" }}>Protection Timeline</h3>
          <ProtectionTimeline events={MOCK_TIMELINE} />
        </motion.div>

        {/* Risk summary panel */}
        <motion.div className="aurix-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h3>Risk Warnings</h3>
            <StatusPill status="warning" label="Medium Exposure" />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {MOCK_RISK.triggers.map((trigger) => (
              <div
                key={trigger.id}
                style={{
                  padding: "16px",
                  background: "rgba(0, 0, 0, 0.25)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  borderLeft: "3px solid var(--color-amber)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                  <AlertOctagon size={16} style={{ color: "var(--color-amber)" }} />
                  <span style={{ fontSize: "0.875rem", fontWeight: 700 }}>{trigger.label}</span>
                </div>
                <p style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)", lineHeight: 1.5 }}>{trigger.description}</p>
              </div>
            ))}
          </div>

          {!guardianActive ? (
            <div style={{ marginTop: "20px", padding: "14px", background: "var(--color-gold-dim)", border: "1px solid rgba(223,180,67,0.2)", borderRadius: "var(--radius-md)", fontSize: "0.8rem", color: "var(--color-gold)", lineHeight: 1.5 }}>
              🛡️ **Guardian Mode Suggested**: Deploy emergency reserves and configure heirs immediately to resolve warnings.
            </div>
          ) : (
            <div style={{ marginTop: "20px", padding: "14px", background: "var(--color-safe-dim)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: "var(--radius-md)", fontSize: "0.8rem", color: "var(--color-safe)" }}>
              ✓ **All Triggers Addressed**: Guardian mode is actively enforcing policy rules.
            </div>
          )}
        </motion.div>
      </div>

      {/* Floating Chat Component (Ask Aurix AI) */}
      <div className="chat-box">
        <AnimatePresence>
          {chatOpen && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              style={{
                background: "var(--color-bg-card)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-lg)",
                marginBottom: "12px",
                overflow: "hidden",
                boxShadow: "var(--shadow-card)",
                backdropFilter: "blur(24px)",
              }}
            >
              <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--color-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--color-text-primary)", display: "flex", alignItems: "center", gap: "8px" }}><Shield size={16} style={{ color: "var(--color-gold)" }} /> Aurix AI Assistant</span>
                <button onClick={() => setChatOpen(false)} style={{ background: "none", border: "none", color: "var(--color-text-secondary)", cursor: "pointer", fontSize: "1rem" }}>✕</button>
              </div>

              <div ref={chatRef} style={{ padding: "20px", height: "240px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px" }}>
                {chatMessages.length === 0 && (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", opacity: 0.4, gap: "10px" }}>
                    <HelpCircle size={32} />
                    <span style={{ fontSize: "0.8rem" }}>Ask me anything about your protection status...</span>
                  </div>
                )}
                {chatMessages.map((m, idx) => (
                  <div
                    key={idx}
                    style={{
                      alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                      maxWidth: "85%",
                      padding: "10px 14px",
                      borderRadius: m.role === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                      background: m.role === "user" ? "var(--color-gold-dim)" : "rgba(255,255,255,0.02)",
                      border: `1px solid ${m.role === "user" ? "rgba(223,180,67,0.2)" : "rgba(255,255,255,0.04)"}`,
                      fontSize: "0.8125rem",
                      lineHeight: 1.5,
                      color: m.role === "user" ? "var(--color-gold)" : "var(--color-text-primary)",
                    }}
                  >
                    {m.text}
                  </div>
                ))}
              </div>

              <form onSubmit={handleChatSubmit} style={{ padding: "12px 16px", borderTop: "1px solid var(--color-border)", display: "flex", gap: "8px" }}>
                <input
                  className="aurix-input"
                  id="aurix-chat-input"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask a question..."
                  style={{ flex: 1 }}
                />
                <button type="submit" className="aurix-btn aurix-btn-gold" id="aurix-chat-submit" style={{ padding: "10px 16px" }}>
                  <Send size={14} />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          className={`aurix-btn ${chatOpen ? "aurix-btn-outline" : "aurix-btn-guardian"}`}
          onClick={() => setChatOpen(!chatOpen)}
          id="aurix-chat-toggle"
          style={{ width: "100%" }}
        >
          {chatOpen ? "✕ Close Console" : <span style={{ display: "flex", alignItems: "center", gap: "8px" }}><MessageSquare size={16} /> Consult Guardian AI</span>}
        </button>
      </div>
    </div>
  );
}
