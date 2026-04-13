"use client";

import type { EcoRankRecord } from "@/lib/api/types";
import EcosystemManagementTable from "~/ecosystem/widgets/EcosystemManagementTable";
import { SectionHeader } from "$/primitives";

interface AdminEcosystemsClientProps {
  ecosystems: EcoRankRecord[];
}

export default function AdminEcosystemsClient({
  ecosystems,
}: AdminEcosystemsClientProps) {
  return (
    <div className="min-h-dvh bg-bg pb-24">
      <div className="w-full max-w-content mx-auto px-6 pt-8">
        <SectionHeader
          kicker="admin · ecosystems"
          title="Ecosystems"
          deck="You can manage the ecosystems listed below."
        />

        {/* Ecosystems Management Table */}
        <div className="mt-6">
          <EcosystemManagementTable ecosystems={ecosystems} />
        </div>
      </div>
    </div>
  );
}
