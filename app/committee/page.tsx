import { Header } from "@/components/header";
import { LoginForm } from "./login-form";

export default function CommitteePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: "var(--bg)" }}>
      <Header />
      <main className="flex-1 flex items-center justify-center w-full px-4 py-16">
        <div
          className="w-full max-w-[400px] p-8 rounded-[12px] border border-[var(--border-token)]"
          style={{ backgroundColor: "var(--surface)" }}
        >
          <h1 className="font-display font-black text-[28px] leading-[1.15] tracking-[-0.01em] mb-2 text-[var(--ink)]">
            Committee only
          </h1>
          <p className="text-[15px] text-[var(--muted-foreground)] mb-6">Enter your passcode to access the dashboard.</p>
          <LoginForm />
        </div>
      </main>
    </div>
  );
}
