"use client";

import { useState, type MutableRefObject } from "react";
import { UrgencyChip, CategoryChip, UrgencyBar, type UrgencyLevel, type CategoryType } from "./urgency";
import {
  Eye,
  ChevronRight,
  CheckCheck,
  RotateCcw,
  User,
  Clock,
  Layers,
  Building2,
  AlertTriangle,
  Flame,
} from "lucide-react";

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
  escalation_reason?: string | null;
  created_at: { _seconds: number } | null;
  urgency_rank: number;
}

function formatAge(ts: { _seconds: number } | null): string {
  const now = Date.now() / 1000;
  const diff = now - (ts?._seconds ?? now);
  if (diff < 60) return "just now";
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

const STATUS_BG: Record<string, string> = {
  New: "bg-[var(--medium-tint)] border-[var(--medium)]/40 text-[var(--ink)]",
  Assigned: "bg-[var(--high-tint)] border-[var(--high)]/40 text-[var(--ink)]",
  "In Progress": "bg-[var(--low-tint)] border-[var(--low)]/40 text-[var(--ink)]",
  Resolved: "bg-[var(--resolved-tint)] border-[var(--resolved)]/40 text-[var(--resolved)]",
};

interface ClusterCardProps {
  cluster: Cluster;
  variant?: "bento" | "row" | "focus";
  onClick: () => void;
  onUpdate: () => void;
  hasCountedRef?: MutableRefObject<boolean>;
}

export function ClusterCard({ cluster, variant = "bento", onClick, onUpdate }: ClusterCardProps) {
  const isCritical = cluster.urgency === "Critical";
  const isResolved = cluster.status === "Resolved";
  const shownFlats = cluster.flats.slice(0, 4);
  const extraFlats = cluster.flats.length - 4;
  const [saving, setSaving] = useState(false);

  async function quickStatus(e: React.MouseEvent, status: string) {
    e.stopPropagation();
    setSaving(true);
    try {
      await fetch(`/api/clusters/${cluster.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      onUpdate();
    } finally {
      setSaving(false);
    }
  }

  // ── BENTO CARD VARIANT ──
  if (variant === "bento") {
    return (
      <article
        onClick={onClick}
        className={`
          group relative flex flex-col justify-between rounded-2xl border p-4 sm:p-5 cursor-pointer select-none
          transition-all duration-200
          hover:shadow-lg hover:-translate-y-0.5 hover:border-[var(--border-strong)]
          focus-within:ring-2 focus-within:ring-[var(--border-strong)]
          ${isCritical
            ? "border-[var(--critical)] bg-[var(--critical-tint)]/40 hover:bg-[var(--critical-tint)]/60"
            : "border-[var(--border-token)] bg-[var(--surface)] hover:bg-[var(--surface)]"
          }
          ${saving ? "opacity-50 pointer-events-none" : ""}
        `}
      >
        {/* Top Accent line for high/critical */}
        {isCritical && (
          <div className="absolute top-0 left-6 right-6 h-1 bg-[var(--critical)] rounded-full" />
        )}

        {/* Top Header: Category, Urgency & Status Badge */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-1.5 flex-wrap">
              <CategoryChip category={cluster.category as CategoryType} />
              <UrgencyChip level={cluster.urgency as UrgencyLevel} />
            </div>

            <div className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[11px] font-bold ${STATUS_BG[cluster.status] ?? "bg-[var(--surface-2)]"}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[cluster.status] ?? "bg-[var(--ink)]"}`} />
              <span>{cluster.status}</span>
            </div>
          </div>

          {/* Title */}
          <div className="mb-3">
            <h3 className={`font-display font-bold text-[16px] sm:text-[17px] leading-snug tracking-tight group-hover:text-[var(--ink)] transition-colors ${
              isResolved ? "text-[var(--muted-foreground)] line-through decoration-[var(--border-token)]" : "text-[var(--ink)]"
            }`}>
              {cluster.title}
            </h3>

            {/* Subtitle / Escalation badge */}
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              {cluster.escalated && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-[var(--high-tint)] border border-[var(--high)]/50 text-[var(--high)]">
                  <Flame size={12} /> Auto-Escalated
                </span>
              )}
              {cluster.needs_review && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-[var(--surface-2)] border border-[var(--border-token)] text-[var(--review)]">
                  <Eye size={12} /> Needs Review
                </span>
              )}
            </div>
          </div>

          {/* Affected Flats & Cluster Info Pill Box */}
          <div className="p-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border-token)] mb-4 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                <Building2 size={13} className="text-[var(--ink)]" />
                <span>Affected Flats</span>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-[var(--surface)] text-[var(--ink)] border border-[var(--border-token)]">
                <Layers size={11} className="text-[var(--high)]" />
                {cluster.complaint_count} {cluster.complaint_count === 1 ? "report" : "reports"}
              </span>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {shownFlats.map((flat) => (
                <span
                  key={flat}
                  className="px-2 py-0.5 rounded-md bg-[var(--surface)] border border-[var(--border-token)] text-[12px] font-bold text-[var(--ink)]"
                >
                  {flat}
                </span>
              ))}
              {extraFlats > 0 && (
                <span className="text-[11px] font-bold text-[var(--muted-foreground)] px-1.5">
                  +{extraFlats} more
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bento Footer: Assignee, Age & Action */}
        <div className="pt-3 border-t border-[var(--border-token)] flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {cluster.assignee ? (
              <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-[var(--ink)] px-2 py-0.5 rounded-md bg-[var(--surface-2)] border border-[var(--border-token)] truncate">
                <User size={12} className="text-[var(--muted-foreground)] shrink-0" />
                <span className="truncate">{cluster.assignee}</span>
              </span>
            ) : (
              <span className="text-[11px] font-medium text-[var(--muted-foreground)] italic">
                Unassigned
              </span>
            )}
            <span className="text-[11px] text-[var(--muted-foreground)] flex items-center gap-1 shrink-0">
              <Clock size={11} /> {formatAge(cluster.created_at)}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
            {!isResolved ? (
              <button
                onClick={(e) => quickStatus(e, "Resolved")}
                className="inline-flex items-center gap-1 h-8 px-3 rounded-lg text-[12px] font-bold border border-[var(--resolved)] text-[var(--resolved)] hover:bg-[var(--resolved-tint)] transition-all cursor-pointer shadow-xs"
                title="Mark cluster as resolved"
              >
                <CheckCheck size={13} />
                Resolve
              </button>
            ) : (
              <button
                onClick={(e) => quickStatus(e, "In Progress")}
                className="inline-flex items-center gap-1 h-8 px-3 rounded-lg text-[12px] font-bold border border-[var(--border-token)] text-[var(--muted-foreground)] hover:border-[var(--ink)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)] transition-all cursor-pointer"
                title="Reopen issue"
              >
                <RotateCcw size={12} />
                Reopen
              </button>
            )}

            <div className="w-7 h-7 rounded-lg bg-[var(--surface-2)] border border-[var(--border-token)] flex items-center justify-center text-[var(--muted-foreground)] group-hover:text-[var(--ink)] group-hover:border-[var(--border-strong)] transition-all">
              <ChevronRight size={14} />
            </div>
          </div>
        </div>
      </article>
    );
  }

  // ── ROW TABLE VARIANT ──
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

      {/* Main grid */}
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
            {cluster.assignee && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--ink)] px-2 py-0.5 rounded-md bg-[var(--surface-2)] border border-[var(--border-token)]">
                <User size={11} className="text-[var(--muted-foreground)]" />
                {cluster.assignee}
              </span>
            )}
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
                hover:bg-[var(--resolved-tint)] transition-colors focus:outline-none cursor-pointer"
            >
              <CheckCheck size={13} />
              Resolve
            </button>
          ) : (
            <button
              onClick={(e) => quickStatus(e, "In Progress")}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-[13px] font-semibold
                border border-[var(--border-token)] text-[var(--muted-foreground)]
                hover:border-[var(--ink)] hover:text-[var(--ink)] transition-colors focus:outline-none cursor-pointer"
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
