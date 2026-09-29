"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { NavDock } from "@/components/nav-dock";
import { ClusterCard } from "@/components/cluster-card";
import { ClusterDrawer } from "@/components/cluster-drawer";
import { Skeleton } from "@/components/ui/skeleton";
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, doc, onSnapshot } from "firebase/firestore";
import { AlertTriangle, Inbox, Clock, Filter, CheckSquare } from "lucide-react";

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

function StatCard({
  icon,
  label,
  value,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 px-5 py-4 rounded-xl border ${
        highlight
          ? "border-[var(--critical)] bg-[var(--critical-tint)]"
          : "border-[var(--border-token)] bg-[var(--surface)]"
      }`}
    >
      <span className={highlight ? "text-[var(--critical)]" : "text-[var(--muted-foreground)]"}>
        {icon}
      </span>
      <div>
        <p className="text-[13px] text-[var(--muted-foreground)] leading-none mb-1">{label}</p>
        <p
          className={`text-[22px] font-black leading-none tracking-tight ${
            highlight ? "text-[var(--critical)]" : "text-[var(--ink)]"
          }`}
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  label,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  options: string[];
  placeholder: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[12px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 px-3 rounded-lg border border-[var(--border-token)] bg-[var(--surface)] text-[14px] text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--border-strong)] cursor-pointer min-w-[130px]"
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
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
    const unsubscribe = onSnapshot(doc(db, "meta", "lastChange"), () => {
      void fetchClusters();
      void fetchStats();
    });
    return unsubscribe;
  }, [fetchClusters, fetchStats]);

  const handleUpdate = useCallback(() => {
    void fetchClusters();
    void fetchStats();
  }, [fetchClusters, fetchStats]);

  const hasActiveFilters = filterCategory || filterUrgency || filterStatus;

  const avgLabel = stats?.avg_resolution_hours != null
    ? stats.avg_resolution_hours < 24
      ? `${stats.avg_resolution_hours.toFixed(1)}h`
      : `${(stats.avg_resolution_hours / 24).toFixed(1)}d`
    : "—";

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg)" }}>
      <NavDock showLock showLive />

      <main className="pl-[88px] pr-6 md:pr-10 py-8 max-w-[1400px]">

        {/* ── Page header ── */}
        <div className="mb-8">
          <h1 className="font-display font-black text-[32px] leading-none tracking-tight text-[var(--ink)] mb-1">
            Society dashboard
          </h1>
          <p className="text-[15px] text-[var(--muted-foreground)]">
            Palm Grove Heights RWA · live issues
          </p>
        </div>

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
          <StatCard
            icon={<Inbox size={20} />}
            label="Open issues"
            value={stats ? stats.open_count : "—"}
          />
          <StatCard
            icon={<AlertTriangle size={20} />}
            label="Critical"
            value={stats ? stats.critical_count : "—"}
            highlight={!!stats && stats.critical_count > 0}
          />
          <StatCard
            icon={<Clock size={20} />}
            label="Avg resolution"
            value={avgLabel}
          />
        </div>

        {/* ── Filters bar ── */}
        <div className="flex flex-wrap items-end gap-4 mb-6 pb-5 border-b border-[var(--border-token)]">
          <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
            <Filter size={15} />
            <span className="text-[13px] font-semibold uppercase tracking-wider">Filters</span>
          </div>
          <FilterSelect
            label="Category"
            value={filterCategory}
            onChange={setFilterCategory}
            options={ALL_CATEGORIES}
            placeholder="All categories"
          />
          <FilterSelect
            label="Urgency"
            value={filterUrgency}
            onChange={setFilterUrgency}
            options={ALL_URGENCIES}
            placeholder="All urgencies"
          />
          <FilterSelect
            label="Status"
            value={filterStatus}
            onChange={setFilterStatus}
            options={ALL_STATUSES}
            placeholder="All statuses"
          />
          <label className="flex items-center gap-2 text-[14px] text-[var(--muted-foreground)] cursor-pointer pb-0.5">
            <input
              type="checkbox"
              checked={showResolved}
              onChange={(e) => setShowResolved(e.target.checked)}
              className="w-4 h-4 rounded border-[var(--border-token)] accent-[var(--ink)]"
            />
            Show resolved
          </label>
          {hasActiveFilters && (
            <button
              onClick={() => { setFilterCategory(""); setFilterUrgency(""); setFilterStatus(""); }}
              className="text-[13px] font-semibold text-[var(--muted-foreground)] hover:text-[var(--ink)] underline underline-offset-2 transition-colors pb-0.5"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* ── Issue list ── */}
        <section aria-label="Issues">

          {/* Column header */}
          {!loading && !error && clusters.length > 0 && (
            <div className="hidden md:grid md:grid-cols-[2fr_1fr_1fr_1fr_160px] gap-4 px-4 mb-2">
              {["Issue", "Category", "Urgency", "Status", "Assignee / actions"].map((h) => (
                <span key={h} className="text-[12px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
                  {h}
                </span>
              ))}
            </div>
          )}

          {/* Skeleton */}
          {loading && (
            <div className="flex flex-col gap-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton
                  key={i}
                  className="h-16 rounded-xl"
                  style={{ backgroundColor: "var(--surface-2)", opacity: 1 }}
                />
              ))}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center justify-between p-5 rounded-xl border border-[var(--border-token)] bg-[var(--surface)]">
              <p className="text-[15px] text-[var(--ink)]">{error}</p>
              <button
                onClick={() => { setLoading(true); void fetchClusters(); }}
                className="h-9 px-4 rounded-lg font-semibold text-[14px] border border-[var(--ink)] text-[var(--ink)] hover:bg-[var(--surface-2)] transition-colors focus:outline-none"
              >
                Retry
              </button>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && clusters.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 rounded-xl border border-dashed border-[var(--border-token)]">
              <CheckSquare size={40} className="text-[var(--muted-foreground)] mb-3 opacity-40" />
              <p className="text-[16px] font-semibold text-[var(--ink)] mb-1">No issues found</p>
              <p className="text-[14px] text-[var(--muted-foreground)] mb-4">
                {hasActiveFilters ? "Try clearing your filters." : "Share the report link with residents to start collecting issues."}
              </p>
              {!hasActiveFilters && (
                <button
                  onClick={() => { navigator.clipboard.writeText(window.location.origin + "/report").catch(() => {}); }}
                  className="h-9 px-4 rounded-lg font-semibold text-[14px] border border-[var(--ink)] text-[var(--ink)] hover:bg-[var(--surface-2)] transition-colors focus:outline-none"
                >
                  Copy report link
                </button>
              )}
            </div>
          )}

          {/* Issue rows */}
          {!loading && !error && clusters.length > 0 && (
            <div className="flex flex-col gap-2">
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
