"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLanguageStore } from "@/lib/language-store";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  setDoc,
  addDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { type Member, type UserRole, type Unit } from "@/lib/types";
import { generateInviteCode } from "@/lib/utils";
import {
  Users,
  Clock,
  Check,
  X,
  Copy,
  Building,
  Plus,
  Loader2,
  CheckCircle2,
  RotateCw,
  Trash2,
  Megaphone,
  Pin,
} from "lucide-react";

export function AdminPanel() {
  const { currentSocietyId, currentSociety, currentMember } = useAuth();
  const { t } = useLanguageStore();

  const [activeTab, setActiveTab] = useState<"pending" | "members" | "units" | "notices">("pending");
  const [members, setMembers] = useState<Array<{ id: string; member: Member }>>([]);
  const [units, setUnits] = useState<Array<{ id: string; unit: Unit }>>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // New unit form
  const [newUnitLabel, setNewUnitLabel] = useState("");
  const [newUnitGroup, setNewUnitGroup] = useState("");
  const [newUnitType, setNewUnitType] = useState<"flat" | "room" | "shop" | "chawl">("flat");

  const isAdmin = currentMember?.role === "admin";

  const refreshData = useCallback(async () => {
    if (!currentSocietyId) return;
    try {
      const memSnap = await getDocs(collection(db, "societies", currentSocietyId, "members"));
      const memList: Array<{ id: string; member: Member }> = [];
      memSnap.forEach((d) => {
        memList.push({ id: d.id, member: d.data() as Member });
      });
      setMembers(memList);

      const unitsSnap = await getDocs(collection(db, "societies", currentSocietyId, "units"));
      const unitList: Array<{ id: string; unit: Unit }> = [];
      unitsSnap.forEach((d) => {
        unitList.push({ id: d.id, unit: d.data() as Unit });
      });
      setUnits(unitList);
    } catch (err) {
      console.error("Error refreshing admin data:", err);
    }
  }, [currentSocietyId]);

  useEffect(() => {
    let active = true;
    if (!currentSocietyId) return;

    (async () => {
      try {
        const memSnap = await getDocs(collection(db, "societies", currentSocietyId, "members"));
        if (!active) return;
        const memList: Array<{ id: string; member: Member }> = [];
        memSnap.forEach((d) => {
          memList.push({ id: d.id, member: d.data() as Member });
        });
        setMembers(memList);

        const unitsSnap = await getDocs(collection(db, "societies", currentSocietyId, "units"));
        if (!active) return;
        const unitList: Array<{ id: string; unit: Unit }> = [];
        unitsSnap.forEach((d) => {
          unitList.push({ id: d.id, unit: d.data() as Unit });
        });
        setUnits(unitList);
      } catch (err) {
        console.error("Error fetching admin data:", err);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [currentSocietyId]);

  // Approve pending member
  const handleApprove = async (memberId: string) => {
    if (!currentSocietyId) return;
    setActionLoading(memberId);
    try {
      await updateDoc(doc(db, "societies", currentSocietyId, "members", memberId), {
        status: "active",
      });
      setMessage("Member approved successfully");
      await refreshData();
    } catch (err) {
      console.error("Approve error:", err);
    } finally {
      setActionLoading(null);
    }
  };

  // Reject / Remove member
  const handleReject = async (memberId: string) => {
    if (!currentSocietyId) return;
    setActionLoading(memberId);
    try {
      await updateDoc(doc(db, "societies", currentSocietyId, "members", memberId), {
        status: "removed",
      });
      setMessage("Member declined / removed");
      await refreshData();
    } catch (err) {
      console.error("Reject error:", err);
    } finally {
      setActionLoading(null);
    }
  };

  // Change member role
  const handleChangeRole = async (memberId: string, newRole: UserRole) => {
    if (!currentSocietyId || !isAdmin) return;
    setActionLoading(memberId);
    try {
      await updateDoc(doc(db, "societies", currentSocietyId, "members", memberId), {
        role: newRole,
      });
      setMessage(`Role updated to ${newRole}`);
      await refreshData();
    } catch (err) {
      console.error("Role update error:", err);
    } finally {
      setActionLoading(null);
    }
  };

  // Regenerate Invite Code (Admin only)
  const handleRegenerateCode = async () => {
    if (!currentSocietyId || !isAdmin || !currentSociety) return;
    setActionLoading("code");
    try {
      const newCode = generateInviteCode(8);
      await setDoc(doc(db, "inviteCodes", newCode), {
        societyId: currentSocietyId,
      });
      await updateDoc(doc(db, "societies", currentSocietyId), {
        inviteCode: newCode,
      });
      setMessage("New invite code generated");
      window.location.reload();
    } catch (err) {
      console.error("Regenerate code error:", err);
    } finally {
      setActionLoading(null);
    }
  };

  // Add unit
  const handleAddUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSocietyId || !isAdmin || !newUnitLabel.trim()) return;

    setActionLoading("unit");
    try {
      const uRef = doc(collection(db, "societies", currentSocietyId, "units"));
      await setDoc(uRef, {
        label: newUnitLabel.trim(),
        group: newUnitGroup.trim() || "General",
        type: newUnitType,
      });
      setNewUnitLabel("");
      setNewUnitGroup("");
      setMessage("Unit added successfully");
      await refreshData();
    } catch (err) {
      console.error("Add unit error:", err);
    } finally {
      setActionLoading(null);
    }
  };

  // Remove unit
  const handleRemoveUnit = async (unitId: string) => {
    if (!currentSocietyId || !isAdmin) return;
    if (!confirm("Remove this unit? Members assigned to it will need to be reassigned.")) return;
    setActionLoading("unit-" + unitId);
    try {
      await deleteDoc(doc(db, "societies", currentSocietyId, "units", unitId));
      setMessage("Unit removed");
      await refreshData();
    } catch (err) {
      console.error("Remove unit error:", err);
    } finally {
      setActionLoading(null);
    }
  };

  // Notice composer state
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeBody, setNoticeBody] = useState("");
  const [noticePinned, setNoticePinned] = useState(false);
  const [notices, setNotices] = useState<Array<{ id: string; title: string; pinned: boolean; postedByName: string }>>([]);
  const [noticeLoading, setNoticeLoading] = useState(false);

  const fetchNotices = useCallback(async () => {
    if (!currentSocietyId) return;
    try {
      const snap = await getDocs(collection(db, "societies", currentSocietyId, "notices"));
      const list: Array<{ id: string; title: string; pinned: boolean; postedByName: string }> = [];
      snap.forEach((d) => {
        const data = d.data();
        list.push({ id: d.id, title: data.title, pinned: data.pinned, postedByName: data.postedByName });
      });
      list.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
      setNotices(list);
    } catch (err) {
      console.error("Notices fetch error:", err);
    }
  }, [currentSocietyId]);

  useEffect(() => {
    if (activeTab === "notices") fetchNotices();
  }, [activeTab, fetchNotices]);

  const handlePostNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSocietyId || !currentMember || !noticeTitle.trim() || !noticeBody.trim()) return;
    setNoticeLoading(true);
    try {
      await addDoc(collection(db, "societies", currentSocietyId, "notices"), {
        title: noticeTitle.trim(),
        body: noticeBody.trim(),
        pinned: noticePinned,
        postedBy: currentMember.email || "",
        postedByName: currentMember.name,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setNoticeTitle("");
      setNoticeBody("");
      setNoticePinned(false);
      setMessage("Notice posted successfully");
      await fetchNotices();
    } catch (err) {
      console.error("Post notice error:", err);
    } finally {
      setNoticeLoading(false);
    }
  };

  const handleDeleteNotice = async (noticeId: string) => {
    if (!currentSocietyId) return;
    if (!confirm("Delete this notice?")) return;
    try {
      await deleteDoc(doc(db, "societies", currentSocietyId, "notices", noticeId));
      setMessage("Notice deleted");
      await fetchNotices();
    } catch (err) {
      console.error("Delete notice error:", err);
    }
  };
  const pendingMembers = members.filter((m) => m.member.status === "pending");
  const activeMembers = members.filter((m) => m.member.status === "active");

  return (
    <div className="w-full max-w-4xl mx-auto py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-black font-display tracking-tight text-[var(--ink)]">
            {t.admin.title}
          </h1>
          <p className="text-sm text-[var(--muted)]">{currentSociety?.name}</p>
        </div>

        {/* Invite Code Box */}
        {currentSociety && (
          <div className="p-3 bg-[var(--surface)] border border-[var(--border-token)] rounded-md flex items-center gap-2">
            <div>
              <p className="text-xs font-bold uppercase text-[var(--muted)]">{t.admin.inviteCodeTitle}</p>
              <p className="text-lg font-black tracking-widest font-display text-[var(--ink)]">
                {currentSociety.inviteCode}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(currentSociety.inviteCode);
                setCopiedCode(true);
                setTimeout(() => setCopiedCode(false), 2000);
              }}
              className="h-9 px-3 rounded-md bg-[var(--surface-2)] border border-[var(--border-token)] hover:border-[var(--border-strong)] text-xs font-bold text-[var(--ink)] flex items-center gap-1.5 min-h-[44px]"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? t.common.copied : t.common.copy}</span>
            </button>
            {isAdmin && (
              <button
                type="button"
                onClick={handleRegenerateCode}
                disabled={actionLoading === "code"}
                title="Regenerate invite code"
                className="h-9 w-9 rounded-md bg-[var(--surface-2)] border border-[var(--border-token)] hover:border-[var(--border-strong)] text-[var(--muted)] hover:text-[var(--ink)] flex items-center justify-center min-h-[44px] min-w-[44px]"
              >
                <RotateCw className={`w-3.5 h-3.5 ${actionLoading === "code" ? "animate-spin" : ""}`} />
              </button>
            )}
          </div>
        )}
      </div>

      {message && (
        <div className="mb-4 p-3 rounded-md bg-[var(--surface-2)] border border-[var(--border-strong)] flex items-center justify-between text-sm text-[var(--ink)]">
          <span className="font-semibold">{message}</span>
          <button type="button" onClick={() => setMessage(null)} className="p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Sub Tabs */}
      <div className="flex border-b border-[var(--border-token)] mb-6 space-x-2">
        <button
          type="button"
          onClick={() => setActiveTab("pending")}
          className={`pb-2.5 px-3 text-sm font-bold border-b-2 flex items-center gap-2 ${
            activeTab === "pending"
              ? "border-[var(--ink)] text-[var(--ink)]"
              : "border-transparent text-[var(--muted)] hover:text-[var(--ink)]"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>{t.admin.pendingTab}</span>
          {pendingMembers.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-[var(--critical)] text-[var(--ink-inverse)] text-xs font-black">
              {pendingMembers.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("members")}
          className={`pb-2.5 px-3 text-sm font-bold border-b-2 flex items-center gap-2 ${
            activeTab === "members"
              ? "border-[var(--ink)] text-[var(--ink)]"
              : "border-transparent text-[var(--muted)] hover:text-[var(--ink)]"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>{t.admin.membersTab}</span>
          <span className="px-1.5 py-0.2 rounded-full bg-[var(--surface-2)] text-[var(--ink)] text-xs font-bold">
            {activeMembers.length}
          </span>
        </button>

        {isAdmin && (
          <button
            type="button"
            onClick={() => setActiveTab("units")}
            className={`pb-2.5 px-3 text-sm font-bold border-b-2 flex items-center gap-2 ${
              activeTab === "units"
                ? "border-[var(--ink)] text-[var(--ink)]"
                : "border-transparent text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            <Building className="w-4 h-4" />
            <span>{t.admin.unitsTab}</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setActiveTab("notices")}
          className={`pb-2.5 px-3 text-sm font-bold border-b-2 flex items-center gap-2 ${
            activeTab === "notices"
              ? "border-[var(--ink)] text-[var(--ink)]"
              : "border-transparent text-[var(--muted)] hover:text-[var(--ink)]"
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>Notices</span>
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm font-semibold text-[var(--muted)]">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
          <span>{t.common.loading}</span>
        </div>
      ) : activeTab === "pending" ? (
        /* Pending Members List */
        <div className="space-y-3">
          {pendingMembers.length === 0 ? (
            <div className="p-8 text-center bg-[var(--surface)] border border-[var(--border-token)] rounded-lg">
              <CheckCircle2 className="w-8 h-8 text-[var(--resolved)] mx-auto mb-2" />
              <p className="font-bold text-[var(--ink)]">No pending approval requests</p>
              <p className="text-xs text-[var(--muted)] mt-1">
                New residents who join with the invite code will appear here.
              </p>
            </div>
          ) : (
            pendingMembers.map(({ id, member }) => (
              <div
                key={id}
                className="p-4 bg-[var(--surface)] border border-[var(--border-token)] rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-[var(--ink)]">{member.name}</span>
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-[var(--high-tint)] text-[var(--high)]">
                      Pending
                    </span>
                  </div>
                  <p className="text-xs text-[var(--muted)] mt-0.5">
                    Unit: <strong className="text-[var(--ink)]">{member.unitId || "Not specified"}</strong>
                    {member.phone && ` • Phone: ${member.phone}`}
                    {member.email && ` • Email: ${member.email}`}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={actionLoading === id}
                    onClick={() => handleApprove(id)}
                    className="h-10 px-3.5 rounded-md bg-[var(--ink)] text-[var(--ink-inverse)] text-xs font-bold flex items-center gap-1.5 hover:opacity-90 disabled:opacity-50 min-h-[44px]"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{t.admin.approve}</span>
                  </button>
                  <button
                    type="button"
                    disabled={actionLoading === id}
                    onClick={() => handleReject(id)}
                    className="h-10 px-3.5 rounded-md border border-[var(--border-token)] hover:bg-[var(--surface-2)] text-xs font-bold text-[var(--muted)] hover:text-[var(--ink)] flex items-center gap-1.5 disabled:opacity-50 min-h-[44px]"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>{t.admin.reject}</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : activeTab === "members" ? (
        /* Active Members Directory */
        <div className="space-y-3">
          {activeMembers.map(({ id, member }) => (
            <div
              key={id}
              className="p-4 bg-[var(--surface)] border border-[var(--border-token)] rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base text-[var(--ink)]">{member.name}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-bold border ${
                      member.role === "admin"
                        ? "bg-[var(--high-tint)] text-[var(--high)] border-[var(--high)]"
                        : member.role === "volunteer"
                        ? "bg-[var(--medium-tint)] text-[var(--medium)] border-[var(--medium)]"
                        : "bg-[var(--surface-2)] text-[var(--muted)] border-[var(--border-token)]"
                    }`}
                  >
                    {t.roles[member.role]}
                  </span>
                </div>
                <p className="text-xs text-[var(--muted)] mt-0.5">
                  Unit: {member.unitId || "General"}
                  {member.phone && ` • Phone: ${member.phone}`}
                  {member.email && ` • Email: ${member.email}`}
                </p>
              </div>

              {/* Admin Role Modification */}
              {isAdmin && id !== currentMember?.phone && (
                <div className="flex items-center gap-1.5">
                  {member.role !== "admin" && (
                    <button
                      type="button"
                      disabled={actionLoading === id}
                      onClick={() => handleChangeRole(id, "admin")}
                      className="h-9 px-2.5 rounded border border-[var(--border-token)] hover:border-[var(--border-strong)] text-xs font-bold text-[var(--ink)] min-h-[44px]"
                    >
                      {t.admin.makeAdmin}
                    </button>
                  )}
                  {member.role !== "volunteer" && (
                    <button
                      type="button"
                      disabled={actionLoading === id}
                      onClick={() => handleChangeRole(id, "volunteer")}
                      className="h-9 px-2.5 rounded border border-[var(--border-token)] hover:border-[var(--border-strong)] text-xs font-bold text-[var(--ink)] min-h-[44px]"
                    >
                      {t.admin.makeVolunteer}
                    </button>
                  )}
                  {member.role !== "resident" && (
                    <button
                      type="button"
                      disabled={actionLoading === id}
                      onClick={() => handleChangeRole(id, "resident")}
                      className="h-9 px-2.5 rounded border border-[var(--border-token)] hover:border-[var(--border-strong)] text-xs font-bold text-[var(--ink)] min-h-[44px]"
                    >
                      {t.admin.makeResident}
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={actionLoading === id}
                    onClick={() => handleReject(id)}
                    className="h-9 px-2.5 rounded border border-[var(--border-token)] hover:bg-[var(--surface-2)] text-xs font-bold text-[var(--critical)] min-h-[44px]"
                  >
                    {t.admin.removeMember}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : activeTab === "units" ? (
        /* Units Directory */
        <div className="space-y-6">
          <form
            onSubmit={handleAddUnit}
            className="p-4 bg-[var(--surface)] border border-[var(--border-token)] rounded-lg space-y-3"
          >
            <h3 className="text-base font-bold text-[var(--ink)]">{t.admin.addUnit}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-[var(--muted)] mb-1">
                  {t.admin.unitLabel}
                </label>
                <input
                  type="text"
                  value={newUnitLabel}
                  onChange={(e) => setNewUnitLabel(e.target.value)}
                  placeholder="e.g. 402 or Shop 3"
                  required
                  className="w-full h-10 px-3 rounded border border-[var(--border-token)] bg-[var(--surface)] text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--muted)] mb-1">
                  {t.admin.unitGroup}
                </label>
                <input
                  type="text"
                  value={newUnitGroup}
                  onChange={(e) => setNewUnitGroup(e.target.value)}
                  placeholder="e.g. Wing B"
                  className="w-full h-10 px-3 rounded border border-[var(--border-token)] bg-[var(--surface)] text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--muted)] mb-1">
                  {t.admin.unitType}
                </label>
                <select
                  value={newUnitType}
                  onChange={(e) => setNewUnitType(e.target.value as "flat")}
                  className="w-full h-10 px-3 rounded border border-[var(--border-token)] bg-[var(--surface)] text-sm font-medium"
                >
                  <option value="flat">Flat</option>
                  <option value="room">Room</option>
                  <option value="shop">Shop</option>
                  <option value="chawl">Chawl</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={actionLoading === "unit"}
              className="h-10 px-4 rounded bg-[var(--ink)] text-[var(--ink-inverse)] text-xs font-bold flex items-center gap-1.5 min-h-[44px]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.admin.addUnit}</span>
            </button>
          </form>

          {/* Units list */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {units.map(({ id, unit }) => (
              <div
                key={id}
                className="p-3 bg-[var(--surface)] border border-[var(--border-token)] rounded-md text-sm flex flex-col gap-2"
              >
                <div>
                  <p className="font-bold text-[var(--ink)]">{unit.label}</p>
                  <p className="text-xs text-[var(--muted)]">
                    {unit.group} • {unit.type}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={actionLoading === "unit-" + id}
                  onClick={() => handleRemoveUnit(id)}
                  className="mt-auto flex items-center gap-1 text-[10px] font-bold text-[var(--critical)] hover:opacity-80 disabled:opacity-40"
                >
                  <Trash2 className="w-3 h-3" />
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Notices Tab */
        <div className="space-y-6">
          {/* Post new notice */}
          <form
            onSubmit={handlePostNotice}
            className="p-4 bg-[var(--surface)] border border-[var(--border-token)] rounded-lg space-y-3"
          >
            <h3 className="text-base font-bold text-[var(--ink)]">Post a Notice</h3>
            <div>
              <label className="block text-xs font-bold text-[var(--muted)] mb-1">Title</label>
              <input
                type="text"
                value={noticeTitle}
                onChange={(e) => setNoticeTitle(e.target.value)}
                placeholder="Notice title…"
                required
                maxLength={200}
                className="w-full h-10 px-3 rounded border border-[var(--border-token)] bg-[var(--surface)] text-sm font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--muted)] mb-1">
                Body <span className="font-normal opacity-60">(plain text or basic HTML)</span>
              </label>
              <textarea
                value={noticeBody}
                onChange={(e) => setNoticeBody(e.target.value)}
                placeholder="Write the notice content here…"
                required
                rows={4}
                maxLength={3000}
                className="w-full px-3 py-2 rounded border border-[var(--border-token)] bg-[var(--surface)] text-sm font-medium resize-y"
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={noticePinned}
                onChange={(e) => setNoticePinned(e.target.checked)}
                className="w-4 h-4 accent-[var(--accent)]"
              />
              <Pin className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span className="text-sm font-semibold text-[var(--ink)]">Pin this notice</span>
            </label>
            <button
              type="submit"
              disabled={noticeLoading}
              className="h-10 px-4 rounded bg-[var(--ink)] text-[var(--ink-inverse)] text-xs font-bold flex items-center gap-1.5 min-h-[44px] disabled:opacity-50"
            >
              {noticeLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Megaphone className="w-3.5 h-3.5" />}
              <span>Post Notice</span>
            </button>
          </form>

          {/* Existing notices */}
          <div className="space-y-2">
            <p className="text-xs font-black uppercase tracking-wider text-[var(--muted)]">
              Posted Notices ({notices.length})
            </p>
            {notices.length === 0 ? (
              <div className="p-6 text-center bg-[var(--surface)] border border-[var(--border-token)] rounded-lg">
                <Megaphone className="w-7 h-7 text-[var(--muted)] mx-auto mb-2 opacity-40" />
                <p className="text-sm font-semibold text-[var(--ink)]">No notices yet</p>
                <p className="text-xs text-[var(--muted)] mt-1">Use the form above to post your first notice.</p>
              </div>
            ) : (
              notices.map((n) => (
                <div
                  key={n.id}
                  className={`p-3.5 rounded-lg border flex items-start justify-between gap-3 ${
                    n.pinned
                      ? "bg-[var(--accent-tint)] border-[var(--accent)]"
                      : "bg-[var(--surface)] border-[var(--border-token)]"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {n.pinned && <Pin className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />}
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-[var(--ink)] truncate">{n.title}</p>
                      <p className="text-xs text-[var(--muted)]">by {n.postedByName}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteNotice(n.id)}
                    className="shrink-0 p-1.5 rounded hover:bg-[var(--surface-2)] text-[var(--critical)] transition-colors"
                    title="Delete notice"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
