import * as React from "react";

import { cn } from "@/lib/utils";
import { H1, Muted } from "@/components/ui/typography";

interface PageHeaderProps {
  title: string;
  description?: string;
  /** Trailing actions (e.g. a "New campaign" button). */
  children?: React.ReactNode;
  className?: string;
}

/** Standard page title block: heading + description + trailing actions. */
export function PageHeader({
  title,
  description,
  children,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <div className="space-y-1">
        <H1>{title}</H1>
        {description ? <Muted>{description}</Muted> : null}
      </div>
      {children ? (
        <div className="flex items-center gap-2">{children}</div>
      ) : null}
    </div>
  );
}

/** Vertical content section with consistent page padding and spacing. */
export function Section({
  className,
  ...props
}: React.ComponentProps<"section">) {
  return (
    <section
      className={cn("flex flex-col gap-6 px-4 py-4 sm:px-6 sm:py-6", className)}
      {...props}
    />
  );
}
