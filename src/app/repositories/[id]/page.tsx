import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import RepositoryDetailClient from './RepositoryDetailClient';
import { getTitle } from "@/utils/app";
import { fetchRepoRankList, fetchRepoActiveDeveloperList } from "~/api/repository";
import { fetchRepoByName } from "~/github/repository";
import { getUser } from "~/auth/repository";
import { 
  fetchRepoOpenrank, 
  fetchRepoAttention, 
  fetchRepoParticipants, 
  fetchRepoNewContributors, 
} from "~/opendigger/repository";
import type { RepoRankRecord } from "~/api/typing";
import DefaultLayoutWrapper from '../../DefaultLayoutWrapper';
import { env } from "@/env";

interface RepositoryPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    name?: string;
  }>;
}

export async function generateMetadata({ params, searchParams }: RepositoryPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const repoId = resolvedParams.id;
  let repoName = "Unknown";

  try {
    if (resolvedSearchParams.name) {
      repoName = resolvedSearchParams.name;
    } else {
      // Try to fetch from rank list to get the name
      const rankListRes = await fetchRepoRankList();
      if (rankListRes.success && rankListRes.data) {
        const repoRankData = rankListRes.data.list.find(repo => repo.repo_id === parseInt(repoId));
        if (repoRankData) {
          repoName = repoRankData.repo_name;
        }
      }
    }

    const baseTitle = `Repository Details - ${getTitle()}`;
    const title = `${repoName} - ${baseTitle}`;

    return {
      title,
      openGraph: {
        title,
      },
      description: `Repository analytics and metrics for ${repoName}. Track development activity, contributors, and community engagement.`,
    };
  } catch (error) {
    return {
      title: `Repository Details - ${getTitle()}`,
      description: "Web3 repository analytics and metrics",
    };
  }
}

export default async function RepositoryDetailPage({ params, searchParams }: RepositoryPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const repoId = resolvedParams.id;
  const repoNumericId = Number.parseInt(repoId, 10);
  const repoNameFromQuery = resolvedSearchParams.name;

  if (!repoId) {
    notFound();
  }

  if (Number.isNaN(repoNumericId)) {
    notFound();
  }

  // Get current user from session
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = env.NODE_ENV === "development" ? "http" : "https";
  const url = `${protocol}://${host}/repositories/${repoId}`;

  const request = new Request(url, {
    headers: Object.fromEntries(headersList.entries()),
  });
  const user = await getUser(request);

  // Helper function to fetch OpenDigger data
  async function fetchOpenDiggerData(repoName: string) {
    try {
      const [openrankRes, attentionRes, participantsRes, newContributorsRes] = await Promise.all([
        fetchRepoOpenrank(repoName).catch(() => ({ success: false, data: {} })),
        fetchRepoAttention(repoName).catch(() => ({ success: false, data: {} })),
        fetchRepoParticipants(repoName).catch(() => ({ success: false, data: {} })),
        fetchRepoNewContributors(repoName).catch(() => ({ success: false, data: {} })),
      ]);

      return {
        openrank: openrankRes.success ? openrankRes.data : {},
        attention: attentionRes.success ? attentionRes.data : {},
        participants: participantsRes.success ? participantsRes.data : {},
        newContributors: newContributorsRes.success ? newContributorsRes.data : {},
      };
    } catch (error) {
      console.error('Error fetching OpenDigger data:', error);
      return {
        openrank: {},
        attention: {},
        participants: {},
        newContributors: {},
      };
    }
  }

  async function fetchActiveDeveloperData(repoId: number) {
    try {
      const response = await fetchRepoActiveDeveloperList(repoId);
      if (response.success && response.data?.list) {
        return response.data.list;
      }
      return [];
    } catch (error) {
      console.error('Error fetching active developer data:', error);
      return [];
    }
  }

  let repoName: string;
  let repoRankData: RepoRankRecord | null = null;

  try {
    // If repo name is provided in query params, use it directly
    if (repoNameFromQuery) {
      repoName = repoNameFromQuery;
      // Create a minimal rank data object for consistency
      repoRankData = {
        repo_id: repoNumericId,
        repo_name: repoName,
        star_count: 0,
        forks_count: 0,
        open_issues_count: 0,
        contributor_count: 0,
      };
    } else {
      // Otherwise, try to fetch from rank list
      const rankListRes = await fetchRepoRankList();

      if (!rankListRes.success || !rankListRes.data) {
        throw new Error("Failed to fetch repository data");
      }

      repoRankData = rankListRes.data.list.find(repo => repo.repo_id === repoNumericId) || null;

      if (!repoRankData) {
        notFound();
      }

      repoName = repoRankData.repo_name;
    }

    try {
      const [repoDetailsRes, opendiggerData, activeDevelopers] = await Promise.all([
        fetchRepoByName(repoName),
        fetchOpenDiggerData(repoName),
        fetchActiveDeveloperData(repoNumericId),
      ]);

      // Use GitHub API data as primary source for repository metrics
      let repositoryData = {
        id: repoRankData!.repo_id,
        name: repoName,
        starCount: repoRankData!.star_count,
        forksCount: repoRankData!.forks_count,
        openIssuesCount: repoRankData!.open_issues_count,
        contributorCount: 0, // Not displayed in UI
        details: null,
      };

      // If GitHub API call succeeded, use its data for metrics and details
      if (repoDetailsRes.success && repoDetailsRes.data) {
        const githubRepo = repoDetailsRes.data;
        repositoryData = {
          id: githubRepo.id,
          name: githubRepo.full_name,
          starCount: githubRepo.stargazers_count,
          forksCount: githubRepo.forks_count,
          openIssuesCount: githubRepo.open_issues_count,
          contributorCount: 0, // Not displayed in UI
          details: githubRepo as Record<string, unknown>, // Pass the entire GitHub repo object as details
        };
      }

      const pageData = {
        repository: repositoryData,
        analysis: {
          ...opendiggerData,
          activeDevelopers,
        },
      };

      return (
        <DefaultLayoutWrapper user={user}>
          <RepositoryDetailClient {...pageData} />
        </DefaultLayoutWrapper>
      );
    } catch (error) {
      console.error(`[Route] Error fetching repository details:`, error);
      // Try to fetch OpenDigger data even if GitHub API fails
      const [opendiggerData, activeDevelopers] = await Promise.all([
        fetchOpenDiggerData(repoName),
        fetchActiveDeveloperData(repoNumericId),
      ]);
      
      // Return basic data even if detailed fetches fail
      const pageData = {
        repository: {
          id: repoRankData!.repo_id,
          name: repoName,
          starCount: repoRankData!.star_count,
          forksCount: repoRankData!.forks_count,
          openIssuesCount: repoRankData!.open_issues_count,
          contributorCount: 0, // Not displayed in UI
          details: null,
        },
        analysis: {
          ...opendiggerData,
          activeDevelopers,
        },
      };

      return (
        <DefaultLayoutWrapper user={user}>
          <RepositoryDetailClient {...pageData} />
        </DefaultLayoutWrapper>
      );
    }
  } catch (error) {
    console.error("Error in repository detail route:", error);
    notFound();
  }
}
