import { NavDock } from "@/components/nav-dock";
import { ReportForm } from "./report-form";
import { ShieldCheck, Sparkles, Clock, BellRing, Layers, CheckCircle2 } from "lucide-react";

export default function ReportPage() {
  return (
    <div className="min-h-screen pb-28" style={{ backgroundColor: "var(--bg)" }}>
      <div className="ml-0 md:ml-[90px] transition-all">
        <main className="max-w-[1140px] mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            
            {/* Left Column: Context, How it Works & Trust Badges */}
            <div className="lg:col-span-5 flex flex-col gap-6 lg:sticky lg:top-10">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[12px] font-semibold bg-[var(--surface-2)] text-[var(--muted-foreground)] border border-[var(--border-token)] mb-4">
                  <span className="w-2 h-2 rounded-full bg-[var(--resolved)] animate-pulse" />
                  Resident Helpdesk · AI Triage
                </div>
                <h1 className="font-display font-black text-[36px] sm:text-[44px] leading-[1.08] tracking-[-0.03em] text-[var(--ink)]">
                  Report an issue.<br />We&apos;ll handle the rest.
                </h1>
                <p className="text-[15px] text-[var(--muted-foreground)] mt-3 leading-relaxed">
                  Submit any maintenance, facility, or community issue. Our intelligent system automatically prioritizes it, groups similar reports from neighbors, and alerts the management committee.
                </p>
              </div>

              {/* How it works card */}
              <div className="rounded-2xl border border-[var(--border-token)] bg-[var(--surface)] p-5 flex flex-col gap-4 shadow-sm">
                <p className="text-[12px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                  How your report gets resolved
                </p>

                <div className="flex flex-col gap-3.5">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[var(--surface-2)] border border-[var(--border-token)] flex items-center justify-center text-[12px] font-bold text-[var(--ink)] shrink-0 mt-0.5">
                      1
                    </div>
                    <div>
                      <h4 className="text-[13px] font-semibold text-[var(--ink)] leading-tight">
                        AI Categorization & Ranking
                      </h4>
                      <p className="text-[12px] text-[var(--muted-foreground)] mt-0.5">
                        Detects urgency (Critical, High, Medium) and extracts the core issue in Hindi, English, or Hinglish.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[var(--surface-2)] border border-[var(--border-token)] flex items-center justify-center text-[12px] font-bold text-[var(--ink)] shrink-0 mt-0.5">
                      2
                    </div>
                    <div>
                      <h4 className="text-[13px] font-semibold text-[var(--ink)] leading-tight">
                        Smart Neighbor Clustering
                      </h4>
                      <p className="text-[12px] text-[var(--muted-foreground)] mt-0.5">
                        If 5 residents report the same water issue, it groups into 1 single escalated ticket instead of duplicate chaos.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[var(--surface-2)] border border-[var(--border-token)] flex items-center justify-center text-[12px] font-bold text-[var(--ink)] shrink-0 mt-0.5">
                      3
                    </div>
                    <div>
                      <h4 className="text-[13px] font-semibold text-[var(--ink)] leading-tight">
                        Direct Email Resolution Updates
                      </h4>
                      <p className="text-[12px] text-[var(--muted-foreground)] mt-0.5">
                        Committee volunteers review, assign a technician, and send official resolution updates directly to your email.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl border border-[var(--border-token)] bg-[var(--surface)] flex items-center gap-2.5">
                  <ShieldCheck size={18} className="text-[var(--resolved)] shrink-0" />
                  <span className="text-[12px] font-medium text-[var(--ink)] leading-tight">
                    Strict resident confidentiality
                  </span>
                </div>
                <div className="p-3.5 rounded-xl border border-[var(--border-token)] bg-[var(--surface)] flex items-center gap-2.5">
                  <Sparkles size={18} className="text-[var(--ink)] shrink-0" />
                  <span className="text-[12px] font-medium text-[var(--ink)] leading-tight">
                    Multilingual NLP comprehension
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: The Form */}
            <div className="lg:col-span-7">
              <ReportForm />
            </div>

          </div>
        </main>
      </div>
      <NavDock />
    </div>
  );
}
