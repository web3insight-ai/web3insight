import {
  Avatar,
  Button,
  Input,
  Switch,
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui";
import {
  Github,
  Building,
  ExternalLink,
  Share2,
  Copy,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useAtom } from "jotai";

import type { GitHubUser } from "../../typing";
import { useGitHubStats } from "../../../../hooks/useGitHubStats";
import { addToastAtom } from "#/atoms";

interface ProfileHeaderProps {
  user: GitHubUser;
  githubUsername?: string;
  className?: string;
  analysisId?: number | null;
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
}

export function ProfileHeader({
  user,
  githubUsername,
  className = "",
  analysisId,
}: ProfileHeaderProps) {
  const { data: githubData } = useGitHubStats(githubUsername || null);
  const [, addToast] = useAtom(addToastAtom);

  // Share state
  const [isPublic, setIsPublic] = useState(false);
  const [shareStatusLoading, setShareStatusLoading] = useState(false);
  const [shareUpdating, setShareUpdating] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const [origin, setOrigin] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const sharePath = useMemo(
    () => (analysisId ? `/devinsight/${analysisId}` : ""),
    [analysisId],
  );

  const shareUrl = useMemo(() => {
    if (!sharePath) return "";
    if (origin) return `${origin}${sharePath}`;
    return sharePath;
  }, [origin, sharePath]);

  // Fetch share status when analysisId is available
  useEffect(() => {
    if (!analysisId) {
      return;
    }

    let isCancelled = false;

    const fetchShareStatus = async () => {
      setShareStatusLoading(true);
      setShareError(null);

      try {
        const response = await fetch(`/api/analysis/users/${analysisId}`);

        if (response.status === 404) {
          if (!isCancelled) {
            setIsPublic(false);
            setShareError(null);
          }
          return;
        }

        if (!response.ok) {
          const message = `Failed to load share status (${response.status})`;
          throw new Error(message);
        }

        const data = (await response.json()) as { public?: boolean };

        if (!isCancelled && typeof data.public === "boolean") {
          setIsPublic(data.public);
        }
      } catch (error) {
        if (!isCancelled) {
          const message =
            error instanceof Error
              ? error.message
              : "Failed to load share status";
          setShareError(message);
          console.error("[ProfileHeader] loadShareStatus error", error);
        }
      } finally {
        if (!isCancelled) {
          setShareStatusLoading(false);
        }
      }
    };

    fetchShareStatus();

    return () => {
      isCancelled = true;
    };
  }, [analysisId]);

  const handleShareToggle = useCallback(
    async (value: boolean) => {
      if (!analysisId) {
        return;
      }

      setShareUpdating(true);
      setShareError(null);

      try {
        const response = await fetch(
          `/api/analysis/users/${analysisId}/share`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ share: value }),
          },
        );

        if (!response.ok) {
          const errorBody = (await response.json().catch(() => null)) as {
            message?: string;
          } | null;
          const message =
            errorBody?.message ||
            `Failed to update share setting (${response.status})`;
          throw new Error(message);
        }

        setIsPublic(value);

        addToast({
          type: "success",
          title: value ? "DevInsight shared" : "DevInsight private",
          message: value
            ? "Your DevInsight analysis is now publicly accessible."
            : "Public access has been disabled.",
        });
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to update share setting";
        setShareError(message);
        addToast({
          type: "error",
          title: "Unable to update share",
          message,
        });
      } finally {
        setShareUpdating(false);
      }
    },
    [analysisId, addToast],
  );

  const handleCopyLink = useCallback(async () => {
    if (!analysisId) {
      return;
    }

    const link =
      shareUrl ||
      (typeof window !== "undefined"
        ? `${window.location.origin}${sharePath}`
        : sharePath);

    try {
      await navigator.clipboard.writeText(link);
      addToast({
        type: "success",
        title: "Link copied",
        message: "Public DevInsight URL copied to clipboard.",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Copy failed";
      addToast({
        type: "error",
        title: "Unable to copy link",
        message,
      });
    }
  }, [analysisId, addToast, sharePath, shareUrl]);

  return (
    <div
      className={`bg-white dark:bg-surface-dark shadow-subtle border border-border dark:border-border-dark compact-card ${className}`}
    >
      <div className="flex items-center gap-3">
        {/* Avatar - Prominent */}
        <Avatar
          src={user.avatar_url}
          name={user.name || user.login}
          className="w-14 h-14"
          isBordered
          radius="full"
        />

        {/* User Info - Full Width Layout */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                {user.name || user.login}
              </h1>
              {githubData?.stats?.rank && (
                <span className="text-sm font-bold px-3 py-1 rounded-lg bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700">
                  {githubData.stats.rank}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {/* Share Button with Popover */}
              {analysisId && (
                <Popover
                  placement="bottom-end"
                  showArrow
                  backdrop="transparent"
                  classNames={{
                    content:
                      "p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg",
                  }}
                >
                  <PopoverTrigger>
                    <Button
                      variant={isPublic ? "flat" : "light"}
                      color="primary"
                      size="sm"
                      startContent={
                        shareUpdating || shareStatusLoading ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Share2 size={14} />
                        )
                      }
                      className="text-xs h-7 px-2 min-w-0"
                      isDisabled={shareUpdating || shareStatusLoading}
                    >
                      {isPublic ? "PUBLIC" : "Share"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <div className="w-80 space-y-3">
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                          Share your DevInsight
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Make this analysis public and share it with others
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <Switch
                          color="primary"
                          size="sm"
                          isSelected={isPublic}
                          onValueChange={handleShareToggle}
                          isDisabled={shareUpdating || shareStatusLoading}
                          aria-label="Toggle public sharing"
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Make public
                        </span>
                      </div>

                      {isPublic && (
                        <div className="space-y-2">
                          <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
                            Public URL
                          </div>
                          <div className="flex items-center gap-2">
                            <Input
                              value={shareUrl}
                              readOnly
                              size="sm"
                              variant="bordered"
                              className="flex-1"
                              classNames={{
                                inputWrapper:
                                  "bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 h-8",
                                input: "text-xs font-mono",
                              }}
                              aria-label="Public URL for sharing"
                            />
                            <Button
                              variant="flat"
                              color="primary"
                              size="sm"
                              onPress={handleCopyLink}
                              startContent={<Copy size={12} />}
                              className="text-xs h-8 px-2 min-w-0"
                            >
                              Copy
                            </Button>
                          </div>
                        </div>
                      )}

                      {shareError && (
                        <p className="text-xs text-danger">{shareError}</p>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              )}

              <Link
                href={user.html_url || `https://github.com/${user.login}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                <Github size={12} />
                <span>@{user.login}</span>
                <ExternalLink size={10} />
              </Link>
              {user.company && (
                <div className="flex items-center gap-1">
                  <Building size={12} className="text-gray-400" />
                  <span className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-32">
                    {user.company}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Stats Row - Clean and Consistent */}
          <div className="flex items-center gap-6 text-xs">
            <span className="text-gray-600 dark:text-gray-400">
              <strong className="text-gray-900 dark:text-white text-sm">
                {formatNumber(user.public_repos)}
              </strong>{" "}
              Repositories
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              <strong className="text-gray-900 dark:text-white text-sm">
                {formatNumber(user.followers)}
              </strong>{" "}
              Followers
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              <strong className="text-gray-900 dark:text-white text-sm">
                {formatNumber(user.following)}
              </strong>{" "}
              Following
            </span>

            {/* GitHub Activity Stats - No Icons for Consistency */}
            {githubData?.stats && (
              <>
                <span className="text-gray-600 dark:text-gray-400">
                  <strong className="text-gray-900 dark:text-white text-sm">
                    {githubData.stats.totalStars}
                  </strong>{" "}
                  Stars
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  <strong className="text-gray-900 dark:text-white text-sm">
                    {githubData.stats.totalCommits}
                  </strong>{" "}
                  Commits (2025)
                </span>
              </>
            )}
          </div>

          {/* Bio - Compact */}
          {user.bio && (
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-1">
              {user.bio}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
