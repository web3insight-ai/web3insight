"use client";

import { Card, CardHeader, Input, Pagination } from "@nextui-org/react";
import { Search, Warehouse, Database, Users, Code2, Zap } from "lucide-react";
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
import MetricCard, { type MetricCardProps } from "$/controls/metric-card";
import TableHeader from "$/controls/table-header";
import {
  staggerContainer,
  staggerItemScale,
  fadeInUp,
} from "@/utils/animations";

// Local schema that includes the ecosystem type enum
const ecosystemFilterSchema = z.object({
  search: z.string(),
  type: z.nativeEnum(EcosystemType),
});

type EcosystemFilterInput = z.infer<typeof ecosystemFilterSchema>;

function resolveMetrics(dataSource: {
  totalCoreDevelopers: number;
  totalDevelopers: number;
  totalEcosystems: number;
  totalRepositories: number;
}): MetricCardProps[] {
  return [
    {
      label: "Developers",
      value: Number(dataSource.totalCoreDevelopers).toLocaleString(),
      icon: <Code2 size={20} className="text-secondary" />,
      iconBgClassName: "bg-secondary/10",
      tooltip: "Developers with pull requests and push events in the past year",
    },
    {
      label: "ECO Contributors",
      value: Number(dataSource.totalDevelopers).toLocaleString(),
      icon: <Users size={20} className="text-primary" />,
      iconBgClassName: "bg-primary/10",
      tooltip:
        "Developers with activity (star not included) in this ecosystem (all time)",
    },
    {
      label: "Ecosystems",
      value: Number(dataSource.totalEcosystems).toLocaleString(),
      icon: <Database size={20} className="text-warning" />,
      iconBgClassName: "bg-warning/10",
      tooltip: "Total number of ecosystems tracked",
    },
    {
      label: "Repositories",
      value: Number(dataSource.totalRepositories).toLocaleString(),
      icon: <Zap size={20} className="text-success" />,
      iconBgClassName: "bg-success/10",
      tooltip: "Total repositories grouped by ecosystem",
    },
  ];
}

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

  return (
    <div className="w-full max-w-content mx-auto px-6 py-8">
      {/* Header and Overview */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Warehouse size={20} className="text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            All Ecosystems
          </h1>
        </div>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl">
          Compare metrics across all blockchain and Web3 ecosystems
        </p>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10"
      >
        {resolveMetrics({
          totalCoreDevelopers,
          totalDevelopers,
          totalEcosystems,
          totalRepositories,
        }).map((metric) => (
          <motion.div
            key={metric.label.replaceAll(" ", "")}
            variants={staggerItemScale}
            whileHover={{ y: -4, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <MetricCard {...metric} />
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
            startContent={<Search size={18} className="text-gray-400" />}
            className="w-full"
          />
        </div>
      </div>

      {/* Ecosystems Table */}
      <Card className="bg-white dark:bg-surface-dark shadow-subtle border border-border dark:border-border-dark overflow-hidden">
        <CardHeader className="px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Warehouse size={18} className="text-primary" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Ecosystem Analytics
            </h3>
          </div>
        </CardHeader>

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
              <AnimatePresence mode="wait">
                {paginatedItems.map((ecosystem, index) => {
                  const globalRank =
                    ecosystemRanks.get(ecosystem.eco_name) || 0;
                  return (
                    <motion.tr
                      key={ecosystem.eco_name}
                      className="hover:bg-surface dark:hover:bg-surface-dark transition-colors duration-200 group"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03, duration: 0.3 }}
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
                          href={`/ecosystems/${encodeURIComponent(ecosystem.eco_name)}`}
                          className="font-medium text-gray-900 dark:text-white hover:text-primary transition-colors duration-200"
                        >
                          {ecosystem.eco_name}
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
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {pages > 1 && (
          <div className="px-6 py-4 border-t border-border dark:border-border-dark flex justify-center">
            <Pagination page={page} total={pages} onChange={setPage} />
          </div>
        )}
      </Card>
    </div>
  );
}
