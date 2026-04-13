"use client";

import { Code } from "lucide-react";
import { useGitHubStats } from "../hooks/useGitHubStats";

interface GitHubLanguagesCompactProps {
  username: string | null;
  className?: string;
}

export default function GitHubLanguagesCompact({
  username,
  className = "",
}: GitHubLanguagesCompactProps) {
  const { data: githubData, loading } = useGitHubStats(username);

  if (loading) {
    return (
      <div
        className={`border border-rule rounded-[2px] p-4 bg-bg-raised ${className}`}
      >
        <div className="flex items-center gap-2 mb-3">
          <Code size={14} className="text-fg-muted" />
          <h3 className="text-sm font-medium text-fg">Programming Languages</h3>
        </div>
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 loading-skeleton rounded-full" />
                <div className="w-16 h-3 loading-skeleton rounded-[2px]" />
              </div>
              <div className="w-10 h-3 loading-skeleton rounded-[2px]" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!githubData?.languages || githubData.languages.length === 0) {
    return (
      <div
        className={`border border-rule rounded-[2px] p-4 bg-bg-raised ${className}`}
      >
        <div className="flex items-center gap-2 mb-3">
          <Code size={14} className="text-fg-muted" />
          <h3 className="text-sm font-medium text-fg">Programming Languages</h3>
        </div>
        <div className="text-center py-4">
          <p className="text-xs text-fg-muted">No language data available</p>
        </div>
      </div>
    );
  }

  const LANGUAGE_COLORS = [
    "var(--accent)",
    "var(--teal-300)",
    "var(--teal-700)",
    "var(--teal-200)",
    "var(--teal-800)",
  ];

  return (
    <div
      className={`border border-rule rounded-[2px] p-4 bg-bg-raised ${className}`}
    >
      <div className="flex items-center gap-2 mb-3">
        <Code size={14} className="text-fg-muted" />
        <h3 className="font-mono text-[10px] uppercase tracking-[0.18em] font-medium text-fg-muted">
          programming languages
        </h3>
        <span className="font-mono text-[10px] text-fg-muted ml-auto tabular-nums">
          {githubData.languages.length}
        </span>
      </div>

      <div className="space-y-2">
        {githubData.languages.map((lang, index) => (
          <div key={lang.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 flex-shrink-0"
                style={{
                  backgroundColor:
                    LANGUAGE_COLORS[index % LANGUAGE_COLORS.length],
                }}
              />
              <span className="text-sm text-fg font-medium">{lang.name}</span>
            </div>
            <span className="font-mono text-sm font-medium text-fg-muted tabular-nums">
              {lang.percentage}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
