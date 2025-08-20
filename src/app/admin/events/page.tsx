import { notFound } from 'next/navigation';
import { headers } from 'next/headers';

import { fetchCurrentUser } from "~/auth/repository";
import { canManageEvents } from "~/auth/helper";
import EventListViewWidget from "~/event/views/event-list";

export const metadata = {
  title: 'Events Manager | Admin Panel',
  description: 'Manage Web3 events and view analytics',
};

async function getEventsData() {
  const headersList = await headers();
  const host = headersList.get('host') || 'localhost:3000';
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  const url = `${protocol}://${host}/admin/events`;

  const request = new Request(url, {
    headers: Object.fromEntries(headersList.entries()),
  });

  const res = await fetchCurrentUser(request);

  if (!canManageEvents(res.data)) {
    notFound();
  }

  return { manager: res.data };
}

function AdminEventListPageContent({ manager }: { manager: Record<string, unknown> }) {
  if (!manager) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500 dark:text-gray-400">Unable to load manager information.</p>
      </div>
    );
  }

  return <EventListViewWidget />;
}

export default async function AdminEventListPage() {
  const { manager } = await getEventsData();

  return <AdminEventListPageContent manager={manager} />;
}
