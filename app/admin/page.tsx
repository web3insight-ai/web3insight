import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import AdminPageClient from './AdminPageClient';
import { fetchCurrentUser } from "~/auth/repository";
import { canManageEcosystems } from "~/auth/helper";
import { fetchManageableEcosystemsWithStats } from "~/ecosystem/repository";

export const metadata = {
  title: 'Admin Panel | Web3Insight',
  description: 'Manage Web3 ecosystems and view analytics',
};

export default async function AdminHomePage() {
  const headersList = await headers();
  const host = headersList.get('host') || 'localhost:3000';
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  const url = `${protocol}://${host}/admin`;

  const request = new Request(url, {
    headers: Object.fromEntries(headersList.entries()),
  });

  const res = await fetchCurrentUser(request);

  if (!canManageEcosystems(res.data)) {
    notFound();
  }

  const { data: ecosystems } = await fetchManageableEcosystemsWithStats();

  return <AdminPageClient ecosystems={ecosystems} />;
}
