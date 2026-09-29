"use client";

import { TriangleAlert, Droplets, ArrowUpDown, Car, Trash2, ShieldAlert, Volume2, HelpCircle } from "lucide-react";

export type UrgencyLevel = "Critical" | "High" | "Medium" | "Low";
export type CategoryType = "Water" | "Lift" | "Parking" | "Cleaning" | "Security" | "Noise" | "Other";

const URGENCY_STYLES: Record<UrgencyLevel, { chip: string; bar: string; icon: React.ReactNode }> = {
  Critical: {
    chip: "bg-[var(--critical)] text-white border-[var(--critical)]",
    bar: "bg-[var(--critical)]",
    icon: <TriangleAlert size={16} />,
  },
  High: {
    chip: "bg-[var(--high-tint)] text-[var(--ink)] border-[var(--high)]",
    bar: "bg-[var(--high)]",
    icon: <TriangleAlert size={16} />,
  },
  Medium: {
    chip: "bg-[var(--medium-tint)] text-[var(--ink)] border-[var(--medium)]",
    bar: "bg-[var(--medium)]",
    icon: <ArrowUpDown size={16} />,
  },
  Low: {
    chip: "bg-[var(--low-tint)] text-[var(--ink)] border-[var(--low)]",
    bar: "bg-[var(--low)]",
    icon: <Droplets size={16} />,
  },
};

const CATEGORY_ICONS: Record<CategoryType, React.ReactNode> = {
  Water: <Droplets size={16} />,
  Lift: <ArrowUpDown size={16} />,
  Parking: <Car size={16} />,
  Cleaning: <Trash2 size={16} />,
  Security: <ShieldAlert size={16} />,
  Noise: <Volume2 size={16} />,
  Other: <HelpCircle size={16} />,
};

interface UrgencyChipProps {
  level: UrgencyLevel;
  className?: string;
}

export function UrgencyChip({ level, className = "" }: UrgencyChipProps) {
  const style = URGENCY_STYLES[level];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[4px] border text-[14px] font-bold leading-none h-7 font-body ${style.chip} ${className}`}
      style={{ letterSpacing: "0.01em" }}
    >
      <span className={level === "Critical" ? "animate-pulse" : ""}>{style.icon}</span>
      {level}
    </span>
  );
}

interface CategoryChipProps {
  category: CategoryType | string;
  className?: string;
}

export function CategoryChip({ category, className = "" }: CategoryChipProps) {
  const icon = CATEGORY_ICONS[category as CategoryType] ?? <HelpCircle size={16} />;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[4px] border border-[var(--border-token)] bg-[var(--surface-2)] text-[var(--muted)] text-[14px] font-bold leading-none h-7 ${className}`}
    >
      {icon}
      {category}
    </span>
  );
}

interface UrgencyBarProps {
  level: UrgencyLevel;
}

export function UrgencyBar({ level }: UrgencyBarProps) {
  const style = URGENCY_STYLES[level];
  return <div className={`w-1.5 self-stretch rounded-none flex-shrink-0 ${style.bar}`} aria-hidden="true" />;
}

export { URGENCY_STYLES, CATEGORY_ICONS };
