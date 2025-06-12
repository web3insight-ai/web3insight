import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { fetchCurrentUser } from "~/auth/repository";
import { fetchManageableList } from "~/ecosystem/repository";
import EcosystemListViewWidget from "~/ecosystem/views/ecosystem-list";

import Section from "../components/section";

async function loader({ request }: LoaderFunctionArgs) {
  const res = await fetchCurrentUser(request);
  const { data } = await fetchManageableList(res.data.id);

  return {
    ecosystems: data,
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
