"use client";

import { Input, Pagination } from "@/components/ui";
import { Search } from "lucide-react";
import { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEcosystemList, useOverviewStatistics } from "@/hooks/api";
import { EcosystemType } from "~/ecosystem/typing";
import { getFilterForType } from "~/ecosystem/helper";
import { EcosystemTypeFilter } from "$/ecosystem-type-filter";
import TableHeader from "$/controls/table-header";
import { Panel } from "$/blueprint";
import { SectionHeader, SmallCapsLabel, BigNumber } from "$/primitives";
import {
  staggerContainer,
  staggerItemScale,
  fadeInUp,
} from "@/utils/animations";

const ecosystemFilterSchema = z.object({
  search: z.string(),
  type: z.nativeEnum(EcosystemType),
});

type EcosystemFilterInput = z.infer<typeof ecosystemFilterSchema>;

export default function EcosystemsPageClient() {
  // TanStack Query hooks - data is hydrated from server prefetch
  const { data: ecosystems = [] } = useEcosystemList();
  const { data: statistics } = useOverviewStatistics();

  const totalCoreDevelopers = statistics?.totalCoreDevelopers ?? 0;
  const totalDevelopers = statistics?.totalDevelopers ?? 0;
  const totalRepositories = statistics?.totalRepositories ?? 0;
  const totalEcosystems = statistics?.totalEcosystems ?? 0;

  // Form state using React Hook Form
  const form = useForm<EcosystemFilterInput>({
    resolver: zodResolver(ecosystemFilterSchema),
    defaultValues: {
      search: "",
      type: EcosystemType.PUBLIC_CHAIN,
    },
  });

  const searchValue = form.watch("search");
  const selectedType = form.watch("type");

  // Pagination state
  const [page, setPage] = useState(1);
  const rowsPerPage = 25;

  // Handle type change from EcosystemTypeFilter component
  const handleTypeChange = useCallback(
    (type: EcosystemType) => {
      form.setValue("type", type);
    },
    [form],
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

    if (searchValue) {
      filtered = filtered.filter((ecosystem) =>
        ecosystem.eco_name.toLowerCase().includes(searchValue.toLowerCase()),
      );
    }

    // Filter by ecosystem type using the kind field
    filtered = filtered.filter((ecosystem) =>
      getFilterForType(selectedType, ecosystem.kind),
    );

    return filtered;
  }, [ecosystems, searchValue, selectedType]);

  // Sort filtered ecosystems by actors_total (descending)
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

  const metricCards = [
    {
      code: "01",
      label: "core devs",
      value: totalCoreDevelopers,
      footnote: "src: opendigger · 12m PR / push",
      ground: "dotted" as const,
    },
    {
      code: "02",
      label: "eco contributors",
      value: totalDevelopers,
      footnote: "all-time, tracked ecosystems",
      ground: "plain" as const,
    },
    {
      code: "03",
      label: "ecosystems",
      value: totalEcosystems,
      footnote: "live · indexed",
      ground: "hatched" as const,
    },
    {
      code: "04",
      label: "repositories",
      value: totalRepositories,
      footnote: "grouped by ecosystem",
      ground: "plain" as const,
    },
  ];

  return (
    <div className="w-full max-w-content mx-auto px-6 py-10">
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="mb-10"
      >
        <SectionHeader
          kicker="index · ecosystems"
          title="All ecosystems"
          deck="Compare developer and repository metrics across every tracked blockchain and Web3 ecosystem."
        />
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12"
      >
        {metricCards.map((m) => (
          <motion.div key={m.code} variants={staggerItemScale}>
            <Panel
              ground={m.ground}
              label={{ text: m.label, position: "tl" }}
              code={m.code}
              className="p-5 h-full"
            >
              <BigNumber
                label=""
                value={m.value}
                format="compact"
                footnote={m.footnote}
              />
            </Panel>
          </motion.div>
        ))}
      </motion.div>

      {/* Filters and Search */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <EcosystemTypeFilter
          selectedType={selectedType}
          onTypeChange={handleTypeChange}
        />
        <div className="w-full sm:w-72">
          <Input
            placeholder="Search ecosystems..."
            value={searchValue}
            onChange={(e) => form.setValue("search", e.target.value)}
            startContent={<Search size={18} className="text-fg-subtle" />}
            className="w-full"
          />
        </div>
      </div>

      {/* Ecosystems Table */}
      <Panel
        label={{ text: "ranking · ecosystems", position: "tl" }}
        code="05"
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
              <AnimatePresence mode="wait">
                {paginatedItems.map((ecosystem, index) => {
                  const globalRank =
                    ecosystemRanks.get(ecosystem.eco_name) || 0;
                  return (
                    <motion.tr
                      key={ecosystem.eco_name}
                      className="hover:bg-bg-sunken transition-colors duration-200 group"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03, duration: 0.3 }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono text-[11px] text-fg-muted tabular-nums">
                          {String(globalRank).padStart(3, "0")}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/ecosystems/${encodeURIComponent(ecosystem.eco_name)}`}
                          className="font-medium text-fg hover:text-accent transition-colors duration-200"
                        >
                          {ecosystem.eco_name}
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
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
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
