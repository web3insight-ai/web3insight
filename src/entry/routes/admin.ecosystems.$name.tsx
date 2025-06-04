import { useState } from "react";
import { type LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

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
  const [page, setPage] = useState(pagination);
  const [dataSource, setDataSource] = useState(ecosystem.repositories);

  const pageSize = getPageSize();

  const handlePageChange = (pageNum: number) => fetchManageableRepositoryList({
    eco: ecosystem.name,
    pageSize,
    pageNum,
  })
    .then(res => {
      if (res.success) {
        setPage({ ...pagination, pageNum });
        setDataSource(res.data);
      }
    });

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
        onCurrentChange={handlePageChange}
      />
    </Section>
  );
}

export { loader };
export default AdminEcosystemDetailPage;
