import { notFound } from "next/navigation";

import { fetchCurrentUser } from "~/auth/repository";
import { canManageEvents } from "~/auth/helper";
import type { ApiUser } from "~/auth/typing";
import EventListViewWidget from "~/event/views/event-list";

export const metadata = {
  title: "Events Manager | Admin Panel",
  description: "Manage Web3 events and view analytics",
};

async function getEventsData() {
  const res = await fetchCurrentUser();

  if (!canManageEvents(res.data)) {
    notFound();
  }

  return { manager: res.data };
}

function AdminEventListPageContent({ manager }: { manager: ApiUser | null }) {
  if (!manager) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500 dark:text-gray-400">
          Unable to load manager information.
        </p>
      </div>
    );
  }

  return <EventListViewWidget />;
}

export default async function AdminEventListPage() {
  const { manager } = await getEventsData();

  return <AdminEventListPageContent manager={manager} />;
}
