"use client";

import {
  Card,
  CardHeader,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
} from "@/components/ui";
import { Users, ArrowRight, Trophy, Medal, Award } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import RepoLinkWidget from "../../../repository/widgets/repo-link";

import type { DeveloperRankViewWidgetProps } from "./typing";
import DeveloperLink from "./DeveloperLink";
import type { ActorRankRecord } from "@/lib/api/types";

function DeveloperRankGridView({
  dataSource,
}: Pick<DeveloperRankViewWidgetProps, "dataSource">) {
  const displayedData = dataSource.slice(0, 9); // Show 9 for 3x3 grid
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDeveloper, setSelectedDeveloper] =
    useState<ActorRankRecord | null>(null);

  const handleShowAllRepos = (developer: ActorRankRecord) => {
    setSelectedDeveloper(developer);
    setIsModalOpen(true);
  };

  const getRankIcon = (index: number) => {
    switch (index) {
    case 0:
      return (
        <Trophy size={20} className="text-yellow-600 dark:text-yellow-400" />
      );
    case 1:
      return <Medal size={20} className="text-fg-muted" />;
    case 2:
      return (
        <Award size={20} className="text-orange-600 dark:text-orange-400" />
      );
    default:
      return null;
    }
  };

  const getRankBadgeStyles = (index: number) => {
    switch (index) {
    case 0:
      return "bg-accent-subtle dark:from-yellow-900/30 dark:to-yellow-800/30 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700";
    case 1:
      return "bg-bg-raised dark: text-fg-muted border-rule";
    case 2:
      return "bg-warn-subtle dark:from-orange-900/30 dark:to-orange-800/30 text-orange-700 dark:text-orange-400 border-orange-300 dark:border-orange-700";
    default:
      return "bg-bg-raised text-fg-muted border-rule";
    }
  };

  return (
    <>
      <Card className="bg-bg-raised border border-rule overflow-hidden">
        <CardHeader className="px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="text-accent">
              <Users size={18} className="text-accent" />
            </div>
            <h3 className="text-lg font-medium text-fg">
              Top Developer Activity
            </h3>
          </div>
        </CardHeader>

        <div className="p-6 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedData.map((dev, index) => (
              <div
                key={dev.actor_id}
                className="group relative bg-bg-raised border border-rule rounded-[2px] p-5 hover:border-accent transition-all duration-200 animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Rank Badge */}
                <div className="absolute -top-3 -right-3">
                  <div
                    className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-sm shadow-sm ${getRankBadgeStyles(index)}`}
                  >
                    {index < 3 ? getRankIcon(index) : index + 1}
                  </div>
                </div>

                {/* Developer Info */}
                <div className="mb-4">
                  <DeveloperLink
                    className="text-base font-semibold text-fg hover:text-accent transition-colors inline-flex items-center gap-2"
                    developer={dev}
                  />
                </div>

                {/* Score */}
                <div className="mb-4">
                  <p className="text-2xl font-bold text-fg">
                    {dev.total_commit_count.toLocaleString()}
                  </p>
                  <p className="text-xs text-fg-muted uppercase tracking-wider">
                    Contribution Score
                  </p>
                </div>

                {/* Top Projects */}
                <div>
                  <p className="text-xs font-medium text-fg-muted mb-2 uppercase tracking-wider">
                    Top Projects
                  </p>
                  <ul className="space-y-1.5">
                    {dev.top_repos.slice(0, 3).map((proj) => (
                      <li
                        key={`${dev.actor_id}-${proj.repo_id}`}
                        className="flex items-center gap-2"
                      >
                        <RepoLinkWidget
                          repo={proj.repo_name}
                          repoId={proj.repo_id}
                          className="text-sm text-fg hover:text-accent truncate flex-1"
                        />
                        {proj.commit_count !== undefined && (
                          <span className="text-xs text-fg-muted font-mono">
                            {proj.commit_count.toLocaleString()}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                  {dev.top_repos.length > 3 && (
                    <button
                      onClick={() => handleShowAllRepos(dev)}
                      className="mt-2 text-xs font-medium text-accent hover:text-accent transition-colors"
                    >
                      +{dev.top_repos.length - 3} more projects
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-rule">
          <Link
            href="/developers"
            className="flex items-center justify-center gap-2 text-sm font-medium text-fg-muted hover:text-accent dark:hover:text-accent transition-colors duration-200"
          >
            View All Developers
            <ArrowRight size={16} />
          </Link>
        </div>
      </Card>

      {/* Modal for showing all repositories */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        size="md"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <h3 className="text-lg font-semibold">All Repositories</h3>
            {selectedDeveloper && (
              <p className="text-sm text-fg-muted">
                @{selectedDeveloper.actor_login}
              </p>
            )}
          </ModalHeader>
          <ModalBody className="pb-6">
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {selectedDeveloper?.top_repos.map((repo) => (
                <div
                  key={repo.repo_id}
                  className="p-3 rounded-[2px] bg-bg-sunken hover:bg-bg-raised transition-colors"
                >
                  <RepoLinkWidget
                    repo={repo.repo_name}
                    repoId={repo.repo_id}
                    className="text-sm font-medium text-fg hover:text-accent"
                  />
                </div>
              ))}
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}

export default DeveloperRankGridView;
