import { notFound } from 'next/navigation';
import AdminPageClient from './AdminPageClient';
import { fetchCurrentUser } from "~/auth/repository";
import { canManageEcosystems } from "~/auth/helper";
import { fetchManageableEcosystemsWithStats } from "~/ecosystem/repository";
import DefaultLayoutWrapper from '../DefaultLayoutWrapper';

export default async function AdminHomePage() {
  const res = await fetchCurrentUser(new Request('http://localhost:3000'));

  if (!canManageEcosystems(res.data)) {
    notFound();
  }

  const { data: ecosystems } = await fetchManageableEcosystemsWithStats();

  const pageData = {
    ecosystems,
  };

  return (
    <DefaultLayoutWrapper user={res.data}>
      <AdminPageClient {...pageData} />
    </DefaultLayoutWrapper>
  );
}
