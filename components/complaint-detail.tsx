"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLanguageStore } from "@/lib/language-store";
import {
  doc,
  collection,
  query,
  orderBy,
  getDocs,
  setDoc,
  updateDoc,
  serverTimestamp,
  runTransaction,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  type Complaint,
  type ComplaintStatus,
  type ComplaintUpdate,
  type Member,
} from "@/lib/types";
import { UrgencyChip, UrgencyBar } from "./urgency-chip";
import { StatusChip } from "./status-chip";
import { timeAgo } from "@/lib/utils";
import {
  ArrowLeft,
  ThumbsUp,
  MessageSquare,
  Send,
  Loader2,
  Lock,
  Globe,
  RotateCcw,
  Sparkles,
  Trash2,
  AlertCircle,
  X,
} from "lucide-react";
import { generateAIReply } from "@/lib/ai-reply";

export function ComplaintDetail({
  complaintId,
  onBack,
  onStatusUpdated,
}: {
  complaintId: string;
  onBack: () => void;
  onStatusUpdated?: () => void;
}) {
  const { user, currentSocietyId, currentMember } = useAuth();
  const { t } = useLanguageStore();

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [updates, setUpdates] = useState<Array<{ id: string; update: ComplaintUpdate }>>([]);
  const [members, setMembers] = useState<Record<string, string>>({});
  const [volunteers, setVolunteers] = useState<Array<{ id: string; name: string }>>([]);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submittingUpdate, setSubmittingUpdate] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [updateMessage, setUpdateMessage] = useState("");
  const [newStatus, setNewStatus] = useState<ComplaintStatus>("open");
  const [selectedAssignee, setSelectedAssignee] = useState<string>("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isStaff = currentMember?.role === "admin" || currentMember?.role === "volunteer";
  const isCreator = user && complaint && complaint.createdBy === user.uid;

  const refreshData = useCallback(async () => {
    if (!currentSocietyId || !complaintId) return;
    try {
      const cSnap = await getDoc(doc(db, "societies", currentSocietyId, "complaints", complaintId));
      if (!cSnap.exists()) return;
      const cData = cSnap.data() as Complaint;
      setComplaint(cData);
      setNewStatus(cData.status);
      setSelectedAssignee(cData.assignedTo || "");

      const updatesSnap = await getDocs(
        query(
          collection(db, "societies", currentSocietyId, "complaints", complaintId, "updates"),
          orderBy("createdAt", "asc")
        )
      );
      const updatesList: Array<{ id: string; update: ComplaintUpdate }> = [];
      updatesSnap.forEach((d) => {
        updatesList.push({ id: d.id, update: d.data() as ComplaintUpdate });
      });
      setUpdates(updatesList);

      if (user) {
        const upvoteDoc = await getDoc(
          doc(db, "societies", currentSocietyId, "complaints", complaintId, "upvotes", user.uid)
        );
        setHasUpvoted(upvoteDoc.exists());
      }
    } catch (err) {
      console.error("Error refreshing complaint detail:", err);
    }
  }, [currentSocietyId, complaintId, user]);

  useEffect(() => {
    let active = true;
    if (!currentSocietyId || !complaintId) return;

    (async () => {
      try {
        const cSnap = await getDoc(doc(db, "societies", currentSocietyId, "complaints", complaintId));
        if (!active || !cSnap.exists()) return;
        const cData = cSnap.data() as Complaint;
        setComplaint(cData);
        setNewStatus(cData.status);
        setSelectedAssignee(cData.assignedTo || "");

        const updatesSnap = await getDocs(
          query(
            collection(db, "societies", currentSocietyId, "complaints", complaintId, "updates"),
            orderBy("createdAt", "asc")
          )
        );
        if (!active) return;
        const updatesList: Array<{ id: string; update: ComplaintUpdate }> = [];
        updatesSnap.forEach((d) => {
          updatesList.push({ id: d.id, update: d.data() as ComplaintUpdate });
        });
        setUpdates(updatesList);

        if (user) {
          const upvoteDoc = await getDoc(
            doc(db, "societies", currentSocietyId, "complaints", complaintId, "upvotes", user.uid)
          );
          if (active) {
            setHasUpvoted(upvoteDoc.exists());
          }
        }

        if (currentMember?.role === "admin" || currentMember?.role === "volunteer") {
          const memSnap = await getDocs(collection(db, "societies", currentSocietyId, "members"));
          if (!active) return;
          const namesMap: Record<string, string> = {};
          const staffList: Array<{ id: string; name: string }> = [];

          memSnap.forEach((d) => {
            const m = d.data() as Member;
            namesMap[d.id] = m.name;
            if (m.role === "admin" || m.role === "volunteer") {
              staffList.push({ id: d.id, name: `${m.name} (${m.role})` });
            }
          });

          setMembers(namesMap);
          setVolunteers(staffList);
        }
      } catch (err) {
        console.error("Error loading complaint detail:", err);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [currentSocietyId, complaintId, user, currentMember]);

  // Handle Upvote
  const handleUpvote = async () => {
    if (!user || !currentSocietyId || !complaint || hasUpvoted) return;

    try {
      await runTransaction(db, async (tx) => {
        const cRef = doc(db, "societies", currentSocietyId, "complaints", complaintId);
        const upvoteRef = doc(db, "societies", currentSocietyId, "complaints", complaintId, "upvotes", user.uid);

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

      setHasUpvoted(true);
      setComplaint((prev) => (prev ? { ...prev, upvoteCount: (prev.upvoteCount || 0) + 1 } : null));
    } catch (err) {
      console.error("Upvote error:", err);
    }
  };

  // Post update & change status / assignee
  const handlePostUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !currentSocietyId || !updateMessage.trim()) return;

    setSubmittingUpdate(true);
    try {
      const cRef = doc(db, "societies", currentSocietyId, "complaints", complaintId);
      const updateRef = doc(collection(db, "societies", currentSocietyId, "complaints", complaintId, "updates"));

      const isStatusChanged = isStaff && newStatus !== complaint?.status;
      const isAssigneeChanged = isStaff && (selectedAssignee || null) !== complaint?.assignedTo;

      await setDoc(updateRef, {
        message: updateMessage.trim(),
        by: user.uid,
        statusChange: isStatusChanged ? newStatus : null,
        createdAt: serverTimestamp(),
      });

      if (isStaff && (isStatusChanged || isAssigneeChanged)) {
        await updateDoc(cRef, {
          ...(isStatusChanged ? { status: newStatus } : {}),
          ...(isAssigneeChanged ? { assignedTo: selectedAssignee || null } : {}),
          updatedAt: serverTimestamp(),
        });
      }

      setUpdateMessage("");
      await refreshData();
      onStatusUpdated?.();
    } catch (err) {
      console.error("Update post error:", err);
    } finally {
      setSubmittingUpdate(false);
    }
  };

  // Generate AI reply (staff only)
  const handleAIReply = async () => {
    if (!complaint || !isStaff) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const reply = await generateAIReply({
        complaintTitle: complaint.title,
        complaintDescription: complaint.description,
        complaintCategory: complaint.category,
        complaintPriority: complaint.priority,
        complaintStatus: complaint.status,
        previousUpdates: updates.map((u) => u.update.message),
        staffRole: currentMember?.role || "staff",
        societyName: undefined,
      });
      setUpdateMessage(reply);
    } catch (err: unknown) {
      setAiError(err instanceof Error ? err.message : "AI generation failed.");
    } finally {
      setAiLoading(false);
    }
  };

  // Reopen resolved complaint (Resident feature)
  const handleReopen = async () => {
    if (!currentSocietyId || !complaintId || !isCreator || !user) return;
    try {
      const cRef = doc(db, "societies", currentSocietyId, "complaints", complaintId);
      const updateRef = doc(collection(db, "societies", currentSocietyId, "complaints", complaintId, "updates"));

      await setDoc(updateRef, {
        message: "Issue was reopened by resident.",
        by: user.uid,
        statusChange: "open",
        createdAt: serverTimestamp(),
      });

      await updateDoc(cRef, {
        status: "open",
        updatedAt: serverTimestamp(),
      });

      await refreshData();
      onStatusUpdated?.();
    } catch (err) {
      console.error("Reopen error:", err);
    }
  };

  // Delete complaint (Creator only)
  const handleDeleteComplaint = async () => {
    if (!currentSocietyId || !complaintId || !isCreator) return;
    setDeleting(true);
    try {
      // Delete all updates subcollection documents first
      const updatesSnap = await getDocs(
        collection(db, "societies", currentSocietyId, "complaints", complaintId, "updates")
      );
      for (const updateDoc of updatesSnap.docs) {
        await deleteDoc(updateDoc.ref);
      }

      // Delete all upvotes subcollection documents
      const upvotesSnap = await getDocs(
        collection(db, "societies", currentSocietyId, "complaints", complaintId, "upvotes")
      );
      for (const upvoteDoc of upvotesSnap.docs) {
        await deleteDoc(upvoteDoc.ref);
      }

      // Delete the complaint document itself
      await deleteDoc(doc(db, "societies", currentSocietyId, "complaints", complaintId));

      setDeleteModalOpen(false);
      onBack(); // Go back to list after deletion
      onStatusUpdated?.();
    } catch (err) {
      console.error("Delete complaint error:", err);
    } finally {
      setDeleting(false);
    }
  };

  if (loading || !complaint) {
    return (
      <div className="py-20 text-center text-sm font-semibold text-[var(--muted)]">
        <Loader2 className="w-7 h-7 animate-spin mx-auto mb-2 text-[var(--ink)]" />
        <span>{t.common.loading}</span>
      </div>
    );
  }

  return (
    <div className="w-full py-8">
      {/* Back button */}
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 mb-6 px-4 py-2 text-sm font-bold rounded border border-[var(--border-token)] hover:bg-[var(--surface-2)] text-[var(--ink)] transition-colors min-h-[48px]"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>{t.common.back} to Noticeboard</span>
      </button>

      {/* Main Card */}
      <div className="bg-[var(--surface)] border border-[var(--border-token)] rounded-lg overflow-hidden shadow-xs">
        <div className="flex">
          <UrgencyBar level={complaint.priority} />
          <div className="flex-1 p-8 lg:p-10">
            {/* Header badges */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex flex-wrap items-center gap-3">
                <UrgencyChip level={complaint.priority} />
                <StatusChip status={complaint.status} />
                <span className="px-3 py-1 rounded text-sm font-semibold bg-[var(--surface-2)] text-[var(--ink)] border border-[var(--border-token)]">
                  {t.categories[complaint.category]}
                </span>
                <span className="inline-flex items-center gap-1 text-sm text-[var(--muted)]">
                  {complaint.visibility === "public" ? (
                    <Globe className="w-4 h-4" />
                  ) : (
                    <Lock className="w-4 h-4" />
                  )}
                  <span>{complaint.visibility}</span>
                </span>
              </div>

              {/* Upvote button for public issues */}
              {complaint.visibility === "public" && (
                <button
                  type="button"
                  disabled={hasUpvoted}
                  onClick={handleUpvote}
                  className={`h-12 px-5 rounded-md border text-sm font-bold flex items-center gap-2 transition-all min-h-[48px] ${
                    hasUpvoted
                      ? "bg-[var(--surface-2)] border-[var(--border-strong)] text-[var(--ink)] cursor-default"
                      : "border-[var(--border-token)] hover:border-[var(--border-strong)] bg-[var(--surface)] text-[var(--ink)]"
                  }`}
                >
                  <ThumbsUp className={`w-4 h-4 ${hasUpvoted ? "fill-current" : ""}`} />
                  <span>
                    {hasUpvoted ? t.complaints.upvoted : t.complaints.upvoteAction} (
                    {complaint.upvoteCount || 0})
                  </span>
                </button>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl font-black font-display tracking-tight text-[var(--ink)] mb-4">
              {complaint.title}
            </h1>

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-sm text-[var(--muted)] mb-8 pb-6 border-b border-[var(--border-token)]">
              <span>
                Unit: <strong className="text-[var(--ink)]">{complaint.unitId || "General"}</strong>
              </span>
              <span>•</span>
              <span>{timeAgo(complaint.createdAt)}</span>
              {complaint.assignedTo && (
                <>
                  <span>•</span>
                  <span>
                    Assigned:{" "}
                    <strong className="text-[var(--ink)]">
                      {members[complaint.assignedTo] || "Volunteer"}
                    </strong>
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            <div className="prose text-lg text-[var(--ink)] leading-relaxed mb-8 whitespace-pre-wrap">
              {complaint.description}
            </div>

            {/* Attached Photos */}
            {complaint.photos && complaint.photos.length > 0 && (
              <div className="mb-6">
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-2">
                  Attached Photos ({complaint.photos.length})
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {complaint.photos.map((url, i) => (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block aspect-video rounded-md overflow-hidden border border-[var(--border-token)] bg-[var(--surface-2)] hover:opacity-95 transition-opacity"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Resident Reopen Button + Delete Button */}
            {isCreator && (complaint.status === "resolved" || complaint.status === "closed") && (
              <div className="p-4 rounded-md bg-[var(--surface-2)] border border-[var(--border-token)] flex items-center justify-between gap-4 mb-6">
                <div className="text-xs text-[var(--muted)]">
                  Issue marked as {complaint.status}. If the problem persists, you can reopen it.
                </div>
                <button
                  type="button"
                  onClick={handleReopen}
                  className="h-9 px-3 rounded-md bg-[var(--ink)] text-[var(--ink-inverse)] text-xs font-bold flex items-center gap-1.5 min-h-[44px]"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reopen Issue</span>
                </button>
              </div>
            )}

            {/* Delete Button (Creator only, always visible) */}
            {isCreator && (
              <button
                type="button"
                onClick={() => setDeleteModalOpen(true)}
                className="h-9 px-3.5 rounded-md border border-[#d62f1f] bg-[#fbe3df] text-[#d62f1f] text-xs font-bold flex items-center gap-1.5 min-h-[44px] hover:bg-[#f8d5d0] transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Complaint</span>
              </button>
            )}
          </div>
        </div>

        {/* Timeline / Activity Section */}
        <div className="border-t border-[var(--border-token)] bg-[var(--surface-2)] p-6 sm:p-8">
          <h2 className="text-lg font-black font-display text-[var(--ink)] mb-4 flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            <span>{t.complaints.timeline}</span>
          </h2>

          <div className="space-y-4 mb-6">
            {updates.length === 0 ? (
              <p className="text-xs text-[var(--muted)] italic">No updates posted yet.</p>
            ) : (
              updates.map(({ id, update }) => (
                <div
                  key={id}
                  className="p-3.5 rounded-md bg-[var(--surface)] border border-[var(--border-token)] text-sm space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs text-[var(--muted)]">
                    <span className="font-bold text-[var(--ink)]">
                      {members[update.by] || "Member"}
                    </span>
                    <span>{timeAgo(update.createdAt)}</span>
                  </div>

                  {update.statusChange && (
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-[var(--surface-2)] border border-[var(--border-token)]">
                      <span>Status changed to:</span>
                      <StatusChip status={update.statusChange} />
                    </div>
                  )}

                  <p className="text-[var(--ink)] text-sm whitespace-pre-wrap">{update.message}</p>
                </div>
              ))
            )}
          </div>

          {/* Post Update Form (Staff or Creator) */}
          {(isStaff || isCreator) && (
            <form onSubmit={handlePostUpdate} className="space-y-3 bg-[var(--surface)] p-4 rounded-md border border-[var(--border-token)]">
              <p className="text-xs font-bold text-[var(--ink)] uppercase">
                {isStaff ? "Post Update or Change Status" : "Add Comment"}
              </p>

              {/* Staff Controls: Status & Assignee */}
              {isStaff && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[var(--muted)] mb-1">
                      {t.complaints.statusChange}
                    </label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as ComplaintStatus)}
                      className="w-full h-10 px-2.5 rounded border border-[var(--border-token)] bg-[var(--surface)] text-xs font-bold text-[var(--ink)]"
                    >
                      <option value="open">{t.statuses.open}</option>
                      <option value="acknowledged">{t.statuses.acknowledged}</option>
                      <option value="in_progress">{t.statuses.in_progress}</option>
                      <option value="resolved">{t.statuses.resolved}</option>
                      <option value="closed">{t.statuses.closed}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--muted)] mb-1">
                      {t.complaints.assigneeChange}
                    </label>
                    <select
                      value={selectedAssignee}
                      onChange={(e) => setSelectedAssignee(e.target.value)}
                      className="w-full h-10 px-2.5 rounded border border-[var(--border-token)] bg-[var(--surface)] text-xs font-bold text-[var(--ink)]"
                    >
                      <option value="">{t.complaints.unassigned}</option>
                      {volunteers.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div>
                {/* AI Reply button — staff only */}
                {isStaff && (
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-[var(--muted)] uppercase">
                      Reply Message
                    </label>
                    <button
                      type="button"
                      onClick={handleAIReply}
                      disabled={aiLoading}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold border border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent-tint)] disabled:opacity-50 transition-colors"
                    >
                      {aiLoading ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Sparkles className="w-3 h-3" />
                      )}
                      {aiLoading ? "Generating…" : "AI Suggest Reply"}
                    </button>
                  </div>
                )}
                {aiError && (
                  <p className="text-xs text-[var(--critical)] mb-1.5">{aiError}</p>
                )}
                <textarea
                  value={updateMessage}
                  onChange={(e) => setUpdateMessage(e.target.value)}
                  placeholder={
                    isStaff
                      ? "Write an update for residents or internal note..."
                      : "Add your comment on this issue..."
                  }
                  rows={3}
                  required
                  className="w-full p-2.5 rounded border border-[var(--border-token)] bg-[var(--surface)] text-sm text-[var(--ink)] focus:border-[var(--border-strong)] resize-y"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submittingUpdate || !updateMessage.trim()}
                  className="h-10 px-4 rounded bg-[var(--ink)] text-[var(--ink-inverse)] text-xs font-bold flex items-center gap-1.5 hover:opacity-90 disabled:opacity-50 min-h-[44px]"
                >
                  {submittingUpdate ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>Post Update</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm mx-4 bg-[var(--surface)] border border-[var(--border-token)] rounded-lg shadow-lg p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[#fbe3df] flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 text-[#d62f1f]" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-[var(--ink)] text-base">Delete Complaint?</h3>
                <p className="text-xs text-[var(--muted)] mt-1">
                  This action cannot be undone. The complaint and all updates will be permanently deleted.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="p-1 text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                disabled={deleting}
                className="h-9 px-4 rounded-md border border-[var(--border-token)] hover:bg-[var(--surface-2)] text-[var(--ink)] text-xs font-bold disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteComplaint}
                disabled={deleting}
                className="h-9 px-4 rounded-md bg-[#d62f1f] text-white text-xs font-bold flex items-center gap-1.5 hover:opacity-90 disabled:opacity-50 transition-colors"
              >
                {deleting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
