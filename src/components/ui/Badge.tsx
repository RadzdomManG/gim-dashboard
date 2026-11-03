"use client";

import React from "react";

export interface BadgeProps {
  variant?: "brand" | "active" | "review" | "upcoming" | "critical" | "neutral" | "dark";
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

export function Badge({
  variant = "neutral",
  children,
  className = "",
  dot = false,
}: BadgeProps) {
  const baseStyles =
    "inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium tracking-tight select-none border";

  const variantStyles = {
    brand: "bg-[#466B53]/10 text-[#3D5249] border-[#466B53]/25",
    dark: "bg-[#3D5249] text-white border-transparent",
    active: "bg-emerald-50 text-emerald-800 border-emerald-200",
    review: "bg-amber-50 text-amber-800 border-amber-200",
    upcoming: "bg-slate-50 text-slate-700 border-slate-200",
    critical: "bg-rose-50 text-rose-800 border-rose-200",
    neutral: "bg-[#F5EFEA] text-[#45544C] border-[#E8E2DD]",
  };

  const dotColors = {
    brand: "bg-[#466B53]",
    dark: "bg-white",
    active: "bg-emerald-500",
    review: "bg-amber-500",
    upcoming: "bg-slate-400",
    critical: "bg-rose-500",
    neutral: "bg-[#65746C]",
  };

  return (
    <span className={`${baseStyles} ${variantStyles[variant]} ${className}`}>
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]} shrink-0`}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}
