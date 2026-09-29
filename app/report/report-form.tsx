"use client";

import { useState } from "react";
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
  ArrowRight,
  RotateCcw,
} from "lucide-react";

interface SuccessData {
  category: string;
  urgency: string;
  summary: string;
  cluster_size: number;
}

const QUICK_EXAMPLES = [
  "Water supply stopped since morning",
  "Wing B lift making grinding noise",
  "Basement parking lights flickering",
  "Garbage chute blocked on 3rd floor",
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

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!flatNo.trim()) {
      errs.flat_no = "Flat number is required";
    } else if (!/^[A-Za-z0-9][-A-Za-z0-9]{0,9}$/.test(flatNo.trim())) {
      errs.flat_no = "Invalid format (e.g. B-204 or 101)";
    }

    if (!name.trim()) {
      errs.resident_name = "Your name is required";
    }

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = "Please enter a valid email address";
    }

    if (!text.trim()) {
      errs.raw_text = "Please describe the problem";
    } else if (text.trim().length < 10) {
      errs.raw_text = "Complaint must be at least 10 characters";
    } else if (text.length > 1000) {
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
          flat_no: flatNo.trim(),
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
      setError("Unable to submit right now. Your text is preserved, please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="rounded-2xl border border-[var(--border-token)] bg-[var(--surface)] p-6 md:p-8 shadow-sm"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-full bg-[var(--resolved-tint)] border border-[var(--resolved)] flex items-center justify-center shrink-0">
            <CheckCircle2 size={24} className="text-[var(--resolved)]" />
          </div>
          <div>
            <h2 className="font-display font-black text-[28px] md:text-[32px] leading-tight text-[var(--ink)]">
              Complaint logged.
            </h2>
            <p className="text-[13px] text-[var(--muted-foreground)]">
              AI has triaged and clustered your issue for committee review.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border-token)] my-6 flex flex-col gap-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <CategoryChip category={success.category as CategoryType} />
              <UrgencyChip level={success.urgency as UrgencyLevel} />
            </div>
            <span className="text-[12px] font-semibold text-[var(--muted-foreground)]">
              {success.cluster_size > 1
                ? `Grouped with ${success.cluster_size - 1} similar report${success.cluster_size > 2 ? "s" : ""}`
                : "New cluster created"}
            </span>
          </div>

          <p className="text-[15px] font-medium text-[var(--ink)] leading-snug">
            {success.summary}
          </p>

          {email && (
            <p className="text-[13px] text-[var(--muted-foreground)] flex items-center gap-1.5 pt-2 border-t border-[var(--border-token)]">
              <Mail size={13} />
              Updates will be sent to <strong className="text-[var(--ink)]">{email}</strong>
            </p>
          )}
        </div>

        <button
          onClick={() => {
            setSuccess(null);
            setFlatNo("");
            setName("");
            setEmail("");
            setText("");
            setFieldErrors({});
          }}
          className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl font-bold text-[14px] border border-[var(--border-token)] text-[var(--ink)] bg-[var(--surface)] hover:bg-[var(--surface-2)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--border-strong)]"
        >
          <RotateCcw size={15} />
          Report another problem
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-2xl border border-[var(--border-token)] bg-[var(--surface)] p-6 md:p-8 shadow-sm flex flex-col gap-6"
    >
      {/* Row 1: Flat No + Name */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Flat Number */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="flat_no" className="text-[13px] font-bold text-[var(--ink)] flex items-center gap-1.5">
            <Building2 size={14} className="text-[var(--muted-foreground)]" />
            Flat / Unit number <span className="text-[var(--critical)]">*</span>
          </label>
          <input
            id="flat_no"
            type="text"
            value={flatNo}
            onChange={(e) => setFlatNo(e.target.value)}
            placeholder="e.g. B-204"
            disabled={loading}
            aria-describedby={fieldErrors.flat_no ? "flat_no_err" : undefined}
            className="h-11 px-3.5 rounded-xl bg-[var(--bg)] border border-[var(--border-token)] text-[15px] text-[var(--ink)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--border-strong)] focus:ring-2 focus:ring-[var(--border-strong)] disabled:opacity-50"
            autoComplete="off"
          />
          {fieldErrors.flat_no && (
            <p id="flat_no_err" className="text-[12px] font-medium text-[var(--critical)] flex items-center gap-1">
              <AlertCircle size={12} /> {fieldErrors.flat_no}
            </p>
          )}
        </div>

        {/* Resident Name */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="resident_name" className="text-[13px] font-bold text-[var(--ink)] flex items-center gap-1.5">
            <User size={14} className="text-[var(--muted-foreground)]" />
            Your name <span className="text-[var(--critical)]">*</span>
          </label>
          <input
            id="resident_name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Ramesh Kumar"
            disabled={loading}
            aria-describedby={fieldErrors.resident_name ? "name_err" : undefined}
            className="h-11 px-3.5 rounded-xl bg-[var(--bg)] border border-[var(--border-token)] text-[15px] text-[var(--ink)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--border-strong)] focus:ring-2 focus:ring-[var(--border-strong)] disabled:opacity-50"
            autoComplete="name"
          />
          {fieldErrors.resident_name && (
            <p id="name_err" className="text-[12px] font-medium text-[var(--critical)] flex items-center gap-1">
              <AlertCircle size={12} /> {fieldErrors.resident_name}
            </p>
          )}
        </div>
      </div>

      {/* Row 2: Email */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="resident_email" className="text-[13px] font-bold text-[var(--ink)] flex items-center gap-1.5">
            <Mail size={14} className="text-[var(--muted-foreground)]" />
            Email address
          </label>
          <span className="text-[11px] text-[var(--muted-foreground)] font-medium">
            For status updates
          </span>
        </div>
        <input
          id="resident_email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ramesh@gmail.com"
          disabled={loading}
          aria-describedby={fieldErrors.email ? "email_err" : "email_hint"}
          className="h-11 px-3.5 rounded-xl bg-[var(--bg)] border border-[var(--border-token)] text-[15px] text-[var(--ink)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--border-strong)] focus:ring-2 focus:ring-[var(--border-strong)] disabled:opacity-50"
          autoComplete="email"
        />
        {fieldErrors.email ? (
          <p id="email_err" className="text-[12px] font-medium text-[var(--critical)] flex items-center gap-1">
            <AlertCircle size={12} /> {fieldErrors.email}
          </p>
        ) : (
          <p id="email_hint" className="text-[12px] text-[var(--muted-foreground)]">
            We will email you when the society committee responds or resolves the issue.
          </p>
        )}
      </div>

      {/* Row 3: Complaint Description */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label htmlFor="raw_text" className="text-[13px] font-bold text-[var(--ink)] flex items-center gap-1.5">
            <MessageSquareText size={14} className="text-[var(--muted-foreground)]" />
            Describe the problem <span className="text-[var(--critical)]">*</span>
          </label>
          <span className="text-[11px] text-[var(--muted-foreground)] font-mono">
            {text.length}/1000
          </span>
        </div>
        <textarea
          id="raw_text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g. B-204 mein subah se low pressure paani aa raha hai, lift #2 bhi nahi chal rahi…"
          disabled={loading}
          rows={4}
          maxLength={1000}
          aria-describedby={fieldErrors.raw_text ? "text_err" : "text_hint"}
          className="min-h-[120px] px-3.5 py-3 rounded-xl bg-[var(--bg)] border border-[var(--border-token)] text-[15px] text-[var(--ink)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--border-strong)] focus:ring-2 focus:ring-[var(--border-strong)] resize-y disabled:opacity-50"
          style={{ lineHeight: 1.6 }}
        />

        {fieldErrors.raw_text && (
          <p id="text_err" className="text-[12px] font-medium text-[var(--critical)] flex items-center gap-1">
            <AlertCircle size={12} /> {fieldErrors.raw_text}
          </p>
        )}

        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] font-medium text-[var(--muted-foreground)] flex items-center gap-1 mr-1">
            <Sparkles size={12} /> Suggestions:
          </span>
          {QUICK_EXAMPLES.map((eg) => (
            <button
              key={eg}
              type="button"
              onClick={() => setText(eg)}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-[var(--surface-2)] text-[var(--muted-foreground)] hover:text-[var(--ink)] hover:bg-[var(--border-token)] border border-[var(--border-token)] transition-colors text-left"
            >
              {eg}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl border border-[var(--critical)] bg-[var(--critical-tint)]" role="alert">
          <p className="text-[13px] text-[var(--critical)] font-medium flex items-center gap-1.5">
            <AlertCircle size={15} /> {error}
          </p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="h-12 px-6 rounded-xl font-bold text-[15px] bg-[var(--ink)] text-[var(--ink-inverse)] hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-[var(--border-strong)] disabled:opacity-50 disabled:cursor-not-allowed mt-2 shadow-sm"
      >
        {loading ? (
          <span>Analyzing with AI…</span>
        ) : (
          <>
            <span>Submit Complaint</span>
            <Send size={15} />
          </>
        )}
      </button>
    </form>
  );
}
