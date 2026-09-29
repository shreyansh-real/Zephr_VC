"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { NavDock } from "@/components/nav-dock";
import { ClusterCard } from "@/components/cluster-card";
import { ClusterDrawer } from "@/components/cluster-drawer";
import { Skeleton } from "@/components/ui/skeleton";
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, doc, onSnapshot } from "firebase/firestore";
import { AlertTriangle, Inbox, Clock, SlidersHorizontal, CheckSquare, X } from "lucide-react";

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
}

const ALL_CATEGORIES = ["Water", "Lift", "Parking", "Cleaning", "Security", "Noise", "Other"];
const ALL_URGENCIES = ["Critical", "High", "Medium", "Low"];
const ALL_STATUSES = ["New", "Assigned", "In Progress", "Resolved"];

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

  return (
    /* Outer shell — sits to the right of the 82px wide left dock */
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg)" }}>
      <NavDock showLock showLive />

      {/* Content area pushed clear of the dock (82px dock + 8px gap = 90px) */}
      <div className="ml-[90px] min-h-screen flex flex-col">

        {/* ── Top header bar ── */}
        <header className="sticky top-0 z-30 border-b border-[var(--border-token)] bg-[var(--surface)]/90 backdrop-blur-md px-8 py-4 flex items-center justify-between gap-6">
          <div>
            <h1 className="font-display font-black text-[22px] leading-none tracking-tight text-[var(--ink)]">
              Society dashboard
            </h1>
            <p className="text-[13px] text-[var(--muted-foreground)] mt-0.5">
              Palm Grove Heights RWA
            </p>
          </div>

          {/* Stat pills in header */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--surface-2)] border border-[var(--border-token)]">
              <Inbox size={15} className="text-[var(--muted-foreground)]" />
              <span className="text-[13px] text-[var(--muted-foreground)]">Open</span>
              <span className="text-[15px] font-black text-[var(--ink)]" style={{ fontVariantNumeric: "tabular-nums" }}>
                {stats ? stats.open_count : "—"}
              </span>
            </div>

            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
              stats && stats.critical_count > 0
                ? "bg-[var(--critical-tint)] border-[var(--critical)]"
                : "bg-[var(--surface-2)] border-[var(--border-token)]"
            }`}>
              <AlertTriangle size={15} className={stats && stats.critical_count > 0 ? "text-[var(--critical)]" : "text-[var(--muted-foreground)]"} />
              <span className="text-[13px] text-[var(--muted-foreground)]">Critical</span>
              <span
                className={`text-[15px] font-black ${stats && stats.critical_count > 0 ? "text-[var(--critical)]" : "text-[var(--ink)]"}`}
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {stats ? stats.critical_count : "—"}
              </span>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--surface-2)] border border-[var(--border-token)]">
              <Clock size={15} className="text-[var(--muted-foreground)]" />
              <span className="text-[13px] text-[var(--muted-foreground)]">Avg fix</span>
              <span className="text-[15px] font-black text-[var(--ink)]" style={{ fontVariantNumeric: "tabular-nums" }}>
                {avgLabel}
              </span>
            </div>
          </div>
        </header>

        {/* ── Main content ── */}
        <main className="flex-1 px-8 py-6 max-w-[1200px] w-full">

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
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-[68px] rounded-xl" style={{ backgroundColor: "var(--surface-2)", opacity: 1 }} />
                ))}
              </div>
            )}

            {/* Error state */}
            {error && (
              <div className="flex items-center justify-between p-5 rounded-xl border border-[var(--border-token)] bg-[var(--surface)]">
                <p className="text-[15px] text-[var(--ink)]">{error}</p>
                <button
                  onClick={() => { setLoading(true); void fetchClusters(); }}
                  className="h-9 px-4 rounded-lg font-semibold text-[14px] border border-[var(--ink)] text-[var(--ink)] hover:bg-[var(--surface-2)] transition-colors"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Empty state */}
            {!loading && !error && clusters.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 rounded-xl border border-dashed border-[var(--border-token)]">
                <CheckSquare size={36} className="text-[var(--muted-foreground)] opacity-30 mb-3" />
                <p className="text-[16px] font-semibold text-[var(--ink)] mb-1">
                  {hasActiveFilters ? "No matching issues" : "No open issues"}
                </p>
                <p className="text-[14px] text-[var(--muted-foreground)] mb-5">
                  {hasActiveFilters ? "Try adjusting or clearing your filters." : "Share the report link with residents."}
                </p>
                {!hasActiveFilters && (
                  <button
                    onClick={() => navigator.clipboard.writeText(window.location.origin + "/report").catch(() => {})}
                    className="h-9 px-5 rounded-lg text-[14px] font-semibold border border-[var(--ink)] text-[var(--ink)] hover:bg-[var(--surface-2)] transition-colors"
                  >
                    Copy report link
                  </button>
                )}
              </div>
            )}

            {/* Issue rows */}
            {!loading && !error && clusters.length > 0 && (
              <div className="flex flex-col gap-1.5">
                {clusters.map((c) => (
                  <ClusterCard
                    key={c.id}
                    cluster={c}
                    variant="row"
                    onClick={() => setSelectedId(c.id)}
                    onUpdate={handleUpdate}
                    hasCountedRef={hasCountedRef}
                  />
                ))}
              </div>
            )}
          </section>
        </main>
      </div>

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
