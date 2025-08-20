import { notFound } from 'next/navigation';
import { headers } from 'next/headers';

import { fetchCurrentUser } from "~/auth/repository";
import { canManageEcosystems } from "~/auth/helper";
import { getPageSize } from "~/ecosystem/helper";
import { fetchManageableList, fetchManageableRepositoryList } from "~/ecosystem/repository";
import AdminEcosystemDetailClient from './AdminEcosystemDetailClient';

interface AdminEcosystemDetailPageProps {
  params: Promise<{
    name: string;
  }>;
}

export async function generateMetadata({ params }: AdminEcosystemDetailPageProps) {
  const resolvedParams = await params;
  const name = decodeURIComponent(resolvedParams.name);
  return {
    title: `${name} Ecosystem | Admin Panel`,
    description: `Manage and mark repositories within the ${name} ecosystem`,
  };
}

async function getEcosystemDetailData(name: string) {
  const headersList = await headers();
  const host = headersList.get('host') || 'localhost:3000';
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  const url = `${protocol}://${host}/admin/ecosystems/${name}`;

  const request = new Request(url, {
    headers: Object.fromEntries(headersList.entries()),
  });

  const res = await fetchCurrentUser(request);

  if (!canManageEcosystems(res.data)) {
    notFound();
  }

  const { data: ecosystems } = await fetchManageableList(res.data.id);

  if (!ecosystems.find(eco => eco.name === name)) {
    notFound();
  }

  const pageSize = getPageSize();
  const { data, extra } = await fetchManageableRepositoryList({ eco: name, pageSize });

  return {
    ecosystem: { name, repositories: data },
    pagination: {
      total: extra?.total as number || 0,
      pageNum: 1,
      pageSize,
    },
  };
}

export default async function AdminEcosystemDetailPage({ params }: AdminEcosystemDetailPageProps) {
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
