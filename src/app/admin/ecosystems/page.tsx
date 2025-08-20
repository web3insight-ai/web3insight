import { notFound } from 'next/navigation';
import { headers } from 'next/headers';

import { fetchCurrentUser } from "~/auth/repository";
import { canManageEcosystems } from "~/auth/helper";
import { fetchStatisticsRank } from "~/statistics/repository";
import AdminEcosystemsClient from './AdminEcosystemsClient';

export const metadata = {
  title: 'Ecosystem Manager | Admin Panel',
  description: 'Manage Web3 ecosystems and view analytics',
  openGraph: {
    title: 'Ecosystem Manager | Admin Panel',
  },
};

async function getEcosystemsData() {
  const headersList = await headers();
  const host = headersList.get('host') || 'localhost:3000';
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  const url = `${protocol}://${host}/admin/ecosystems`;

  const request = new Request(url, {
    headers: Object.fromEntries(headersList.entries()),
  });

  const res = await fetchCurrentUser(request);

  if (!canManageEcosystems(res.data)) {
    notFound();
  }

  try {
    const rankResult = await fetchStatisticsRank();
    const ecosystems = rankResult.success ? rankResult.data.ecosystem : [];

    if (!rankResult.success) {
      console.warn("Admin ecosystems: Statistics rank fetch failed:", rankResult.message);
    }

    return {
      ecosystems,
    };
  } catch (error) {
    console.error("Loader error in admin ecosystems route:", error);

    return {
      ecosystems: [],
    };
  }
}

export default async function AdminEcosystemsPage() {
  const { ecosystems } = await getEcosystemsData();

  return <AdminEcosystemsClient ecosystems={ecosystems} />;
}
