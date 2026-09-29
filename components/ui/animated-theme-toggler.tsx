"use client";

import { useTheme } from "next-themes";
import { useRef } from "react";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnimatedThemeTogglerProps {
  className?: string;
  duration?: number;
}

export function AnimatedThemeToggler({
  className,
  duration = 400,
}: AnimatedThemeTogglerProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const ref = useRef<HTMLButtonElement>(null);

  async function toggleTheme() {
    const nextTheme = isDark ? "light" : "dark";

    // Fallback for browsers without View Transitions support
    if (
      !("startViewTransition" in document) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setTheme(nextTheme);
      return;
    }

    // Get click origin for the circle expand
    const btn = ref.current;
    const x = btn ? btn.getBoundingClientRect().left + btn.offsetWidth / 2 : window.innerWidth / 2;
    const y = btn ? btn.getBoundingClientRect().top + btn.offsetHeight / 2 : window.innerHeight / 2;

    // Max radius = farthest corner from click point
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const clipPath = [
      `circle(0px at ${x}px ${y}px)`,
      `circle(${endRadius}px at ${x}px ${y}px)`,
    ];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const transition = (document as any).startViewTransition(() => {
      setTheme(nextTheme);
    });

    await transition.ready;

    document.documentElement.animate(
      { clipPath: isDark ? [...clipPath].reverse() : clipPath },
      {
        duration,
        easing: "ease-in-out",
        pseudoElement: isDark
          ? "::view-transition-old(root)"
          : "::view-transition-new(root)",
      }
    );
  }

  return (
    <button
      ref={ref}
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      suppressHydrationWarning
      className={cn(
        "flex items-center justify-center w-full h-full rounded-full",
        "text-[var(--muted-foreground)] hover:text-[var(--ink)]",
        "hover:bg-[var(--surface-2)] transition-colors duration-200 outline-none",
        className
      )}
    >
      <span suppressHydrationWarning className="flex items-center justify-center">
        {isDark ? <Moon size={20} strokeWidth={2} /> : <Sun size={20} strokeWidth={2} />}
      </span>
    </button>
  );
}
