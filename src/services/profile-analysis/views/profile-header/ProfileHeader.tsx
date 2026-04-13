import {
  Button,
  Input,
  Switch,
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui";
import { Github, ExternalLink, Share2, Copy, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useAtom } from "jotai";

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
          <Popover
            placement="bottom-end"
            showArrow
            backdrop="transparent"
            classNames={{
              content: "p-4 bg-bg-raised border border-rule rounded-[2px]",
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
                className="h-8 px-3 text-xs uppercase tracking-[0.12em]"
                isDisabled={shareUpdating || shareStatusLoading}
              >
                {isPublic ? "public" : "share"}
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <div className="w-80 flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <SmallCapsLabel>Share your DevInsight</SmallCapsLabel>
                  <p className="text-xs text-fg-muted">
                    Flip public and anyone with the link can read the full
                    brief.
                  </p>
                </div>
                <div className="flex items-center gap-3 border-t border-rule pt-3">
                  <Switch
                    color="primary"
                    size="sm"
                    isSelected={isPublic}
                    onValueChange={handleShareToggle}
                    isDisabled={shareUpdating || shareStatusLoading}
                    aria-label="Toggle public sharing"
                  />
                  <span className="text-sm text-fg">Make public</span>
                </div>
                {isPublic && (
                  <div className="flex flex-col gap-1.5 border-t border-rule pt-3">
                    <SmallCapsLabel tone="subtle">Public URL</SmallCapsLabel>
                    <div className="flex items-center gap-2">
                      <Input
                        value={shareUrl}
                        readOnly
                        size="sm"
                        variant="bordered"
                        className="flex-1"
                        classNames={{
                          inputWrapper: "bg-bg border-rule h-8",
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
                        className="h-8 px-3 text-xs"
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
