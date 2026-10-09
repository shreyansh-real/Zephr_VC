"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLanguageStore } from "@/lib/language-store";
import { type Language } from "@/lib/i18n";
import { useTheme } from "next-themes";
import {
  Sun,
  Moon,
  Building2,
  ChevronDown,
  LogOut,
  Globe,
  Shield,
  User as UserIcon,
  Check,
  AlertTriangle,
} from "lucide-react";

export function Navbar({
  activeTab,
  onTabChange,
}: {
  activeTab: "complaints" | "raise" | "my" | "admin";
  onTabChange: (tab: "complaints" | "raise" | "my" | "admin") => void;
}) {
  const {
    user,
    currentSociety,
    currentMember,
    userSocieties,
    switchSociety,
    signOut,
    leaveResidence,
  } = useAuth();
  const { language, setLanguage, t } = useLanguageStore();
  const { setTheme, resolvedTheme } = useTheme();

  const [societyDropdownOpen, setSocietyDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [signOutModalOpen, setSignOutModalOpen] = useState(false);
  const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false);
  const [leaveLoading, setLeaveLoading] = useState(false);

  const isStaff = currentMember?.role === "admin" || currentMember?.role === "volunteer";

  const handleLeaveResidence = async () => {
    setLeaveLoading(true);
    try {
      await leaveResidence();
    } catch (err) {
      console.error("Leave residence error:", err);
    } finally {
      setLeaveLoading(false);
      setLeaveConfirmOpen(false);
      setSignOutModalOpen(false);
    }
  };

  return (
    <>
      {/* ── Sign-Out / Leave Modal ── */}
      {signOutModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => { setSignOutModalOpen(false); setLeaveConfirmOpen(false); }}
        >
          <div
            className="w-full max-w-sm bg-[var(--surface)] border border-[var(--border-token)] rounded-xl shadow-xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {!leaveConfirmOpen ? (
              <>
                <h2 className="text-xl font-black font-display text-[var(--ink)] mb-1">Account Options</h2>
                <p className="text-xs text-[var(--muted)] mb-5">
                  {user?.displayName || user?.email || "Signed in"}
                  {currentSociety && ` · ${currentSociety.name}`}
                </p>
                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={signOut}
                    className="w-full h-12 rounded-lg bg-[var(--ink)] text-[var(--ink-inverse)] font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                  >
                    <LogOut className="w-4 h-4" />
                    {t.common.signOut}
                  </button>
                  {currentSociety && currentMember?.status === "active" && (
                    <button
                      type="button"
                      onClick={() => setLeaveConfirmOpen(true)}
                      className="w-full h-12 rounded-lg border-2 border-[var(--critical)] text-[var(--critical)] font-bold text-sm flex items-center justify-center gap-2 hover:bg-[var(--critical-tint)] transition-colors"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      Leave Residence
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => { setSignOutModalOpen(false); setLeaveConfirmOpen(false); }}
                    className="w-full h-10 text-sm font-semibold text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
                  >
                    {t.common.cancel}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-5 h-5 text-[var(--critical)] shrink-0" />
                  <h2 className="text-lg font-black font-display text-[var(--ink)]">Leave Residence?</h2>
                </div>
                <p className="text-sm text-[var(--muted)] mb-5">
                  You will be removed from <strong className="text-[var(--ink)]">{currentSociety?.name}</strong>. Your complaints and history remain. You can rejoin with a new invite code.
                </p>
                <div className="space-y-2">
                  <button
                    type="button"
                    disabled={leaveLoading}
                    onClick={handleLeaveResidence}
                    className="w-full h-12 rounded-lg bg-[var(--critical)] text-white font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-opacity"
                  >
                    {leaveLoading ? "Leaving..." : "Yes, Leave Residence"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setLeaveConfirmOpen(false)}
                    className="w-full h-10 text-sm font-semibold text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
                  >
                    {t.common.cancel}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <header className="sticky top-0 z-40 w-full border-b border-[var(--border-token)] bg-[var(--surface)] shadow-xs transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Brand & Society Switcher */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-md overflow-hidden border border-[var(--border-token)] shadow-sm shrink-0">
                  <img src="/favicon.svg" alt="Sochi" className="w-full h-full object-cover" />
                </div>
                <span className="font-extrabold text-lg tracking-tight font-display hidden sm:inline-block">
                  {t.appName}
                </span>
              </div>

              {/* Society Selector Dropdown */}
              {currentSociety && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setSocietyDropdownOpen(!societyDropdownOpen)}
                    aria-expanded={societyDropdownOpen}
                    aria-label="Switch society"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[var(--border-token)] bg-[var(--surface-2)] text-[var(--ink)] text-sm font-semibold max-w-[200px] sm:max-w-[260px] truncate hover:border-[var(--border-strong)] transition-colors min-h-[44px]"
                  >
                    <Building2 className="w-4 h-4 shrink-0 text-[var(--muted)]" />
                    <span className="truncate">{currentSociety.name}</span>
                    <ChevronDown className="w-3.5 h-3.5 shrink-0 opacity-70" />
                  </button>

                  {societyDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setSocietyDropdownOpen(false)}
                      />
                      <div className="absolute left-0 mt-1 w-64 bg-[var(--surface)] border border-[var(--border-token)] rounded-md shadow-lg py-1 z-20">
                        <div className="px-3 py-1.5 text-xs font-bold text-[var(--muted)] border-b border-[var(--border-token)] uppercase">
                          {t.onboarding.selectSociety}
                        </div>
                        {userSocieties.map((s) => (
                          <button
                            key={s.societyId}
                            type="button"
                            onClick={() => {
                              switchSociety(s.societyId);
                              setSocietyDropdownOpen(false);
                            }}
                            className="w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-[var(--surface-2)] transition-colors"
                          >
                            <div className="truncate">
                              <p className="font-semibold text-[var(--ink)] truncate">{s.society.name}</p>
                              <p className="text-xs text-[var(--muted)] capitalize">{s.member.role}</p>
                            </div>
                            {s.societyId === currentSociety?.inviteCode && (
                              <Check className="w-4 h-4 text-[var(--ink)] shrink-0" />
                            )}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Controls: Language, Theme, Role, Sign Out */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Language Switcher */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                  aria-expanded={langDropdownOpen}
                  aria-label="Change language"
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-sm font-bold border border-[var(--border-token)] hover:bg-[var(--surface-2)] transition-colors min-h-[44px] min-w-[44px] justify-center"
                >
                  <Globe className="w-4 h-4 text-[var(--muted)]" />
                  <span className="uppercase text-xs">{language}</span>
                </button>

                {langDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setLangDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-1 w-32 bg-[var(--surface)] border border-[var(--border-token)] rounded-md shadow-lg py-1 z-20">
                      {[
                        { code: "en", label: "English" },
                        { code: "hi", label: "हिन्दी" },
                        { code: "mr", label: "मराठी" },
                      ].map((item) => (
                        <button
                          key={item.code}
                          type="button"
                          onClick={() => {
                            setLanguage(item.code as Language);
                            setLangDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-[var(--surface-2)] ${
                            language === item.code ? "font-bold text-[var(--ink)]" : "text-[var(--muted)]"
                          }`}
                        >
                          <span>{item.label}</span>
                          {language === item.code && <Check className="w-3.5 h-3.5" />}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Theme Toggle Button */}
              <button
                type="button"
                onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                aria-label={resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                className="flex items-center justify-center w-11 h-11 rounded-md border border-[var(--border-token)] hover:bg-[var(--surface-2)] transition-colors text-[var(--ink)]"
              >
                {resolvedTheme === "dark" ? (
                  <Sun className="w-4 h-4" aria-hidden="true" />
                ) : (
                  <Moon className="w-4 h-4" aria-hidden="true" />
                )}
              </button>

              {/* User Role Badge */}
              {currentMember && (
                <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-md bg-[var(--surface-2)] text-[var(--ink)] border border-[var(--border-token)]">
                  {currentMember.role === "admin" ? (
                    <Shield className="w-3.5 h-3.5 text-[var(--high)]" />
                  ) : (
                    <UserIcon className="w-3.5 h-3.5 text-[var(--muted)]" />
                  )}
                  <span className="capitalize">{t.roles[currentMember.role]}</span>
                </span>
              )}

              {/* Sign Out Button → opens modal */}
              {user && (
                <button
                  type="button"
                  onClick={() => setSignOutModalOpen(true)}
                  aria-label={t.common.signOut}
                  title={t.common.signOut}
                  className="flex items-center justify-center w-11 h-11 rounded-md border border-[var(--border-token)] hover:bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Tab Navigation for Active Society */}
          {currentSociety && currentMember?.status === "active" && (
            <nav className="flex space-x-1 sm:space-x-2 border-t border-[var(--border-token)] pt-1 pb-2 overflow-x-auto">
              <button
                type="button"
                onClick={() => onTabChange("complaints")}
                className={`px-3 py-2 text-sm font-bold rounded-md transition-colors whitespace-nowrap min-h-[44px] flex items-center ${
                  activeTab === "complaints"
                    ? "bg-[var(--ink)] text-[var(--ink-inverse)]"
                    : "text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)]"
                }`}
              >
                {t.complaints.societyComplaints}
              </button>

              <button
                type="button"
                onClick={() => onTabChange("raise")}
                className={`px-3 py-2 text-sm font-bold rounded-md transition-colors whitespace-nowrap min-h-[44px] flex items-center ${
                  activeTab === "raise"
                    ? "bg-[var(--ink)] text-[var(--ink-inverse)]"
                    : "text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)]"
                }`}
              >
                + {t.complaints.newComplaint}
              </button>

              <button
                type="button"
                onClick={() => onTabChange("my")}
                className={`px-3 py-2 text-sm font-bold rounded-md transition-colors whitespace-nowrap min-h-[44px] flex items-center ${
                  activeTab === "my"
                    ? "bg-[var(--ink)] text-[var(--ink-inverse)]"
                    : "text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)]"
                }`}
              >
                {t.complaints.myComplaints}
              </button>

              {isStaff && (
                <button
                  type="button"
                  onClick={() => onTabChange("admin")}
                  className={`px-3 py-2 text-sm font-bold rounded-md transition-colors whitespace-nowrap min-h-[44px] flex items-center gap-1.5 ${
                    activeTab === "admin"
                      ? "bg-[var(--ink)] text-[var(--ink-inverse)]"
                      : "text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)]"
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>{t.admin.title}</span>
                </button>
              )}
            </nav>
          )}
        </div>
      </header>
    </>
  );
}


