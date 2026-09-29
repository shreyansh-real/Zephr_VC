"use client";

import { useState, type MutableRefObject } from "react";
import { UrgencyChip, CategoryChip, UrgencyBar, type UrgencyLevel, type CategoryType } from "./urgency";
import { Eye, ChevronRight, CheckCheck, RotateCcw } from "lucide-react";

interface Cluster {
  id: string;
  title: string;
  category: string;
  urgency: string;
  status: string;
  assignee: string | null;
  complaint_count: number;
  flats: string[];
  needs_review: boolean;
  escalated: boolean;
  created_at: { _seconds: number } | null;
  urgency_rank: number;
}

function formatAge(ts: { _seconds: number } | null): string {
  const now = Date.now() / 1000;
  const diff = now - (ts?._seconds ?? now);
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const STATUS_DOT: Record<string, string> = {
  New: "bg-[var(--medium)]",
  Assigned: "bg-[var(--high)]",
  "In Progress": "bg-[var(--low)]",
  Resolved: "bg-[var(--resolved)]",
};

const STATUS_LABEL: Record<string, string> = {
  New: "text-[var(--medium)]",
  Assigned: "text-[var(--high)]",
  "In Progress": "text-[var(--low)]",
  Resolved: "text-[var(--resolved)]",
};

interface ClusterCardProps {
  cluster: Cluster;
  variant: "focus" | "row";
  onClick: () => void;
  onUpdate: () => void;
  hasCountedRef: MutableRefObject<boolean>;
}

export function ClusterCard({ cluster, onClick, onUpdate }: ClusterCardProps) {
  const isCritical = cluster.urgency === "Critical";
  const isResolved = cluster.status === "Resolved";
  const shownFlats = cluster.flats.slice(0, 4);
  const extraFlats = cluster.flats.length - 4;
  const [saving, setSaving] = useState(false);

  async function quickStatus(e: React.MouseEvent, status: string) {
    e.stopPropagation();
    setSaving(true);
    await fetch(`/api/clusters/${cluster.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setSaving(false);
    onUpdate();
  }

  return (
    <article
      onClick={onClick}
      className={`
        group relative flex items-center rounded-xl border overflow-hidden cursor-pointer select-none
        transition-all duration-150
        hover:shadow-[0_2px_12px_rgba(0,0,0,0.08)] hover:border-[var(--border-strong)]
        focus-within:ring-2 focus-within:ring-[var(--border-strong)]
        ${isCritical
          ? "border-[var(--critical)] bg-[var(--critical-tint)]"
          : "border-[var(--border-token)] bg-[var(--surface)] hover:bg-[var(--surface)]"
        }
        ${saving ? "opacity-50 pointer-events-none" : ""}
      `}
    >
      {/* Left urgency accent bar */}
      <UrgencyBar level={cluster.urgency as UrgencyLevel} />

      {/* ── Main grid: mirrors dashboard column header ── */}
      <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-6 items-center flex-1 min-w-0 px-4 py-3.5">

        {/* Zone 1 – Issue title + meta */}
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1 min-w-0">
            <h3 className={`font-semibold text-[15px] leading-tight truncate ${isResolved ? "text-[var(--muted-foreground)]" : "text-[var(--ink)]"}`}>
              {cluster.title}
            </h3>
            {cluster.needs_review && (
              <span className="shrink-0 inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--review)]">
                <Eye size={11} /> Review
              </span>
            )}
            {cluster.escalated && (
              <span className="shrink-0 text-[11px] font-semibold text-[var(--high)]">↑ Escalated</span>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <CategoryChip category={cluster.category as CategoryType} />
            <span className="text-[12px] text-[var(--muted-foreground)]" style={{ fontVariantNumeric: "tabular-nums" }}>
              <span className="font-semibold text-[var(--ink)]">{cluster.complaint_count}</span>
              {" "}report{cluster.complaint_count !== 1 ? "s" : ""}
              {" · "}
              {shownFlats.join(", ")}{extraFlats > 0 ? ` +${extraFlats}` : ""}
              {" · "}
              {formatAge(cluster.created_at)}
            </span>
          </div>
        </div>

        {/* Zone 2 – Urgency chip */}
        <div className="w-24 flex justify-center">
          <UrgencyChip level={cluster.urgency as UrgencyLevel} />
        </div>

        {/* Zone 3 – Status dot + label */}
        <div className="w-24 flex items-center justify-center gap-1.5">
          <span className={`w-2 h-2 rounded-full shrink-0 ${STATUS_DOT[cluster.status] ?? "bg-[var(--border-token)]"}`} />
          <span className={`text-[13px] font-semibold whitespace-nowrap ${STATUS_LABEL[cluster.status] ?? "text-[var(--muted-foreground)]"}`}>
            {cluster.status}
          </span>
        </div>

        {/* Zone 4 – Quick action button */}
        <div className="w-28 flex justify-end" onClick={(e) => e.stopPropagation()}>
          {!isResolved ? (
            <button
              onClick={(e) => quickStatus(e, "Resolved")}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-[13px] font-semibold
                border border-[var(--resolved)] text-[var(--resolved)]
                hover:bg-[var(--resolved-tint)] transition-colors focus:outline-none"
            >
              <CheckCheck size={13} />
              Resolve
            </button>
          ) : (
            <button
              onClick={(e) => quickStatus(e, "In Progress")}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-[13px] font-semibold
                border border-[var(--border-token)] text-[var(--muted-foreground)]
                hover:border-[var(--ink)] hover:text-[var(--ink)] transition-colors focus:outline-none"
            >
              <RotateCcw size={12} />
              Reopen
            </button>
          )}
        </div>
      </div>

      {/* Chevron — rightmost */}
      <ChevronRight
        size={15}
        className="mr-3 shrink-0 text-[var(--border-token)] group-hover:text-[var(--muted-foreground)] transition-colors"
      />
    </article>
  );
}
