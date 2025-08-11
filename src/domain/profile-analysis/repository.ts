
import type {
  ApiResponse,
  AnalysisRequest,
  AnalysisResponse,
  RawAnalysisResult,
  AnalysisResult,
  ProgressCallback,
  BasicDataCallback,
  EcosystemItem,
} from "./typing";

/**
 * Initiate user analysis for profile intent (no GitHub URLs needed)
 * Uses local API route which handles server-side authentication
 */
async function analyzeUser(
  description: string = "Profile analysis",
): Promise<ApiResponse<AnalysisResponse>> {
  
  const requestData: AnalysisRequest = {
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

    const result = await response.json() as ApiResponse<AnalysisResponse>;
    
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

    const result = await response.json() as ApiResponse<RawAnalysisResult>;
    
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


      // Check if analysis is complete with AI field
      if (response.success && response.data) {
        const hasGithubData =
          response.data.github &&
          response.data.github.users &&
          Array.isArray(response.data.github.users) &&
          response.data.github.users.length > 0;

        const hasAnalyticsData =
          response.data.data &&
          response.data.data.users &&
          Array.isArray(response.data.data.users) &&
          response.data.data.users.length > 0;

        // Check if AI analysis is complete - AI data is at root level
        const hasAIData = !!(response.data.ai &&
          response.data.ai.success &&
          response.data.ai.data);


        if (hasGithubData && hasAnalyticsData && hasAIData) {
          // Process AI data and merge with GitHub users
          const mergedUsers = response.data.github.users.map((githubUser) => {
            // Find matching analytics data
            const analyticsUser = response.data.data.users.find(
              (au) => au.actor_id === githubUser.id.toString(),
            );
            
            // Attach ecosystem scores to GitHub user
            const userWithScores = {
              ...githubUser,
              ecosystem_scores: analyticsUser?.ecosystem_scores || [],
            };

            // Process AI data if available
            if (response.data.ai && response.data.ai.success && response.data.ai.data) {
              const aiData = response.data.ai.data;
              const aiProfile = aiData.profile?.output;

              if (aiProfile) {
                // Calculate Web3 involvement score from total score or top ecosystem
                const totalScore = aiProfile.profileCard?.stats?.totalScore || 0;
                const web3Score = Math.min(Math.round((totalScore / 400) * 100), 100); // Normalize to 0-100

                // Determine involvement level
                let level = "Beginner";
                if (web3Score >= 80) level = "Expert";
                else if (web3Score >= 60) level = "Advanced";
                else if (web3Score >= 30) level = "Intermediate";

                // Map AI data to expected format including rich visualization data
                userWithScores.ai = {
                  summary: aiProfile.highlights?.join('. ') || "AI analysis completed successfully.",
                  web3_involvement: {
                    score: web3Score,
                    level: level,
                    evidence: aiProfile.highlights || [],
                  },
                  skills: aiProfile.technicalStack?.skills || [],
                  expertise_areas: aiProfile.web3Ecosystems?.top3?.map((eco: EcosystemItem) => eco.name) || [],
                  recommendation: aiProfile.technicalStack?.mainFocus ?
                    `Focus on ${aiProfile.technicalStack.mainFocus} to maximize your impact in the Web3 ecosystem.` :
                    "Continue developing your Web3 skills across multiple ecosystems.",
                  analysis_date: response.data.ai?.timestamp,

                  // Rich visualization data
                  highlights: aiProfile.highlights,
                  profileCard: aiProfile.profileCard,
                  technicalStack: aiProfile.technicalStack,
                  web3Ecosystems: aiProfile.web3Ecosystems,
                  activityTimeline: aiProfile.activityTimeline,
                };

                // Add roast report processing if available
                if (aiData.roastReport?.output) {
                  userWithScores.ai.roast_report = {
                    title: aiData.roastReport.output.title,
                    overall_roast: aiData.roastReport.output.overallRoast,
                    activity_roast: aiData.roastReport.output.activityRoast,
                    ecosystem_roast: aiData.roastReport.output.ecosystemRoast,
                    technical_roast: aiData.roastReport.output.technicalRoast,
                    final_verdict: aiData.roastReport.output.finalVerdict,
                    constructive_sarcasm: aiData.roastReport.output.constructiveSarcasm,
                    roast_score: {
                      spicyLevel: aiData.roastReport.output.roastScore.spicyLevel,
                      truthLevel: aiData.roastReport.output.roastScore.truthLevel,
                      helpfulLevel: aiData.roastReport.output.roastScore.helpfulLevel,
                    },
                  };
                }

              }
            }

            return userWithScores;
          });

          return {
            success: true,
            code: "SUCCESS",
            message: "Analysis completed successfully",
            data: {
              data: { users: mergedUsers },
              status: "completed" as const,
            },
          };
        }

        // If we have GitHub + Analytics data but no AI yet, return partial result with ecosystem data
        if (hasGithubData && hasAnalyticsData && !hasAIData) {
          
          // Process basic data and merge with GitHub users to show ecosystem visualizations
          const mergedUsers = response.data.github.users.map((githubUser) => {
            // Find matching analytics data
            const analyticsUser = response.data.data.users.find(
              (au) => au.actor_id === githubUser.id.toString(),
            );
            
            // Attach ecosystem scores to GitHub user for visualization
            const userWithScores = {
              ...githubUser,
              ecosystem_scores: analyticsUser?.ecosystem_scores || [],
            };

            return userWithScores;
          });

          return {
            success: true,
            code: "SUCCESS",
            message: "Analysis completed with ecosystem data (AI analysis in progress)",
            data: {
              data: { users: mergedUsers },
              status: "completed" as const,
            },
          };
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
    },
  };
}

/**
 * Two-phase analysis function: first show basic info, then poll for AI results
 */
export async function analyzeGitHubUser(
  githubHandle: string,
  onProgress?: ProgressCallback,
  onBasicInfo?: BasicDataCallback,
): Promise<ApiResponse<AnalysisResult>> {
  
  try {
    if (onProgress) {
      onProgress("Initiating profile analysis...", 0);
    }

    // Step 1: Start analysis using profile intent (GitHub handle determined from auth context)
    const analysisResponse = await analyzeUser(`Profile analysis for GitHub user: ${githubHandle}`);


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
    
    // Extract users from nested structure { users: { users: [...] } }
    const actualUsers = analysisResponse.data.users.users || [];

    // Step 2: Show basic info immediately
    if (onBasicInfo && actualUsers.length > 0) {
      onBasicInfo({
        id: analysisId,
        users: actualUsers,
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
          const progress = Math.min(15 + (attempt * 5), 90);
          // Convert raw data to expected callback format if needed
          const progressData = rawData ? {
            data: { users: [] }, // This will be populated when analysis completes
            status: "analyzing" as const,
          } : undefined;
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
