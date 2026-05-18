"use client";

import {
  CheckIcon,
  CopyIcon,
  KeyRoundIcon,
  Loader2Icon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { ShadcnButton as Button } from "@/components/ui/shadcn-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/shadcn-dialog";
import { Input } from "@/components/ui/input";

interface TokenRecord {
  createdAt: string;
  id: string;
  lastUsedAt: string | null;
  name: string;
  tokenPreview: string;
}

interface CreatedToken {
  token: string;
  tokenRecord: TokenRecord;
}

const MCP_ENDPOINT_PATH = "/api/ai/mcp";

function formatRelative(value: string | null): string {
  if (!value) {
    return "Never";
  }
  const ts = Date.parse(value);
  if (Number.isNaN(ts)) {
    return value;
  }
  const diff = Date.now() - ts;
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(ts).toLocaleDateString();
}

function getEndpointUrl(): string {
  if (typeof window === "undefined") {
    return MCP_ENDPOINT_PATH;
  }
  return `${window.location.origin}${MCP_ENDPOINT_PATH}`;
}

function buildMcpServersConfig(endpointUrl: string, token: string): string {
  return JSON.stringify(
    {
      mcpServers: {
        web3insight: {
          url: endpointUrl,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      },
    },
    null,
    2,
  );
}

interface CopilotMcpTokensDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CopilotMcpTokensDialog({
  isOpen,
  onOpenChange,
}: CopilotMcpTokensDialogProps) {
  const [tokens, setTokens] = useState<TokenRecord[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [newTokenName, setNewTokenName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createdToken, setCreatedToken] = useState<CreatedToken | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedConfig, setCopiedConfig] = useState(false);

  const [revokingId, setRevokingId] = useState<string | null>(null);

  const endpointUrl = useMemo(() => getEndpointUrl(), []);
  const configSnippet = useMemo(
    () =>
      createdToken
        ? buildMcpServersConfig(endpointUrl, createdToken.token)
        : "",
    [createdToken, endpointUrl],
  );

  const loadTokens = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/ai/mcp/tokens", {
        cache: "no-store",
      });
      const body = (await res.json().catch(() => ({}))) as
        | { tokens?: TokenRecord[] }
        | { error?: string };
      if (!res.ok) {
        const message =
          "error" in body && typeof body.error === "string"
            ? body.error
            : "Failed to load MCP tokens";
        throw new Error(message);
      }
      const list = ("tokens" in body && body.tokens) || [];
      setTokens(list);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load MCP tokens";
      setErrorMessage(message);
      setTokens([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    setCreatedToken(null);
    setNewTokenName("");
    setCopiedToken(false);
    setCopiedConfig(false);
    void loadTokens();
  }, [isOpen, loadTokens]);

  const handleCreate = useCallback(async () => {
    const trimmed = newTokenName.trim();
    if (!trimmed) {
      setErrorMessage("Name is required");
      return;
    }
    setIsCreating(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/ai/mcp/tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      const body = (await res.json().catch(() => ({}))) as
        | CreatedToken
        | { error?: string };
      if (!res.ok || !("token" in body)) {
        const message =
          body && "error" in body && typeof body.error === "string"
            ? body.error
            : "Failed to create MCP token";
        throw new Error(message);
      }
      setCreatedToken(body);
      setNewTokenName("");
      setTokens((prev) =>
        prev ? [body.tokenRecord, ...prev] : [body.tokenRecord],
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create MCP token";
      setErrorMessage(message);
    } finally {
      setIsCreating(false);
    }
  }, [newTokenName]);

  const handleRevoke = useCallback(async (tokenId: string) => {
    setRevokingId(tokenId);
    setErrorMessage(null);
    try {
      const res = await fetch(`/api/ai/mcp/tokens/${tokenId}`, {
        method: "DELETE",
      });
      const body = (await res.json().catch(() => ({}))) as {
        error?: string;
        success?: true;
      };
      if (!res.ok || body.success !== true) {
        const message =
          body && typeof body.error === "string"
            ? body.error
            : "Failed to revoke MCP token";
        throw new Error(message);
      }
      setTokens((prev) =>
        prev ? prev.filter((token) => token.id !== tokenId) : prev,
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to revoke MCP token";
      setErrorMessage(message);
    } finally {
      setRevokingId(null);
    }
  }, []);

  const handleCopy = useCallback(
    (value: string, marker: "token" | "config") => {
      void navigator.clipboard.writeText(value).then(() => {
        if (marker === "token") {
          setCopiedToken(true);
          setTimeout(() => setCopiedToken(false), 2000);
        } else {
          setCopiedConfig(true);
          setTimeout(() => setCopiedConfig(false), 2000);
        }
      });
    },
    [],
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[calc(100%-2rem)] p-0 sm:max-w-2xl">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle className="text-balance">MCP access tokens</DialogTitle>
          <DialogDescription className="text-pretty">
            Personal access tokens that let MCP-compatible clients (Claude
            Desktop, VS Code, Cursor, etc.) call Web3Insight Copilot tools on
            your behalf.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 p-4 sm:p-6">
          {errorMessage && (
            <div className="rounded-[2px] border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
              {errorMessage}
            </div>
          )}

          {createdToken ? (
            <section className="rounded-[2px] border border-primary/30 bg-primary/5 p-4">
              <h3 className="text-sm font-medium">
                Token created. Save it now — it will not be shown again.
              </h3>
              <div className="mt-3 flex items-center gap-2">
                <code className="flex-1 truncate rounded-[2px] border border-rule bg-background px-3 py-2 font-mono text-xs">
                  {createdToken.token}
                </code>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopy(createdToken.token, "token")}
                >
                  {copiedToken ? (
                    <CheckIcon className="size-3.5" />
                  ) : (
                    <CopyIcon className="size-3.5" />
                  )}
                  {copiedToken ? "Copied" : "Copy token"}
                </Button>
              </div>
              <h4 className="mt-4 text-xs font-medium text-muted-foreground">
                Add to your MCP client config (`~/.cursor/mcp.json`,
                `~/Library/Application
                Support/Claude/claude_desktop_config.json`, etc.)
              </h4>
              <div className="mt-2 flex items-start gap-2">
                <pre className="flex-1 overflow-auto rounded-[2px] border border-rule bg-background px-3 py-2 font-mono text-xs leading-relaxed">
                  {configSnippet}
                </pre>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopy(configSnippet, "config")}
                >
                  {copiedConfig ? (
                    <CheckIcon className="size-3.5" />
                  ) : (
                    <CopyIcon className="size-3.5" />
                  )}
                  {copiedConfig ? "Copied" : "Copy config"}
                </Button>
              </div>
              <div className="mt-3 text-right">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setCreatedToken(null)}
                >
                  Dismiss
                </Button>
              </div>
            </section>
          ) : (
            <section>
              <h3 className="text-sm font-medium">Create a new token</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Give it a name you'll recognize (e.g. "claude-desktop").
              </p>
              <div className="mt-3 flex items-center gap-2">
                <Input
                  value={newTokenName}
                  onChange={(event) => setNewTokenName(event.target.value)}
                  placeholder="Token name"
                  maxLength={80}
                  disabled={isCreating}
                  className="flex-1"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleCreate}
                  disabled={isCreating || newTokenName.trim().length === 0}
                >
                  {isCreating ? (
                    <Loader2Icon className="size-3.5 animate-spin" />
                  ) : (
                    <PlusIcon className="size-3.5" />
                  )}
                  Create token
                </Button>
              </div>
            </section>
          )}

          <section>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Active tokens</h3>
              {!isLoading && tokens && (
                <span className="text-xs text-muted-foreground">
                  {tokens.length} {tokens.length === 1 ? "token" : "tokens"}
                </span>
              )}
            </div>
            <div className="mt-3 space-y-2">
              {isLoading ? (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  <Loader2Icon className="size-4 animate-spin" />
                </div>
              ) : tokens && tokens.length > 0 ? (
                tokens.map((token) => (
                  <div
                    key={token.id}
                    className="flex items-center justify-between gap-3 rounded-[2px] border border-rule px-3 py-2"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <KeyRoundIcon className="text-muted-foreground size-4 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">
                          {token.name}
                        </div>
                        <div className="text-muted-foreground flex flex-wrap gap-x-3 text-xs">
                          <span className="font-mono">
                            {token.tokenPreview}
                          </span>
                          <span>Created {formatRelative(token.createdAt)}</span>
                          <span>
                            Last used {formatRelative(token.lastUsedAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleRevoke(token.id)}
                      disabled={revokingId === token.id}
                    >
                      {revokingId === token.id ? (
                        <Loader2Icon className="size-3.5 animate-spin" />
                      ) : (
                        <Trash2Icon className="size-3.5" />
                      )}
                      Revoke
                    </Button>
                  </div>
                ))
              ) : (
                <div className="rounded-[2px] border border-dashed border-rule px-4 py-6 text-center text-sm text-muted-foreground">
                  No active tokens. Create one above to start using the
                  Web3Insight MCP endpoint.
                </div>
              )}
            </div>
          </section>

          <section className="rounded-[2px] border border-rule bg-muted/30 p-3 text-xs text-muted-foreground">
            <p>
              <span className="font-medium text-foreground">Endpoint:</span>{" "}
              <code className="font-mono">{endpointUrl}</code>
            </p>
            <p className="mt-1">
              Send your token as{" "}
              <code>Authorization: Bearer &lt;token&gt;</code>. MCP clients that
              take a `url` + `headers` JSON config can use the snippet shown
              above when you create a token.
            </p>
          </section>
        </div>

        <DialogFooter className="border-t border-rule px-4 py-3 sm:px-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
