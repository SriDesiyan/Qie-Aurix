import React from "react";
import { IconProps } from "./AurixShieldIcon";

export default function TrustGraphIcon({ size = 24, className, color = "currentColor" }: IconProps) {
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
      <circle cx="12" cy="5" r="2.5" />
      <circle cx="5" cy="18" r="2.5" />
      <circle cx="19" cy="18" r="2.5" />
      <circle cx="12" cy="13" r="2.5" />
      <path d="M12 7.5v3" />
      <path d="M6.8 16.2l3.4-2.4" />
      <path d="M17.2 16.2l-3.4-2.4" />
    </svg>
  );
}
