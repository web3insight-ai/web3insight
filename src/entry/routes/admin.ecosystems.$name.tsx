import { useState } from "react";
import { type LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import type { DataValue } from '@/types';

import { fetchCurrentUser } from "~/auth/repository";
import { canManageEcosystems } from "~/auth/helper";
import { getPageSize } from "~/ecosystem/helper";
import { fetchManageableList, fetchManageableRepositoryList, updateManageableRepositoryMark } from "~/ecosystem/repository";
import RepositoryListViewWidget from "~/repository/views/repository-list";

import Section from "../components/section";

async function loader({ request, params }: LoaderFunctionArgs) {
  const name = decodeURIComponent(params.name!);

  const res = await fetchCurrentUser(request);
  
  if (!canManageEcosystems(res.data)) {
    throw new Response(null, { status: 404, statusText: "Not Found" });
  }

  const { data: ecosystems } = await fetchManageableList(res.data.id);

  if (!ecosystems.find(eco => eco.name === name)) {
    throw new Response(null, { status: 404, statusText: "Not Found" });
  }

  const pageSize = getPageSize();
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

  const handleMark = (mark: number | string | undefined, record: Record<string, DataValue>) => {
    return updateManageableRepositoryMark({ eco: ecosystem.name, id: record.id, mark: mark ? Number(mark) : 0 })
      .then(res => {
        if (res.success) {
          fetchData({ pageNum: page.pageNum,...search });
        }

        return res;
      });
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
        onMark={handleMark}
      />
    </Section>
  );
}

export { loader };
export default AdminEcosystemDetailPage;
