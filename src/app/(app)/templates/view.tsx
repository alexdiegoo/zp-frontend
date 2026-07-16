"use client";

import { useCallback, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { AlertCircle, Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { useSyncTemplates, useTemplates } from "@/hooks/queries/use-templates";
import { PageHeader, Section } from "@/components/shared/layout/page-header";
import { DataTable } from "@/components/shared/data-table/data-table";
import { DataTablePagination } from "@/components/shared/data-table/data-table-pagination";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getTemplateColumns } from "./_components/columns";

const PAGE_SIZE = 20;

export function TemplatesView() {
  const t = useTranslations("templates");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const columns = useMemo(() => getTemplateColumns(t), [t]);

  // URL is the source of truth for the current page (shareable + survives refresh).
  const pageParam = Number(searchParams.get("page"));
  const page = Number.isFinite(pageParam) && pageParam >= 1 ? pageParam : 1;

  const goToPage = useCallback(
    (next: number) => {
      const params = new URLSearchParams(searchParams);
      if (next > 1) params.set("page", String(next));
      else params.delete("page");
      router.replace(`${pathname}?${params}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const params = useMemo(() => ({ page, limit: PAGE_SIZE }), [page]);
  const { data, isLoading, isError, error, isFetching, refetch } =
    useTemplates(params);

  const rows = data?.data ?? [];
  const meta = data?.meta;

  const syncTemplates = useSyncTemplates();

  function handleSync() {
    syncTemplates.mutate(undefined, {
      onSuccess: ({ syncedCount }) =>
        toast.success(
          syncedCount > 0
            ? t("toast.syncSuccess", { count: syncedCount })
            : t("toast.syncUpToDate"),
        ),
      onError: (error) =>
        toast.error(
          error instanceof Error ? error.message : t("toast.syncError"),
        ),
    });
  }

  return (
    <Section>
      <PageHeader title={t("title")} description={t("description")}>
        <Button
          variant="outline"
          onClick={handleSync}
          disabled={syncTemplates.isPending}
        >
          <RefreshCw
            className={cn(syncTemplates.isPending && "animate-spin")}
          />
          {syncTemplates.isPending ? t("syncing") : t("sync")}
        </Button>
        <Button asChild>
          <Link href="/templates/new">
            <Plus />
            {t("newTemplate")}
          </Link>
        </Button>
      </PageHeader>

      {isError ? (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertTitle>{t("error.loadList.title")}</AlertTitle>
          <AlertDescription>
            {error instanceof Error
              ? error.message
              : t("error.loadList.description")}
            <button
              type="button"
              onClick={() => refetch()}
              className="font-medium underline underline-offset-4"
            >
              {t("error.retry")}
            </button>
          </AlertDescription>
        </Alert>
      ) : (
        <div className="flex flex-col gap-4">
          <DataTable
            columns={columns}
            data={rows}
            isLoading={isLoading}
            emptyMessage={t("empty")}
            onRowClick={(template) => router.push(`/templates/${template.id}`)}
          />
          {meta && meta.total > 0 ? (
            <DataTablePagination
              page={meta.page}
              totalPages={meta.totalPages}
              total={meta.total}
              pageCount={rows.length}
              limit={meta.limit}
              isFetching={isFetching}
              onPageChange={goToPage}
              noun={{
                singular: t("noun.singular"),
                plural: t("noun.plural"),
              }}
            />
          ) : null}
        </div>
      )}
    </Section>
  );
}
