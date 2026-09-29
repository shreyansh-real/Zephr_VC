import { NavDock } from "@/components/nav-dock";
import { ReportForm } from "./report-form";
import { ShieldCheck, Sparkles, Layers, CheckCircle2, Clock, MailCheck } from "lucide-react";

export default function ReportPage() {
  return (
    <div className="min-h-screen pb-28" style={{ backgroundColor: "var(--bg)" }}>
      <NavDock />
      <div className="ml-0 md:ml-[90px] transition-all">
        <main className="max-w-[880px] mx-auto px-4 sm:px-6 lg:px-8 pt-18 md:pt-12 pb-8">
          
          {/* Top Stage Header - Minimal & Direct */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[12px] font-semibold bg-[var(--surface-2)] text-[var(--muted-foreground)] border border-[var(--border-token)] mb-3">
              <span className="w-2 h-2 rounded-full bg-[var(--resolved)] animate-pulse" />
              Resident Rapid Resolution Portal
            </div>
            <h1 className="font-display font-black text-[30px] sm:text-[40px] md:text-[46px] leading-[1.08] tracking-[-0.03em] text-[var(--ink)]">
              Submit a Maintenance Report
            </h1>
            <p className="text-[14px] sm:text-[15px] text-[var(--muted-foreground)] mt-2.5 max-w-[560px] mx-auto leading-relaxed">
              Report your issue in Hindi, English, or Hinglish. AI will triage, group duplicate neighbor complaints, and dispatch directly to the committee.
            </p>
          </div>

          {/* Centerpiece: High-Priority Elevated Form */}
          <div className="mb-10">
            <ReportForm />
          </div>

          {/* Supporting Details & Workflow Cards (Positioned smoothly below the form) */}
          <div className="pt-4 border-t border-[var(--border-token)]">
            <div className="text-center mb-5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                Automated Resolution Lifecycle
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-[var(--border-token)] bg-[var(--surface)] flex flex-col gap-2 shadow-xs">
                <div className="w-8 h-8 rounded-lg bg-[var(--surface-2)] border border-[var(--border-token)] flex items-center justify-center text-[var(--ink)]">
                  <Sparkles size={16} />
                </div>
                <h3 className="text-[13px] font-bold text-[var(--ink)]">
                  1. AI Triage &amp; Prioritization
                </h3>
                <p className="text-[12px] text-[var(--muted-foreground)] leading-relaxed">
                  Extracts urgency levels (Critical, High, Medium) and categorizes issues accurately in any language.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-[var(--border-token)] bg-[var(--surface)] flex flex-col gap-2 shadow-xs">
                <div className="w-8 h-8 rounded-lg bg-[var(--surface-2)] border border-[var(--border-token)] flex items-center justify-center text-[var(--ink)]">
                  <Layers size={16} />
                </div>
                <h3 className="text-[13px] font-bold text-[var(--ink)]">
                  2. Neighbor Auto-Clustering
                </h3>
                <p className="text-[12px] text-[var(--muted-foreground)] leading-relaxed">
                  Consolidates simultaneous wing issues into one high-priority ticket instead of redundant chaos.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-[var(--border-token)] bg-[var(--surface)] flex flex-col gap-2 shadow-xs">
                <div className="w-8 h-8 rounded-lg bg-[var(--surface-2)] border border-[var(--border-token)] flex items-center justify-center text-[var(--ink)]">
                  <MailCheck size={16} />
                </div>
                <h3 className="text-[13px] font-bold text-[var(--ink)]">
                  3. Committee &amp; Email Dispatch
                </h3>
                <p className="text-[12px] text-[var(--muted-foreground)] leading-relaxed">
                  Assigns technicians and broadcasts official status updates directly to your registered email.
                </p>
              </div>
            </div>

            {/* Trust & Confidentiality Badges */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-6 pt-5 border-t border-[var(--border-token)]/60 text-[12px] text-[var(--muted-foreground)] font-medium">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck size={15} className="text-[var(--resolved)]" /> Strict Resident Privacy
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-[var(--resolved)]" /> Verified Committee Channel
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock size={15} className="text-[var(--resolved)]" /> Instant Real-Time Logging
              </span>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
