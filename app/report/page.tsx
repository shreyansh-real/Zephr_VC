import { NavDock } from "@/components/nav-dock";
import { ReportForm } from "./report-form";

export default function ReportPage() {
  return (
    <div className="min-h-screen pb-28" style={{ backgroundColor: "var(--bg)" }}>
      <div className="ml-0 md:ml-[90px] transition-all">
        <main className="max-w-[620px] mx-auto px-4 sm:px-6 py-10 md:py-14">
          <div className="mb-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold bg-[var(--surface-2)] text-[var(--muted-foreground)] border border-[var(--border-token)] mb-3">
              Society Complaint Triage
            </span>
            <h1 className="font-display font-black text-[36px] md:text-[42px] leading-[1.1] tracking-[-0.02em] text-[var(--ink)]">
              What&apos;s the problem?
            </h1>
            <p className="text-[15px] text-[var(--muted-foreground)] mt-2">
              Report an issue in your building. Our AI triage reads and groups complaints in English, Hindi, or Hinglish.
            </p>
          </div>
          <ReportForm />
        </main>
      </div>
      <NavDock />
    </div>
  );
}
