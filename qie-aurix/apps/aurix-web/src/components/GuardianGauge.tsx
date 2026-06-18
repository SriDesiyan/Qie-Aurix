"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface GaugeProps {
  score: number;
  label?: string;
  size?: number;
}

export default function GuardianGauge({ score, label = "STRONG", size = 240 }: GaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const strokeWidth = 14;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  
  // Custom arc: open gap at the bottom (270 degrees total)
  const angleRange = 270;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (score / 1000) * (angleRange / 360) * circumference;
  const rotation = 135; // Centers the 270 deg arc nicely at the top

  useEffect(() => {
    let start = 0;
    const end = score;
    if (start === end) return;

    const totalDuration = 1500;
    const incrementTime = 25;
    const totalSteps = totalDuration / incrementTime;
    const stepValue = (end - start) / totalSteps;

    const timer = setInterval(() => {
      start += stepValue;
      if (start >= end) {
        clearInterval(timer);
        setAnimatedScore(end);
      } else {
        setAnimatedScore(Math.floor(start));
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [score]);

  // Color mapping based on values
  const getThemeColor = (val: number) => {
    if (val >= 800) return { primary: "#dfb443", glow: "rgba(223, 180, 67, 0.4)" }; // Gold
    if (val >= 600) return { primary: "#10b981", glow: "rgba(16, 185, 129, 0.3)" }; // Emerald
    if (val >= 400) return { primary: "#f59e0b", glow: "rgba(245, 158, 11, 0.3)" }; // Amber
    return { primary: "#f43f5e", glow: "rgba(244, 63, 94, 0.3)" }; // Rose
  };

  const theme = getThemeColor(score);

  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto",
      }}
    >
      {/* Outer Circular Tracks */}
      <svg
        width={size}
        height={size}
        style={{ transform: `rotate(${rotation}deg)`, overflow: "visible" }}
      >
        {/* Track path */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.02)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - (angleRange / 360) * circumference}
          strokeLinecap="round"
        />

        {/* Outer glowing border ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius + 8}
          fill="none"
          stroke="rgba(255, 255, 255, 0.01)"
          strokeWidth="1.5"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - (angleRange / 360) * circumference}
        />

        {/* Active Arc Progress */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={theme.primary}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          strokeLinecap="round"
          style={{
            filter: `drop-shadow(0 0 12px ${theme.glow})`,
          }}
        />
      </svg>

      {/* Internal Content Center */}
      <div
        style={{
          position: "absolute",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: size - 50,
          height: size - 50,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(6, 12, 33, 0.6) 0%, rgba(2, 4, 10, 0.8) 100%)",
          border: "1px solid rgba(255, 255, 255, 0.03)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.6), inset 0 2px 10px rgba(255,255,255,0.02)",
        }}
      >
        <span
          style={{
            fontSize: "0.6875rem",
            color: "var(--color-text-secondary)",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            fontWeight: 700,
            marginBottom: "2px",
          }}
        >
          Resilience Score
        </span>

        <motion.span
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "3.75rem",
            fontWeight: 800,
            lineHeight: 1,
            color: "var(--color-text-primary)",
            letterSpacing: "-0.02em",
          }}
          animate={{ scale: [0.95, 1] }}
          transition={{ duration: 0.5 }}
        >
          {animatedScore}
        </motion.span>

        <span
          style={{
            fontSize: "0.625rem",
            color: "var(--color-text-muted)",
            letterSpacing: "0.05em",
            marginBottom: "8px",
          }}
        >
          MAX 1000
        </span>

        <div
          style={{
            background: `${theme.primary}12`,
            border: `1px solid ${theme.primary}35`,
            color: theme.primary,
            fontSize: "0.75rem",
            fontWeight: 800,
            letterSpacing: "0.1em",
            padding: "4px 12px",
            borderRadius: "var(--radius-full)",
            boxShadow: `0 0 16px ${theme.glow}`,
          }}
        >
          {label}
        </div>
      </div>
    </div>
  );
}
