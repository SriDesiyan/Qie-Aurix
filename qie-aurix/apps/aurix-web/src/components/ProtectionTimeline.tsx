"use client";

import { motion } from "framer-motion";
import { Lock, Shield, CheckCircle, RefreshCw, KeyRound } from "lucide-react";

interface TimelineEvent {
  time: string;
  type: string;
  message: string;
  details: string;
  status: "active" | "completed" | "pending";
}

interface TimelineProps {
  events: TimelineEvent[];
}

export default function ProtectionTimeline({ events }: TimelineProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case "LOCK": return Lock;
      case "AUDIT": return Shield;
      case "REBALANCE": return RefreshCw;
      case "KEY": return KeyRound;
      default: return CheckCircle;
    }
  };

  const getStatusColor = (status: string) => {
    if (status === "active") return "var(--color-gold)";
    if (status === "completed") return "var(--color-safe)";
    return "var(--color-text-muted)";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", position: "relative", paddingLeft: "24px" }}>
      {/* Central Line */}
      <div
        style={{
          position: "absolute",
          top: "8px",
          bottom: "8px",
          left: "8px",
          width: "2px",
          background: "linear-gradient(180deg, rgba(223, 180, 67, 0.2) 0%, rgba(0, 245, 212, 0.05) 100%)",
        }}
      />

      {events.map((event, i) => {
        const Icon = getIcon(event.type);
        const color = getStatusColor(event.status);

        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            viewport={{ once: true }}
            style={{
              position: "relative",
              marginBottom: "20px",
              paddingBottom: i === events.length - 1 ? 0 : "20px",
            }}
          >
            {/* Timeline Dot Icon */}
            <div
              style={{
                position: "absolute",
                left: "-24px",
                top: "4px",
                width: "18px",
                height: "18px",
                borderRadius: "50%",
                background: "var(--color-bg-darkest)",
                border: `2px solid ${color}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: color,
                zIndex: 2,
              }}
            >
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: color }} />
            </div>

            {/* Event Content card */}
            <div
              style={{
                background: "rgba(255, 255, 255, 0.005)",
                border: "1px solid rgba(255, 255, 255, 0.02)",
                borderRadius: "var(--radius-md)",
                padding: "14px 18px",
                transition: "all 0.25s ease",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                <span style={{ fontSize: "0.6875rem", color: "var(--color-text-muted)", fontWeight: 600 }}>{event.time}</span>
                <span
                  style={{
                    fontSize: "0.625rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: color,
                  }}
                >
                  {event.status}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" }}>
                <Icon size={14} style={{ color: color }} />
                <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--color-text-primary)" }}>{event.message}</span>
              </div>
              <p style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>{event.details}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
