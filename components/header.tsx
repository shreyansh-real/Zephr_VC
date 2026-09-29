"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";
import { Lock } from "lucide-react";

interface HeaderProps {
  showLock?: boolean;
  showLive?: boolean;
}

export function Header({ showLock = false, showLive = false }: HeaderProps) {
  const router = useRouter();

  async function handleLock() {
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/committee");
  }

  return (
    <header
      className="sticky top-0 z-50 border-b border-[var(--border-token)]"
      style={{ backgroundColor: "var(--bg)" }}
    >
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="font-display font-black text-2xl tracking-tight text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--border-strong)] rounded"
        >
          Sochi
        </Link>
        <div className="flex items-center gap-2">
          {showLive && (
            <span className="flex items-center gap-1.5 text-[15px] font-bold text-[var(--muted-foreground)]">
              <span className="w-2 h-2 rounded-full bg-[var(--low)] animate-pulse" aria-hidden="true" />
              Live
            </span>
          )}
          <ThemeToggle />
          {showLock && (
            <button
              onClick={handleLock}
              className="flex items-center gap-1.5 h-11 px-3 rounded-lg hover:bg-[var(--surface-2)] transition-colors text-[15px] font-bold text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--border-strong)]"
              aria-label="Lock dashboard"
            >
              <Lock size={18} />
              Lock
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
