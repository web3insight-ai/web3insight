import { notFound } from "next/navigation";

import { fetchCurrentUser } from "~/auth/repository";
import { canManageEcosystems } from "~/auth/helper";
import { api } from "@/lib/api/client";
import AdminEcosystemsClient from "./AdminEcosystemsClient";

export const metadata = {
  title: "Ecosystem Manager | Admin Panel",
  description: "Manage Web3 ecosystems and view analytics",
  openGraph: {
    title: "Ecosystem Manager | Admin Panel",
  },
};

async function getEcosystemsData() {
  const res = await fetchCurrentUser();

  if (!canManageEcosystems(res.data)) {
    notFound();
  }

  try {
    const rankResult = await api.ecosystems.getRankList();
    const ecosystems =
      rankResult.success && rankResult.data ? rankResult.data.list : [];

    if (!rankResult.success) {
      console.warn(
        "Admin ecosystems: Ecosystem rank fetch failed:",
        rankResult.message,
      );
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
