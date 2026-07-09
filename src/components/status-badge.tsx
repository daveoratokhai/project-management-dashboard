import { cn } from "@/lib/utils";
import type { Tone } from "@/lib/projects";

const toneText: Record<Tone, string> = {
  green: "border-green-600/40 text-green-600 dark:text-green-400",
  yellow: "border-yellow-600/50 text-yellow-600 dark:text-yellow-500",
  red: "border-red-600/40 text-red-600 dark:text-red-400",
  gray: "border-border text-muted-foreground",
};

const toneDot: Record<Tone, string> = {
  green: "bg-green-500",
  yellow: "bg-yellow-500",
  red: "bg-red-500",
  gray: "bg-muted-foreground",
};

export function StatusBadge({
  text,
  tone,
  showDot = false,
  className,
}: {
  text: string;
  tone: Tone;
  showDot?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium",
        toneText[tone],
        className,
      )}
    >
      {showDot && <span className={cn("h-1.5 w-1.5 rounded-full", toneDot[tone])} />}
      {text}
    </span>
  );
}
