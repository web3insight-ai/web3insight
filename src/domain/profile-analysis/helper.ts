import type { ApiUser } from "~/auth/typing";
import type { AIProfile, AnalysisStatus, GitHubUser, EcosystemScore } from "./typing";

/**
 * Get GitHub handle from user's GitHub bind
 */
export function getGitHubHandle(user: ApiUser | null): string | null {
  if (!user?.binds) return null;
  const githubBind = user.binds.find(bind => bind.bind_type === 'github');
  return githubBind?.bind_key || null;
}

/**
 * Format date to readable string
 */
export function formatAnalysisDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Get Web3 involvement level color
 */
export function getInvolvementLevelColor(level: string): "primary" | "success" | "warning" | "danger" {
  switch (level.toLowerCase()) {
  case "expert":
    return "success";
  case "advanced":
    return "primary";
  case "intermediate":
    return "warning";
  default:
    return "danger";
  }
}

/**
 * Calculate progress percentage based on analysis status
 */
export function calculateProgress(status: AnalysisStatus, aiComplete: boolean = false): number {
  switch (status) {
  case "pending":
    return 0;
  case "analyzing":
    return aiComplete ? 90 : 50;
  case "completed":
    return 100;
  case "failed":
    return 0;
  default:
    return 0;
  }
}

/**
 * Get analysis status message
 */
export function getStatusMessage(status: AnalysisStatus, hasBasicData: boolean = false): string {
  switch (status) {
  case "pending":
    return "Preparing analysis...";
  case "analyzing":
    return hasBasicData ? "Generating AI insights..." : "Analyzing GitHub profile...";
  case "completed":
    return "Analysis completed successfully!";
  case "failed":
    return "Analysis failed";
  default:
    return "";
  }
}

/**
 * Extract top skills from AI profile
 */
export function getTopSkills(aiProfile: AIProfile, limit: number = 6): string[] {
  const skills = aiProfile.technicalStack?.skills || aiProfile.skills || [];
  return skills.slice(0, limit);
}

/**
 * Get ecosystem data for charts
 */
export function getEcosystemChartData(aiProfile: AIProfile) {
  const ecosystems = aiProfile.web3Ecosystems?.top3 || [];
  
  return ecosystems.map(eco => ({
    name: eco.name,
    value: eco.score,
    percentage: eco.percentage,
    rank: eco.rank,
  }));
}

/**
 * Format large numbers with K/M suffixes
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

/**
 * Get user's total Web3 score
 */
export function getTotalScore(user: GitHubUser): number {
  if (user.ai?.web3_involvement?.score) {
    return user.ai.web3_involvement.score;
  }
  
  if (user.ai?.profileCard?.stats?.totalScore) {
    // Convert from raw total score to 0-100 scale
    return Math.min(Math.round((user.ai.profileCard.stats.totalScore / 400) * 100), 100);
  }

  return 0;
}

/**
 * Check if analysis has AI data
 */
export function hasAIData(user: GitHubUser): boolean {
  return !!(user.ai && (
    user.ai.summary ||
    user.ai.skills?.length ||
    user.ai.highlights?.length ||
    user.ai.web3_involvement
  ));
}

/**
 * Get skill color based on category (simple heuristic)
 */
export function getSkillColor(skill: string): "primary" | "secondary" | "success" | "warning" | "danger" {
  const skillLower = skill.toLowerCase();
  
  if (skillLower.includes('javascript') || skillLower.includes('typescript') || skillLower.includes('react')) {
    return "primary";
  }
  if (skillLower.includes('solidity') || skillLower.includes('rust') || skillLower.includes('web3')) {
    return "success";
  }
  if (skillLower.includes('python') || skillLower.includes('node')) {
    return "warning";
  }
  if (skillLower.includes('go') || skillLower.includes('java')) {
    return "secondary";
  }
  
  return "primary";
}

/**
 * Get activity level description
 */
export function getActivityDescription(level: string): string {
  switch (level.toLowerCase()) {
  case "high":
    return "Very active contributor";
  case "medium":
    return "Regular contributor";
  case "low":
    return "Occasional contributor";
  default:
    return "Activity level unknown";
  }
}

// === ECOSYSTEM DATA PROCESSING UTILITIES ===

/**
 * Process raw ecosystem scores into visualization-ready data
 */
export function processEcosystemData(ecosystemScores: EcosystemScore[]) {
  if (!ecosystemScores?.length) return null;

  const sortedEcosystems = ecosystemScores
    .filter(eco => eco.ecosystem !== "ALL") // Exclude ALL category
    .sort((a, b) => b.total_score - a.total_score);

  const totalScore = sortedEcosystems.reduce((sum, eco) => sum + eco.total_score, 0);

  return {
    top5: sortedEcosystems.slice(0, 5).map((eco, index) => ({
      name: eco.ecosystem,
      rank: index + 1,
      score: eco.total_score,
      percentage: totalScore > 0 ? (eco.total_score / totalScore) * 100 : 0,
      repoCount: eco.repos.length,
      lastActivityAt: eco.last_activity_at,
      firstActivityAt: eco.first_activity_at,
    })),
    detailed: sortedEcosystems.map(eco => ({
      ecosystem: eco.ecosystem,
      score: eco.total_score,
      repos: eco.repos.map(repo => ({
        name: repo.repo_name,
        score: repo.score,
        lastActivityAt: repo.last_activity_at,
        firstActivityAt: repo.first_activity_at,
      })),
    })),
    stats: {
      totalEcosystems: sortedEcosystems.length,
      totalScore,
      topScore: sortedEcosystems[0]?.total_score || 0,
      averageScore: sortedEcosystems.length > 0 ? totalScore / sortedEcosystems.length : 0,
    },
  };
}

/**
 * Extract top repositories across all ecosystems
 */
export function getTopRepositories(ecosystemScores: EcosystemScore[], limit: number = 10) {
  if (!ecosystemScores?.length) return [];

  const allRepos = ecosystemScores.flatMap(eco => 
    eco.repos.map(repo => ({
      ...repo,
      ecosystem: eco.ecosystem,
    })),
  );

  return allRepos
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * Calculate activity timeline from ecosystem data
 */
export function calculateActivityTimeline(ecosystemScores: EcosystemScore[]) {
  if (!ecosystemScores?.length) return null;

  const allDates = ecosystemScores.flatMap(eco => [
    new Date(eco.first_activity_at),
    new Date(eco.last_activity_at),
    ...eco.repos.flatMap(repo => [
      new Date(repo.first_activity_at),
      new Date(repo.last_activity_at),
    ]),
  ]);

  const sortedDates = allDates.sort((a, b) => a.getTime() - b.getTime());
  const firstActivity = sortedDates[0];
  const lastActivity = sortedDates[sortedDates.length - 1];

  const daysDifference = Math.floor((lastActivity.getTime() - firstActivity.getTime()) / (1000 * 60 * 60 * 24));
  
  // Create yearly activity breakdown
  const activityByYear = new Map<number, { ecosystems: Set<string>; repos: number; totalScore: number }>();
  
  ecosystemScores.forEach(eco => {
    eco.repos.forEach(repo => {
      const year = new Date(repo.first_activity_at).getFullYear();
      if (!activityByYear.has(year)) {
        activityByYear.set(year, { ecosystems: new Set(), repos: 0, totalScore: 0 });
      }
      const yearData = activityByYear.get(year)!;
      yearData.ecosystems.add(eco.ecosystem);
      yearData.repos++;
      yearData.totalScore += repo.score;
    });
  });

  const timelineData = Array.from(activityByYear.entries())
    .map(([year, data]) => ({
      year,
      ecosystems: data.ecosystems.size,
      repos: data.repos,
      totalScore: data.totalScore,
    }))
    .sort((a, b) => a.year - b.year);

  return {
    firstActivity: firstActivity.toISOString(),
    lastActivity: lastActivity.toISOString(),
    totalDaysActive: daysDifference,
    timelineData,
    totalEcosystems: new Set(ecosystemScores.map(eco => eco.ecosystem)).size,
  };
}

/**
 * Infer technical stack from repository data
 */
export function inferTechnicalStack(ecosystemScores: EcosystemScore[]) {
  if (!ecosystemScores?.length) return null;

  const languages = new Set<string>();
  const frameworks = new Set<string>();
  const skills = new Set<string>();

  // Extract tech from repository names and ecosystems
  ecosystemScores.forEach(eco => {
    // Add ecosystem as a skill/framework
    if (!eco.ecosystem.includes("ALL") && !eco.ecosystem.includes("General")) {
      skills.add(eco.ecosystem);
    }

    eco.repos.forEach(repo => {
      const repoName = repo.repo_name.toLowerCase();
      
      // Infer languages from common patterns
      if (repoName.includes('solidity') || repoName.includes('contracts')) {
        languages.add('Solidity');
        skills.add('Smart Contracts');
      }
      if (repoName.includes('rust') || repoName.includes('-rs')) {
        languages.add('Rust');
      }
      if (repoName.includes('go') || repoName.includes('golang')) {
        languages.add('Go');
      }
      if (repoName.includes('js') || repoName.includes('typescript') || repoName.includes('react')) {
        languages.add('JavaScript');
        languages.add('TypeScript');
      }
      if (repoName.includes('python')) {
        languages.add('Python');
      }

      // Infer frameworks/tools
      if (repoName.includes('hardhat')) {
        frameworks.add('Hardhat');
      }
      if (repoName.includes('foundry')) {
        frameworks.add('Foundry');
      }
      if (repoName.includes('react')) {
        frameworks.add('React');
      }
      if (repoName.includes('node')) {
        frameworks.add('Node.js');
      }
      if (repoName.includes('docker')) {
        frameworks.add('Docker');
      }

      // Add Web3 skills based on ecosystem
      if (eco.ecosystem.toLowerCase().includes('ethereum')) {
        skills.add('Ethereum Development');
      }
      if (eco.ecosystem.toLowerCase().includes('defi')) {
        skills.add('DeFi Protocol Development');
      }
    });
  });

  return {
    languages: Array.from(languages).slice(0, 8),
    frameworks: Array.from(frameworks).slice(0, 10),
    skills: Array.from(skills).slice(0, 12),
    mainFocus: `Web3 developer focused on ${Array.from(skills).slice(0, 3).join(', ')} with ${ecosystemScores.length} ecosystem${ecosystemScores.length !== 1 ? 's' : ''} involvement`,
  };
}

/**
 * Calculate ecosystem rankings and insights
 */
export function calculateEcosystemRankings(ecosystemScores: EcosystemScore[]) {
  if (!ecosystemScores?.length) return null;

  const validEcosystems = ecosystemScores.filter(eco => eco.ecosystem !== "ALL");
  const totalRepos = validEcosystems.reduce((sum, eco) => sum + eco.repos.length, 0);
  const totalScore = validEcosystems.reduce((sum, eco) => sum + eco.total_score, 0);

  return validEcosystems
    .sort((a, b) => b.total_score - a.total_score)
    .map((eco, index) => ({
      ecosystem: eco.ecosystem,
      rank: index + 1,
      score: eco.total_score,
      percentage: totalScore > 0 ? (eco.total_score / totalScore) * 100 : 0,
      repos: eco.repos.length,
      repoPercentage: totalRepos > 0 ? (eco.repos.length / totalRepos) * 100 : 0,
      avgRepoScore: eco.repos.length > 0 ? eco.total_score / eco.repos.length : 0,
      firstActivity: eco.first_activity_at,
      lastActivity: eco.last_activity_at,
      isActive: new Date(eco.last_activity_at) > new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
      topRepo: eco.repos.sort((a, b) => b.score - a.score)[0],
    }));
}

/**
 * Check if user has ecosystem data available
 */
export function hasEcosystemData(user: GitHubUser): boolean {
  return !!(user.ecosystem_scores && user.ecosystem_scores.length > 0);
}

/**
 * Get ecosystem insights for summary
 */
export function getEcosystemSummary(ecosystemScores: EcosystemScore[]) {
  if (!ecosystemScores?.length) return null;

  const rankings = calculateEcosystemRankings(ecosystemScores);
  if (!rankings) return null;

  const topEcosystem = rankings[0];
  const totalRepos = rankings.reduce((sum, eco) => sum + eco.repos, 0);
  const totalScore = rankings.reduce((sum, eco) => sum + eco.score, 0);

  return {
    topEcosystem: topEcosystem.ecosystem,
    topScore: topEcosystem.score,
    totalEcosystems: rankings.length,
    totalRepos,
    totalScore,
    isActiveContributor: rankings.some(eco => eco.isActive),
    primaryFocus: rankings.slice(0, 3).map(eco => eco.ecosystem),
  };
}
