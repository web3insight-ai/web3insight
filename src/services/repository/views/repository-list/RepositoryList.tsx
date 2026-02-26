"use client";

import { useState, useMemo } from "react";
import clsx from "clsx";
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
  Pagination,
} from "@/components/ui";
import {
  Search,
  Database,
  Star,
  GitFork,
  Filter,
  SortAsc,
  SortDesc,
} from "lucide-react";

import type { Repository } from "../../typing";
import { resolveCustomMarkText } from "../../helper";

import type { RepositoryListViewWidgetProps } from "./typing";
import MarkDialog from "./MarkDialog";

function RepositoryListView({
  className,
  dataSource,
  pagination,
  loading,
  onCurrentChange,
  onSearch,
  onMark,
}: RepositoryListViewWidgetProps) {
  const [visible, setVisible] = useState(false);
  const [record, setRecord] = useState({} as Repository);
  const [filterValue, setFilterValue] = useState("");
  const [sortDescriptor, setSortDescriptor] = useState({
    column: "id",
    direction: "ascending",
  });

  const closeDialog = () => setVisible(false);

  // Calculate statistics and check if API provides star/fork data
  const stats = useMemo(() => {
    const totalRepos = dataSource.length;
    const markedRepos = dataSource.filter(
      (repo) => repo.customMark && Number(repo.customMark) > 0,
    ).length;
    const totalStars = dataSource.reduce(
      (acc, repo) => acc + Number(repo.statistics?.star || 0),
      0,
    );
    const totalForks = dataSource.reduce(
      (acc, repo) => acc + Number(repo.statistics?.fork || 0),
      0,
    );

    // Check if API actually provides star/fork data (not just zeros)
    const hasStarData = dataSource.some(
      (repo) => repo.statistics?.star && Number(repo.statistics.star) > 0,
    );
    const hasForkData = dataSource.some(
      (repo) => repo.statistics?.fork && Number(repo.statistics.fork) > 0,
    );

    return {
      totalRepos,
      markedRepos,
      totalStars,
      totalForks,
      hasStarData,
      hasForkData,
    };
  }, [dataSource]);

  // Filter repositories based on search query
  const filteredItems = useMemo(() => {
    let filtered = [...dataSource];

    if (filterValue) {
      filtered = filtered.filter((repo) =>
        repo.fullName.toLowerCase().includes(filterValue.toLowerCase()),
      );
    }

    return filtered;
  }, [dataSource, filterValue]);

  // Sort filtered repositories
  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      let first, second;

      switch (sortDescriptor.column) {
      case "fullName":
        first = a.fullName;
        second = b.fullName;
        break;
      case "customMark":
        first = a.customMark || 0;
        second = b.customMark || 0;
        break;
      case "star":
        first = a.statistics?.star || 0;
        second = b.statistics?.star || 0;
        break;
      case "fork":
        first = a.statistics?.fork || 0;
        second = b.statistics?.fork || 0;
        break;
      default:
        first = a.id;
        second = b.id;
      }

      if (first === undefined || second === undefined) return 0;

      const cmp = first < second ? -1 : first > second ? 1 : 0;
      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [filteredItems, sortDescriptor]);

  // Handle sorting change
  const handleSortChange = (column: string) => {
    setSortDescriptor((prev) => ({
      column,
      direction:
        prev.column === column && prev.direction === "ascending"
          ? "descending"
          : "ascending",
    }));
  };

  const handleSearch = () => {
    onSearch({
      search: filterValue,
      order: sortDescriptor.column as "id" | "org",
      direction: sortDescriptor.direction === "ascending" ? "asc" : "desc",
    });
  };

  return (
    <div className={clsx("min-h-full space-y-6", className)}>
      {/* Summary Cards */}
      <div
        className={`grid grid-cols-1 gap-4 md:gap-6 ${
          stats.hasStarData && stats.hasForkData
            ? "md:grid-cols-4"
            : stats.hasStarData || stats.hasForkData
              ? "md:grid-cols-3"
              : "md:grid-cols-2"
        }`}
      >
        <Card className="bg-white dark:bg-surface-dark shadow-subtle border border-border dark:border-border-dark">
          <CardBody className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-xl flex-shrink-0">
                <Database size={20} className="text-primary" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Total Repositories
                </p>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {pagination.total.toLocaleString()}
                </h2>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-white dark:bg-surface-dark shadow-subtle border border-border dark:border-border-dark">
          <CardBody className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-success/10 rounded-xl flex-shrink-0">
                <Database size={20} className="text-success" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Marked Repositories
                </p>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.markedRepos.toLocaleString()}
                </h2>
              </div>
            </div>
          </CardBody>
        </Card>

        {stats.hasStarData && (
          <Card className="bg-white dark:bg-surface-dark shadow-subtle border border-border dark:border-border-dark">
            <CardBody className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-secondary/10 rounded-xl flex-shrink-0">
                  <Star size={20} className="text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    Total Stars
                  </p>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.totalStars.toLocaleString()}
                  </h2>
                </div>
              </div>
            </CardBody>
          </Card>
        )}

        {stats.hasForkData && (
          <Card className="bg-white dark:bg-surface-dark shadow-subtle border border-border dark:border-border-dark">
            <CardBody className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-warning/10 rounded-xl flex-shrink-0">
                  <GitFork size={20} className="text-warning" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    Total Forks
                  </p>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.totalForks.toLocaleString()}
                  </h2>
                </div>
              </div>
            </CardBody>
          </Card>
        )}
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="w-full sm:w-72">
          <Input
            placeholder="Search repositories..."
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
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
                key="fullName"
                onClick={() => handleSortChange("fullName")}
              >
                <div className="flex items-center justify-between w-full">
                  <span>Repository Name</span>
                  {sortDescriptor.column === "fullName" &&
                    (sortDescriptor.direction === "ascending" ? (
                      <SortAsc size={16} />
                    ) : (
                      <SortDesc size={16} />
                    ))}
                </div>
              </DropdownItem>
              <DropdownItem
                key="customMark"
                onClick={() => handleSortChange("customMark")}
              >
                <div className="flex items-center justify-between w-full">
                  <span>Custom Mark</span>
                  {sortDescriptor.column === "customMark" &&
                    (sortDescriptor.direction === "ascending" ? (
                      <SortAsc size={16} />
                    ) : (
                      <SortDesc size={16} />
                    ))}
                </div>
              </DropdownItem>
              {stats.hasStarData && (
                <DropdownItem
                  key="star"
                  onClick={() => handleSortChange("star")}
                >
                  <div className="flex items-center justify-between w-full">
                    <span>Stars</span>
                    {sortDescriptor.column === "star" &&
                      (sortDescriptor.direction === "ascending" ? (
                        <SortAsc size={16} />
                      ) : (
                        <SortDesc size={16} />
                      ))}
                  </div>
                </DropdownItem>
              )}
              {stats.hasForkData && (
                <DropdownItem
                  key="fork"
                  onClick={() => handleSortChange("fork")}
                >
                  <div className="flex items-center justify-between w-full">
                    <span>Forks</span>
                    {sortDescriptor.column === "fork" &&
                      (sortDescriptor.direction === "ascending" ? (
                        <SortAsc size={16} />
                      ) : (
                        <SortDesc size={16} />
                      ))}
                  </div>
                </DropdownItem>
              )}
            </DropdownMenu>
          </Dropdown>
          <Button color="primary" onClick={handleSearch}>
            Search
          </Button>
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
              Repository Management
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">
                  Repository
                </th>
                {stats.hasStarData && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">
                    Stars
                  </th>
                )}
                {stats.hasForkData && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">
                    Forks
                  </th>
                )}
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">
                  Custom Mark
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border dark:divide-border-dark">
              {loading ? (
                <tr>
                  <td
                    colSpan={
                      4 +
                      (stats.hasStarData ? 1 : 0) +
                      (stats.hasForkData ? 1 : 0)
                    }
                    className="px-6 py-16 text-center"
                  >
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                      <span className="ml-3 text-gray-500 dark:text-gray-400">
                        Loading repositories...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : sortedItems.length > 0 ? (
                sortedItems.map((repo, index) => {
                  const absoluteIndex =
                    (pagination.pageNum - 1) * pagination.pageSize + index + 1;
                  return (
                    <tr
                      key={repo.id}
                      className="hover:bg-surface dark:hover:bg-surface-dark transition-colors duration-200 group animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium transition-all duration-200 group-hover:scale-110 bg-gray-50 dark:bg-gray-900/10 text-gray-500 dark:text-gray-500">
                            {absoluteIndex}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {repo.fullName}
                          </div>
                          {repo.description && (
                            <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                              {repo.description}
                            </div>
                          )}
                        </div>
                      </td>
                      {stats.hasStarData && (
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className="text-gray-700 dark:text-gray-300 font-mono text-sm">
                            {Number(
                              repo.statistics?.star || 0,
                            ).toLocaleString()}
                          </span>
                        </td>
                      )}
                      {stats.hasForkData && (
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className="text-gray-700 dark:text-gray-300 font-mono text-sm">
                            {Number(
                              repo.statistics?.fork || 0,
                            ).toLocaleString()}
                          </span>
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            !repo.customMark || Number(repo.customMark) === 0
                              ? "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                              : Number(repo.customMark) <= 3
                                ? "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200"
                                : Number(repo.customMark) <= 6
                                  ? "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200"
                                  : "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200"
                          }`}
                        >
                          {resolveCustomMarkText(repo.customMark || 0)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <Button
                          size="sm"
                          variant="flat"
                          color="primary"
                          onClick={() => {
                            setRecord(repo);
                            setVisible(true);
                          }}
                        >
                          Mark
                        </Button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={
                      4 +
                      (stats.hasStarData ? 1 : 0) +
                      (stats.hasForkData ? 1 : 0)
                    }
                    className="px-6 py-16 text-center"
                  >
                    <p className="text-gray-500 dark:text-gray-400">
                      No repositories found.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-border dark:border-border-dark flex justify-between items-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing{" "}
            {Math.min(
              (pagination.pageNum - 1) * pagination.pageSize + 1,
              pagination.total,
            )}{" "}
            to{" "}
            {Math.min(
              pagination.pageNum * pagination.pageSize,
              pagination.total,
            )}{" "}
            of {pagination.total} repositories
          </div>
          {Math.ceil(pagination.total / pagination.pageSize) > 1 && (
            <Pagination
              page={pagination.pageNum}
              total={Math.ceil(pagination.total / pagination.pageSize)}
              onChange={onCurrentChange}
            />
          )}
        </div>
      </Card>

      <MarkDialog
        record={record}
        visible={visible}
        onClose={closeDialog}
        onChange={(mark) => onMark(mark, record)}
      />
    </div>
  );
}

export default RepositoryListView;
