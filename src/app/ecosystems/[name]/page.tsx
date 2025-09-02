import type { Metadata } from 'next';
import EcosystemDetailClient from './EcosystemDetailClient';
import { getTitle } from "@/utils/app";
import { fetchStatistics } from "~/ecosystem/repository";
import DefaultLayoutWrapper from '../../DefaultLayoutWrapper';
import { getUser } from "~/auth/repository";
import { headers } from "next/headers";
import { env } from "@/env";

interface EcosystemPageProps {
  params: Promise<{
    name: string;
  }>;
}

export async function generateMetadata({ params }: EcosystemPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const ecosystemName = decodeURIComponent(resolvedParams.name);
  const baseTitle = `Ecosystem - ${getTitle()}`;
  const title = `${ecosystemName} ${baseTitle}`;

  return {
    title,
    openGraph: {
      title,
    },
    description: `Detailed metrics and analytics for the ${ecosystemName} ecosystem. Track developer activity, contributions, and growth.`,
  };
}

export default async function EcosystemDetailPage({ params }: EcosystemPageProps) {
  const resolvedParams = await params;
  const ecosystemName = decodeURIComponent(resolvedParams.name);

  // Resolve current user from session so navbar shows profile
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = env.NODE_ENV === "development" ? "http" : "https";
  const url = `${protocol}://${host}/ecosystems/${encodeURIComponent(ecosystemName)}`;

  const request = new Request(url, {
    headers: Object.fromEntries(headersList.entries()),
  });
  const user = await getUser(request);

  try {
    const { data: statistics } = await fetchStatistics(ecosystemName);

    const pageData = {
      ecosystem: ecosystemName,
      statistics,
    };

    return (
      <DefaultLayoutWrapper user={user}>
        <EcosystemDetailClient {...pageData} />
      </DefaultLayoutWrapper>
    );
  } catch (error) {
    console.error("Error in ecosystem detail route:", error);

    const fallbackData = {
      ecosystem: ecosystemName,
      statistics: null,
    };

    return (
      <DefaultLayoutWrapper user={user}>
        <EcosystemDetailClient {...fallbackData} />
      </DefaultLayoutWrapper>
    );
  }
}
