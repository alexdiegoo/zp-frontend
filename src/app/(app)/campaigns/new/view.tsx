"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { PageHeader, Section } from "@/components/shared/layout/page-header";
import { Button } from "@/components/ui/button";
import type { CampaignApiType, CreatedCampaign } from "@/types/api";
import { CampaignSuccess } from "./_components/campaign-success";
import { CampaignTypeSelector } from "./_components/campaign-type-selector";
import { OfficialCampaignForm } from "./_components/official-campaign-form";
import { UnofficialCampaignForm } from "./_components/unofficial-campaign-form";

export function CampaignNewView() {
  const router = useRouter();
  const [apiType, setApiType] = useState<CampaignApiType | null>(null);
  const [createdUnofficial, setCreatedUnofficial] = useState<CreatedCampaign | null>(null);

  // Unofficial campaigns land on a copy-the-message confirmation instead of redirecting.
  if (createdUnofficial) {
    return (
      <Section>
        <PageHeader title="Nova campanha" />
        <div className="max-w-2xl">
          <CampaignSuccess campaign={createdUnofficial} />
        </div>
      </Section>
    );
  }

  return (
    <Section>
      <PageHeader
        title="Nova campanha"
        description="Escolha o tipo de campanha e configure os detalhes do disparo."
      >
        <Button variant="outline" onClick={() => router.push("/campaigns")}>
          <ArrowLeft />
          Voltar
        </Button>
      </PageHeader>

      <CampaignTypeSelector value={apiType} onChange={setApiType} />

      {apiType ? (
        <div className="max-w-2xl">
          {apiType === "OFFICIAL" ? (
            <OfficialCampaignForm />
          ) : (
            <UnofficialCampaignForm onCreated={setCreatedUnofficial} />
          )}
        </div>
      ) : null}
    </Section>
  );
}
