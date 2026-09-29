"use client";

import { useRef } from "react";
import Link from "next/link";
import { ClusterCard } from "@/components/cluster-card";
import { TypewriterEffectSmooth } from "@/components/ui/typewriter-effect";

const DEMO_CLUSTER = {
  id: "demo",
  title: "No water in Block B",
  category: "Water",
  urgency: "High",
  status: "New",
  assignee: null,
  complaint_count: 7,
  flats: ["B-101", "B-102", "B-201"],
  needs_review: false,
  escalated: false,
  created_at: { _seconds: Math.floor(Date.now() / 1000) - 7200 },
  urgency_rank: 2,
};

const DEMO_MESSAGES = [
  { id: 1, from: "Flat B-201", text: "Bhai paani nahi aa raha subah se. Koi sun raha hai?" },
  { id: 2, from: "Flat B-102", text: "Same here. Water supply band hai since 6am." },
  { id: 3, from: "Flat B-304", text: "Lift ke andar smell aa rahi hai, please check karo." },
  { id: 4, from: "Flat B-101", text: "No water again. Third time this week. Pls fix urgently!!" },
];

export function LandingHero() {
  const hasCountedRef = useRef<boolean>(false);

  const typewriterWords = [
    { text: "20" },
    { text: "messages." },
    { text: "6" },
    { text: "issues." },
    { text: "Start" },
    { text: "with" },
    { text: "the" },
    { text: "red", className: "text-[var(--critical)]" },
    { text: "one.", className: "text-[var(--critical)]" },
  ];

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-12 md:py-16">
      {/* Headline & Typewriter */}
      <div className="max-w-[760px] mb-10">
        <TypewriterEffectSmooth words={typewriterWords} className="mb-2" />
        
        <p className="text-[18px] md:text-[20px] text-[var(--muted-foreground)] mb-8" style={{ lineHeight: 1.55 }}>
          AI reads, ranks, and groups every society complaint — so you act on what matters first.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/report"
            className="inline-flex items-center justify-center h-12 px-8 rounded-lg font-bold text-[16px] bg-[var(--ink)] text-[var(--ink-inverse)] hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-[var(--border-strong)] focus:ring-offset-2"
          >
            I live here: Report a problem
          </Link>
          <Link
            href="/committee"
            className="inline-flex items-center justify-center h-12 px-8 rounded-lg font-bold text-[16px] border-[1.5px] border-[var(--ink)] text-[var(--ink)] bg-[var(--surface)] hover:bg-[var(--surface-2)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--border-strong)] focus:ring-offset-2"
          >
            I&apos;m on the committee: Open dashboard
          </Link>
        </div>
      </div>

      {/* Before / After strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        {/* Before — raw messages */}
        <div
          className="rounded-[14px] border border-[var(--border-token)] overflow-hidden"
          style={{ backgroundColor: "var(--surface)" }}
          aria-label="Before: raw WhatsApp messages"
        >
          <div
            className="px-4 py-2 border-b border-[var(--border-token)] flex items-center gap-2"
            style={{ backgroundColor: "var(--surface-2)" }}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--critical)]" aria-hidden="true" />
            <span className="text-[13px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider">
              Before — 47 unread
            </span>
          </div>
          <ul className="divide-y divide-[var(--border-token)]">
            {DEMO_MESSAGES.map((msg) => (
              <li key={msg.id} className="px-4 py-3 flex flex-col gap-0.5">
                <span className="text-[13px] font-bold text-[var(--muted-foreground)]">{msg.from}</span>
                <span className="text-[15px] text-[var(--ink)]" style={{ lineHeight: 1.45 }}>{msg.text}</span>
              </li>
            ))}
            <li className="px-4 py-3 text-[15px] text-[var(--muted-foreground)] italic">
              +43 more messages…
            </li>
          </ul>
        </div>

        {/* After — one cluster card */}
        <div aria-label="After: AI-grouped issue">
          <div
            className="px-4 py-2 mb-2 rounded-t-[14px] border border-b-0 border-[var(--border-token)] flex items-center gap-2"
            style={{ backgroundColor: "var(--surface-2)" }}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--low)]" aria-hidden="true" />
            <span className="text-[13px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider">
              After — 6 issues, ranked
            </span>
          </div>
          <ClusterCard
            cluster={DEMO_CLUSTER}
            variant="row"
            onClick={() => {}}
            onUpdate={() => {}}
            hasCountedRef={hasCountedRef}
          />
        </div>
      </div>
    </div>
  );
}
