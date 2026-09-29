"use client";

import { useRef } from "react";
import Link from "next/link";
import { ClusterCard } from "@/components/cluster-card";
import { TypewriterEffectSmooth } from "@/components/ui/typewriter-effect";
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision";
import { ArrowRight, ShieldCheck, Zap, MessageSquareWarning, Sparkles, CheckCircle2 } from "lucide-react";

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
    <BackgroundBeamsWithCollision className="py-12 md:py-20">
      <div className="max-w-[1200px] w-full mx-auto px-4 md:px-8 relative z-10">
        
        {/* Pill Badge */}
        <div className="flex justify-center md:justify-start mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[var(--border-strong)] bg-[var(--surface)]/90 backdrop-blur-sm shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-[var(--critical)] animate-pulse" />
            <span className="text-[13px] font-semibold tracking-wide text-[var(--ink)]">
              AI Society Triage • Built for RWA Committees
            </span>
          </div>
        </div>

        {/* Hero Top Grid */}
        <div className="max-w-[840px] mb-12 text-center md:text-left">
          {/* Animated Headline */}
          <TypewriterEffectSmooth 
            words={typewriterWords} 
            className="justify-center md:justify-start mb-4" 
          />

          {/* Subtitle */}
          <p className="text-[18px] sm:text-[20px] md:text-[22px] font-medium text-[var(--muted-foreground)] mb-8 leading-relaxed max-w-[720px]">
            AI reads noisy WhatsApp chats, extracts real problems, groups duplicates into single actionable clusters, and prioritizes urgent emergencies.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-8">
            <Link
              href="/report"
              className="group relative inline-flex items-center justify-center gap-2 h-14 px-8 rounded-xl font-bold text-[17px] bg-[var(--ink)] text-[var(--ink-inverse)] shadow-lg shadow-black/10 hover:opacity-95 hover:scale-[1.01] active:scale-[0.99] transition-all focus:outline-none focus:ring-4 focus:ring-[var(--border-strong)]"
            >
              <span>I live here: Report a problem</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              href="/committee"
              className="inline-flex items-center justify-center gap-2 h-14 px-8 rounded-xl font-bold text-[17px] border-2 border-[var(--ink)] text-[var(--ink)] bg-[var(--surface)]/80 backdrop-blur-sm hover:bg-[var(--surface-2)] hover:scale-[1.01] active:scale-[0.99] transition-all focus:outline-none focus:ring-4 focus:ring-[var(--border-strong)]"
            >
              <ShieldCheck className="w-5 h-5 text-[var(--ink)]" />
              <span>Committee Dashboard</span>
            </Link>
          </div>

          {/* Quick Value Metrics */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 sm:gap-6 text-[13px] sm:text-[14px] font-medium text-[var(--muted-foreground)]">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[var(--low)]" />
              <span>Hinglish & Multi-dialect AI</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-[var(--high)]" />
              <span>&lt; 3s Automated Triage</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[var(--critical)]" />
              <span>Zero Lost Complaints</span>
            </div>
          </div>
        </div>

        {/* Before / After Interactive Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          
          {/* Before — WhatsApp Chaos */}
          <div
            className="rounded-2xl border-2 border-[var(--border-token)] overflow-hidden shadow-sm backdrop-blur-sm"
            style={{ backgroundColor: "var(--surface)" }}
            aria-label="Before: raw WhatsApp messages"
          >
            <div
              className="px-5 py-3 border-b border-[var(--border-token)] flex items-center justify-between"
              style={{ backgroundColor: "var(--surface-2)" }}
            >
              <div className="flex items-center gap-2">
                <MessageSquareWarning className="w-4 h-4 text-[var(--critical)]" />
                <span className="text-[13px] font-bold text-[var(--ink)] uppercase tracking-wider">
                  Before: WhatsApp Chaos
                </span>
              </div>
              <span className="text-[12px] font-bold px-2 py-0.5 rounded-full bg-[var(--critical-tint)] text-[var(--critical)] border border-[var(--critical)]">
                47 unread
              </span>
            </div>
            <ul className="divide-y divide-[var(--border-token)]">
              {DEMO_MESSAGES.map((msg) => (
                <li key={msg.id} className="px-5 py-3.5 flex flex-col gap-1 transition-colors hover:bg-[var(--surface-2)]">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-bold text-[var(--ink)]">{msg.from}</span>
                    <span className="text-[11px] text-[var(--muted-foreground)]">Just now</span>
                  </div>
                  <span className="text-[15px] text-[var(--ink)]" style={{ lineHeight: 1.45 }}>{msg.text}</span>
                </li>
              ))}
              <li className="px-5 py-3 text-[14px] text-[var(--muted-foreground)] italic flex items-center justify-between bg-[var(--surface-2)]/50">
                <span>+43 more duplicate complaints buried in chat…</span>
                <span className="text-[12px] font-medium text-[var(--critical)]">Unresolved</span>
              </li>
            </ul>
          </div>

          {/* After — AI Clustered & Actionable */}
          <div aria-label="After: AI-grouped issue" className="flex flex-col">
            <div
              className="px-5 py-3 rounded-t-2xl border-2 border-b-0 border-[var(--border-token)] flex items-center justify-between"
              style={{ backgroundColor: "var(--surface-2)" }}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[var(--low)]" />
                <span className="text-[13px] font-bold text-[var(--ink)] uppercase tracking-wider">
                  After: AI Clustered & Ranked
                </span>
              </div>
              <span className="text-[12px] font-bold px-2 py-0.5 rounded-full bg-[var(--low-tint)] text-[var(--low)] border border-[var(--low)]">
                6 clean tickets
              </span>
            </div>
            
            <div className="rounded-b-2xl border-2 border-t-0 border-[var(--border-token)] overflow-hidden shadow-sm">
              <ClusterCard
                cluster={DEMO_CLUSTER}
                variant="row"
                onClick={() => {}}
                onUpdate={() => {}}
                hasCountedRef={hasCountedRef}
              />
            </div>

            <p className="text-[13px] text-[var(--muted-foreground)] mt-2.5 px-2 text-center md:text-left">
              💡 7 resident messages automatically linked to 1 water supply cluster with 1-click committee broadcast reply.
            </p>
          </div>
        </div>

      </div>
    </BackgroundBeamsWithCollision>
  );
}
