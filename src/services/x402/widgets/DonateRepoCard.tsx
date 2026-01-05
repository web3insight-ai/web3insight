"use client";

import { Avatar } from "@nextui-org/react";
import { Star, ExternalLink } from "lucide-react";
import { DonateButton } from "./DonateButton";
import type { DonateRepo } from "../typing";

interface DonateRepoCardProps {
  repo: DonateRepo;
}

export function DonateRepoCard({ repo }: DonateRepoCardProps) {
  const { repo_info, repo_donate_data } = repo;
  const hasDonationConfig = repo_donate_data?.payTo;

  return (
    <div className="group p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
      {/* Header: Avatar + Name + Star */}
      <div className="flex items-center gap-3 mb-2">
        <Avatar
          src={repo_info.owner.avatar_url}
          size="sm"
          radius="lg"
          className="flex-shrink-0"
        />
        <div className="flex-1 min-w-0 flex items-center gap-2">
          <a
            href={repo_info.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-gray-900 dark:text-white hover:text-primary transition-colors truncate"
          >
            {repo_info.full_name}
          </a>
          <ExternalLink size={12} className="flex-shrink-0 text-gray-300" />
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-400 flex-shrink-0">
          <Star size={12} />
          <span>{repo_info.stargazers_count.toLocaleString()}</span>
        </div>
      </div>

      {/* Title */}
      {repo_donate_data?.title && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 ml-11">
          {repo_donate_data.title}
        </p>
      )}

      {/* Description */}
      {repo_info.description && (
        <p className="text-xs text-gray-500 line-clamp-2 mb-3 ml-11">
          {repo_info.description}
        </p>
      )}

      {/* Footer: Meta + Action */}
      <div className="flex items-center justify-between ml-11">
        {hasDonationConfig ? (
          <>
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span className="font-mono">
                {repo_donate_data.payTo.slice(0, 6)}...
                {repo_donate_data.payTo.slice(-4)}
              </span>
              {repo_donate_data.defaultAmount && (
                <span>${repo_donate_data.defaultAmount}</span>
              )}
            </div>
            <DonateButton
              payTo={repo_donate_data.payTo}
              title={repo_donate_data.title || repo_info.full_name}
              defaultAmount={repo_donate_data.defaultAmount}
              recipients={repo_donate_data.recipients}
              network={repo_donate_data.network}
            />
          </>
        ) : (
          <span className="text-xs text-gray-400">No donation config</span>
        )}
      </div>
    </div>
  );
}
