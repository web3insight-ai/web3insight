import { redirect } from 'next/navigation';
import ProfileActivityPageClient from './ProfileActivityPageClient';
import { getUser } from "~/auth/repository";
import DefaultLayoutWrapper from '../../DefaultLayoutWrapper';

export default async function ProfileActivityPage() {
  // Get user data
  const user = await getUser(new Request('http://localhost:3000'));

  if (!user) {
    redirect("/");
  }

  const pageData = { user };

  return (
    <DefaultLayoutWrapper user={user}>
      <ProfileActivityPageClient {...pageData} />
    </DefaultLayoutWrapper>
  );
}
