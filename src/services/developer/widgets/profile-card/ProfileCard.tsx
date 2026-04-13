import clsx from "clsx";
import { Avatar } from "@/components/ui";
import { Github } from "lucide-react";

import type { ProfileCardWidgetProps } from "./typing";
import { useGitHubStats } from "../../../../hooks/useGitHubStats";

function ProfileCard({ className, developer }: ProfileCardWidgetProps) {
  const nickname = developer.nickname || developer.username;
  const { data: githubData, loading: githubLoading } = useGitHubStats(
    developer.username,
  );

  return (
    <div
      className={clsx(
        "rounded-[2px] border border-rule bg-bg-raised p-4",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <Avatar
          src={developer.avatar}
          className="w-12 h-12 flex-shrink-0"
          radius="lg"
          fallback={nickname}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <h4 className="text-base font-medium text-fg truncate">
                {nickname}
              </h4>
              {githubLoading ? (
                <div className="w-8 h-5 loading-skeleton rounded-[2px]" />
              ) : githubData?.stats?.rank ? (
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-bg-raised text-fg-muted border border-rule">
                  {githubData.stats.rank}
                </span>
              ) : null}
            </div>
            <a
              href={developer.social.github}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-fg-subtle hover:text-fg transition-colors"
            >
              <Github size={12} />
              <span>@{developer.username}</span>
            </a>
          </div>

          {/* Stats Row */}
          <div className="flex items-center gap-4 text-xs text-fg-subtle">
            <span>
              <strong className="text-fg">
                {developer.statistics.repository}
              </strong>{" "}
              Repositories
            </span>
            {githubLoading ? (
              <div className="flex items-center gap-4">
                <div className="w-14 h-3 loading-skeleton rounded-[2px]" />
                <div className="w-16 h-3 loading-skeleton rounded-[2px]" />
              </div>
            ) : githubData?.stats ? (
              <>
                <span>
                  <strong className="text-fg">
                    {githubData.stats.totalStars}
                  </strong>{" "}
                  Stars
                </span>
                <span>
                  <strong className="text-fg">
                    {githubData.stats.totalCommits}
                  </strong>{" "}
                  Commits (2025)
                </span>
              </>
            ) : null}
            <span>
              <strong className="text-fg">
                {developer.statistics.codeReview}
              </strong>{" "}
              Reviews
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileCard;
