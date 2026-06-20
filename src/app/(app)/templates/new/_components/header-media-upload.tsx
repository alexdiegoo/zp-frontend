"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import type { UseFormReturn } from "react-hook-form";
import { useWatch } from "react-hook-form";
import { ImageUp, Loader2 } from "lucide-react";

import { useUploadHeaderMedia } from "@/hooks/queries/use-templates";
import {
  TEMPLATE_HEADER_IMAGE_MAX_BYTES,
  TEMPLATE_HEADER_IMAGE_TYPES,
  type CreateTemplateForm,
} from "@/lib/validations/template";
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Muted } from "@/components/ui/typography";

interface HeaderMediaUploadProps {
  form: UseFormReturn<CreateTemplateForm>;
  isUploading: boolean;
  onUploadingChange: (uploading: boolean) => void;
}

/**
 * Header-image field: validates the file (PNG/JPEG, ≤5 MB), uploads it
 * immediately, and stores the returned URL in `headerMediaUrl`. The submit
 * button is held disabled (via `onUploadingChange`) while an upload is in
 * flight. The hidden remote URL is surfaced through a `FormField` so its
 * required error renders inline.
 */
export function HeaderMediaUpload({
  form,
  isUploading,
  onUploadingChange,
}: HeaderMediaUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const uploadMedia = useUploadHeaderMedia();

  const headerMediaUrl = useWatch({
    control: form.control,
    name: "headerMediaUrl",
  });

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // Allow re-selecting the same file later by clearing the input value.
    event.target.value = "";
    if (!file) return;

    setLocalError(null);

    if (!TEMPLATE_HEADER_IMAGE_TYPES.includes(file.type as never)) {
      setLocalError("Envie uma imagem PNG ou JPEG.");
      return;
    }
    if (file.size > TEMPLATE_HEADER_IMAGE_MAX_BYTES) {
      setLocalError("A imagem deve ter no máximo 5 MB.");
      return;
    }

    // Show an instant local preview while the upload runs.
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    onUploadingChange(true);

    uploadMedia.mutate(file, {
      onSuccess: ({ url }) => {
        form.setValue("headerMediaUrl", url, {
          shouldValidate: true,
          shouldDirty: true,
        });
      },
      onError: (error) => {
        setLocalError(
          error instanceof Error
            ? error.message
            : "Não foi possível enviar a imagem.",
        );
        setPreviewUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return null;
        });
        form.setValue("headerMediaUrl", "", { shouldValidate: true });
      },
      onSettled: () => onUploadingChange(false),
    });
  }

  const shownImage = previewUrl ?? headerMediaUrl ?? null;

  return (
    <FormField
      control={form.control}
      name="headerMediaUrl"
      render={() => (
        <FormItem>
          <FormLabel>Imagem do cabeçalho</FormLabel>

          <div className="flex flex-col gap-3">
            {shownImage ? (
              <div className="relative h-40 w-full overflow-hidden rounded-lg border border-border bg-muted">
                {/* Dynamic blob/remote source — next/image with `unoptimized`
                    avoids per-host config while still using the component. */}
                <Image
                  src={shownImage}
                  alt="Pré-visualização do cabeçalho"
                  fill
                  unoptimized
                  className="object-contain"
                />
                {isUploading ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/60">
                    <Loader2 className="size-6 animate-spin text-muted-foreground" />
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="flex items-center gap-3">
              <input
                ref={inputRef}
                type="file"
                accept="image/png,image/jpeg"
                className="hidden"
                onChange={handleFileChange}
              />
              <Button
                type="button"
                variant="outline"
                disabled={isUploading}
                onClick={() => inputRef.current?.click()}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Enviando…
                  </>
                ) : (
                  <>
                    <ImageUp />
                    {shownImage ? "Trocar imagem" : "Selecionar imagem"}
                  </>
                )}
              </Button>
              <Muted>PNG ou JPEG, máx 5 MB.</Muted>
            </div>

            {localError ? (
              <p className="text-sm text-destructive">{localError}</p>
            ) : (
              <FormMessage />
            )}
          </div>
        </FormItem>
      )}
    />
  );
}
