"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Home,
  FileText,
  ShieldCheck,
  LayoutDashboard,
  Sun,
  Moon,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Dock, DockIcon } from "@/components/ui/dock";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

interface NavDockProps {
  showLock?: boolean;
  showLive?: boolean;
}

const NAV_ITEMS = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/report", icon: FileText, label: "Report a Problem" },
  { href: "/committee", icon: ShieldCheck, label: "Committee Login" },
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
];

function ThemeDockItem() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={() => setTheme(isDark ? "light" : "dark")}
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          suppressHydrationWarning
          className={cn(
            "flex items-center justify-center w-full h-full rounded-full",
            "text-[var(--muted-foreground)] hover:text-[var(--ink)]",
            "hover:bg-[var(--surface-2)] transition-colors"
          )}
        >
          <span suppressHydrationWarning>
            {isDark ? <Moon size={20} /> : <Sun size={20} />}
          </span>
        </button>
      </TooltipTrigger>
      <TooltipContent>{isDark ? "Light mode" : "Dark mode"}</TooltipContent>
    </Tooltip>
  );
}

export function NavDock({ showLock = false, showLive = false }: NavDockProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLock() {
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/committee");
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <TooltipProvider>
        <Dock direction="middle" iconSize={44} iconMagnification={62} iconDistance={100}>
          {/* Brand wordmark */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/"
                className="px-3 flex items-center font-display font-black text-[18px] tracking-tight text-[var(--ink)] hover:opacity-70 transition-opacity focus:outline-none"
                aria-label="Zephr home"
              >
                Zephr
              </Link>
            </TooltipTrigger>
            <TooltipContent>Home</TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" />

          {/* Nav links */}
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <DockIcon key={item.href}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      aria-label={item.label}
                      className={cn(
                        "flex items-center justify-center w-full h-full rounded-full transition-colors",
                        isActive
                          ? "bg-[var(--ink)] text-[var(--ink-inverse)]"
                          : "text-[var(--muted-foreground)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)]"
                      )}
                    >
                      <item.icon size={19} />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>{item.label}</TooltipContent>
                </Tooltip>
              </DockIcon>
            );
          })}

          <Separator orientation="vertical" />

          {/* Theme toggle */}
          <DockIcon>
            <ThemeDockItem />
          </DockIcon>

          {/* Live indicator */}
          {showLive && (
            <DockIcon>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center justify-center w-full h-full rounded-full cursor-default">
                    <span className="w-2.5 h-2.5 rounded-full bg-[var(--low)] animate-pulse" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>Live</TooltipContent>
              </Tooltip>
            </DockIcon>
          )}

          {/* Lock (dashboard only) */}
          {showLock && (
            <>
              <Separator orientation="vertical" />
              <DockIcon>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={handleLock}
                      aria-label="Lock dashboard"
                      className="flex items-center justify-center w-full h-full rounded-full text-[var(--muted-foreground)] hover:text-[var(--critical)] hover:bg-[var(--surface-2)] transition-colors"
                    >
                      <Lock size={19} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Lock dashboard</TooltipContent>
                </Tooltip>
              </DockIcon>
            </>
          )}
        </Dock>
      </TooltipProvider>
    </div>
  );
}
