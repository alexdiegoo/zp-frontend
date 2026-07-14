import type { ReactNode } from "react";

/**
 * Presentational wrapper for one section of the privacy policy.
 *
 * Server Component — static legal copy, no interactivity. Styling is done with
 * theme tokens only (no `prose` plugin, no hardcoded colors). The `id` is a stable
 * anchor used for in-page navigation and deep links.
 */
export function PolicySection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
        {title}
      </h2>
      <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-muted-foreground">
        {children}
      </div>
    </section>
  );
}
