"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useState, useMemo } from "react";

import { EcosystemType } from "~/ecosystem/typing";
import { EcosystemTypeFilter } from "$/ecosystem-type-filter";
import TableHeader from "$/controls/table-header";
import { Panel } from "$/blueprint";
import { SmallCapsLabel } from "$/primitives";

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
    <Panel
      label={{ text: "ranking · ecosystems", position: "tl" }}
      code="06"
      className="overflow-hidden"
    >
      <div className="px-5 pt-5 pb-3 border-b border-rule flex items-center justify-between gap-4">
        <SmallCapsLabel>top ecosystems</SmallCapsLabel>
        <EcosystemTypeFilter
          selectedType={selectedType}
          onTypeChange={setSelectedType}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-t border-rule bg-bg-sunken">
              <th className="px-6 py-3 text-left font-mono text-[10px] font-medium text-fg-muted uppercase tracking-[0.18em] w-12">
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
          <tbody className="divide-y divide-rule">
            {topEcosystems.map((ecosystem, index) => {
              const globalRank =
                ecosystemRanks.get(ecosystem.eco_name || "") || 0;
              return (
                <tr
                  key={index}
                  className="hover:bg-bg-sunken transition-colors duration-200 group animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-mono text-[11px] text-fg-muted tabular-nums">
                      {String(globalRank).padStart(3, "0")}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      href={`/ecosystems/${encodeURIComponent(ecosystem.eco_name || "unknown-ecosystem")}`}
                      className="font-medium text-fg hover:text-accent transition-colors duration-200"
                    >
                      {ecosystem.eco_name || "Unknown Ecosystem"}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="text-fg font-mono text-sm tabular-nums">
                      {Number(ecosystem.actors_core_total).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="text-fg font-mono text-sm tabular-nums">
                      {Number(ecosystem.actors_total).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="text-fg font-mono text-sm tabular-nums">
                      {Number(ecosystem.actors_new_total).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="text-fg font-mono text-sm tabular-nums">
                      {Number(ecosystem.repos_total).toLocaleString()}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-4 border-t border-rule">
        <Link
          href="/ecosystems"
          className="flex items-center justify-center gap-2 text-sm font-medium text-fg-muted hover:text-accent transition-colors duration-200"
        >
          View All Ecosystems
          <ArrowRight size={16} />
        </Link>
      </div>
    </Panel>
  );
}

export default EcosystemRankView;
