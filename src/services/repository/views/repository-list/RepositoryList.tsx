"use client";

import { useState, useMemo } from "react";
import clsx from "clsx";
import {
  Input,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
  Pagination,
} from "@/components/ui";
import { Search, Filter, SortAsc, SortDesc } from "lucide-react";
import { Panel } from "$/blueprint";
import { SmallCapsLabel, BigNumber } from "$/primitives";

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

  // Build panels for the metrics row based on available data
  const panels: Array<{
    code: string;
    label: string;
    value: number;
    footnote: string;
    ground: "plain" | "dotted" | "hatched";
  }> = [
    {
      code: "01",
      label: "total repositories",
      value: pagination.total,
      footnote: "tracked in admin",
      ground: "dotted",
    },
    {
      code: "02",
      label: "marked repositories",
      value: stats.markedRepos,
      footnote: "custom relevance > 0",
      ground: "plain",
    },
  ];
  if (stats.hasStarData) {
    panels.push({
      code: String(panels.length + 1).padStart(2, "0"),
      label: "total stars",
      value: stats.totalStars,
      footnote: "sum across set",
      ground: "hatched",
    });
  }
  if (stats.hasForkData) {
    panels.push({
      code: String(panels.length + 1).padStart(2, "0"),
      label: "total forks",
      value: stats.totalForks,
      footnote: "sum across set",
      ground: "plain",
    });
  }

  const gridCols =
    panels.length === 4
      ? "md:grid-cols-4"
      : panels.length === 3
        ? "md:grid-cols-3"
        : "md:grid-cols-2";

  return (
    <div className={clsx("min-h-full space-y-6", className)}>
      {/* Summary Panels */}
      <div className={clsx("grid grid-cols-1 gap-4", gridCols)}>
        {panels.map((m) => (
          <Panel
            key={m.code}
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
        ))}
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="w-full sm:w-72">
          <Input
            placeholder="Search repositories..."
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
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
      <Panel
        label={{ text: "admin · repositories", position: "tl" }}
        code="TB"
        className="overflow-hidden"
      >
        <div className="px-5 pt-5 pb-3 border-b border-rule">
          <SmallCapsLabel>repository management</SmallCapsLabel>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-t border-rule bg-bg-sunken">
                <th className="px-6 py-3 text-left font-mono text-[10px] font-medium text-fg-muted uppercase tracking-[0.18em] w-12">
                  #
                </th>
                <th className="px-6 py-3 text-left font-mono text-[10px] font-medium text-fg-muted uppercase tracking-[0.18em]">
                  Repository
                </th>
                {stats.hasStarData && (
                  <th className="px-6 py-3 text-right font-mono text-[10px] font-medium text-fg-muted uppercase tracking-[0.18em]">
                    Stars
                  </th>
                )}
                {stats.hasForkData && (
                  <th className="px-6 py-3 text-right font-mono text-[10px] font-medium text-fg-muted uppercase tracking-[0.18em]">
                    Forks
                  </th>
                )}
                <th className="px-6 py-3 text-center font-mono text-[10px] font-medium text-fg-muted uppercase tracking-[0.18em]">
                  Custom Mark
                </th>
                <th className="px-6 py-3 text-center font-mono text-[10px] font-medium text-fg-muted uppercase tracking-[0.18em]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule">
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
                      <div className="animate-spin rounded-[2px] h-8 w-8 border-b-2 border-accent" />
                      <span className="ml-3 text-fg-muted">
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
                      className="hover:bg-bg-sunken transition-colors duration-200 group animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono text-[11px] text-fg-muted tabular-nums">
                          {String(absoluteIndex).padStart(3, "0")}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium text-fg">
                            {repo.fullName}
                          </div>
                          {repo.description && (
                            <div className="text-sm text-fg-muted truncate max-w-xs">
                              {repo.description}
                            </div>
                          )}
                        </div>
                      </td>
                      {stats.hasStarData && (
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className="text-fg font-mono text-sm tabular-nums">
                            {Number(
                              repo.statistics?.star || 0,
                            ).toLocaleString()}
                          </span>
                        </td>
                      )}
                      {stats.hasForkData && (
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className="text-fg font-mono text-sm tabular-nums">
                            {Number(
                              repo.statistics?.fork || 0,
                            ).toLocaleString()}
                          </span>
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-[2px] border text-[11px] font-mono uppercase tracking-[0.08em] ${
                            !repo.customMark || Number(repo.customMark) === 0
                              ? "border-rule bg-bg-sunken text-fg-muted"
                              : Number(repo.customMark) <= 3
                                ? "border-rule bg-bg-sunken text-fg-muted"
                                : Number(repo.customMark) <= 6
                                  ? "border-rule bg-bg-sunken text-fg"
                                  : "border-accent bg-accent-subtle text-accent"
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
                    <p className="text-fg-muted">No repositories found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-rule flex justify-between items-center">
          <div className="text-sm text-fg-muted font-mono tabular-nums">
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
      </Panel>

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
