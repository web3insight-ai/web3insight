import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { Warehouse } from "lucide-react";

import { fetchCurrentUser } from "~/auth/repository";
import { canManageEcosystems } from "~/auth/helper";
import { fetchStatisticsRank } from "~/statistics/repository";
import EcosystemManagementTable from "~/ecosystem/widgets/EcosystemManagementTable";

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

  return (
    <div className="min-h-dvh bg-background dark:bg-background-dark pb-24">
      <div className="w-full max-w-content mx-auto px-6 pt-8">
        {/* Header and Overview */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Warehouse size={20} className="text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Ecosystems</h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl">
            You can manage the ecosystems listed below
          </p>
        </div>

        {/* Ecosystems Management Table */}
        <EcosystemManagementTable
          ecosystems={ecosystems}
        />
      </div>
    </div>
  );
}
