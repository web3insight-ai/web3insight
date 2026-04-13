"use client";

import {
  Input,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
  Pagination,
} from "@/components/ui";
import { Filter, SortAsc, SortDesc, Search, Star, GitFork } from "lucide-react";
import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRepositoryList, useOverviewStatistics } from "@/hooks/api";
import type { RepoRankRecord } from "@/lib/api/types";
import TableHeader from "$/controls/table-header";
import { Panel } from "$/blueprint";
import { SectionHeader, SmallCapsLabel, BigNumber } from "$/primitives";
import {
  staggerContainer,
  staggerItemScale,
  fadeInUp,
} from "@/utils/animations";
import {
  repositorySearchSchema,
  type RepositorySearchInput,
} from "@/lib/form/schemas";

export default function RepositoriesPageClient() {
  // TanStack Query hooks - data is hydrated from server prefetch
  const { data: repositories = [] } = useRepositoryList();
  const { data: statistics } = useOverviewStatistics();

  const totalCoreDevelopers = statistics?.totalCoreDevelopers ?? 0;
  const totalDevelopers = statistics?.totalDevelopers ?? 0;
  const totalRepositories = statistics?.totalRepositories ?? 0;
  const totalEcosystems = statistics?.totalEcosystems ?? 0;

  // Form state using React Hook Form
  const form = useForm<RepositorySearchInput>({
    resolver: zodResolver(repositorySearchSchema),
    defaultValues: {
      search: "",
      sortBy: "star_count",
      sortDirection: "desc",
    },
  });

  // Single watch call to reduce re-renders (instead of 3 separate calls)
  const { search: searchValue, sortBy, sortDirection } = form.watch();

  // Pagination state
  const [page, setPage] = useState(1);
  const rowsPerPage = 25;

  // Filter repositories based on search query
  const filteredItems = useMemo(() => {
    let filtered = [...repositories];

    if (searchValue) {
      filtered = filtered.filter((repo) =>
        repo.repo_name.toLowerCase().includes(searchValue.toLowerCase()),
      );
    }

    return filtered;
  }, [repositories, searchValue]);

  // Sort filtered repositories
  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      // Map "name" to "repo_name" for the actual data field
      const sortKey = sortBy === "name" ? "repo_name" : sortBy;
      const first = a[sortKey as keyof RepoRankRecord];
      const second = b[sortKey as keyof RepoRankRecord];

      if (first === undefined || second === undefined) return 0;

      // Handle string comparison for name sorting
      if (sortKey === "repo_name") {
        const cmp = String(first).localeCompare(String(second));
        return sortDirection === "desc" ? -cmp : cmp;
      }

      const cmp =
        Number(first) < Number(second)
          ? -1
          : Number(first) > Number(second)
            ? 1
            : 0;

      return sortDirection === "desc" ? -cmp : cmp;
    });
  }, [filteredItems, sortBy, sortDirection]);

  // Calculate pagination
  const paginatedItems = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return sortedItems.slice(start, end);
  }, [sortedItems, page, rowsPerPage]);

  const pages = Math.ceil(sortedItems.length / rowsPerPage);

  // Handle search input change
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      form.setValue("search", e.target.value);
      setPage(1);
    },
    [form],
  );

  // Handle pagination change
  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  // Handle sorting change
  const handleSortChange = useCallback(
    (column: string) => {
      const currentSortBy = form.getValues("sortBy");
      const currentDirection = form.getValues("sortDirection");

      if (currentSortBy === column) {
        form.setValue(
          "sortDirection",
          currentDirection === "asc" ? "desc" : "asc",
        );
      } else {
        form.setValue("sortBy", column as RepositorySearchInput["sortBy"]);
        form.setValue("sortDirection", "desc");
      }
    },
    [form],
  );

  return (
    <div className="w-full max-w-content mx-auto px-6 py-10">
      {/* Header */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="mb-10"
      >
        <SectionHeader
          kicker="index · repositories"
          title="All repositories"
          deck="Top repositories by developer engagement and contributions across Web3 ecosystems."
        />
      </motion.div>

      {/* Summary Panels */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12"
      >
        {[
          {
            code: "01",
            label: "repositories",
            value: totalRepositories,
            footnote: "grouped by ecosystem",
            ground: "dotted" as const,
          },
          {
            code: "02",
            label: "core devs",
            value: totalCoreDevelopers,
            footnote: "src: opendigger · 12m PR / push",
            ground: "plain" as const,
          },
          {
            code: "03",
            label: "eco contributors",
            value: totalDevelopers,
            footnote: "all-time, tracked ecosystems",
            ground: "hatched" as const,
          },
          {
            code: "04",
            label: "ecosystems",
            value: totalEcosystems,
            footnote: "live · indexed",
            ground: "plain" as const,
          },
        ].map((m) => (
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
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div className="w-full sm:w-72">
          <Input
            placeholder="Search repositories..."
            value={searchValue}
            onChange={handleSearchChange}
            startContent={<Search size={18} className="text-fg-subtle" />}
            className="w-full"
          />
        </div>
        <div className="flex gap-2">
          <Dropdown>
            <DropdownTrigger>
              <Button variant="flat" startContent={<Filter size={18} />}>
                Sort By
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Sort options">
              <DropdownItem key="name" onClick={() => handleSortChange("name")}>
                <div className="flex items-center justify-between w-full">
                  <span>Name</span>
                  {sortBy === "name" &&
                    (sortDirection === "asc" ? (
                      <SortAsc size={16} />
                    ) : (
                      <SortDesc size={16} />
                    ))}
                </div>
              </DropdownItem>
              <DropdownItem
                key="star_count"
                onClick={() => handleSortChange("star_count")}
              >
                <div className="flex items-center justify-between w-full">
                  <span>Stars</span>
                  {sortBy === "star_count" &&
                    (sortDirection === "asc" ? (
                      <SortAsc size={16} />
                    ) : (
                      <SortDesc size={16} />
                    ))}
                </div>
              </DropdownItem>
              <DropdownItem
                key="contributor_count"
                onClick={() => handleSortChange("contributor_count")}
              >
                <div className="flex items-center justify-between w-full">
                  <span>Contributors</span>
                  {sortBy === "contributor_count" &&
                    (sortDirection === "asc" ? (
                      <SortAsc size={16} />
                    ) : (
                      <SortDesc size={16} />
                    ))}
                </div>
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>

      {/* Repositories Table */}
      <Panel
        label={{ text: "ranking · repos", position: "tl" }}
        code="05"
        className="overflow-hidden"
      >
        <div className="px-5 pt-5 pb-3 border-b border-rule">
          <SmallCapsLabel>repository analytics</SmallCapsLabel>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-t border-rule bg-bg-sunken">
                <th className="px-6 py-3 text-left font-mono text-[10px] font-medium text-fg-muted uppercase tracking-[0.18em] w-12">
                  #
                </th>
                <TableHeader>Repository</TableHeader>
                <TableHeader
                  align="right"
                  tooltip="Total number of stars received by this repository"
                >
                  Stars
                </TableHeader>
                <TableHeader
                  align="right"
                  tooltip="Total number of forks created from this repository"
                >
                  Forks
                </TableHeader>
                <TableHeader
                  align="right"
                  tooltip="Total number of developers who have contributed to this repository"
                >
                  Contributors
                </TableHeader>
                <TableHeader
                  align="right"
                  tooltip="Current number of open issues in this repository"
                >
                  Issues
                </TableHeader>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule">
              <AnimatePresence mode="wait">
                {paginatedItems.map((repo, index) => {
                  const absoluteIndex = (page - 1) * rowsPerPage + index + 1;
                  return (
                    <motion.tr
                      key={repo.repo_id}
                      className="hover:bg-bg-sunken transition-colors duration-200 group"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03, duration: 0.3 }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono text-[11px] text-fg-muted tabular-nums">
                          {String(absoluteIndex).padStart(3, "0")}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/repositories/${repo.repo_id}`}
                          className="font-medium text-fg hover:text-accent transition-colors duration-200"
                        >
                          {repo.repo_name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Star size={14} className="text-fg-subtle" />
                          <span className="text-fg font-mono text-sm tabular-nums">
                            {Number(repo.star_count).toLocaleString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1">
                          <GitFork size={14} className="text-fg-subtle" />
                          <span className="text-fg font-mono text-sm tabular-nums">
                            {Number(repo.forks_count).toLocaleString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="text-fg font-mono text-sm tabular-nums">
                          {Number(repo.contributor_count).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="text-fg font-mono text-sm tabular-nums">
                          {Number(repo.open_issues_count).toLocaleString()}
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
            <Pagination page={page} total={pages} onChange={handlePageChange} />
          </div>
        )}
      </Panel>
    </div>
  );
}
