"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { ClusterCard } from "@/components/cluster-card";
import { ClusterDrawer } from "@/components/cluster-drawer";
import { Skeleton } from "@/components/ui/skeleton";
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, doc, onSnapshot } from "firebase/firestore";

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
      if (res.ok) {
        const data = (await res.json()) as Stats;
        setStats(data);
      }
    } catch { /* non-fatal */ }
  }, []);

  // Initial load and filter changes
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    const run = async () => {
      await fetchClusters();
      await fetchStats();
    };
    void run();
    return () => controller.abort();
  }, [fetchClusters, fetchStats]);

  // Realtime via Firebase client SDK on meta/lastChange
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
    const unsubscribe = onSnapshot(doc(db, "meta", "lastChange"), () => {
      void fetchClusters();
      void fetchStats();
    });
    return unsubscribe;
  }, [fetchClusters, fetchStats]);

  const focusClusters = clusters.filter((c) => c.status !== "Resolved").slice(0, 3);
  const allFlatCategories = ["Water", "Lift", "Parking", "Cleaning", "Security", "Noise", "Other"];
  const allUrgencies = ["Critical", "High", "Medium", "Low"];
  const allStatuses = ["New", "Assigned", "In Progress", "Resolved"];

  const handleUpdate = useCallback(() => {
    void fetchClusters();
    void fetchStats();
  }, [fetchClusters, fetchStats]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg)" }}>
      <Header showLock showLive />
      <main className="max-w-[1200px] mx-auto px-4 md:px-8 py-8">
        {/* Today's Focus */}
        {!loading && !error && focusClusters.length > 0 && (
          <section className="mb-10" aria-labelledby="focus-heading">
            <h2 id="focus-heading" className="font-display font-black text-[28px] leading-[1.15] tracking-[-0.01em] text-[var(--ink)] mb-4">
              Do these first
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {focusClusters.map((c) => (
                <ClusterCard
                  key={c.id}
                  cluster={c}
                  variant="focus"
                  onClick={() => setSelectedId(c.id)}
                  onUpdate={handleUpdate}
                  hasCountedRef={hasCountedRef}
                />
              ))}
            </div>
          </section>
        )}

        {/* Stats */}
        {stats && (
          <p className="text-[16px] text-[var(--muted)] mb-4" style={{ fontVariantNumeric: "tabular-nums" }}>
            <strong className="text-[var(--ink)]">{stats.open_count}</strong> open
            {" · "}
            <strong className="text-[var(--critical)]">{stats.critical_count}</strong> critical
            {stats.avg_resolution_hours != null && (
              <>
                {" · "}Avg fix{" "}
                <strong className="text-[var(--ink)]">
                  {stats.avg_resolution_hours < 24
                    ? `${stats.avg_resolution_hours.toFixed(1)}h`
                    : `${(stats.avg_resolution_hours / 24).toFixed(1)} days`}
                </strong>
              </>
            )}
          </p>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6 items-center">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="h-10 px-3 rounded-lg border-[1.5px] border-[var(--border-token)] bg-[var(--surface)] text-[15px] text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--border-strong)] cursor-pointer"
            aria-label="Filter by category"
          >
            <option value="">All categories</option>
            {allFlatCategories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={filterUrgency}
            onChange={(e) => setFilterUrgency(e.target.value)}
            className="h-10 px-3 rounded-lg border-[1.5px] border-[var(--border-token)] bg-[var(--surface)] text-[15px] text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--border-strong)] cursor-pointer"
            aria-label="Filter by urgency"
          >
            <option value="">All urgencies</option>
            {allUrgencies.map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-10 px-3 rounded-lg border-[1.5px] border-[var(--border-token)] bg-[var(--surface)] text-[15px] text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--border-strong)] cursor-pointer"
            aria-label="Filter by status"
          >
            <option value="">All statuses</option>
            {allStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <label className="flex items-center gap-2 text-[15px] text-[var(--muted)] cursor-pointer ml-auto">
            <input
              type="checkbox"
              checked={showResolved}
              onChange={(e) => setShowResolved(e.target.checked)}
              className="w-4 h-4 rounded border-[var(--border-token)] accent-[var(--ink)]"
            />
            Show resolved
          </label>
        </div>

        {/* All issues */}
        <section aria-labelledby="all-heading">
          <h2 id="all-heading" className="font-display font-black text-[28px] leading-[1.15] tracking-[-0.01em] text-[var(--ink)] mb-4">
            All issues
          </h2>

          {loading && (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-28 rounded-[12px]" style={{ backgroundColor: "var(--surface-2)", opacity: 1 }} />
              ))}
            </div>
          )}

          {error && (
            <div className="p-6 rounded-[12px] border border-[var(--border-token)]" style={{ backgroundColor: "var(--surface)" }}>
              <p className="text-[16px] text-[var(--ink)] mb-3">{error}</p>
              <button
                onClick={() => { setLoading(true); void fetchClusters(); }}
                className="h-10 px-5 rounded-lg font-bold text-[15px] border-[1.5px] border-[var(--ink)] text-[var(--ink)] hover:bg-[var(--surface-2)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--border-strong)]"
              >
                Try again
              </button>
            </div>
          )}

          {!loading && !error && clusters.length === 0 && (
            <div className="p-6 rounded-[12px] border border-[var(--border-token)]" style={{ backgroundColor: "var(--surface)" }}>
              <p className="text-[16px] text-[var(--muted)]">No complaints yet. Share the report link with residents.</p>
              <button
                onClick={() => { navigator.clipboard.writeText(window.location.origin + "/report").catch(() => {}); }}
                className="mt-3 h-10 px-5 rounded-lg font-bold text-[15px] border-[1.5px] border-[var(--ink)] text-[var(--ink)] hover:bg-[var(--surface-2)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--border-strong)]"
              >
                Copy report link
              </button>
            </div>
          )}

          {!loading && !error && clusters.length > 0 && (
            <div className="flex flex-col gap-3">
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
