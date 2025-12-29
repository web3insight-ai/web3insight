"use client";

import { useState } from "react";
import { Database } from "lucide-react";

import type { DataValue, ResponseResult } from "@/types";
import type { Repository } from "~/repository/typing";
import { getPageSize } from "~/ecosystem/helper";
import RepositoryListView from "~/repository/views/repository-list/RepositoryList";

interface AdminEcosystemDetailClientProps {
  ecosystem: {
    name: string;
    repositories: Repository[];
  };
  initialPagination: {
    total: number;
    pageNum: number;
    pageSize: number;
  };
}

// Client-side API call helpers
async function fetchRepoList(
  params: Record<string, DataValue>,
): Promise<ResponseResult<Repository[]>> {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.set(key, String(value));
    }
  });

  const res = await fetch(`/api/ecosystem/repos?${searchParams.toString()}`);
  return res.json();
}

async function updateRepoMark(data: {
  eco: string;
  id: number;
  mark: number;
}): Promise<ResponseResult<unknown>> {
  const res = await fetch("/api/ecosystem/repos/mark", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export default function AdminEcosystemDetailClient({
  ecosystem,
  initialPagination,
}: AdminEcosystemDetailClientProps) {
  const [dataSource, setDataSource] = useState<Repository[]>(
    ecosystem.repositories,
  );
  const [search, setSearch] = useState<Record<string, DataValue>>({});
  const [page, setPage] = useState(initialPagination);
  const [loading, setLoading] = useState(false);

  const pageSize = getPageSize();

  const fetchData = ({
    pageNum,
    ...searchParams
  }: Record<string, DataValue>) => {
    setLoading(true);
    const pageNumber = typeof pageNum === "number" ? pageNum : 1;

    fetchRepoList({
      ...searchParams,
      eco: ecosystem.name,
      pageSize,
      pageNum: pageNumber,
    })
      .then((res) => {
        if (res.success) {
          const extra = res.extra as { total?: number } | undefined;
          setPage({
            ...initialPagination,
            pageNum: pageNumber,
            total: Number(extra?.total) || 0,
          });
          setDataSource(res.data);
        }
      })
      .finally(() => setLoading(false));
  };

  const handlePageChange = (pageNum: number) =>
    fetchData({ pageNum, ...search });

  const handleSearch = (searchValue: Record<string, DataValue>) => {
    setSearch(searchValue);
    fetchData({ pageNum: 1, ...searchValue });
  };

  const handleMark = (
    mark: number | string | undefined,
    record: Record<string, DataValue>,
  ) => {
    const newMark = mark ? Number(mark) : 0;
    const recordId =
      typeof record.id === "number" ? record.id : Number(record.id);
    const originalMark =
      typeof record.customMark === "number" ||
      typeof record.customMark === "string"
        ? record.customMark
        : undefined;

    // Optimistically update the UI immediately
    setDataSource((prevData) =>
      prevData.map((repo) =>
        repo.id === recordId ? { ...repo, customMark: newMark } : repo,
      ),
    );

    return updateRepoMark({ eco: ecosystem.name, id: recordId, mark: newMark })
      .then((res) => {
        if (res.success) {
          // Refresh data to sync with server state
          fetchData({ pageNum: page.pageNum, ...search });
        } else {
          // Revert optimistic update on failure
          setDataSource((prevData) =>
            prevData.map((repo) =>
              repo.id === recordId
                ? { ...repo, customMark: originalMark }
                : repo,
            ),
          );
        }

        return res;
      })
      .catch((error) => {
        // Revert optimistic update on error
        setDataSource((prevData) =>
          prevData.map((repo) =>
            repo.id === recordId ? { ...repo, customMark: originalMark } : repo,
          ),
        );
        throw error;
      });
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {ecosystem.name}
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl">
            Manage and mark repositories within the {ecosystem.name} ecosystem
          </p>
        </div>

        <RepositoryListView
          dataSource={dataSource}
          pagination={page}
          loading={loading}
          onCurrentChange={handlePageChange}
          onSearch={handleSearch}
          onMark={handleMark}
        />
      </div>
    </div>
  );
}
