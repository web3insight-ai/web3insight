import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { fetchCurrentUser } from "~/auth/repository";
import { canManageEcosystems } from "~/auth/helper";
import { fetchManageableEcosystemsWithStats } from "~/ecosystem/repository";
import EcosystemManagementTable from "~/ecosystem/widgets/EcosystemManagementTable";

import Section from "../components/section";

async function loader({ request }: LoaderFunctionArgs) {
  const res = await fetchCurrentUser(request);
  
  if (!canManageEcosystems(res.data)) {
    throw new Response(null, { status: 404, statusText: "Not Found" });
  }

  const { data: ecosystems } = await fetchManageableEcosystemsWithStats();

  return json({
    ecosystems,
  });
}

function AdminHomepage() {
  const { ecosystems } = useLoaderData<typeof loader>();

  return (
    <Section
      title="Ecosystems"
      summary="You can manage the ecosystems listed below"
      contentHeightFixed
    >
      <EcosystemManagementTable 
        ecosystems={ecosystems} 
      />
    </Section>
  );
}

export { loader };
export default AdminHomepage;
