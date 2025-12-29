import { notFound } from "next/navigation";
import { headers } from "next/headers";

import { fetchCurrentUser } from "~/auth/repository";
import { canManageEcosystems } from "~/auth/helper";
import { getPageSize } from "~/ecosystem/helper";
import { api } from "@/lib/api/client";
import type { EcoRepo } from "@/lib/api/types";
import type { Repository } from "~/repository/typing";
import AdminEcosystemDetailClient from "./AdminEcosystemDetailClient";

interface AdminEcosystemDetailPageProps {
  params: Promise<{
    name: string;
  }>;
}

export async function generateMetadata({
  params,
}: AdminEcosystemDetailPageProps) {
  const resolvedParams = await params;
  const name = decodeURIComponent(resolvedParams.name);
  return {
    title: `${name} Ecosystem | Admin Panel`,
    description: `Manage and mark repositories within the ${name} ecosystem`,
  };
}

// Helper to transform EcoRepo to Repository type
function transformEcoRepoToRepository(item: EcoRepo, eco: string): Repository {
  const customMarkValue = item.custom_marks[eco];
  // Convert DataValue to number | string | undefined
  const customMark =
    typeof customMarkValue === "number" || typeof customMarkValue === "string"
      ? customMarkValue
      : -1;

  return {
    id: item.repo_id,
    name: item.repo_name,
    fullName: item.repo_name,
    description: "",
    statistics: {
      star: -1,
      fork: -1,
      watch: -1,
      openIssue: -1,
      contributor: -1,
    },
    customMark,
  };
}

async function getEcosystemDetailData(name: string) {
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const url = `${protocol}://${host}/admin/ecosystems/${name}`;

  const _request = new Request(url, {
    headers: Object.fromEntries(headersList.entries()),
  });

  const res = await fetchCurrentUser();

  if (!canManageEcosystems(res.data)) {
    notFound();
  }

  // Fetch ecosystem list to verify access
  const ecosystemResult = await api.ecosystems.getRankList();
  const ecosystems =
    ecosystemResult.success && ecosystemResult.data
      ? ecosystemResult.data.list
      : [];

  if (!ecosystems.find((eco) => eco.eco_name === name)) {
    notFound();
  }

  const pageSize = getPageSize();
  const repoResult = await api.ecosystems.getAdminRepoList({
    eco: name,
    limit: pageSize,
    offset: 0,
  });

  const repositories = repoResult.success
    ? repoResult.data.list.map((item) =>
      transformEcoRepoToRepository(item, name),
    )
    : [];

  const total = repoResult.success ? Number(repoResult.data.total) || 0 : 0;

  return {
    ecosystem: { name, repositories },
    pagination: {
      total,
      pageNum: 1,
      pageSize,
    },
  };
}

export default async function AdminEcosystemDetailPage({
  params,
}: AdminEcosystemDetailPageProps) {
  const resolvedParams = await params;
  const name = decodeURIComponent(resolvedParams.name);
  const { ecosystem, pagination } = await getEcosystemDetailData(name);

  return (
    <AdminEcosystemDetailClient
      ecosystem={ecosystem}
      initialPagination={pagination}
    />
  );
}
