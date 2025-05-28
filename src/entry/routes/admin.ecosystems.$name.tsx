import { type LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { fetchManageableRepositoryList } from "~/ecosystem/repository";
import RepositoryListViewWidget from "~/repository/views/repository-list";

async function loader({ params }: LoaderFunctionArgs) {
  const name = decodeURIComponent(params.name!);
  const { data } = await fetchManageableRepositoryList(name);

  return json({
    ecosystem: { name, repositories: data },
  });
}

function AdminEcosystemDetailPage() {
  const { ecosystem } = useLoaderData<typeof loader>();

  return (
    <div>
      <h1>Ecosystem: {ecosystem.name}</h1>
      <RepositoryListViewWidget dataSource={ecosystem.repositories} />
    </div>
  );
}

export { loader };
export default AdminEcosystemDetailPage;
