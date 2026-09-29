"use client";

import React, { createContext, useContext, useState, useRef } from "react";
import { cn } from "@/lib/utils";

interface TooltipContextValue {
  open: boolean;
  setOpen: (v: boolean) => void;
}
const TooltipContext = createContext<TooltipContextValue>({ open: false, setOpen: () => {} });

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function Tooltip({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <TooltipContext.Provider value={{ open, setOpen }}>
      <div className="relative flex items-center justify-center">
        {children}
      </div>
    </TooltipContext.Provider>
  );
}

export function TooltipTrigger({
  children,
  asChild,
}: {
  children: React.ReactElement<React.HTMLAttributes<HTMLElement>>;
  asChild?: boolean;
}) {
  const { setOpen } = useContext(TooltipContext);
  return React.cloneElement(children, {
    onMouseEnter: () => setOpen(true),
    onMouseLeave: () => setOpen(false),
    onFocus: () => setOpen(true),
    onBlur: () => setOpen(false),
  });
}

export function TooltipContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { open } = useContext(TooltipContext);
  return (
    <div
      role="tooltip"
      className={cn(
        "pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 z-50",
        "px-2.5 py-1 rounded-lg text-[12px] font-bold whitespace-nowrap",
        "bg-[var(--ink)] text-[var(--ink-inverse)] shadow-lg",
        "transition-all duration-150",
        open ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1",
        className
      )}
    >
      {children}
    </div>
  );
}
