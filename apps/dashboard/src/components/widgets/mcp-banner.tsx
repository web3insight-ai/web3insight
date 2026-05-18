"use client";

import Link from "next/link";
import { XIcon, SparklesIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

// Reason: Versioned dismiss key — bump the suffix if banner copy changes
// materially and we want previously-dismissing users to see it again.
const DISMISS_STORAGE_KEY = "w3i-mcp-banner-dismissed-v1";

export function McpBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    try {
      const dismissed = window.localStorage.getItem(DISMISS_STORAGE_KEY);
      if (dismissed !== "1") {
        setIsVisible(true);
      }
    } catch {
      // Reason: localStorage can throw in private-browsing or quota states.
      // Fall back to showing the banner — the dismiss button still works
      // for the current session even if persistence fails.
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    try {
      window.localStorage.setItem(DISMISS_STORAGE_KEY, "1");
    } catch {
      // ignore — see comment in useEffect
    }
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="border-b border-rule bg-accent/5">
      <div className="max-w-content mx-auto flex items-center gap-3 px-4 py-2 sm:px-6">
        <SparklesIcon
          className="text-accent size-4 shrink-0"
          aria-hidden="true"
        />
        <div className="flex-1 text-sm">
          <span className="font-medium">New: MCP support</span>
          <span className="text-fg-muted hidden sm:inline">
            {" "}
            — use Web3Insight tools directly from Claude Desktop, Cursor, or VS
            Code.
          </span>
        </div>
        <Link
          href="/copilot?copilotMcpTokens=open"
          className="text-accent text-xs font-medium underline-offset-2 hover:underline"
        >
          Set up MCP
        </Link>
        <button
          type="button"
          onClick={handleDismiss}
          className="text-fg-muted hover:text-fg shrink-0 transition-colors"
          aria-label="Dismiss MCP banner"
        >
          <XIcon className="size-4" />
        </button>
      </div>
    </div>
  );
}
