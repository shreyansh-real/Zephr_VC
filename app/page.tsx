"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLanguageStore } from "@/lib/language-store";
import { Navbar } from "@/components/navbar";
import { AuthCard } from "@/components/auth-card";
import { SocietyOnboarding } from "@/components/society-onboarding";
import { ComplaintsList } from "@/components/complaints-list";
import { RaiseComplaintForm } from "@/components/raise-complaint-form";
import { ComplaintDetail } from "@/components/complaint-detail";
import { AdminPanel } from "@/components/admin-panel";
import { NoticesPanel } from "@/components/notices-panel";
import { Download, X } from "lucide-react";

export default function HomePage() {
  const { user, loading, currentSocietyId, currentMember } = useAuth();
  const { t } = useLanguageStore();

  const [activeTab, setActiveTab] = useState<"complaints" | "raise" | "my" | "admin">("complaints");
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);

  // PWA Install prompt state
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  // Multilingual Hello cycling state
  const HELLO_WORDS = [
    { word: "Hello",      lang: "English" },
    { word: "नमस्ते",     lang: "Hindi" },
    { word: "नमस्कार",   lang: "Marathi" },
    { word: "ਸਤ ਸ੍ਰੀ ਅਕਾਲ", lang: "Punjabi" },
    { word: "નમસ્તે",    lang: "Gujarati" },
    { word: "வணக்கம்",  lang: "Tamil" },
    { word: "నమస్కారం",  lang: "Telugu" },
    { word: "ಹಲೋ",       lang: "Kannada" },
    { word: "ഹലോ",       lang: "Malayalam" },
    { word: "আদাব",      lang: "Bengali" },
    { word: "سلام",      lang: "Urdu" },
  ];
  const [helloIdx, setHelloIdx] = useState(0);
  const [helloVisible, setHelloVisible] = useState(true);
  const helloTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!loading) return;
    const cycle = () => {
      setHelloVisible(false);
      helloTimer.current = setTimeout(() => {
        setHelloIdx((i) => (i + 1) % HELLO_WORDS.length);
        setHelloVisible(true);
        helloTimer.current = setTimeout(cycle, 1600);
      }, 300);
    };
    helloTimer.current = setTimeout(cycle, 1600);
    return () => { if (helloTimer.current) clearTimeout(helloTimer.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowInstallBanner(false);
    }
    setDeferredPrompt(null);
  };

  // Loading state — multilingual Hello screen
  if (loading) {
    const current = HELLO_WORDS[helloIdx];
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg)]">
        <div className="flex flex-col items-center gap-6">
          {/* Logo */}
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl overflow-hidden border border-[var(--border-token)] shadow-md">
              <img src="/favicon.svg" alt="SocietyDesk" className="w-full h-full object-cover" />
            </div>
            <span className="absolute inset-0 rounded-2xl animate-ping border-2 border-[var(--border-strong)] opacity-20" />
          </div>

          {/* Cycling hello word */}
          <div className="flex flex-col items-center gap-1 min-h-[64px] justify-center">
            <span
              key={helloIdx}
              className="text-4xl font-black font-display text-[var(--ink)] transition-all duration-300"
              style={{
                opacity: helloVisible ? 1 : 0,
                transform: helloVisible ? "translateY(0)" : "translateY(10px)",
              }}
            >
              {current.word}
            </span>
            <span
              className="text-xs font-semibold text-[var(--muted)] tracking-wide uppercase transition-opacity duration-300"
              style={{ opacity: helloVisible ? 0.7 : 0 }}
            >
              {current.lang}
            </span>
          </div>

          {/* Brand name + dots */}
          <div className="flex flex-col items-center gap-1.5">
            <span className="text-sm font-bold tracking-tight text-[var(--muted)] font-display">
              SocietyDesk
            </span>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--ink)] opacity-30 animate-bounce [animation-delay:0ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--ink)] opacity-30 animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--ink)] opacity-30 animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Unauthenticated: Show Landing Hero & Sign-in card
  if (!user) {
    return (
      <main className="min-h-screen bg-[var(--bg)] text-[var(--ink)] flex flex-col">
        <Navbar activeTab="complaints" onTabChange={() => {}} />

        <div className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Editorial Headline per Design.md */}
          <div className="lg:col-span-7 space-y-6">
            <span className="inline-block px-3 py-1 rounded text-xs font-black uppercase tracking-wider bg-[var(--surface-2)] text-[var(--ink)] border border-[var(--border-token)]">
              Multi-Tenant Society Portal
            </span>

            <h1 className="text-4xl sm:text-6xl font-black font-display tracking-tight text-[var(--ink)] leading-[1.05]">
              Transparent housing society complaints.
            </h1>

            <p className="text-lg sm:text-xl text-[var(--muted)] leading-relaxed max-w-xl">
              {t.tagline}. Residents raise issues with photos, avoid duplicates with upvotes, and committees track maintenance from open to resolved.
            </p>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[var(--border-token)]">
              <div>
                <p className="text-2xl sm:text-3xl font-black font-display text-[var(--ink)]">100%</p>
                <p className="text-xs text-[var(--muted)] font-bold">Isolated Data</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black font-display text-[var(--ink)]">3 Langs</p>
                <p className="text-xs text-[var(--muted)] font-bold">EN / HI / MR</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black font-display text-[var(--ink)]">PWA</p>
                <p className="text-xs text-[var(--muted)] font-bold">Installable Offline</p>
              </div>
            </div>
          </div>

          {/* Auth Card */}
          <div className="lg:col-span-5 w-full">
            <AuthCard />
          </div>
        </div>
      </main>
    );
  }

  // Authenticated but no approved active society selected: Show Onboarding / Pending screen
  if (!currentSocietyId || currentMember?.status !== "active") {
    return (
      <main className="min-h-screen bg-[var(--bg)] text-[var(--ink)] flex flex-col">
        <Navbar activeTab="complaints" onTabChange={() => {}} />
        <div className="flex-1 max-w-4xl mx-auto px-4 py-10 w-full flex items-center justify-center">
          <SocietyOnboarding />
        </div>
      </main>
    );
  }

  // Active Society View
  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--ink)] flex flex-col">
      <Navbar activeTab={activeTab} onTabChange={(tab) => {
        setActiveTab(tab);
        setSelectedComplaintId(null);
      }} />

      {/* PWA Install Banner */}
      {showInstallBanner && (
        <div className="bg-[var(--surface-2)] border-b border-[var(--border-token)] px-4 py-2.5 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-[var(--ink)]" />
            <span className="font-semibold text-xs text-[var(--ink)]">
              Install SocietyDesk on your home screen for quick offline access
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleInstallApp}
              className="h-8 px-3 rounded bg-[var(--ink)] text-[var(--ink-inverse)] text-xs font-bold"
            >
              Install
            </button>
            <button
              type="button"
              onClick={() => setShowInstallBanner(false)}
              className="p-1 text-[var(--muted)] hover:text-[var(--ink)]"
              aria-label="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Workspace Content */}
      <div className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6">
        {selectedComplaintId ? (
          <ComplaintDetail
            complaintId={selectedComplaintId}
            onBack={() => setSelectedComplaintId(null)}
          />
        ) : activeTab === "raise" ? (
          <div className="py-6">
            <RaiseComplaintForm
              onSuccess={() => {
                setActiveTab("my");
                setSelectedComplaintId(null);
              }}
              onCancel={() => setActiveTab("complaints")}
            />
          </div>
        ) : activeTab === "admin" ? (
          <AdminPanel />
        ) : activeTab === "my" ? (
          <ComplaintsList
            filterMyOnly={true}
            onSelectComplaint={(cid) => setSelectedComplaintId(cid)}
          />
        ) : (
          /* Public Noticeboard — two-column: notices panel left, complaints right */
          <div className="flex flex-col lg:flex-row gap-0 lg:gap-6 relative">
            {/* Left — Admin Notices Panel */}
            <aside className="lg:w-72 xl:w-80 shrink-0 pt-6 pb-3 lg:pb-6">
              <div className="lg:sticky lg:top-24">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs font-black uppercase tracking-wider text-[var(--muted)]">
                    Society Notices
                  </span>
                </div>
                <div className="bg-[var(--surface)] border border-[var(--border-token)] rounded-xl p-4">
                  <NoticesPanel />
                </div>
              </div>
            </aside>

            {/* Right — Complaints List */}
            <div className="flex-1 min-w-0">
              <ComplaintsList
                filterMyOnly={false}
                onSelectComplaint={(cid) => setSelectedComplaintId(cid)}
              />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
