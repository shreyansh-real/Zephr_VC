"use client";

import React from "react";
import { type ComplaintPriority } from "@/lib/types";
import { AlertCircle, AlertTriangle, Info, CheckCircle2 } from "lucide-react";
import { useLanguageStore } from "@/lib/language-store";

interface UrgencyChipProps {
  level: ComplaintPriority;
  className?: string;
  showIcon?: boolean;
}

export function UrgencyChip({ level, className = "", showIcon = true }: UrgencyChipProps) {
  const { t } = useLanguageStore();

  const config = {
    critical: {
      label: t.priorities.critical,
      icon: AlertCircle,
      // Solid filled chip per Design.md section 2.4
      style: "bg-[var(--critical)] text-[var(--ink-inverse)] border-transparent font-bold",
      indicator: "bg-[var(--critical)]",
    },
    high: {
      label: t.priorities.high,
      icon: AlertTriangle,
      style: "bg-[var(--high-tint)] text-[var(--ink)] border-[var(--border-token)]",
      indicator: "bg-[var(--high)]",
    },
    medium: {
      label: t.priorities.medium,
      icon: Info,
      style: "bg-[var(--medium-tint)] text-[var(--ink)] border-[var(--border-token)]",
      indicator: "bg-[var(--medium)]",
    },
    low: {
      label: t.priorities.low,
      icon: CheckCircle2,
      style: "bg-[var(--low-tint)] text-[var(--ink)] border-[var(--border-token)]",
      indicator: "bg-[var(--low)]",
    },
  }[level];

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[13px] font-bold tracking-tight rounded-md border ${config.style} ${className}`}
    >
      <span className={`w-2 h-2 rounded-full ${config.indicator}`} aria-hidden="true" />
      {showIcon && <Icon className="w-3.5 h-3.5" aria-hidden="true" />}
      <span>{config.label}</span>
    </span>
  );
}

export function UrgencyBar({ level }: { level: ComplaintPriority }) {
  const barColor = {
    critical: "bg-[var(--critical)]",
    high: "bg-[var(--high)]",
    medium: "bg-[var(--medium)]",
    low: "bg-[var(--low)]",
  }[level];

  return <div className={`w-1.5 self-stretch rounded-l-sm ${barColor}`} aria-hidden="true" />;
}
