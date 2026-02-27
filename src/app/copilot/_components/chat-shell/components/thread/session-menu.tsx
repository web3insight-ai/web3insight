import { useAtomValue } from "jotai";
import {
  CheckIcon,
  ChevronDownIcon,
  Loader2Icon,
  MessageSquareIcon,
} from "lucide-react";

import { ShadcnButton as Button } from "@/components/ui/shadcn-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/shadcn-dropdown-menu";
import type { CopilotUIMessage } from "~/ai/copilot-types";
import { FALLBACK_THREAD_TITLE } from "../../constants";
import {
  deriveThreadTitleFromMessages,
  renderSessionItemTitle,
} from "../../lib/message-utils";
import { useCopilotActions } from "../../state/actions";
import {
  copilotIsSessionMenuOpenAtom,
  copilotSessionIdAtom,
} from "../../state/atoms";
import type { CopilotThreadQueryState, ThreadItem } from "../../types";

interface SessionListProps {
  emptyStateText: string;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  onSelectThread: (thread: ThreadItem) => void;
  sessionId: string | null;
  threads: readonly ThreadItem[];
}

function SessionList({
  emptyStateText,
  hasNextPage,
  isFetchingNextPage,
  isLoading,
  onLoadMore,
  onSelectThread,
  sessionId,
  threads,
}: SessionListProps) {
  if (isLoading && threads.length === 0) {
    return (
      <DropdownMenuItem disabled>
        <Loader2Icon className="mr-2 size-4 animate-spin" />
        Loading chats...
      </DropdownMenuItem>
    );
  }

  if (threads.length === 0) {
    return <DropdownMenuItem disabled>{emptyStateText}</DropdownMenuItem>;
  }

  return (
    <>
      {threads.map((thread) => (
        <DropdownMenuItem
          key={thread.remoteId}
          className="w-full justify-start"
          onSelect={(event) => {
            event.preventDefault();
            onSelectThread(thread);
          }}
        >
          <span className="truncate">{renderSessionItemTitle(thread)}</span>
          {thread.remoteId === sessionId ? (
            <CheckIcon className="ml-2 size-4 shrink-0" />
          ) : null}
        </DropdownMenuItem>
      ))}

      {hasNextPage ? (
        <DropdownMenuItem
          className="justify-center text-xs"
          disabled={isFetchingNextPage}
          onSelect={(event) => {
            event.preventDefault();
            if (!isFetchingNextPage) {
              onLoadMore();
            }
          }}
        >
          {isFetchingNextPage ? (
            <Loader2Icon className="mr-2 size-3.5 animate-spin" />
          ) : null}
          Load more
        </DropdownMenuItem>
      ) : null}
    </>
  );
}

interface CopilotSessionMenuProps {
  archivedThreads: ThreadItem[];
  historyQueryState: CopilotThreadQueryState;
  historyThreads: ThreadItem[];
  messages: CopilotUIMessage[];
}

export function CopilotSessionMenu({
  archivedThreads,
  historyQueryState,
  historyThreads,
  messages,
}: CopilotSessionMenuProps) {
  const actions = useCopilotActions();

  const isOpen = useAtomValue(copilotIsSessionMenuOpenAtom);
  const sessionId = useAtomValue(copilotSessionIdAtom);

  // Reason: Look up the current thread from both history and archived lists
  // to find its title. Falls back to deriving title from messages or a default.
  const currentThread = sessionId
    ? (historyThreads.find((thread) => thread.remoteId === sessionId) ??
      archivedThreads.find((thread) => thread.remoteId === sessionId) ??
      null)
    : null;
  const currentTitle =
    currentThread?.title?.trim() ||
    deriveThreadTitleFromMessages(messages) ||
    FALLBACK_THREAD_TITLE;

  return (
    <DropdownMenu open={isOpen} onOpenChange={actions.setSessionMenuOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-[320px] max-w-[calc(100vw-12rem)] justify-between gap-2 md:w-[360px] md:max-w-[calc(100vw-14rem)]"
          aria-label="Select copilot chat"
        >
          <span className="flex min-w-0 flex-1 items-center gap-2 text-left">
            <MessageSquareIcon className="size-4 shrink-0" />
            <span className="truncate">{currentTitle}</span>
          </span>
          <ChevronDownIcon className="size-4 shrink-0 opacity-70" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-[340px] max-w-[calc(100vw-3rem)] p-2 md:w-[380px]"
      >
        <div className="max-h-[340px] overflow-y-auto">
          <SessionList
            emptyStateText="No saved chats yet"
            hasNextPage={historyQueryState.hasNextPage}
            isFetchingNextPage={historyQueryState.isFetchingNextPage}
            isLoading={historyQueryState.isLoading}
            onLoadMore={actions.loadMoreHistory}
            onSelectThread={actions.selectHistoryThread}
            sessionId={sessionId}
            threads={historyThreads}
          />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
