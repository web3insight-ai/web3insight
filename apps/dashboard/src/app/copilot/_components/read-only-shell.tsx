"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { CopilotUIMessage } from "~/ai/copilot-types";
import {
  Conversation,
  ConversationContent,
} from "@/components/ai-elements/conversation";
import { ShadcnButton as Button } from "@/components/ui/shadcn-button";
import { CopilotMessageItem } from "./chat-shell/components/message/message-item";
import {
  buildLatestBranchSelection,
  resolveActivePathFromHistory,
} from "./chat-shell/lib/branch-graph";
import { mapHistoryRowsToEntries } from "./chat-shell/lib/thread-mappers";
import type { ThreadHistoryEntry } from "./chat-shell/types";

interface ReadOnlyHistoryEntry {
  parentId: string | null;
  message: unknown;
}

interface CopilotReadOnlyShellProps {
  history: ReadOnlyHistoryEntry[];
  isGuest: boolean;
  title?: string | null;
}

function ReadOnlyConversation({
  history,
  isGuest,
}: {
  history: ReadOnlyHistoryEntry[];
  isGuest: boolean;
}) {
  const parsedHistory = useMemo<ThreadHistoryEntry[]>(
    () => mapHistoryRowsToEntries(history),
    [history],
  );

  const messages = useMemo<CopilotUIMessage[]>(() => {
    const latestSelection = buildLatestBranchSelection(parsedHistory);
    const { messages: activeMessages } = resolveActivePathFromHistory(
      parsedHistory,
      latestSelection,
    );
    return activeMessages;
  }, [parsedHistory]);

  return (
    <div className="flex h-[calc(100vh-72px)] w-full flex-col">
      <Conversation>
        <ConversationContent>
          {messages.map((message, index) => (
            <CopilotMessageItem
              key={message.id}
              hasBranchSelector={false}
              isLastMessage={index === messages.length - 1}
              message={message}
              readOnly
              status="ready"
            />
          ))}
        </ConversationContent>
      </Conversation>

      <div className="mx-auto w-full max-w-3xl px-4 pb-6">
        <div className="rounded-[2px] border border-rule bg-bg-raised p-4">
          <p className="text-sm font-medium text-fg">
            {isGuest
              ? "See how teams query the Web3 developer graph"
              : "This shared chat is read-only"}
          </p>
          <p className="mt-1 text-xs text-fg-muted">
            {isGuest
              ? "Sign in to Web3Insight to ask your own questions about ecosystems, repos, and developers."
              : "You can read this public thread, but only the owner can edit or continue the conversation."}
          </p>
          <Button asChild className="mt-3 h-8">
            <Link href={isGuest ? "/signup" : "/copilot"}>
              {isGuest ? "Create free account" : "Start new chat"}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export function CopilotReadOnlyShell({
  history,
  isGuest,
  title,
}: CopilotReadOnlyShellProps) {
  return (
    <div className="min-h-screen bg-bg">
      <main className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-10 border-b border-rule bg-bg">
          <div className="mx-auto flex h-12 w-full max-w-3xl items-center px-4">
            <p className="min-w-0 flex-1 truncate text-sm font-semibold text-fg">
              {title?.trim() || "Shared chat"}
            </p>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="ml-3 shrink-0"
            >
              <Link href={isGuest ? "/signup" : "/copilot"}>
                {isGuest ? "Sign up" : "New chat"}
              </Link>
            </Button>
          </div>
        </header>

        <ReadOnlyConversation history={history} isGuest={isGuest} />
      </main>
    </div>
  );
}
