import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import RepositoryDetailClient from './RepositoryDetailClient';
import { getTitle } from "@/utils/app";
import { fetchRepoRankList } from "~/api/repository";
import { fetchRepoByName } from "~/github/repository";
import { fetchRepoAnalysis } from "~/ecosystem/repository/legacy";
import type { RepoRankRecord } from "~/api/typing";
import DefaultLayoutWrapper from '../../DefaultLayoutWrapper';

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
  const repoNameFromQuery = resolvedSearchParams.name;

  if (!repoId) {
    notFound();
  }

  let repoName: string;
  let repoRankData: RepoRankRecord | null = null;

  try {
    // If repo name is provided in query params, use it directly
    if (repoNameFromQuery) {
      repoName = repoNameFromQuery;
      // Create a minimal rank data object for consistency
      repoRankData = {
        repo_id: parseInt(repoId),
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

      repoRankData = rankListRes.data.list.find(repo => repo.repo_id === parseInt(repoId)) || null;

      if (!repoRankData) {
        notFound();
      }

      repoName = repoRankData.repo_name;
    }

    try {
      const [repoDetailsRes, analysisRes] = await Promise.all([
        fetchRepoByName(repoName),
        fetchRepoAnalysis(repoName),
      ]);

      // Debug logging
      console.log(`[DEBUG] Repository analysis for ${repoName}:`, {
        analysisSuccess: analysisRes.success,
        analysisData: analysisRes.data,
        hasOpenrank: !!(analysisRes.data?.openrank && Object.keys(analysisRes.data.openrank).length > 0),
        hasAttention: !!(analysisRes.data?.attention && Object.keys(analysisRes.data.attention).length > 0),
        hasParticipants: !!(analysisRes.data?.participants && Object.keys(analysisRes.data.participants).length > 0),
      });

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
          details: githubRepo as any, // Pass the entire GitHub repo object as details
        };
      }

      const pageData = {
        repository: repositoryData,
        analysis: analysisRes.success ? analysisRes.data : null,
      };

      return (
        <DefaultLayoutWrapper user={null}>
          <RepositoryDetailClient {...pageData} />
        </DefaultLayoutWrapper>
      );
    } catch (error) {
      console.error(`[Route] Error fetching repository details:`, error);
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
        analysis: null,
      };

      return (
        <DefaultLayoutWrapper user={null}>
          <RepositoryDetailClient {...pageData} />
        </DefaultLayoutWrapper>
      );
    }
  } catch (error) {
    console.error("Error in repository detail route:", error);
    notFound();
  }
}
