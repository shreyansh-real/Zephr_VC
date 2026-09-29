"use client";

import { useEffect, useState, useRef, type MutableRefObject } from "react";
import { UrgencyChip, CategoryChip, UrgencyBar, type UrgencyLevel, type CategoryType } from "./urgency";
import { Eye } from "lucide-react";

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

function CountNumeral({ count, variant, hasCountedRef }: { count: number; variant: "focus" | "row"; hasCountedRef: MutableRefObject<boolean> }) {
  const [displayed, setDisplayed] = useState(count);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    if (hasCountedRef.current) {
      setDisplayed(count);
      return;
    }

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      hasCountedRef.current = true;
      setDisplayed(count);
      return;
    }

    setDisplayed(0);
    const duration = 600;
    const startTime = performance.now();
    let rafId: number;

    const step = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;
      const next = Math.floor(eased * count);
      setDisplayed(next);
      if (progress < 1) {
        rafId = requestAnimationFrame(step);
      } else {
        hasCountedRef.current = true;
        setDisplayed(count);
      }
    };
    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <span
      className={variant === "focus" ? "count-numeral-focus" : "count-numeral"}
      style={{ fontVariantNumeric: "tabular-nums" }}
      aria-label={`${count} reports`}
    >
      {displayed}
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

export function ClusterCard({ cluster, variant, onClick, onUpdate, hasCountedRef }: ClusterCardProps) {
  const isCritical = cluster.urgency === "Critical";
  const maxFlats = 3;
  const shownFlats = cluster.flats.slice(0, maxFlats);
  const extraFlats = cluster.flats.length - maxFlats;

  async function handleStatusChange(e: React.MouseEvent, status: string) {
    e.stopPropagation();
    await fetch(`/api/clusters/${cluster.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
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
      className={`relative flex rounded-[12px] border overflow-hidden cursor-pointer transition-all hover:border-[var(--border-strong)] focus-within:ring-2 focus-within:ring-[var(--border-strong)] ${
        isCritical
          ? "border-[var(--critical)] bg-[var(--critical-tint)]"
          : "border-[var(--border-token)] bg-[var(--surface)]"
      }`}
      onClick={onClick}
    >
      <UrgencyBar level={cluster.urgency as UrgencyLevel} />

      <div className="flex gap-4 p-4 flex-1 min-w-0">
        {/* Count */}
        <div className="flex flex-col items-center justify-start min-w-[72px] flex-shrink-0">
          <CountNumeral count={cluster.complaint_count} variant={variant} hasCountedRef={hasCountedRef} />
          <span className="text-[15px] font-bold text-[var(--muted)] mt-0.5">
            {cluster.complaint_count === 1 ? "report" : "reports"}
          </span>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-2 min-w-0 flex-1">
          <h3 className="font-display font-bold text-[22px] leading-[1.25] tracking-[-0.01em] text-[var(--ink)] truncate">
            {cluster.title}
          </h3>

          <div className="flex flex-wrap gap-2 items-center">
            <UrgencyChip level={cluster.urgency as UrgencyLevel} />
            <CategoryChip category={cluster.category as CategoryType} />
            {cluster.needs_review && (
              <span className="inline-flex items-center gap-1 text-[14px] font-bold" style={{ color: "var(--review)" }}>
                <Eye size={14} /> Check this: AI is unsure
              </span>
            )}
            {cluster.escalated && (
              <span className="text-[14px] font-bold text-[var(--high)]">Escalated</span>
            )}
          </div>

          <div className="text-[15px] text-[var(--muted)]" style={{ fontVariantNumeric: "tabular-nums" }}>
            {shownFlats.join(", ")}
            {extraFlats > 0 && ` +${extraFlats}`}
            {" · "}
            {formatAge(cluster)}
            {cluster.assignee && ` · ${cluster.assignee}`}
          </div>

          {/* Controls */}
          <div className="flex flex-wrap gap-2 items-center mt-1" onClick={(e) => e.stopPropagation()}>
            <span className="text-[15px] font-bold text-[var(--muted)]">{cluster.status}</span>
            {cluster.status !== "Resolved" && (
              <>
                {(cluster.status === "New" || cluster.status === "Assigned") && (
                  <button
                    onClick={(e) => handleStatusChange(e, "In Progress")}
                    className="h-8 px-3 rounded-lg text-[14px] font-bold border-[1.5px] border-[var(--ink)] text-[var(--ink)] bg-transparent hover:bg-[var(--surface-2)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--border-strong)]"
                  >
                    Start
                  </button>
                )}
                <button
                  onClick={(e) => handleStatusChange(e, "Resolved")}
                  className="h-8 px-3 rounded-lg text-[14px] font-bold border-[1.5px] border-[var(--resolved)] text-[var(--resolved)] bg-transparent hover:bg-[var(--resolved-tint)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--border-strong)]"
                >
                  Resolve
                </button>
              </>
            )}
            {cluster.status === "Resolved" && (
              <button
                onClick={(e) => handleStatusChange(e, "In Progress")}
                className="h-8 px-3 rounded-lg text-[14px] font-bold border-[1.5px] border-[var(--ink)] text-[var(--ink)] bg-transparent hover:bg-[var(--surface-2)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--border-strong)]"
              >
                Reopen
              </button>
            )}
            <select
              value={cluster.assignee ?? ""}
              onChange={handleAssignee}
              className="h-8 px-2 rounded-lg border-[1.5px] border-[var(--border-token)] bg-[var(--surface)] text-[14px] font-bold text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--border-strong)] cursor-pointer"
              aria-label="Assign to volunteer"
              onClick={(e) => e.stopPropagation()}
            >
              <option value="">Unassigned</option>
              {VOLUNTEERS.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
        </div>
      </div>
    </article>
  );
}
