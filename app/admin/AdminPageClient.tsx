'use client';

import EcosystemManagementTable from "~/ecosystem/widgets/EcosystemManagementTable";
import Section from "../../src/entry/components/section";

interface AdminPageProps {
  ecosystems: Array<{ id: string; name: string; [key: string]: unknown }>;
}

export default function AdminPageClient({ ecosystems }: AdminPageProps) {
  return (
    <Section
      title="Ecosystems"
      summary="You can manage the ecosystems listed below"
      contentHeightFixed
    >
      <EcosystemManagementTable
        ecosystems={ecosystems}
      />
    </Section>
  );
}
