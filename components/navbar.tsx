"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLanguageStore } from "@/lib/language-store";
import { type Language } from "@/lib/i18n";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
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
  DoorOpen,
  Loader2,
  Home,
  FileText,
  Plus,
  Menu,
  X,
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
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [leaveLoading, setLeaveLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isStaff = currentMember?.role === "admin" || currentMember?.role === "volunteer";

  const navTabs = [
    { id: "complaints", label: t.tabs.noticeboard, icon: Home },
    { id: "my", label: t.tabs.myIssues, icon: FileText },
    { id: "raise", label: t.tabs.raiseIssue, icon: Plus },
    ...(isStaff ? [{ id: "admin", label: t.tabs.admin, icon: Shield }] : []),
  ] as const;

  const handleLeaveResidence = async () => {
    setLeaveLoading(true);
    try {
      await leaveResidence();
      await signOut();
    } catch (err) {
      try {
        await signOut();
      } catch (signOutErr) {
        // Silent fail
      }
    } finally {
      setLeaveLoading(false);
      setLeaveModalOpen(false);
    }
  };

  const handleTabClick = (tab: typeof activeTab) => {
    onTabChange(tab);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* ── Leave Residence Modal ── */}
      <AnimatePresence>
        {leaveModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              if (!leaveLoading) setLeaveModalOpen(false);
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="w-full max-w-sm bg-[var(--surface)] border border-[var(--border-token)] rounded-xl shadow-xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-red-50 border border-red-200 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-[var(--critical)]" />
                </div>
                <h2 className="text-lg font-black font-display text-[var(--ink)]">
                  Leave Residence?
                </h2>
              </div>

              <p className="text-sm text-[var(--muted)] mb-1">
                You will be{" "}
                <strong className="text-[var(--ink)]">permanently removed</strong> from{" "}
                <strong className="text-[var(--ink)]">{currentSociety?.name}</strong>.
              </p>
              <p className="text-sm text-[var(--muted)] mb-5">
                Your account will be reset to a fresh state. You can rejoin any society with a new
                invite code.
              </p>

              <div className="space-y-2">
                <button
                  type="button"
                  disabled={leaveLoading}
                  onClick={handleLeaveResidence}
                  className="w-full h-12 rounded-lg bg-[var(--critical)] text-white font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  {leaveLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <DoorOpen className="w-4 h-4" />
                  )}
                  {leaveLoading ? "Leaving…" : "Yes, Leave Residence"}
                </button>
                <button
                  type="button"
                  disabled={leaveLoading}
                  onClick={() => setLeaveModalOpen(false)}
                  className="w-full h-10 text-sm font-semibold text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
                >
                  {t.common.cancel}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main Navbar ── */}
      <header className="sticky top-0 z-40 w-full border-b border-[var(--border-token)] bg-[var(--surface)] shadow-xs transition-colors">
        <div className="max-w-full px-4 sm:px-6">
          {/* Top Bar: Branding + Controls */}
          <div className="flex items-center justify-between h-16">
            {/* Brand */}
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-md overflow-hidden shrink-0">
                <img src="/favicon.svg" alt="Sochi" className="w-full h-full object-cover" />
              </div>
              <span className="font-extrabold text-lg tracking-tight font-display hidden sm:inline-block">
                {t.appName}
              </span>
            </div>

            {/* Desktop Navigation Tabs + Controls */}
            <div className="hidden lg:flex items-center gap-6 flex-1 px-8">
              {/* Navigation Tabs */}
              <div className="flex items-center gap-1">
                {navTabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <motion.button
                      key={tab.id}
                      onClick={() => handleTabClick(tab.id as any)}
                      className="relative px-3 py-2 text-sm font-semibold text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className="flex items-center gap-1.5">
                        <Icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                      </div>
                      {activeTab === tab.id && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--accent)]"
                          transition={{
                            type: "spring",
                            damping: 20,
                            stiffness: 300,
                          }}
                        />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Society Selector */}
              {currentSociety && (
                <div className="relative hidden sm:block">
                  <motion.button
                    type="button"
                    onClick={() => setSocietyDropdownOpen(!societyDropdownOpen)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[var(--border-token)] bg-[var(--surface-2)] text-[var(--ink)] text-sm font-semibold max-w-[200px] sm:max-w-[260px] truncate hover:border-[var(--border-strong)] transition-colors min-h-[44px]"
                  >
                    <Building2 className="w-4 h-4 shrink-0 text-[var(--muted)]" />
                    <span className="truncate">{currentSociety.name}</span>
                    <motion.div animate={{ rotate: societyDropdownOpen ? 180 : 0 }}>
                      <ChevronDown className="w-3.5 h-3.5 shrink-0 opacity-70" />
                    </motion.div>
                  </motion.button>

                  <AnimatePresence>
                    {societyDropdownOpen && (
                      <>
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="fixed inset-0 z-10"
                          onClick={() => setSocietyDropdownOpen(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ type: "spring", damping: 20, stiffness: 300 }}
                          className="absolute left-0 mt-1 w-64 bg-[var(--surface)] border border-[var(--border-token)] rounded-md shadow-lg py-1 z-20"
                        >
                          <div className="px-3 py-1.5 text-xs font-bold text-[var(--muted)] border-b border-[var(--border-token)] uppercase">
                            {t.onboarding.selectSociety}
                          </div>
                          {userSocieties.map((s) => (
                            <motion.button
                              key={s.societyId}
                              type="button"
                              onClick={() => {
                                switchSociety(s.societyId);
                                setSocietyDropdownOpen(false);
                              }}
                              whileHover={{ backgroundColor: "var(--surface-2)" }}
                              className="w-full text-left px-3 py-2 text-sm flex items-center justify-between transition-colors"
                            >
                              <div className="truncate">
                                <p className="font-semibold text-[var(--ink)] truncate">
                                  {s.society.name}
                                </p>
                                <p className="text-xs text-[var(--muted)] capitalize">
                                  {s.member.role}
                                </p>
                              </div>
                              {s.societyId === currentSociety?.inviteCode && (
                                <Check className="w-4 h-4 text-[var(--ink)] shrink-0" />
                              )}
                            </motion.button>
                          ))}
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Language Switcher */}
              <div className="relative">
                <motion.button
                  type="button"
                  onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-sm font-bold border border-[var(--border-token)] hover:bg-[var(--surface-2)] transition-colors min-h-[44px] min-w-[44px] justify-center"
                >
                  <Globe className="w-4 h-4 text-[var(--muted)]" />
                  <span className="uppercase text-xs hidden sm:inline">{language}</span>
                </motion.button>

                <AnimatePresence>
                  {langDropdownOpen && (
                    <>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-10"
                        onClick={() => setLangDropdownOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ type: "spring", damping: 20, stiffness: 300 }}
                        className="absolute right-0 mt-1 w-32 bg-[var(--surface)] border border-[var(--border-token)] rounded-md shadow-lg py-1 z-20"
                      >
                        {[
                          { code: "en", label: "English" },
                          { code: "hi", label: "हिन्दी" },
                          { code: "mr", label: "मराठी" },
                        ].map((item) => (
                          <motion.button
                            key={item.code}
                            type="button"
                            onClick={() => {
                              setLanguage(item.code as Language);
                              setLangDropdownOpen(false);
                            }}
                            whileHover={{ backgroundColor: "var(--surface-2)" }}
                            className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between transition-colors ${
                              language === item.code
                                ? "font-bold text-[var(--ink)]"
                                : "text-[var(--muted)]"
                            }`}
                          >
                            <span>{item.label}</span>
                            {language === item.code && (
                              <Check className="w-3.5 h-3.5" />
                            )}
                          </motion.button>
                        ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* Theme Toggle */}
              <motion.button
                type="button"
                onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center w-11 h-11 rounded-md border border-[var(--border-token)] hover:bg-[var(--surface-2)] transition-colors text-[var(--ink)]"
              >
                {resolvedTheme === "dark" ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </motion.button>

              {/* Role Badge - Desktop */}
              {currentMember && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="hidden md:inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-md bg-[var(--surface-2)] text-[var(--ink)] border border-[var(--border-token)]"
                >
                  {currentMember.role === "admin" ? (
                    <Shield className="w-3.5 h-3.5 text-[var(--high)]" />
                  ) : (
                    <UserIcon className="w-3.5 h-3.5 text-[var(--muted)]" />
                  )}
                  <span className="capitalize">{t.roles[currentMember.role]}</span>
                </motion.span>
              )}

              {/* Leave Residence Button - Desktop */}
              {user && currentSociety && currentMember?.status === "active" && (
                <motion.button
                  type="button"
                  onClick={() => setLeaveModalOpen(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="hidden sm:flex items-center justify-center w-11 h-11 rounded-md border border-[var(--border-token)] hover:bg-red-50 hover:border-red-300 text-[var(--muted)] hover:text-[var(--critical)] transition-colors"
                  title="Leave Residence"
                >
                  <DoorOpen className="w-4 h-4" />
                </motion.button>
              )}

              {/* Sign Out Button - Desktop */}
              {user && (
                <motion.button
                  type="button"
                  onClick={signOut}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="hidden sm:flex items-center justify-center w-11 h-11 rounded-md border border-[var(--border-token)] hover:bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </motion.button>
              )}

              {/* Mobile Menu Button */}
              <motion.button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="lg:hidden flex items-center justify-center w-11 h-11 rounded-md border border-[var(--border-token)] hover:bg-[var(--surface-2)] transition-colors"
              >
                <AnimatePresence mode="wait">
                  {mobileMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X className="w-4 h-4" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="open"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu className="w-4 h-4" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
                className="overflow-hidden border-t border-[var(--border-token)]"
              >
                <div className="px-4 py-3 space-y-2">
                  {/* Mobile Navigation Tabs */}
                  {navTabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <motion.button
                        key={tab.id}
                        onClick={() => handleTabClick(tab.id as any)}
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                          activeTab === tab.id
                            ? "bg-[var(--surface-2)] text-[var(--accent)] border-l-2 border-[var(--accent)]"
                            : "text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)]"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                      </motion.button>
                    );
                  })}

                  <div className="border-t border-[var(--border-token)] my-2" />

                  {/* Mobile Society Selector */}
                  {currentSociety && userSocieties.length > 1 && (
                    <div className="px-4 py-2">
                      <p className="text-xs font-bold text-[var(--muted)] mb-2 uppercase">
                        {t.onboarding.selectSociety}
                      </p>
                      {userSocieties.map((s) => (
                        <motion.button
                          key={s.societyId}
                          onClick={() => {
                            switchSociety(s.societyId);
                            setMobileMenuOpen(false);
                          }}
                          whileHover={{ x: 4 }}
                          className={`w-full text-left px-3 py-2 text-sm rounded transition-colors ${
                            s.societyId === currentSociety?.inviteCode
                              ? "font-bold text-[var(--accent)] bg-[var(--surface-2)]"
                              : "text-[var(--muted)] hover:text-[var(--ink)]"
                          }`}
                        >
                          {s.society.name}
                        </motion.button>
                      ))}
                    </div>
                  )}

                  <div className="border-t border-[var(--border-token)] my-2" />

                  {/* Mobile Leave Residence & Sign Out */}
                  {user && currentSociety && currentMember?.status === "active" && (
                    <motion.button
                      type="button"
                      onClick={() => {
                        setLeaveModalOpen(true);
                        setMobileMenuOpen(false);
                      }}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold text-[var(--critical)] hover:bg-red-50 transition-colors"
                    >
                      <DoorOpen className="w-4 h-4" />
                      <span>Leave Residence</span>
                    </motion.button>
                  )}

                  {user && (
                    <motion.button
                      type="button"
                      onClick={() => {
                        signOut();
                        setMobileMenuOpen(false);
                      }}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)] transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{t.common.signOut}</span>
                    </motion.button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>
    </>
  );
}
