import { Check, X } from "lucide-react";
import { getTranslations } from "next-intl/server";

const PROBLEM_KEYS = [
  "problemSolution.problems.followUp",
  "problemSolution.problems.manual",
  "problemSolution.problems.visibility",
  "problemSolution.problems.campaigns",
] as const;

const SOLUTION_KEYS = [
  "problemSolution.solutions.funnel",
  "problemSolution.solutions.reminders",
  "problemSolution.solutions.dashboard",
  "problemSolution.solutions.blast",
] as const;

/** Side-by-side framing of the clinic's pain vs. what ZapBlast delivers. */
export async function ProblemSolution() {
  const t = await getTranslations("public");

  return (
    <section className="border-t border-border/60 bg-muted/30">
      <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t.rich("problemSolution.title", {
              highlight: (chunks) => <span className="text-brand">{chunks}</span>,
            })}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {t("problemSolution.subtitle")}
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          {/* Problem column */}
          <div className="rounded-2xl border border-border bg-card p-8 ring-1 ring-foreground/5">
            <h3 className="text-lg font-semibold text-foreground">
              {t("problemSolution.problemsTitle")}
            </h3>
            <ul className="mt-6 space-y-4">
              {PROBLEM_KEYS.map((problemKey) => (
                <li key={problemKey} className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                    <X className="size-3.5" />
                  </span>
                  <span className="text-sm text-muted-foreground">{t(problemKey)}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Solution column */}
          <div className="rounded-2xl border border-brand/20 bg-brand/5 p-8 ring-1 ring-brand/10">
            <h3 className="text-lg font-semibold text-brand">
              {t("problemSolution.solutionsTitle")}
            </h3>
            <ul className="mt-6 space-y-4">
              {SOLUTION_KEYS.map((solutionKey) => (
                <li key={solutionKey} className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-brand">
                    <Check className="size-3.5" />
                  </span>
                  <span className="text-sm text-foreground">{t(solutionKey)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
