import { useAtomValue } from "jotai";
import {
  ArchiveIcon,
  Loader2Icon,
  MoreHorizontalIcon,
  TrashIcon,
} from "lucide-react";

import { ShadcnButton as Button } from "@/components/ui/shadcn-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/shadcn-dropdown-menu";

import { useCopilotActions } from "../../state/actions";
import {
  copilotIsThreadActionPendingAtom,
  copilotSessionIdAtom,
} from "../../state/atoms";
import type { CopilotThreadQueryState, ThreadItem } from "../../types";
import { CopilotThreadSettings } from "./thread-settings";

interface CopilotThreadActionsMenuProps {
  archivedQueryState: CopilotThreadQueryState;
  archivedThreads: ThreadItem[];
}

export function CopilotThreadActionsMenu({
  archivedQueryState,
  archivedThreads,
}: CopilotThreadActionsMenuProps) {
  const actions = useCopilotActions();
  const sessionId = useAtomValue(copilotSessionIdAtom);
  const isPending = useAtomValue(copilotIsThreadActionPendingAtom);
  const isCurrentThreadArchived = Boolean(
    sessionId &&
    archivedThreads.some((thread) => thread.remoteId === sessionId),
  );
  const hasActiveSession = Boolean(sessionId);

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        className="h-8"
        onClick={actions.createNewChat}
      >
        New chat
      </Button>
      <CopilotThreadSettings
        archivedQueryState={archivedQueryState}
        archivedThreads={archivedThreads}
      />

      {hasActiveSession ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              aria-label="More thread actions"
              disabled={isPending}
            >
              {isPending ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : (
                <MoreHorizontalIcon className="size-4" />
              )}
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            {isCurrentThreadArchived ? (
              <DropdownMenuItem
                disabled={isPending}
                onSelect={() => {
                  void actions.executeThreadAction("unarchive");
                }}
              >
                <ArchiveIcon className="mr-2 size-4" />
                Unarchive
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                disabled={isPending}
                onSelect={() => {
                  void actions.executeThreadAction("archive");
                }}
              >
                <ArchiveIcon className="mr-2 size-4" />
                Archive
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              disabled={isPending}
              onSelect={() => {
                void actions.executeThreadAction("delete");
              }}
            >
              <TrashIcon className="mr-2 size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </div>
  );
}
