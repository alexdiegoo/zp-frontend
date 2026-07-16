import { Star } from "lucide-react";
import { getTranslations } from "next-intl/server";

// Placeholder content — real testimonials slot in here once clients go live.
const TESTIMONIAL_KEYS = ["aesthetics", "dental", "health"] as const;

/** Decorative SVG avatar placeholder — swapped for real photos later. */
function AvatarPlaceholder({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      aria-hidden
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="20" cy="20" r="20" className="fill-secondary" />
      <circle cx="20" cy="16" r="6" className="fill-brand/40" />
      <path
        d="M8 34c0-6.627 5.373-12 12-12s12 5.373 12 12"
        className="fill-brand/40"
      />
    </svg>
  );
}

/** Placeholder testimonials section — ready to receive real social proof. */
export async function SocialProof() {
  const t = await getTranslations("public");

  return (
    <section className="border-y border-border/60 bg-muted/30">
      <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t("socialProof.title")}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {t("socialProof.subtitle")}
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {TESTIMONIAL_KEYS.map((testimonialKey) => (
            <figure
              key={testimonialKey}
              className="flex flex-col rounded-2xl border border-border bg-card p-7 ring-1 ring-foreground/5"
            >
              <div className="flex gap-0.5 text-primary">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-4 fill-current" />
                ))}
              </div>
              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">
                “{t(`socialProof.testimonials.${testimonialKey}.quote`)}”
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <AvatarPlaceholder className="size-10" />
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {t("socialProof.testimonials.name")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t(`socialProof.testimonials.${testimonialKey}.role`)}
                  </p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
