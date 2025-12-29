import type { Metadata } from "next";
import { redirect } from "next/navigation";
import ProfilePageClient from "./ProfilePageClient";
import { getTitle } from "@/utils/app";
import { fetchCurrentUser } from "~/auth/repository";
import DefaultLayoutWrapper from "../DefaultLayoutWrapper";

export const metadata: Metadata = {
  title: `My Profile | ${getTitle()}`,
  description: `Manage your ${getTitle()} profile`,
};

export default async function ProfilePage() {
  // Get user data with proper error handling
  const userResult = await fetchCurrentUser();

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
