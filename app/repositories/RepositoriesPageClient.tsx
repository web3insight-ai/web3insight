'use client';

import {
  Card, CardBody, CardHeader, Input, Dropdown, DropdownTrigger,
  DropdownMenu, DropdownItem, Button, Pagination,
} from "@nextui-org/react";
import { Database, Filter, SortAsc, SortDesc, Search, Users, Code2, Zap, Star, GitFork } from "lucide-react";
import { useState, useMemo } from "react";
import Link from "next/link";
import type { RepoRankRecord } from "~/api/typing";

interface RepositoriesPageProps {
  repositories: RepoRankRecord[];
  totalRepositories: number;
  totalDevelopers: number;
  totalCoreDevelopers: number;
  totalEcosystems: number;
}

export default function RepositoriesPageClient({
  repositories,
  totalRepositories,
  totalDevelopers,
  totalCoreDevelopers,
  totalEcosystems,
}: RepositoriesPageProps) {
  // Pagination state
  const [page, setPage] = useState(1);
  const rowsPerPage = 25;

  // Filtering and sorting state
  const [filterValue, setFilterValue] = useState("");
  const [sortDescriptor, setSortDescriptor] = useState({
    column: "star_count",
    direction: "descending",
  });

  // Filter repositories based on search query
  const filteredItems = useMemo(() => {
    let filtered = [...repositories];

    if (filterValue) {
      filtered = filtered.filter(repo =>
        repo.repo_name.toLowerCase().includes(filterValue.toLowerCase()),
      );
    }

    return filtered;
  }, [repositories, filterValue]);

  // Sort filtered repositories
  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      const first = a[sortDescriptor.column as keyof RepoRankRecord];
      const second = b[sortDescriptor.column as keyof RepoRankRecord];

      if (first === undefined || second === undefined) return 0;

      const cmp = Number(first) < Number(second) ? -1 : Number(first) > Number(second) ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [filteredItems, sortDescriptor]);

  // Calculate pagination
  const paginatedItems = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return sortedItems.slice(start, end);
  }, [sortedItems, page, rowsPerPage]);

  const pages = Math.ceil(sortedItems.length / rowsPerPage);

  // Handle sorting change
  const handleSortChange = (column: string) => {
    setSortDescriptor(prev => ({
      column,
      direction: prev.column === column && prev.direction === "ascending"
        ? "descending"
        : "ascending",
    }));
  };

  return (
    <div className="min-h-dvh bg-background dark:bg-background-dark pb-24">
      <div className="w-full max-w-content mx-auto px-6 pt-8">
        {/* Header and Overview */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Database size={20} className="text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">All Repositories</h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl">
            Top repositories by developer engagement and contributions across Web3 ecosystems
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-10">
          <Card className="bg-white dark:bg-surface-dark shadow-subtle border border-border dark:border-border-dark">
            <CardBody className="p-6">
              <div className="text-center">
                <div className="p-3 bg-secondary/10 rounded-xl inline-flex mb-3">
                  <Code2 size={20} className="text-secondary" />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-500 uppercase tracking-wider mb-1">Developers</p>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white tabular-nums">
                  {Number(totalCoreDevelopers).toLocaleString()}
                </h2>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-white dark:bg-surface-dark shadow-subtle border border-border dark:border-border-dark">
            <CardBody className="p-6">
              <div className="text-center">
                <div className="p-3 bg-primary/10 rounded-xl inline-flex mb-3">
                  <Users size={20} className="text-primary" />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-500 uppercase tracking-wider mb-1">ECO Contributors</p>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white tabular-nums">
                  {Number(totalDevelopers).toLocaleString()}
                </h2>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-white dark:bg-surface-dark shadow-subtle border border-border dark:border-border-dark">
            <CardBody className="p-6">
              <div className="text-center">
                <div className="p-3 bg-warning/10 rounded-xl inline-flex mb-3">
                  <Database size={20} className="text-warning" />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-500 uppercase tracking-wider mb-1">Ecosystems</p>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white tabular-nums">
                  {Number(totalEcosystems).toLocaleString()}
                </h2>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-white dark:bg-surface-dark shadow-subtle border border-border dark:border-border-dark">
            <CardBody className="p-6">
              <div className="text-center">
                <div className="p-3 bg-success/10 rounded-xl inline-flex mb-3">
                  <Zap size={20} className="text-success" />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-500 uppercase tracking-wider mb-1">Repositories</p>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white tabular-nums">
                  {Number(totalRepositories).toLocaleString()}
                </h2>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="w-full sm:w-72">
            <Input
              placeholder="Search repositories..."
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              startContent={<Search size={18} className="text-gray-400" />}
              className="w-full"
            />
          </div>
          <div className="flex gap-2">
            <Dropdown>
              <DropdownTrigger>
                <Button
                  variant="flat"
                  startContent={<Filter size={18} />}
                >
                  Sort By
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Sort options">
                <DropdownItem key="repo_name" onClick={() => handleSortChange("repo_name")}>
                  <div className="flex items-center justify-between w-full">
                    <span>Name</span>
                    {sortDescriptor.column === "repo_name" && (
                      sortDescriptor.direction === "ascending" ? <SortAsc size={16} /> : <SortDesc size={16} />
                    )}
                  </div>
                </DropdownItem>
                <DropdownItem key="star_count" onClick={() => handleSortChange("star_count")}>
                  <div className="flex items-center justify-between w-full">
                    <span>Stars</span>
                    {sortDescriptor.column === "star_count" && (
                      sortDescriptor.direction === "ascending" ? <SortAsc size={16} /> : <SortDesc size={16} />
                    )}
                  </div>
                </DropdownItem>
                <DropdownItem key="contributor_count" onClick={() => handleSortChange("contributor_count")}>
                  <div className="flex items-center justify-between w-full">
                    <span>Contributors</span>
                    {sortDescriptor.column === "contributor_count" && (
                      sortDescriptor.direction === "ascending" ? <SortAsc size={16} /> : <SortDesc size={16} />
                    )}
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
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Repository Analytics</h3>
            </div>
          </CardHeader>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-t border-border dark:border-border-dark bg-surface dark:bg-surface-dark">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider w-12">#</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">Repository</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">Stars</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">Forks</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">Contributors</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">Issues</th>
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
                          <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium transition-all duration-200 group-hover:scale-110
                            ${absoluteIndex === 1 ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400' :
                      absoluteIndex === 2 ? 'bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-400' :
                        absoluteIndex === 3 ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400' :
                          'bg-gray-50 dark:bg-gray-900/10 text-gray-500 dark:text-gray-500'}`}>
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
                onChange={setPage}
              />
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
