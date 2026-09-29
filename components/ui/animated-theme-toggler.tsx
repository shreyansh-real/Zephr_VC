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
  duration = 500,
}: AnimatedThemeTogglerProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const ref = useRef<HTMLButtonElement>(null);

  async function toggleTheme() {
    const nextTheme = isDark ? "light" : "dark";

    // No View Transitions support or reduced motion → instant switch
    if (
      !("startViewTransition" in document) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setTheme(nextTheme);
      return;
    }

    // Capture button center BEFORE the transition
    const btn = ref.current;
    const rect = btn?.getBoundingClientRect();
    const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
    const y = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;

    // Largest circle that covers the whole viewport from origin
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const vt = (document as any).startViewTransition(() => {
      // Synchronously apply the class so the snapshot of the NEW state
      // is taken immediately — this is the key fix.
      const root = document.documentElement;
      if (nextTheme === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
      // Keep next-themes in sync (updates localStorage, context, etc.)
      setTheme(nextTheme);
    });

    // Wait for both snapshots to be ready
    await vt.ready;

    // Always: new theme expands outward from button center as a circle
    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${endRadius}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)", // snappy ease-out-expo
        pseudoElement: "::view-transition-new(root)",
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
        {isDark
          ? <Moon size={20} strokeWidth={2} />
          : <Sun size={20} strokeWidth={2} />
        }
      </span>
    </button>
  );
}
