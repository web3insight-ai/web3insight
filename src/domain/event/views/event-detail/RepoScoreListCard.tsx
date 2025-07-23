import { useState } from "react";
import { Card, CardHeader, CardBody, Divider, Link, Chip, Button } from "@nextui-org/react";
import { Github, Star, ChevronDown, ChevronUp } from "lucide-react";

import type { RepoScoreListCardProps } from "./typing";

function RepoScoreListCard({ dataSource }: RepoScoreListCardProps) {
  const [expandedEcosystems, setExpandedEcosystems] = useState<Set<number>>(new Set());

  // Helper function to safely extract repository info
  const extractRepoInfo = (repo: unknown) => {
    // Case 1: Standard structure { fullName: "owner/repo", score: "123" }
    if (repo && typeof repo === 'object' && repo !== null && 'fullName' in repo && 'score' in repo) {
      return {
        fullName: String((repo as { fullName: unknown }).fullName),
        score: String((repo as { score: unknown }).score)
      };
    }

    // Case 2: Direct key-value pair { "owner/repo": "123" }
    if (repo && typeof repo === 'object' && repo !== null) {
      const entries = Object.entries(repo);
      if (entries.length > 0) {
        const [fullName, score] = entries[0];
        return {
          fullName: String(fullName),
          score: String(score)
        };
      }
    }

    // Case 3: Fallback for unexpected structures
    return {
      fullName: "unknown/repository",
      score: "0"
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
    <Card className="bg-white dark:bg-surface-dark shadow-subtle border border-border dark:border-border-dark">
      <CardHeader className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-secondary/10">
            <Github size={18} className="text-secondary" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Repository Scores by Ecosystem</h3>
        </div>
      </CardHeader>
      <Divider />
      <CardBody className="p-6">
        <div className="space-y-6">
          {dataSource.map((eco, idx) => {
            const isExpanded = expandedEcosystems.has(idx);
            const validRepos = eco.repos.filter(repo => {
              const { fullName, score } = extractRepoInfo(repo);
              return !(fullName === 'unknown/repository' && score === '0');
            });

            return (
              <div key={`${eco.name.replaceAll(" ", "")}-${idx}`}>
                {/* Ecosystem Header - Clickable */}
                <Button
                  variant="light"
                  className="w-full justify-start p-0 h-auto bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-colors duration-200"
                  onClick={() => toggleEcosystem(idx)}
                >
                  <div className="flex items-center gap-3 py-3 px-4 w-full">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                    <div className="flex-1 text-left">
                      <h4 className="text-base font-medium text-gray-900 dark:text-white">{eco.name}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {validRepos.length} repositories • Total Score: {eco.score}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
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
                </Button>

                {/* Repository Grid - Collapsible */}
                {isExpanded && (
                  <div className="ml-6 mt-4 animate-slide-up">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
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
                            className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border border-border dark:border-border-dark hover:shadow-md transition-all duration-200 group animate-fade-in"
                            style={{ animationDelay: `${i * 50}ms` }}
                          >
                            <CardBody className="p-4">
                              <div className="flex flex-col gap-3">
                                {/* Repository Info */}
                                <div className="flex-1">
                                  <Link
                                    href={`https://github.com/${fullName}`}
                                    isExternal
                                    className="text-sm font-medium text-gray-900 dark:text-white hover:text-primary group-hover:text-primary transition-colors line-clamp-2"
                                  >
                                    <span className="text-gray-500 dark:text-gray-400">{owner}/</span>
                                    <span className="font-semibold">{shortName}</span>
                                  </Link>
                                </div>

                                {/* Score Badge */}
                                <div className="flex items-center justify-between">
                                  <Chip
                                    size="sm"
                                    variant="flat"
                                    startContent={<Star size={12} />}
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

                {/* Separator between ecosystems */}
                {idx < dataSource.length - 1 && (
                  <div className="mt-6 pt-6 border-t border-border dark:border-border-dark" />
                )}
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}

export default RepoScoreListCard;
