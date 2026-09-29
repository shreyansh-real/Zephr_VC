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
  side = "top",
}: {
  children: React.ReactNode;
  className?: string;
  side?: "top" | "right" | "bottom" | "left";
}) {
  const { open } = useContext(TooltipContext);

  const positionClass =
    side === "right"
      ? "left-full top-1/2 -translate-y-1/2 ml-2"
      : side === "left"
      ? "right-full top-1/2 -translate-y-1/2 mr-2"
      : side === "bottom"
      ? "top-full left-1/2 -translate-x-1/2 mt-2"
      : "-top-10 left-1/2 -translate-x-1/2"; // top (default)

  const entryClass =
    side === "right"
      ? open ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-1"
      : side === "left"
      ? open ? "opacity-100 translate-x-0" : "opacity-0 translate-x-1"
      : open ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1";

  return (
    <div
      role="tooltip"
      className={cn(
        "pointer-events-none absolute z-50",
        "px-2.5 py-1 rounded-lg text-[12px] font-bold whitespace-nowrap",
        "bg-[var(--ink)] text-[var(--ink-inverse)] shadow-lg",
        "transition-all duration-150",
        positionClass,
        entryClass,
        className
      )}
    >
      {children}
    </div>
  );
}
