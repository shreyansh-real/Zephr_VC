"use client";

import { useState } from "react";
import { UrgencyChip, CategoryChip, type UrgencyLevel, type CategoryType } from "@/components/urgency";
import { CheckCircle, AlertCircle } from "lucide-react";

interface SuccessData {
  category: string;
  urgency: string;
  summary: string;
  cluster_size: number;
}

export function ReportForm() {
  const [flatNo, setFlatNo] = useState("");
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<SuccessData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!flatNo) errs.flat_no = "Flat number is required";
    else if (!/^[A-Za-z0-9][-A-Za-z0-9]{0,9}$/.test(flatNo)) errs.flat_no = "Invalid flat number (e.g. B-204 or 101)";
    if (!name) errs.resident_name = "Name is required";
    if (!text) errs.raw_text = "Complaint is required";
    else if (text.length < 10) errs.raw_text = "Complaint must be at least 10 characters";
    else if (text.length > 1000) errs.raw_text = "Complaint must be at most 1000 characters";
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
        body: JSON.stringify({ flat_no: flatNo, resident_name: name, raw_text: text }),
      });
      const data = (await res.json()) as SuccessData & { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
      } else {
        setSuccess(data);
      }
    } catch {
      setError("We couldn't send that. Your text is saved, try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="text-left" role="status" aria-live="polite">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle size={24} className="text-[var(--resolved)]" />
          <span className="font-display font-black text-[44px] leading-[1.05] tracking-[-0.02em]">Got it.</span>
        </div>
        <p className="text-[18px] text-[var(--ink)] mb-4" style={{ lineHeight: 1.55 }}>
          Filed under{" "}
          <CategoryChip category={success.category as CategoryType} className="inline-flex" />.{" "}
          {success.cluster_size > 1
            ? `Grouped with ${success.cluster_size - 1} similar report${success.cluster_size > 2 ? "s" : ""}.`
            : "This is the first report like this."}
        </p>
        <div className="flex items-center gap-2 mb-8">
          <UrgencyChip level={success.urgency as UrgencyLevel} />
          <span className="text-[15px] text-[var(--muted)]">{success.summary}</span>
        </div>
        <button
          onClick={() => { setSuccess(null); setFlatNo(""); setName(""); setText(""); }}
          className="inline-flex items-center justify-center h-12 px-8 rounded-lg font-bold text-[16px] border-[1.5px] border-[var(--ink)] text-[var(--ink)] bg-[var(--surface)] hover:bg-[var(--surface-2)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--border-strong)] focus:ring-offset-2"
        >
          Report another problem
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="flat_no" className="text-[15px] font-bold text-[var(--ink)]">
          Flat number
        </label>
        <input
          id="flat_no"
          type="text"
          value={flatNo}
          onChange={(e) => setFlatNo(e.target.value)}
          placeholder="B-204"
          disabled={loading}
          aria-describedby={fieldErrors.flat_no ? "flat_no_err" : undefined}
          className="h-[52px] px-4 rounded-lg bg-[var(--surface)] border-[1.5px] border-[var(--border-token)] text-[16px] text-[var(--ink)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--border-strong)] focus:ring-2 focus:ring-[var(--border-strong)] focus:ring-offset-1 disabled:opacity-50 font-variant-numeric tabular-nums"
          style={{ fontVariantNumeric: "tabular-nums" }}
          autoComplete="off"
        />
        {fieldErrors.flat_no && (
          <p id="flat_no_err" className="text-[15px] text-[var(--ink)] flex items-center gap-1.5">
            <AlertCircle size={16} /> {fieldErrors.flat_no}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="resident_name" className="text-[15px] font-bold text-[var(--ink)]">
          Your name
        </label>
        <input
          id="resident_name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ramesh Kumar"
          disabled={loading}
          aria-describedby={fieldErrors.resident_name ? "name_err" : undefined}
          className="h-[52px] px-4 rounded-lg bg-[var(--surface)] border-[1.5px] border-[var(--border-token)] text-[16px] text-[var(--ink)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--border-strong)] focus:ring-2 focus:ring-[var(--border-strong)] focus:ring-offset-1 disabled:opacity-50"
          autoComplete="name"
        />
        {fieldErrors.resident_name && (
          <p id="name_err" className="text-[15px] text-[var(--ink)] flex items-center gap-1.5">
            <AlertCircle size={16} /> {fieldErrors.resident_name}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="raw_text" className="text-[15px] font-bold text-[var(--ink)]">
          Tell us what happened
        </label>
        <textarea
          id="raw_text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="B-204 mein subah se paani nahi aa raha"
          disabled={loading}
          rows={5}
          maxLength={1000}
          aria-describedby={fieldErrors.raw_text ? "text_err" : "text_hint"}
          className="min-h-[140px] px-4 py-3 rounded-lg bg-[var(--surface)] border-[1.5px] border-[var(--border-token)] text-[18px] text-[var(--ink)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--border-strong)] focus:ring-2 focus:ring-[var(--border-strong)] focus:ring-offset-1 disabled:opacity-50 resize-y"
          style={{ lineHeight: 1.55 }}
        />
        <p id="text_hint" className="text-[15px] text-[var(--muted)]">
          Write in English, Hindi or Hinglish. ({text.length}/1000)
        </p>
        {fieldErrors.raw_text && (
          <p id="text_err" className="text-[15px] text-[var(--ink)] flex items-center gap-1.5">
            <AlertCircle size={16} /> {fieldErrors.raw_text}
          </p>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-lg border-[1.5px] border-[var(--border-strong)] bg-[var(--surface-2)]" role="alert">
          <p className="text-[15px] text-[var(--ink)] flex items-center gap-1.5">
            <AlertCircle size={16} /> {error}
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="h-12 rounded-lg font-bold text-[16px] bg-[var(--ink)] text-[var(--ink-inverse)] hover:opacity-90 active:translate-y-px transition-all focus:outline-none focus:ring-2 focus:ring-[var(--border-strong)] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Sending…" : "Send complaint"}
      </button>
    </form>
  );
}
