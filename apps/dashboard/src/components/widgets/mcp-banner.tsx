"use client";

import Link from "next/link";
import { SparklesIcon } from "lucide-react";

export function McpBanner() {
  return (
    <div className="border-b border-rule bg-accent/5">
      <div className="max-w-content mx-auto flex items-center gap-3 px-4 py-2 sm:px-6">
        <SparklesIcon
          className="text-accent size-4 shrink-0"
          aria-hidden="true"
        />
        <div className="flex-1 text-sm">
          <span className="font-medium">MCP support</span>
          <span className="text-fg-muted hidden sm:inline">
            {" "}
            — use Web3Insight tools directly from Claude Code, Claude Desktop,
            Cursor, or VS Code.
          </span>
        </div>
        <Link
          href="/copilot?copilotMcpTokens=open"
          className="text-accent text-xs font-medium underline-offset-2 hover:underline"
        >
          Set up MCP
        </Link>
      </div>
    </div>
  );
}
