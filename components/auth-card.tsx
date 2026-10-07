"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLanguageStore } from "@/lib/language-store";
import { type ConfirmationResult } from "firebase/auth";
import { Phone, Mail, ArrowRight, Loader2, CheckCircle, ShieldAlert } from "lucide-react";

export function AuthCard() {
  const { signInWithGoogle, setupRecaptcha, sendPhoneOtp, verifyOtp } = useAuth();
  const { t } = useLanguageStore();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"input" | "otp">("input");

  useEffect(() => {
    // Clean up recaptcha container if unmounted
    return () => {
      const container = document.getElementById("recaptcha-container");
      if (container) container.innerHTML = "";
    };
  }, []);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Format phone: must include country code e.g. +91
    let formatted = phoneNumber.trim().replace(/\s+/g, "");
    if (!formatted.startsWith("+")) {
      formatted = "+91" + formatted;
    }

    if (formatted.length < 10) {
      setError(t.auth.phoneRequired);
      return;
    }

    try {
      setLoading(true);
      const appVerifier = setupRecaptcha("recaptcha-container");
      const confirmation = await sendPhoneOtp(formatted, appVerifier);
      setConfirmationResult(confirmation);
      setStep("otp");
    } catch (err: unknown) {
      console.error("Phone OTP error:", err);
      const message = err instanceof Error ? err.message : t.common.error;
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationResult || !otpCode.trim()) return;

    setError(null);
    try {
      setLoading(true);
      await verifyOtp(confirmationResult, otpCode.trim());
    } catch (err: unknown) {
      console.error("OTP Verification error:", err);
      setError(t.auth.invalidOtp);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    try {
      setLoading(true);
      await signInWithGoogle();
      // Page redirects to Google — loading stays true until redirect completes
      // (component will unmount on redirect, no need to setLoading(false))
    } catch (err: unknown) {
      console.error("Google sign in error:", err);
      const message = err instanceof Error ? err.message : t.common.error;
      setError(message);
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 sm:p-8 bg-[var(--surface)] border border-[var(--border-token)] rounded-lg shadow-sm">
      <div className="text-center mb-6">
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

      {step === "input" ? (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div>
            <label
              htmlFor="phone-input"
              className="block text-sm font-bold text-[var(--ink)] mb-1.5"
            >
              {t.auth.phoneLabel}
            </label>
            <div className="relative">
              <input
                id="phone-input"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+91 98765 43210"
                required
                className="w-full h-12 px-3.5 rounded-md border border-[var(--border-token)] bg-[var(--surface)] text-[var(--ink)] text-base font-medium placeholder:text-[var(--muted)] focus:border-[var(--border-strong)] transition-colors"
              />
            </div>
            <p className="text-xs text-[var(--muted)] mt-1.5">
              Enter phone with country code (e.g. +91 for India)
            </p>
          </div>

          <div id="recaptcha-container" />

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 px-4 rounded-md bg-[var(--ink)] text-[var(--ink-inverse)] font-bold text-base flex items-center justify-center gap-2 hover:opacity-95 transition-opacity disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t.auth.sendingOtp}</span>
              </>
            ) : (
              <>
                <Phone className="w-4 h-4" />
                <span>{t.auth.sendOtp}</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label
                htmlFor="otp-input"
                className="block text-sm font-bold text-[var(--ink)]"
              >
                {t.auth.otpLabel}
              </label>
              <button
                type="button"
                onClick={() => setStep("input")}
                className="text-xs font-semibold text-[var(--muted)] hover:text-[var(--ink)] underline min-h-[30px]"
              >
                Change number
              </button>
            </div>
            <input
              id="otp-input"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
              placeholder="123456"
              required
              autoFocus
              className="w-full h-12 px-3.5 text-center tracking-widest text-2xl font-black rounded-md border border-[var(--border-token)] bg-[var(--surface)] text-[var(--ink)] focus:border-[var(--border-strong)] transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading || otpCode.length < 6}
            className="w-full h-12 px-4 rounded-md bg-[var(--ink)] text-[var(--ink-inverse)] font-bold text-base flex items-center justify-center gap-2 hover:opacity-95 transition-opacity disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t.auth.verifyingOtp}</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>{t.auth.verifyOtp}</span>
              </>
            )}
          </button>
        </form>
      )}

      {/* Divider */}
      <div className="relative my-6 text-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[var(--border-token)]" />
        </div>
        <span className="relative px-3 bg-[var(--surface)] text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
          {t.onboarding.or}
        </span>
      </div>

      {/* Google Sign In */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="w-full h-12 px-4 rounded-md border border-[var(--border-token)] hover:border-[var(--border-strong)] bg-[var(--surface-2)] text-[var(--ink)] font-bold text-sm flex items-center justify-center gap-2.5 transition-colors disabled:opacity-50 min-h-[44px]"
      >
        <Mail className="w-4 h-4" />
        <span>{t.auth.googleSignIn}</span>
      </button>
    </div>
  );
}
