import type { Metadata } from "next";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { H1, H2, H3, P, Muted, Label as LabelText } from "@/components/ui/typography";

export const metadata: Metadata = { title: "Design System" };

type Swatch = {
  name: string;
  className: string;
  hex: string;
  /** Add an inset ring so light swatches stay visible on the card. */
  ring?: boolean;
};

const SWATCHES: Swatch[] = [
  { name: "background", className: "bg-background", hex: "#F9FAFB", ring: true },
  { name: "foreground", className: "bg-foreground", hex: "#151E16" },
  { name: "primary", className: "bg-primary", hex: "#25D366" },
  { name: "brand", className: "bg-brand", hex: "#006D2F" },
  { name: "secondary", className: "bg-secondary", hex: "#E7F1E4", ring: true },
  { name: "muted", className: "bg-muted", hex: "#EDF6E9", ring: true },
  { name: "accent", className: "bg-accent", hex: "#E7F1E4", ring: true },
  { name: "destructive", className: "bg-destructive", hex: "#BA1A1A" },
  { name: "border", className: "bg-border", hex: "#D7E0D3", ring: true },
  { name: "sidebar", className: "bg-sidebar", hex: "#1A1A2E" },
];

function ShowcaseSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <H2>{title}</H2>
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        {children}
      </div>
    </section>
  );
}

export default function DesignSystemPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-10 px-6 py-10">
      <header className="space-y-1">
        <H1>Design System</H1>
        <Muted>
          Referência visual interna do ZapBlast — tokens e componentes derivados
          de design/list-campaigns.html.
        </Muted>
      </header>

      {/* Colors */}
      <ShowcaseSection title="Cores">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
          {SWATCHES.map((swatch) => (
            <div key={swatch.name} className="space-y-2">
              <div
                className={`h-16 w-full rounded-lg ${swatch.className} ${
                  swatch.ring ? "ring-1 ring-border ring-inset" : ""
                }`}
              />
              <div>
                <P className="font-medium">{swatch.name}</P>
                <Muted className="font-mono text-[11px]">{swatch.hex}</Muted>
              </div>
            </div>
          ))}
        </div>
      </ShowcaseSection>

      {/* Typography */}
      <ShowcaseSection title="Tipografia">
        <div className="space-y-4">
          <div className="flex items-baseline gap-4">
            <LabelText className="w-28 shrink-0">heading-lg</LabelText>
            <H1>The quick brown fox</H1>
          </div>
          <div className="flex items-baseline gap-4">
            <LabelText className="w-28 shrink-0">heading-md</LabelText>
            <H2>The quick brown fox</H2>
          </div>
          <div className="flex items-baseline gap-4">
            <LabelText className="w-28 shrink-0">heading-sm</LabelText>
            <H3>The quick brown fox</H3>
          </div>
          <div className="flex items-baseline gap-4">
            <LabelText className="w-28 shrink-0">body</LabelText>
            <P>The quick brown fox jumps over the lazy dog.</P>
          </div>
          <div className="flex items-baseline gap-4">
            <LabelText className="w-28 shrink-0">body-sm</LabelText>
            <Muted>The quick brown fox jumps over the lazy dog.</Muted>
          </div>
          <div className="flex items-baseline gap-4">
            <LabelText className="w-28 shrink-0">label</LabelText>
            <LabelText>Total enviado</LabelText>
          </div>
        </div>
      </ShowcaseSection>

      {/* Buttons */}
      <ShowcaseSection title="Botões">
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <Button>Primário</Button>
            <Button variant="outline">Secundário</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destrutivo</Button>
            <Button variant="link">Link</Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
            <Button size="icon" aria-label="Adicionar">
              +
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button disabled>Desabilitado</Button>
            <Button variant="outline" disabled>
              Desabilitado
            </Button>
          </div>
        </div>
      </ShowcaseSection>

      {/* Inputs */}
      <ShowcaseSection title="Inputs">
        <div className="grid max-w-md gap-5">
          <div className="space-y-1.5">
            <Label htmlFor="ds-default">Padrão</Label>
            <Input id="ds-default" placeholder="Buscar campanhas..." />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ds-error">Com erro</Label>
            <Input
              id="ds-error"
              aria-invalid
              defaultValue="email-invalido"
            />
            <p className="text-[13px] text-destructive">
              Informe um e-mail válido.
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ds-disabled">Desabilitado</Label>
            <Input id="ds-disabled" disabled placeholder="Indisponível" />
          </div>
        </div>
      </ShowcaseSection>

      {/* Selects */}
      <ShowcaseSection title="Selects">
        <div className="flex flex-wrap gap-6">
          <div className="space-y-1.5">
            <Label htmlFor="ds-status">Status</Label>
            <Select defaultValue="all">
              <SelectTrigger id="ds-status" className="w-48">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="paused">Pausado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ds-type">Tipo</Label>
            <Select>
              <SelectTrigger id="ds-type" className="w-48">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="official">API Oficial</SelectItem>
                <SelectItem value="unofficial">API Não Oficial</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </ShowcaseSection>
    </div>
  );
}
