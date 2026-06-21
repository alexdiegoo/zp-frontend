/**
 * Presentation helpers for WhatsApp message templates: pt-BR labels and badge
 * variants for the backend's status/category enums, plus language formatting.
 * Shared between the templates listing columns and the detail view so the two
 * stay in sync. Unknown values fall back to a sensible default rather than
 * throwing — the backend may report a value the frontend doesn't yet model.
 */
import type { badgeVariants } from "@/components/ui/badge";
import type { VariantProps } from "class-variance-authority";

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>;

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Rascunho",
  PENDING_REVIEW: "Aguardando revisão",
  APPROVED: "Aprovado",
  REJECTED: "Rejeitado",
  PAUSED: "Pausado",
  DISABLED: "Desativado",
};

const STATUS_VARIANTS: Record<string, BadgeVariant> = {
  DRAFT: "outline",
  PENDING_REVIEW: "secondary",
  APPROVED: "default",
  REJECTED: "destructive",
  PAUSED: "outline",
  DISABLED: "outline",
};

const AI_FEEDBACK_STATUS_LABELS: Record<string, string> = {
  APPROVED: "Aprovado",
  PENDING: "Pendente",
  PROCESSING: "Em análise",
  REJECTED: "Reprovado",
  WARNING: "Com alertas",
};

const AI_FEEDBACK_STATUS_VARIANTS: Record<string, BadgeVariant> = {
  APPROVED: "default",
  PENDING: "secondary",
  PROCESSING: "secondary",
  REJECTED: "destructive",
  WARNING: "outline",
};

const CATEGORY_LABELS: Record<string, string> = {
  MARKETING: "Marketing",
  UTILITY: "Utilidade",
  AUTHENTICATION: "Autenticação",
  UNKNOWN: "Desconhecida",
};

const LANGUAGE_LABELS: Record<string, string> = {
  pt_BR: "Português (BR)",
  en_US: "Inglês (EUA)",
  es_ES: "Espanhol",
};

/** Human label for a template status (falls back to the raw value). */
export function templateStatusLabel(status: string): string {
  return STATUS_LABELS[status] ?? status;
}

/** Badge variant for a template status (falls back to `outline`). */
export function templateStatusVariant(status: string): BadgeVariant {
  return STATUS_VARIANTS[status] ?? "outline";
}

/** Human label for an AI feedback status (falls back to the raw value). */
export function aiFeedbackStatusLabel(status: string): string {
  return AI_FEEDBACK_STATUS_LABELS[status] ?? status;
}

/** Badge variant for an AI feedback status (falls back to `secondary`). */
export function aiFeedbackStatusVariant(status: string): BadgeVariant {
  return AI_FEEDBACK_STATUS_VARIANTS[status] ?? "secondary";
}

/** Human label for a template category (falls back to the raw value). */
export function templateCategoryLabel(category: string): string {
  return CATEGORY_LABELS[category] ?? category;
}

/** Friendly language name for a tag like `pt_BR` (falls back to the raw tag). */
export function formatTemplateLanguage(language: string): string {
  return LANGUAGE_LABELS[language] ?? language;
}

/**
 * Extracts the unique named variables (`{{nome}}`) declared in a template body,
 * preserving first-seen order. Shared between the editor form, its preview and
 * the variable-examples section so they stay in sync.
 */
export function extractTemplateVariables(text: string): string[] {
  const matches = [...text.matchAll(/\{\{([a-zA-Z0-9_]+)\}\}/g)];
  return [...new Set(matches.map((match) => match[1]))];
}
