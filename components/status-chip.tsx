"use client";

import React from "react";
import { type ComplaintStatus } from "@/lib/types";
import { useLanguageStore } from "@/lib/language-store";
import { Clock, Eye, Wrench, CheckCircle, Archive } from "lucide-react";

interface StatusChipProps {
  status: ComplaintStatus;
  className?: string;
}

export function StatusChip({ status, className = "" }: StatusChipProps) {
  const { t } = useLanguageStore();

  const config = {
    open: {
      label: t.statuses.open,
      icon: Clock,
      style: "bg-[var(--surface-2)] text-[var(--ink)] border-[var(--border-token)]",
    },
    acknowledged: {
      label: t.statuses.acknowledged,
      icon: Eye,
      style: "bg-[var(--surface-2)] text-[var(--ink)] border-[var(--border-strong)]",
    },
    in_progress: {
      label: t.statuses.in_progress,
      icon: Wrench,
      style: "bg-[var(--medium-tint)] text-[var(--ink)] border-[var(--medium)]",
    },
    resolved: {
      label: t.statuses.resolved,
      icon: CheckCircle,
      style: "bg-[var(--resolved-tint)] text-[var(--ink)] border-[var(--resolved)] font-bold",
    },
    closed: {
      label: t.statuses.closed,
      icon: Archive,
      style: "bg-[var(--surface-2)] text-[var(--muted)] border-[var(--border-token)]",
    },
  }[status];

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[13px] font-medium rounded-md border ${config.style} ${className}`}
    >
      <Icon className="w-3.5 h-3.5" aria-hidden="true" />
      <span>{config.label}</span>
    </span>
  );
}
