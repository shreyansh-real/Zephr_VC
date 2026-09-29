import { NavDock } from "@/components/nav-dock";
import { ReportForm } from "./report-form";
import { ShieldCheck, Sparkles, Layers, CheckCircle2, Clock, MessageSquareQuote } from "lucide-react";

export default function ReportPage() {
  return (
    <div className="min-h-screen pb-28" style={{ backgroundColor: "var(--bg)" }}>
      <div className="ml-0 md:ml-[90px] transition-all">
        <main className="max-w-[960px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          
          {/* Header Section (Concise & Focused) */}
          <div className="text-center max-w-[680px] mx-auto mb-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[13px] font-semibold bg-[var(--surface-2)] text-[var(--ink)] border border-[var(--border-token)] mb-3">
              <span className="w-2 h-2 rounded-full bg-[var(--resolved)] animate-pulse" />
              <span>Society Resident Portal · Direct Committee Dispatch</span>
            </div>
            <h1 className="font-display font-black text-[32px] sm:text-[42px] leading-tight tracking-[-0.03em] text-[var(--ink)]">
              Report an Issue
            </h1>
            <p className="text-[15px] sm:text-[16px] text-[var(--muted-foreground)] mt-2">
              No app download required. Type in English, Hindi, or Hinglish — AI groups your complaint with neighbors and notifies committee volunteers immediately.
            </p>
          </div>

          {/* Primary Focal Hero: The Form */}
          <div className="mb-12">
            <ReportForm />
          </div>

          {/* Supporting Trust & How It Works Cards (Placed Cleanly Underneath) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-[var(--border-token)]">
            <div className="p-4 rounded-2xl border border-[var(--border-token)] bg-[var(--surface)] flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-[var(--ink)] font-bold text-[14px]">
                <Layers className="w-4 h-4 text-[var(--high)]" />
                <span>Smart Neighbor Clustering</span>
              </div>
              <p className="text-[13px] text-[var(--muted-foreground)] leading-snug">
                Multiple reports from the same wing or floor are automatically combined into a single high-priority ticket.
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-[var(--border-token)] bg-[var(--surface)] flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-[var(--ink)] font-bold text-[14px]">
                <Sparkles className="w-4 h-4 text-[var(--low)]" />
                <span>Multilingual NLP</span>
              </div>
              <p className="text-[13px] text-[var(--muted-foreground)] leading-snug">
                Write freely in Hindi, Hinglish, or English. Our AI extracts urgency and categories automatically.
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-[var(--border-token)] bg-[var(--surface)] flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-[var(--ink)] font-bold text-[14px]">
                <ShieldCheck className="w-4 h-4 text-[var(--resolved)]" />
                <span>Confidential &amp; Direct</span>
              </div>
              <p className="text-[13px] text-[var(--muted-foreground)] leading-snug">
                Issues are sent directly to designated society volunteers and verified committee members.
              </p>
            </div>
          </div>

        </main>
      </div>
      <NavDock />
    </div>
  );
}
