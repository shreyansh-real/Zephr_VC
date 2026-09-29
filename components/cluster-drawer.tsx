"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X, Eye, Check, RefreshCw } from "lucide-react";
import { UrgencyChip, CategoryChip, type UrgencyLevel, type CategoryType } from "./urgency";

interface Complaint {
  id: string;
  flat_no: string;
  resident_name: string;
  raw_text: string;
  summary: string;
  language: string;
  category: string;
  urgency: string;
  confidence: number;
  reason: string;
  needs_review: boolean;
  ai_provider: string | null;
  draft_reply: string | null;
  reply_sent_at: { _seconds: number } | null;
  created_at: { _seconds: number } | null;
}

interface ClusterData {
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
  escalation_reason: string | null;
  urgency_rank: number;
  created_at: { _seconds: number } | null;
}

const VOLUNTEERS = ["Meera Sharma", "Rakesh Verma", "Priya Nair", "Suresh Pillai"];
const STATUSES = ["New", "Assigned", "In Progress", "Resolved"] as const;

function formatTs(ts: { _seconds: number } | null): string {
  if (!ts) return "";
  return new Date(ts._seconds * 1000).toLocaleString("en-IN", { hour: "2-digit", minute: "2-digit", month: "short", day: "numeric" });
}

interface Props {
  clusterId: string;
  onClose: () => void;
  onUpdate: () => void;
}

export function ClusterDrawer({ clusterId, onClose, onUpdate }: Props) {
  const [cluster, setCluster] = useState<ClusterData | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [draftLanguage, setDraftLanguage] = useState("");
  const [draftLoading, setDraftLoading] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);
  const [sentMsg, setSentMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  const fetchDetail = useCallback(async () => {
    try {
      const res = await fetch(`/api/clusters/${clusterId}`);
      if (!res.ok) throw new Error("Failed");
      const data = (await res.json()) as { cluster: ClusterData; complaints: Complaint[] };
      setCluster(data.cluster);
      setComplaints(data.complaints);
      const existingDraft = data.complaints.find((c) => c.draft_reply)?.draft_reply ?? "";
      setDraft((prev) => prev || existingDraft);
    } catch {
      setError("Couldn't load cluster detail.");
    } finally {
      setLoading(false);
    }
  }, [clusterId]);

  useEffect(() => {
    void fetchDetail();
    closeRef.current?.focus();
  }, [clusterId, fetchDetail]);

  // Focus trap
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  async function handleStatusChange(status: string) {
    if (!cluster) return;
    const res = await fetch(`/api/clusters/${clusterId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const data = (await res.json()) as { cluster: ClusterData };
      setCluster(data.cluster);
      onUpdate();
    }
  }

  async function handleAssignee(value: string) {
    if (!cluster) return;
    const res = await fetch(`/api/clusters/${clusterId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assignee: value || null }),
    });
    if (res.ok) {
      const data = (await res.json()) as { cluster: ClusterData };
      setCluster(data.cluster);
      onUpdate();
    }
  }

  async function handleDraftReply() {
    setDraftLoading(true);
    try {
      const res = await fetch(`/api/clusters/${clusterId}/draft-reply`, { method: "POST" });
      if (res.ok) {
        const data = (await res.json()) as { draft: string; language: string; ai_provider: string };
        setDraft(data.draft);
        setDraftLanguage(data.language);
      }
    } finally {
      setDraftLoading(false);
    }
  }

  async function handleSendReply() {
    if (!draft.trim()) return;
    setSendLoading(true);
    try {
      const res = await fetch(`/api/clusters/${clusterId}/send-reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply_text: draft }),
      });
      if (res.ok) {
        const data = (await res.json()) as { sent_count: number; sent_at: string };
        setSentMsg(`Reply sent to ${data.sent_count} resident${data.sent_count !== 1 ? "s" : ""}`);
        onUpdate();
        void fetchDetail();
      }
    } finally {
      setSendLoading(false);
    }
  }

  const avgConfidence = complaints.length > 0
    ? complaints.reduce((s, c) => s + c.confidence, 0) / complaints.length
    : null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ backgroundColor: "rgba(26,26,24,0.4)" }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        className="fixed right-0 top-0 bottom-0 z-50 flex flex-col bg-[var(--surface)] border-l border-[var(--border-token)] overflow-y-auto"
        style={{ width: "min(480px, 100vw)" }}
      >
        {/* Sticky header */}
        <div className="sticky top-0 bg-[var(--surface)] border-b border-[var(--border-token)] px-6 py-4 flex items-center justify-between z-10">
          <div className="flex-1 min-w-0">
            {cluster && (
              <h2 id="drawer-title" className="font-display font-bold text-[22px] leading-[1.25] tracking-[-0.01em] text-[var(--ink)] truncate">
                {cluster.title}
              </h2>
            )}
          </div>
          <button
            ref={closeRef}
            onClick={onClose}
            className="ml-3 w-11 h-11 flex items-center justify-center rounded-lg hover:bg-[var(--surface-2)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--border-strong)] flex-shrink-0"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 px-6 py-6 flex flex-col gap-6">
          {loading && (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 rounded-lg bg-[var(--surface-2)] animate-pulse" />
              ))}
            </div>
          )}

          {error && <p className="text-[16px] text-[var(--ink)]">{error}</p>}

          {!loading && cluster && (
            <>
              {/* Chips */}
              <div className="flex flex-wrap gap-2">
                <UrgencyChip level={cluster.urgency as UrgencyLevel} />
                <CategoryChip category={cluster.category as CategoryType} />
                <span className="text-[15px] text-[var(--muted-foreground)] self-center">{cluster.complaint_count} reports</span>
                {cluster.needs_review && (
                  <span className="inline-flex items-center gap-1 text-[14px] font-bold self-center" style={{ color: "var(--review)" }}>
                    <Eye size={14} /> Check this: AI is unsure
                  </span>
                )}
              </div>

              {/* Status stepper */}
              <div>
                <p className="text-[15px] font-bold text-[var(--ink)] mb-2">Status</p>
                <div className="flex gap-1 flex-wrap">
                  {STATUSES.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(s)}
                      disabled={cluster.status === s}
                      className={`h-9 px-3 rounded-lg text-[14px] font-bold border-[1.5px] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--border-strong)] ${
                        cluster.status === s
                          ? s === "Resolved"
                            ? "bg-[var(--resolved)] border-[var(--resolved)] text-white"
                            : "bg-[var(--ink)] border-[var(--ink)] text-[var(--ink-inverse)]"
                          : "bg-transparent border-[var(--border-token)] text-[var(--muted-foreground)] hover:border-[var(--ink)] hover:text-[var(--ink)]"
                      } disabled:cursor-default`}
                    >
                      {cluster.status === s && <Check size={14} className="inline mr-1" />}
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Assignee */}
              <div>
                <p className="text-[15px] font-bold text-[var(--ink)] mb-2">Assigned to</p>
                <select
                  value={cluster.assignee ?? ""}
                  onChange={(e) => handleAssignee(e.target.value)}
                  className="h-10 px-3 rounded-lg border-[1.5px] border-[var(--border-token)] bg-[var(--bg)] text-[15px] text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--border-strong)] cursor-pointer"
                  aria-label="Assign to volunteer"
                >
                  <option value="">Unassigned</option>
                  {VOLUNTEERS.map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>

              {/* Why this urgency */}
              {complaints[0] && (
                <div>
                  <p className="text-[15px] font-bold text-[var(--ink)] mb-2">Why {cluster.urgency}</p>
                  <p className="text-[15px] text-[var(--muted-foreground)] mb-3">{complaints[0].reason}</p>
                  {avgConfidence !== null && (
                    <div>
                      <p className="text-[15px] text-[var(--muted-foreground)] mb-1">{Math.round(avgConfidence * 100)}% sure</p>
                      <div className="h-2 rounded-full bg-[var(--surface-2)] overflow-hidden">
                        <div
                          className="h-full bg-[var(--ink)] rounded-full"
                          style={{ width: `${Math.round(avgConfidence * 100)}%` }}
                          role="progressbar"
                          aria-valuenow={Math.round(avgConfidence * 100)}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label={`${Math.round(avgConfidence * 100)}% confidence`}
                        />
                      </div>
                    </div>
                  )}
                  {cluster.escalated && cluster.escalation_reason && (
                    <p className="text-[14px] font-bold mt-2" style={{ color: "var(--high)" }}>
                      ⬆ {cluster.escalation_reason}
                    </p>
                  )}
                  {complaints[0].ai_provider && complaints[0].ai_provider !== "fallback" && (
                    <p className="text-[13px] text-[var(--muted-foreground)] mt-2">
                      AI: {complaints[0].ai_provider}
                    </p>
                  )}
                </div>
              )}

              {/* Complaints list */}
              <div>
                <p className="text-[15px] font-bold text-[var(--ink)] mb-3">Reports ({complaints.length})</p>
                <div className="flex flex-col gap-3">
                  {complaints.map((c) => (
                    <div
                      key={c.id}
                      className="p-4 rounded-lg border border-[var(--border-token)] bg-[var(--bg)]"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[15px] font-bold text-[var(--ink)]">{c.flat_no} — {c.resident_name}</span>
                        <span className="text-[14px] text-[var(--muted-foreground)]" style={{ fontVariantNumeric: "tabular-nums" }}>
                          {formatTs(c.created_at)}
                        </span>
                      </div>
                      <p className="text-[16px] text-[var(--ink)] mb-2" style={{ lineHeight: 1.6 }}>{c.raw_text}</p>
                      <p className="text-[14px] text-[var(--muted-foreground)] italic">{c.summary}</p>
                      {c.reply_sent_at && (
                        <p className="text-[14px] font-bold mt-2" style={{ color: "var(--resolved)" }}>
                          <Check size={14} className="inline mr-1" />Reply sent {formatTs(c.reply_sent_at)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Reply panel */}
              <div className="border-t border-[var(--border-token)] pt-6">
                <p className="text-[15px] font-bold text-[var(--ink)] mb-3">
                  Reply to residents
                  {draftLanguage && (
                    <span className="ml-2 px-2 py-0.5 rounded-[4px] bg-[var(--surface-2)] text-[14px] text-[var(--muted-foreground)] border border-[var(--border-token)] font-normal">
                      {draftLanguage}
                    </span>
                  )}
                </p>
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={4}
                  placeholder="Click 'Generate draft' to create a reply..."
                  className="w-full min-h-[120px] px-4 py-3 rounded-lg bg-[var(--bg)] border-[1.5px] border-[var(--border-token)] text-[18px] text-[var(--ink)] focus:outline-none focus:border-[var(--border-strong)] focus:ring-2 focus:ring-[var(--border-strong)] focus:ring-offset-1 resize-y"
                  style={{ lineHeight: 1.6, maxWidth: "65ch" }}
                />
                {sentMsg && (
                  <p className="text-[15px] font-bold mt-2 flex items-center gap-1.5" style={{ color: "var(--resolved)" }}>
                    <Check size={16} /> {sentMsg}
                  </p>
                )}
                <div className="flex gap-3 mt-3 flex-wrap">
                  <button
                    onClick={handleDraftReply}
                    disabled={draftLoading}
                    className="h-10 px-5 rounded-lg font-bold text-[15px] border-[1.5px] border-[var(--ink)] text-[var(--ink)] bg-transparent hover:bg-[var(--surface-2)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--border-strong)] disabled:opacity-50 flex items-center gap-2"
                  >
                    <RefreshCw size={16} className={draftLoading ? "animate-spin" : ""} />
                    {draftLoading ? "Generating…" : "Generate draft"}
                  </button>
                  <button
                    onClick={handleSendReply}
                    disabled={!draft.trim() || sendLoading}
                    className="h-10 px-5 rounded-lg font-bold text-[15px] bg-[var(--ink)] text-[var(--ink-inverse)] hover:opacity-90 active:translate-y-px transition-all focus:outline-none focus:ring-2 focus:ring-[var(--border-strong)] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sendLoading ? "Sending…" : `Send to all ${complaints.length}`}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
