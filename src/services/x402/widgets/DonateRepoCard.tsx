"use client";

import { Avatar, Link } from "@nextui-org/react";
import { Star, ExternalLink, LinkIcon } from "lucide-react";
import { DonateButton } from "./DonateButton";
import type { DonateRepo } from "../typing";
import type { DonationLink } from "@/lib/api/types";

interface DonateRepoCardProps {
  repo: DonateRepo;
}

const REPO_LABELS = ["repository", "repo", "github"];

/**
 * Check if a link is a repository link
 */
function isRepoLink(link: DonationLink): boolean {
  return REPO_LABELS.includes(link.label.toLowerCase());
}

/**
 * Extract repo path from GitHub URL (e.g., "owner/repo")
 */
function extractRepoPath(url: string): string | null {
  try {
    const parsed = new URL(url);
    const match = parsed.pathname.match(/^\/([^/]+\/[^/]+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

/**
 * Extract display text from link URL based on label type
 */
function getLinkDisplayText(link: DonationLink): string {
  try {
    const url = new URL(link.url);
    // For website/other links, show domain without www prefix
    return url.hostname.replace(/^www\./, "");
  } catch {
    return link.label;
  }
}

export function DonateRepoCard({ repo }: DonateRepoCardProps) {
  const { repo_info, repo_donate_data } = repo;
  const hasDonationConfig = repo_donate_data?.payTo;
  const creator = repo_donate_data?.creator;
  const links = repo_donate_data?.links ?? [];

  // Reason: Find repository link from config, use it for header
  const repoLink = links.find(isRepoLink);
  const repoUrl = repoLink?.url ?? repo_info.html_url;
  const repoDisplayName = repoLink
    ? (extractRepoPath(repoLink.url) ?? repo_info.full_name)
    : repo_info.full_name;

  // Reason: Filter out repository links, show only other links (website, etc.)
  const otherLinks = links.filter((link) => !isRepoLink(link));

  // Reason: Use creator avatar if available, otherwise fall back to repo owner avatar
  const displayAvatar = creator?.avatar || repo_info.owner.avatar_url;

  return (
    <div className="group p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
      {/* Header: Avatar + Repo Name (from links) + Star */}
      <div className="flex items-center gap-3 mb-2">
        <Avatar
          src={displayAvatar}
          size="sm"
          radius="lg"
          className="flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <a
            href={repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white hover:text-primary transition-colors"
          >
            <span className="truncate">{repoDisplayName}</span>
            <ExternalLink size={12} className="flex-shrink-0 text-gray-300" />
          </a>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-400 flex-shrink-0">
          <Star size={12} />
          <span>{repo_info.stargazers_count.toLocaleString()}</span>
        </div>
      </div>

      {/* Creator handle with GitHub link */}
      {creator?.handle && (
        <div className="flex items-center gap-1 mb-1 ml-11">
          <span className="text-xs text-gray-400">by</span>
          <a
            href={`https://github.com/${creator.handle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-primary transition-colors"
          >
            @{creator.handle}
          </a>
        </div>
      )}

      {/* Title */}
      {repo_donate_data?.title && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 ml-11">
          {repo_donate_data.title}
        </p>
      )}

      {/* Description - use donation description if available, otherwise repo description */}
      {(repo_donate_data?.description || repo_info.description) && (
        <p className="text-xs text-gray-500 line-clamp-2 mb-2 ml-11">
          {repo_donate_data?.description || repo_info.description}
        </p>
      )}

      {/* Other Links (Website, etc.) - excluding Repository links */}
      {otherLinks.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3 ml-11">
          {otherLinks.map((link, index) => (
            <Link
              key={index}
              href={link.url}
              isExternal
              showAnchorIcon
              anchorIcon={<LinkIcon size={10} />}
              className="text-xs text-primary hover:underline"
            >
              {getLinkDisplayText(link)}
            </Link>
          ))}
        </div>
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
              defaultAmount={
                typeof repo_donate_data.defaultAmount === "string"
                  ? parseFloat(repo_donate_data.defaultAmount)
                  : repo_donate_data.defaultAmount
              }
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
