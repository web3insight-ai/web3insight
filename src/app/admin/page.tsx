import { notFound } from "next/navigation";
import AdminPageClient from "./AdminPageClient";
import { fetchCurrentUser } from "~/auth/repository";
import { canManageEcosystems } from "~/auth/helper";
import { api } from "@/lib/api/client";

export const metadata = {
  title: "Admin Panel | Web3Insight",
  description: "Manage Web3 ecosystems and view analytics",
};

export default async function AdminHomePage() {
  const res = await fetchCurrentUser();

  if (!canManageEcosystems(res.data)) {
    notFound();
  }

  const rankResult = await api.ecosystems.getRankList();
  const ecosystems =
    rankResult.success && rankResult.data ? rankResult.data.list : [];

  return <AdminPageClient ecosystems={ecosystems} />;
}
