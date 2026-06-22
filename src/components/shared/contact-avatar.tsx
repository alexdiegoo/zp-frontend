import { cn } from "@/lib/utils";

/** Builds up-to-two-letter initials from a name or phone number. */
export function initialsOf(value: string): string {
  const parts = value.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

/**
 * Round avatar showing a contact's initials as a fallback. No image dependency
 * yet — initials stand in until contact photos are supported.
 */
export function ContactAvatar({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground",
        "size-10 text-sm font-medium",
        className,
      )}
      aria-hidden
    >
      {initialsOf(name)}
    </div>
  );
}
