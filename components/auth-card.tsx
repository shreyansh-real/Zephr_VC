"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLanguageStore } from "@/lib/language-store";
import { Phone, ArrowRight, Loader2, ShieldAlert, Mail } from "lucide-react";

export function AuthCard() {
  const { signInWithGoogle } = useAuth();
  const { t } = useLanguageStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setError(null);
    try {
      setLoading(true);
      await signInWithGoogle();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t.common.error;
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 sm:p-8 bg-[var(--surface)] border border-[var(--border-token)] rounded-lg shadow-sm">
      <div className="text-center mb-6">
        {/* Sochi Logo */}
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-xl overflow-hidden border border-[var(--border-token)] shadow-md">
            <img src="/favicon.svg" alt="Sochi" className="w-full h-full object-cover" />
          </div>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-[var(--ink)]">
          {t.auth.title}
        </h2>
        <p className="mt-1 text-sm text-[var(--muted)]">{t.auth.subtitle}</p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-md bg-[var(--surface-2)] border-2 border-[var(--border-strong)] flex items-start gap-2.5 text-sm text-[var(--ink)]">
          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Google Sign In - Primary Method */}
      <div className="space-y-4">
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full h-12 px-4 rounded-md bg-[var(--accent)] text-white font-bold text-base flex items-center justify-center gap-2.5 hover:bg-[var(--accent)]/90 transition-colors disabled:opacity-50 min-h-[44px]"
        >
          {/* Google G SVG */}
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#fff"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#fff"/>
            <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#fff"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#fff"/>
          </svg>
          <span>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                Signing in...
              </>
            ) : (
              "Sign in with Google"
            )}
          </span>
          {!loading && <ArrowRight className="w-4 h-4 ml-auto" />}
        </button>
      </div>

      {/* Divider */}
      <div className="relative my-6 text-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[var(--border-token)]" />
        </div>
        <span className="relative px-3 bg-[var(--surface)] text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
          {t.onboarding.or}
        </span>
      </div>

      {/* Phone Number - Coming Soon */}
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="flex items-center gap-2 text-sm font-bold text-[var(--ink)]">
              <Phone className="w-4 h-4" />
              Phone Number
            </label>
            <span className="inline-block px-2 py-1 rounded bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-bold uppercase tracking-wider">
              Coming Soon
            </span>
          </div>
          <input
            type="tel"
            placeholder="+91 98765 43210"
            disabled
            className="w-full h-12 px-3.5 rounded-md border border-[var(--border-token)] bg-[var(--surface-2)] text-[var(--muted)] text-base font-medium placeholder:text-[var(--muted)] opacity-50 cursor-not-allowed"
          />
          <p className="text-xs text-[var(--muted)] mt-1.5">
            Phone verification will be available soon for SMS-based authentication
          </p>
        </div>
      </div>

      {/* Info Section */}
      <div className="mt-6 p-4 rounded-lg border border-[var(--border-token)] bg-[var(--surface-2)]/50 space-y-2">
        <div className="flex items-start gap-2.5">
          <Mail className="w-4 h-4 text-[var(--accent)] shrink-0 mt-0.5" />
          <div className="text-sm text-[var(--muted)]">
            <p className="font-semibold text-[var(--ink)] mb-1">Sign in with your Gmail account</p>
            <p>Your account will be created automatically on first sign-in</p>
          </div>
        </div>
      </div>
    </div>
  );
}
