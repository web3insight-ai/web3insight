import { NextResponse } from "next/server";
import { getSession } from "~/auth/helper/server";
import { fetchCurrentUser } from "~/auth/repository";

const GITHUB_API_BASE = "https://api.github.com";

interface GitHubRepoResponse {
  id: number;
  full_name: string;
  description: string | null;
  html_url: string;
  owner: {
    login: string;
    avatar_url: string;
  };
  stargazers_count: number;
}

interface DonationConfig {
  payTo?: string;
  defaultAmount?: string | number;
  title?: string;
  description?: string;
  creator?: {
    handle?: string;
    avatar?: string;
  };
  links?: Array<{
    url: string;
    label: string;
  }>;
}

/**
 * POST /api/donate/repos/check
 * Check a repository and its donation.json without writing to database
 * Returns repo info and donation config if found
 */
export async function POST(request: Request) {
  try {
    // Verify user is authenticated
    const userResult = await fetchCurrentUser();

    if (!userResult.success || !userResult.data) {
      return NextResponse.json(
        {
          success: false,
          code: "UNAUTHORIZED",
          message: "Authentication required",
          data: null,
        },
        { status: 401 },
      );
    }

    // Get user token from session for GitHub API
    const session = await getSession();
    const githubToken = session.get("githubAccessToken") as string | undefined;

    // Parse request body
    const body = await request.json();
    const { repo_full_name } = body;

    if (!repo_full_name) {
      return NextResponse.json(
        {
          success: false,
          code: "INVALID_REQUEST",
          message: "repo_full_name is required",
          data: null,
        },
        { status: 400 },
      );
    }

    // Validate repo name format (owner/repo)
    const repoNameRegex = /^[\w.-]+\/[\w.-]+$/;
    if (!repoNameRegex.test(repo_full_name)) {
      return NextResponse.json(
        {
          success: false,
          code: "INVALID_REQUEST",
          message: "Invalid repository format. Expected: owner/repo",
          data: null,
        },
        { status: 400 },
      );
    }

    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "Web3Insight",
    };

    if (githubToken) {
      headers.Authorization = `Bearer ${githubToken}`;
    }

    // Fetch repo info from GitHub
    const repoResponse = await fetch(
      `${GITHUB_API_BASE}/repos/${repo_full_name}`,
      { headers },
    );

    if (!repoResponse.ok) {
      if (repoResponse.status === 404) {
        return NextResponse.json(
          {
            success: false,
            code: "NOT_FOUND",
            message: "Repository not found",
            data: null,
          },
          { status: 404 },
        );
      }
      throw new Error(`GitHub API error: ${repoResponse.status}`);
    }

    const repoData: GitHubRepoResponse = await repoResponse.json();

    // Try to fetch .x402/donation.json
    let donationConfig: DonationConfig | null = null;

    try {
      const donationResponse = await fetch(
        `${GITHUB_API_BASE}/repos/${repo_full_name}/contents/.x402/donation.json`,
        { headers },
      );

      if (donationResponse.ok) {
        const fileData = await donationResponse.json();
        if (fileData.content) {
          const content = Buffer.from(fileData.content, "base64").toString(
            "utf-8",
          );
          donationConfig = JSON.parse(content);
        }
      }
    } catch {
      // donation.json not found or invalid, continue without it
    }

    // Return repo info and donation config (if found)
    return NextResponse.json({
      success: true,
      code: "OK",
      message: "Repository checked successfully",
      data: {
        repo_id: repoData.id,
        repo_info: {
          id: repoData.id,
          full_name: repoData.full_name,
          description: repoData.description,
          html_url: repoData.html_url,
          owner: {
            login: repoData.owner.login,
            avatar_url: repoData.owner.avatar_url,
          },
          stargazers_count: repoData.stargazers_count,
        },
        repo_donate_data: donationConfig,
      },
    });
  } catch (error) {
    console.error("[API] Check donate repo error:", error);
    return NextResponse.json(
      {
        success: false,
        code: "API_ERROR",
        message: error instanceof Error ? error.message : "Unknown error",
        data: null,
      },
      { status: 500 },
    );
  }
}
