"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, KeyRound, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";

export function LoginForm() {
  const [passcode, setPasscode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!passcode.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode: passcode.trim() }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Invalid passcode. Please check with your committee administrator.");
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("Network connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label htmlFor="passcode" className="text-[13px] font-bold text-[var(--ink)] flex items-center gap-1.5">
            <KeyRound size={14} className="text-[var(--muted-foreground)]" />
            Passcode
          </label>
        </div>

        <div className="relative">
          <input
            id="passcode"
            type={showPassword ? "text" : "password"}
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            placeholder="Enter committee passcode…"
            disabled={loading}
            autoFocus
            autoComplete="current-password"
            className="w-full h-12 pl-3.5 pr-11 rounded-xl bg-[var(--bg)] border border-[var(--border-token)] text-[15px] text-[var(--ink)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--border-strong)] focus:ring-2 focus:ring-[var(--border-strong)] disabled:opacity-50 tracking-wider"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--ink)] p-1 rounded-md transition-colors focus:outline-none"
            aria-label={showPassword ? "Hide passcode" : "Show passcode"}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl border border-[var(--critical)] bg-[var(--critical-tint)]" role="alert">
          <p className="text-[13px] text-[var(--critical)] font-medium flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0" />
            {error}
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !passcode.trim()}
        className="h-12 px-6 rounded-xl font-bold text-[15px] bg-[var(--ink)] text-[var(--ink-inverse)] hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-[var(--border-strong)] disabled:opacity-40 disabled:cursor-not-allowed shadow-sm cursor-pointer"
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            <span>Verifying…</span>
          </>
        ) : (
          <>
            <span>Unlock Dashboard</span>
            <ArrowRight size={16} />
          </>
        )}
      </button>
    </form>
  );
}
