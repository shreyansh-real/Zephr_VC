"use client";

import { useEffect, useState, useRef, type MutableRefObject } from "react";
import { UrgencyChip, CategoryChip, UrgencyBar, type UrgencyLevel, type CategoryType } from "./urgency";
import { Eye, ChevronRight, UserCircle } from "lucide-react";

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

function formatAge(cluster: Cluster): string {
  const now = Date.now() / 1000;
  const created = cluster.created_at?._seconds ?? now;
  const diff = now - created;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const STATUS_STYLES: Record<string, string> = {
  New: "bg-[var(--medium-tint)] text-[var(--medium)] border-[var(--medium)]",
  Assigned: "bg-[var(--high-tint)] text-[var(--high)] border-[var(--high)]",
  "In Progress": "bg-[var(--low-tint)] text-[var(--low)] border-[var(--low)]",
  Resolved: "bg-[var(--resolved-tint)] text-[var(--resolved)] border-[var(--resolved)]",
};

function StatusPill({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? "bg-[var(--surface-2)] text-[var(--ink)] border-[var(--border-token)]";
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-[13px] font-semibold leading-none h-6 whitespace-nowrap ${style}`}>
      {status}
    </span>
  );
}

const VOLUNTEERS = ["Meera Sharma", "Rakesh Verma", "Priya Nair", "Suresh Pillai"];

interface ClusterCardProps {
  cluster: Cluster;
  variant: "focus" | "row";
  onClick: () => void;
  onUpdate: () => void;
  hasCountedRef: MutableRefObject<boolean>;
}

export function ClusterCard({ cluster, onClick, onUpdate }: ClusterCardProps) {
  const isCritical = cluster.urgency === "Critical";
  const shownFlats = cluster.flats.slice(0, 3);
  const extraFlats = cluster.flats.length - 3;
  const [saving, setSaving] = useState(false);

  async function handleStatusChange(e: React.MouseEvent, status: string) {
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

  async function handleAssignee(e: React.ChangeEvent<HTMLSelectElement>) {
    e.stopPropagation();
    await fetch(`/api/clusters/${cluster.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assignee: e.target.value || null }),
    });
    onUpdate();
  }

  return (
    <article
      className={`group relative flex items-stretch rounded-xl border overflow-hidden cursor-pointer
        transition-all duration-150
        hover:shadow-md hover:border-[var(--border-strong)]
        focus-within:ring-2 focus-within:ring-[var(--border-strong)]
        ${isCritical ? "border-[var(--critical)] bg-[var(--critical-tint)]" : "border-[var(--border-token)] bg-[var(--surface)]"}
        ${saving ? "opacity-60 pointer-events-none" : ""}
      `}
      onClick={onClick}
    >
      {/* Urgency bar */}
      <UrgencyBar level={cluster.urgency as UrgencyLevel} />

      <div className="flex flex-1 min-w-0 flex-col md:grid md:grid-cols-[2fr_1fr_1fr_1fr_160px] md:items-center gap-2 md:gap-4 px-4 py-3.5">

        {/* Col 1: Title + meta */}
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <h3 className="font-semibold text-[15px] text-[var(--ink)] leading-snug truncate max-w-[400px]">
              {cluster.title}
            </h3>
            {cluster.needs_review && (
              <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-[var(--review)] shrink-0">
                <Eye size={12} /> Review
              </span>
            )}
            {cluster.escalated && (
              <span className="text-[12px] font-semibold text-[var(--high)] shrink-0">↑ Escalated</span>
            )}
          </div>
          <p className="text-[13px] text-[var(--muted-foreground)]" style={{ fontVariantNumeric: "tabular-nums" }}>
            <span className="font-semibold text-[var(--ink)]">{cluster.complaint_count}</span>
            {" "}report{cluster.complaint_count !== 1 ? "s" : ""} ·{" "}
            {shownFlats.join(", ")}
            {extraFlats > 0 && ` +${extraFlats}`}
            {" · "}
            {formatAge(cluster)}
          </p>
        </div>

        {/* Col 2: Category */}
        <div className="flex items-center">
          <CategoryChip category={cluster.category as CategoryType} />
        </div>

        {/* Col 3: Urgency */}
        <div className="flex items-center">
          <UrgencyChip level={cluster.urgency as UrgencyLevel} />
        </div>

        {/* Col 4: Status */}
        <div className="flex items-center">
          <StatusPill status={cluster.status} />
        </div>

        {/* Col 5: Assignee + quick actions */}
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <div className="relative flex items-center">
            <UserCircle size={14} className="absolute left-2 text-[var(--muted-foreground)] pointer-events-none" />
            <select
              value={cluster.assignee ?? ""}
              onChange={handleAssignee}
              className="h-8 pl-7 pr-2 rounded-lg border border-[var(--border-token)] bg-[var(--surface)] text-[13px] text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--border-strong)] cursor-pointer max-w-[120px] truncate"
              aria-label="Assign to"
            >
              <option value="">Unassigned</option>
              {VOLUNTEERS.map((v) => <option key={v} value={v}>{v.split(" ")[0]}</option>)}
            </select>
          </div>

          {cluster.status !== "Resolved" ? (
            <button
              onClick={(e) => handleStatusChange(e, "Resolved")}
              className="h-8 px-3 rounded-lg text-[13px] font-semibold border border-[var(--resolved)] text-[var(--resolved)] hover:bg-[var(--resolved-tint)] transition-colors focus:outline-none shrink-0"
            >
              Resolve
            </button>
          ) : (
            <button
              onClick={(e) => handleStatusChange(e, "In Progress")}
              className="h-8 px-3 rounded-lg text-[13px] font-semibold border border-[var(--border-token)] text-[var(--muted-foreground)] hover:border-[var(--ink)] hover:text-[var(--ink)] transition-colors focus:outline-none shrink-0"
            >
              Reopen
            </button>
          )}
        </div>

      </div>

      {/* Open detail chevron */}
      <div className="flex items-center pr-3 text-[var(--muted-foreground)] group-hover:text-[var(--ink)] transition-colors">
        <ChevronRight size={16} />
      </div>
    </article>
  );
}
