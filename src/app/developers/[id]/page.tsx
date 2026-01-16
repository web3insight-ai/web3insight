import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import DeveloperDetailClient from "./DeveloperDetailClient";
import { getTitle } from "@/utils/app";
import { api } from "@/lib/api/client";
import { getUser } from "~/auth/repository";
import DefaultLayoutWrapper from "../../DefaultLayoutWrapper";
import { env } from "@/env";

interface DeveloperPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({
  params,
}: DeveloperPageProps): Promise<Metadata> {
  try {
    const resolvedParams = await params;
    const res = await api.developers.getOne(resolvedParams.id);
    const baseTitle = `Developer Profile - ${getTitle()}`;

    if (res.success && res.data) {
      const developerHandle = `@${res.data.username}`;
      const title = `${developerHandle} ${baseTitle}`;

      return {
        title,
        openGraph: {
          title,
        },
        description: `Developer profile and contribution analytics for ${developerHandle}. Track ecosystem contributions and activity.`,
      };
    }

    return {
      title: baseTitle,
      description: "Web3 developer profile and analytics",
    };
  } catch (_error) {
    return {
      title: `Developer Profile - ${getTitle()}`,
      description: "Web3 developer profile and analytics",
    };
  }
}

export default async function DeveloperDetailPage({
  params,
}: DeveloperPageProps) {
  const resolvedParams = await params;
  const developerId = resolvedParams.id;

  // Get current user from session
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = env.NODE_ENV === "development" ? "http" : "https";
  const url = `${protocol}://${host}/developers/${developerId}`;

  const _request = new Request(url, {
    headers: Object.fromEntries(headersList.entries()),
  });
  const user = await getUser();

  try {
    // Start developer fetch - this is the primary dependency
    const res = await api.developers.getOne(developerId);

    if (!res.success || !res.data) {
      if (res.code === "404") {
        notFound();
      }
      // Return page with null developer if fetch failed
      return (
        <DefaultLayoutWrapper user={user}>
          <DeveloperDetailClient
            developer={null}
            contributions={[]}
            repositories={[]}
            recentActivity={[]}
            ecosystems={null}
          />
        </DefaultLayoutWrapper>
      );
    }

    const developer = res.data;

    // Now fetch all dependent data in parallel (eliminates waterfall)
    const [contributionsRes, repositoriesRes, activityRes, ecosystemsRes] =
      await Promise.all([
        api.developers.getContributionList(developer.id),
        api.developers.getRepositoryRankList(developer.username),
        api.developers.getActivityList(developer.username),
        api.developers.getEcosystems(developer.id),
      ]);

    const pageData = {
      developer,
      contributions: contributionsRes.data || [],
      repositories: repositoriesRes.data || [],
      recentActivity: activityRes.data || [],
      ecosystems: ecosystemsRes.data || null,
    };

    return (
      <DefaultLayoutWrapper user={user}>
        <DeveloperDetailClient {...pageData} />
      </DefaultLayoutWrapper>
    );
  } catch (error) {
    console.error("Error in developer detail route:", error);
    notFound();
  }
}
