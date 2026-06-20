import { type NextRequest, NextResponse } from "next/server";

import { apiClient, ApiError } from "@/lib/api/api-client";
import { resolveClinicId } from "@/lib/api/clinic";
import type {
  Procedure,
  ProcedureDetail,
  ProcedurePrice,
  ProceduresListResponse,
} from "@/types/api";

/**
 * Full procedure detail: the catalog entry + its complete price history.
 *
 * The backend exposes no single-procedure GET, so we compose the detail from
 * two documented endpoints (see `ZAPBLAST_BACKEND_API.md`):
 *   - the catalog listing (`/catalog/procedures`) to locate the entry, and
 *   - the price-history endpoint (`/catalog/procedures/:id/prices`).
 * The catalog is small (capped at 100 here), so scanning the listing for the
 * id is acceptable.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const clinicId = await resolveClinicId();

    const [list, prices] = await Promise.all([
      apiClient.get<ProceduresListResponse>(
        `/clinics/${clinicId}/catalog/procedures`,
        { params: { page: 1, limit: 100 } },
      ),
      apiClient.get<{ data: ProcedurePrice[] }>(
        `/clinics/${clinicId}/catalog/procedures/${id}/prices`,
      ),
    ]);

    const procedure = list.data.find((item: Procedure) => item.id === id);
    if (!procedure) {
      return NextResponse.json(
        { error: "Procedimento não encontrado." },
        { status: 404 },
      );
    }

    const detail: ProcedureDetail = {
      ...procedure,
      priceHistory: prices.data ?? [],
    };
    return NextResponse.json({ data: detail });
  } catch (error) {
    if (error instanceof Error && error.message === "NO_CLINIC") {
      return NextResponse.json(
        { error: "Nenhuma clínica encontrada para a sua conta." },
        { status: 404 },
      );
    }
    const status = error instanceof ApiError ? error.status : 500;
    return NextResponse.json(
      {
        error:
          status === 404
            ? "Procedimento não encontrado."
            : "Não foi possível carregar o procedimento.",
      },
      { status },
    );
  }
}
