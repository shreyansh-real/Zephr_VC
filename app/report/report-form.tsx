"use client";

import { useState, useMemo } from "react";
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
} from "lucide-react";

interface SuccessData {
  category: string;
  urgency: string;
  summary: string;
  cluster_size: number;
}

const QUICK_CATEGORIES = [
  { label: "Water supply", icon: Droplets, template: "No water supply or low water pressure in flat tap." },
  { label: "Elevator / Lift", icon: ArrowUpDown, template: "Lift is not responding, stuck, or making grinding noise." },
  { label: "Electricity / Power", icon: Zap, template: "Power failure in corridor / common area lights not working." },
  { label: "Noise / Bylaws", icon: Volume2, template: "Loud noise / party disturbance past 10:30 PM quiet hours." },
  { label: "Garbage / Cleanliness", icon: Trash2, template: "Garbage not collected from floor corridor today." },
  { label: "Gate & Security", icon: ShieldAlert, template: "Visitor barrier / security gate issue at entrance." },
];

export function ReportForm() {
  const [flatNo, setFlatNo] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<SuccessData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Auto-detect language
  const detectedLanguage = useMemo(() => {
    if (!text.trim()) return null;
    if (/[^\u0000-\u007F]/.test(text)) return "Hindi";
    if (/\b(pani|paani|bhai|yaar|dekh|karo|nahi|nhi|hai|ho|aarha|gaya|kripya)\b/i.test(text)) {
      return "Hinglish";
    }
    return "English";
  }, [text]);

  function validate(): boolean {
    const errs: Record<string, string> = {};
    const cleanFlat = flatNo.trim();
    if (!cleanFlat) {
      errs.flat_no = "Flat number is required (e.g. A-402, C-220)";
    } else if (!/^[A-Za-z0-9][-A-Za-z0-9]{0,9}$/.test(cleanFlat)) {
      errs.flat_no = "Invalid format (e.g. A-402, B-101, or 204)";
    }

    if (!name.trim()) {
      errs.resident_name = "Name / Resident alias is required";
    }

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = "Please enter a valid email address (e.g. resident@gmail.com)";
    }

    const cleanText = text.trim();
    if (!cleanText) {
      errs.raw_text = "Please describe the problem in any language";
    } else if (cleanText.length < 8) {
      errs.raw_text = "Please provide at least 8 characters describing the issue";
    } else if (cleanText.length > 1000) {
      errs.raw_text = "Complaint must be at most 1000 characters";
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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
        setError(data.error ?? "Something went wrong. Please try again.");
      } else {
        setSuccess(data);
      }
    } catch {
      setError("Unable to connect to server. Your text is saved, please retry.");
    } finally {
      setLoading(false);
    }
  }

  // Quick preset loader
  function handlePreset(template: string) {
    setText((prev) => (prev ? `${prev} — ${template}` : template));
    if (fieldErrors.raw_text) {
      setFieldErrors((prev) => ({ ...prev, raw_text: "" }));
    }
  }

  if (success) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="rounded-3xl border-2 border-[var(--border-strong)] bg-[var(--surface)] p-6 sm:p-8 md:p-10 shadow-xl max-w-[760px] mx-auto animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[var(--resolved-tint)] border border-[var(--resolved)] flex items-center justify-center shrink-0">
            <CheckCircle2 size={32} className="text-[var(--resolved)]" />
          </div>
          <div>
            <span className="inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider text-[var(--resolved)] mb-0.5">
              <Check size={14} /> Logged &amp; Triaged by AI
            </span>
            <h2 className="font-display font-extrabold text-[24px] sm:text-[30px] leading-tight text-[var(--ink)]">
              Complaint registered successfully.
            </h2>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--surface-2)] border border-[var(--border-token)] my-6 flex flex-col gap-3.5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <CategoryChip category={success.category as CategoryType} />
              <UrgencyChip level={success.urgency as UrgencyLevel} />
            </div>
            <span className="text-[12px] font-semibold px-2.5 py-1 rounded-full bg-[var(--surface)] text-[var(--ink)] border border-[var(--border-token)]">
              {success.cluster_size > 1
                ? `Grouped with ${success.cluster_size - 1} neighbor report${success.cluster_size > 2 ? "s" : ""}`
                : "New collective ticket created"}
            </span>
          </div>

          <p className="text-[16px] font-semibold text-[var(--ink)] leading-snug">
            {success.summary}
          </p>

          {email && (
            <div className="text-[13px] text-[var(--muted-foreground)] flex items-center gap-2 pt-3 border-t border-[var(--border-token)]">
              <Mail size={14} className="text-[var(--ink)] shrink-0" />
              <span>
                Status and volunteer assignment updates will be sent to <strong className="text-[var(--ink)]">{email}</strong>
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={() => {
              setSuccess(null);
              setFlatNo("");
              setName("");
              setEmail("");
              setText("");
              setFieldErrors({});
            }}
            className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl font-bold text-[14px] border-2 border-[var(--border-token)] text-[var(--ink)] bg-[var(--surface)] hover:bg-[var(--surface-2)] hover:border-[var(--ink)] transition-all cursor-pointer"
          >
            <RotateCcw size={16} />
            Submit another complaint
          </button>

          <a
            href="/"
            className="inline-flex items-center justify-center h-12 px-6 rounded-xl font-bold text-[14px] bg-[var(--ink)] text-[var(--ink-inverse)] hover:opacity-90 transition-all text-center"
          >
            Return to home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="relative max-w-[800px] mx-auto">
      {/* Visual focus ambient frame */}
      <div className="absolute -inset-1.5 rounded-[32px] bg-gradient-to-b from-[var(--border-token)] to-transparent opacity-60 blur-[1px] pointer-events-none" />

      {/* Main High-Performance Form Card */}
      <form
        onSubmit={handleSubmit}
        noValidate
        className="relative rounded-3xl border-2 border-[var(--border-token)] bg-[var(--surface)] p-6 sm:p-8 md:p-10 shadow-xl flex flex-col gap-6"
      >
        {/* Card Header & Priority Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-[var(--border-token)]">
          <div>
            <div className="inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider text-[var(--ink)] mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--resolved)] animate-pulse" />
              Resident Service Portal
            </div>
            <h2 className="font-display font-black text-[22px] sm:text-[26px] text-[var(--ink)] tracking-tight">
              Report an Issue to Committee
            </h2>
          </div>

          <div className="flex items-center gap-2 text-[12px] font-semibold text-[var(--muted-foreground)] bg-[var(--surface-2)] px-3 py-1.5 rounded-xl border border-[var(--border-token)] self-start sm:self-auto">
            <Globe2 size={14} className="text-[var(--ink)]" />
            <span>Type in Hindi, English, or Hinglish</span>
          </div>
        </div>

        {/* Quick Problem Category Switchers */}
        <div className="flex flex-col gap-2">
          <label className="text-[12px] font-bold uppercase tracking-wider text-[var(--muted-foreground)] flex items-center gap-1.5">
            <Sparkles size={13} className="text-[var(--high)]" /> Quick templates (click to add):
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {QUICK_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.label}
                  type="button"
                  onClick={() => handlePreset(cat.template)}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] font-semibold border border-[var(--border-token)] bg-[var(--surface-2)] text-[var(--ink)] hover:bg-[var(--border-token)] hover:border-[var(--ink)] transition-all text-left cursor-pointer active:scale-[0.98]"
                >
                  <Icon size={14} className="text-[var(--muted-foreground)] shrink-0" />
                  <span className="truncate">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 1: Flat No + Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Flat Number */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="flat_no" className="text-[13px] font-bold text-[var(--ink)] flex items-center gap-1.5">
              <Building2 size={15} className="text-[var(--muted-foreground)]" />
              Flat / Unit number <span className="text-[var(--critical)]">*</span>
            </label>
            <input
              id="flat_no"
              type="text"
              value={flatNo}
              onChange={(e) => {
                setFlatNo(e.target.value.toUpperCase());
                if (fieldErrors.flat_no) setFieldErrors((p) => ({ ...p, flat_no: "" }));
              }}
              placeholder="e.g. C-220, A-101"
              disabled={loading}
              aria-describedby={fieldErrors.flat_no ? "flat_no_err" : undefined}
              className={`h-12 px-4 rounded-xl bg-[var(--bg)] border text-[15px] font-medium text-[var(--ink)] placeholder:text-[var(--muted-foreground)] transition-all focus:outline-none focus:ring-2 focus:ring-[var(--ink)] focus:border-transparent ${
                fieldErrors.flat_no ? "border-[var(--critical)] bg-[var(--critical-tint)]/20" : "border-[var(--border-token)]"
              }`}
              autoComplete="off"
            />
            {fieldErrors.flat_no && (
              <p id="flat_no_err" className="text-[12px] font-semibold text-[var(--critical)] flex items-center gap-1">
                <AlertCircle size={13} /> {fieldErrors.flat_no}
              </p>
            )}
          </div>

          {/* Resident Name */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="resident_name" className="text-[13px] font-bold text-[var(--ink)] flex items-center gap-1.5">
              <User size={15} className="text-[var(--muted-foreground)]" />
              Resident Name / Alias <span className="text-[var(--critical)]">*</span>
            </label>
            <input
              id="resident_name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (fieldErrors.resident_name) setFieldErrors((p) => ({ ...p, resident_name: "" }));
              }}
              placeholder="e.g. Sharma / Resident"
              disabled={loading}
              aria-describedby={fieldErrors.resident_name ? "name_err" : undefined}
              className={`h-12 px-4 rounded-xl bg-[var(--bg)] border text-[15px] font-medium text-[var(--ink)] placeholder:text-[var(--muted-foreground)] transition-all focus:outline-none focus:ring-2 focus:ring-[var(--ink)] focus:border-transparent ${
                fieldErrors.resident_name ? "border-[var(--critical)] bg-[var(--critical-tint)]/20" : "border-[var(--border-token)]"
              }`}
              autoComplete="name"
            />
            {fieldErrors.resident_name && (
              <p id="name_err" className="text-[12px] font-semibold text-[var(--critical)] flex items-center gap-1">
                <AlertCircle size={13} /> {fieldErrors.resident_name}
              </p>
            )}
          </div>
        </div>

        {/* Row 2: Email (Optional for updates) */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="resident_email" className="text-[13px] font-bold text-[var(--ink)] flex items-center gap-1.5">
              <Mail size={15} className="text-[var(--muted-foreground)]" />
              Email address <span className="text-[11px] font-normal text-[var(--muted-foreground)]">(Optional)</span>
            </label>
            <span className="text-[11px] text-[var(--muted-foreground)] font-medium">
              Receive status &amp; resolution updates
            </span>
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
            aria-describedby={fieldErrors.email ? "email_err" : "email_hint"}
            className={`h-12 px-4 rounded-xl bg-[var(--bg)] border text-[15px] font-medium text-[var(--ink)] placeholder:text-[var(--muted-foreground)] transition-all focus:outline-none focus:ring-2 focus:ring-[var(--ink)] focus:border-transparent ${
              fieldErrors.email ? "border-[var(--critical)] bg-[var(--critical-tint)]/20" : "border-[var(--border-token)]"
            }`}
            autoComplete="email"
          />
          {fieldErrors.email && (
            <p id="email_err" className="text-[12px] font-semibold text-[var(--critical)] flex items-center gap-1">
              <AlertCircle size={13} /> {fieldErrors.email}
            </p>
          )}
        </div>

        {/* Row 3: Complaint Description with Live Language Badge */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label htmlFor="raw_text" className="text-[13px] font-bold text-[var(--ink)] flex items-center gap-1.5">
              <MessageSquareText size={15} className="text-[var(--muted-foreground)]" />
              Describe what happened <span className="text-[var(--critical)]">*</span>
            </label>
            <div className="flex items-center gap-2">
              {detectedLanguage && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[var(--surface-2)] text-[var(--ink)] border border-[var(--border-token)]">
                  {detectedLanguage}
                </span>
              )}
              <span className="text-[11px] text-[var(--muted-foreground)] font-mono">
                {text.length}/1000
              </span>
            </div>
          </div>
          <textarea
            id="raw_text"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (fieldErrors.raw_text) setFieldErrors((p) => ({ ...p, raw_text: "" }));
            }}
            placeholder="Type your complaint freely in Hindi, English, or Hinglish (e.g. 'C-220 me tap water nahi aaraha subah se... please fix it fast!')"
            disabled={loading}
            rows={4}
            maxLength={1000}
            aria-describedby={fieldErrors.raw_text ? "text_err" : undefined}
            className={`min-h-[120px] px-4 py-3.5 rounded-xl bg-[var(--bg)] border text-[15px] font-medium text-[var(--ink)] placeholder:text-[var(--muted-foreground)] transition-all focus:outline-none focus:ring-2 focus:ring-[var(--ink)] focus:border-transparent resize-y ${
              fieldErrors.raw_text ? "border-[var(--critical)] bg-[var(--critical-tint)]/20" : "border-[var(--border-token)]"
            }`}
            style={{ lineHeight: 1.6 }}
          />

          {fieldErrors.raw_text && (
            <p id="text_err" className="text-[12px] font-semibold text-[var(--critical)] flex items-center gap-1">
              <AlertCircle size={13} /> {fieldErrors.raw_text}
            </p>
          )}
        </div>

        {error && (
          <div className="p-4 rounded-xl border border-[var(--critical)] bg-[var(--critical-tint)]" role="alert">
            <p className="text-[13px] text-[var(--critical)] font-semibold flex items-center gap-1.5">
              <AlertCircle size={16} /> {error}
            </p>
          </div>
        )}

        {/* Primary Submit Action */}
        <button
          type="submit"
          disabled={loading}
          className="h-14 px-8 rounded-xl font-bold text-[16px] bg-[var(--ink)] text-[var(--ink-inverse)] hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center gap-2.5 focus:outline-none focus:ring-4 focus:ring-[var(--border-strong)] disabled:opacity-50 disabled:cursor-not-allowed shadow-md cursor-pointer mt-1"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Analyzing &amp; Grouping with AI…</span>
            </div>
          ) : (
            <>
              <span>Submit Issue to Committee</span>
              <Send size={16} />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
