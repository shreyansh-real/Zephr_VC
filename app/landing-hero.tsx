"use client";

import { useState } from "react";
import Link from "next/link";
import { TypewriterEffectSmooth } from "@/components/ui/typewriter-effect";
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision";
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles,
  Droplets,
  Volume2,
  Users,
  CheckCircle2,
  Radio,
  Send,
  BellRing,
  ArrowUpDown,
  ShieldAlert,
  MessageSquareQuote,
  Layers,
  Clock,
  Check,
  Building,
} from "lucide-react";

interface TabData {
  id: string;
  label: string;
  icon: typeof Droplets;
  category: string;
  title: string;
  urgency: "Critical" | "High" | "Medium";
  urgencyColor: string;
  badgeBg: string;
  flats: string[];
  complaintCount: number;
  sampleChat: string;
  language: string;
  statusMessage: string;
  broadcastMessage: string;
}

const TABS: TabData[] = [
  {
    id: "water",
    label: "Water supply",
    icon: Droplets,
    category: "Utility & Water",
    title: "Tower B overhead tank empty (motor pump trip)",
    urgency: "Critical",
    urgencyColor: "var(--critical)",
    badgeBg: "var(--critical-tint)",
    flats: ["B-102", "B-204", "B-501", "B-702", "B-903"],
    complaintCount: 14,
    sampleChat: "Paani nahi aa raha 6:30 baje se... please check pump!",
    language: "Hinglish & Hindi",
    statusMessage: "Auto-clustered 14 messages into 1 ticket",
    broadcastMessage: "Plumber onsite. Motor reset completed. Water supply resuming by 8:30 AM.",
  },
  {
    id: "lift",
    label: "Elevator breakdown",
    icon: ArrowUpDown,
    category: "Lift maintenance",
    title: "Tower A passenger elevator stuck on 4th floor",
    urgency: "Critical",
    urgencyColor: "var(--critical)",
    badgeBg: "var(--critical-tint)",
    flats: ["A-401", "A-404", "A-802", "A-1002"],
    complaintCount: 8,
    sampleChat: "Lift #2 making strange sound and halted at 4th floor.",
    language: "English",
    statusMessage: "Escalated to Emergency Technician Dispatch",
    broadcastMessage: "Technician at Tower A. Lift #1 operational, Lift #2 under active inspection.",
  },
  {
    id: "noise",
    label: "Noise & quiet hours",
    icon: Volume2,
    category: "Community bylaws",
    title: "Clubhouse terrace loud music after 10:30 PM",
    urgency: "Medium",
    urgencyColor: "var(--high)",
    badgeBg: "var(--high-tint)",
    flats: ["C-201", "C-202", "C-305"],
    complaintCount: 5,
    sampleChat: "Too loud party noise near Tower C terrace past quiet hours.",
    language: "English",
    statusMessage: "Routed to Night Security Desk",
    broadcastMessage: "Security team dispatched to reduce clubhouse music volume per society rules.",
  },
  {
    id: "security",
    label: "Security & gates",
    icon: ShieldAlert,
    category: "Premises security",
    title: "Main Gate 2 boom barrier sensor malfunction",
    urgency: "High",
    urgencyColor: "var(--high)",
    badgeBg: "var(--high-tint)",
    flats: ["D-101", "D-203", "A-105"],
    complaintCount: 6,
    sampleChat: "Gate 2 boom barrier is stuck open, vehicles entering unchecked.",
    language: "English & Hinglish",
    statusMessage: "Auto-assigned to Security Supervisor",
    broadcastMessage: "Manual guard stationed at Gate 2. Sensor replacement scheduled for 2:00 PM.",
  },
];

export function LandingHero() {
  const [activeTab, setActiveTab] = useState<string>("water");
  const currentTab = TABS.find((t) => t.id === activeTab) || TABS[0];

  const typewriterWords = [
    { text: "Turn" },
    { text: "WhatsApp" },
    { text: "chaos" },
    { text: "into" },
    { text: "prioritized," },
    { text: "solved" },
    { text: "society" },
    { text: "issues." },
  ];

  return (
    <BackgroundBeamsWithCollision className="py-8 md:py-14">
      <div className="max-w-[1240px] w-full mx-auto px-4 md:px-8 relative z-10">

        {/* Top badge */}
        <div className="flex justify-center md:justify-start mb-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[var(--border-token)] bg-[var(--surface)]/90 backdrop-blur-md shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-[var(--low)] animate-pulse" />
            <span className="text-[13px] font-semibold text-[var(--ink)]">
              AI society triage · Built for RWA committees &amp; residents
            </span>
          </div>
        </div>

        {/* Hero headline */}
        <div className="max-w-[960px] mb-8 text-center md:text-left">
          <div className="mb-4">
            <TypewriterEffectSmooth
              words={typewriterWords}
              className="justify-center md:justify-start"
            />
          </div>

          {/* Subtitle */}
          <p className="text-[17px] sm:text-[19px] md:text-[21px] font-medium text-[var(--muted-foreground)] mb-8 leading-relaxed max-w-[800px]">
            Residents report in plain English, Hindi, or Hinglish. AI groups duplicate messages automatically into clear tickets, highlights critical emergencies, and lets committees send a reply in one click.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-7">
            <Link
              href="/report"
              className="group relative inline-flex items-center justify-center gap-2.5 h-13 px-7 rounded-xl font-bold text-[16px] bg-[var(--ink)] text-[var(--ink-inverse)] shadow-md hover:opacity-95 hover:scale-[1.01] active:scale-[0.99] transition-all focus:outline-none focus:ring-4 focus:ring-[var(--border-strong)]"
            >
              <span>Report a problem (no app needed)</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              href="/committee"
              className="inline-flex items-center justify-center gap-2.5 h-13 px-7 rounded-xl font-bold text-[16px] border-2 border-[var(--border-token)] text-[var(--ink)] bg-[var(--surface)] hover:bg-[var(--surface-2)] hover:border-[var(--ink)] hover:scale-[1.01] active:scale-[0.99] transition-all focus:outline-none focus:ring-4 focus:ring-[var(--border-strong)] shadow-sm"
            >
              <ShieldCheck className="w-4 h-4 text-[var(--ink)]" />
              <span>Committee dashboard</span>
            </Link>
          </div>

          {/* Quick value props */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 sm:gap-6 text-[14px] font-semibold text-[var(--muted-foreground)]">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[var(--low)]" />
              <span>Multilingual — Hindi, English, Hinglish</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-[var(--high)]" />
              <span>Auto-groups duplicate complaints</span>
            </div>
            <div className="flex items-center gap-1.5">
              <BellRing className="w-4 h-4 text-[var(--ink)]" />
              <span>1-click broadcast replies</span>
            </div>
          </div>
        </div>

        {/* ── Recreated Minimalist Live Simulation Interactive Hub ── */}
        <div className="rounded-2xl border border-[var(--border-token)] bg-[var(--surface)] shadow-lg overflow-hidden backdrop-blur-md">

          {/* Header Bar with Live Indicator & Tab Selector */}
          <div className="px-5 py-4 border-b border-[var(--border-token)] bg-[var(--surface-2)] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Radio className="w-4 h-4 text-[var(--muted-foreground)] animate-pulse" />
              <span className="text-[14px] font-semibold text-[var(--ink)]">
                Live interactive simulation · Palm Grove Heights RWA
              </span>
            </div>

            {/* Category Switcher Tabs (Lucide icons, no emojis) */}
            <div className="flex items-center gap-1 bg-[var(--surface)] p-1 rounded-xl border border-[var(--border-token)] overflow-x-auto max-w-full">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-semibold rounded-lg transition-all whitespace-nowrap ${
                      active
                        ? "bg-[var(--ink)] text-[var(--ink-inverse)] shadow-sm"
                        : "text-[var(--muted-foreground)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)]"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3-Step Clean Visual Grid */}
          <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">

            {/* Step 1: Resident Submission */}
            <div className="lg:col-span-4 flex flex-col justify-between p-4 sm:p-5 rounded-xl border border-[var(--border-token)] bg-[var(--surface-2)]">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                    <MessageSquareQuote className="w-3.5 h-3.5" />
                    <span>1. Resident report</span>
                  </div>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-[var(--surface)] text-[var(--ink)] border border-[var(--border-token)]">
                    {currentTab.language}
                  </span>
                </div>

                <div className="p-3.5 rounded-lg bg-[var(--surface)] border border-[var(--border-token)] shadow-2xs mb-3">
                  <p className="text-[14px] text-[var(--ink)] leading-relaxed italic">
                    &ldquo;{currentTab.sampleChat}&rdquo;
                  </p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-[12px] font-semibold text-[var(--muted-foreground)] pt-2 border-t border-[var(--border-token)]">
                  <span>Flats affected</span>
                  <span className="text-[var(--ink)]">{currentTab.complaintCount} residents</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {currentTab.flats.map((flat) => (
                    <span
                      key={flat}
                      className="text-[12px] font-semibold px-2 py-0.5 rounded bg-[var(--surface)] text-[var(--ink)] border border-[var(--border-token)]"
                    >
                      {flat}
                    </span>
                  ))}
                  <span className="text-[12px] font-medium text-[var(--muted-foreground)] px-1 self-center">
                    +{currentTab.complaintCount - currentTab.flats.length} more
                  </span>
                </div>
              </div>
            </div>

            {/* Step 2: AI Clustering & Urgency */}
            <div className="lg:col-span-4 flex flex-col justify-between p-4 sm:p-5 rounded-xl border border-[var(--border-token)] bg-[var(--surface-2)]">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                    <Layers className="w-3.5 h-3.5" />
                    <span>2. AI auto-cluster</span>
                  </div>
                  <span
                    className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: currentTab.badgeBg,
                      color: currentTab.urgencyColor,
                      border: `1px solid ${currentTab.urgencyColor}`,
                    }}
                  >
                    {currentTab.urgency} priority
                  </span>
                </div>

                <div className="p-3.5 rounded-lg bg-[var(--surface)] border border-[var(--border-token)] shadow-2xs mb-3">
                  <div className="text-[11px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-1">
                    {currentTab.category}
                  </div>
                  <h4 className="text-[15px] font-bold text-[var(--ink)] leading-snug">
                    {currentTab.title}
                  </h4>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border-token)]">
                <Sparkles className="w-4 h-4 text-[var(--high)] shrink-0" />
                <span className="text-[12px] font-medium text-[var(--ink)] leading-tight">
                  {currentTab.statusMessage}
                </span>
              </div>
            </div>

            {/* Step 3: Committee One-Click Resolution */}
            <div className="lg:col-span-4 flex flex-col justify-between p-4 sm:p-5 rounded-xl border-2 border-[var(--ink)] bg-[var(--surface)]">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider text-[var(--ink)]">
                    <Send className="w-3.5 h-3.5 text-[var(--ink)]" />
                    <span>3. 1-Click broadcast</span>
                  </div>
                  <span className="text-[11px] font-bold text-[var(--low)] flex items-center gap-1">
                    <Check className="w-3 h-3" /> Ready
                  </span>
                </div>

                <div className="p-3.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border-token)] text-[13px] text-[var(--ink)] leading-relaxed mb-3">
                  &ldquo;{currentTab.broadcastMessage}&rdquo;
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[var(--border-token)]">
                <span className="text-[12px] font-medium text-[var(--muted-foreground)]">
                  Dispatched to {currentTab.complaintCount} residents
                </span>
                <Link
                  href="/committee"
                  className="inline-flex items-center gap-1 text-[13px] font-bold text-[var(--ink)] hover:underline"
                >
                  <span>Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

          </div>

          {/* Bottom 4-Column Feature Strip (Lucide icons, no emojis) */}
          <div className="border-t border-[var(--border-token)] bg-[var(--surface-2)] px-5 py-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="flex flex-col items-center gap-1">
              <Droplets className="w-5 h-5 text-[var(--ink)]" />
              <span className="text-[13px] font-bold text-[var(--ink)]">Water &amp; utilities</span>
              <span className="text-[12px] text-[var(--muted-foreground)]">Instant pump trip alerts</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <ArrowUpDown className="w-5 h-5 text-[var(--high)]" />
              <span className="text-[13px] font-bold text-[var(--ink)]">Lift emergencies</span>
              <span className="text-[12px] text-[var(--muted-foreground)]">Escalation to technician</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Volume2 className="w-5 h-5 text-[var(--low)]" />
              <span className="text-[13px] font-bold text-[var(--ink)]">Noise &amp; parking</span>
              <span className="text-[12px] text-[var(--muted-foreground)]">Rule tracking &amp; security</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Users className="w-5 h-5 text-[var(--ink)]" />
              <span className="text-[13px] font-bold text-[var(--ink)]">Zero missed complaints</span>
              <span className="text-[12px] text-[var(--muted-foreground)]">Auditable society log</span>
            </div>
          </div>

        </div>

      </div>
    </BackgroundBeamsWithCollision>
  );
}
