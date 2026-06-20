import { Zap } from "lucide-react";

import { cn } from "@/lib/utils";

interface LogoProps {
  /** Render the "ZapBlast" wordmark next to the mark. */
  showWordmark?: boolean;
  /** Color of the wordmark text. Defaults to current text color. */
  className?: string;
  /** Size of the square mark. */
  size?: "sm" | "md" | "lg";
}

const markSize = {
  sm: "size-7 [&>svg]:size-[18px]",
  md: "size-9 [&>svg]:size-5",
  lg: "size-11 [&>svg]:size-6",
} as const;

const wordmarkSize = {
  sm: "text-base",
  md: "text-lg",
  lg: "text-xl",
} as const;

/** ZapBlast brand mark: deep-green rounded square with a bolt + wordmark. */
export function Logo({ showWordmark = true, className, size = "sm" }: LogoProps) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          "flex items-center justify-center rounded-lg bg-brand text-brand-foreground",
          markSize[size]
        )}
      >
        <Zap className="fill-current" />
      </div>
      {showWordmark ? (
        <span
          className={cn(
            "font-bold tracking-tight",
            wordmarkSize[size],
            className
          )}
        >
          ZapBlast
        </span>
      ) : null}
    </div>
  );
}
