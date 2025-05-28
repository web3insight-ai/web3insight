import { useLoaderData } from "@remix-run/react";

import { fetchManageableList } from "~/ecosystem/repository";
import EcosystemListViewWidget from "~/ecosystem/views/ecosystem-list";

async function loader() {
  const res = await fetchManageableList();

  return {
    ecosystems: res.data,
  };
}

function AdminHomepage() {
  const { ecosystems } = useLoaderData<typeof loader>();

  return (
    <EcosystemListViewWidget dataSource={ecosystems} />
  );
}

export { loader };
export default AdminHomepage;
