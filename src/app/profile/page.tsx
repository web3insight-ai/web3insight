import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import ProfilePageClient from './ProfilePageClient';
import { getTitle } from "@/utils/app";
import { fetchCurrentUser } from "~/auth/repository";
import DefaultLayoutWrapper from '../DefaultLayoutWrapper';
import { headers } from 'next/headers';

export const metadata: Metadata = {
  title: `My Profile | ${getTitle()}`,
  description: `Manage your ${getTitle()} profile`,
};

export default async function ProfilePage() {
  // Get user data with proper error handling
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const url = `${protocol}://${host}/profile`;
  
  const userResult = await fetchCurrentUser(new Request(url));

  // Handle expired token (401)
  if (!userResult.success && userResult.code === "401") {
    const pageData = {
      user: null,
      error: userResult.message,
      expired: true,
    };

    return (
      <DefaultLayoutWrapper user={null}>
        <ProfilePageClient {...pageData} />
      </DefaultLayoutWrapper>
    );
  }

  // Handle no user (redirect to home)
  if (!userResult.data) {
    redirect("/");
  }

  const pageData = {
    user: userResult.data,
    error: null,
    expired: false,
  };

  return (
    <DefaultLayoutWrapper user={userResult.data}>
      <ProfilePageClient {...pageData} />
    </DefaultLayoutWrapper>
  );
}
