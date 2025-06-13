import { useLoaderData } from "@remix-run/react";

import { fetchAdminEcosystemList } from "~/api/repository";
import type { Manager } from "~/admin/typing";
import { fetchManagerList, updateManager } from "~/admin/repository";
import ManagerListViewWidget from "~/admin/views/manager-list";

import Section from "../components/section";

async function loader() {
  const [{ data }, { data: managers }] = await Promise.all([fetchAdminEcosystemList(), fetchManagerList()]);

  return {
    managers,
    ecosystems: data.provider_ecosystem.filter(eco => eco.toLowerCase() !== "all"),
  };
}

function SettingsHomepage() {
  const { managers, ecosystems } = useLoaderData<typeof loader>();

  const handleAssign = async (assigned: string[], record: Manager) => {
    return updateManager({ ...record, ecosystems: assigned }).then(res => {
      if (res.success) {
        location.reload();
      }

      return res;
    });
  };

  return (
    <Section
      title="Managers"
      summary="You can manage the managers listed below"
    >
      <ManagerListViewWidget
        dataSource={managers}
        metadata={{ ecosystems }}
        onAssign={handleAssign}
      />
    </Section>
  );
}

export { loader };
export default SettingsHomepage;
