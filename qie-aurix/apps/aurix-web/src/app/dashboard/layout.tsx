"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LayoutDashboard, RefreshCw, KeyRound, ShieldAlert, Sliders, Activity } from "lucide-react";
import AurixLogo from "../../components/AurixLogo";
import DynamicBackground from "../../components/DynamicBackground";

const NAV_ITEMS = [
  { href: "/dashboard",          icon: LayoutDashboard, label: "Overview" },
  { href: "/dashboard/recovery",  icon: RefreshCw,       label: "Recovery" },
  { href: "/dashboard/family",    icon: KeyRound,        label: "Family Vault" },
  { href: "/dashboard/audit",     icon: ShieldAlert,     label: "Audit" },
  { href: "/dashboard/policy",    icon: Sliders,         label: "Policies" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="app-shell">
      <DynamicBackground />

      {/* ── Sidebar ── */}
      <aside className="sidebar">
        {/* Nav Branding Logo */}
        <div style={{ padding: "0 24px 28px", borderBottom: "1px solid var(--color-border)", display: "flex", justifyContent: "center" }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <AurixLogo variant="wordmark" size={32} />
          </Link>
        </div>

        {/* Navigation Options */}
        <nav style={{ flex: 1, padding: "20px 16px" }}>
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                id={`nav-${item.label.toLowerCase().replace(" ", "-")}`}
                style={{ textDecoration: "none" }}
              >
                <motion.div
                  whileHover={{ x: 3 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "12px 16px",
                    borderRadius: "var(--radius-md)",
                    marginBottom: "6px",
                    background: active ? "var(--color-gold-dim)" : "transparent",
                    border: `1px solid ${active ? "rgba(223, 180, 67, 0.15)" : "transparent"}`,
                    color: active ? "var(--color-gold)" : "var(--color-text-secondary)",
                    fontSize: "0.875rem",
                    fontWeight: active ? 700 : 500,
                    cursor: "pointer",
                  }}
                >
                  <Icon size={18} style={{ color: active ? "var(--color-gold)" : "var(--color-text-secondary)" }} />
                  {item.label}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Oracle Status Card */}
        <div style={{ padding: "20px 24px", borderTop: "1px solid var(--color-border)" }}>
          <div style={{ fontSize: "0.6875rem", color: "var(--color-text-muted)", marginBottom: "8px", letterSpacing: "0.08em", fontWeight: 700, textTransform: "uppercase" }}>
            Guardian Oracle
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "var(--color-safe)",
                boxShadow: "0 0 10px var(--color-safe)",
              }}
            />
            <span style={{ fontSize: "0.8125rem", color: "var(--color-safe)", fontWeight: 600 }}>Active Integrity</span>
          </div>
        </div>
      </aside>

      {/* ── Main Panel ── */}
      <div className="main-content">
        {/* Topbar Panel */}
        <header className="topbar">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Activity size={16} style={{ color: "var(--color-text-secondary)", opacity: 0.7 }} />
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>
              {NAV_ITEMS.find((n) => n.href === pathname)?.label ?? "Dashboard"}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <span
              style={{
                fontSize: "0.6875rem",
                fontWeight: 700,
                background: "rgba(0, 245, 212, 0.08)",
                border: "1px solid rgba(0, 245, 212, 0.25)",
                color: "#00f5d4",
                padding: "4px 12px",
                borderRadius: "var(--radius-full)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              QIE Testnet
            </span>
            <div
              style={{
                padding: "8px 16px",
                background: "rgba(0, 0, 0, 0.25)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-full)",
                fontSize: "0.8125rem",
                color: "var(--color-text-secondary)",
                fontFamily: "var(--font-mono, monospace)",
                boxShadow: "inset 0 1px 4px rgba(0,0,0,0.2)",
              }}
            >
              0x7a4b...c912
            </div>
          </div>
        </header>

        {/* Page Content Panel */}
        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  );
}
