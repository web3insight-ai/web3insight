"use client";

import {
  Card,
  CardHeader,
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
import { Filter, SortAsc, SortDesc, Search, Users } from "lucide-react";
import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDeveloperList, useOverviewStatistics } from "@/hooks/api";
import type { ActorRankRecord } from "@/lib/api/types";
import RepoLinkWidget from "~/repository/widgets/repo-link";
import MetricCard, { resolveOverviewMetrics } from "$/controls/metric-card";
import TableHeader from "$/controls/table-header";
import {
  staggerContainer,
  staggerItemScale,
  fadeInUp,
  modalTransition,
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
    <div className="w-full max-w-content mx-auto px-6 py-8">
      {/* Header and Overview */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <Users size={20} className="text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white whitespace-nowrap">
            All Developers
          </h1>
        </div>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl">
          Top contributors and developers across Web3 ecosystems
        </p>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10"
      >
        {resolveOverviewMetrics({
          totalCoreDevelopers: coreDevelopers,
          totalDevelopers: activeDevelopers,
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
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div className="w-full sm:w-72">
          <Input
            placeholder="Search developers..."
            value={searchValue}
            onChange={handleSearchChange}
            startContent={<Search size={18} className="text-gray-400" />}
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

      {/* Developers Table */}
      <Card className="bg-white dark:bg-surface-dark shadow-subtle border border-border dark:border-border-dark overflow-hidden">
        <CardHeader className="px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Users size={18} className="text-primary" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Developer Analytics
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
                <TableHeader>Developer</TableHeader>
                <TableHeader tooltip="Weighted contribution score based on PRs and recent activity. Recent contributions are weighted higher than older ones.">
                  Contribution Score
                </TableHeader>
                <TableHeader tooltip="Most active repositories this developer contributes to">
                  Top Repos
                </TableHeader>
              </tr>
            </thead>
            <tbody className="divide-y divide-border dark:divide-border-dark">
              <AnimatePresence mode="wait">
                {paginatedItems.map((developer, index) => {
                  const absoluteIndex = (page - 1) * rowsPerPage + index + 1;
                  return (
                    <motion.tr
                      key={developer.actor_id}
                      className="hover:bg-surface dark:hover:bg-surface-dark transition-colors duration-200 group"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03, duration: 0.3 }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium transition-all duration-200 group-hover:scale-110 bg-gray-50 dark:bg-surface-dark text-gray-500 dark:text-gray-500">
                            {absoluteIndex}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/developers/${developer.actor_id}`}
                          className="font-medium text-gray-900 dark:text-white hover:text-primary transition-colors duration-200"
                        >
                          @{developer.actor_login}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-gray-700 dark:text-gray-300 font-mono text-sm">
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
                              className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-800"
                            >
                              <RepoLinkWidget
                                repo={repo.repo_name}
                                repoId={repo.repo_id}
                                className="text-gray-700 dark:text-gray-300 hover:text-primary"
                              />
                              <span className="ml-1 text-gray-500 dark:text-gray-500">
                                {repo.commit_count}
                              </span>
                            </div>
                          ))}
                          {developer.top_repos.length > 3 && (
                            <button
                              onClick={() => handleShowAllRepos(developer)}
                              className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium text-primary hover:bg-primary/10 transition-colors cursor-pointer"
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
          <div className="px-6 py-4 border-t border-border dark:border-border-dark flex justify-center">
            <Pagination page={page} total={pages} onChange={handlePageChange} />
          </div>
        )}
      </Card>

      {/* Modal for showing all repositories */}
      <AnimatePresence>
        {isModalOpen && (
          <Modal isOpen={isModalOpen} onClose={handleModalClose} size="md">
            <ModalContent
              as={motion.div}
              variants={modalTransition}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <ModalHeader className="flex flex-col gap-1">
                <h3 className="text-lg font-semibold">All Repositories</h3>
                {selectedDeveloper && (
                  <p className="text-sm text-gray-500">
                    @{selectedDeveloper.actor_login}
                  </p>
                )}
              </ModalHeader>
              <ModalBody className="pb-6">
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {selectedDeveloper?.top_repos.map((repo) => (
                    <div
                      key={repo.repo_id}
                      className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <RepoLinkWidget
                        repo={repo.repo_name}
                        repoId={repo.repo_id}
                        className="text-sm font-medium text-gray-900 dark:text-white hover:text-primary"
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
