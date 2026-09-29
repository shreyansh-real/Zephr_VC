"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Home,
  FileText,
  ShieldCheck,
  LayoutDashboard,
  Lock,
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
  { href: "/", icon: Home, label: "Home" },
  { href: "/report", icon: FileText, label: "Report Problem" },
  { href: "/committee", icon: ShieldCheck, label: "Committee" },
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
];

// Shared hover bg wrapper using framer-motion for smooth bg fade
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
        "transition-colors duration-200 outline-none",
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

  async function handleLock() {
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/committee");
  }

  return (
    <div className="fixed left-4 top-1/2 -translate-y-1/2 z-50 select-none">
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
                    src="/logo.png"
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
  );
}
