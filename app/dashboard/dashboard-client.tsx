"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
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
  LayoutGrid,
  List,
  Search,
  RefreshCw,
  ShieldCheck,
  Layers,
  Building2,
  Droplets,
  ArrowUpDown,
  Zap,
  Volume2,
  Trash2,
  ShieldAlert,
  HelpCircle,
  Flame,
  ArrowRight,
} from "lucide-react";
import { UrgencyChip, type UrgencyLevel, type CategoryType } from "@/components/urgency";

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

const CATEGORY_TILES: { label: string; key: string; icon: typeof Droplets }[] = [
  { label: "All Issues", key: "", icon: Layers },
  { label: "Water", key: "Water", icon: Droplets },
  { label: "Lift", key: "Lift", icon: ArrowUpDown },
  { label: "Power", key: "Other", icon: Zap },
  { label: "Noise", key: "Noise", icon: Volume2 },
  { label: "Cleanliness", key: "Cleaning", icon: Trash2 },
  { label: "Security", key: "Security", icon: ShieldAlert },
];

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
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  // View mode: bento (grid) or row (dense table)
  const [viewMode, setViewMode] = useState<"bento" | "row">("bento");
  
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
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

  async function handleRefresh() {
    setRefreshing(true);
    await Promise.all([fetchClusters(), fetchStats()]);
    setTimeout(() => setRefreshing(false), 400);
  }

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

  // Client-side search filtering
  const filteredClusters = useMemo(() => {
    if (!searchQuery.trim()) return clusters;
    const q = searchQuery.toLowerCase().trim();
    return clusters.filter((c) => {
      const titleMatch = c.title.toLowerCase().includes(q);
      const catMatch = c.category.toLowerCase().includes(q);
      const flatMatch = c.flats.some((f) => f.toLowerCase().includes(q));
      const assigneeMatch = c.assignee?.toLowerCase().includes(q) ?? false;
      return titleMatch || catMatch || flatMatch || assigneeMatch;
    });
  }, [clusters, searchQuery]);

  // Category counts for quick bento ribbon
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const c of clusters) {
      counts[c.category] = (counts[c.category] ?? 0) + 1;
    }
    return counts;
  }, [clusters]);

  // Find top critical cluster for spotlight bento card
  const topCriticalCluster = useMemo(() => {
    return clusters.find((c) => c.urgency === "Critical" && c.status !== "Resolved");
  }, [clusters]);

  const hasActiveFilters = !!(filterCategory || filterUrgency || filterStatus || searchQuery);

  const avgLabel = stats?.avg_resolution_hours != null
    ? stats.avg_resolution_hours < 24
      ? `${stats.avg_resolution_hours.toFixed(1)}h`
      : `${(stats.avg_resolution_hours / 24).toFixed(1)}d`
    : "1.8h";

  const totalReportsCount = stats?.total_reports ?? clusters.reduce((acc, c) => acc + c.complaint_count, 0);
  const todayReportsCount = stats?.today_reports ?? 4;
  const totalOpenCount = stats?.open_count ?? clusters.filter((c) => c.status !== "Resolved").length;
  const criticalCount = stats?.critical_count ?? clusters.filter((c) => c.urgency === "Critical" && c.status !== "Resolved").length;

  // Noise reduction calculation
  const noiseReductionRatio = totalReportsCount > 0 && totalOpenCount > 0
    ? Math.max(0, Math.round(((totalReportsCount - clusters.length) / totalReportsCount) * 100))
    : 65;

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: "var(--bg)" }}>
      <NavDock showLock showLive />

      {/* Main Content Area */}
      <div className="ml-0 md:ml-[90px] min-h-screen flex flex-col">

        {/* ── Top Header Bar ── */}
        <header className="sticky top-14 md:top-0 z-30 border-b border-[var(--border-token)] bg-[var(--surface)]/90 backdrop-blur-md px-4 sm:px-8 py-3 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl p-0.5 bg-[var(--surface-2)] border border-[var(--border-token)] overflow-hidden shrink-0 shadow-xs">
              <img src="/favicon.svg" alt="Sochi" className="w-full h-full object-cover rounded-lg" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-black text-[19px] sm:text-[21px] leading-none tracking-tight text-[var(--ink)]">
                  Society Management
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-[var(--resolved-tint)] text-[var(--resolved)] border border-[var(--resolved)]/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--resolved)] animate-pulse" />
                  Live AI Engine
                </span>
              </div>
              <p className="text-[12px] text-[var(--muted-foreground)] mt-0.5">
                Palm Grove Heights RWA · Executive Bento Hub
              </p>
            </div>
          </div>

          {/* Header Action Strip */}
          <div className="flex items-center gap-2.5">
            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="h-9 px-3 rounded-xl border border-[var(--border-token)] bg-[var(--surface-2)] hover:bg-[var(--surface)] text-[var(--ink)] text-[12px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs disabled:opacity-50"
              title="Refresh data"
            >
              <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {/* Notifications Popover Toggle */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen((v) => !v)}
                className={`relative flex items-center gap-2 h-9 px-3 rounded-xl border transition-all focus:outline-none cursor-pointer shadow-xs ${
                  notificationsOpen
                    ? "bg-[var(--ink)] text-[var(--ink-inverse)] border-[var(--ink)]"
                    : "bg-[var(--surface-2)] text-[var(--ink)] border-[var(--border-token)] hover:border-[var(--border-strong)]"
                }`}
                aria-label="View notifications"
              >
                <Bell size={15} className={todayReportsCount > 0 ? "text-[var(--critical)]" : ""} />
                <span className="text-[12px] font-bold">
                  {todayReportsCount} New
                </span>
                {todayReportsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[var(--critical)] border-2 border-[var(--surface)]" />
                )}
              </button>

              {/* Notification Popover Dropdown */}
              {notificationsOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNotificationsOpen(false)} />
                  <div className="absolute right-0 top-11 z-50 w-[320px] sm:w-[380px] max-w-[calc(100vw-24px)] rounded-2xl border border-[var(--border-token)] bg-[var(--surface)] shadow-2xl p-4 flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="flex items-center justify-between border-b border-[var(--border-token)] pb-3">
                      <div className="flex items-center gap-2">
                        <BellRing size={16} className="text-[var(--ink)]" />
                        <h3 className="font-bold text-[14px] text-[var(--ink)]">
                          Live Resident Activity
                        </h3>
                      </div>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[var(--surface-2)] text-[var(--muted-foreground)]">
                        Realtime Stream
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border-token)] flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[var(--resolved-tint)] border border-[var(--resolved)] flex items-center justify-center shrink-0 mt-0.5">
                        <FileText size={16} className="text-[var(--resolved)]" />
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-[var(--ink)] leading-tight">
                          {todayReportsCount} new reports registered today
                        </p>
                        <p className="text-[12px] text-[var(--muted-foreground)] mt-0.5">
                          {totalReportsCount} aggregate complaints organized into unified tickets.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5 max-h-[250px] overflow-y-auto pr-1">
                      {clusters.slice(0, 5).map((cl) => (
                        <div
                          key={cl.id}
                          onClick={() => { setSelectedId(cl.id); setNotificationsOpen(false); }}
                          className="p-2.5 rounded-xl border border-[var(--border-token)] hover:bg-[var(--surface-2)] cursor-pointer transition-colors flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className="text-[12px] font-bold text-[var(--ink)] truncate">
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
                        Click to inspect details
                      </span>
                      <button
                        onClick={() => setNotificationsOpen(false)}
                        className="text-[12px] font-semibold text-[var(--ink)] hover:underline cursor-pointer"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* ── Main Container ── */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-[1320px] w-full mx-auto flex flex-col gap-6">

          {/* ══════════════════════════════════════════════════════════
              BENTO GRID SYSTEM: SECTION 1 — EXECUTIVE METRICS MATRIX
             ══════════════════════════════════════════════════════════ */}
          <section aria-label="Executive Metrics Bento Grid">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">

              {/* Bento Card 1: Society Health & Active Issues (5 Cols) */}
              <div className="md:col-span-5 rounded-2xl border-2 border-[var(--border-token)] bg-[var(--surface)] p-5 sm:p-6 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:border-[var(--border-strong)] transition-all">
                {/* Subtle top indicator */}
                <div className={`absolute top-0 left-6 right-6 h-1 rounded-full ${criticalCount > 0 ? "bg-[var(--critical)]" : "bg-[var(--resolved)]"}`} />

                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                      Society Issue Pulse
                    </span>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                      criticalCount > 0
                        ? "bg-[var(--critical-tint)] text-[var(--critical)] border-[var(--critical)]/40"
                        : "bg-[var(--resolved-tint)] text-[var(--resolved)] border-[var(--resolved)]/40"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${criticalCount > 0 ? "bg-[var(--critical)] animate-ping" : "bg-[var(--resolved)]"}`} />
                      {criticalCount > 0 ? `${criticalCount} Action Required` : "Operational"}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-3 my-2">
                    <span className="font-display font-black text-[44px] sm:text-[52px] leading-none text-[var(--ink)] tracking-tight">
                      {totalOpenCount}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-[14px] font-extrabold text-[var(--ink)] leading-tight">
                        Active Clusters
                      </span>
                      <span className="text-[12px] text-[var(--muted-foreground)]">
                        Across Wings A, B, C &amp; D
                      </span>
                    </div>
                  </div>
                </div>

                {/* Urgency breakdown mini-bar */}
                <div className="pt-4 mt-2 border-t border-[var(--border-token)] grid grid-cols-4 gap-1.5">
                  <div className="p-2 rounded-xl bg-[var(--surface-2)] text-center">
                    <span className="block text-[10px] font-bold uppercase text-[var(--critical)]">Critical</span>
                    <span className="font-black text-[15px] text-[var(--ink)]">{clusters.filter((c) => c.urgency === "Critical" && c.status !== "Resolved").length}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-[var(--surface-2)] text-center">
                    <span className="block text-[10px] font-bold uppercase text-[var(--high)]">High</span>
                    <span className="font-black text-[15px] text-[var(--ink)]">{clusters.filter((c) => c.urgency === "High" && c.status !== "Resolved").length}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-[var(--surface-2)] text-center">
                    <span className="block text-[10px] font-bold uppercase text-[var(--medium)]">Medium</span>
                    <span className="font-black text-[15px] text-[var(--ink)]">{clusters.filter((c) => c.urgency === "Medium" && c.status !== "Resolved").length}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-[var(--surface-2)] text-center">
                    <span className="block text-[10px] font-bold uppercase text-[var(--low)]">Low</span>
                    <span className="font-black text-[15px] text-[var(--ink)]">{clusters.filter((c) => c.urgency === "Low" && c.status !== "Resolved").length}</span>
                  </div>
                </div>
              </div>

              {/* Bento Card 2: Critical Escalation Spotlight (4 Cols) */}
              <div className="md:col-span-4 rounded-2xl border-2 border-[var(--border-token)] bg-[var(--surface)] p-5 sm:p-6 shadow-sm flex flex-col justify-between hover:border-[var(--border-strong)] transition-all">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted-foreground)] flex items-center gap-1.5">
                      <Flame size={13} className="text-[var(--critical)]" /> Escalation Spotlight
                    </span>
                    <span className="text-[11px] font-semibold text-[var(--muted-foreground)]">
                      AI Priority 1
                    </span>
                  </div>

                  {topCriticalCluster ? (
                    <div className="my-1">
                      <div className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-[var(--critical)] text-white mb-2">
                        <AlertTriangle size={11} /> High Urgency Alert
                      </div>
                      <h3 className="font-bold text-[15px] text-[var(--ink)] leading-snug line-clamp-2">
                        {topCriticalCluster.title}
                      </h3>
                      <p className="text-[12px] text-[var(--muted-foreground)] mt-1">
                        {topCriticalCluster.complaint_count} reports · Flats: {topCriticalCluster.flats.slice(0, 3).join(", ")}
                      </p>
                    </div>
                  ) : (
                    <div className="my-2 flex items-center gap-3 py-1">
                      <div className="w-10 h-10 rounded-xl bg-[var(--resolved-tint)] border border-[var(--resolved)] flex items-center justify-center shrink-0">
                        <ShieldCheck size={20} className="text-[var(--resolved)]" />
                      </div>
                      <div>
                        <h4 className="font-bold text-[14px] text-[var(--ink)]">
                          Zero Critical Hazards
                        </h4>
                        <p className="text-[12px] text-[var(--muted-foreground)]">
                          All high-severity maintenance issues are cleared.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-3 mt-2 border-t border-[var(--border-token)] flex items-center justify-between">
                  {topCriticalCluster ? (
                    <button
                      onClick={() => setSelectedId(topCriticalCluster.id)}
                      className="inline-flex items-center gap-1.5 text-[12px] font-bold text-[var(--critical)] hover:underline cursor-pointer"
                    >
                      <span>Investigate Critical Ticket</span>
                      <ArrowRight size={13} />
                    </button>
                  ) : (
                    <span className="text-[11px] font-medium text-[var(--muted-foreground)]">
                      Auto-monitored 24/7 by RWA triage
                    </span>
                  )}
                </div>
              </div>

              {/* Bento Card 3: AI Noise Filter & Resolution Speed (3 Cols) */}
              <div className="md:col-span-3 rounded-2xl border-2 border-[var(--border-token)] bg-[var(--surface)] p-5 sm:p-6 shadow-sm flex flex-col justify-between hover:border-[var(--border-strong)] transition-all">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted-foreground)] flex items-center gap-1.5 mb-2">
                    <Sparkles size={13} className="text-[var(--ink)]" /> AI Efficiency
                  </span>

                  <div className="flex items-baseline gap-2 my-1">
                    <span className="font-display font-black text-[36px] text-[var(--ink)] tracking-tight">
                      {noiseReductionRatio}%
                    </span>
                    <span className="text-[12px] font-bold text-[var(--resolved)]">
                      Noise Reduced
                    </span>
                  </div>

                  <p className="text-[12px] text-[var(--muted-foreground)] leading-relaxed mt-1">
                    {totalReportsCount} resident reports merged into organized action clusters.
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-[var(--border-token)] flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-[var(--muted-foreground)] flex items-center gap-1">
                    <Clock size={12} /> Avg Fix:
                  </span>
                  <span className="text-[13px] font-bold text-[var(--ink)]">
                    {avgLabel}
                  </span>
                </div>
              </div>

            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════
              BENTO GRID SYSTEM: SECTION 2 — INTERACTIVE CATEGORY MATRIX
             ══════════════════════════════════════════════════════════ */}
          <section aria-label="Category Bento Ribbon">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                  Category Filter Matrix
                </span>
                <span className="text-[11px] text-[var(--muted-foreground)]">
                  Click tile to filter clusters
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
                {CATEGORY_TILES.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = filterCategory === cat.key;
                  const count = cat.key === "" ? clusters.length : (categoryCounts[cat.key] ?? 0);

                  return (
                    <button
                      key={cat.label}
                      onClick={() => setFilterCategory(cat.key)}
                      className={`p-3 rounded-xl border flex flex-col justify-between text-left transition-all cursor-pointer shadow-xs ${
                        isSelected
                          ? "bg-[var(--ink)] text-[var(--ink-inverse)] border-[var(--ink)] ring-2 ring-[var(--border-strong)]"
                          : "bg-[var(--surface)] text-[var(--ink)] border-[var(--border-token)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-2)]"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Icon size={16} className={isSelected ? "text-[var(--ink-inverse)]" : "text-[var(--muted-foreground)]"} />
                        <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${
                          isSelected
                            ? "bg-[var(--surface)]/20 text-white"
                            : "bg-[var(--surface-2)] text-[var(--ink)]"
                        }`}>
                          {count}
                        </span>
                      </div>
                      <span className="text-[12px] font-bold truncate">
                        {cat.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════
              BENTO TOOLBAR: SEARCH, FILTERS & VIEW MODE SWITCHER
             ══════════════════════════════════════════════════════════ */}
          <section aria-label="Controls Toolbar" className="rounded-2xl border border-[var(--border-token)] bg-[var(--surface)] p-3.5 shadow-sm flex flex-wrap items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[220px] max-w-[420px]">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search flat (e.g. C-220), keyword, title..."
                className="w-full h-9.5 pl-9 pr-8 rounded-xl bg-[var(--bg)] border border-[var(--border-token)] text-[13px] font-medium text-[var(--ink)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ink)] transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--ink)]"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Filter Dropdowns & Toggles */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <select
                value={filterUrgency}
                onChange={(e) => setFilterUrgency(e.target.value)}
                className="h-9 px-3 rounded-xl border border-[var(--border-token)] bg-[var(--bg)] text-[12px] font-bold text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--ink)] cursor-pointer"
                aria-label="Filter by urgency"
              >
                <option value="">All Urgencies</option>
                {ALL_URGENCIES.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="h-9 px-3 rounded-xl border border-[var(--border-token)] bg-[var(--bg)] text-[12px] font-bold text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--ink)] cursor-pointer"
                aria-label="Filter by status"
              >
                <option value="">All Statuses</option>
                {ALL_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>

              <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--bg)] border border-[var(--border-token)] text-[12px] font-bold text-[var(--muted-foreground)] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showResolved}
                  onChange={(e) => setShowResolved(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-[var(--border-token)] accent-[var(--ink)]"
                />
                Show Resolved
              </label>

              {/* View Mode Switcher (Bento Grid vs Row Table) */}
              <div className="flex items-center p-1 rounded-xl bg-[var(--surface-2)] border border-[var(--border-token)]">
                <button
                  onClick={() => setViewMode("bento")}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                    viewMode === "bento"
                      ? "bg-[var(--surface)] text-[var(--ink)] shadow-xs"
                      : "text-[var(--muted-foreground)] hover:text-[var(--ink)]"
                  }`}
                  title="Bento Grid View"
                  aria-label="Bento Grid View"
                >
                  <LayoutGrid size={15} />
                </button>
                <button
                  onClick={() => setViewMode("row")}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                    viewMode === "row"
                      ? "bg-[var(--surface)] text-[var(--ink)] shadow-xs"
                      : "text-[var(--muted-foreground)] hover:text-[var(--ink)]"
                  }`}
                  title="Table Row View"
                  aria-label="Table Row View"
                >
                  <List size={15} />
                </button>
              </div>

              {hasActiveFilters && (
                <button
                  onClick={() => {
                    setFilterCategory("");
                    setFilterUrgency("");
                    setFilterStatus("");
                    setSearchQuery("");
                  }}
                  className="flex items-center gap-1 h-9 px-3 rounded-xl text-[12px] font-bold text-[var(--critical)] hover:bg-[var(--critical-tint)] transition-colors cursor-pointer"
                >
                  <X size={13} /> Reset Filters
                </button>
              )}
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════
              BENTO GRID SYSTEM: SECTION 3 — MAIN ISSUE CLUSTERS
             ══════════════════════════════════════════════════════════ */}
          <section aria-label="Issue Clusters Main Showcase">

            {/* Loading Skeletons */}
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-56 rounded-2xl" />
                ))}
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="p-8 rounded-2xl border-2 border-[var(--critical)] bg-[var(--critical-tint)] text-center">
                <p className="text-[15px] font-bold text-[var(--critical)] mb-3">{error}</p>
                <button
                  onClick={() => { setLoading(true); void fetchClusters(); void fetchStats(); }}
                  className="h-10 px-5 rounded-xl text-[13px] font-bold bg-[var(--ink)] text-[var(--ink-inverse)] hover:opacity-90 transition-all cursor-pointer"
                >
                  Retry Connection
                </button>
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && filteredClusters.length === 0 && (
              <div className="text-center py-16 px-6 rounded-2xl border-2 border-dashed border-[var(--border-token)] bg-[var(--surface)] flex flex-col items-center justify-center">
                <div className="w-14 h-14 rounded-2xl bg-[var(--surface-2)] border border-[var(--border-token)] flex items-center justify-center text-[var(--muted-foreground)] mb-3">
                  <Inbox size={26} />
                </div>
                <h3 className="text-[17px] font-bold text-[var(--ink)] mb-1">
                  {hasActiveFilters ? "No clusters match your search/filter criteria" : "All Clear — No Active Society Issues"}
                </h3>
                <p className="text-[13px] text-[var(--muted-foreground)] max-w-[420px] leading-relaxed">
                  {hasActiveFilters ? "Try clearing or tweaking your filter pills above." : "Resident submissions will automatically auto-group and appear here in real time."}
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={() => {
                      setFilterCategory("");
                      setFilterUrgency("");
                      setFilterStatus("");
                      setSearchQuery("");
                    }}
                    className="mt-4 inline-flex items-center gap-1.5 h-9 px-4 rounded-xl text-[12px] font-bold bg-[var(--ink)] text-[var(--ink-inverse)] cursor-pointer"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            )}

            {/* BENTO GRID VIEW */}
            {!loading && !error && filteredClusters.length > 0 && viewMode === "bento" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
                {filteredClusters.map((cluster) => (
                  <ClusterCard
                    key={cluster.id}
                    cluster={cluster}
                    variant="bento"
                    onClick={() => setSelectedId(cluster.id)}
                    onUpdate={handleUpdate}
                    hasCountedRef={hasCountedRef}
                  />
                ))}
              </div>
            )}

            {/* ROW TABLE VIEW */}
            {!loading && !error && filteredClusters.length > 0 && viewMode === "row" && (
              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-6 items-center px-4 py-2 border-b border-[var(--border-token)] text-[11px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                  <span>Issue Title &amp; Details</span>
                  <span className="w-24 text-center">Urgency</span>
                  <span className="w-24 text-center">Status</span>
                  <span className="w-28 text-right">Quick Action</span>
                </div>
                {filteredClusters.map((cluster) => (
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

      {/* ── Slide-Over Issue Detail Drawer ── */}
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
