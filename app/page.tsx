"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLanguageStore } from "@/lib/language-store";
import { Navbar } from "@/components/navbar";
import { AuthCard } from "@/components/auth-card";
import { SocietyOnboarding } from "@/components/society-onboarding";
import { ComplaintsList } from "@/components/complaints-list";
import { RaiseComplaintForm } from "@/components/raise-complaint-form";
import { ComplaintDetail } from "@/components/complaint-detail";
import { AdminPanel } from "@/components/admin-panel";
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

  // Loading state
  if (loading) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg)]">
        <div className="flex flex-col items-center gap-5">
          {/* Logo mark */}
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl overflow-hidden border border-[var(--border-token)] shadow-md">
              <img src="/favicon.svg" alt="SocietyDesk" className="w-full h-full object-cover" />
            </div>
            {/* Pulsing ring */}
            <span className="absolute inset-0 rounded-2xl animate-ping border-2 border-[var(--border-strong)] opacity-20" />
          </div>

          {/* Brand name */}
          <div className="flex flex-col items-center gap-1.5">
            <span className="text-lg font-black tracking-tight text-[var(--ink)] font-display">
              SocietyDesk
            </span>
            {/* Animated dots */}
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
                setActiveTab("complaints");
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
          <ComplaintsList
            filterMyOnly={false}
            onSelectComplaint={(cid) => setSelectedComplaintId(cid)}
          />
        )}
      </div>
    </main>
  );
}
