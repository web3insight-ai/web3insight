import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui";
import {
  Github,
  ExternalLink,
  Share2,
  Copy,
  Loader2,
  Lock,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useAtom } from "jotai";
import clsx from "clsx";

import type { GitHubUser } from "../../typing";
import { useGitHubStats } from "../../../../hooks/useGitHubStats";
import { addToastAtom } from "#/atoms";
import { SmallCapsLabel } from "$/primitives";

interface ProfileHeaderProps {
  user: GitHubUser;
  githubUsername?: string;
  className?: string;
  analysisId?: number | null;
}

function formatNumber(num: number): string {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
  return num.toString();
}

interface StatDatum {
  label: string;
  value: string;
}

function StatColumn({ label, value }: StatDatum) {
  return (
    <div className="flex flex-col gap-1">
      <SmallCapsLabel tone="subtle">{label}</SmallCapsLabel>
      <span className="font-display text-[1.25rem] leading-[1] font-semibold tabular-nums text-fg">
        {value}
      </span>
    </div>
  );
}

export function ProfileHeader({
  user,
  githubUsername,
  className = "",
  analysisId,
}: ProfileHeaderProps) {
  const { data: githubData } = useGitHubStats(githubUsername || null);
  const [, addToast] = useAtom(addToastAtom);

  const [isPublic, setIsPublic] = useState(false);
  const [shareStatusLoading, setShareStatusLoading] = useState(false);
  const [shareUpdating, setShareUpdating] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const [origin, setOrigin] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") setOrigin(window.location.origin);
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

  useEffect(() => {
    if (!analysisId) return;
    let cancelled = false;
    const load = async () => {
      setShareStatusLoading(true);
      setShareError(null);
      try {
        const res = await fetch(`/api/analysis/users/${analysisId}`);
        if (res.status === 404) {
          if (!cancelled) setIsPublic(false);
          return;
        }
        if (!res.ok)
          throw new Error(`Failed to load share status (${res.status})`);
        const data = (await res.json()) as { public?: boolean };
        if (!cancelled && typeof data.public === "boolean")
          setIsPublic(data.public);
      } catch (error) {
        if (!cancelled) {
          setShareError(
            error instanceof Error
              ? error.message
              : "Failed to load share status",
          );
        }
      } finally {
        if (!cancelled) setShareStatusLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [analysisId]);

  const handleShareToggle = useCallback(
    async (value: boolean) => {
      if (!analysisId) return;
      setShareUpdating(true);
      setShareError(null);
      try {
        const res = await fetch(`/api/analysis/users/${analysisId}/share`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ share: value }),
        });
        if (!res.ok) {
          const body = (await res.json().catch(() => null)) as {
            message?: string;
          } | null;
          throw new Error(
            body?.message || `Failed to update share (${res.status})`,
          );
        }
        setIsPublic(value);
        addToast({
          type: "success",
          title: value ? "DevInsight shared" : "DevInsight private",
          message: value
            ? "Your analysis is now publicly accessible."
            : "Public access has been disabled.",
        });
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to update share setting";
        setShareError(message);
        addToast({ type: "error", title: "Unable to update share", message });
      } finally {
        setShareUpdating(false);
      }
    },
    [analysisId, addToast],
  );

  const handleCopyLink = useCallback(async () => {
    if (!analysisId) return;
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
      addToast({
        type: "error",
        title: "Unable to copy link",
        message: error instanceof Error ? error.message : "Copy failed",
      });
    }
  }, [analysisId, addToast, sharePath, shareUrl]);

  const stats: StatDatum[] = [
    { label: "Repositories", value: formatNumber(user.public_repos) },
    { label: "Followers", value: formatNumber(user.followers) },
    { label: "Following", value: formatNumber(user.following) },
  ];

  if (githubData?.stats) {
    stats.push(
      { label: "Stars earned", value: String(githubData.stats.totalStars) },
      { label: "Commits 2025", value: String(githubData.stats.totalCommits) },
    );
  }

  return (
    <section
      className={`flex flex-col gap-6 border-t border-rule-strong pt-8 ${className}`}
    >
      <div className="flex items-start justify-between gap-6 flex-wrap">
        <div className="flex items-start gap-5 min-w-0">
          {/* Square avatar — on-chain-native convention for identity subjects */}
          <div className="relative size-16 shrink-0 overflow-hidden rounded-[2px] border border-rule bg-bg-raised">
            {user.avatar_url ? (
              <Image
                src={user.avatar_url}
                alt={user.name || user.login}
                fill
                sizes="64px"
                className="object-cover"
              />
            ) : (
              <div className="flex size-full items-center justify-center font-display text-xl font-semibold text-fg-muted">
                {(user.name || user.login).slice(0, 1).toUpperCase()}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1.5 min-w-0">
            <div className="flex items-baseline gap-3 flex-wrap">
              <h2 className="font-display text-[1.5rem] leading-[1.1] font-semibold tracking-[-0.01em] text-fg truncate">
                {user.name || user.login}
              </h2>
              {githubData?.stats?.rank && (
                <span className="font-mono text-[0.75rem] uppercase tracking-[0.14em] text-accent">
                  rank · {githubData.stats.rank}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 text-[0.8125rem] flex-wrap">
              <Link
                href={user.html_url || `https://github.com/${user.login}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-mono text-fg-muted hover:text-fg transition-colors"
              >
                <Github size={12} />
                <span>@{user.login}</span>
                <ExternalLink size={10} />
              </Link>
              {user.company && (
                <span className="font-mono text-fg-subtle">
                  · {user.company}
                </span>
              )}
              {user.location && (
                <span className="font-mono text-fg-subtle">
                  · {user.location}
                </span>
              )}
            </div>

            {user.bio && (
              <p className="text-[0.9375rem] leading-[1.5] text-fg-muted max-w-[var(--measure)] mt-1">
                {user.bio}
              </p>
            )}
          </div>
        </div>

        {analysisId && (
          <Popover>
            <PopoverTrigger
              className={clsx(
                "shrink-0 items-center gap-2 h-8 px-2.5 rounded-[2px]",
                "font-sans text-[0.6875rem] font-medium uppercase tracking-[0.14em]",
                "transition-colors duration-150 cursor-pointer select-none",
                "hover:bg-bg-sunken focus-visible:bg-bg-sunken",
                isPublic ? "text-fg" : "text-fg-muted hover:text-fg",
                (shareUpdating || shareStatusLoading) &&
                  "opacity-60 pointer-events-none",
              )}
            >
              {shareUpdating || shareStatusLoading ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Share2 size={12} strokeWidth={1.75} />
              )}
              <span>{isPublic ? "Public" : "Share"}</span>
              {isPublic && (
                <span
                  aria-hidden
                  className="ml-0.5 size-[6px] rounded-full bg-accent"
                />
              )}
            </PopoverTrigger>
            <PopoverContent
              side="bottom"
              align="end"
              sideOffset={10}
              className="w-[22rem] overflow-hidden"
            >
              <div className="flex flex-col">
                {/* Heading */}
                <div className="px-5 pt-4 pb-4 flex flex-col gap-1.5">
                  <SmallCapsLabel>Share your DevInsight</SmallCapsLabel>
                  <p className="text-[0.8125rem] leading-[1.5] text-fg-muted">
                    Public access lets anyone with the link read the full brief.
                  </p>
                </div>

                {/* Visibility — typographic segmented toggle */}
                <div className="px-5 pt-3 pb-4 border-t border-rule flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <SmallCapsLabel tone="subtle">Visibility</SmallCapsLabel>
                    {(shareUpdating || shareStatusLoading) && (
                      <Loader2
                        size={11}
                        className="animate-spin text-fg-subtle"
                      />
                    )}
                  </div>
                  <div
                    role="group"
                    aria-label="Visibility"
                    className="grid grid-cols-2 border border-rule rounded-[2px] divide-x divide-rule overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        if (isPublic) handleShareToggle(false);
                      }}
                      aria-pressed={!isPublic}
                      disabled={shareUpdating || shareStatusLoading}
                      className={clsx(
                        "h-9 inline-flex items-center justify-center gap-1.5",
                        "text-[0.6875rem] font-medium uppercase tracking-[0.14em]",
                        "transition-colors duration-150 disabled:cursor-not-allowed",
                        !isPublic
                          ? "bg-fg text-bg"
                          : "text-fg-muted hover:text-fg hover:bg-bg-sunken",
                      )}
                    >
                      <Lock size={10} strokeWidth={2.25} />
                      <span>Private</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!isPublic) handleShareToggle(true);
                      }}
                      aria-pressed={isPublic}
                      disabled={shareUpdating || shareStatusLoading}
                      className={clsx(
                        "h-9 inline-flex items-center justify-center gap-2",
                        "text-[0.6875rem] font-medium uppercase tracking-[0.14em]",
                        "transition-colors duration-150 disabled:cursor-not-allowed",
                        isPublic
                          ? "bg-accent text-accent-fg"
                          : "text-fg-muted hover:text-fg hover:bg-bg-sunken",
                      )}
                    >
                      <span
                        aria-hidden
                        className={clsx(
                          "size-[6px] rounded-full transition-opacity",
                          isPublic ? "bg-accent-fg opacity-100" : "opacity-0",
                        )}
                      />
                      <span>Public</span>
                    </button>
                  </div>
                </div>

                {/* Public URL rail */}
                {isPublic && (
                  <div className="px-5 pt-3 pb-4 border-t border-rule flex flex-col gap-2 animate-fade-in">
                    <SmallCapsLabel tone="subtle">Public URL</SmallCapsLabel>
                    <div className="flex items-stretch border border-rule rounded-[2px] bg-bg focus-within:border-accent transition-colors">
                      <span
                        aria-hidden
                        className="pl-2.5 pr-1 flex items-center font-mono text-[0.75rem] text-accent select-none"
                      >
                        ›
                      </span>
                      <input
                        readOnly
                        value={shareUrl}
                        aria-label="Public URL"
                        onFocus={(e) => e.currentTarget.select()}
                        className="flex-1 min-w-0 bg-transparent py-2 pr-2 font-mono text-[0.75rem] text-fg outline-none truncate"
                      />
                      <button
                        type="button"
                        onClick={handleCopyLink}
                        className={clsx(
                          "shrink-0 inline-flex items-center gap-1.5 px-3 border-l border-rule",
                          "text-[0.6875rem] font-medium uppercase tracking-[0.14em]",
                          "text-fg-muted hover:text-accent hover:bg-accent-subtle",
                          "transition-colors duration-150",
                        )}
                      >
                        <Copy size={11} strokeWidth={1.75} />
                        <span>Copy</span>
                      </button>
                    </div>
                  </div>
                )}

                {shareError && (
                  <div className="px-5 pb-4 -mt-1">
                    <p className="text-[0.75rem] text-danger">{shareError}</p>
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>

      {/* Stats as inline small-caps + display numbers, separated by hairlines */}
      <div className="grid grid-cols-3 md:grid-cols-5 gap-x-8 gap-y-6 border-t border-rule pt-5">
        {stats.map((s) => (
          <StatColumn key={s.label} label={s.label} value={s.value} />
        ))}
      </div>
    </section>
  );
}
