"use client";

import type { EcoRankRecord } from "@/lib/api/types";
import EcosystemManagementTable from "~/ecosystem/widgets/EcosystemManagementTable";
import Section from "$/section";

interface AdminPageProps {
  ecosystems: EcoRankRecord[];
}

export default function AdminPageClient({ ecosystems }: AdminPageProps) {
  return (
    <Section
      title="Ecosystems"
      summary="You can manage the ecosystems listed below"
      contentHeightFixed
    >
      <EcosystemManagementTable ecosystems={ecosystems} />
    </Section>
  );
}
