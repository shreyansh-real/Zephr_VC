"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLanguageStore } from "@/lib/language-store";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  getDoc,
  startAfter,
  onSnapshot,
  type DocumentSnapshot,
  doc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  type Complaint,
} from "@/lib/types";
import { UrgencyChip, UrgencyBar } from "./urgency-chip";
import { StatusChip } from "./status-chip";
import { timeAgo } from "@/lib/utils";
import {
  Search,
  Printer,
  ThumbsUp,
  ChevronRight,
  Loader2,
  FileSpreadsheet,
} from "lucide-react";

/** Format a Firestore Timestamp as a readable date string */
function formatDate(ts: { toDate: () => Date } | null | undefined): string {
  if (!ts) return "";
  try {
    const d = ts.toDate();
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export function ComplaintsList({
  filterMyOnly = false,
  onSelectComplaint,
}: {
  filterMyOnly?: boolean;
  onSelectComplaint: (cid: string) => void;
}) {
  const { user, currentSocietyId, currentMember } = useAuth();
  const { t } = useLanguageStore();

  const isStaff = currentMember?.role === "admin" || currentMember?.role === "volunteer";

  const [complaints, setComplaints] = useState<Array<{ id: string; data: Complaint }>>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const PAGE_SIZE = 50; // onSnapshot — no pagination needed for typical society sizes

  useEffect(() => {
    if (!currentSocietyId || !user) return;

    setLoading(true);
    const complaintsCol = collection(db, "societies", currentSocietyId, "complaints");

    // For "My Issues": only filter by createdBy to avoid composite index requirements.
    // Additional filters (status/category/priority) are applied client-side.
    // For "All Issues": apply server-side filters normally.
    const constraints: unknown[] = [];

    if (filterMyOnly) {
      // Only the createdBy filter + orderBy — no composite index needed
      constraints.push(where("createdBy", "==", user.uid));
      constraints.push(orderBy("createdAt", "desc"));
    } else {
      if (statusFilter !== "all") {
        constraints.push(where("status", "==", statusFilter));
      }
      if (categoryFilter !== "all") {
        constraints.push(where("category", "==", categoryFilter));
      }
      if (priorityFilter !== "all") {
        constraints.push(where("priority", "==", priorityFilter));
      }
      constraints.push(orderBy("createdAt", "desc"));
      constraints.push(limit(PAGE_SIZE));
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const q = query(complaintsCol, ...(constraints as any));

    const unsub = onSnapshot(
      q,
      (snap) => {
        const list: Array<{ id: string; data: Complaint }> = [];
        snap.forEach((d) => list.push({ id: d.id, data: d.data() as Complaint }));
        setComplaints(list);
        setLoading(false);
        // Keep hasMore/lastDoc for the non-realtime load-more path (public tab only)
        setLastDoc(snap.docs[snap.docs.length - 1] || null);
        setHasMore(!filterMyOnly && snap.docs.length === PAGE_SIZE);
      },
      (err) => {
        console.error("Complaints snapshot error:", err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [currentSocietyId, filterMyOnly, user, statusFilter, categoryFilter, priorityFilter]);

  const handleLoadMore = async () => {
    if (!currentSocietyId || !lastDoc) return;
    setLoadingMore(true);

    try {
      const complaintsCol = collection(db, "societies", currentSocietyId, "complaints");
      const constraints: unknown[] = [];

      if (filterMyOnly && user) {
        constraints.push(where("createdBy", "==", user.uid));
      }
      if (statusFilter !== "all") {
        constraints.push(where("status", "==", statusFilter));
      }
      if (categoryFilter !== "all") {
        constraints.push(where("category", "==", categoryFilter));
      }
      if (priorityFilter !== "all") {
        constraints.push(where("priority", "==", priorityFilter));
      }

      constraints.push(orderBy("createdAt", "desc"));
      constraints.push(limit(PAGE_SIZE));
      constraints.push(startAfter(lastDoc));

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const q = query(complaintsCol, ...(constraints as any));
      const snap = await getDocs(q);

      const list: Array<{ id: string; data: Complaint }> = [];
      snap.forEach((d) => {
        list.push({ id: d.id, data: d.data() as Complaint });
      });

      setComplaints((prev) => [...prev, ...list]);
      setLastDoc(snap.docs[snap.docs.length - 1] || null);
      setHasMore(snap.docs.length === PAGE_SIZE);
    } catch (err) {
      console.error("Load more complaints error:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  // Client-side filtering: search always; status/category/priority also applied when filterMyOnly
  // (those filters are skipped server-side for "My Issues" to avoid composite index requirements)
  const filteredComplaints = complaints.filter(({ data }) => {
    if (filterMyOnly) {
      if (statusFilter !== "all" && data.status !== statusFilter) return false;
      if (categoryFilter !== "all" && data.category !== categoryFilter) return false;
      if (priorityFilter !== "all" && data.priority !== priorityFilter) return false;
    }
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      data.title.toLowerCase().includes(q) ||
      data.description.toLowerCase().includes(q) ||
      (data.unitId && data.unitId.toLowerCase().includes(q))
    );
  });

  // Export CSV
  const handleExportCsv = () => {
    if (filteredComplaints.length === 0) return;

    const headers = ["Title", "Category", "Priority", "Status", "Unit", "Upvotes", "Date"];
    const rows = filteredComplaints.map(({ data }) => [
      `"${data.title.replace(/"/g, '""')}"`,
      `"${data.category}"`,
      `"${data.priority}"`,
      `"${data.status}"`,
      `"${data.unitId || ""}"`,
      data.upvoteCount || 0,
      data.createdAt ? new Date(data.createdAt.toDate()).toISOString().slice(0, 10) : "",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `SocietyDesk_Complaints_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Track which complaint IDs the current user has already upvoted (client-side cache)
  const [upvotedIds, setUpvotedIds] = useState<Set<string>>(new Set());

  // Upvote inline — enforces 1 vote per user by checking the upvotes subcollection
  const handleQuickUpvote = async (e: React.MouseEvent, complaintId: string) => {
    e.stopPropagation();
    if (!user || !currentSocietyId) return;
    if (upvotedIds.has(complaintId)) return; // already voted (client cache)

    try {
      const upvoteRef = doc(db, "societies", currentSocietyId, "complaints", complaintId, "upvotes", user.uid);
      // Check server-side if already voted
      const existing = await getDoc(upvoteRef);
      if (existing.exists()) {
        setUpvotedIds((prev) => new Set([...prev, complaintId]));
        return;
      }

      await runTransaction(db, async (tx) => {
        const cRef = doc(db, "societies", currentSocietyId, "complaints", complaintId);
        const currentSnap = await tx.get(cRef);
        if (!currentSnap.exists()) return;

        const currentCount = (currentSnap.data() as Complaint).upvoteCount || 0;

        tx.set(upvoteRef, {
          createdAt: serverTimestamp(),
        });

        tx.update(cRef, {
          upvoteCount: currentCount + 1,
          updatedAt: serverTimestamp(),
        });
      });

      setUpvotedIds((prev) => new Set([...prev, complaintId]));
      // Update local state
      setComplaints((prev) =>
        prev.map((c) =>
          c.id === complaintId
            ? { ...c, data: { ...c.data, upvoteCount: (c.data.upvoteCount || 0) + 1 } }
            : c
        )
      );
    } catch (err) {
      console.error("Upvote error:", err);
    }
  };

  const openCount = filteredComplaints.filter((c) => c.data.status === "open").length;

  return (
    <div className="w-full max-w-4xl mx-auto py-6">
      {/* Hero Stats (Design.md: big condensed numeral) */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 pb-6 border-b border-[var(--border-token)]">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
            {filterMyOnly ? "Your Issues" : "Active Society Noticeboard"}
          </span>
          <div className="flex items-baseline gap-3 mt-1">
            <span className="text-6xl sm:text-7xl font-black font-display tracking-tight text-[var(--ink)] tabular-nums">
              {openCount}
            </span>
            <span className="text-xl sm:text-2xl font-bold font-display text-[var(--muted)]">
              open issues requiring attention
            </span>
          </div>
        </div>

        {/* CSV & Print Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCsv}
            className="h-10 px-3.5 rounded-md border border-[var(--border-token)] hover:border-[var(--border-strong)] bg-[var(--surface)] text-xs font-bold text-[var(--ink)] flex items-center gap-1.5 transition-colors min-h-[44px]"
            title="Download CSV report"
          >
            <FileSpreadsheet className="w-4 h-4 text-[var(--muted)]" />
            <span>{t.common.exportCsv}</span>
          </button>

          {/* Print button visible only to admins and volunteers */}
          {isStaff && (
            <button
              type="button"
              onClick={() => window.print()}
              className="h-10 px-3.5 rounded-md border border-[var(--border-token)] hover:border-[var(--border-strong)] bg-[var(--surface)] text-xs font-bold text-[var(--ink)] flex items-center gap-1.5 transition-colors min-h-[44px]"
              title="Print noticeboard view"
            >
              <Printer className="w-4 h-4 text-[var(--muted)]" />
              <span className="hidden sm:inline">{t.common.printSummary}</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-[var(--surface)] p-3.5 rounded-lg border border-[var(--border-token)] mb-6 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3.5 text-[var(--muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.common.search}
            className="w-full h-11 pl-9 pr-3 rounded-md border border-[var(--border-token)] bg-[var(--surface)] text-sm font-medium text-[var(--ink)] focus:border-[var(--border-strong)] transition-colors"
          />
        </div>

           {/* Filter Dropdowns */}
         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {/* Status Filter */}
          <div>
            <label className="block text-[11px] font-bold uppercase text-[var(--muted)] mb-1">
              {t.common.status}
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-10 px-2.5 rounded-md border border-[var(--border-token)] bg-[var(--surface-2)] text-xs font-bold text-[var(--ink)]"
            >
              <option value="all">{t.common.all} Statuses</option>
              <option value="open">{t.statuses.open}</option>
              <option value="acknowledged">{t.statuses.acknowledged}</option>
              <option value="in_progress">{t.statuses.in_progress}</option>
              <option value="resolved">{t.statuses.resolved}</option>
              <option value="closed">{t.statuses.closed}</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-[11px] font-bold uppercase text-[var(--muted)] mb-1">
              {t.complaints.category}
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full h-10 px-2.5 rounded-md border border-[var(--border-token)] bg-[var(--surface-2)] text-xs font-bold text-[var(--ink)]"
            >
              <option value="all">{t.common.all} Categories</option>
              <option value="water">{t.categories.water}</option>
              <option value="electricity">{t.categories.electricity}</option>
              <option value="lift">{t.categories.lift}</option>
              <option value="security">{t.categories.security}</option>
              <option value="cleanliness">{t.categories.cleanliness}</option>
              <option value="parking">{t.categories.parking}</option>
              <option value="noise">{t.categories.noise}</option>
              <option value="other">{t.categories.other}</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-[11px] font-bold uppercase text-[var(--muted)] mb-1">
              {t.complaints.priority}
            </label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full h-10 px-2.5 rounded-md border border-[var(--border-token)] bg-[var(--surface-2)] text-xs font-bold text-[var(--ink)]"
            >
              <option value="all">{t.common.all} Priorities</option>
              <option value="critical">{t.priorities.critical}</option>
              <option value="high">{t.priorities.high}</option>
              <option value="medium">{t.priorities.medium}</option>
              <option value="low">{t.priorities.low}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Complaints List */}
      {loading ? (
        <div className="py-20 text-center text-sm font-semibold text-[var(--muted)]">
          <Loader2 className="w-7 h-7 animate-spin mx-auto mb-2 text-[var(--ink)]" />
          <span>{t.common.loading}</span>
        </div>
      ) : filteredComplaints.length === 0 ? (
        <div className="p-12 text-center bg-[var(--surface)] border border-[var(--border-token)] rounded-lg">
          <p className="font-bold text-base text-[var(--ink)]">{t.complaints.noComplaints}</p>
          <p className="text-xs text-[var(--muted)] mt-1">Try resetting filters or post a new complaint.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredComplaints.map(({ id, data }) => (
            <div
              key={id}
              onClick={() => onSelectComplaint(id)}
              className="group bg-[var(--surface)] border border-[var(--border-token)] hover:border-[var(--border-strong)] rounded-lg overflow-hidden transition-all flex cursor-pointer shadow-xs hover:shadow-sm"
            >
              <UrgencyBar level={data.priority} />

              <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <UrgencyChip level={data.priority} />
                      <StatusChip status={data.status} />
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[var(--surface-2)] text-[var(--ink)] border border-[var(--border-token)]">
                        {t.categories[data.category]}
                      </span>
                    </div>

                    <div className="flex flex-col items-end gap-0.5">
                      <span className="text-sm font-semibold text-[var(--ink)] tabular-nums">
                        {formatDate(data.createdAt)}
                      </span>
                      <span className="text-xs text-[var(--muted)] tabular-nums">
                        {timeAgo(data.createdAt)}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold font-display text-[var(--ink)] tracking-tight group-hover:underline">
                    {data.title}
                  </h3>

                  <p className="text-sm text-[var(--muted)] line-clamp-2 mt-1">
                    {data.description}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--border-token)] text-xs text-[var(--muted)]">
                  <span>
                    Unit: <strong className="text-[var(--ink)]">{data.unitId || "General"}</strong>
                  </span>

                  <div className="flex items-center gap-3">
                    {data.photos && data.photos.length > 0 && (
                      <span>{data.photos.length} photos</span>
                    )}

                    {data.visibility === "public" && (
                      <button
                        type="button"
                        onClick={(e) => handleQuickUpvote(e, id)}
                        disabled={upvotedIds.has(id)}
                        className={`px-2 py-1 rounded border font-bold flex items-center gap-1 min-h-[30px] transition-colors ${
                          upvotedIds.has(id)
                            ? "bg-[var(--accent-tint)] border-[var(--accent)] text-[var(--accent)] cursor-default"
                            : "bg-[var(--surface-2)] hover:bg-[var(--surface)] border-[var(--border-token)] text-[var(--ink)]"
                        }`}
                        title={upvotedIds.has(id) ? t.complaints.upvoted : t.complaints.upvoteAction}
                      >
                        <ThumbsUp className="w-3 h-3" />
                        <span>{data.upvoteCount || 0}</span>
                      </button>
                    )}

                    <ChevronRight className="w-4 h-4 text-[var(--muted)] group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          ))}

          {hasMore && (
            <div className="text-center pt-4">
              <button
                type="button"
                disabled={loadingMore}
                onClick={handleLoadMore}
                className="h-11 px-6 rounded-md bg-[var(--surface)] border border-[var(--border-token)] hover:border-[var(--border-strong)] text-sm font-bold text-[var(--ink)] flex items-center justify-center gap-2 mx-auto transition-colors disabled:opacity-50 min-h-[44px]"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t.common.loading}</span>
                  </>
                ) : (
                  <span>{t.complaints.loadMore}</span>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
