import { useLoaderData } from "@remix-run/react";

import { fetchManageableList } from "~/ecosystem/repository";
import EcosystemListViewWidget from "~/ecosystem/views/ecosystem-list";

import Section from "../components/section";

async function loader() {
  const res = await fetchManageableList();

  return {
    ecosystems: res.data,
  };
}

function AdminHomepage() {
  const { ecosystems } = useLoaderData<typeof loader>();

  return (
    <Section
      title="Ecosystems"
      summary="You can manage the ecosystems listed below"
    >
      <EcosystemListViewWidget dataSource={ecosystems} />
    </Section>
  );
}

export { loader };
export default AdminHomepage;
