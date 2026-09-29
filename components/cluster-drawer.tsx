"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X, Eye, Check, RefreshCw, Send, User, ChevronDown, Mail, AlertCircle, CheckCircle2 } from "lucide-react";
import { UrgencyChip, CategoryChip, type UrgencyLevel, type CategoryType } from "./urgency";

interface Complaint {
  id: string;
  flat_no: string;
  resident_name: string;
  email?: string | null;
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
  return new Date(ts._seconds * 1000).toLocaleString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    day: "numeric",
  });
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--muted-foreground)]">
        {title}
      </p>
      {children}
    </div>
  );
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
  const [emailSending, setEmailSending] = useState(false);
  const [sentMsg, setSentMsg] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reportsOpen, setReportsOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

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
      setError("Couldn't load issue detail.");
    } finally {
      setLoading(false);
    }
  }, [clusterId]);

  useEffect(() => {
    void fetchDetail();
    closeRef.current?.focus();
  }, [clusterId, fetchDetail]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
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
    setEmailError(null);
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

  async function handleSendEmail(specificComplaintId?: string) {
    if (!draft.trim()) return;
    setEmailSending(true);
    setEmailError(null);
    setSentMsg(null);
    try {
      const res = await fetch(`/api/clusters/${clusterId}/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          complaintId: specificComplaintId,
          message: draft,
          subject: `Update on ${cluster?.title || "Complaint"}`,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        const count = data.sent_count ?? 1;
        setSentMsg(
          specificComplaintId
            ? `Email sent successfully to resident`
            : `Email dispatched to ${count} resident${count !== 1 ? "s" : ""}${data.is_simulated ? " (dev simulated)" : ""}`
        );
        onUpdate();
        void fetchDetail();
      } else {
        setEmailError(data.error || "Failed to send email");
      }
    } catch {
      setEmailError("Network error sending email. Please try again.");
    } finally {
      setEmailSending(false);
    }
  }

  const avgConfidence =
    complaints.length > 0
      ? complaints.reduce((s, c) => s + c.confidence, 0) / complaints.length
      : null;

  const isCritical = cluster?.urgency === "Critical";
  const residentsWithEmail = complaints.filter((c) => Boolean(c.email));

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        className="fixed right-0 top-0 bottom-0 z-50 flex flex-col bg-[var(--surface)] border-l border-[var(--border-token)] shadow-2xl overflow-hidden"
        style={{ width: "min(540px, 100vw)" }}
      >

        {/* ── Sticky header ── */}
        <div className={`sticky top-0 z-10 border-b border-[var(--border-token)] px-6 py-4 flex items-start justify-between gap-4
          ${isCritical ? "bg-[var(--critical-tint)]" : "bg-[var(--surface)]"}`}
        >
          <div className="flex-1 min-w-0">
            {cluster ? (
              <>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <UrgencyChip level={cluster.urgency as UrgencyLevel} />
                  <CategoryChip category={cluster.category as CategoryType} />
                  {cluster.needs_review && (
                    <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-[var(--review)]">
                      <Eye size={12} /> Review
                    </span>
                  )}
                </div>
                <h2
                  id="drawer-title"
                  className="font-display font-bold text-[20px] leading-snug tracking-tight text-[var(--ink)]"
                >
                  {cluster.title}
                </h2>
                <p className="text-[13px] text-[var(--muted-foreground)] mt-1" style={{ fontVariantNumeric: "tabular-nums" }}>
                  {cluster.complaint_count} report{cluster.complaint_count !== 1 ? "s" : ""} ·{" "}
                  {cluster.flats.slice(0, 4).join(", ")}
                  {cluster.flats.length > 4 && ` +${cluster.flats.length - 4} more`}
                </p>
              </>
            ) : (
              <div className="h-8 w-48 rounded bg-[var(--surface-2)] animate-pulse" />
            )}
          </div>
          <button
            ref={closeRef}
            onClick={onClose}
            className="mt-0.5 w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[var(--surface-2)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--border-strong)] shrink-0 text-[var(--muted-foreground)] hover:text-[var(--ink)]"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-7">

          {loading && (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 rounded-lg bg-[var(--surface-2)] animate-pulse" />
              ))}
            </div>
          )}

          {error && (
            <p className="text-[15px] text-[var(--ink)] p-4 rounded-lg bg-[var(--critical-tint)] border border-[var(--critical)]">
              {error}
            </p>
          )}

          {!loading && cluster && (
            <>
              {/* ── Status ── */}
              <Section title="Status">
                <div className="flex gap-1.5 flex-wrap">
                  {STATUSES.map((s) => {
                    const active = cluster.status === s;
                    const isResolved = s === "Resolved";
                    return (
                      <button
                        key={s}
                        onClick={() => handleStatusChange(s)}
                        disabled={active}
                        className={`h-8 px-3 rounded-lg text-[13px] font-semibold border transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--border-strong)] disabled:cursor-default
                          ${active
                            ? isResolved
                              ? "bg-[var(--resolved)] border-[var(--resolved)] text-white"
                              : "bg-[var(--ink)] border-[var(--ink)] text-[var(--ink-inverse)]"
                            : "bg-transparent border-[var(--border-token)] text-[var(--muted-foreground)] hover:border-[var(--ink)] hover:text-[var(--ink)]"
                          }`}
                      >
                        {active && <Check size={12} className="inline mr-1.5" />}
                        {s}
                      </button>
                    );
                  })}
                </div>
              </Section>

              {/* ── Assigned to ── */}
              <Section title="Assigned to">
                <div className="relative w-fit">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] pointer-events-none" />
                  <select
                    value={cluster.assignee ?? ""}
                    onChange={(e) => handleAssignee(e.target.value)}
                    className="h-9 pl-8 pr-8 rounded-lg border border-[var(--border-token)] bg-[var(--bg)] text-[14px] text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--border-strong)] cursor-pointer appearance-none min-w-[180px]"
                    aria-label="Assign to volunteer"
                  >
                    <option value="">Unassigned</option>
                    {VOLUNTEERS.map((v) => <option key={v} value={v}>{v}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] pointer-events-none" />
                </div>
              </Section>

              {/* ── AI reasoning ── */}
              {complaints[0] && (
                <Section title="Why this urgency">
                  <div className="p-4 rounded-xl border border-[var(--border-token)] bg-[var(--bg)] flex flex-col gap-3">
                    <p className="text-[14px] text-[var(--ink)] leading-relaxed">
                      {complaints[0].reason}
                    </p>

                    {avgConfidence !== null && (
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[12px] font-semibold text-[var(--muted-foreground)]">AI confidence</span>
                          <span className="text-[13px] font-bold text-[var(--ink)]" style={{ fontVariantNumeric: "tabular-nums" }}>
                            {Math.round(avgConfidence * 100)}%
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-[var(--surface-2)] overflow-hidden">
                          <div
                            className="h-full bg-[var(--ink)] rounded-full transition-all duration-700"
                            style={{ width: `${Math.round(avgConfidence * 100)}%` }}
                            role="progressbar"
                            aria-valuenow={Math.round(avgConfidence * 100)}
                            aria-valuemin={0}
                            aria-valuemax={100}
                          />
                        </div>
                      </div>
                    )}

                    {cluster.escalated && cluster.escalation_reason && (
                      <p className="text-[13px] font-semibold text-[var(--high)]">
                        ↑ {cluster.escalation_reason}
                      </p>
                    )}

                    {complaints[0].ai_provider && complaints[0].ai_provider !== "fallback" && (
                      <p className="text-[12px] text-[var(--muted-foreground)]">
                        Model: {complaints[0].ai_provider}
                      </p>
                    )}
                  </div>
                </Section>
              )}

              {/* ── Reports collapsible ── */}
              <Section title={`Reports (${complaints.length})`}>
                <button
                  onClick={() => setReportsOpen((v) => !v)}
                  className="flex items-center justify-between w-full px-4 py-3 rounded-xl border border-[var(--border-token)] bg-[var(--bg)] text-[14px] font-semibold text-[var(--ink)] hover:bg-[var(--surface-2)] transition-colors focus:outline-none"
                >
                  <span>{reportsOpen ? "Hide" : "Show"} individual reports</span>
                  <ChevronDown
                    size={16}
                    className={`text-[var(--muted-foreground)] transition-transform duration-200 ${reportsOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {reportsOpen && (
                  <div className="flex flex-col gap-2.5">
                    {complaints.map((c) => (
                      <div
                        key={c.id}
                        className="p-4 rounded-xl border border-[var(--border-token)] bg-[var(--bg)] flex flex-col gap-2"
                      >
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="text-[14px] font-semibold text-[var(--ink)]">
                            {c.flat_no} — {c.resident_name}
                          </span>
                          <span className="text-[12px] text-[var(--muted-foreground)]" style={{ fontVariantNumeric: "tabular-nums" }}>
                            {formatTs(c.created_at)}
                          </span>
                        </div>

                        {c.email && (
                          <div className="flex items-center gap-1.5 text-[12px] text-[var(--muted-foreground)]">
                            <Mail size={12} />
                            <span>{c.email}</span>
                          </div>
                        )}

                        <p className="text-[14px] text-[var(--ink)] leading-relaxed">{c.raw_text}</p>
                        {c.summary && (
                          <p className="text-[13px] text-[var(--muted-foreground)] italic">{c.summary}</p>
                        )}
                        {c.reply_sent_at && (
                          <p className="text-[13px] font-semibold flex items-center gap-1" style={{ color: "var(--resolved)" }}>
                            <Check size={13} /> Email update sent {formatTs(c.reply_sent_at)}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Section>

              {/* ── Volunteer Email Dispatch Panel ── */}
              <Section title="Send update to residents">
                <div className="flex flex-col gap-3.5 p-4 rounded-xl border border-[var(--border-token)] bg-[var(--bg)]">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <p className="text-[13px] text-[var(--muted-foreground)]">
                      {residentsWithEmail.length > 0 ? (
                        <span>
                          <strong className="text-[var(--ink)] font-semibold">{residentsWithEmail.length}</strong> resident{residentsWithEmail.length !== 1 ? "s" : ""} registered with email
                        </span>
                      ) : (
                        <span>No emails registered for this cluster yet</span>
                      )}
                    </p>
                    {draftLanguage && (
                      <span className="px-2 py-0.5 rounded bg-[var(--surface-2)] text-[12px] text-[var(--muted-foreground)] border border-[var(--border-token)]">
                        {draftLanguage}
                      </span>
                    )}
                  </div>

                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    rows={4}
                    placeholder="Click 'Generate draft' with AI or type custom update message to residents…"
                    className="w-full min-h-[110px] px-4 py-3 rounded-lg bg-[var(--surface)] border border-[var(--border-token)] text-[14px] text-[var(--ink)] focus:outline-none focus:border-[var(--border-strong)] focus:ring-2 focus:ring-[var(--border-strong)] resize-y placeholder:text-[var(--muted-foreground)]"
                    style={{ lineHeight: 1.6 }}
                  />

                  {sentMsg && (
                    <div className="p-3 rounded-lg bg-[var(--resolved-tint)] border border-[var(--resolved)] flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-[var(--resolved)] shrink-0" />
                      <p className="text-[13px] font-semibold text-[var(--resolved)]">
                        {sentMsg}
                      </p>
                    </div>
                  )}

                  {emailError && (
                    <div className="p-3 rounded-lg bg-[var(--critical-tint)] border border-[var(--critical)] flex items-center gap-2">
                      <AlertCircle size={16} className="text-[var(--critical)] shrink-0" />
                      <p className="text-[13px] font-semibold text-[var(--critical)]">
                        {emailError}
                      </p>
                    </div>
                  )}

                  {/* Actions Row */}
                  <div className="flex gap-2.5 flex-wrap items-center pt-1">
                    <button
                      onClick={handleDraftReply}
                      disabled={draftLoading}
                      className="inline-flex items-center gap-2 h-9 px-3.5 rounded-lg font-semibold text-[13px] border border-[var(--border-token)] text-[var(--ink)] bg-transparent hover:bg-[var(--surface-2)] transition-colors focus:outline-none disabled:opacity-50"
                    >
                      <RefreshCw size={13} className={draftLoading ? "animate-spin" : ""} />
                      {draftLoading ? "Generating…" : "Generate AI Draft"}
                    </button>

                    <button
                      onClick={() => handleSendEmail()}
                      disabled={!draft.trim() || emailSending || residentsWithEmail.length === 0}
                      className="inline-flex items-center gap-2 h-9 px-4 rounded-lg font-semibold text-[13px] bg-[var(--ink)] text-[var(--ink-inverse)] hover:opacity-90 active:scale-[0.98] transition-all focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Mail size={14} />
                      {emailSending
                        ? "Sending Email…"
                        : `Send Email to ${residentsWithEmail.length || complaints.length}`}
                    </button>
                  </div>
                </div>
              </Section>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
