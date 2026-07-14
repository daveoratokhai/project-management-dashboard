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

// Human-readable label for a task's intake source.
function sourceLabel(source: string): string {
  if (source === "whatsapp") return "WhatsApp";
  return source;
}

// Amber pill marking an AI-created task that a human has not confirmed yet.
// Shows where it came from when the source isn't a manual entry.
export function UnreviewedBadge({
  source,
  className,
}: {
  source?: string;
  className?: string;
}) {
  const via = source && source !== "manual" ? ` · ${sourceLabel(source)}` : "";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border border-amber-600/40 px-2 py-0.5 text-[11px] font-medium text-amber-600 dark:text-amber-400",
        className,
      )}
    >
      Unreviewed{via}
    </span>
  );
}

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
