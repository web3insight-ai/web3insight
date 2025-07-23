import { type LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { fetchCurrentUser } from "~/auth/repository";
import EventListViewWidget from "~/event/views/event-list";

async function loader({ request }: LoaderFunctionArgs) {
  const res = await fetchCurrentUser(request);

  return json({ manager: res.data });
}

function AdminEventListPage() {
  const { manager } = useLoaderData<typeof loader>();

  if (!manager) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500 dark:text-gray-400">Unable to load manager information.</p>
      </div>
    );
  }

  return <EventListViewWidget managerId={manager.id} />;
}

export { loader };
export default AdminEventListPage;
