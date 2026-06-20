import { type NextRequest, NextResponse } from "next/server";

import { apiClient, ApiError } from "@/lib/api/api-client";
import { resolveClinicId } from "@/lib/api/clinic";
import {
  TEMPLATE_HEADER_IMAGE_MAX_BYTES,
  TEMPLATE_HEADER_IMAGE_TYPES,
} from "@/lib/validations/template";

/**
 * Uploads a template header image and returns its hosted `{ url }`. Receives a
 * `multipart/form-data` body (field `file`), re-validates type/size, then
 * forwards it to `POST /clinics/:clinicId/messaging/templates/upload-header-media`.
 */
export async function POST(req: NextRequest) {
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Selecione um arquivo de imagem." },
      { status: 422 },
    );
  }

  if (!TEMPLATE_HEADER_IMAGE_TYPES.includes(file.type as never)) {
    return NextResponse.json(
      { error: "Envie uma imagem PNG ou JPEG." },
      { status: 422 },
    );
  }

  if (file.size > TEMPLATE_HEADER_IMAGE_MAX_BYTES) {
    return NextResponse.json(
      { error: "A imagem deve ter no máximo 5 MB." },
      { status: 422 },
    );
  }

  try {
    const clinicId = await resolveClinicId();
    const forward = new FormData();
    forward.append("file", file, file.name);
    const { url } = await apiClient.postForm<{ url: string }>(
      `/clinics/${clinicId}/messaging/templates/upload-header-media`,
      forward,
    );
    return NextResponse.json({ data: { url } });
  } catch (error) {
    if (error instanceof Error && error.message === "NO_CLINIC") {
      return NextResponse.json(
        { error: "Nenhuma clínica encontrada para a sua conta." },
        { status: 404 },
      );
    }
    const status = error instanceof ApiError ? error.status : 500;
    return NextResponse.json(
      { error: "Não foi possível enviar a imagem." },
      { status },
    );
  }
}
