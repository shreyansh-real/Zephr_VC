"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const isDark = (resolvedTheme ?? theme) === "dark";

  return (
    <button
      className="w-11 h-11 flex items-center justify-center rounded-lg hover:bg-[var(--surface-2)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--border-strong)] focus:ring-offset-2"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      suppressHydrationWarning
    >
      <span suppressHydrationWarning>
        {isDark ? <Moon size={20} /> : <Sun size={20} />}
      </span>
    </button>
  );
}
