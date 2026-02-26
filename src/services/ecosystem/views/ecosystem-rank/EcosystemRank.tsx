"use client";

import Link from "next/link";
import { Card } from "@/components/ui";
import { Warehouse, ArrowRight } from "lucide-react";
import { useState, useMemo } from "react";
import { EcosystemType } from "~/ecosystem/typing";
import { EcosystemTypeFilter } from "$/ecosystem-type-filter";
import TableHeader from "$/controls/table-header";

import type { EcosystemRankViewWidgetProps } from "./typing";

function EcosystemRankView({ dataSource }: EcosystemRankViewWidgetProps) {
  const [selectedType, setSelectedType] = useState<EcosystemType>(
    EcosystemType.PUBLIC_CHAIN,
  );

  // First, create a map of ecosystem names to their global ranks (based on actors_core_total)
  const ecosystemRanks = useMemo(() => {
    const sorted = [...dataSource].sort((a, b) => {
      return Number(b.actors_core_total) - Number(a.actors_core_total);
    });
    const rankMap = new Map<string, number>();
    sorted.forEach((eco, index) => {
      rankMap.set(eco.eco_name || "", index + 1);
    });
    return rankMap;
  }, [dataSource]);

  // Filter ecosystems based on selected type
  const filteredData = useMemo(() => {
    return dataSource.filter((ecosystem) => {
      if (selectedType === EcosystemType.ALL) {
        return true;
      }

      // Map API kind values to EcosystemType enum
      const kindMapping: Record<string, EcosystemType> = {
        "Public Chain": EcosystemType.PUBLIC_CHAIN,
        Infrastructure: EcosystemType.INFRASTRUCTURE,
        Community: EcosystemType.COMMUNITY,
      };

      const ecosystemType = ecosystem.kind
        ? kindMapping[ecosystem.kind]
        : undefined;
      return ecosystemType === selectedType;
    });
  }, [dataSource, selectedType]);

  // Sort filtered data by actors_core_total and take top 10
  const topEcosystems = useMemo(() => {
    return [...filteredData]
      .sort((a, b) => Number(b.actors_core_total) - Number(a.actors_core_total))
      .slice(0, 10);
  }, [filteredData]);

  return (
    <Card className="bg-white dark:bg-surface-dark shadow-subtle border border-border dark:border-border-dark overflow-hidden">
      <div className="px-6 pt-5 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Warehouse size={18} className="text-primary" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Top Ecosystems
          </h3>
        </div>
        <EcosystemTypeFilter
          selectedType={selectedType}
          onTypeChange={setSelectedType}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-t border-border dark:border-border-dark bg-surface dark:bg-surface-dark">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider w-12">
                #
              </th>
              <TableHeader>Ecosystem</TableHeader>
              <TableHeader
                align="right"
                tooltip="Developers with pull requests and push events in the past year"
              >
                Devs
              </TableHeader>
              <TableHeader
                align="right"
                tooltip="Developers with activity (star not included) in this ecosystem (all time)"
              >
                Contributors
              </TableHeader>
              <TableHeader
                align="right"
                tooltip="Developers with first activity in past 90 days"
              >
                New
              </TableHeader>
              <TableHeader
                align="right"
                tooltip="Total repositories in this ecosystem"
              >
                Repos
              </TableHeader>
            </tr>
          </thead>
          <tbody className="divide-y divide-border dark:divide-border-dark">
            {topEcosystems.map((ecosystem, index) => {
              const globalRank =
                ecosystemRanks.get(ecosystem.eco_name || "") || 0;
              return (
                <tr
                  key={index}
                  className="hover:bg-surface dark:hover:bg-surface-dark transition-colors duration-200 group animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span
                        className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium transition-all duration-200 group-hover:scale-110 bg-gray-50 dark:bg-surface-dark text-gray-500 dark:text-gray-500`}
                      >
                        {globalRank}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      href={`/ecosystems/${encodeURIComponent(ecosystem.eco_name || "unknown-ecosystem")}`}
                      className="font-medium text-gray-900 dark:text-white hover:text-primary transition-colors duration-200"
                    >
                      {ecosystem.eco_name || "Unknown Ecosystem"}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="text-gray-700 dark:text-gray-300 font-mono text-sm">
                      {Number(ecosystem.actors_core_total).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="text-gray-700 dark:text-gray-300 font-mono text-sm">
                      {Number(ecosystem.actors_total).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="text-gray-700 dark:text-gray-300 font-mono text-sm">
                      {Number(ecosystem.actors_new_total).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="text-gray-700 dark:text-gray-300 font-mono text-sm">
                      {Number(ecosystem.repos_total).toLocaleString()}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-4 border-t border-border dark:border-border-dark">
        <Link
          href="/ecosystems"
          className="flex items-center justify-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors duration-200"
        >
          View All Ecosystems
          <ArrowRight size={16} />
        </Link>
      </div>
    </Card>
  );
}

export default EcosystemRankView;
