import type { Metadata } from 'next';
import DevInsightPageClient from './DevInsightPageClient';
import { fetchCurrentUser } from "~/auth/repository";
import { getGitHubHandle } from "~/profile-analysis/helper";
import { getTitle } from "@/utils/app";
import DefaultLayoutWrapper from '../DefaultLayoutWrapper';
import { cookies } from 'next/headers';

export async function generateMetadata(): Promise<Metadata> {
  const title = getTitle();

  try {
    const cookieStore = await cookies();
    const mockRequest = new Request('http://localhost:3000/devinsight', {
      headers: {
        Cookie: cookieStore.toString(),
      },
    });

    const userResult = await fetchCurrentUser(mockRequest);

    if (userResult.success && userResult.data) {
      const githubHandle = getGitHubHandle(userResult.data);
      if (githubHandle) {
        return {
          title: `${githubHandle} DevInsight | ${title}`,
          description: `AI-powered DevInsight analysis of ${githubHandle}'s Web3 development profile`,
        };
      }
    }
  } catch (error) {
    console.error('Error generating metadata:', error);
  }

  // Fallback metadata
  return {
    title: "DevInsight | Web3 Insights",
    description: "AI-powered DevInsight analysis of your Web3 development profile",
  };
}

export default async function DevInsightPage() {
  try {
    // Create a mock Request object with cookies for authentication
    const cookieStore = await cookies();
    const mockRequest = new Request('http://localhost:3000/devinsight', {
      headers: {
        Cookie: cookieStore.toString(),
      },
    });

    // Get authenticated user data - required for DevInsight
    const userResult = await fetchCurrentUser(mockRequest);

    // If not authenticated, return null user to trigger login modal
    if (!userResult.success || !userResult.data) {
      const pageData = {
        requiresAuth: true,
      };

      return (
        <DefaultLayoutWrapper user={null}>
          <DevInsightPageClient {...pageData} />
        </DefaultLayoutWrapper>
      );
    }

    const user = userResult.data;

    // Get GitHub handle from authenticated user
    const githubHandle = getGitHubHandle(user);

    if (!githubHandle) {
      const pageData = {
        requiresAuth: false,
        error: "GitHub account must be connected to use DevInsight",
      };

      return (
        <DefaultLayoutWrapper user={user}>
          <DevInsightPageClient {...pageData} />
        </DefaultLayoutWrapper>
      );
    }

    // Validate GitHub handle format (alphanumeric, hyphens, underscores)
    if (!/^[a-zA-Z0-9_-]+$/.test(githubHandle)) {
      const pageData = {
        requiresAuth: false,
        error: "Invalid GitHub handle format",
      };

      return (
        <DefaultLayoutWrapper user={user}>
          <DevInsightPageClient {...pageData} />
        </DefaultLayoutWrapper>
      );
    }

    // User is authenticated and has valid GitHub handle - show the actual DevInsight content
    const pageData = {
      requiresAuth: false,
      user: user,
      githubHandle: githubHandle,
    };

    return (
      <DefaultLayoutWrapper user={user}>
        <DevInsightPageClient {...pageData} />
      </DefaultLayoutWrapper>
    );
  } catch (error) {
    console.error("Error in devinsight route:", error);

    const fallbackData = {
      requiresAuth: true,
      error: "Failed to load DevInsight",
    };

    return (
      <DefaultLayoutWrapper user={null}>
        <DevInsightPageClient {...fallbackData} />
      </DefaultLayoutWrapper>
    );
  }
}
