import { useState } from "react";
import { type LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import type { DataValue } from '@/types';

import { getPageSize } from "~/ecosystem/helper";
import { fetchManageableRepositoryList } from "~/ecosystem/repository";
import RepositoryListViewWidget from "~/repository/views/repository-list";

import Section from "../components/section";

async function loader({ params }: LoaderFunctionArgs) {
  const pageSize = getPageSize();
  const name = decodeURIComponent(params.name!);
  const { data, extra } = await fetchManageableRepositoryList({ eco: name, pageSize });

  return json({
    ecosystem: { name, repositories: data },
    pagination: {
      total: extra?.total as number || 0,
      pageNum: 1,
      pageSize,
    },
  });
}

function AdminEcosystemDetailPage() {
  const { ecosystem, pagination } = useLoaderData<typeof loader>();
  const [dataSource, setDataSource] = useState(ecosystem.repositories);
  const [search, setSearch] = useState<Record<string, DataValue>>({});
  const [page, setPage] = useState(pagination);
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
          setPage({ ...pagination, pageNum, total: res.extra?.total as number || 0 });
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

  return (
    <Section
      className="h-full"
      title={ecosystem.name}
      summary={`Manage stuff of ${ecosystem.name} ecosystem`}
      contentHeightFixed
    >
      <RepositoryListViewWidget
        dataSource={dataSource}
        pagination={page}
        loading={loading}
        onCurrentChange={handlePageChange}
        onSearch={handleSearch}
      />
    </Section>
  );
}

export { loader };
export default AdminEcosystemDetailPage;
