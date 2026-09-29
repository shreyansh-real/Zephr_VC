"use client";

import { cn } from "@/lib/utils";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  MotionValue,
} from "framer-motion";
import React, { useRef, useState } from "react";

// ─── Dock Context ─────────────────────────────────────────────────────────────
interface DockContextValue {
  mouseX: MotionValue<number>;
  iconSize: number;
  iconMagnification: number;
  iconDistance: number;
}

const DEFAULT_SIZE = 40;
const DEFAULT_MAGNIFICATION = 64;
const DEFAULT_DISTANCE = 140;

export const DockContext = React.createContext<DockContextValue>({
  mouseX: { get: () => Infinity } as MotionValue<number>,
  iconSize: DEFAULT_SIZE,
  iconMagnification: DEFAULT_MAGNIFICATION,
  iconDistance: DEFAULT_DISTANCE,
});

// ─── Dock ─────────────────────────────────────────────────────────────────────
interface DockProps {
  className?: string;
  children: React.ReactNode;
  direction?: "top" | "middle" | "bottom";
  iconSize?: number;
  iconMagnification?: number;
  iconDistance?: number;
}

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
          /* layout */
          "flex h-[58px] gap-1 px-3 items-center rounded-2xl",
          /* glass surface — adapts to light/dark via CSS vars */
          "bg-[var(--surface)]/75 backdrop-blur-2xl",
          /* border subtly visible in both modes */
          "border border-[var(--border-token)]",
          /* multi-layer shadow for depth */
          "shadow-[0_2px_4px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.10),0_1px_0px_rgba(255,255,255,0.06)_inset]",
          "dark:shadow-[0_2px_4px_rgba(0,0,0,0.3),0_8px_32px_rgba(0,0,0,0.5),0_1px_0px_rgba(255,255,255,0.04)_inset]",
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
  const [hovered, setHovered] = useState(false);

  const { mouseX, iconSize, iconMagnification, iconDistance } =
    React.useContext(DockContext);

  // Distance from mouse center → interpolated target size
  const distanceFromMouse = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const sizeTarget = useTransform(
    distanceFromMouse,
    [-iconDistance, 0, iconDistance],
    [iconSize, iconMagnification, iconSize]
  );

  // Silky-smooth spring — slow settle, no bounce
  const size = useSpring(sizeTarget, {
    mass: 0.15,
    stiffness: 100,
    damping: 18,
  });

  // Vertical lift: icon floats up toward mouse
  const yTarget = useTransform(
    distanceFromMouse,
    [-iconDistance, 0, iconDistance],
    [0, -6, 0]
  );
  const y = useSpring(yTarget, {
    mass: 0.15,
    stiffness: 100,
    damping: 18,
  });

  return (
    <motion.div
      ref={ref}
      style={{ width: size, height: size, y }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className={cn(
        "relative flex aspect-square items-center justify-center rounded-full",
        "will-change-transform",
        className
      )}
    >
      {/* Inner scale pulse on hover for extra polish */}
      <motion.div
        className="flex items-center justify-center w-full h-full"
        animate={{ scale: hovered ? 1.08 : 1 }}
        transition={{ type: "spring", mass: 0.1, stiffness: 200, damping: 16 }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
