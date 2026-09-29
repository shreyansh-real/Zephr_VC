"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  FileText,
  ShieldCheck,
  LayoutDashboard,
  Lock,
  Menu,
  X,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
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
  { href: "/", icon: Home, label: "Home", desc: "Society triage & overview" },
  { href: "/report", icon: FileText, label: "Report Issue", desc: "Submit maintenance complaint" },
  { href: "/committee", icon: ShieldCheck, label: "Committee Portal", desc: "RWA volunteer authorization" },
  { href: "/dashboard", icon: LayoutDashboard, label: "Management Dashboard", desc: "Live tickets & AI clustering" },
];

function DockButton({
  children,
  className,
  active,
  danger,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
  danger?: boolean;
}) {
  return (
    <motion.button
      {...(rest as React.ComponentProps<typeof motion.button>)}
      className={cn(
        "flex items-center justify-center w-full h-full rounded-full relative overflow-hidden",
        "transition-colors duration-200 outline-none cursor-pointer",
        active
          ? "bg-[var(--ink)] text-[var(--ink-inverse)]"
          : danger
          ? "text-[var(--muted-foreground)] hover:text-[var(--critical)]"
          : "text-[var(--muted-foreground)] hover:text-[var(--ink)]",
        className
      )}
      whileTap={{ scale: 0.9 }}
      transition={{ type: "spring", mass: 0.1, stiffness: 300, damping: 20 }}
    >
      {children}
    </motion.button>
  );
}

function DockLink({
  href,
  active,
  children,
  label,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
  label: string;
}) {
  return (
    <motion.div
      className="w-full h-full"
      whileTap={{ scale: 0.88 }}
      transition={{ type: "spring", mass: 0.1, stiffness: 300, damping: 20 }}
    >
      <Link
        href={href}
        aria-label={label}
        className={cn(
          "flex items-center justify-center w-full h-full rounded-full",
          "transition-colors duration-200 outline-none",
          active
            ? "bg-[var(--ink)] text-[var(--ink-inverse)]"
            : "text-[var(--muted-foreground)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)]"
        )}
      >
        {children}
      </Link>
    </motion.div>
  );
}

function ThemeDockItem() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center justify-center w-full h-full">
          <AnimatedThemeToggler duration={450} />
        </div>
      </TooltipTrigger>
      <TooltipContent side="right">Toggle theme</TooltipContent>
    </Tooltip>
  );
}

export function NavDock({ showLock = false, showLive = false }: NavDockProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  async function handleLock() {
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/committee");
  }

  return (
    <>
      {/* ══════════════════════════════════════════════════════════════
          1. MOBILE TOP NAVIGATION BAR (ONLY ON PHONE / SMALL SCREENS)
         ══════════════════════════════════════════════════════════════ */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-[var(--surface)]/95 backdrop-blur-md border-b border-[var(--border-token)] px-4 flex items-center justify-between select-none">
        {/* Brand Logo & Name */}
        <Link
          href="/"
          onClick={() => setMobileMenuOpen(false)}
          className="flex items-center gap-2.5 outline-none"
        >
          <div className="w-8 h-8 rounded-xl p-0.5 bg-[var(--surface-2)] border border-[var(--border-token)] overflow-hidden shrink-0 shadow-xs">
            <img src="/favicon.svg" alt="Sochi" className="w-full h-full object-cover rounded-lg" />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-black text-[18px] leading-none text-[var(--ink)] tracking-tight">
              Sochi
            </span>
            <span className="text-[10px] text-[var(--muted-foreground)] font-semibold leading-none mt-0.5">
              Palm Grove RWA
            </span>
          </div>
        </Link>

        {/* Right Controls: Theme Toggle & 3-Lines Hamburger */}
        <div className="flex items-center gap-2">
          {showLive && (
            <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-[var(--resolved-tint)] text-[var(--resolved)] border border-[var(--resolved)]/40 mr-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--resolved)] animate-pulse" />
              Live
            </span>
          )}

          {/* Theme Toggler Button */}
          <div className="w-9 h-9 rounded-xl border border-[var(--border-token)] bg-[var(--surface-2)] flex items-center justify-center">
            <AnimatedThemeToggler duration={400} />
          </div>

          {/* 3-Lines Smooth Hamburger Menu Button */}
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open navigation menu"}
            className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
              mobileMenuOpen
                ? "bg-[var(--ink)] text-[var(--ink-inverse)] border-[var(--ink)]"
                : "bg-[var(--surface-2)] text-[var(--ink)] border-[var(--border-token)] hover:border-[var(--border-strong)]"
            }`}
          >
            {mobileMenuOpen ? (
              <X size={18} strokeWidth={2.5} />
            ) : (
              <Menu size={18} strokeWidth={2.5} />
            )}
          </button>
        </div>
      </header>

      {/* ── MOBILE SLIDE-DOWN DRAWER MENU ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-xs"
              aria-hidden="true"
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
              className="md:hidden fixed top-14 left-0 right-0 z-40 bg-[var(--surface)] border-b border-[var(--border-token)] shadow-2xl p-4 flex flex-col gap-3.5 max-h-[calc(100vh-3.5rem)] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-2 border-b border-[var(--border-token)] text-[11px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                <span>Navigation Menu</span>
                <span className="flex items-center gap-1 text-[var(--ink)]">
                  <Sparkles size={11} className="text-[var(--high)]" /> Resident Hub
                </span>
              </div>

              {/* Nav Items List */}
              <div className="flex flex-col gap-1.5">
                {NAV_ITEMS.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                        isActive
                          ? "bg-[var(--ink)] text-[var(--ink-inverse)] border-[var(--ink)] shadow-sm"
                          : "bg-[var(--surface-2)] text-[var(--ink)] border-[var(--border-token)] hover:bg-[var(--border-token)]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          isActive
                            ? "bg-[var(--ink-inverse)] text-[var(--ink)]"
                            : "bg-[var(--surface)] text-[var(--ink)] border border-[var(--border-token)]"
                        }`}>
                          <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-[14px] leading-tight">
                            {item.label}
                          </span>
                          <span className={`text-[11px] ${isActive ? "text-[var(--ink-inverse)]/70" : "text-[var(--muted-foreground)]"}`}>
                            {item.desc}
                          </span>
                        </div>
                      </div>
                      <ChevronRight size={16} className={isActive ? "text-[var(--ink-inverse)]/70" : "text-[var(--muted-foreground)]"} />
                    </Link>
                  );
                })}
              </div>

              {/* Bottom Actions for Mobile */}
              {showLock && (
                <div className="pt-2 border-t border-[var(--border-token)] flex items-center justify-between">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      void handleLock();
                    }}
                    className="w-full flex items-center justify-center gap-2 h-10 rounded-xl font-bold text-[13px] border border-[var(--critical)] text-[var(--critical)] bg-[var(--critical-tint)]/40 hover:bg-[var(--critical-tint)] cursor-pointer transition-colors"
                  >
                    <Lock size={15} />
                    <span>Lock Dashboard Session</span>
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════════
          2. DESKTOP FLOATING DOCK (ONLY ON TABLET / DESKTOP SCREENS)
         ══════════════════════════════════════════════════════════════ */}
      <div className="hidden md:flex fixed left-4 top-1/2 -translate-y-1/2 z-50 select-none">
        <TooltipProvider>
          <Dock
            direction="middle"
            iconSize={44}
            iconMagnification={66}
            iconDistance={135}
          >
            {/* ── Brand wordmark ── */}
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div
                  whileHover={{ opacity: 0.8, scale: 1.05 }}
                  whileTap={{ scale: 0.94 }}
                  transition={{ type: "spring", mass: 0.15, stiffness: 250, damping: 20 }}
                  className="flex items-center justify-center"
                >
                  <Link
                    href="/"
                    aria-label="Sochi home"
                    className="flex items-center justify-center w-8 h-8 rounded-full overflow-hidden border border-[var(--border-token)] focus:outline-none bg-[var(--surface-2)] shadow-sm"
                  >
                    <img
                      src="/favicon.svg"
                      alt="Sochi"
                      className="w-full h-full object-cover"
                    />
                  </Link>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent side="right">Sochi — home</TooltipContent>
            </Tooltip>

            <Separator orientation="horizontal" />

            {/* ── Nav links ── */}
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <DockIcon key={item.href}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DockLink href={item.href} active={isActive} label={item.label}>
                        <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                      </DockLink>
                    </TooltipTrigger>
                    <TooltipContent side="right">{item.label}</TooltipContent>
                  </Tooltip>
                </DockIcon>
              );
            })}

            <Separator orientation="horizontal" />

            {/* ── Theme toggle ── */}
            <DockIcon>
              <ThemeDockItem />
            </DockIcon>

            {/* ── Live pulse ── */}
            {showLive && (
              <DockIcon>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center justify-center w-full h-full rounded-full cursor-default">
                      <motion.span
                        className="block w-2.5 h-2.5 rounded-full bg-[var(--low)]"
                        animate={{ scale: [1, 1.35, 1], opacity: [1, 0.55, 1] }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right">Live updates</TooltipContent>
                </Tooltip>
              </DockIcon>
            )}

            {/* ── Lock ── */}
            {showLock && (
              <>
                <Separator orientation="horizontal" />
                <DockIcon>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DockButton
                        onClick={handleLock}
                        aria-label="Lock dashboard"
                        danger
                      >
                        <Lock size={18} strokeWidth={2} />
                      </DockButton>
                    </TooltipTrigger>
                    <TooltipContent side="right">Lock dashboard</TooltipContent>
                  </Tooltip>
                </DockIcon>
              </>
            )}
          </Dock>
        </TooltipProvider>
      </div>
    </>
  );
}
