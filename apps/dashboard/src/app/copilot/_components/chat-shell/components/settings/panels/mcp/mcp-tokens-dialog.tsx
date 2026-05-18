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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/shadcn-dialog";

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

function SectionLabel({ children }: { children: string }) {
  return (
    <div className="text-fg-muted font-mono text-[10px] uppercase tracking-[0.18em]">
      {children}
    </div>
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
      const res = await fetch("/api/ai/mcp/tokens", { cache: "no-store" });
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
      <DialogContent className="w-full max-w-[calc(100%-2rem)] gap-0 p-0 sm:max-w-2xl">
        <DialogHeader className="border-b border-rule px-5 py-4">
          <DialogTitle className="text-balance text-base font-semibold">
            MCP access tokens
          </DialogTitle>
          <DialogDescription className="text-fg-muted text-pretty text-xs leading-relaxed">
            Personal access tokens that let MCP-compatible clients (Claude
            Desktop, Cursor, VS Code, …) call Web3Insight Copilot tools on your
            behalf.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 px-5 py-5">
          {errorMessage ? (
            <div className="border-destructive/30 bg-destructive/5 text-destructive border px-3 py-2 text-xs">
              {errorMessage}
            </div>
          ) : null}

          {/* Endpoint info — fixed reference, always visible at top */}
          <section className="border-rule bg-bg-sunken/40 space-y-2 border p-3">
            <SectionLabel>Endpoint</SectionLabel>
            <code className="border-rule bg-bg block break-all border px-2.5 py-1.5 font-mono text-[11px]">
              {endpointUrl}
            </code>
            <p className="text-fg-muted text-[11px] leading-relaxed">
              Send your token as{" "}
              <code className="font-mono">Authorization: Bearer &lt;token&gt;</code>.
              Clients that accept a <code className="font-mono">url</code> +{" "}
              <code className="font-mono">headers</code> JSON config can paste
              the snippet shown when you create a token.
            </p>
          </section>

          {createdToken ? (
            <section className="border-accent/40 bg-accent/5 space-y-3 border p-3">
              <div className="flex items-baseline justify-between gap-3">
                <SectionLabel>Token created</SectionLabel>
                <button
                  type="button"
                  onClick={() => setCreatedToken(null)}
                  className="text-fg-muted hover:text-fg text-[11px] underline-offset-2 hover:underline"
                >
                  Dismiss
                </button>
              </div>
              <p className="text-fg text-xs leading-relaxed">
                Save it now — it will not be shown again.
              </p>

              <div className="space-y-1.5">
                <SectionLabel>Token</SectionLabel>
                <div className="flex items-stretch gap-2">
                  <code className="border-rule bg-bg flex-1 truncate border px-2.5 py-1.5 font-mono text-[11px]">
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
                    {copiedToken ? "Copied" : "Copy"}
                  </Button>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-baseline justify-between gap-2">
                  <SectionLabel>mcp.json snippet</SectionLabel>
                  <button
                    type="button"
                    onClick={() => handleCopy(configSnippet, "config")}
                    className="text-fg-muted hover:text-fg flex items-center gap-1 text-[11px]"
                  >
                    {copiedConfig ? (
                      <CheckIcon className="size-3" />
                    ) : (
                      <CopyIcon className="size-3" />
                    )}
                    {copiedConfig ? "Copied" : "Copy config"}
                  </button>
                </div>
                <pre className="border-rule bg-bg overflow-x-auto border p-2.5 font-mono text-[11px] leading-relaxed">
                  {configSnippet}
                </pre>
                <p className="text-fg-muted text-[11px] leading-relaxed">
                  Paste into <code className="font-mono">~/.cursor/mcp.json</code>,{" "}
                  <code className="font-mono">
                    ~/Library/Application Support/Claude/claude_desktop_config.json
                  </code>
                  , or your client's equivalent, then restart the client.
                </p>
              </div>
            </section>
          ) : (
            <section className="space-y-2">
              <SectionLabel>Create a new token</SectionLabel>
              <p className="text-fg-muted text-[11px] leading-relaxed">
                Give it a name you'll recognize (e.g.{" "}
                <code className="font-mono">claude-desktop</code>).
              </p>
              <div className="flex items-stretch gap-2">
                <input
                  type="text"
                  value={newTokenName}
                  onChange={(event) => setNewTokenName(event.target.value)}
                  placeholder="Token name"
                  maxLength={80}
                  disabled={isCreating}
                  className="border-rule bg-bg focus:border-accent placeholder:text-fg-muted/60 flex-1 border px-2.5 py-1.5 text-xs outline-none transition-colors disabled:opacity-50"
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
                  Create
                </Button>
              </div>
            </section>
          )}

          <section className="space-y-2">
            <div className="flex items-baseline justify-between">
              <SectionLabel>Active tokens</SectionLabel>
              {!isLoading && tokens ? (
                <span className="text-fg-muted text-[11px]">
                  {tokens.length} {tokens.length === 1 ? "token" : "tokens"}
                </span>
              ) : null}
            </div>
            <div className="border-rule border">
              {isLoading ? (
                <div className="text-fg-muted flex items-center justify-center py-6">
                  <Loader2Icon className="size-4 animate-spin" />
                </div>
              ) : tokens && tokens.length > 0 ? (
                <ul className="divide-rule divide-y">
                  {tokens.map((token) => (
                    <li
                      key={token.id}
                      className="flex items-center gap-3 px-3 py-2.5"
                    >
                      <KeyRoundIcon className="text-fg-muted size-3.5 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-xs font-medium">
                          {token.name}
                        </div>
                        <div className="text-fg-muted mt-0.5 flex flex-wrap gap-x-3 text-[11px]">
                          <span className="font-mono">{token.tokenPreview}</span>
                          <span>
                            Created {formatRelative(token.createdAt)}
                          </span>
                          <span>
                            Last used {formatRelative(token.lastUsedAt)}
                          </span>
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
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-fg-muted px-4 py-6 text-center text-xs">
                  No active tokens yet. Create one above to start using the
                  Web3Insight MCP endpoint.
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="border-rule flex justify-end border-t px-5 py-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
