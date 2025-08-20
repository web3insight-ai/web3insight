'use client';

import { useState } from "react";
import { Database } from "lucide-react";

import type { DataValue } from '@/types';
import { getPageSize } from "~/ecosystem/helper";
import { fetchManageableRepositoryList, updateManageableRepositoryMark } from "~/ecosystem/repository";
import RepositoryListView from "~/repository/views/repository-list/RepositoryList";

interface AdminEcosystemDetailClientProps {
  ecosystem: {
    name: string;
    repositories: Record<string, unknown>[];
  };
  initialPagination: {
    total: number;
    pageNum: number;
    pageSize: number;
  };
}

export default function AdminEcosystemDetailClient({
  ecosystem,
  initialPagination,
}: AdminEcosystemDetailClientProps) {
  const [dataSource, setDataSource] = useState(ecosystem.repositories);
  const [search, setSearch] = useState<Record<string, DataValue>>({});
  const [page, setPage] = useState(initialPagination);
  const [loading, setLoading] = useState(false);

  const pageSize = getPageSize();

  const fetchData = ({ pageNum, ...search }: Record<string, DataValue>) => {
    setLoading(true);

    fetchManageableRepositoryList({
      ...search,
      eco: ecosystem.name,
      pageSize,
      pageNum,
    })
      .then(res => {
        if (res.success) {
          setPage({ ...initialPagination, pageNum, total: res.extra?.total as number || 0 });
          setDataSource(res.data);
        }
      })
      .finally(() => setLoading(false));
  };

  const handlePageChange = (pageNum: number) => fetchData({ pageNum, ...search });

  const handleSearch = (searchValue: Record<string, DataValue>) => {
    setSearch(searchValue);
    fetchData({ pageNum: 1, ...searchValue });
  };

  const handleMark = (mark: number | string | undefined, record: Record<string, DataValue>) => {
    return updateManageableRepositoryMark({ eco: ecosystem.name, id: record.id, mark: mark ? Number(mark) : 0 })
      .then(res => {
        if (res.success) {
          fetchData({ pageNum: page.pageNum, ...search });
        }

        return res;
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{ecosystem.name}</h1>
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
