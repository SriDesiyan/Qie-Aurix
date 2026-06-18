import React from "react";
import { IconProps } from "./AurixShieldIcon";

export default function DEXIcon({ size = 24, className, color = "currentColor" }: IconProps) {
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
      <path d="M16 3h5v5" />
      <path d="M8 21H3v-5" />
      <path d="M21 3L14 10" />
      <path d="M3 21l7-7" />
      <path d="M14 14l7 7" />
      <path d="M10 10L3 3" />
    </svg>
  );
}
