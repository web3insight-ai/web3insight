import { redirect } from 'next/navigation';
import ProfileActivityPageClient from './ProfileActivityPageClient';
import { getUser } from "~/auth/repository";
import DefaultLayoutWrapper from '../../DefaultLayoutWrapper';
import { headers } from 'next/headers';

export default async function ProfileActivityPage() {
  // Get user data
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const url = `${protocol}://${host}`;
  
  const user = await getUser(new Request(url));

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
