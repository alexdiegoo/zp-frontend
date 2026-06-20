import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Typed typography primitives matching the ZapBlast type scale
 * (see design-tokens.md). Sizes/weights mirror the reference's
 * Inter-based `headline-*` / `body-*` / `label-*` tokens.
 */

type HeadingProps = React.ComponentProps<"h1">;
type TextProps = React.ComponentProps<"p">;
type LabelTextProps = React.ComponentProps<"span">;

/** headline-lg — 24px / 600 / -0.02em */
function H1({ className, ...props }: HeadingProps) {
  return (
    <h1
      className={cn(
        "scroll-m-20 text-2xl leading-8 font-semibold tracking-[-0.02em] text-foreground",
        className
      )}
      {...props}
    />
  );
}

/** headline-md — 20px / 600 / -0.01em */
function H2({ className, ...props }: HeadingProps) {
  return (
    <h2
      className={cn(
        "scroll-m-20 text-xl leading-7 font-semibold tracking-[-0.01em] text-foreground",
        className
      )}
      {...props}
    />
  );
}

/** headline-sm — 16px / 600 */
function H3({ className, ...props }: HeadingProps) {
  return (
    <h3
      className={cn(
        "scroll-m-20 text-base leading-6 font-semibold text-foreground",
        className
      )}
      {...props}
    />
  );
}

/** body-md — 14px / 400 */
function P({ className, ...props }: TextProps) {
  return (
    <p
      className={cn("text-sm leading-5 text-foreground", className)}
      {...props}
    />
  );
}

/** body-sm — 13px / 400 / muted */
function Muted({ className, ...props }: TextProps) {
  return (
    <p
      className={cn("text-[13px] leading-[18px] text-muted-foreground", className)}
      {...props}
    />
  );
}

/** label-md — 12px / 500 / +0.05em / uppercase */
function Label({ className, ...props }: LabelTextProps) {
  return (
    <span
      className={cn(
        "text-xs leading-4 font-medium tracking-[0.05em] text-muted-foreground uppercase",
        className
      )}
      {...props}
    />
  );
}

export { H1, H2, H3, P, Muted, Label };
