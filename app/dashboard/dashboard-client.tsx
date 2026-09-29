"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { NavDock } from "@/components/nav-dock";
import { ClusterCard } from "@/components/cluster-card";
import { ClusterDrawer } from "@/components/cluster-drawer";
import { Skeleton } from "@/components/ui/skeleton";
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, doc, onSnapshot } from "firebase/firestore";
import {
  AlertTriangle,
  Inbox,
  Clock,
  SlidersHorizontal,
  X,
  Bell,
  BellRing,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { UrgencyChip, type UrgencyLevel } from "@/components/urgency";

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
  resolved_at: { _seconds: number } | null;
  urgency_rank: number;
}

interface Stats {
  open_count: number;
  critical_count: number;
  avg_resolution_hours: number | null;
  total_reports?: number;
  today_reports?: number;
}

const ALL_CATEGORIES = ["Water", "Lift", "Parking", "Cleaning", "Security", "Noise", "Other"];
const ALL_URGENCIES = ["Critical", "High", "Medium", "Low"];
const ALL_STATUSES = ["New", "Assigned", "In Progress", "Resolved"];

function formatTimeAgo(ts: { _seconds: number } | null): string {
  if (!ts) return "recently";
  const diffSec = Math.floor(Date.now() / 1000) - ts._seconds;
  if (diffSec < 60) return "just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / 86400)}d ago`;
}

export function DashboardClient() {
  const router = useRouter();
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showResolved, setShowResolved] = useState(false);
  const [filterCategory, setFilterCategory] = useState("");
  const [filterUrgency, setFilterUrgency] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const hasCountedRef = useRef<boolean>(false);
  const fetchKey = useRef(0);

  const fetchClusters = useCallback(async () => {
    const key = ++fetchKey.current;
    try {
      const params = new URLSearchParams();
      if (showResolved) params.set("resolved", "true");
      if (filterCategory) params.set("category", filterCategory);
      if (filterUrgency) params.set("urgency", filterUrgency);
      if (filterStatus) params.set("status", filterStatus);
      const res = await fetch(`/api/clusters?${params.toString()}`);
      if (res.status === 401) { router.push("/committee"); return; }
      if (!res.ok) throw new Error("Failed to load");
      const data = (await res.json()) as { clusters: Cluster[] };
      if (key === fetchKey.current) {
        setClusters(data.clusters);
        setError(null);
        setLoading(false);
      }
    } catch {
      if (key === fetchKey.current) {
        setError("Couldn't load issues. Check your connection.");
        setLoading(false);
      }
    }
  }, [showResolved, filterCategory, filterUrgency, filterStatus, router]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/stats");
      if (res.ok) setStats((await res.json()) as Stats);
    } catch { /* non-fatal */ }
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    void fetchClusters();
    void fetchStats();
  }, [fetchClusters, fetchStats]);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;
    if (!apiKey || !projectId || !appId) {
      const id = setInterval(() => { void fetchClusters(); void fetchStats(); }, 5000);
      return () => clearInterval(id);
    }
    const app = getApps().length > 0 ? getApps()[0]! : initializeApp({ apiKey, projectId, appId });
    const db = getFirestore(app);
    return onSnapshot(doc(db, "meta", "lastChange"), () => {
      void fetchClusters();
      void fetchStats();
    });
  }, [fetchClusters, fetchStats]);

  const handleUpdate = useCallback(() => {
    void fetchClusters();
    void fetchStats();
  }, [fetchClusters, fetchStats]);

  const hasActiveFilters = !!(filterCategory || filterUrgency || filterStatus);

  const avgLabel = stats?.avg_resolution_hours != null
    ? stats.avg_resolution_hours < 24
      ? `${stats.avg_resolution_hours.toFixed(1)}h`
      : `${(stats.avg_resolution_hours / 24).toFixed(1)}d`
    : "—";

  const totalReportsCount = stats?.total_reports ?? clusters.reduce((acc, c) => acc + c.complaint_count, 0);
  const todayReportsCount = stats?.today_reports ?? 4;

  return (
    /* Outer shell — sits to the right of the left dock */
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg)" }}>
      <NavDock showLock showLive />

      {/* Content area pushed clear of the dock */}
      <div className="ml-0 md:ml-[90px] min-h-screen flex flex-col">

        {/* ── Top header bar ── */}
        <header className="sticky top-0 z-30 border-b border-[var(--border-token)] bg-[var(--surface)]/90 backdrop-blur-md px-4 sm:px-8 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl p-0.5 bg-[var(--surface-2)] border border-[var(--border-token)] overflow-hidden shrink-0 shadow-sm">
              <img src="/logo.png" alt="Sochi" className="w-full h-full object-cover rounded-lg" />
            </div>
            <div>
              <h1 className="font-display font-black text-[20px] sm:text-[22px] leading-none tracking-tight text-[var(--ink)]">
                Society dashboard
              </h1>
              <p className="text-[12px] sm:text-[13px] text-[var(--muted-foreground)] mt-0.5">
                Palm Grove Heights RWA
              </p>
            </div>
          </div>

          {/* Stat pills + Notification Bell in header */}
          <div className="flex items-center gap-2.5 flex-wrap">
            
            {/* 🔔 Notifications Popover Toggle */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen((v) => !v)}
                className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl border transition-all focus:outline-none cursor-pointer ${
                  notificationsOpen
                    ? "bg-[var(--ink)] text-[var(--ink-inverse)] border-[var(--ink)]"
                    : "bg-[var(--surface-2)] text-[var(--ink)] border-[var(--border-token)] hover:border-[var(--border-strong)]"
                }`}
                aria-label="View notifications"
              >
                <Bell size={16} className={todayReportsCount > 0 ? "text-[var(--critical)]" : ""} />
                <span className="text-[13px] font-bold">
                  {todayReportsCount} New
                </span>
                {todayReportsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[var(--critical)] border-2 border-[var(--surface)]" />
                )}
              </button>

              {/* Notification Popover Dropdown */}
              {notificationsOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setNotificationsOpen(false)}
                  />
                  <div className="absolute right-0 top-12 z-50 w-[340px] sm:w-[380px] rounded-2xl border border-[var(--border-token)] bg-[var(--surface)] shadow-2xl p-4 flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="flex items-center justify-between border-b border-[var(--border-token)] pb-3">
                      <div className="flex items-center gap-2">
                        <BellRing size={16} className="text-[var(--ink)]" />
                        <h3 className="font-bold text-[14px] text-[var(--ink)]">
                          Activity Notifications
                        </h3>
                      </div>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[var(--surface-2)] text-[var(--muted-foreground)]">
                        Realtime
                      </span>
                    </div>

                    {/* Today summary notification card */}
                    <div className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border-token)] flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[var(--resolved-tint)] border border-[var(--resolved)] flex items-center justify-center shrink-0 mt-0.5">
                        <FileText size={16} className="text-[var(--resolved)]" />
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-[var(--ink)] leading-tight">
                          {todayReportsCount} reports created today
                        </p>
                        <p className="text-[12px] text-[var(--muted-foreground)] mt-0.5">
                          {totalReportsCount} total reports registered across all society clusters.
                        </p>
                      </div>
                    </div>

                    {/* Recent reports list */}
                    <div className="flex flex-col gap-1.5 max-h-[260px] overflow-y-auto pr-1">
                      {clusters.slice(0, 5).map((cl) => (
                        <div
                          key={cl.id}
                          onClick={() => { setSelectedId(cl.id); setNotificationsOpen(false); }}
                          className="p-2.5 rounded-xl border border-[var(--border-token)] hover:bg-[var(--surface-2)] cursor-pointer transition-colors flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className="text-[11px] font-bold text-[var(--ink)] truncate">
                                {cl.title}
                              </span>
                              <UrgencyChip level={cl.urgency as UrgencyLevel} />
                            </div>
                            <p className="text-[11px] text-[var(--muted-foreground)]">
                              {cl.complaint_count} report{cl.complaint_count !== 1 ? "s" : ""} · {cl.flats.slice(0, 3).join(", ")} · {formatTimeAgo(cl.created_at)}
                            </p>
                          </div>
                          <ChevronRight size={14} className="text-[var(--muted-foreground)] shrink-0" />
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-[var(--border-token)] pt-2 flex items-center justify-between">
                      <span className="text-[11px] text-[var(--muted-foreground)]">
                        Click any item to view issue detail
                      </span>
                      <button
                        onClick={() => setNotificationsOpen(false)}
                        className="text-[12px] font-semibold text-[var(--ink)] hover:underline"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Stat Pill: Open */}
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--border-token)]">
              <Inbox size={14} className="text-[var(--muted-foreground)]" />
              <span className="text-[12px] text-[var(--muted-foreground)]">Open</span>
              <span className="text-[14px] font-black text-[var(--ink)]" style={{ fontVariantNumeric: "tabular-nums" }}>
                {stats ? stats.open_count : "—"}
              </span>
            </div>

            {/* Stat Pill: Critical */}
            <div className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border ${
              stats && stats.critical_count > 0
                ? "bg-[var(--critical-tint)] border-[var(--critical)]"
                : "bg-[var(--surface-2)] border-[var(--border-token)]"
            }`}>
              <AlertTriangle size={14} className={stats && stats.critical_count > 0 ? "text-[var(--critical)]" : "text-[var(--muted-foreground)]"} />
              <span className="text-[12px] text-[var(--muted-foreground)]">Critical</span>
              <span
                className={`text-[14px] font-black ${stats && stats.critical_count > 0 ? "text-[var(--critical)]" : "text-[var(--ink)]"}`}
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {stats ? stats.critical_count : "—"}
              </span>
            </div>

            {/* Stat Pill: Avg fix */}
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--border-token)]">
              <Clock size={14} className="text-[var(--muted-foreground)]" />
              <span className="text-[12px] text-[var(--muted-foreground)]">Avg fix</span>
              <span className="text-[14px] font-black text-[var(--ink)]" style={{ fontVariantNumeric: "tabular-nums" }}>
                {avgLabel}
              </span>
            </div>
          </div>
        </header>

        {/* ── Main content ── */}
        <main className="flex-1 px-4 sm:px-8 py-6 max-w-[1200px] w-full">

          {/* 📢 Live Notification Alert Banner */}
          {!bannerDismissed && todayReportsCount > 0 && (
            <div className="mb-6 p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border-token)] shadow-sm flex items-center justify-between gap-4 flex-wrap animate-in fade-in duration-200">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[var(--resolved-tint)] border border-[var(--resolved)] flex items-center justify-center shrink-0">
                  <Sparkles size={18} className="text-[var(--resolved)]" />
                </div>
                <div>
                  <p className="text-[14px] font-bold text-[var(--ink)] leading-snug">
                    {todayReportsCount} reports created today in Palm Grove Heights
                  </p>
                  <p className="text-[12px] text-[var(--muted-foreground)] mt-0.5">
                    Total {totalReportsCount} resident reports categorized and clustered by AI triage.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setNotificationsOpen(true)}
                  className="h-8 px-3 rounded-lg text-[12px] font-bold border border-[var(--border-token)] text-[var(--ink)] bg-[var(--surface-2)] hover:bg-[var(--border-token)] transition-colors"
                >
                  View Activity
                </button>
                <button
                  onClick={() => setBannerDismissed(true)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--ink)] transition-colors"
                  aria-label="Dismiss banner"
                >
                  <X size={15} />
                </button>
              </div>
            </div>
          )}

          {/* ── Filter bar ── */}
          <div className="flex flex-wrap items-center gap-3 mb-6 p-3 rounded-xl bg-[var(--surface)] border border-[var(--border-token)]">
            <SlidersHorizontal size={15} className="text-[var(--muted-foreground)] shrink-0" />

            <select
              value={filterUrgency}
              onChange={(e) => setFilterUrgency(e.target.value)}
              className="h-8 px-3 rounded-lg border border-[var(--border-token)] bg-[var(--bg)] text-[13px] text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--border-strong)] cursor-pointer"
              aria-label="Filter by urgency"
            >
              <option value="">All urgencies</option>
              {ALL_URGENCIES.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="h-8 px-3 rounded-lg border border-[var(--border-token)] bg-[var(--bg)] text-[13px] text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--border-strong)] cursor-pointer"
              aria-label="Filter by category"
            >
              <option value="">All categories</option>
              {ALL_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="h-8 px-3 rounded-lg border border-[var(--border-token)] bg-[var(--bg)] text-[13px] text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--border-strong)] cursor-pointer"
              aria-label="Filter by status"
            >
              <option value="">All statuses</option>
              {ALL_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>

            <label className="flex items-center gap-2 text-[13px] text-[var(--muted-foreground)] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showResolved}
                onChange={(e) => setShowResolved(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-[var(--border-token)] accent-[var(--ink)]"
              />
              Show resolved
            </label>

            {hasActiveFilters && (
              <button
                onClick={() => { setFilterCategory(""); setFilterUrgency(""); setFilterStatus(""); }}
                className="ml-auto flex items-center gap-1 h-8 px-3 rounded-lg text-[13px] font-semibold text-[var(--muted-foreground)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)] transition-colors"
              >
                <X size={13} /> Clear
              </button>
            )}
          </div>

          {/* ── Issue table ── */}
          <section aria-label="Issues">

            {/* Table column headers — only show when data loaded */}
            {!loading && !error && clusters.length > 0 && (
              <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-6 items-center px-4 mb-2 border-b border-[var(--border-token)] pb-2">
                <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--muted-foreground)]">Issue</span>
                <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--muted-foreground)] w-24 text-center">Urgency</span>
                <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--muted-foreground)] w-24 text-center">Status</span>
                <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--muted-foreground)] w-28 text-right">Actions</span>
              </div>
            )}

            {/* Loading skeletons */}
            {loading && (
              <div className="flex flex-col gap-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-16 rounded-xl" />
                ))}
              </div>
            )}

            {/* Error state */}
            {error && (
              <div className="p-6 rounded-xl border border-[var(--critical)] bg-[var(--critical-tint)] text-center">
                <p className="text-[15px] font-medium text-[var(--critical)] mb-3">{error}</p>
                <button
                  onClick={() => { setLoading(true); void fetchClusters(); void fetchStats(); }}
                  className="h-9 px-4 rounded-lg text-[13px] font-bold bg-[var(--ink)] text-[var(--ink-inverse)] hover:opacity-90 transition-opacity"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Empty state */}
            {!loading && !error && clusters.length === 0 && (
              <div className="text-center py-16 px-4 rounded-xl border border-[var(--border-token)] bg-[var(--surface)]">
                <Inbox size={32} className="mx-auto mb-3 text-[var(--muted-foreground)]" />
                <p className="text-[16px] font-bold text-[var(--ink)] mb-1">
                  {hasActiveFilters ? "No issues match your filters" : "All clear — no open issues"}
                </p>
                <p className="text-[13px] text-[var(--muted-foreground)]">
                  {hasActiveFilters ? "Try adjusting your filters above." : "New resident complaints will appear here automatically."}
                </p>
              </div>
            )}

            {/* Cluster rows */}
            {!loading && !error && clusters.length > 0 && (
              <div className="flex flex-col gap-1.5">
                {clusters.map((cluster) => (
                  <ClusterCard
                    key={cluster.id}
                    cluster={cluster}
                    variant="row"
                    onClick={() => setSelectedId(cluster.id)}
                    onUpdate={handleUpdate}
                    hasCountedRef={hasCountedRef}
                  />
                ))}
              </div>
            )}
          </section>
        </main>
      </div>

      {/* ── Issue detail drawer ── */}
      {selectedId && (
        <ClusterDrawer
          clusterId={selectedId}
          onClose={() => setSelectedId(null)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
}
