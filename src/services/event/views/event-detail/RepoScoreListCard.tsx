'use client';

import { useState } from "react";
import { Card, CardBody, Link, Chip } from "@nextui-org/react";
import { Github, Trophy, ChevronDown, ChevronUp } from "lucide-react";

import type { RepoScoreListCardProps } from "./typing";

function RepoScoreListCard({ dataSource }: RepoScoreListCardProps) {
  const [expandedEcosystems, setExpandedEcosystems] = useState<Set<number>>(new Set());

  // Helper function to safely extract repository info
  const extractRepoInfo = (repo: unknown) => {
    // Case 1: New API format { repo_name: "owner/repo", score: 123, ... }
    if (repo && typeof repo === 'object' && repo !== null && 'repo_name' in repo && 'score' in repo) {
      return {
        fullName: String((repo as { repo_name: unknown }).repo_name),
        score: String((repo as { score: unknown }).score),
      };
    }

    // Case 2: Standard structure { fullName: "owner/repo", score: "123" }
    if (repo && typeof repo === 'object' && repo !== null && 'fullName' in repo && 'score' in repo) {
      return {
        fullName: String((repo as { fullName: unknown }).fullName),
        score: String((repo as { score: unknown }).score),
      };
    }

    // Case 3: Direct key-value pair { "owner/repo": "123" }
    if (repo && typeof repo === 'object' && repo !== null) {
      const entries = Object.entries(repo);
      if (entries.length > 0) {
        const [fullName, score] = entries[0];
        return {
          fullName: String(fullName),
          score: String(score),
        };
      }
    }

    // Case 4: Fallback for unexpected structures
    return {
      fullName: "unknown/repository",
      score: "0",
    };
  };

  const toggleEcosystem = (index: number) => {
    const newExpanded = new Set(expandedEcosystems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedEcosystems(newExpanded);
  };

  return (
    <div className="border border-border dark:border-border-dark rounded-xl p-4 bg-white dark:bg-surface-dark shadow-subtle">
      <div className="flex items-center gap-2 mb-3">
        <Github size={14} className="text-gray-600 dark:text-gray-400" />
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">Repository Scores by Ecosystem</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {dataSource.map((eco, idx) => {
          const isExpanded = expandedEcosystems.has(idx);
          const validRepos = eco.repos.filter(repo => {
            const { fullName, score } = extractRepoInfo(repo);
            return !(fullName === 'unknown/repository' && score === '0');
          });

          return (
            <div key={`${eco.name.replaceAll(" ", "")}-${idx}`} className={isExpanded ? "md:col-span-2" : ""}>
              {/* Ecosystem Header - Clickable */}
              <div
                className="bg-white dark:bg-surface-dark shadow-subtle border border-border dark:border-border-dark rounded-lg hover:shadow-card transition-all duration-200 hover:scale-[1.02] cursor-pointer group"
                onClick={() => toggleEcosystem(idx)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleEcosystem(idx);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-expanded={isExpanded}
                aria-label={`${isExpanded ? 'Hide' : 'Show'} details for ${eco.name} ecosystem`}
              >
                <div className="flex items-center gap-3 py-4 px-4 w-full">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <div className="flex-1 text-left">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-primary transition-colors">{eco.name}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {validRepos.length} repositories • Total Score: {eco.score}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 group-hover:text-primary transition-colors">
                    <span className="text-xs font-medium">
                      {isExpanded ? 'Hide' : 'Show'} Details
                    </span>
                    {isExpanded ? (
                      <ChevronUp size={16} className="transition-transform duration-200" />
                    ) : (
                      <ChevronDown size={16} className="transition-transform duration-200" />
                    )}
                  </div>
                </div>
              </div>

              {/* Repository Grid - Full Width (when expanded) */}
              {isExpanded && (
                <div className="mt-4 w-full">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                    {eco.repos.map((repo, i) => {
                      const { fullName, score } = extractRepoInfo(repo);

                      // Skip invalid repositories
                      if (fullName === 'unknown/repository' && score === '0') {
                        return null;
                      }

                      const [owner, ...repoNameParts] = fullName.split('/');
                      const shortName = repoNameParts.join('/') || fullName;

                      return (
                        <Card
                          key={`${fullName}-${i}`}
                          className="bg-white dark:bg-surface-dark shadow-subtle border border-border dark:border-border-dark hover:shadow-card transition-all duration-200 hover:scale-[1.02] group"
                        >
                          <CardBody className="p-4">
                            <div className="flex flex-col gap-2">
                              {/* Repository Info */}
                              <div className="flex-1">
                                <Link
                                  href={`https://github.com/${fullName || 'unknown/repository'}`}
                                  isExternal
                                  className="text-xs font-mono leading-relaxed text-gray-900 dark:text-white hover:text-primary group-hover:text-primary transition-colors line-clamp-3 break-all"
                                  title={fullName || 'Unknown Repository'}
                                >
                                  <span className="text-gray-500 dark:text-gray-400 font-normal">{owner}/</span>
                                  <span className="font-medium">{shortName}</span>
                                </Link>
                              </div>

                              {/* Score Badge */}
                              <div className="flex items-center justify-between">
                                <Chip
                                  size="sm"
                                  variant="flat"
                                  startContent={<Trophy size={12} />}
                                  className="bg-primary/10 text-primary"
                                >
                                  {score}
                                </Chip>
                                <Github size={14} className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
                              </div>
                            </div>
                          </CardBody>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default RepoScoreListCard;
