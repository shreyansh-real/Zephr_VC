"use client";

import React, { useState, useEffect, useRef } from "react";
import { AnimatePresence } from "framer-motion";
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
import { Preloader } from "@/components/preloader";
import { Download, X } from "lucide-react";

export default function HomePage() {
  const { user, loading, currentSocietyId, currentMember, profile, userSocieties, pendingSociety } = useAuth();
  const { t } = useLanguageStore();

  const [activeTab, setActiveTab] = useState<"complaints" | "raise" | "my" | "admin">("complaints");
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);

  // PWA Install prompt state
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  // Preloader: show once per browser-session after an explicit sign-in/sign-up.
  // sessionStorage flag "sochi_welcomed" prevents it firing again on reload.
  const [showPreloader, setShowPreloader] = useState(false);
  const prevUserRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    if (loading) return; // wait until auth state is resolved
    const prev = prevUserRef.current;
    const curr = user?.uid ?? null;

    // Only fire when transitioning null → uid AND the flag is not already set.
    // On page reload while logged in: prev starts as undefined (not null) so
    // the null→uid transition never fires — no preloader.
    if (prev === null && curr !== null) {
      const alreadyWelcomed = sessionStorage.getItem("sochi_welcomed");
      if (!alreadyWelcomed) {
        sessionStorage.setItem("sochi_welcomed", "1");
        setShowPreloader(true);
      }
    }

    prevUserRef.current = curr;
  }, [user, loading]);

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

  // Firebase auth resolving — show skeleton that mirrors dashboard layout
  if (loading) {
    return (
      <main className="min-h-screen flex flex-col" style={{ background: "var(--bg)" }}>
        {/* Navbar skeleton */}
        <div
          className="w-full border-b px-4 sm:px-6 h-14 flex items-center justify-between shrink-0"
          style={{ borderColor: "var(--border-token)", background: "var(--surface)" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg skeleton-pulse" />
            <div className="w-20 h-4 rounded skeleton-pulse" />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-24 h-7 rounded skeleton-pulse hidden sm:block" />
            <div className="w-24 h-7 rounded skeleton-pulse hidden sm:block" />
            <div className="w-7 h-7 rounded-full skeleton-pulse" />
          </div>
        </div>

        {/* Tab row skeleton */}
        <div
          className="w-full border-b px-4 sm:px-6 h-10 flex items-center gap-4"
          style={{ borderColor: "var(--border-token)", background: "var(--surface)" }}
        >
          <div className="w-20 h-3 rounded skeleton-pulse" />
          <div className="w-16 h-3 rounded skeleton-pulse" />
          <div className="w-20 h-3 rounded skeleton-pulse" />
        </div>

        {/* Two-column content skeleton */}
        <div className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col lg:flex-row gap-6">
          {/* Left: notices sidebar */}
          <div className="lg:w-72 xl:w-80 shrink-0 flex flex-col gap-3">
            <div className="w-28 h-3 rounded skeleton-pulse" />
            <div
              className="rounded-xl border p-4 flex flex-col gap-3"
              style={{ borderColor: "var(--border-token)", background: "var(--surface)" }}
            >
              {[80, 65, 90].map((w, i) => (
                <div key={i} className="flex flex-col gap-1.5">
                  <div className="skeleton-pulse rounded h-3" style={{ width: `${w}%` }} />
                  <div className="skeleton-pulse rounded h-2.5" style={{ width: "55%" }} />
                </div>
              ))}
            </div>
          </div>

          {/* Right: complaint cards */}
          <div className="flex-1 min-w-0 flex flex-col gap-3 pt-1">
            <div className="w-32 h-3 rounded skeleton-pulse" />
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="rounded-xl border p-4 flex flex-col gap-2"
                style={{ borderColor: "var(--border-token)", background: "var(--surface)" }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-12 h-5 rounded skeleton-pulse" />
                  <div className="w-16 h-5 rounded skeleton-pulse" />
                </div>
                <div className="skeleton-pulse rounded h-4" style={{ width: "70%" }} />
                <div className="skeleton-pulse rounded h-3" style={{ width: "40%" }} />
              </div>
            ))}
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

        {/* Mobile-First: Auth Card First, then Content */}
        <div className="flex-1 w-full flex flex-col lg:grid lg:grid-cols-12 gap-8 lg:gap-12 px-4 sm:px-6 py-8 sm:py-16">
          {/* Mobile: Auth Card First (lg:col-span-5, order-last on desktop) */}
          <div className="w-full max-w-md mx-auto lg:mx-0 lg:col-span-5 lg:order-last flex items-center justify-center">
            <AuthCard />
          </div>

          {/* Desktop: Hero Content (lg:col-span-7, order-first on desktop) */}
          <div className="lg:col-span-7 space-y-8 flex flex-col justify-center">
            {/* Professional Tagline */}
            <div className="space-y-4">
              <span className="inline-block px-3 py-1.5 rounded-md text-xs font-black uppercase tracking-wider bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/30">
                Transparent Governance
              </span>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-display tracking-tight text-[var(--ink)] leading-[1.1]">
                Empower Your Community.
                <br />
                <span className="text-[var(--accent)]">Resolve Issues Together.</span>
              </h1>

              <p className="text-base sm:text-lg text-[var(--muted)] leading-relaxed max-w-2xl">
                Sochi streamlines housing society management by connecting residents and administrators through a transparent, efficient complaint resolution system. Say goodbye to lost issues and endless follow-ups.
              </p>
            </div>

            {/* Key Benefits */}
            <div className="space-y-4">
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Why Choose Sochi</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[var(--accent)]/20 flex items-center justify-center mt-1">
                    <div className="w-2 h-2 rounded-full bg-[var(--accent)]" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-[var(--ink)]">Real-Time Tracking</p>
                    <p className="text-xs text-[var(--muted)]">Monitor complaint status from filing to resolution</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[var(--accent)]/20 flex items-center justify-center mt-1">
                    <div className="w-2 h-2 rounded-full bg-[var(--accent)]" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-[var(--ink)]">Transparent Process</p>
                    <p className="text-xs text-[var(--muted)]">Every step is visible and accountable</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[var(--accent)]/20 flex items-center justify-center mt-1">
                    <div className="w-2 h-2 rounded-full bg-[var(--accent)]" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-[var(--ink)]">Community Powered</p>
                    <p className="text-xs text-[var(--muted)]">Upvote shared issues to show priority</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[var(--accent)]/20 flex items-center justify-center mt-1">
                    <div className="w-2 h-2 rounded-full bg-[var(--accent)]" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-[var(--ink)]">Instant Notifications</p>
                    <p className="text-xs text-[var(--muted)]">Get updates via email the moment things change</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[var(--border-token)]">
              <div>
                <p className="text-2xl sm:text-3xl font-black font-display text-[var(--accent)]">100%</p>
                <p className="text-xs text-[var(--muted)] font-semibold mt-1">Secure &<br />Private</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black font-display text-[var(--accent)]">3</p>
                <p className="text-xs text-[var(--muted)] font-semibold mt-1">Languages<br />Supported</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black font-display text-[var(--accent)]">AI</p>
                <p className="text-xs text-[var(--muted)] font-semibold mt-1">Smart Reply<br />Assistance</p>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section - Below the fold on mobile */}
        <div className="w-full bg-[var(--surface)] border-t border-[var(--border-token)]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black font-display text-[var(--ink)] mb-2">
                  Everything You Need to Manage Your Society
                </h2>
                <p className="text-sm text-[var(--muted)]">
                  From filing complaints to tracking resolutions, all in one place
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Feature 1 */}
                <div className="p-5 rounded-lg border border-[var(--border-token)] bg-[var(--surface-2)]/50 hover:bg-[var(--surface-2)] transition-colors">
                  <div className="w-10 h-10 rounded-md bg-[var(--accent)]/10 flex items-center justify-center mb-3">
                    <span className="text-lg">📋</span>
                  </div>
                  <h3 className="font-bold text-sm text-[var(--ink)] mb-1">Smart Complaints</h3>
                  <p className="text-xs text-[var(--muted)]">
                    Attach photos, set priority levels, and categorize issues for faster resolution
                  </p>
                </div>

                {/* Feature 2 */}
                <div className="p-5 rounded-lg border border-[var(--border-token)] bg-[var(--surface-2)]/50 hover:bg-[var(--surface-2)] transition-colors">
                  <div className="w-10 h-10 rounded-md bg-[var(--accent)]/10 flex items-center justify-center mb-3">
                    <span className="text-lg">👥</span>
                  </div>
                  <h3 className="font-bold text-sm text-[var(--ink)] mb-1">Team Collaboration</h3>
                  <p className="text-xs text-[var(--muted)]">
                    Admins and volunteers manage requests efficiently with clear workflow automation
                  </p>
                </div>

                {/* Feature 3 */}
                <div className="p-5 rounded-lg border border-[var(--border-token)] bg-[var(--surface-2)]/50 hover:bg-[var(--surface-2)] transition-colors">
                  <div className="w-10 h-10 rounded-md bg-[var(--accent)]/10 flex items-center justify-center mb-3">
                    <span className="text-lg">🔔</span>
                  </div>
                  <h3 className="font-bold text-sm text-[var(--ink)] mb-1">Live Updates</h3>
                  <p className="text-xs text-[var(--muted)]">
                    Instant email notifications keep everyone informed at every step
                  </p>
                </div>

                {/* Feature 4 */}
                <div className="p-5 rounded-lg border border-[var(--border-token)] bg-[var(--surface-2)]/50 hover:bg-[var(--surface-2)] transition-colors">
                  <div className="w-10 h-10 rounded-md bg-[var(--accent)]/10 flex items-center justify-center mb-3">
                    <span className="text-lg">🌐</span>
                  </div>
                  <h3 className="font-bold text-sm text-[var(--ink)] mb-1">Multi-Language</h3>
                  <p className="text-xs text-[var(--muted)]">
                    Built for India: English, Hindi, and Marathi language support included
                  </p>
                </div>

                {/* Feature 5 */}
                <div className="p-5 rounded-lg border border-[var(--border-token)] bg-[var(--surface-2)]/50 hover:bg-[var(--surface-2)] transition-colors">
                  <div className="w-10 h-10 rounded-md bg-[var(--accent)]/10 flex items-center justify-center mb-3">
                    <span className="text-lg">📱</span>
                  </div>
                  <h3 className="font-bold text-sm text-[var(--ink)] mb-1">Mobile First</h3>
                  <p className="text-xs text-[var(--muted)]">
                    Works perfectly on any device, install as an app for offline access
                  </p>
                </div>

                {/* Feature 6 */}
                <div className="p-5 rounded-lg border border-[var(--border-token)] bg-[var(--surface-2)]/50 hover:bg-[var(--surface-2)] transition-colors">
                  <div className="w-10 h-10 rounded-md bg-[var(--accent)]/10 flex items-center justify-center mb-3">
                    <span className="text-lg">🔒</span>
                  </div>
                  <h3 className="font-bold text-sm text-[var(--ink)] mb-1">Privacy Focused</h3>
                  <p className="text-xs text-[var(--muted)]">
                    Your data stays with you. Each society is completely isolated and secure
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="w-full bg-[var(--accent)]/5 border-t border-[var(--border-token)]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 text-center">
            <p className="text-sm text-[var(--muted)] mb-2">Ready to transform your society?</p>
            <p className="text-lg sm:text-xl font-bold text-[var(--ink)]">
              Join thousands of residents already using Sochi for transparent governance
            </p>
          </div>
        </div>
      </main>
    );
  }

  // For EXISTING users (who have societyIds), skip onboarding completely.
  // They should only see preloader + dashboard, never the "Join/New Society" screen.
  const isExistingUser = profile && (profile.societyIds?.length ?? 0) > 0;

  // Authenticated but no approved active society selected: Show Onboarding / Pending screen
  // ONLY for new users who have no societies yet
  if (!isExistingUser && (!currentSocietyId || currentMember?.status !== "active")) {
    return (
      <main className="min-h-screen bg-[var(--bg)] text-[var(--ink)] flex flex-col">
        <Navbar activeTab="complaints" onTabChange={() => {}} />
        <div className="flex-1 max-w-4xl mx-auto px-4 py-10 w-full flex items-center justify-center">
          <SocietyOnboarding />
        </div>
      </main>
    );
  }

  // Existing user loading their societies: show preloader but NOT onboarding screen
  if (isExistingUser && !currentSocietyId) {
    return (
      <>
        {/* Show preloader while societies are loading */}
        <AnimatePresence>
          {showPreloader && (
            <Preloader onComplete={() => setShowPreloader(false)} />
          )}
        </AnimatePresence>
        <main className="min-h-screen bg-[var(--bg)] text-[var(--ink)] flex flex-col">
          <Navbar activeTab="complaints" onTabChange={() => {}} />
          <div className="flex-1 max-w-4xl mx-auto px-4 py-10 w-full flex items-center justify-center">
            {/* Loading skeleton */}
            <div className="text-[var(--muted)]">Loading your societies...</div>
          </div>
        </main>
      </>
    );
  }

  // Active Society View
  return (
    <>
      {/* Preloader — overlays dashboard on first sign-in, then fades away */}
      <AnimatePresence>
        {showPreloader && (
          <Preloader onComplete={() => setShowPreloader(false)} />
        )}
      </AnimatePresence>

      <main className="min-h-screen bg-[var(--bg)] text-[var(--ink)] flex flex-col">
      <Navbar activeTab={activeTab} onTabChange={(tab) => {
        setActiveTab(tab);
        setSelectedComplaintId(null);
      }} />

       {/* PWA Install Banner */}
       {showInstallBanner && (
         <div className="bg-[var(--surface-2)] border-b border-[var(--border-token)] px-4 py-2.5 text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
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
               className="h-11 min-h-[44px] px-3 rounded bg-[var(--ink)] text-[var(--ink-inverse)] text-xs font-bold"
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
    </>
  );
}
