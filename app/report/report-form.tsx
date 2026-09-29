"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { UrgencyChip, CategoryChip, type UrgencyLevel, type CategoryType } from "@/components/urgency";
import {
  CheckCircle2,
  AlertCircle,
  Building2,
  User,
  Mail,
  MessageSquareText,
  Send,
  Sparkles,
  RotateCcw,
  Droplets,
  ArrowUpDown,
  Volume2,
  Trash2,
  ShieldAlert,
  Zap,
  Loader2,
  Check,
  Globe2,
  CornerDownLeft,
  Flame,
} from "lucide-react";

interface SuccessData {
  category: string;
  urgency: string;
  summary: string;
  cluster_size: number;
}

interface QuickCategory {
  id: string;
  label: string;
  icon: typeof Droplets;
  category: CategoryType;
  template: string;
}

const QUICK_CATEGORIES: QuickCategory[] = [
  { id: "water", label: "Water Supply", icon: Droplets, category: "Water", template: "No water supply or very low pressure in the flat." },
  { id: "lift", label: "Lift / Elevator", icon: ArrowUpDown, category: "Lift", template: "Elevator stuck or malfunctioning on our floor." },
  { id: "power", label: "Common Power", icon: Zap, category: "Other", template: "Corridor / stairway lights not working." },
  { id: "noise", label: "Noise Disturbance", icon: Volume2, category: "Noise", template: "Loud noise / construction work during quiet hours." },
  { id: "clean", label: "Cleanliness", icon: Trash2, category: "Cleaning", template: "Garbage / debris not cleared from the corridor." },
  { id: "security", label: "Security & Gate", icon: ShieldAlert, category: "Security", template: "Main gate barrier or security sensor issue." },
];

export function ReportForm() {
  const [flatNo, setFlatNo] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [text, setText] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [success, setSuccess] = useState<SuccessData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isMac, setIsMac] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setIsMac(typeof navigator !== "undefined" && /Mac|iPhone|iPad|iPod/.test(navigator.userAgent));
  }, []);

  // Cycle loading status text for smooth AI feedback
  useEffect(() => {
    if (!loading) {
      setLoadingStep(0);
      return;
    }
    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev + 1) % 3);
    }, 900);
    return () => clearInterval(interval);
  }, [loading]);

  // Real-time language and AI triage heuristics
  const liveAnalysis = useMemo(() => {
    const raw = text.trim();
    if (!raw) return null;

    let lang = "English";
    if (/[^\u0000-\u007F]/.test(raw)) {
      lang = "Hindi";
    } else if (/\b(pani|paani|bhai|yaar|dekh|karo|nahi|nhi|hai|ho|aarha|aaraha|gaya|kripya|bijli|awaaz|shor)\b/i.test(raw)) {
      lang = "Hinglish";
    }

    let detectedCat: CategoryType = "Other";
    const lower = raw.toLowerCase();
    if (/\b(water|tap|leak|pipe|supply|paani|pani|tank)\b/i.test(lower)) detectedCat = "Water";
    else if (/\b(lift|elevator|stuck)\b/i.test(lower)) detectedCat = "Lift";
    else if (/\b(noise|loud|music|party|shor|awaaz)\b/i.test(lower)) detectedCat = "Noise";
    else if (/\b(garbage|trash|clean|smell|dirty|kachra)\b/i.test(lower)) detectedCat = "Cleaning";
    else if (/\b(gate|security|guard|barrier|camera|theft)\b/i.test(lower)) detectedCat = "Security";
    else if (/\b(power|light|electricity|bulb|wire|meter|bijli)\b/i.test(lower)) detectedCat = "Other";

    const isUrgent = /\b(emergency|urgent|danger|stuck|overflow|fire|burst|current|shock|critical|immediately)\b/i.test(lower);

    return {
      lang,
      detectedCat,
      isUrgent,
    };
  }, [text]);

  function validate(): boolean {
    const errs: Record<string, string> = {};
    const cleanFlat = flatNo.trim();
    if (!cleanFlat) {
      errs.flat_no = "Required (e.g. C-220)";
    } else if (!/^[A-Za-z0-9][-A-Za-z0-9]{0,9}$/.test(cleanFlat)) {
      errs.flat_no = "Invalid format";
    }

    if (!name.trim()) {
      errs.resident_name = "Name / alias required";
    }

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = "Invalid email format";
    }

    const cleanText = text.trim();
    if (!cleanText) {
      errs.raw_text = "Please describe the problem";
    } else if (cleanText.length < 6) {
      errs.raw_text = "Min 6 characters required";
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function submitComplaint() {
    if (!validate()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          flat_no: flatNo.trim().toUpperCase(),
          resident_name: name.trim(),
          email: email.trim() || undefined,
          raw_text: text.trim(),
        }),
      });
      const data = (await res.json()) as SuccessData & { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Submission failed. Please try again.");
      } else {
        setSuccess(data);
      }
    } catch {
      setError("Network error. Please verify your connection.");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    submitComplaint();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      submitComplaint();
    }
  }

  function handlePresetSelect(preset: QuickCategory) {
    setActiveCategory(preset.id);
    setText((prev) => {
      if (!prev) return preset.template;
      return `${prev}\n${preset.template}`;
    });
    if (fieldErrors.raw_text) {
      setFieldErrors((prev) => ({ ...prev, raw_text: "" }));
    }
    textareaRef.current?.focus();
  }

  if (success) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="relative rounded-2xl border-2 border-[var(--border-strong)] bg-[var(--surface)] p-6 sm:p-8 shadow-2xl max-w-[660px] mx-auto animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Top Glow Accent */}
        <div className="absolute top-0 left-8 right-8 h-1 bg-[var(--resolved)] rounded-full" />

        <div className="flex items-center gap-3.5 mb-5 pt-1">
          <div className="w-12 h-12 rounded-xl bg-[var(--resolved-tint)] border border-[var(--resolved)] flex items-center justify-center shrink-0">
            <CheckCircle2 size={26} className="text-[var(--resolved)]" />
          </div>
          <div>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--resolved)]">
              <Check size={13} strokeWidth={3} /> Triaged &amp; Dispatched
            </span>
            <h2 className="font-display font-extrabold text-[22px] sm:text-[24px] leading-tight text-[var(--ink)]">
              Complaint Registered
            </h2>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border-token)] my-5 flex flex-col gap-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <CategoryChip category={success.category as CategoryType} />
              <UrgencyChip level={success.urgency as UrgencyLevel} />
            </div>
            <span className="text-[12px] font-semibold px-2.5 py-1 rounded-full bg-[var(--surface)] text-[var(--ink)] border border-[var(--border-token)]">
              {success.cluster_size > 1
                ? `Grouped with ${success.cluster_size - 1} neighbor report${success.cluster_size > 2 ? "s" : ""}`
                : "Single issue ticket created"}
            </span>
          </div>

          <div className="pt-2 border-t border-[var(--border-token)]">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted-foreground)] mb-1">
              AI Summary &amp; Status
            </p>
            <p className="text-[14px] font-semibold text-[var(--ink)] leading-snug">
              {success.summary}
            </p>
          </div>

          {email && (
            <div className="text-[12px] text-[var(--muted-foreground)] flex items-center gap-2 pt-2 border-t border-[var(--border-token)]">
              <Mail size={14} className="text-[var(--ink)] shrink-0" />
              <span>
                Status notifications dispatched to <strong className="text-[var(--ink)]">{email}</strong>
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              setSuccess(null);
              setFlatNo("");
              setName("");
              setEmail("");
              setText("");
              setActiveCategory(null);
              setFieldErrors({});
            }}
            className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl font-bold text-[13px] border border-[var(--border-token)] text-[var(--ink)] bg-[var(--surface)] hover:bg-[var(--surface-2)] active:scale-[0.98] transition-all cursor-pointer shadow-sm"
          >
            <RotateCcw size={15} />
            Submit another complaint
          </button>

          <a
            href="/"
            className="inline-flex items-center justify-center h-11 px-6 rounded-xl font-bold text-[13px] bg-[var(--ink)] text-[var(--ink-inverse)] hover:opacity-90 active:scale-[0.98] transition-all text-center shadow-sm"
          >
            View Live Dashboard
          </a>
        </div>
      </div>
    );
  }

  const loadingMessages = [
    "Reading & analyzing issue...",
    "Running multi-lingual AI triage...",
    "Matching neighbor clusters...",
  ];

  return (
    <div className="relative w-full">
      {/* Visual focus ambient aura around the form to give it primary hierarchy */}
      <div className="absolute -inset-1 sm:-inset-1.5 rounded-[26px] bg-gradient-to-b from-[var(--border-strong)]/20 via-[var(--border-token)]/40 to-transparent blur-sm pointer-events-none" />

      {/* Main High-Performance Form Card */}
      <form
        onSubmit={handleSubmit}
        onKeyDown={handleKeyDown}
        noValidate
        className="relative rounded-2xl border-2 border-[var(--border-strong)] bg-[var(--surface)] p-5 sm:p-7 md:p-8 shadow-xl flex flex-col gap-4"
      >
        {/* Form Top Banner: Primary Title + Live Indicator */}
        <div className="flex items-start sm:items-center justify-between gap-3 pb-3.5 border-b border-[var(--border-token)]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--resolved)] animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                Resident Helpdesk Form
              </span>
            </div>
            <h2 className="font-display font-extrabold text-[20px] sm:text-[22px] text-[var(--ink)] tracking-tight leading-none">
              Report an Issue
            </h2>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--ink)] bg-[var(--surface-2)] px-2.5 py-1 rounded-lg border border-[var(--border-token)] shrink-0">
            <Globe2 size={13} className="text-[var(--ink)]" />
            <span>Multilingual NLP</span>
          </div>
        </div>

        {/* Quick Issue Selector Pills */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted-foreground)] flex items-center gap-1">
            <Sparkles size={12} className="text-[var(--high)]" /> Quick Presets (Click to autofill)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {QUICK_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handlePresetSelect(cat)}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-bold border text-left transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[var(--ink)] text-[var(--ink-inverse)] border-[var(--ink)] shadow-xs"
                      : "bg-[var(--surface-2)] text-[var(--ink)] border-[var(--border-token)] hover:border-[var(--ink)] hover:bg-[var(--surface)]"
                  }`}
                >
                  <Icon size={14} className={isSelected ? "text-[var(--ink-inverse)]" : "text-[var(--muted-foreground)]"} />
                  <span className="truncate">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 1: Flat No + Resident Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Flat Number */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="flat_no" className="text-[12px] font-bold text-[var(--ink)] flex items-center gap-1.5">
                <Building2 size={14} className="text-[var(--muted-foreground)]" />
                Flat / Unit Number <span className="text-[var(--critical)]">*</span>
              </label>
              {fieldErrors.flat_no && (
                <span className="text-[11px] font-semibold text-[var(--critical)]">{fieldErrors.flat_no}</span>
              )}
            </div>
            <input
              id="flat_no"
              type="text"
              value={flatNo}
              onChange={(e) => {
                setFlatNo(e.target.value.toUpperCase());
                if (fieldErrors.flat_no) setFieldErrors((p) => ({ ...p, flat_no: "" }));
              }}
              placeholder="e.g. C-220, B-402, Villa 12"
              disabled={loading}
              className={`h-10.5 px-3.5 rounded-xl bg-[var(--bg)] border text-[14px] font-semibold text-[var(--ink)] placeholder:text-[var(--muted-foreground)]/70 transition-all focus:outline-none focus:ring-2 focus:ring-[var(--ink)] focus:border-transparent ${
                fieldErrors.flat_no ? "border-[var(--critical)] bg-[var(--critical-tint)]/20" : "border-[var(--border-token)]"
              }`}
              autoComplete="off"
            />
          </div>

          {/* Resident Name */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="resident_name" className="text-[12px] font-bold text-[var(--ink)] flex items-center gap-1.5">
                <User size={14} className="text-[var(--muted-foreground)]" />
                Resident Name / Alias <span className="text-[var(--critical)]">*</span>
              </label>
              {fieldErrors.resident_name && (
                <span className="text-[11px] font-semibold text-[var(--critical)]">{fieldErrors.resident_name}</span>
              )}
            </div>
            <input
              id="resident_name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (fieldErrors.resident_name) setFieldErrors((p) => ({ ...p, resident_name: "" }));
              }}
              placeholder="e.g. Rahul Sharma / Resident"
              disabled={loading}
              className={`h-10.5 px-3.5 rounded-xl bg-[var(--bg)] border text-[14px] font-semibold text-[var(--ink)] placeholder:text-[var(--muted-foreground)]/70 transition-all focus:outline-none focus:ring-2 focus:ring-[var(--ink)] focus:border-transparent ${
                fieldErrors.resident_name ? "border-[var(--critical)] bg-[var(--critical-tint)]/20" : "border-[var(--border-token)]"
              }`}
              autoComplete="name"
            />
          </div>
        </div>

        {/* Row 2: Email (Optional) */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="resident_email" className="text-[12px] font-bold text-[var(--ink)] flex items-center gap-1.5">
              <Mail size={14} className="text-[var(--muted-foreground)]" />
              Email Address <span className="text-[11px] font-normal text-[var(--muted-foreground)]">(Optional — for resolution updates)</span>
            </label>
            {fieldErrors.email && (
              <span className="text-[11px] font-semibold text-[var(--critical)]">{fieldErrors.email}</span>
            )}
          </div>
          <input
            id="resident_email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: "" }));
            }}
            placeholder="e.g. resident@example.com"
            disabled={loading}
            className={`h-10.5 px-3.5 rounded-xl bg-[var(--bg)] border text-[14px] font-medium text-[var(--ink)] placeholder:text-[var(--muted-foreground)]/70 transition-all focus:outline-none focus:ring-2 focus:ring-[var(--ink)] focus:border-transparent ${
              fieldErrors.email ? "border-[var(--critical)] bg-[var(--critical-tint)]/20" : "border-[var(--border-token)]"
            }`}
            autoComplete="email"
          />
        </div>

        {/* Row 3: Complaint Description */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="raw_text" className="text-[12px] font-bold text-[var(--ink)] flex items-center gap-1.5">
              <MessageSquareText size={14} className="text-[var(--muted-foreground)]" />
              Describe Issue <span className="text-[var(--critical)]">*</span>
            </label>
            <div className="flex items-center gap-2 font-mono text-[11px] text-[var(--muted-foreground)]">
              {liveAnalysis && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[var(--surface-2)] text-[var(--ink)] border border-[var(--border-token)] font-sans font-semibold text-[10px]">
                  {liveAnalysis.lang}
                  {liveAnalysis.isUrgent && (
                    <span className="flex items-center gap-0.5 text-[var(--critical)] font-bold">
                      <Flame size={10} /> Urgent
                    </span>
                  )}
                </span>
              )}
              <span>{text.length}/1000</span>
            </div>
          </div>

          <textarea
            id="raw_text"
            ref={textareaRef}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (fieldErrors.raw_text) setFieldErrors((p) => ({ ...p, raw_text: "" }));
            }}
            placeholder="Type in English, Hindi, or Hinglish (e.g., 'C-220 me subah se pani nahi aa raha hai. Please send plumber.')"
            disabled={loading}
            rows={4}
            maxLength={1000}
            className={`min-h-[96px] max-h-[160px] px-3.5 py-2.5 rounded-xl bg-[var(--bg)] border text-[14px] font-medium text-[var(--ink)] placeholder:text-[var(--muted-foreground)]/70 transition-all focus:outline-none focus:ring-2 focus:ring-[var(--ink)] focus:border-transparent resize-none leading-relaxed ${
              fieldErrors.raw_text ? "border-[var(--critical)] bg-[var(--critical-tint)]/20" : "border-[var(--border-token)]"
            }`}
          />

          {fieldErrors.raw_text && (
            <p className="text-[11px] font-semibold text-[var(--critical)] flex items-center gap-1 mt-0.5">
              <AlertCircle size={12} /> {fieldErrors.raw_text}
            </p>
          )}
        </div>

        {error && (
          <div className="p-3 rounded-xl border border-[var(--critical)] bg-[var(--critical-tint)]" role="alert">
            <p className="text-[12px] text-[var(--critical)] font-semibold flex items-center gap-2">
              <AlertCircle size={15} /> {error}
            </p>
          </div>
        )}

        {/* Primary Submit Action with Keyboard hint */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-medium text-[var(--muted-foreground)]">
            <CornerDownLeft size={12} />
            <span>Press <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface-2)] border border-[var(--border-token)] font-mono text-[10px] text-[var(--ink)] font-bold">{isMac ? "⌘ + Enter" : "Ctrl + Enter"}</kbd> to submit</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="h-12 px-7 rounded-xl font-bold text-[14px] bg-[var(--ink)] text-[var(--ink-inverse)] hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-4 focus:ring-[var(--border-token)] disabled:opacity-60 disabled:cursor-not-allowed shadow-md cursor-pointer ml-auto w-full sm:w-auto"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{loadingMessages[loadingStep]}</span>
              </div>
            ) : (
              <>
                <span>Submit to Committee</span>
                <Send size={15} />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
