// @ts-nocheck
"use client";

import React from "react";
import "./MagicBento.css";

type CommonProps = {
  children: React.ReactNode;
  className?: string;
};

export type MagicBentoProps = CommonProps & {
  textAutoHide?: boolean;
  enableStars?: boolean;
  enableSpotlight?: boolean;
  enableBorderGlow?: boolean;
  enableTilt?: boolean;
  enableMagnetism?: boolean;
  clickEffect?: boolean;
  spotlightRadius?: number;
  particleCount?: number;
  glowColor?: string;
  disableAnimations?: boolean;
  singleColumn?: boolean;
};

export type ParticleCardProps = CommonProps & {
  particleCount?: number;
  glowColor?: string;
  enableTilt?: boolean;
  enableMagnetism?: boolean;
  clickEffect?: boolean;
  disableAnimations?: boolean;
};

export function ParticleCard({ children, className = "" }: ParticleCardProps) {
  return <div className={className}>{children}</div>;
}

export default function MagicBento({
  children,
  className = "",
  singleColumn = false,
}: MagicBentoProps) {
  return (
    <div
      className={`magic-bento-grid ${singleColumn ? "magic-bento-grid--single" : ""} ${className}`.trim()}
    >
      {children}
    </div>
  );
}
