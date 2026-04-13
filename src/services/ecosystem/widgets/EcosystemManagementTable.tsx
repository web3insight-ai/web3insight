"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Input, Pagination, Button } from "@/components/ui";
import { Search, Settings } from "lucide-react";

import { Panel } from "$/blueprint";
import { SmallCapsLabel } from "$/primitives";

import { EcosystemType } from "../typing";
import type { EcosystemWithStats } from "../typing";
import { getFilterForType } from "../helper";
import { EcosystemTypeFilter } from "$/ecosystem-type-filter";

interface EcosystemManagementTableProps {
  ecosystems: EcosystemWithStats[];
}

function EcosystemManagementTable({
  ecosystems,
}: EcosystemManagementTableProps) {
  const [page, setPage] = useState(1);
  const rowsPerPage = 25;
  const [filterValue, setFilterValue] = useState("");
  const [selectedType, setSelectedType] = useState<EcosystemType>(
    EcosystemType.PUBLIC_CHAIN,
  );

  // Reset page when ecosystem type changes
  useEffect(() => {
    setPage(1);
  }, [selectedType]);

  // First, create a map of ecosystem names to their global ranks (based on actors_core_total)
  const ecosystemRanks = useMemo(() => {
    const sorted = [...ecosystems].sort((a, b) => {
      return Number(b.actors_core_total) - Number(a.actors_core_total);
    });
    const rankMap = new Map<string, number>();
    sorted.forEach((eco, index) => {
      rankMap.set(eco.eco_name, index + 1);
    });
    return rankMap;
  }, [ecosystems]);

  // Filter ecosystems based on search query and type
  const filteredItems = useMemo(() => {
    let filtered = [...ecosystems];

    if (filterValue) {
      filtered = filtered.filter((ecosystem) =>
        ecosystem.eco_name.toLowerCase().includes(filterValue.toLowerCase()),
      );
    }

    // Filter by ecosystem type using the kind field
    filtered = filtered.filter((ecosystem) =>
      getFilterForType(selectedType, ecosystem.kind),
    );

    return filtered;
  }, [ecosystems, filterValue, selectedType]);

  // Sort filtered ecosystems by actors_core_total (descending)
  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      return Number(b.actors_core_total) - Number(a.actors_core_total);
    });
  }, [filteredItems]);

  // Calculate pagination
  const paginatedItems = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return sortedItems.slice(start, end);
  }, [sortedItems, page, rowsPerPage]);

  const pages = Math.ceil(sortedItems.length / rowsPerPage);

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <EcosystemTypeFilter
          selectedType={selectedType}
          onTypeChange={setSelectedType}
        />
        <div className="w-full sm:w-72">
          <Input
            placeholder="Search ecosystems..."
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            startContent={<Search size={18} className="text-fg-subtle" />}
            className="w-full"
          />
        </div>
      </div>

      {/* Ecosystems Table */}
      <Panel
        label={{ text: "admin · ecosystems", position: "tl" }}
        code="01"
        className="overflow-hidden"
      >
        <div className="px-5 pt-5 pb-3 border-b border-rule">
          <SmallCapsLabel>ecosystem analytics</SmallCapsLabel>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-t border-rule bg-bg-sunken">
                <th className="px-6 py-3 text-left font-mono text-[10px] font-medium text-fg-muted uppercase tracking-[0.18em] w-12">
                  #
                </th>
                <th className="px-6 py-3 text-left font-mono text-[10px] font-medium text-fg-muted uppercase tracking-[0.18em]">
                  Ecosystem
                </th>
                <th className="px-6 py-3 text-right font-mono text-[10px] font-medium text-fg-muted uppercase tracking-[0.18em]">
                  Repos
                </th>
                <th className="px-6 py-3 text-right font-mono text-[10px] font-medium text-fg-muted uppercase tracking-[0.18em]">
                  Devs
                </th>
                <th className="px-6 py-3 text-right font-mono text-[10px] font-medium text-fg-muted uppercase tracking-[0.18em]">
                  Core
                </th>
                <th className="px-6 py-3 text-right font-mono text-[10px] font-medium text-fg-muted uppercase tracking-[0.18em]">
                  New
                </th>
                <th className="px-6 py-3 text-center font-mono text-[10px] font-medium text-fg-muted uppercase tracking-[0.18em]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule">
              {paginatedItems.length > 0 ? (
                paginatedItems.map((ecosystem) => {
                  const globalRank =
                    ecosystemRanks.get(ecosystem.eco_name) || 0;
                  return (
                    <tr
                      key={ecosystem.eco_name}
                      className="hover:bg-bg-sunken transition-colors duration-200 group"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono text-[11px] text-fg-muted tabular-nums">
                          {String(globalRank).padStart(3, "0")}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/admin/ecosystems/${encodeURIComponent(ecosystem.eco_name || "unknown-ecosystem")}`}
                          className="font-medium text-fg hover:text-accent transition-colors duration-200"
                        >
                          {ecosystem.eco_name || "Unknown Ecosystem"}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="text-fg font-mono text-sm tabular-nums">
                          {Number(ecosystem.repos_total).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="text-fg font-mono text-sm tabular-nums">
                          {Number(ecosystem.actors_total).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="text-fg font-mono text-sm tabular-nums">
                          {Number(ecosystem.actors_core_total).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="text-fg font-mono text-sm tabular-nums">
                          {Number(ecosystem.actors_new_total).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <Button
                          as={Link}
                          href={`/admin/ecosystems/${encodeURIComponent(ecosystem.eco_name || "unknown-ecosystem")}`}
                          isIconOnly
                          size="sm"
                          variant="light"
                          className="text-fg-muted hover:text-accent"
                        >
                          <Settings size={16} />
                        </Button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <p className="text-fg-muted">No ecosystems available.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {pages > 1 && (
          <div className="px-6 py-4 border-t border-rule flex justify-center">
            <Pagination page={page} total={pages} onChange={setPage} />
          </div>
        )}
      </Panel>
    </div>
  );
}

export default EcosystemManagementTable;
