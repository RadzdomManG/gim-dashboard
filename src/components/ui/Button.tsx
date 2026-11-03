"use client";

import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "dark";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  icon,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#518E6A]/40 disabled:opacity-50 disabled:pointer-events-none select-none";

  const sizeStyles = {
    sm: "px-2.5 py-1 text-xs gap-1.5 h-7",
    md: "px-3.5 py-1.5 text-xs gap-2 h-8",
    lg: "px-4 py-2 text-sm gap-2 h-9",
  };

  const variantStyles = {
    primary: "bg-[#518E6A] hover:bg-[#457B5B] text-white shadow-xs font-semibold",
    secondary: "bg-white hover:bg-[#FBF6F3] text-[#242E29] border border-[#E8E2DD] shadow-xs",
    dark: "bg-[#3D5249] hover:bg-[#31423B] text-white shadow-xs font-semibold",
    ghost: "bg-transparent hover:bg-black/5 text-[#45544C] hover:text-[#242E29]",
    danger: "bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200",
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
}
