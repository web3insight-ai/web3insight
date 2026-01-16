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
} from "@nextui-org/react";
import {
  Database,
  Filter,
  SortAsc,
  SortDesc,
  Search,
  Users,
  Code2,
  Zap,
  Star,
  GitFork,
} from "lucide-react";
import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRepositoryList, useOverviewStatistics } from "@/hooks/api";
import type { RepoRankRecord } from "@/lib/api/types";
import MetricCard, { type MetricCardProps } from "$/controls/metric-card";
import TableHeader from "$/controls/table-header";
import {
  repositorySearchSchema,
  type RepositorySearchInput,
} from "@/lib/form/schemas";

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
    <div className="min-h-dvh bg-background dark:bg-background-dark pb-24">
      <div className="w-full max-w-content mx-auto px-6 pt-8">
        {/* Header and Overview */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Database size={20} className="text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              All Repositories
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl">
            Top repositories by developer engagement and contributions across
            Web3 ecosystems
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10">
          {resolveMetrics({
            totalCoreDevelopers,
            totalDevelopers,
            totalEcosystems,
            totalRepositories,
          }).map((metric, index) => (
            <div
              key={metric.label.replaceAll(" ", "")}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <MetricCard {...metric} />
            </div>
          ))}
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="w-full sm:w-72">
            <Input
              placeholder="Search repositories..."
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
                  key="name"
                  onClick={() => handleSortChange("name")}
                >
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
        <Card className="bg-white dark:bg-surface-dark shadow-subtle border border-border dark:border-border-dark overflow-hidden">
          <CardHeader className="px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Database size={18} className="text-primary" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Repository Analytics
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
              <tbody className="divide-y divide-border dark:divide-border-dark">
                {paginatedItems.map((repo, index) => {
                  const absoluteIndex = (page - 1) * rowsPerPage + index + 1;
                  return (
                    <tr
                      key={repo.repo_id}
                      className="hover:bg-surface dark:hover:bg-surface-dark transition-colors duration-200 group animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span
                            className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium transition-all duration-200 group-hover:scale-110 bg-gray-50 dark:bg-gray-900/10 text-gray-500 dark:text-gray-500`}
                          >
                            {absoluteIndex}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/repositories/${repo.repo_id}`}
                          className="font-medium text-gray-900 dark:text-white hover:text-primary transition-colors duration-200"
                        >
                          {repo.repo_name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Star size={14} className="text-yellow-500" />
                          <span className="text-gray-700 dark:text-gray-300 font-mono text-sm">
                            {Number(repo.star_count).toLocaleString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1">
                          <GitFork size={14} className="text-gray-500" />
                          <span className="text-gray-700 dark:text-gray-300 font-mono text-sm">
                            {Number(repo.forks_count).toLocaleString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="text-gray-700 dark:text-gray-300 font-mono text-sm">
                          {Number(repo.contributor_count).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="text-gray-700 dark:text-gray-300 font-mono text-sm">
                          {Number(repo.open_issues_count).toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {pages > 1 && (
            <div className="px-6 py-4 border-t border-border dark:border-border-dark flex justify-center">
              <Pagination
                page={page}
                total={pages}
                onChange={handlePageChange}
              />
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
