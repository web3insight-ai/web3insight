import { json, MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Warehouse } from "lucide-react";
import type { LoaderFunctionArgs } from "@remix-run/node";

import { fetchCurrentUser } from "~/auth/repository";
import { canManageEcosystems } from "~/auth/helper";
import { fetchStatisticsRank } from "~/statistics/repository";
import EcosystemManagementTable from "~/ecosystem/widgets/EcosystemManagementTable";

export const meta: MetaFunction = () => {
  return [
    { title: "Ecosystem Manager | Admin Panel" },
    { property: "og:title", content: "Ecosystem Manager | Admin Panel" },
    { name: "description", content: "Manage Web3 ecosystems and view analytics" },
  ];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const res = await fetchCurrentUser(request);
  
  if (!canManageEcosystems(res.data)) {
    throw new Response(null, { status: 404, statusText: "Not Found" });
  }

  try {
    const rankResult = await fetchStatisticsRank();
    const ecosystems = rankResult.success ? rankResult.data.ecosystem : [];

    if (!rankResult.success) {
      console.warn("Admin ecosystems: Statistics rank fetch failed:", rankResult.message);
    }

    return json({
      ecosystems,
    });
  } catch (error) {
    console.error("Loader error in admin ecosystems route:", error);

    return json({
      ecosystems: [],
    });
  }
};

export default function AdminEcosystemsPage() {
  const { ecosystems } = useLoaderData<typeof loader>();

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
