"use client";

import Link from "next/link";
import { AlertCircle, ArrowLeft } from "lucide-react";

import { ApiTypeBadge } from "@/components/shared/campaign/api-type-badge";
import { PageHeader, Section } from "@/components/shared/layout/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCampaignDetail } from "@/hooks/queries/use-campaigns";
import { formatDate } from "@/lib/format";
import type { CampaignApiType } from "@/types/api";
import { CampaignMessageCard } from "./_components/campaign-message-card";
import { CampaignTemplateCard } from "./_components/campaign-template-card";

function BackLink() {
  return (
    <Button variant="ghost" size="sm" asChild className="-ml-2 w-fit">
      <Link href="/campaigns">
        <ArrowLeft />
        Campanhas
      </Link>
    </Button>
  );
}

/** Humanizes a raw backend status (e.g. `IN_PROGRESS` → `In progress`). */
function formatStatus(status: string): string {
  const normalized = status.replace(/_/g, " ").toLowerCase();
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

export function CampaignDetailView({
  campaignId,
  apiType,
}: {
  campaignId: string;
  apiType: CampaignApiType;
}) {
  const {
    data: campaign,
    isLoading,
    isError,
    error,
  } = useCampaignDetail(campaignId, apiType);

  if (isLoading) {
    return (
      <Section>
        <BackLink />
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-48" />
        <Skeleton className="h-64" />
      </Section>
    );
  }

  if (isError || !campaign) {
    return (
      <Section>
        <BackLink />
        <Alert variant="destructive">
          <AlertCircle />
          <AlertTitle>Não foi possível carregar a campanha.</AlertTitle>
          <AlertDescription>
            {error instanceof Error
              ? error.message
              : "A campanha não foi encontrada ou ocorreu um erro."}
          </AlertDescription>
        </Alert>
      </Section>
    );
  }

  return (
    <Section>
      <BackLink />

      <PageHeader
        title={campaign.name}
        description={`Criada em ${formatDate(campaign.createdAt)}`}
      >
        <div className="flex items-center gap-2">
          <ApiTypeBadge apiType={campaign.apiType} />
          <Badge variant="secondary">{formatStatus(campaign.status)}</Badge>
        </div>
      </PageHeader>

      {campaign.apiType === "UNOFFICIAL" ? (
        <CampaignMessageCard message={campaign.message} />
      ) : (
        <CampaignTemplateCard template={campaign.template} />
      )}
    </Section>
  );
}
