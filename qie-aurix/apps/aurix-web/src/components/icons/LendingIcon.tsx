import React from "react";
import { IconProps } from "./AurixShieldIcon";

export default function LendingIcon({ size = 24, className, color = "currentColor" }: IconProps) {
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
      <line x1="12" y1="3" x2="12" y2="20" />
      <line x1="9" y1="20" x2="15" y2="20" />
      <line x1="5" y1="7" x2="19" y2="7" />
      <path d="M5 7L2 13h6L5 7z" />
      <path d="M19 7l-3 6h6l-3-6z" />
    </svg>
  );
}
