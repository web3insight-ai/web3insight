import { useLoaderData } from "@remix-run/react";

import { fetchManagerList } from "~/user/repository";
import ManagerListViewWidget from "~/user/views/manager-list";

import Section from "../components/section";

async function loader() {
  const { data } = await fetchManagerList();
   
  return {
    managers: data,
  };
}

function SettingsHomepage() {
  const { managers } = useLoaderData<typeof loader>();

  return (
    <Section
      title="Managers"
      summary="You can manage the managers listed below"
    >
      <ManagerListViewWidget dataSource={managers} />
    </Section>
  );
}

export { loader };
export default SettingsHomepage;
