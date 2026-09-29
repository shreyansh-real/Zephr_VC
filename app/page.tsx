import Link from "next/link";
import { Header } from "@/components/header";

export default function Home() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg)" }}>
      <Header />
      <main className="max-w-[560px] mx-auto px-4 py-16">
        <h1 className="font-display font-black text-[44px] md:text-[44px] leading-[1.05] tracking-[-0.02em] text-[var(--ink)] mb-8">
          Society Complaint Triage
        </h1>
        <p className="text-[18px] text-[var(--muted)] mb-10" style={{ lineHeight: 1.55 }}>
          An inbox that reads, ranks, groups and answers society complaints.
        </p>
        <div className="flex flex-col gap-4">
          <Link
            href="/report"
            className="inline-flex items-center justify-center h-12 px-8 rounded-lg font-bold text-[16px] bg-[var(--ink)] text-[var(--ink-inverse)] hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-[var(--border-strong)] focus:ring-offset-2"
          >
            Report a problem
          </Link>
          <Link
            href="/committee"
            className="inline-flex items-center justify-center h-12 px-8 rounded-lg font-bold text-[16px] border-[1.5px] border-[var(--ink)] text-[var(--ink)] bg-[var(--surface)] hover:bg-[var(--surface-2)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--border-strong)] focus:ring-offset-2"
          >
            Committee dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}
