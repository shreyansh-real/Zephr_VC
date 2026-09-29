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
  BellRing
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
    label: "💧 Water Shortage",
    category: "Water Supply",
    title: "Tower B Overhead Tank Empty (Pump Trip)",
    urgency: "Critical",
    urgencyColor: "var(--critical)",
    badgeBg: "var(--critical-tint)",
    flats: ["B-102", "B-204", "B-501", "B-702", "B-903"],
    complaintCount: 14,
    sampleChat: '"Paani nahi aa raha 6:30 baje se... please check pump!"',
    resolutionTime: "Auto-escalated in 12s",
    broadcastMessage: "Plumber onsite. Motor reset completed. Water supply resuming by 8:30 AM."
  },
  {
    id: "lift",
    label: "🛗 Lift #2 Breakdown",
    category: "Elevator Maintenance",
    title: "Tower A Passenger Lift Stuck at 4th Floor",
    urgency: "Critical",
    urgencyColor: "var(--critical)",
    badgeBg: "var(--critical-tint)",
    flats: ["A-401", "A-404", "A-802"],
    complaintCount: 8,
    sampleChat: '"Lift #2 making strange sound and halted at 4th floor."',
    resolutionTime: "Technician dispatched",
    broadcastMessage: "OTIS technician at Tower A. Lift #1 operational, Lift #2 under inspection."
  },
  {
    id: "noise",
    label: "🔊 Late Night Noise",
    category: "Community & Quiet Hours",
    title: "Clubhouse Terrace Music After 10:30 PM",
    urgency: "Medium",
    urgencyColor: "var(--high)",
    badgeBg: "var(--high-tint)",
    flats: ["C-201", "C-202"],
    complaintCount: 5,
    sampleChat: '"Too loud party noise near Tower C terrace."',
    resolutionTime: "Guard alerted",
    broadcastMessage: "Security team requested clubhouse music volume be turned down per RWA rules."
  }
];

export function LandingHero() {
  const [activeTab, setActiveTab] = useState<string>("water");
  const currentTab = TABS.find((t) => t.id === activeTab) || TABS[0];

  const typewriterWords = [
    { text: "Smart" },
    { text: "AI" },
    { text: "Triage" },
    { text: "for" },
    { text: "Housing" },
    { text: "Societies." },
  ];

  return (
    <BackgroundBeamsWithCollision className="py-12 md:py-20">
      <div className="max-w-[1200px] w-full mx-auto px-4 md:px-8 relative z-10">
        
        {/* Top Community Badge */}
        <div className="flex justify-center md:justify-start mb-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--border-strong)] bg-[var(--surface)]/90 backdrop-blur-md shadow-sm">
            <span className="flex h-2.5 w-2.5 rounded-full bg-[var(--critical)] animate-pulse" />
            <span className="text-[13px] sm:text-[14px] font-bold tracking-wide text-[var(--ink)]">
              Next-Gen RWA & Society Management System
            </span>
          </div>
        </div>

        {/* 2-Line Hero Section Header */}
        <div className="max-w-[900px] mb-10 text-center md:text-left">
          {/* Line 1: Typewriter Animation */}
          <TypewriterEffectSmooth 
            words={typewriterWords} 
            className="justify-center md:justify-start -mb-1" 
          />

          {/* Line 2: Catchy & Informative Follow-up */}
          <h2 className="text-[26px] sm:text-[34px] md:text-[44px] font-black font-display tracking-tight text-[var(--ink)] leading-[1.15] mb-5">
            Turn WhatsApp chaos into prioritized, solved issues.
          </h2>

          {/* High-Clarity Subtitle */}
          <p className="text-[17px] sm:text-[19px] md:text-[20px] font-normal text-[var(--muted-foreground)] mb-8 leading-relaxed max-w-[780px]">
            Residents report problems in plain English, Hindi, or Hinglish. AI deduplicates 50+ messages, detects emergencies like water cuts &amp; lift failures, and equips your committee to resolve issues with 1-click WhatsApp broadcasts.
          </p>

          {/* High-Contrast CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-8">
            <Link
              href="/report"
              className="group relative inline-flex items-center justify-center gap-2.5 h-14 px-8 rounded-xl font-black text-[17px] bg-[var(--ink)] text-[var(--ink-inverse)] shadow-lg shadow-black/15 hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] transition-all focus:outline-none focus:ring-4 focus:ring-[var(--border-strong)]"
            >
              <span>Report a Problem (No App Needed)</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              href="/committee"
              className="inline-flex items-center justify-center gap-2.5 h-14 px-8 rounded-xl font-bold text-[17px] border-2 border-[var(--ink)] text-[var(--ink)] bg-[var(--surface)] hover:bg-[var(--surface-2)] hover:scale-[1.01] active:scale-[0.99] transition-all focus:outline-none focus:ring-4 focus:ring-[var(--border-strong)] shadow-sm"
            >
              <ShieldCheck className="w-5 h-5 text-[var(--ink)]" />
              <span>Committee Dashboard</span>
            </Link>
          </div>

          {/* Fast Feature Badges */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 sm:gap-6 text-[13px] sm:text-[14px] font-bold text-[var(--muted-foreground)]">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[var(--low)]" />
              <span>Multilingual (Hindi/English/Hinglish)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-[var(--high)]" />
              <span>Auto-Cluster 50+ Tickets</span>
            </div>
            <div className="flex items-center gap-1.5">
              <BellRing className="w-4 h-4 text-[var(--critical)]" />
              <span>1-Click RWA Broadcast</span>
            </div>
          </div>
        </div>

        {/* Interactive Society Pulse & Live Resolution Hub */}
        <div className="rounded-2xl border-2 border-[var(--border-token)] bg-[var(--surface)] shadow-lg overflow-hidden backdrop-blur-md">
          
          {/* Header Bar */}
          <div className="px-5 py-4 border-b border-[var(--border-token)] bg-[var(--surface-2)] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Radio className="w-4 h-4 text-[var(--critical)] animate-pulse" />
              <span className="text-[14px] font-bold text-[var(--ink)] tracking-wide">
                Live Society Simulation • Palm Grove Heights RWA
              </span>
            </div>

            {/* Quick Interactive Selector */}
            <div className="flex items-center gap-1.5 bg-[var(--surface)] p-1 rounded-lg border border-[var(--border-token)]">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1 text-[13px] font-bold rounded-md transition-all ${
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

          {/* Interactive Hub Grid */}
          <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Raw Resident Messages (Grouped Automatically) */}
            <div className="lg:col-span-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                  Incoming Resident Submissions
                </span>
                <span className="text-[12px] font-bold px-2.5 py-0.5 rounded-full bg-[var(--critical-tint)] text-[var(--critical)] border border-[var(--critical)]">
                  {currentTab.complaintCount} Complaints Clustered
                </span>
              </div>

              {/* Chat Simulation Bubble */}
              <div className="p-4 rounded-xl border border-[var(--border-token)] bg-[var(--surface-2)] flex flex-col gap-2">
                <div className="flex items-center justify-between text-[12px] text-[var(--muted-foreground)]">
                  <span className="font-bold text-[var(--ink)]">Recent Voice/Text Submission</span>
                  <span>Just now</span>
                </div>
                <p className="text-[15px] font-medium text-[var(--ink)] italic bg-[var(--surface)] p-3 rounded-lg border border-[var(--border-token)]">
                  {currentTab.sampleChat}
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[12px] font-semibold text-[var(--muted-foreground)]">Flats reporting:</span>
                  <div className="flex flex-wrap gap-1">
                    {currentTab.flats.map((flat) => (
                      <span key={flat} className="text-[11px] font-bold px-2 py-0.5 rounded bg-[var(--surface)] text-[var(--ink)] border border-[var(--border-token)]">
                        {flat}
                      </span>
                    ))}
                    <span className="text-[11px] font-bold px-1.5 py-0.5 text-[var(--muted-foreground)]">
                      +{currentTab.complaintCount - currentTab.flats.length} more
                    </span>
                  </div>
                </div>
              </div>

              {/* AI Auto-Diagnosis */}
              <div className="p-3.5 rounded-xl border border-[var(--border-token)] bg-[var(--surface)] flex items-center justify-between text-[13px]">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[var(--low)]" />
                  <span className="font-bold text-[var(--ink)]">AI Status:</span>
                  <span className="text-[var(--muted-foreground)]">{currentTab.resolutionTime}</span>
                </div>
                <span className="font-bold text-[var(--low)]">100% Grouped</span>
              </div>
            </div>

            {/* Right Column: AI Cluster & Instant RWA WhatsApp Broadcast */}
            <div className="lg:col-span-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                  Automated Committee Action
                </span>
                <span 
                  className="text-[12px] font-black px-2.5 py-0.5 rounded-full"
                  style={{ backgroundColor: currentTab.badgeBg, color: currentTab.urgencyColor, border: `1px solid ${currentTab.urgencyColor}` }}
                >
                  {currentTab.urgency} Priority
                </span>
              </div>

              {/* Resolved Action Box */}
              <div className="p-4 rounded-xl border-2 border-[var(--border-token)] bg-[var(--surface)] flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black px-2 py-0.5 rounded bg-[var(--surface-2)] text-[var(--ink)] uppercase">
                    {currentTab.category}
                  </span>
                </div>

                <h4 className="text-[18px] font-bold text-[var(--ink)]">
                  {currentTab.title}
                </h4>

                {/* Instant 1-Click WhatsApp Broadcast Feature */}
                <div className="mt-1 pt-3 border-t border-[var(--border-token)] flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-bold text-[var(--ink)] flex items-center gap-1.5">
                      <Send className="w-3.5 h-3.5 text-[var(--low)]" />
                      1-Click WhatsApp Broadcast to all {currentTab.complaintCount} Flats:
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-[var(--surface-2)] text-[13px] font-medium text-[var(--ink)] border border-[var(--border-token)] leading-snug">
                    📢 &quot;{currentTab.broadcastMessage}&quot;
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[12px] text-[var(--muted-foreground)] font-medium">
                    ⚡ Saves 45 minutes of committee manual calls
                  </span>
                  <Link
                    href="/committee"
                    className="text-[13px] font-bold text-[var(--ink)] hover:underline flex items-center gap-1"
                  >
                    Open in Dashboard &rarr;
                  </Link>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Society Benefits Strip */}
          <div className="border-t border-[var(--border-token)] bg-[var(--surface-2)] px-5 py-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="flex flex-col items-center">
              <Droplets className="w-5 h-5 text-[var(--critical)] mb-1" />
              <span className="text-[13px] font-bold text-[var(--ink)]">Water &amp; Power</span>
              <span className="text-[11px] text-[var(--muted-foreground)]">Auto pump trip alerts</span>
            </div>
            <div className="flex flex-col items-center">
              <Zap className="w-5 h-5 text-[var(--high)] mb-1" />
              <span className="text-[13px] font-bold text-[var(--ink)]">Lift Emergencies</span>
              <span className="text-[11px] text-[var(--muted-foreground)]">Instant technician dispatch</span>
            </div>
            <div className="flex flex-col items-center">
              <Volume2 className="w-5 h-5 text-[var(--low)] mb-1" />
              <span className="text-[13px] font-bold text-[var(--ink)]">Noise &amp; Parking</span>
              <span className="text-[11px] text-[var(--muted-foreground)]">Rule violation tracking</span>
            </div>
            <div className="flex flex-col items-center">
              <Users className="w-5 h-5 text-[var(--ink)] mb-1" />
              <span className="text-[13px] font-bold text-[var(--ink)]">Zero Resident Spam</span>
              <span className="text-[11px] text-[var(--muted-foreground)]">Clean committee peace</span>
            </div>
          </div>

        </div>

      </div>
    </BackgroundBeamsWithCollision>
  );
}
