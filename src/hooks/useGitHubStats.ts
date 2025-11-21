'use client';

import { useState, useEffect } from 'react';

interface GitHubStats {
  rank: string | null;
  totalStars: string;
  totalCommits: string;
  totalPRs: string;
  totalIssues: string;
  contributedTo: string;
}

export interface GitHubLanguage {
  name: string;
  percentage: string;
}

interface GitHubStatsData {
  username: string;
  stats: GitHubStats | null;
  languages?: GitHubLanguage[];
}

interface UseGitHubStatsResult {
  data: GitHubStatsData | null;
  loading: boolean;
  error: string | null;
}

export function useGitHubStats(username: string | null): UseGitHubStatsResult {
  const [data, setData] = useState<GitHubStatsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    const fetchGitHubStats = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/github-stats/${username}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch GitHub stats: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.success) {
          setData(result.data);
        } else {
          throw new Error(result.error || 'Unknown error');
        }
      } catch (err) {
        console.error('[useGitHubStats] Error:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch GitHub stats');
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchGitHubStats();
  }, [username]);

  return { data, loading, error };
}
