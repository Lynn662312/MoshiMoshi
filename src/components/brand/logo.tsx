import Link from "next/link";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({
  href = "/",
  light = false,
  compact = false,
}: {
  href?: string;
  light?: boolean;
  compact?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2 font-semibold tracking-[-0.03em]",
        light ? "text-white" : "text-ink",
      )}
      aria-label="Moshi home"
    >
      <span
        className={cn(
          "grid size-9 place-items-center rounded-xl",
          light ? "bg-white/12" : "bg-indigo text-white",
        )}
      >
        <Sparkles className="size-4" aria-hidden="true" />
      </span>
      {!compact && <span className="text-xl">moshi</span>}
    </Link>
  );
}
