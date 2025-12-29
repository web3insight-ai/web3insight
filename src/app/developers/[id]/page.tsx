import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import DeveloperDetailClient from "./DeveloperDetailClient";
import { getTitle } from "@/utils/app";
import { api } from "@/lib/api/client";
import type { Repository } from "~/repository/typing";
import type {
  DeveloperActivity,
  DeveloperContribution,
  DeveloperEcosystems,
} from "~/developer/typing";
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
    const res = await api.developers.getOne(developerId);

    let contributions: DeveloperContribution[] = [];
    let repositories: Repository[] = [];
    let recentActivity: DeveloperActivity[] = [];
    let ecosystems: DeveloperEcosystems | null = null;

    if (res.success && res.data) {
      try {
        const responses = await Promise.all([
          api.developers.getContributionList(res.data.id),
          api.developers.getRepositoryRankList(res.data.username),
          api.developers.getActivityList(res.data.username),
          api.developers.getEcosystems(res.data.id),
        ]);

        contributions = responses[0].data || [];
        repositories = responses[1].data || [];
        recentActivity = responses[2].data || [];
        ecosystems = responses[3].data || null;
      } catch (error) {
        console.error(`[Route] Error during API calls:`, error);
        // Continue with empty data rather than throwing
      }
    } else if (res.code === "404") {
      notFound();
    }

    const pageData = {
      developer: res.data,
      contributions,
      repositories,
      recentActivity,
      ecosystems,
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
