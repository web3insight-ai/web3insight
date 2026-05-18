"use client";

import { CheckIcon, CopyIcon, Loader2Icon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { ShadcnButton as Button } from "@/components/ui/shadcn-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/shadcn-dialog";
import { Switch } from "@/components/ui/switch";

type AccessLevel = "private" | "public";

interface CopilotShareDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId: string;
}

interface AccessResponse {
  accessLevel: AccessLevel;
  isOwner: boolean;
  viewerAccess: "full" | "read" | "none";
}

/**
 * Owner-only dialog for toggling a thread between private and public and
 * copying the resulting share URL. Pairs with the new
 * GET/PATCH /api/ai/sessions/[sessionId]/access route.
 */
export function CopilotShareDialog({
  isOpen,
  onOpenChange,
  sessionId,
}: CopilotShareDialogProps) {
  const [accessLevel, setAccessLevel] = useState<AccessLevel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const shareUrl =
    accessLevel === "public" && typeof window !== "undefined"
      ? `${window.location.origin}/copilot/share/${sessionId}`
      : "";

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    let cancelled = false;
    setErrorMessage(null);
    setIsLoading(true);
    void fetch(`/api/ai/sessions/${sessionId}/access`)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Failed to load access (${res.status})`);
        }
        return res.json() as Promise<AccessResponse>;
      })
      .then((data) => {
        if (cancelled) return;
        setAccessLevel(data.accessLevel);
      })
      .catch((loadError) => {
        if (cancelled) return;
        console.error("[copilot-share] Failed to load access:", loadError);
        setErrorMessage("Could not load share state.");
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen, sessionId]);

  const updateAccessLevel = useCallback(
    async (nextLevel: AccessLevel) => {
      setIsUpdating(true);
      setErrorMessage(null);
      try {
        const res = await fetch(`/api/ai/sessions/${sessionId}/access`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accessLevel: nextLevel }),
        });
        if (!res.ok) {
          throw new Error(`Update failed (${res.status})`);
        }
        const data = (await res.json()) as AccessResponse;
        setAccessLevel(data.accessLevel);
      } catch (updateError) {
        console.error("[copilot-share] Failed to update access:", updateError);
        setErrorMessage("Could not update share state.");
      } finally {
        setIsUpdating(false);
      }
    },
    [sessionId],
  );

  const handleCopy = useCallback(() => {
    if (!shareUrl) {
      return;
    }
    void navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        setIsCopied(true);
        window.setTimeout(() => setIsCopied(false), 2000);
      })
      .catch(() => {
        setErrorMessage("Could not copy to clipboard.");
      });
  }, [shareUrl]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share this chat</DialogTitle>
          <DialogDescription>
            Anyone with the link can view this conversation — including the tool
            calls and rich results. They cannot continue or edit it.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-fg-muted">
              <Loader2Icon className="size-4 animate-spin" />
              Loading current state…
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between rounded-[2px] border border-rule bg-bg-sunken/40 px-3 py-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-fg">
                    {accessLevel === "public" ? "Public link" : "Private chat"}
                  </p>
                  <p className="mt-0.5 text-xs text-fg-muted">
                    {accessLevel === "public"
                      ? "Anyone with the URL can read this thread."
                      : "Only you can see this thread."}
                  </p>
                </div>
                <Switch
                  isSelected={accessLevel === "public"}
                  onValueChange={(checked) => {
                    if (isUpdating || accessLevel === null) return;
                    void updateAccessLevel(checked ? "public" : "private");
                  }}
                  size="md"
                  aria-label="Toggle public sharing"
                />
              </div>

              {accessLevel === "public" ? (
                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    value={shareUrl}
                    className="flex-1 truncate rounded-[2px] border border-rule bg-bg-sunken px-3 py-1.5 font-mono text-xs text-fg"
                    onFocus={(event) => event.currentTarget.select()}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5"
                    onClick={handleCopy}
                  >
                    {isCopied ? (
                      <>
                        <CheckIcon className="size-3.5" />
                        Copied
                      </>
                    ) : (
                      <>
                        <CopyIcon className="size-3.5" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              ) : null}

              {errorMessage ? (
                <p className="text-xs text-destructive">{errorMessage}</p>
              ) : null}
            </>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
