"use client";

import { Warehouse } from "lucide-react";
import type { EcoRankRecord } from "@/lib/api/types";
import EcosystemManagementTable from "~/ecosystem/widgets/EcosystemManagementTable";

interface AdminEcosystemsClientProps {
  ecosystems: EcoRankRecord[];
}

export default function AdminEcosystemsClient({
  ecosystems,
}: AdminEcosystemsClientProps) {
  return (
    <div className="min-h-dvh bg-background dark:bg-background-dark pb-24">
      <div className="w-full max-w-content mx-auto px-6 pt-8">
        {/* Header and Overview */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Warehouse size={20} className="text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Ecosystems
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl">
            You can manage the ecosystems listed below
          </p>
        </div>

        {/* Ecosystems Management Table */}
        <div className="mt-6">
          <EcosystemManagementTable ecosystems={ecosystems} />
        </div>
      </div>
    </div>
  );
}
