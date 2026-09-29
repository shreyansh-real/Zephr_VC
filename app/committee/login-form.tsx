"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";

export function LoginForm() {
  const [passcode, setPasscode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!passcode) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "That passcode is incorrect. Check with the committee head.");
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("Couldn't connect. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="passcode" className="text-[15px] font-bold text-[var(--ink)]">
          Passcode
        </label>
        <input
          id="passcode"
          type="password"
          value={passcode}
          onChange={(e) => setPasscode(e.target.value)}
          placeholder="••••••"
          disabled={loading}
          autoFocus
          className="h-[52px] px-4 rounded-lg bg-[var(--bg)] border-[1.5px] border-[var(--border-token)] text-[16px] text-[var(--ink)] focus:outline-none focus:border-[var(--border-strong)] focus:ring-2 focus:ring-[var(--border-strong)] focus:ring-offset-1 disabled:opacity-50"
        />
      </div>

      {error && (
        <p className="text-[15px] text-[var(--ink)] flex items-center gap-1.5" role="alert">
          <AlertCircle size={16} /> {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || !passcode}
        className="h-12 rounded-lg font-bold text-[16px] bg-[var(--ink)] text-[var(--ink-inverse)] hover:opacity-90 active:translate-y-px transition-all focus:outline-none focus:ring-2 focus:ring-[var(--border-strong)] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Checking…" : "Open dashboard"}
      </button>
    </form>
  );
}
