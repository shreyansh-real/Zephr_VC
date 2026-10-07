"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLanguageStore } from "@/lib/language-store";
import {
  Building2,
  KeyRound,
  Clock,
  ArrowRight,
  Loader2,
  ShieldCheck,
  AlertCircle,
  LogOut,
  RefreshCw,
} from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { type Society } from "@/lib/types";

export function SocietyOnboarding() {
  const { user, createSociety, joinSocietyByCode, pendingSociety, refreshProfile, signOut } = useAuth();
  const { t } = useLanguageStore();

  const [mode, setMode] = useState<"select" | "create" | "join">("select");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create form state
  const [societyName, setSocietyName] = useState("");
  const [societyType, setSocietyType] = useState("apartment");
  const [address, setAddress] = useState("");
  const [unitGroups, setUnitGroups] = useState("Wing A, Wing B, Wing C");
  const [creatorName, setCreatorName] = useState(user?.displayName || "");

  // Join form state
  const [inviteCode, setInviteCode] = useState("");
  const [verifiedSociety, setVerifiedSociety] = useState<Society | null>(null);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [unitGroup, setUnitGroup] = useState("");
  const [unitNumber, setUnitNumber] = useState("");
  const [residentName, setResidentName] = useState(user?.displayName || "");

  // Verify invite code
  const handleVerifyCode = async () => {
    if (!inviteCode.trim()) return;
    setError(null);
    setVerifyingCode(true);
    try {
      const code = inviteCode.trim().toUpperCase();
      const codeDoc = await getDoc(doc(db, "inviteCodes", code));
      if (!codeDoc.exists()) {
        setError(t.auth.invalidOtp || "Invite code not found. Please verify.");
        setVerifiedSociety(null);
        return;
      }
      const { societyId } = codeDoc.data() as { societyId: string };
      const socDoc = await getDoc(doc(db, "societies", societyId));
      if (socDoc.exists()) {
        setVerifiedSociety(socDoc.data() as Society);
      }
    } catch (err: unknown) {
      console.error("Code lookup error:", err);
      setError(t.common.error);
    } finally {
      setVerifyingCode(false);
    }
  };

  // Submit Create Society
  const handleCreateSociety = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!societyName.trim() || !address.trim()) return;

    setError(null);
    setLoading(true);
    try {
      const groups = unitGroups
        .split(",")
        .map((g) => g.trim())
        .filter(Boolean);

      await createSociety({
        name: societyName.trim(),
        type: societyType,
        address: address.trim(),
        unitGroups: groups,
        creatorName: creatorName.trim() || "Admin",
      });
    } catch (err: unknown) {
      console.error("Create society error:", err);
      const message = err instanceof Error ? err.message : t.common.error;
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Submit Join Request
  const handleJoinSociety = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim() || !unitNumber.trim()) return;

    setError(null);
    setLoading(true);
    try {
      await joinSocietyByCode({
        inviteCode: inviteCode.trim(),
        unitGroup: unitGroup.trim() || "Wing A",
        unitLabel: unitNumber.trim(),
        memberName: residentName.trim() || "Resident",
      });
    } catch (err: unknown) {
      console.error("Join society error:", err);
      const message = err instanceof Error ? err.message : t.common.error;
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Pending approval screen
  if (pendingSociety) {
    return (
      <div className="w-full max-w-lg mx-auto p-6 sm:p-8 bg-[var(--surface)] border border-[var(--border-token)] rounded-lg shadow-sm text-center">
        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[var(--high-tint)] border border-[var(--high)] flex items-center justify-center text-[var(--high)]">
          <Clock className="w-7 h-7" />
        </div>

        <h2 className="text-2xl font-black font-display tracking-tight text-[var(--ink)]">
          {t.onboarding.pendingTitle}
        </h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          {t.onboarding.pendingSubtitle} for{" "}
          <strong className="text-[var(--ink)] font-bold">{pendingSociety.society.name}</strong>.
        </p>

        <div className="my-6 p-4 rounded-md bg-[var(--surface-2)] border border-[var(--border-token)] text-left text-sm space-y-1.5">
          <p className="text-xs font-bold uppercase text-[var(--muted)]">Membership Details</p>
          <p className="text-[var(--ink)]">
            <span className="text-[var(--muted)]">Name:</span> {pendingSociety.member.name}
          </p>
          <p className="text-[var(--ink)]">
            <span className="text-[var(--muted)]">Unit:</span> {pendingSociety.member.unitId || "General"}
          </p>
          <p className="text-[var(--ink)]">
            <span className="text-[var(--muted)]">Status:</span>{" "}
            <span className="px-2 py-0.5 rounded text-xs font-bold bg-[var(--high-tint)] text-[var(--high)] border border-[var(--high)]">
              Pending Approval
            </span>
          </p>
        </div>

        <p className="text-sm text-[var(--muted)] leading-relaxed mb-6">
          {t.onboarding.pendingDesc}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={refreshProfile}
            className="h-11 px-4 rounded-md bg-[var(--ink)] text-[var(--ink-inverse)] font-bold text-sm flex items-center justify-center gap-2 hover:opacity-95 transition-opacity"
          >
            <RefreshCw className="w-4 h-4" />
            <span>{t.onboarding.pendingCheckAgain}</span>
          </button>

          <button
            type="button"
            onClick={signOut}
            className="h-11 px-4 rounded-md border border-[var(--border-token)] hover:bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--ink)] font-bold text-sm flex items-center justify-center gap-2 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>{t.common.signOut}</span>
          </button>
        </div>
      </div>
    );
  }

  // Choose Create or Join
  if (mode === "select") {
    return (
      <div className="w-full max-w-xl mx-auto p-6 sm:p-8 bg-[var(--surface)] border border-[var(--border-token)] rounded-lg shadow-sm">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-[var(--ink)]">
            {t.onboarding.welcome}
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">{t.tagline}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Join Society Card */}
          <button
            type="button"
            onClick={() => setMode("join")}
            className="p-6 text-left border-2 border-[var(--border-token)] hover:border-[var(--border-strong)] rounded-lg bg-[var(--surface-2)] transition-all flex flex-col justify-between group min-h-[160px]"
          >
            <div>
              <div className="w-10 h-10 rounded-md bg-[var(--ink)] text-[var(--ink-inverse)] flex items-center justify-center mb-3">
                <KeyRound className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[var(--ink)]">{t.onboarding.joinSociety}</h3>
              <p className="text-xs text-[var(--muted)] mt-1">{t.onboarding.joinSubtitle}</p>
            </div>
            <span className="mt-4 inline-flex items-center text-xs font-bold text-[var(--ink)] group-hover:translate-x-1 transition-transform">
              Join with Code &rarr;
            </span>
          </button>

          {/* Create Society Card */}
          <button
            type="button"
            onClick={() => setMode("create")}
            className="p-6 text-left border-2 border-[var(--border-token)] hover:border-[var(--border-strong)] rounded-lg bg-[var(--surface-2)] transition-all flex flex-col justify-between group min-h-[160px]"
          >
            <div>
              <div className="w-10 h-10 rounded-md bg-[var(--ink)] text-[var(--ink-inverse)] flex items-center justify-center mb-3">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[var(--ink)]">{t.onboarding.createSociety}</h3>
              <p className="text-xs text-[var(--muted)] mt-1">{t.onboarding.createSubtitle}</p>
            </div>
            <span className="mt-4 inline-flex items-center text-xs font-bold text-[var(--ink)] group-hover:translate-x-1 transition-transform">
              Start Society &rarr;
            </span>
          </button>
        </div>
      </div>
    );
  }

  // Create Society Form
  if (mode === "create") {
    return (
      <div className="w-full max-w-xl mx-auto p-6 sm:p-8 bg-[var(--surface)] border border-[var(--border-token)] rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black font-display tracking-tight text-[var(--ink)]">
              {t.onboarding.createTitle}
            </h2>
            <p className="text-xs text-[var(--muted)] mt-0.5">{t.onboarding.createSubtitle}</p>
          </div>
          <button
            type="button"
            onClick={() => setMode("select")}
            className="text-xs font-bold text-[var(--muted)] hover:text-[var(--ink)] underline min-h-[44px] flex items-center"
          >
            &larr; {t.common.back}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-md bg-[var(--surface-2)] border-2 border-[var(--border-strong)] flex items-start gap-2.5 text-sm text-[var(--ink)]">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleCreateSociety} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-[var(--ink)] mb-1">
              {t.onboarding.societyName} *
            </label>
            <input
              type="text"
              value={societyName}
              onChange={(e) => setSocietyName(e.target.value)}
              placeholder={t.onboarding.societyNamePlaceholder}
              required
              className="w-full h-11 px-3.5 rounded-md border border-[var(--border-token)] bg-[var(--surface)] text-[var(--ink)] text-sm font-medium focus:border-[var(--border-strong)] transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-[var(--ink)] mb-1">
                {t.onboarding.societyType}
              </label>
              <select
                value={societyType}
                onChange={(e) => setSocietyType(e.target.value)}
                className="w-full h-11 px-3 rounded-md border border-[var(--border-token)] bg-[var(--surface)] text-[var(--ink)] text-sm font-medium focus:border-[var(--border-strong)]"
              >
                <option value="apartment">Apartment / High-rise</option>
                <option value="chawl">Chawl / Colony</option>
                <option value="row-house">Row-house / Villa</option>
                <option value="commercial">Commercial / Shop Complex</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-[var(--ink)] mb-1">
                Your Admin Name *
              </label>
              <input
                type="text"
                value={creatorName}
                onChange={(e) => setCreatorName(e.target.value)}
                placeholder="e.g. Ramesh Patel"
                required
                className="w-full h-11 px-3.5 rounded-md border border-[var(--border-token)] bg-[var(--surface)] text-[var(--ink)] text-sm font-medium focus:border-[var(--border-strong)] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-[var(--ink)] mb-1">
              {t.onboarding.address} *
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={t.onboarding.addressPlaceholder}
              required
              className="w-full h-11 px-3.5 rounded-md border border-[var(--border-token)] bg-[var(--surface)] text-[var(--ink)] text-sm font-medium focus:border-[var(--border-strong)] transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[var(--ink)] mb-1">
              {t.onboarding.unitGroups}
            </label>
            <input
              type="text"
              value={unitGroups}
              onChange={(e) => setUnitGroups(e.target.value)}
              placeholder={t.onboarding.unitGroupsPlaceholder}
              className="w-full h-11 px-3.5 rounded-md border border-[var(--border-token)] bg-[var(--surface)] text-[var(--ink)] text-sm font-medium focus:border-[var(--border-strong)] transition-colors"
            />
            <p className="text-xs text-[var(--muted)] mt-1">{t.onboarding.unitGroupsHelp}</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 mt-2 px-4 rounded-md bg-[var(--ink)] text-[var(--ink-inverse)] font-bold text-base flex items-center justify-center gap-2 hover:opacity-95 transition-opacity disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t.onboarding.creating}</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>{t.onboarding.createSociety}</span>
              </>
            )}
          </button>
        </form>
      </div>
    );
  }

  // Join Society Form
  return (
    <div className="w-full max-w-xl mx-auto p-6 sm:p-8 bg-[var(--surface)] border border-[var(--border-token)] rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-black font-display tracking-tight text-[var(--ink)]">
            {t.onboarding.joinTitle}
          </h2>
          <p className="text-xs text-[var(--muted)] mt-0.5">{t.onboarding.joinSubtitle}</p>
        </div>
        <button
          type="button"
          onClick={() => setMode("select")}
          className="text-xs font-bold text-[var(--muted)] hover:text-[var(--ink)] underline min-h-[44px] flex items-center"
        >
          &larr; {t.common.back}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-md bg-[var(--surface-2)] border-2 border-[var(--border-strong)] flex items-start gap-2.5 text-sm text-[var(--ink)]">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      <form onSubmit={handleJoinSociety} className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-[var(--ink)] mb-1">
            {t.onboarding.inviteCodeLabel} *
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => {
                setInviteCode(e.target.value.toUpperCase());
                setVerifiedSociety(null);
              }}
              placeholder={t.onboarding.inviteCodePlaceholder}
              maxLength={12}
              required
              className="flex-1 h-11 px-3.5 tracking-wider uppercase font-bold text-base rounded-md border border-[var(--border-token)] bg-[var(--surface)] text-[var(--ink)] focus:border-[var(--border-strong)] transition-colors"
            />
            <button
              type="button"
              onClick={handleVerifyCode}
              disabled={verifyingCode || !inviteCode.trim()}
              className="h-11 px-4 rounded-md border border-[var(--border-token)] hover:border-[var(--border-strong)] bg-[var(--surface-2)] text-[var(--ink)] font-bold text-sm flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              {verifyingCode ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
              <span>{t.onboarding.lookupCode}</span>
            </button>
          </div>
        </div>

        {verifiedSociety && (
          <div className="p-3.5 rounded-md bg-[var(--surface-2)] border border-[var(--border-token)]">
            <p className="text-xs font-bold uppercase text-[var(--muted)]">{t.onboarding.societyFound}</p>
            <p className="text-base font-bold text-[var(--ink)]">{verifiedSociety.name}</p>
            <p className="text-xs text-[var(--muted)]">{verifiedSociety.address}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-bold text-[var(--ink)] mb-1">
            {t.auth.enterName} *
          </label>
          <input
            type="text"
            value={residentName}
            onChange={(e) => setResidentName(e.target.value)}
            placeholder={t.auth.namePlaceholder}
            required
            className="w-full h-11 px-3.5 rounded-md border border-[var(--border-token)] bg-[var(--surface)] text-[var(--ink)] text-sm font-medium focus:border-[var(--border-strong)] transition-colors"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-bold text-[var(--ink)] mb-1">
              {t.onboarding.selectUnitGroup}
            </label>
            <input
              type="text"
              value={unitGroup}
              onChange={(e) => setUnitGroup(e.target.value)}
              placeholder="e.g. Wing A or Chawl 2"
              className="w-full h-11 px-3.5 rounded-md border border-[var(--border-token)] bg-[var(--surface)] text-[var(--ink)] text-sm font-medium focus:border-[var(--border-strong)] transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[var(--ink)] mb-1">
              {t.onboarding.enterUnitNumber} *
            </label>
            <input
              type="text"
              value={unitNumber}
              onChange={(e) => setUnitNumber(e.target.value)}
              placeholder={t.onboarding.unitNumberPlaceholder}
              required
              className="w-full h-11 px-3.5 rounded-md border border-[var(--border-token)] bg-[var(--surface)] text-[var(--ink)] text-sm font-medium focus:border-[var(--border-strong)] transition-colors"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 mt-2 px-4 rounded-md bg-[var(--ink)] text-[var(--ink-inverse)] font-bold text-base flex items-center justify-center gap-2 hover:opacity-95 transition-opacity disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{t.onboarding.requesting}</span>
            </>
          ) : (
            <>
              <ArrowRight className="w-4 h-4" />
              <span>{t.onboarding.requestJoin}</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
