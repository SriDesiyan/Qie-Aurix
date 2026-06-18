import React from "react";
import { IconProps } from "./AurixShieldIcon";

export default function ResilienceScoreIcon({ size = 24, className, color = "currentColor" }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M4 15a8 8 0 1 1 16 0" />
      <path d="M12 14v-7" />
      <circle cx="12" cy="15" r="1" />
      <path d="M6 6l1.5 1.5" />
      <path d="M18 6l-1.5 1.5" />
    </svg>
  );
}
