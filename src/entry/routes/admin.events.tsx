import { type LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { fetchCurrentUser } from "~/auth/repository";
import EventListViewWidget from "~/event/views/event-list";

import Section from "../components/section";

async function loader({ request }: LoaderFunctionArgs) {
  const res = await fetchCurrentUser(request);

  return json({ manager: res.data });
}

function AdminEventPage() {
  const { manager } = useLoaderData<typeof loader>();

  return (
    <Section
      className="h-full"
      title="Events"
      summary="Manage events"
      contentHeightFixed
    >
      <EventListViewWidget managerId={manager.documentId} />
    </Section>
  );
}

export { loader };
export default AdminEventPage;
