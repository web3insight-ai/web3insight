import type { User as GithubUser } from "../../github/typing";
import type { PartialContestant, AnalysisStatus } from "../typing";

/**
 * Transform basic GitHub users into partial contestants with analysis status
 */
function createPartialContestants(users: GithubUser[]): PartialContestant[] {
  return users.map(user => ({
    ...user,
    analysisStatus: "analyzing" as AnalysisStatus,
    analysisProgress: 10, // Initial progress
    estimatedTime: "2-3 minutes",
    analytics: [
      {
        name: "Ethereum",
        status: "analyzing" as AnalysisStatus,
        progress: 15,
        estimatedTime: "1-2 minutes",
      },
      {
        name: "Polygon",
        status: "pending" as AnalysisStatus,
      },
      {
        name: "Base",
        status: "pending" as AnalysisStatus,
      },
    ],
  }));
}

/**
 * Update analysis progress for a specific user
 */
function updateContestantProgress(
  contestants: PartialContestant[],
  userId: number,
  progress: number,
  status?: AnalysisStatus,
  estimatedTime?: string,
): PartialContestant[] {
  return contestants.map(contestant => {
    if (contestant.id === userId) {
      return {
        ...contestant,
        analysisStatus: status || contestant.analysisStatus,
        analysisProgress: progress,
        estimatedTime: estimatedTime || contestant.estimatedTime,
      };
    }
    return contestant;
  });
}

/**
 * Update ecosystem analysis progress for a specific user
 */
function updateEcosystemProgress(
  contestants: PartialContestant[],
  userId: number,
  ecosystemName: string,
  progress: number,
  status?: AnalysisStatus,
  score?: number,
  repos?: Array<{ fullName: string; score: string }>,
): PartialContestant[] {
  return contestants.map(contestant => {
    if (contestant.id === userId && contestant.analytics) {
      const updatedAnalytics = contestant.analytics.map(analytics => {
        if (analytics.name === ecosystemName) {
          return {
            ...analytics,
            status: status || analytics.status,
            progress,
            score: score !== undefined ? score : analytics.score,
            repos: repos || analytics.repos,
          };
        }
        return analytics;
      });

      return {
        ...contestant,
        analytics: updatedAnalytics,
      };
    }
    return contestant;
  });
}

/**
 * Check if all analysis is complete for all contestants
 */
function isAnalysisComplete(contestants: PartialContestant[]): boolean {
  return contestants.every(contestant => 
    contestant.analysisStatus === "completed" &&
    contestant.analytics?.every(analytics => analytics.status === "completed"),
  );
}

/**
 * Calculate overall progress for all contestants
 */
function calculateOverallProgress(contestants: PartialContestant[]): number {
  if (contestants.length === 0) return 0;

  const totalProgress = contestants.reduce((sum, contestant) => {
    return sum + (contestant.analysisProgress || 0);
  }, 0);

  return Math.round(totalProgress / contestants.length);
}

export {
  createPartialContestants,
  updateContestantProgress,
  updateEcosystemProgress,
  isAnalysisComplete,
  calculateOverallProgress,
};
