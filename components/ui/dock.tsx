"use client";

import { cn } from "@/lib/utils";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import React, { useRef } from "react";

// ─── Dock ────────────────────────────────────────────────────────────────────
interface DockProps {
  className?: string;
  children: React.ReactNode;
  direction?: "top" | "middle" | "bottom";
  iconSize?: number;
  iconMagnification?: number;
  iconDistance?: number;
}

const DEFAULT_SIZE = 48;
const DEFAULT_MAGNIFICATION = 68;
const DEFAULT_DISTANCE = 120;

export const DockContext = React.createContext<{
  mouseX: ReturnType<typeof useMotionValue<number>>;
  iconSize: number;
  iconMagnification: number;
  iconDistance: number;
}>({
  mouseX: { get: () => Infinity } as ReturnType<typeof useMotionValue<number>>,
  iconSize: DEFAULT_SIZE,
  iconMagnification: DEFAULT_MAGNIFICATION,
  iconDistance: DEFAULT_DISTANCE,
});

export function Dock({
  className,
  children,
  direction = "bottom",
  iconSize = DEFAULT_SIZE,
  iconMagnification = DEFAULT_MAGNIFICATION,
  iconDistance = DEFAULT_DISTANCE,
}: DockProps) {
  const mouseX = useMotionValue(Infinity);

  const alignmentClass =
    direction === "top"
      ? "items-start"
      : direction === "middle"
      ? "items-center"
      : "items-end";

  return (
    <DockContext.Provider value={{ mouseX, iconSize, iconMagnification, iconDistance }}>
      <motion.div
        onMouseMove={(e) => mouseX.set(e.pageX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        className={cn(
          "flex h-16 gap-2 px-4 items-center rounded-2xl",
          "border border-[var(--border-token)] bg-[var(--surface)]/80 backdrop-blur-xl",
          "shadow-[0_8px_32px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.08)]",
          "dark:shadow-[0_8px_32px_rgba(0,0,0,0.4),0_2px_8px_rgba(0,0,0,0.3)]",
          alignmentClass,
          className
        )}
      >
        {children}
      </motion.div>
    </DockContext.Provider>
  );
}

// ─── DockIcon ─────────────────────────────────────────────────────────────────
interface DockIconProps {
  className?: string;
  children: React.ReactNode;
}

export function DockIcon({ className, children }: DockIconProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { mouseX, iconSize, iconMagnification, iconDistance } =
    React.useContext(DockContext);

  const distanceFromMouse = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const widthSync = useTransform(
    distanceFromMouse,
    [-iconDistance, 0, iconDistance],
    [iconSize, iconMagnification, iconSize]
  );

  const width = useSpring(widthSync, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  return (
    <motion.div
      ref={ref}
      style={{ width, height: width }}
      className={cn(
        "flex aspect-square cursor-pointer items-center justify-center rounded-full",
        className
      )}
    >
      {children}
    </motion.div>
  );
}
