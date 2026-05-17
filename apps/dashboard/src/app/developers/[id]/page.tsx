import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DeveloperDetailClient from "./DeveloperDetailClient";
import { api } from "@/lib/api/client";
import { getUser } from "~/auth/repository";
import DefaultLayoutWrapper from "../../DefaultLayoutWrapper";

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

    if (res.success && res.data) {
      const developerHandle = `@${res.data.username}`;

      return {
        title: `${developerHandle} - Developer Profile`,
        description: `Developer profile and contribution analytics for ${developerHandle}. Track ecosystem contributions and activity.`,
      };
    }

    return {
      title: "Developer Profile",
      description: "Web3 developer profile and analytics",
    };
  } catch (_error) {
    return {
      title: "Developer Profile",
      description: "Web3 developer profile and analytics",
    };
  }
}

export default async function DeveloperDetailPage({
  params,
}: DeveloperPageProps) {
  const resolvedParams = await params;
  const developerId = resolvedParams.id;
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
