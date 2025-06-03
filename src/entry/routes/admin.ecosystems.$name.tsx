import { type LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { fetchManageableRepositoryList } from "~/ecosystem/repository";
import RepositoryListViewWidget from "~/repository/views/repository-list";

import Section from "../components/section";

async function loader({ params }: LoaderFunctionArgs) {
  const name = decodeURIComponent(params.name!);
  const { data, extra } = await fetchManageableRepositoryList(name);

  return json({
    ecosystem: { name, repositories: data },
    pagination: {
      total: extra?.total as number || 0,
      pageNum: 1,
      pageSize: 100,
    },
  });
}

function AdminEcosystemDetailPage() {
  const { ecosystem, pagination } = useLoaderData<typeof loader>();

  return (
    <Section
      className="h-full"
      title={ecosystem.name}
      summary={`Manage stuff of ${ecosystem.name} ecosystem`}
      contentHeightFixed
    >
      <RepositoryListViewWidget dataSource={ecosystem.repositories} pagination={pagination} />
    </Section>
  );
}

export { loader };
export default AdminEcosystemDetailPage;
