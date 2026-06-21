"use client";

import { useCallback, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { useSyncTemplates, useTemplates } from "@/hooks/queries/use-templates";
import { PageHeader, Section } from "@/components/shared/layout/page-header";
import { DataTable } from "@/components/shared/data-table/data-table";
import { DataTablePagination } from "@/components/shared/data-table/data-table-pagination";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { templateColumns } from "./_components/columns";

const PAGE_SIZE = 20;

export function TemplatesView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

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
            ? `${syncedCount} ${
                syncedCount === 1 ? "template sincronizado" : "templates sincronizados"
              } com a Meta.`
            : "Templates já estão atualizados.",
        ),
      onError: (error) =>
        toast.error(
          error instanceof Error
            ? error.message
            : "Não foi possível sincronizar os templates.",
        ),
    });
  }

  return (
    <Section>
      <PageHeader
        title="Templates"
        description="Modelos de mensagem do WhatsApp para API Oficial."
      >
        <Button
          variant="outline"
          onClick={handleSync}
          disabled={syncTemplates.isPending}
        >
          <RefreshCw
            className={cn(syncTemplates.isPending && "animate-spin")}
          />
          {syncTemplates.isPending ? "Sincronizando…" : "Sincronizar"}
        </Button>
        <Button asChild>
          <Link href="/templates/new">
            <Plus />
            Criar template
          </Link>
        </Button>
      </PageHeader>

      {isError ? (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertTitle>Não foi possível carregar os templates.</AlertTitle>
          <AlertDescription>
            {error instanceof Error
              ? error.message
              : "Tente novamente em instantes."}
            <button
              type="button"
              onClick={() => refetch()}
              className="font-medium underline underline-offset-4"
            >
              Tentar novamente
            </button>
          </AlertDescription>
        </Alert>
      ) : (
        <div className="flex flex-col gap-4">
          <DataTable
            columns={templateColumns}
            data={rows}
            isLoading={isLoading}
            emptyMessage="Nenhum template cadastrado ainda."
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
              noun={{ singular: "template", plural: "templates" }}
            />
          ) : null}
        </div>
      )}
    </Section>
  );
}
