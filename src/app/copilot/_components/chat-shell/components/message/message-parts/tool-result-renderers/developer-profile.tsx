"use client";

import { ExternalLink, Github, Globe, MapPin, Twitter } from "lucide-react";
import { ToolResultCard, formatNumber, toNumber } from "./index";

interface DeveloperProfileData {
  username: string;
  name: string;
  bio: string;
  location: string;
  avatar: string;
  statistics: {
    repositories: number;
    pullRequests: number;
    codeReviews: number;
  };
  social: {
    github: string;
    twitter: string | null;
    website: string | null;
  };
  joinedGitHub: string;
}

function isValidData(data: unknown): data is DeveloperProfileData {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;

  if (typeof d.username !== "string" || typeof d.name !== "string") {
    return false;
  }

  if (!d.statistics || typeof d.statistics !== "object") return false;
  const stats = d.statistics as Record<string, unknown>;
  if (
    toNumber(stats.repositories) === null ||
    toNumber(stats.pullRequests) === null ||
    toNumber(stats.codeReviews) === null
  ) {
    return false;
  }

  return true;
}

// Reason: Social links are optional and nullable, so we filter to only render
// the ones that have a valid URL.
interface SocialLink {
  label: string;
  url: string;
  Icon: typeof Github;
}

function buildSocialLinks(
  social: DeveloperProfileData["social"],
): SocialLink[] {
  const links: SocialLink[] = [];

  if (social.github) {
    links.push({ label: "GitHub", url: social.github, Icon: Github });
  }
  if (social.twitter) {
    links.push({ label: "Twitter", url: social.twitter, Icon: Twitter });
  }
  if (social.website) {
    links.push({ label: "Website", url: social.website, Icon: Globe });
  }

  return links;
}

function AvatarImage({ avatar, name }: { avatar: string; name: string }) {
  const initial = (name || "?").charAt(0).toUpperCase();

  if (!avatar) {
    return (
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-teal-100 text-sm font-bold text-teal-600 dark:bg-teal-500/20 dark:text-teal-400">
        {initial}
      </div>
    );
  }

  return (
    <img
      src={avatar}
      alt={name}
      className="size-10 shrink-0 rounded-full object-cover"
      onError={(e) => {
        // Reason: Fallback to initial when the avatar URL fails to load
        const target = e.currentTarget;
        target.style.display = "none";
        const fallback = target.nextElementSibling;
        if (fallback instanceof HTMLElement) {
          fallback.style.display = "flex";
        }
      }}
    />
  );
}

const STAT_ITEMS = [
  { key: "repositories" as const, label: "repos" },
  { key: "pullRequests" as const, label: "PRs" },
  { key: "codeReviews" as const, label: "reviews" },
];

export default function DeveloperProfileResult({ data }: { data: unknown }) {
  if (!isValidData(data)) {
    return (
      <p className="text-sm text-muted-foreground">Unable to display results</p>
    );
  }

  const socialLinks = buildSocialLinks(
    data.social ?? { github: "", twitter: null, website: null },
  );

  // Reason: Coerce string values to numbers for display
  const coercedStats = {
    repositories: toNumber(data.statistics.repositories) ?? 0,
    pullRequests: toNumber(data.statistics.pullRequests) ?? 0,
    codeReviews: toNumber(data.statistics.codeReviews) ?? 0,
  };

  return (
    <ToolResultCard>
      {/* Header: Avatar + Name */}
      <div className="flex items-center gap-3">
        <AvatarImage avatar={data.avatar} name={data.name} />
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-gray-900 dark:text-white">
            {data.name}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            @{data.username}
          </p>
        </div>
      </div>

      {/* Bio */}
      {data.bio && (
        <p className="mt-2 line-clamp-2 text-sm text-gray-700 dark:text-gray-300">
          {data.bio}
        </p>
      )}

      {/* Location */}
      {data.location && (
        <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="size-3" />
          <span>{data.location}</span>
        </div>
      )}

      {/* Stats */}
      <div className="mt-3 flex flex-wrap gap-2">
        {STAT_ITEMS.map((item) => (
          <span
            key={item.key}
            className="inline-flex items-center gap-1 rounded-md bg-muted/40 px-2 py-1 text-xs dark:bg-muted/20"
          >
            <span className="font-semibold tabular-nums text-gray-900 dark:text-white">
              {formatNumber(coercedStats[item.key])}
            </span>
            <span className="text-muted-foreground">{item.label}</span>
          </span>
        ))}
      </div>

      {/* Social Links */}
      {socialLinks.length > 0 && (
        <div className="mt-3 flex items-center gap-3">
          {socialLinks.map((link) => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-gray-900 dark:hover:text-white"
              aria-label={link.label}
            >
              <link.Icon className="size-3.5" />
              <ExternalLink className="size-2.5" />
            </a>
          ))}
        </div>
      )}
    </ToolResultCard>
  );
}
