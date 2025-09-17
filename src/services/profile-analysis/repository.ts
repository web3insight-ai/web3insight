
import type {
  ApiResponse,
  AnalysisRequest,
  AnalysisResponse,
  RawAnalysisResult,
  AnalysisResult,
  ProgressCallback,
  BasicDataCallback,
  GitHubUser,
  AnalysisStatus,
} from "./typing";

/**
 * Initiate user analysis for profile intent using authenticated user
 * Uses local API route which handles server-side authentication
 */
async function analyzeUser(
  description: string = "DevInsight profile analysis",
): Promise<ApiResponse<AnalysisResponse>> {
  
  const requestData: AnalysisRequest = {
    request_data: [], // API will derive from user token
    intent: "profile",
    description,
  };

  try {
    
    // Use local API route instead of direct external API call
    const response = await fetch("/api/analysis/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });


    if (!response.ok) {
      await response.text();
      
      return {
        success: false,
        code: `HTTP_${response.status}`,
        message: `HTTP ${response.status}: ${response.statusText}`,
        data: { id: 0, users: { users: [] } },
      };
    }

    // Now the API returns the raw response directly, not wrapped
    const rawResult = await response.json();
    
    // Wrap in our expected format
    const result: ApiResponse<AnalysisResponse> = {
      success: true,
      code: "SUCCESS", 
      message: "Analysis started successfully",
      data: {
        id: rawResult.id,
        users: { users: rawResult.users || [] },
      },
    };
    
    return result;
  } catch (error) {
    
    return {
      success: false,
      code: "API_ERROR",
      message: error instanceof Error ? error.message : "Unknown error",
      data: { id: 0, users: { users: [] } },
    };
  }
}

/**
 * Fetch analysis result by ID with polling capability
 * Uses local API route which handles server-side authentication
 */
async function fetchAnalysisResult(
  analysisId: number,
): Promise<ApiResponse<RawAnalysisResult>> {
  try {
    // Use local API route instead of direct external API call
    const response = await fetch(`/api/analysis/users/${analysisId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Now the API returns the raw response directly, not wrapped
    const rawResult = await response.json() as RawAnalysisResult;
    
    // Wrap in our expected format
    const result: ApiResponse<RawAnalysisResult> = {
      success: true,
      code: "SUCCESS",
      message: "Data retrieved successfully",
      data: rawResult,
    };
    
    return result;
  } catch (error) {
    return {
      success: false,
      code: "API_ERROR", 
      message: error instanceof Error ? error.message : "Unknown error",
      data: {
        id: "0",
        intent: "profile",
        request_data: { urls: [] },
        github: { users: [] },
        data: { users: [] },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        description: "Failed analysis",
        submitter_id: "0",
        public: false,
      } as RawAnalysisResult,
    };
  }
}

function mergeAnalysisUsers(rawResult: Partial<RawAnalysisResult>): GitHubUser[] {
  const githubUsers = rawResult.github?.users ?? [];
  const analyticsUsers = rawResult.data?.users ?? [];

  return githubUsers.map((githubUser) => {
    const analyticsUser = analyticsUsers.find(
      (au) => au.actor_id === githubUser.id.toString(),
    );

    const userWithScores: GitHubUser = {
      ...githubUser,
      ecosystem_scores: analyticsUser?.ecosystem_scores || [],
    } as GitHubUser;

    const aiSection = rawResult.ai;

    if (aiSection && (aiSection.success || aiSection.data)) {
      const aiData = aiSection.data;
      const aiProfile = aiData?.profile;
      const roastReport = aiData?.roastReport;

      if (aiProfile) {
        const totalScore = parseInt(aiProfile.stats?.totalScore || "0", 10);
        const web3Score = Math.min(Math.round((totalScore / 400) * 100), 100);

        let level = "Beginner";
        if (web3Score >= 80) level = "Expert";
        else if (web3Score >= 60) level = "Advanced";
        else if (web3Score >= 30) level = "Intermediate";

        userWithScores.ai = {
          summary: "AI analysis completed successfully.",
          web3_involvement: {
            score: web3Score,
            level,
            evidence: [
              `Total Web3 score: ${totalScore}`,
              `Active in ${analyticsUser?.ecosystem_scores?.length || 0} ecosystems`,
            ],
          },
          skills: [],
          expertise_areas: [],
          recommendation: "Continue developing your Web3 skills across multiple ecosystems.",
          analysis_date: aiSection.timestamp,
          profileCard: {
            bio: aiProfile.bio,
            blog: aiProfile.blog,
            name: aiProfile.name,
            stats: {
              followers: parseInt(aiProfile.stats?.followers || "0", 10),
              following: parseInt(aiProfile.stats?.following || "0", 10),
              totalScore: parseInt(aiProfile.stats?.totalScore || "0", 10),
              publicRepos: parseInt(aiProfile.stats?.publicRepos || "0", 10),
            },
            twitter: aiProfile.twitter,
            location: aiProfile.location,
            username: aiProfile.username,
            avatar_url: aiProfile.avatar_url,
            created_at: aiProfile.created_at,
          },
        };

        if (roastReport) {
          userWithScores.ai.roast_report = {
            title: "AI Analysis Report",
            overall_roast: roastReport.english || roastReport.chinese || "",
            activity_roast: "",
            ecosystem_roast: "",
            technical_roast: "",
            final_verdict: "",
            constructive_sarcasm: [],
            roast_score: {
              spicyLevel: "8",
              truthLevel: "9",
              helpfulLevel: "7",
            },
          };

          userWithScores.ai.roastReport = {
            english: roastReport.english,
            chinese: roastReport.chinese,
          };
        }
      }
    }

    return userWithScores;
  });
}

export function buildAnalysisResultFromRaw(
  rawResult: RawAnalysisResult,
  status: AnalysisStatus = "completed",
  fallbackAnalysisId?: number,
): AnalysisResult {
  const mergedUsers = mergeAnalysisUsers(rawResult);
  const parsedId = Number(rawResult.id);
  const resolvedAnalysisId = Number.isFinite(parsedId) ? parsedId : fallbackAnalysisId;

  return {
    data: { users: mergedUsers },
    status,
    analysisId: resolvedAnalysisId,
    public: Boolean(rawResult.public),
  };
}

/**
 * Poll for analysis result with retry logic
 */
async function pollAnalysisResult(
  analysisId: number,
  maxRetries: number = 10,
  interval: number = 10000,
  onProgress?: (attempt: number, data?: Partial<RawAnalysisResult>) => void,
): Promise<ApiResponse<AnalysisResult>> {
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      const response = await fetchAnalysisResult(analysisId);

      if (onProgress) {
        onProgress(retryCount + 1, response.data);
      }


      // Check if analysis is complete - response.data IS the actual API response now
      if (response.success && response.data) {
        const rawResult = response.data;

        const hasGithubData =
          rawResult.github &&
          rawResult.github.users &&
          Array.isArray(rawResult.github.users) &&
          rawResult.github.users.length > 0;

        const hasAnalyticsData =
          rawResult.data &&
          rawResult.data.users &&
          Array.isArray(rawResult.data.users) &&
          rawResult.data.users.length > 0;

        // Check if AI analysis is complete - verify actual AI data content
        // More flexible check for AI data availability
        const hasAIData = !!(
          rawResult.ai && (
            (rawResult.ai.data?.profile && rawResult.ai.data?.roastReport) ||  // New structure
            (rawResult.ai.data?.profile) ||  // Profile only
            (rawResult.ai.data?.roastReport) || // Roast report only
            (rawResult.ai.success && rawResult.ai.data) // General AI data available
          )
        );

        // IMPORTANT: If AI data is available, process and return immediately
        if (hasGithubData && hasAnalyticsData && hasAIData) {
          return {
            success: true,
            code: "SUCCESS",
            message: "Analysis completed successfully",
            data: buildAnalysisResultFromRaw(rawResult, "completed", analysisId),
          };
        }

        // If we have GitHub + Analytics data but no AI yet, keep polling.
        // Progress updates are emitted via onProgress; do not return yet.
        if (hasGithubData && hasAnalyticsData && !hasAIData) {
          // continue polling
        }
      }

      // If not complete, wait and retry
      retryCount++;

      if (retryCount < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, interval));
      }
    } catch (error) {
      retryCount++;

      if (retryCount < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, interval));
      }
    }
  }

  // Max retries reached
  return {
    success: false,
    code: "AI_ANALYSIS_TIMEOUT",
    message: "AI analysis timeout: unable to fetch AI insights after maximum polling attempts. Basic analysis may be available.",
    data: {
      data: { users: [] },
      status: "failed" as const,
      analysisId,
      public: false,
    },
  };
}

/**
 * Two-phase analysis function: first show basic info, then poll for AI results
 * Uses authenticated user's GitHub handle from token
 */
export async function analyzeGitHubUser(
  githubHandle: string, // Still kept for display purposes, but API derives from token
  onProgress?: ProgressCallback,
  onBasicInfo?: BasicDataCallback,
): Promise<ApiResponse<AnalysisResult>> {
  
  try {
    if (onProgress) {
      onProgress("Initiating profile analysis...", 0);
    }

    // Step 1: Start analysis using profile intent for authenticated user
    const analysisResponse = await analyzeUser(`DevInsight profile analysis for GitHub user: ${githubHandle}`);


    if (!analysisResponse.success) {
      return {
        success: false,
        code: analysisResponse.code,
        message: analysisResponse.message,
        data: {
          data: { users: [] },
          status: "failed" as const,
        },
      };
    }

    if (!analysisResponse.data) {
      return {
        success: false,
        code: "NO_DATA",
        message: "Analysis response contains no data",
        data: {
          data: { users: [] },
          status: "failed" as const,
        },
      };
    }


    const analysisId = analysisResponse.data.id;
    
    // Extract users from POST response structure - { users: { users: [...] } }
    const actualUsers = analysisResponse.data.users?.users || [];

    // Step 2: Show basic info immediately
    if (onBasicInfo && actualUsers.length > 0) {
      onBasicInfo({
        id: analysisId,
        users: actualUsers,
        public: false,
      });
    }

    if (onProgress) {
      onProgress("Basic info loaded, analyzing for AI insights...", 15);
    }

    // Step 3: Poll for AI results
    const result = await pollAnalysisResult(
      analysisId,
      15, // Increase max retries for AI analysis
      15000, // Increase interval to 15 seconds
      (attempt, rawData) => {
        if (onProgress) {
          const progress = Math.min(15 + attempt * 5, 95);

          let progressData: Partial<AnalysisResult> | undefined = undefined;
          try {
            if (rawData && rawData.github && rawData.data) {
              const mergedUsers = mergeAnalysisUsers(rawData);

              progressData = {
                data: { users: mergedUsers },
                status: "analyzing",
                analysisId,
                public: Boolean(rawData.public),
              };
            }
          } catch {
            // ignore merge errors
          }

          onProgress(`Waiting for AI analysis completion (${attempt}/15)...`, progress, progressData);
        }
      },
    );

    // If we get here, we have some kind of result (success or failed)

    if (onProgress) {
      onProgress(
        result.success ? "Analysis completed!" : "Analysis failed",
        100,
        result.data,
      );
    }

    return result;
  } catch (error) {
    
    return {
      success: false,
      code: "WORKFLOW_ERROR", 
      message: error instanceof Error ? error.message : "Unknown workflow error",
      data: {
        data: { users: [] },
        status: "failed" as const,
      },
    };
  }
}
