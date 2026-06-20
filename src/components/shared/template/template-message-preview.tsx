"use client";

import { Fragment } from "react";
import Image from "next/image";
import { ExternalLink, Reply } from "lucide-react";

import { cn } from "@/lib/utils";

/** A button rendered in the bubble (matches both the form and `TemplateButton`). */
type PreviewButton = {
  text: string;
  type: string;
  url?: string | null;
};

export interface TemplateMessagePreviewProps {
  /** `IMAGE` shows the media header; anything else with `headerText` shows a text header. */
  headerType?: string | null;
  headerText?: string | null;
  headerMediaUrl?: string | null;
  /** Raw body with `{{var}}` placeholders (or an already-substituted preview). */
  bodyText?: string | null;
  /** Example values used to substitute `{{var}}` placeholders in the body. */
  variableExamples?: Record<string, string>;
  footer?: string | null;
  buttons?: PreviewButton[] | null;
  className?: string;
}

/**
 * Renders the body with `{{variables}}` replaced by their example values.
 * Variables without an example are kept as `{{name}}` and highlighted so it is
 * clear what still needs a value.
 */
function renderBody(
  text: string,
  examples: Record<string, string> | undefined,
) {
  if (!text) {
    return (
      <span className="text-muted-foreground">
        Sua mensagem aparecerá aqui…
      </span>
    );
  }

  const segments = text.split(/(\{\{[a-zA-Z0-9_]+\}\})/g);
  return segments.map((segment, index) => {
    const match = segment.match(/^\{\{([a-zA-Z0-9_]+)\}\}$/);
    if (!match) return <Fragment key={index}>{segment}</Fragment>;

    const name = match[1];
    const example = examples?.[name]?.trim();
    if (example) return <Fragment key={index}>{example}</Fragment>;

    return (
      <span key={index} className="font-medium text-template-variable">
        {segment}
      </span>
    );
  });
}

/**
 * WhatsApp-style message bubble shared by the template editor's live preview
 * and the template detail screen. Purely presentational — callers feed it plain
 * values (watched form fields or a fetched template).
 */
export function TemplateMessagePreview({
  headerType,
  headerText,
  headerMediaUrl,
  bodyText,
  variableExamples,
  footer,
  buttons,
  className,
}: TemplateMessagePreviewProps) {
  const showImage = headerType === "IMAGE" && Boolean(headerMediaUrl);
  // Any non-image header with text (the editor's `NONE` + text, or a `TEXT` header).
  const showHeaderText = headerType !== "IMAGE" && Boolean(headerText?.trim());
  const visibleButtons = (buttons ?? []).filter((button) =>
    button?.text?.trim(),
  );

  return (
    <div className={cn("rounded-xl bg-muted p-4", className)}>
      <div className="overflow-hidden rounded-lg rounded-tl-sm bg-card shadow-sm ring-1 ring-foreground/10">
        {showImage ? (
          <div className="relative h-44 w-full bg-muted">
            {/* Dynamic remote source — `unoptimized` skips per-host config. */}
            <Image
              src={headerMediaUrl as string}
              alt="Cabeçalho do template"
              fill
              unoptimized
              className="object-cover"
            />
          </div>
        ) : null}

        <div className="space-y-2 px-3 py-2.5">
          {showHeaderText ? (
            <p className="text-sm font-semibold break-words text-foreground">
              {headerText}
            </p>
          ) : null}

          <p className="text-sm whitespace-pre-wrap break-words text-foreground">
            {renderBody(bodyText ?? "", variableExamples)}
          </p>

          {footer?.trim() ? (
            <p className="text-xs break-words text-muted-foreground">
              {footer}
            </p>
          ) : null}
        </div>

        {visibleButtons.length > 0 ? (
          <div className="border-t border-border">
            {visibleButtons.map((button, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-primary",
                  index > 0 && "border-t border-border",
                )}
              >
                {button.type === "URL" ? (
                  <ExternalLink className="size-3.5" />
                ) : (
                  <Reply className="size-3.5" />
                )}
                {button.text}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
