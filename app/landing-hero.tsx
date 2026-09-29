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
} from "lucide-react";

interface TabData {
  id: string;
  label: string;
  category: string;
  title: string;
  urgency: "Critical" | "High" | "Medium";
  urgencyColor: string;
  badgeBg: string;
  flats: string[];
  complaintCount: number;
  sampleChat: string;
  resolutionTime: string;
  broadcastMessage: string;
}

const TABS: TabData[] = [
  {
    id: "water",
    label: "💧 Water shortage",
    category: "Water supply",
    title: "Tower B overhead tank empty (pump trip)",
    urgency: "Critical",
    urgencyColor: "var(--critical)",
    badgeBg: "var(--critical-tint)",
    flats: ["B-102", "B-204", "B-501", "B-702", "B-903"],
    complaintCount: 14,
    sampleChat: '"Paani nahi aa raha 6:30 baje se... please check pump!"',
    resolutionTime: "Grouped automatically",
    broadcastMessage: "Plumber onsite. Motor reset completed. Water supply resuming by 8:30 AM.",
  },
  {
    id: "lift",
    label: "🛗 Lift breakdown",
    category: "Elevator maintenance",
    title: "Tower A passenger lift stuck at 4th floor",
    urgency: "Critical",
    urgencyColor: "var(--critical)",
    badgeBg: "var(--critical-tint)",
    flats: ["A-401", "A-404", "A-802"],
    complaintCount: 8,
    sampleChat: '"Lift #2 making strange sound and halted at 4th floor."',
    resolutionTime: "Grouped automatically",
    broadcastMessage: "Technician at Tower A. Lift #1 operational, Lift #2 under inspection.",
  },
  {
    id: "noise",
    label: "🔊 Late night noise",
    category: "Community & quiet hours",
    title: "Clubhouse terrace music after 10:30 PM",
    urgency: "Medium",
    urgencyColor: "var(--high)",
    badgeBg: "var(--high-tint)",
    flats: ["C-201", "C-202"],
    complaintCount: 5,
    sampleChat: '"Too loud party noise near Tower C terrace."',
    resolutionTime: "Grouped automatically",
    broadcastMessage: "Security team asked to reduce clubhouse music volume per RWA rules.",
  },
];

export function LandingHero() {
  const [activeTab, setActiveTab] = useState<string>("water");
  const currentTab = TABS.find((t) => t.id === activeTab) || TABS[0];

  // Headline fully in --ink, no red
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
    <BackgroundBeamsWithCollision className="py-10 md:py-16">
      <div className="max-w-[1200px] w-full mx-auto px-4 md:px-8 relative z-10">

        {/* Top badge — no red dot */}
        <div className="flex justify-center md:justify-start mb-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[var(--border-strong)] bg-[var(--surface)]/90 backdrop-blur-md shadow-sm">
            <span className="flex h-2.5 w-2.5 rounded-full bg-[var(--muted-foreground)]" />
            <span className="text-[14px] font-semibold text-[var(--ink)]">
              AI society triage · Built for RWA committees &amp; residents
            </span>
          </div>
        </div>

        {/* Hero headline — fully --ink */}
        <div className="max-w-[960px] mb-8 text-center md:text-left">
          <div className="mb-4">
            <TypewriterEffectSmooth
              words={typewriterWords}
              className="justify-center md:justify-start"
            />
          </div>

          {/* Subtitle — corrected copy */}
          <p className="text-[17px] sm:text-[19px] md:text-[21px] font-medium text-[var(--muted-foreground)] mb-8 leading-relaxed max-w-[800px]">
            Residents report in plain English, Hindi, or Hinglish. AI groups duplicate messages automatically into clear tickets, highlights critical emergencies, and lets committees send a reply in one click.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-7">
            <Link
              href="/report"
              className="group relative inline-flex items-center justify-center gap-2.5 h-14 px-8 rounded-xl font-black text-[17px] bg-[var(--ink)] text-[var(--ink-inverse)] shadow-lg shadow-black/15 hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] transition-all focus:outline-none focus:ring-4 focus:ring-[var(--border-strong)]"
            >
              <span>Report a problem (no app needed)</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              href="/committee"
              className="inline-flex items-center justify-center gap-2.5 h-14 px-8 rounded-xl font-bold text-[17px] border-2 border-[var(--ink)] text-[var(--ink)] bg-[var(--surface)] hover:bg-[var(--surface-2)] hover:scale-[1.01] active:scale-[0.99] transition-all focus:outline-none focus:ring-4 focus:ring-[var(--border-strong)] shadow-sm"
            >
              <ShieldCheck className="w-5 h-5 text-[var(--ink)]" />
              <span>Committee dashboard</span>
            </Link>
          </div>

          {/* Feature badges — corrected copy, no red, min 14px */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 sm:gap-6 text-[14px] font-semibold text-[var(--muted-foreground)]">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[var(--low)]" />
              <span>Multilingual — Hindi, English, Hinglish</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-[var(--high)]" />
              <span>Groups duplicate messages automatically</span>
            </div>
            <div className="flex items-center gap-1.5">
              <BellRing className="w-4 h-4 text-[var(--ink)]" />
              <span>One-click reply, ready to send</span>
            </div>
          </div>
        </div>

        {/* Simulation panel */}
        <div className="rounded-2xl border-2 border-[var(--border-token)] bg-[var(--surface)] shadow-lg overflow-hidden backdrop-blur-md">

          {/* Header bar — Radio icon in muted, no red */}
          <div className="px-5 py-4 border-b border-[var(--border-token)] bg-[var(--surface-2)] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Radio className="w-4 h-4 text-[var(--muted-foreground)]" />
              <span className="text-[14px] font-semibold text-[var(--ink)]">
                Society simulation · Palm Grove Heights RWA
              </span>
            </div>

            {/* Tab selector — min 14px, sentence case */}
            <div className="flex items-center gap-1 bg-[var(--surface)] p-1 rounded-lg border border-[var(--border-token)]">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1 text-[14px] font-semibold rounded-md transition-all ${
                    activeTab === tab.id
                      ? "bg-[var(--ink)] text-[var(--ink-inverse)] shadow-sm"
                      : "text-[var(--muted-foreground)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Hub grid */}
          <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

            {/* Left: incoming submissions */}
            <div className="lg:col-span-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                {/* Sentence case, no uppercase tracking */}
                <span className="text-[14px] font-semibold text-[var(--muted-foreground)]">
                  Incoming resident submissions
                </span>
                {/* Chip — ink/surface, not red */}
                <span className="text-[14px] font-semibold px-2.5 py-0.5 rounded-full bg-[var(--surface-2)] text-[var(--ink)] border border-[var(--border-token)]">
                  {currentTab.complaintCount} grouped
                </span>
              </div>

              {/* Message bubble — "Recent submission", no "Voice" */}
              <div className="p-4 rounded-xl border border-[var(--border-token)] bg-[var(--surface-2)] flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-semibold text-[var(--ink)]">Recent submission</span>
                  <span className="text-[14px] text-[var(--muted-foreground)]">Just now</span>
                </div>
                <p className="text-[15px] font-medium text-[var(--ink)] italic bg-[var(--surface)] p-3 rounded-lg border border-[var(--border-token)]">
                  {currentTab.sampleChat}
                </p>
                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  <span className="text-[14px] text-[var(--muted-foreground)]">Flats reporting:</span>
                  <div className="flex flex-wrap gap-1">
                    {currentTab.flats.map((flat) => (
                      <span key={flat} className="text-[14px] font-semibold px-2 py-0.5 rounded bg-[var(--surface)] text-[var(--ink)] border border-[var(--border-token)]">
                        {flat}
                      </span>
                    ))}
                    <span className="text-[14px] text-[var(--muted-foreground)] px-1">
                      +{currentTab.complaintCount - currentTab.flats.length} more
                    </span>
                  </div>
                </div>
              </div>

              {/* AI status — min 14px */}
              <div className="p-3.5 rounded-xl border border-[var(--border-token)] bg-[var(--surface)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[var(--low)]" />
                  <span className="text-[14px] font-semibold text-[var(--ink)]">AI status:</span>
                  <span className="text-[14px] text-[var(--muted-foreground)]">{currentTab.resolutionTime}</span>
                </div>
                <span className="text-[14px] font-semibold text-[var(--low)]">Done</span>
              </div>
            </div>

            {/* Right: committee action */}
            <div className="lg:col-span-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-[14px] font-semibold text-[var(--muted-foreground)]">
                  Committee action
                </span>
                {/* Priority chip — red only for Critical */}
                <span
                  className="text-[14px] font-semibold px-2.5 py-0.5 rounded-full"
                  style={{
                    backgroundColor: currentTab.badgeBg,
                    color: currentTab.urgencyColor,
                    border: `1px solid ${currentTab.urgencyColor}`,
                  }}
                >
                  {currentTab.urgency} priority
                </span>
              </div>

              <div className="p-4 rounded-xl border-2 border-[var(--border-token)] bg-[var(--surface)] flex flex-col gap-3">
                {/* Category chip — sentence case, no uppercase */}
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-semibold px-2 py-0.5 rounded bg-[var(--surface-2)] text-[var(--ink)]">
                    {currentTab.category}
                  </span>
                </div>

                <h4 className="text-[18px] font-bold text-[var(--ink)]">
                  {currentTab.title}
                </h4>

                {/* Reply section — corrected label, Send icon in muted */}
                <div className="mt-1 pt-3 border-t border-[var(--border-token)] flex flex-col gap-2">
                  <span className="text-[14px] font-semibold text-[var(--ink)] flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
                    One-click reply, ready to send:
                  </span>
                  <div className="p-3 rounded-lg bg-[var(--surface-2)] text-[14px] text-[var(--ink)] border border-[var(--border-token)] leading-snug">
                    📢 &quot;{currentTab.broadcastMessage}&quot;
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[14px] text-[var(--muted-foreground)]">
                    Saves the committee manual follow-up calls
                  </span>
                  <Link
                    href="/committee"
                    className="text-[14px] font-semibold text-[var(--ink)] hover:underline flex items-center gap-1"
                  >
                    Open dashboard →
                  </Link>
                </div>
              </div>
            </div>

          </div>

          {/* Benefits strip — min 14px for all text */}
          <div className="border-t border-[var(--border-token)] bg-[var(--surface-2)] px-5 py-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="flex flex-col items-center gap-1">
              <Droplets className="w-5 h-5 text-[var(--ink)]" />
              <span className="text-[14px] font-semibold text-[var(--ink)]">Water &amp; power</span>
              <span className="text-[14px] text-[var(--muted-foreground)]">Pump trip alerts</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Zap className="w-5 h-5 text-[var(--high)]" />
              <span className="text-[14px] font-semibold text-[var(--ink)]">Lift emergencies</span>
              <span className="text-[14px] text-[var(--muted-foreground)]">Clear escalation path</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Volume2 className="w-5 h-5 text-[var(--low)]" />
              <span className="text-[14px] font-semibold text-[var(--ink)]">Noise &amp; parking</span>
              <span className="text-[14px] text-[var(--muted-foreground)]">Rule violation tracking</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Users className="w-5 h-5 text-[var(--ink)]" />
              <span className="text-[14px] font-semibold text-[var(--ink)]">No missed complaints</span>
              <span className="text-[14px] text-[var(--muted-foreground)]">Every report is logged</span>
            </div>
          </div>

        </div>
      </div>
    </BackgroundBeamsWithCollision>
  );
}
