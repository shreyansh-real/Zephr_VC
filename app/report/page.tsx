import { NavDock } from "@/components/nav-dock";
import { ReportForm } from "./report-form";

export default function ReportPage() {
  return (
    <div className="min-h-screen pb-28" style={{ backgroundColor: "var(--bg)" }}>
      <main className="max-w-[560px] mx-auto px-4 py-10">
        <h1 className="font-display font-black text-[44px] md:text-[44px] leading-[1.05] tracking-[-0.02em] text-[var(--ink)] mb-8">
          What&apos;s the problem?
        </h1>
        <ReportForm />
      </main>
      <NavDock />
    </div>
  );
}
