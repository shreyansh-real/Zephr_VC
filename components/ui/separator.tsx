import { cn } from "@/lib/utils";

interface SeparatorProps {
  orientation?: "horizontal" | "vertical";
  className?: string;
}

export function Separator({ orientation = "horizontal", className }: SeparatorProps) {
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cn(
        "shrink-0 bg-[var(--border-token)]",
        orientation === "vertical" ? "w-px self-stretch mx-1" : "h-px w-full my-1",
        className
      )}
    />
  );
}
