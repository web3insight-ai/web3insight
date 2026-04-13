"use client";

import {
  Input,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
  Pagination,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
} from "@/components/ui";
import { Filter, SortAsc, SortDesc, Search } from "lucide-react";
import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDeveloperList, useOverviewStatistics } from "@/hooks/api";
import type { ActorRankRecord } from "@/lib/api/types";
import RepoLinkWidget from "~/repository/widgets/repo-link";
import TableHeader from "$/controls/table-header";
import { Panel } from "$/blueprint";
import { SectionHeader, SmallCapsLabel, BigNumber } from "$/primitives";
import {
  staggerContainer,
  staggerItemScale,
  fadeInUp,
} from "@/utils/animations";
import {
  developerSearchSchema,
  type DeveloperSearchInput,
} from "@/lib/form/schemas";

export default function DevelopersPageClient() {
  // TanStack Query hooks - data is hydrated from server prefetch
  const { data: developers = [] } = useDeveloperList();
  const { data: statistics } = useOverviewStatistics();

  const coreDevelopers = statistics?.totalCoreDevelopers ?? 0;
  const activeDevelopers = statistics?.totalDevelopers ?? 0;
  const totalRepositories = statistics?.totalRepositories ?? 0;
  const totalEcosystems = statistics?.totalEcosystems ?? 0;

  // Form state using React Hook Form
  const form = useForm<DeveloperSearchInput>({
    resolver: zodResolver(developerSearchSchema),
    defaultValues: {
      search: "",
      sortBy: "total_commit_count",
      sortDirection: "desc",
    },
  });

  // Single watch call to reduce re-renders (instead of 3 separate calls)
  const { search: searchValue, sortBy, sortDirection } = form.watch();

  // Pagination state
  const [page, setPage] = useState(1);
  const rowsPerPage = 25;

  // Modal state for showing all repos
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDeveloper, setSelectedDeveloper] =
    useState<ActorRankRecord | null>(null);

  // Filter developers based on search query
  const filteredItems = useMemo(() => {
    let filtered = [...developers];

    if (searchValue) {
      filtered = filtered.filter((developer) =>
        developer.actor_login.toLowerCase().includes(searchValue.toLowerCase()),
      );
    }

    return filtered;
  }, [developers, searchValue]);

  // Sort filtered developers
  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      const first = a[sortBy as keyof ActorRankRecord];
      const second = b[sortBy as keyof ActorRankRecord];

      if (first === undefined || second === undefined) return 0;

      const cmp = first < second ? -1 : first > second ? 1 : 0;

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
        form.setValue("sortBy", column as DeveloperSearchInput["sortBy"]);
        form.setValue("sortDirection", "desc");
      }
    },
    [form],
  );

  // Handle showing all repos
  const handleShowAllRepos = useCallback((developer: ActorRankRecord) => {
    setSelectedDeveloper(developer);
    setIsModalOpen(true);
  }, []);

  // Handle search input change
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      form.setValue("search", e.target.value);
      setPage(1); // Reset to first page on search
    },
    [form],
  );

  // Handle page change
  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  // Handle modal close
  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  return (
    <div className="w-full max-w-content mx-auto px-6 py-10">
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="mb-10"
      >
        <SectionHeader
          kicker="index · developers"
          title="All developers"
          deck="Top contributors across Web3 ecosystems, ranked by weighted commit score."
          level={1}
        />
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12"
      >
        {[
          {
            code: "01",
            label: "core devs",
            value: coreDevelopers,
            footnote: "src: opendigger · 12m PR / push",
            ground: "dotted" as const,
          },
          {
            code: "02",
            label: "eco contributors",
            value: activeDevelopers,
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

      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div className="w-full sm:w-72">
          <Input
            placeholder="Search developers..."
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
              <DropdownItem
                key="actor_login"
                onClick={() => handleSortChange("actor_login")}
              >
                <div className="flex items-center justify-between w-full">
                  <span>Developer Name</span>
                  {sortBy === "actor_login" &&
                    (sortDirection === "asc" ? (
                      <SortAsc size={16} />
                    ) : (
                      <SortDesc size={16} />
                    ))}
                </div>
              </DropdownItem>
              <DropdownItem
                key="total_commit_count"
                onClick={() => handleSortChange("total_commit_count")}
              >
                <div className="flex items-center justify-between w-full">
                  <span>Contribution Score</span>
                  {sortBy === "total_commit_count" &&
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

      <Panel
        label={{ text: "ranking · commits", position: "tl" }}
        code="05"
        className="overflow-hidden"
      >
        <div className="px-5 pt-5 pb-3 border-b border-rule">
          <SmallCapsLabel>developer analytics</SmallCapsLabel>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-t border-rule bg-bg-sunken">
                <th className="px-6 py-3 text-left font-mono text-[10px] font-medium text-fg-muted uppercase tracking-[0.18em] w-12">
                  #
                </th>
                <TableHeader>Developer</TableHeader>
                <TableHeader tooltip="Weighted contribution score based on PRs and recent activity. Recent contributions are weighted higher than older ones.">
                  Contribution Score
                </TableHeader>
                <TableHeader tooltip="Most active repositories this developer contributes to">
                  Top Repos
                </TableHeader>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule">
              <AnimatePresence mode="wait">
                {paginatedItems.map((developer, index) => {
                  const absoluteIndex = (page - 1) * rowsPerPage + index + 1;
                  return (
                    <motion.tr
                      key={developer.actor_id}
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
                          href={`/developers/${developer.actor_id}`}
                          className="font-medium text-fg hover:text-accent transition-colors duration-200"
                        >
                          @{developer.actor_login}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-fg font-mono text-sm tabular-nums">
                          {Number(
                            developer.total_commit_count,
                          ).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {developer.top_repos.slice(0, 3).map((repo) => (
                            <div
                              key={repo.repo_id}
                              className="inline-flex items-center px-2 py-1 rounded-[2px] border border-rule text-xs font-medium bg-bg-raised"
                            >
                              <RepoLinkWidget
                                repo={repo.repo_name}
                                repoId={repo.repo_id}
                                className="text-fg hover:text-accent"
                              />
                              <span className="ml-1 font-mono text-fg-muted tabular-nums">
                                {repo.commit_count}
                              </span>
                            </div>
                          ))}
                          {developer.top_repos.length > 3 && (
                            <button
                              onClick={() => handleShowAllRepos(developer)}
                              className="inline-flex items-center px-2 py-1 rounded-[2px] text-xs font-medium text-accent hover:bg-accent-subtle transition-colors cursor-pointer"
                            >
                              +{developer.top_repos.length - 3} more
                            </button>
                          )}
                        </div>
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

      {/* Modal for showing all repositories */}
      <AnimatePresence>
        {isModalOpen && (
          <Modal isOpen={isModalOpen} onClose={handleModalClose} size="md">
            <ModalContent>
              <ModalHeader className="flex flex-col gap-1">
                <SmallCapsLabel tone="subtle">all repositories</SmallCapsLabel>
                {selectedDeveloper && (
                  <p className="font-mono text-sm text-fg-muted">
                    @{selectedDeveloper.actor_login}
                  </p>
                )}
              </ModalHeader>
              <ModalBody className="pb-6">
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {selectedDeveloper?.top_repos.map((repo) => (
                    <div
                      key={repo.repo_id}
                      className="p-3 rounded-[2px] border border-rule bg-bg-raised hover:bg-bg-sunken transition-colors"
                    >
                      <RepoLinkWidget
                        repo={repo.repo_name}
                        repoId={repo.repo_id}
                        className="text-sm font-medium text-fg hover:text-accent"
                      />
                    </div>
                  ))}
                </div>
              </ModalBody>
            </ModalContent>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}
