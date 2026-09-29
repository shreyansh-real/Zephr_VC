import { NavDock } from "@/components/nav-dock";
import { LoginForm } from "./login-form";
import { ShieldCheck, Lock, KeyRound } from "lucide-react";

export default function CommitteePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center pb-28" style={{ backgroundColor: "var(--bg)" }}>
      <div className="ml-0 md:ml-[90px] w-full flex-1 flex items-center justify-center px-4 py-16">
        <main className="w-full max-w-[440px] flex flex-col items-center">
          
          {/* Logo Brand Header */}
          <div className="flex flex-col items-center mb-6 text-center">
            <div className="relative mb-3 group">
              <div className="w-16 h-16 rounded-2xl p-1 bg-[var(--surface-2)] border border-[var(--border-token)] shadow-md flex items-center justify-center overflow-hidden">
                <img
                  src="/logo.png"
                  alt="Sochi Logo"
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[var(--ink)] text-[var(--ink-inverse)] flex items-center justify-center border-2 border-[var(--surface)] shadow-sm">
                <Lock size={12} />
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-semibold bg-[var(--surface-2)] text-[var(--muted-foreground)] border border-[var(--border-token)] mb-2">
              <ShieldCheck size={12} className="text-[var(--resolved)]" />
              Committee Portal
            </div>

            <h1 className="font-display font-black text-[28px] sm:text-[32px] leading-tight tracking-[-0.02em] text-[var(--ink)]">
              Authorized Access
            </h1>
            <p className="text-[14px] text-[var(--muted-foreground)] mt-1">
              Enter the management passcode to unlock triage dashboard.
            </p>
          </div>

          {/* Login Card */}
          <div
            className="w-full p-6 sm:p-8 rounded-2xl border border-[var(--border-token)] shadow-lg backdrop-blur-sm"
            style={{ backgroundColor: "var(--surface)" }}
          >
            <LoginForm />
          </div>

          <p className="text-[12px] text-[var(--muted-foreground)] mt-6 text-center">
            Protected with SHA-256 session tokens. Contact society admin for access credentials.
          </p>
        </main>
      </div>
      <NavDock />
    </div>
  );
}
