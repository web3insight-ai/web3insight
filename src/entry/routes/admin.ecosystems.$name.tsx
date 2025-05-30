import { type LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { fetchManageableRepositoryList } from "~/ecosystem/repository";
import RepositoryListViewWidget from "~/repository/views/repository-list";

import Section from "../components/section";

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
    <Section
      title={ecosystem.name}
      summary={`Manage stuff of ${ecosystem.name} ecosystem`}
    >
      <RepositoryListViewWidget dataSource={ecosystem.repositories} />
    </Section>
  );
}

export { loader };
export default AdminEcosystemDetailPage;
